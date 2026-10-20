import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createTestApp, httpEvent, parseBody } from "./helpers/invoke.js";

function asUser(method, path, { body, userId = "demo-user", pathParameters } = {}) {
  return httpEvent({
    method,
    path,
    body,
    pathParameters,
    headers: { "X-CloudCart-User-Id": userId },
  });
}

describe("orders API", () => {
  it("creates an order with server-side totals and decrements stock", async () => {
    const app = createTestApp();
    await app.cart(asUser("POST", "/cart", { body: { productId: "prod-001", quantity: 2 } }));
    const response = await app.orders(
      asUser("POST", "/orders", { body: { items: [{ productId: "prod-001", quantity: 2 }], total: 1 } })
    );
    const body = parseBody(response);
    assert.equal(response.statusCode, 201);
    assert.equal(body.success, true);
    assert.equal(body.data.total, 17998);
    assert.equal(body.data.status, "CONFIRMED");
    assert.equal(body.data.checkout, "simulated");
    assert.match(body.orderId, /^ord-/);

    const product = parseBody(
      await app.products(httpEvent({ method: "GET", path: "/products/prod-001", pathParameters: { id: "prod-001" } }))
    );
    assert.equal(product.data.stock, 12);

    const cart = parseBody(await app.cart(asUser("GET", "/cart")));
    assert.equal(cart.data.items.length, 0);
  });

  it("checks out stored cart when items payload is omitted", async () => {
    const app = createTestApp();
    await app.cart(asUser("POST", "/cart", { body: { productId: "prod-001", quantity: 1 } }));
    const response = await app.orders(asUser("POST", "/orders", { body: {} }));
    const body = parseBody(response);
    assert.equal(response.statusCode, 201);
    assert.equal(body.data.items.length, 1);
    assert.equal(body.data.items[0].productId, "prod-001");
  });

  it("returns authorized order by id and 404 for nonexistent order", async () => {
    const app = createTestApp();
    const created = parseBody(
      await app.orders(
        asUser("POST", "/orders", {
          userId: "alice",
          body: { items: [{ productId: "prod-001", quantity: 1 }] },
        })
      )
    );
    const orderRes = await app.orders(
      asUser("GET", `/orders/${created.data.orderId}`, {
        userId: "alice",
        pathParameters: { id: created.data.orderId },
      })
    );
    assert.equal(orderRes.statusCode, 200);
    assert.equal(parseBody(orderRes).data.orderId, created.data.orderId);

    const missingRes = await app.orders(
      asUser("GET", "/orders/ord-missing", {
        userId: "alice",
        pathParameters: { id: "ord-missing" },
      })
    );
    assert.equal(missingRes.statusCode, 404);
    assert.equal(parseBody(missingRes).error.code, "ORDER_NOT_FOUND");
  });

  it("lists only the current user's orders", async () => {
    const app = createTestApp();
    await app.orders(
      asUser("POST", "/orders", {
        userId: "alice",
        body: { items: [{ productId: "prod-001", quantity: 1 }] },
      })
    );
    const bob = parseBody(await app.orders(asUser("GET", "/orders", { userId: "bob" })));
    assert.equal(bob.data.orders.length, 0);
    const alice = parseBody(await app.orders(asUser("GET", "/orders", { userId: "alice" })));
    assert.equal(alice.data.orders.length, 1);
  });

  it("blocks access to another user's order", async () => {
    const app = createTestApp();
    const created = parseBody(
      await app.orders(
        asUser("POST", "/orders", {
          userId: "alice",
          body: { items: [{ productId: "prod-001", quantity: 1 }] },
        })
      )
    );
    const response = await app.orders(
      asUser("GET", `/orders/${created.data.orderId}`, {
        userId: "bob",
        pathParameters: { id: created.data.orderId },
      })
    );
    assert.equal(response.statusCode, 403);
    assert.equal(parseBody(response).error.code, "FORBIDDEN");
  });

  it("rejects checkout when stock is insufficient", async () => {
    const app = createTestApp();
    const response = await app.orders(
      asUser("POST", "/orders", { body: { items: [{ productId: "prod-002", quantity: 4 }] } })
    );
    assert.equal(response.statusCode, 409);
    assert.equal(parseBody(response).error.code, "INSUFFICIENT_STOCK");
  });

  it("rejects a concurrent inventory update that would oversell", async () => {
    const app = createTestApp();
    const first = await app.orders(
      asUser("POST", "/orders", {
        userId: "alice",
        body: { items: [{ productId: "prod-002", quantity: 3 }] },
      })
    );
    const second = await app.orders(
      asUser("POST", "/orders", {
        userId: "bob",
        body: { items: [{ productId: "prod-002", quantity: 1 }] },
      })
    );
    assert.equal(first.statusCode, 201);
    assert.equal(second.statusCode, 409);
    const product = await app.store.getProduct("prod-002");
    assert.equal(product.stock, 0);
  });
});
