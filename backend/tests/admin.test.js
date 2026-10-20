import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createTestApp, httpEvent, parseBody } from "./helpers/invoke.js";

function adminEvent(method, path, { body, pathParameters, key = "test-admin-key" } = {}) {
  return httpEvent({
    method,
    path,
    body,
    pathParameters,
    headers: key ? { "X-CloudCart-Admin-Key": key, "X-CloudCart-User-Id": "demo-user" } : {},
  });
}

describe("admin API", () => {
  it("rejects requests without an admin key", async () => {
    const app = createTestApp();
    const response = await app.admin(adminEvent("GET", "/admin/inventory", { key: "" }));
    assert.equal(response.statusCode, 401);
    assert.equal(parseBody(response).error.code, "UNAUTHORIZED");
  });

  it("rejects an invalid admin key", async () => {
    const app = createTestApp();
    const response = await app.admin(adminEvent("GET", "/admin/inventory", { key: "nope" }));
    assert.equal(response.statusCode, 403);
    assert.equal(parseBody(response).error.code, "FORBIDDEN");
  });

  it("fails closed in production when JWT admin auth is not configured", async () => {
    const app = createTestApp({ stage: "prod", authMode: "demo" });
    const response = await app.admin(adminEvent("GET", "/admin/inventory"));
    assert.equal(response.statusCode, 403);
    assert.equal(parseBody(response).error.code, "ADMIN_NOT_CONFIGURED");
  });

  it("handles JWT auth mode requiring Admin group", async () => {
    const app = createTestApp({ stage: "prod", authMode: "jwt" });
    // Without Admin group
    const forbidden = await app.admin(
      httpEvent({
        method: "GET",
        path: "/admin/inventory",
        claims: { sub: "user-123", "cognito:groups": ["Customer"] },
      })
    );
    assert.equal(forbidden.statusCode, 403);
    assert.equal(parseBody(forbidden).error.code, "FORBIDDEN");

    // With Admin group
    const allowed = await app.admin(
      httpEvent({
        method: "GET",
        path: "/admin/inventory",
        claims: { sub: "admin-456", "cognito:groups": ["Admin"] },
      })
    );
    assert.equal(allowed.statusCode, 200);
    assert.equal(parseBody(allowed).success, true);
  });

  it("lists inventory for an authorized demo admin", async () => {
    const app = createTestApp();
    const response = await app.admin(adminEvent("GET", "/admin/inventory"));
    const body = parseBody(response);
    assert.equal(response.statusCode, 200);
    assert.equal(body.success, true);
    assert.ok(body.data.products.length >= 3);
    assert.equal(body.data.totals.outOfStock, 1);
  });

  it("updates stock with validation", async () => {
    const app = createTestApp();
    const invalid = await app.admin(
      adminEvent("PATCH", "/admin/products/prod-001/stock", {
        pathParameters: { id: "prod-001" },
        body: { stock: -1 },
      })
    );
    assert.equal(invalid.statusCode, 400);

    const ok = await app.admin(
      adminEvent("PATCH", "/admin/products/prod-001/stock", {
        pathParameters: { id: "prod-001" },
        body: { stock: 8 },
      })
    );
    assert.equal(ok.statusCode, 200);
    assert.equal(parseBody(ok).data.stock, 8);
  });

  it("updates order status", async () => {
    const app = createTestApp();
    const created = parseBody(
      await app.orders(
        httpEvent({
          method: "POST",
          path: "/orders",
          body: { items: [{ productId: "prod-001", quantity: 1 }] },
          headers: { "X-CloudCart-User-Id": "alice" },
        })
      )
    );
    const response = await app.admin(
      adminEvent("PATCH", `/admin/orders/${created.data.orderId}/status`, {
        pathParameters: { id: created.data.orderId },
        body: { status: "CANCELLED" },
      })
    );
    assert.equal(response.statusCode, 200);
    assert.equal(parseBody(response).data.status, "CANCELLED");
  });
});
