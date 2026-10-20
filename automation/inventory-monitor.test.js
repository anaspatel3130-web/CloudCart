/**
 * CloudCart inventory monitor — local unit tests.
 * Run from this folder: npm test
 * Or from the repo root: node --test automation/inventory-monitor.test.js
 *
 * These tests never call AWS. DynamoDB and SNS are injected fakes.
 */

const { test } = require("node:test");
const assert = require("node:assert/strict");

const monitor = require("./inventory-monitor");

function env(overrides = {}) {
  return {
    PRODUCTS_TABLE: "CloudCart-Products",
    LOW_STOCK_THRESHOLD: "5",
    ...overrides,
  };
}

function handlerWithScan(products, extra = {}) {
  const pages = extra.pages || 1;
  return monitor.createHandler({
    env: extra.env || env(),
    scanInventory: extra.scanInventory || (async () => ({ items: products, pages })),
    snsClient: extra.snsClient,
    publishAlert: extra.publishAlert,
    loadFingerprint: extra.loadFingerprint,
    saveFingerprint: extra.saveFingerprint,
    stateClient: extra.stateClient || {},
    docClient: extra.docClient,
  });
}

test("classifies healthy, low, out of stock, and invalid quantities", () => {
  assert.equal(monitor.classifyQuantity(12, 5), monitor.STATUS.HEALTHY);
  assert.equal(monitor.classifyQuantity(5, 5), monitor.STATUS.LOW_STOCK);
  assert.equal(monitor.classifyQuantity(1, 5), monitor.STATUS.LOW_STOCK);
  assert.equal(monitor.classifyQuantity(0, 5), monitor.STATUS.OUT_OF_STOCK);
  assert.equal(monitor.classifyQuantity(null, 5), monitor.STATUS.INVALID);
  assert.equal(monitor.classifyQuantity(undefined, 5), monitor.STATUS.INVALID);
  assert.equal(monitor.classifyQuantity("", 5), monitor.STATUS.INVALID);
  assert.equal(monitor.classifyQuantity("3", 5), monitor.STATUS.LOW_STOCK);
  assert.equal(monitor.classifyQuantity(2.5, 5), monitor.STATUS.INVALID);
  assert.equal(monitor.classifyQuantity(-1, 5), monitor.STATUS.INVALID);
  assert.equal(monitor.classifyQuantity("n/a", 5), monitor.STATUS.INVALID);
  assert.equal(monitor.classifyQuantity({ N: "4" }, 5), monitor.STATUS.INVALID);
});

test("readConfig defaults the threshold to 5 and rejects invalid values", () => {
  assert.equal(monitor.readConfig({}).threshold, 5);
  assert.equal(monitor.readConfig({ LOW_STOCK_THRESHOLD: "8" }).threshold, 8);
  assert.throws(() => monitor.readConfig({ LOW_STOCK_THRESHOLD: "-1" }), /Invalid LOW_STOCK_THRESHOLD/);
  assert.throws(() => monitor.readConfig({ LOW_STOCK_THRESHOLD: "1.5" }), /Invalid LOW_STOCK_THRESHOLD/);
  assert.equal(monitor.readConfig({ PRODUCTS_TABLE: "CloudCart-Products" }).tableName, "CloudCart-Products");
  assert.equal(monitor.readConfig({ ALERT_TOPIC_ARN: "  " }).topicArn, null);
});

test("1. all products are healthy", async () => {
  const result = await handlerWithScan([
    { id: "prod-001", name: "Earbuds", stock: 25 },
    { id: "prod-002", name: "Charger", stock: 40 },
  ])({});

  assert.equal(result.ok, true);
  assert.equal(result.checked, 2);
  assert.equal(result.tableEmpty, false);
  assert.equal(result.counts.healthy, 2);
  assert.equal(result.counts.lowStock, 0);
  assert.equal(result.counts.outOfStock, 0);
  assert.equal(result.notification.enabled, false);
  assert.equal(result.notification.sent, false);
  assert.equal(result.notification.skippedReason, "notifications_disabled");
});

test("2. one product has low stock", async () => {
  const result = await handlerWithScan([
    { id: "prod-001", name: "Earbuds", stock: 25 },
    { id: "prod-008", name: "Mechanical Keyboard", stock: 3 },
  ])({});

  assert.equal(result.counts.lowStock, 1);
  assert.equal(result.counts.outOfStock, 0);
  const keyboard = result.products.find((p) => p.productId === "prod-008");
  assert.equal(keyboard.status, "LOW_STOCK");
  assert.equal(keyboard.availableQuantity, 3);
  assert.equal(keyboard.productName, "Mechanical Keyboard");
});

test("3. one product is out of stock", async () => {
  const result = await handlerWithScan([
    { id: "prod-001", name: "Earbuds", stock: 25 },
    { id: "prod-009", name: "USB Hub", stock: 0 },
  ])({});

  assert.equal(result.counts.outOfStock, 1);
  const hub = result.products.find((p) => p.productId === "prod-009");
  assert.equal(hub.status, "OUT_OF_STOCK");
  assert.equal(hub.availableQuantity, 0);
});

test("4. the inventory table is empty", async () => {
  const result = await handlerWithScan([])({});

  assert.equal(result.ok, true);
  assert.equal(result.checked, 0);
  assert.equal(result.tableEmpty, true);
  assert.deepEqual(result.counts, { healthy: 0, lowStock: 0, outOfStock: 0, invalid: 0 });
  assert.equal(result.notification.sent, false);
});

test("5. a product has invalid stock data", async () => {
  const result = await handlerWithScan([
    { id: "prod-010", name: "Broken Record", stock: "plenty" },
    { id: "prod-011", name: "Missing Qty" },
  ])({});

  assert.equal(result.counts.invalid, 2);
  assert.equal(result.products[0].availableQuantity, null);
  assert.equal(result.products[0].status, "INVALID");
  assert.equal(result.notification.sent, false);
});

test("6. DynamoDB returns multiple pages of results", async () => {
  const result = await handlerWithScan(
    [
      { id: "p1", name: "A", stock: 10 },
      { id: "p2", name: "B", stock: 2 },
      { id: "p3", name: "C", stock: 0 },
    ],
    { pages: 3 }
  )({});

  assert.equal(result.scannedPages, 3);
  assert.equal(result.checked, 3);
  assert.equal(result.counts.healthy, 1);
  assert.equal(result.counts.lowStock, 1);
  assert.equal(result.counts.outOfStock, 1);
});

test("scanAllProducts follows LastEvaluatedKey until the table is exhausted", async () => {
  const calls = [];
  const scanned = await monitor.scanAllProducts({
    tableName: "CloudCart-Products",
    scanPage: async (params) => {
      calls.push(params);
      if (!params.ExclusiveStartKey) {
        return {
          Items: [{ id: "p1", name: "A", stock: 9 }],
          LastEvaluatedKey: { id: "p1" },
        };
      }
      return { Items: [{ id: "p2", name: "B", stock: 1 }] };
    },
  });

  assert.equal(calls.length, 2);
  assert.equal(calls[0].TableName, "CloudCart-Products");
  assert.deepEqual(calls[1].ExclusiveStartKey, { id: "p1" });
  assert.equal(scanned.pages, 2);
  assert.equal(scanned.items.length, 2);
});

test("7. DynamoDB access fails and the invocation fails", async () => {
  const handler = handlerWithScan([], {
    scanInventory: async () => {
      const err = new Error("User is not authorized to perform: dynamodb:Scan");
      err.name = "AccessDeniedException";
      throw err;
    },
  });

  await assert.rejects(() => handler({}), /not authorized/);
});

test("handler fails when PRODUCTS_TABLE is missing and no scan is injected", async () => {
  const handler = monitor.createHandler({ env: { LOW_STOCK_THRESHOLD: "5" } });
  await assert.rejects(() => handler({}), /PRODUCTS_TABLE is not set/);
});

test("8. notifications are disabled — monitoring still succeeds", async () => {
  let published = 0;
  const result = await handlerWithScan(
    [{ id: "prod-008", name: "Mechanical Keyboard", stock: 3 }],
    {
      env: env({ ALERT_TOPIC_ARN: "" }),
      publishAlert: async () => {
        published += 1;
      },
    }
  )({});

  assert.equal(result.ok, true);
  assert.equal(result.counts.lowStock, 1);
  assert.equal(result.notification.enabled, false);
  assert.equal(result.notification.sent, false);
  assert.equal(result.notification.skippedReason, "notifications_disabled");
  assert.equal(published, 0);
});

test("SNS sends once for low stock and skips an unchanged inventory", async () => {
  let published = 0;
  let stored = "previous-different";
  const products = [{ id: "prod-008", name: "Mechanical Keyboard", stock: 3 }];
  const handler = handlerWithScan(products, {
    env: env({
      ALERT_TOPIC_ARN: "arn:aws:sns:ap-south-1:123456789012:CloudCart-InventoryAlerts",
      AUTOMATION_STATE_TABLE: "CloudCart-AutomationState",
    }),
    loadFingerprint: async () => stored,
    saveFingerprint: async ({ fingerprint }) => {
      stored = fingerprint;
    },
    publishAlert: async () => {
      published += 1;
    },
  });

  const first = await handler({});
  const second = await handler({});

  assert.equal(first.notification.sent, true);
  assert.equal(second.notification.sent, false);
  assert.equal(second.notification.skippedReason, "unchanged_inventory");
  assert.equal(published, 1);
});

test("9. SNS notification failure is reported without hiding the inventory result", async () => {
  const result = await handlerWithScan(
    [{ id: "prod-009", name: "USB Hub", stock: 0 }],
    {
      env: env({
        ALERT_TOPIC_ARN: "arn:aws:sns:ap-south-1:123456789012:CloudCart-InventoryAlerts",
        AUTOMATION_STATE_TABLE: "CloudCart-AutomationState",
      }),
      loadFingerprint: async () => null,
      saveFingerprint: async () => {},
      publishAlert: async () => {
        throw new Error("Topic does not exist");
      },
    }
  )({});

  assert.equal(result.ok, true);
  assert.equal(result.counts.outOfStock, 1);
  assert.equal(result.notification.enabled, true);
  assert.equal(result.notification.sent, false);
  assert.match(result.notification.error, /Topic does not exist/);
});

test("decideNotification covers the skip reasons used in production", () => {
  const counts = { lowStock: 1, outOfStock: 0 };
  assert.equal(
    monitor.decideNotification({
      topicArn: null,
      counts,
      fingerprint: "a",
      previousFingerprint: null,
    }).reason,
    "notifications_disabled"
  );
  assert.equal(
    monitor.decideNotification({
      topicArn: "arn",
      counts: { lowStock: 0, outOfStock: 0 },
      fingerprint: "a",
      previousFingerprint: null,
    }).reason,
    "no_alert_items"
  );
  assert.equal(
    monitor.decideNotification({
      topicArn: "arn",
      counts,
      fingerprint: "same",
      previousFingerprint: "same",
    }).reason,
    "unchanged_inventory"
  );
  assert.equal(
    monitor.decideNotification({
      topicArn: "arn",
      counts,
      fingerprint: "new",
      previousFingerprint: "old",
    }).shouldSend,
    true
  );
});
