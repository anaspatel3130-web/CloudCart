import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createTestApp, httpEvent, parseBody } from "./helpers/invoke.js";

function cartEvent(method, body, userId = "demo-user") {
  return httpEvent({
    method,
    path: "/cart",
    body,
    headers: { "X-CloudCart-User-Id": userId },
  });
}

describe("cart API", () => {
  it("creates a cart and adds an item", async () => {
    const app = createTestApp();
    const empty = parseBody(await app.cart(cartEvent("GET")));
    assert.equal(empty.data.items.length, 0);

    const added = await app.cart(cartEvent("POST", { productId: "prod-001", quantity: 2 }));
    const body = parseBody(added);
    assert.equal(added.statusCode, 200);
    assert.equal(body.success, true);
    assert.equal(body.data.items[0].quantity, 2);
    assert.equal(body.data.total, 17998);
  });

  it("increments quantity on a second add", async () => {
    const app = createTestApp();
    await app.cart(cartEvent("POST", { productId: "prod-001", quantity: 1 }));
    const body = parseBody(await app.cart(cartEvent("POST", { productId: "prod-001", quantity: 1 })));
    assert.equal(body.data.items[0].quantity, 2);
  });

  it("updates quantity or removes item with mode set", async () => {
    const app = createTestApp();
    await app.cart(cartEvent("POST", { productId: "prod-001", quantity: 2 }));
    const updated = parseBody(
      await app.cart(cartEvent("POST", { productId: "prod-001", quantity: 5, mode: "set" }))
    );
    assert.equal(updated.data.items[0].quantity, 5);

    const removed = parseBody(
      await app.cart(cartEvent("POST", { productId: "prod-001", quantity: 0, mode: "set" }))
    );
    assert.equal(removed.data.items.length, 0);
  });

  it("calculates totals from catalogue prices, not the client", async () => {
    const app = createTestApp();
    const body = parseBody(
      await app.cart(cartEvent("POST", { productId: "prod-001", quantity: 1, price: 1, total: 1 }))
    );
    assert.equal(body.data.total, 8999);
    assert.equal(body.data.items[0].price, 8999);
  });

  it("rejects invalid quantity", async () => {
    const app = createTestApp();
    const response = await app.cart(cartEvent("POST", { productId: "prod-001", quantity: 0 }));
    assert.equal(response.statusCode, 400);
    assert.equal(parseBody(response).error.code, "INVALID_INPUT");
  });

  it("rejects a missing product", async () => {
    const app = createTestApp();
    const response = await app.cart(cartEvent("POST", { productId: "prod-404", quantity: 1 }));
    assert.equal(response.statusCode, 404);
  });

  it("rejects quantity above stock", async () => {
    const app = createTestApp();
    const response = await app.cart(cartEvent("POST", { productId: "prod-002", quantity: 4 }));
    assert.equal(response.statusCode, 409);
    assert.equal(parseBody(response).error.code, "INSUFFICIENT_STOCK");
  });

  it("keeps carts isolated per user", async () => {
    const app = createTestApp();
    await app.cart(cartEvent("POST", { productId: "prod-001", quantity: 1 }, "alice"));
    const bob = parseBody(await app.cart(cartEvent("GET", undefined, "bob")));
    assert.equal(bob.data.items.length, 0);
  });
});
