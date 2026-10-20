/**
 * CloudCart — Inventory Monitor
 *
 * EventBridge (schedule) → Lambda → DynamoDB Products table → CloudWatch logs
 * Optional SNS summary when at least one product is LOW_STOCK or OUT_OF_STOCK.
 *
 * This function never writes product stock and never creates orders.
 * Schema (from backend/template.yaml and docs/api-contract.md):
 *   Table: CloudCart-Products (env PRODUCTS_TABLE)
 *   PK:    id (String)
 *   Stock: stock
 */

const crypto = require("crypto");

const SERVICE = "cloudcart-inventory-monitor";
const DEFAULT_THRESHOLD = 5;
const STATE_PK = "INVENTORY_ALERT_FINGERPRINT";

const STATUS = Object.freeze({
  OUT_OF_STOCK: "OUT_OF_STOCK",
  LOW_STOCK: "LOW_STOCK",
  HEALTHY: "HEALTHY",
  INVALID: "INVALID",
});

/**
 * Parse LOW_STOCK_THRESHOLD and related env. Throws on invalid configuration.
 */
function readConfig(env = process.env) {
  const rawThreshold = env.LOW_STOCK_THRESHOLD;
  const threshold =
    rawThreshold === undefined || rawThreshold === ""
      ? DEFAULT_THRESHOLD
      : Number(rawThreshold);

  if (!Number.isInteger(threshold) || threshold < 0) {
    throw new Error("Invalid LOW_STOCK_THRESHOLD: must be an integer greater than or equal to 0");
  }

  const tableName = String(env.PRODUCTS_TABLE || "").trim();
  const topicArn = String(env.ALERT_TOPIC_ARN || "").trim();
  const stateTable = String(env.AUTOMATION_STATE_TABLE || "").trim();

  return {
    tableName: tableName || null,
    threshold,
    topicArn: topicArn || null,
    stateTable: stateTable || null,
  };
}

/**
 * Accept whole numbers only. DynamoDB numeric types arrive as JS numbers.
 * Integer-looking strings such as "3" are accepted; floats, blanks, and objects are not.
 */
function parseQuantity(value) {
  if (value === null || value === undefined || value === "") {
    return { valid: false, quantity: null };
  }

  if (typeof value === "number") {
    if (!Number.isFinite(value) || !Number.isInteger(value) || value < 0) {
      return { valid: false, quantity: null };
    }
    return { valid: true, quantity: value };
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!/^\d+$/.test(trimmed)) {
      return { valid: false, quantity: null };
    }
    const quantity = Number(trimmed);
    if (!Number.isInteger(quantity) || quantity < 0) {
      return { valid: false, quantity: null };
    }
    return { valid: true, quantity };
  }

  return { valid: false, quantity: null };
}

function classifyQuantity(value, threshold) {
  if (!Number.isInteger(threshold) || threshold < 0) {
    throw new Error("classifyQuantity requires a non-negative integer threshold");
  }

  const parsed = parseQuantity(value);
  if (!parsed.valid) return STATUS.INVALID;
  if (parsed.quantity === 0) return STATUS.OUT_OF_STOCK;
  if (parsed.quantity <= threshold) return STATUS.LOW_STOCK;
  return STATUS.HEALTHY;
}

function classifyProduct(product, threshold) {
  const parsed = parseQuantity(product && product.stock);
  const status = classifyQuantity(product && product.stock, threshold);
  const productId = product && product.id != null ? String(product.id) : "";
  const productName =
    product && product.name != null && String(product.name).trim()
      ? String(product.name)
      : "(unnamed)";

  return {
    productId,
    productName,
    availableQuantity: parsed.valid ? parsed.quantity : null,
    status,
  };
}

function classifyInventory(products, threshold) {
  const items = Array.isArray(products) ? products.map((p) => classifyProduct(p, threshold)) : [];
  const counts = {
    healthy: 0,
    lowStock: 0,
    outOfStock: 0,
    invalid: 0,
  };

  for (const item of items) {
    if (item.status === STATUS.HEALTHY) counts.healthy += 1;
    else if (item.status === STATUS.LOW_STOCK) counts.lowStock += 1;
    else if (item.status === STATUS.OUT_OF_STOCK) counts.outOfStock += 1;
    else counts.invalid += 1;
  }

  return { items, counts };
}

function alertItems(classifiedItems) {
  return classifiedItems.filter(
    (item) => item.status === STATUS.LOW_STOCK || item.status === STATUS.OUT_OF_STOCK
  );
}

function inventoryFingerprint(classifiedItems) {
  const payload = alertItems(classifiedItems)
    .map((item) => ({
      productId: item.productId,
      availableQuantity: item.availableQuantity,
      status: item.status,
    }))
    .sort((a, b) => a.productId.localeCompare(b.productId));

  return crypto.createHash("sha256").update(JSON.stringify(payload)).digest("hex");
}

function decideNotification({ topicArn, counts, fingerprint, previousFingerprint }) {
  if (!topicArn) {
    return { shouldSend: false, reason: "notifications_disabled" };
  }
  if ((counts.lowStock || 0) + (counts.outOfStock || 0) === 0) {
    return { shouldSend: false, reason: "no_alert_items" };
  }
  if (previousFingerprint && previousFingerprint === fingerprint) {
    return { shouldSend: false, reason: "unchanged_inventory" };
  }
  return { shouldSend: true, reason: null };
}

function logJson(level, message, fields = {}) {
  const line = JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    service: SERVICE,
    message,
    ...fields,
  });
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

function getDocClient(factory) {
  if (factory) return factory();
  const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
  const { DynamoDBDocumentClient } = require("@aws-sdk/lib-dynamodb");
  return DynamoDBDocumentClient.from(new DynamoDBClient({}));
}

function getSnsClient(factory) {
  if (factory) return factory();
  const { SNSClient } = require("@aws-sdk/client-sns");
  return new SNSClient({});
}

async function scanAllProducts({ docClient, tableName, scanPage }) {
  const page =
    scanPage ||
    (async (params) => {
      const { ScanCommand } = require("@aws-sdk/lib-dynamodb");
      return docClient.send(new ScanCommand(params));
    });

  const items = [];
  let exclusiveStartKey;
  let pages = 0;

  do {
    const result = await page({
      TableName: tableName,
      ExclusiveStartKey: exclusiveStartKey,
      ProjectionExpression: "id, #n, stock",
      ExpressionAttributeNames: { "#n": "name" },
    });
    pages += 1;
    if (Array.isArray(result.Items)) items.push(...result.Items);
    exclusiveStartKey = result.LastEvaluatedKey;
  } while (exclusiveStartKey);

  return { items, pages };
}

async function loadFingerprint({ docClient, tableName }) {
  if (!tableName || !docClient) return null;
  const { GetCommand } = require("@aws-sdk/lib-dynamodb");
  const result = await docClient.send(
    new GetCommand({
      TableName: tableName,
      Key: { pk: STATE_PK },
    })
  );
  return result.Item && result.Item.fingerprint ? String(result.Item.fingerprint) : null;
}

async function saveFingerprint({ docClient, tableName, fingerprint }) {
  if (!tableName || !docClient) return;
  const { PutCommand } = require("@aws-sdk/lib-dynamodb");
  await docClient.send(
    new PutCommand({
      TableName: tableName,
      Item: {
        pk: STATE_PK,
        fingerprint,
        updatedAt: new Date().toISOString(),
      },
    })
  );
}

function formatSnsMessage({ counts, items, threshold, checked }) {
  const lines = [
    "CloudCart inventory alert",
    `Checked: ${checked}`,
    `Threshold: ${threshold}`,
    `Low stock: ${counts.lowStock}`,
    `Out of stock: ${counts.outOfStock}`,
    "",
    "Items:",
  ];

  for (const item of alertItems(items)) {
    lines.push(`- ${item.productId} | ${item.productName} | qty=${item.availableQuantity} | ${item.status}`);
  }

  return lines.join("\n");
}

async function publishAlert({ snsClient, topicArn, message }) {
  const { PublishCommand } = require("@aws-sdk/client-sns");
  await snsClient.send(
    new PublishCommand({
      TopicArn: topicArn,
      Subject: "CloudCart inventory alert",
      Message: message,
    })
  );
}

function createHandler(deps = {}) {
  return async function handler(event = {}) {
    const startedAt = Date.now();
    logJson("info", "inventory_monitor_started", {
      trigger: event.source || "manual",
    });

    try {
      const config = readConfig(deps.env || process.env);

      let products;
      let scannedPages = 0;

      if (typeof deps.scanInventory === "function") {
        const scanned = await deps.scanInventory();
        products = scanned.items;
        scannedPages = scanned.pages || 1;
      } else {
        if (!config.tableName) {
          throw new Error("PRODUCTS_TABLE is not set");
        }
        const docClient = deps.docClient || getDocClient(deps.createDocClient);
        const scanned = await scanAllProducts({
          docClient,
          tableName: config.tableName,
        });
        products = scanned.items;
        scannedPages = scanned.pages;
      }

      const { items, counts } = classifyInventory(products, config.threshold);
      const fingerprint = inventoryFingerprint(items);
      const tableEmpty = items.length === 0;

      logJson("info", "inventory_monitor_summary", {
        checked: items.length,
        threshold: config.threshold,
        scannedPages,
        tableEmpty,
        counts,
      });

      if (counts.lowStock > 0 || counts.outOfStock > 0) {
        logJson("warn", "inventory_attention_required", {
          items: alertItems(items),
        });
      }

      if (counts.invalid > 0) {
        logJson("warn", "inventory_invalid_stock", {
          items: items.filter((item) => item.status === STATUS.INVALID),
        });
      }

      const notification = {
        enabled: Boolean(config.topicArn),
        sent: false,
        skippedReason: null,
        error: null,
      };

      let previousFingerprint = null;
      const stateClient = deps.stateClient || deps.docClient;
      const loadFp = deps.loadFingerprint || loadFingerprint;
      const persistFp = deps.saveFingerprint || saveFingerprint;

      if (config.stateTable) {
        try {
          previousFingerprint = await loadFp({
            docClient: stateClient || getDocClient(deps.createDocClient),
            tableName: config.stateTable,
          });
        } catch (stateError) {
          logJson("warn", "inventory_fingerprint_load_failed", {
            errorName: stateError.name,
            errorMessage: stateError.message,
          });
        }
      } else if (config.topicArn) {
        logJson("warn", "inventory_dedupe_unconfigured", {
          detail:
            "ALERT_TOPIC_ARN is set but AUTOMATION_STATE_TABLE is not; duplicate emails are possible across cold starts.",
        });
      }

      const decision = decideNotification({
        topicArn: config.topicArn,
        counts,
        fingerprint,
        previousFingerprint,
      });
      notification.skippedReason = decision.reason;

      if (decision.shouldSend) {
        try {
          const publish = deps.publishAlert || publishAlert;
          const snsClient = deps.publishAlert
            ? deps.snsClient
            : deps.snsClient || getSnsClient(deps.createSnsClient);
          await publish({
            snsClient,
            topicArn: config.topicArn,
            message: formatSnsMessage({
              counts,
              items,
              threshold: config.threshold,
              checked: items.length,
            }),
          });
          notification.sent = true;
          notification.skippedReason = null;
          logJson("info", "inventory_alert_published", { fingerprint });
        } catch (snsError) {
          notification.error = snsError.message || "SNS publish failed";
          logJson("error", "inventory_alert_publish_failed", {
            errorName: snsError.name,
            errorMessage: snsError.message,
          });
        }
      } else {
        logJson("info", "inventory_alert_skipped", {
          reason: decision.reason,
        });
      }

      if (config.stateTable && (notification.sent || decision.reason === "no_alert_items")) {
        try {
          await persistFp({
            docClient: stateClient || getDocClient(deps.createDocClient),
            tableName: config.stateTable,
            fingerprint,
          });
        } catch (stateError) {
          logJson("warn", "inventory_fingerprint_save_failed", {
            errorName: stateError.name,
            errorMessage: stateError.message,
          });
        }
      }

      const result = {
        ok: true,
        checked: items.length,
        tableEmpty,
        threshold: config.threshold,
        scannedPages,
        counts,
        products: items,
        notification,
        durationMs: Date.now() - startedAt,
        timestamp: new Date().toISOString(),
      };

      logJson("info", "inventory_monitor_succeeded", {
        checked: result.checked,
        counts: result.counts,
        notificationSent: notification.sent,
        durationMs: result.durationMs,
      });

      return result;
    } catch (error) {
      logJson("error", "inventory_monitor_failed", {
        errorName: error.name,
        errorMessage: error.message,
        durationMs: Date.now() - startedAt,
      });
      throw error;
    }
  };
}

exports.STATUS = STATUS;
exports.DEFAULT_THRESHOLD = DEFAULT_THRESHOLD;
exports.readConfig = readConfig;
exports.parseQuantity = parseQuantity;
exports.classifyQuantity = classifyQuantity;
exports.classifyProduct = classifyProduct;
exports.classifyInventory = classifyInventory;
exports.inventoryFingerprint = inventoryFingerprint;
exports.decideNotification = decideNotification;
exports.scanAllProducts = scanAllProducts;
exports.createHandler = createHandler;
exports.handler = createHandler();
