import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createTestApp, httpEvent, parseBody } from "./helpers/invoke.js";

describe("products API", () => {
  it("lists products in the standard envelope", async () => {
    const app = createTestApp();
    const response = await app.products(httpEvent({ method: "GET", path: "/products" }));
    const body = parseBody(response);
    assert.equal(response.statusCode, 200);
    assert.equal(body.success, true);
    assert.ok(Array.isArray(body.data.products));
    assert.equal(body.products.length, 3);
    assert.deepEqual(Object.keys(body.data.products[0]).sort().includes("price"), true);
    assert.equal(body.data.products[0].id, "prod-001");
    assert.equal(typeof body.data.products[0].createdAt, "string");
  });

  it("filters by category and search", async () => {
    const app = createTestApp();
    const byCategory = parseBody(
      await app.products(httpEvent({ method: "GET", path: "/products", query: { category: "Audio" } }))
    );
    assert.equal(byCategory.data.products.every((item) => item.category === "Audio"), true);

    const bySearch = parseBody(
      await app.products(httpEvent({ method: "GET", path: "/products", query: { search: "keyboard" } }))
    );
    assert.equal(bySearch.data.products.length, 1);
    assert.equal(bySearch.data.products[0].id, "prod-002");
  });

  it("paginates with a cursor", async () => {
    const app = createTestApp();
    const first = parseBody(
      await app.products(httpEvent({ method: "GET", path: "/products", query: { limit: "1" } }))
    );
    assert.equal(first.data.products.length, 1);
    assert.ok(first.data.nextCursor);
    const second = parseBody(
      await app.products(
        httpEvent({ method: "GET", path: "/products", query: { limit: "1", cursor: first.data.nextCursor } })
      )
    );
    assert.notEqual(second.data.products[0].id, first.data.products[0].id);
  });

  it("returns one product by id", async () => {
    const app = createTestApp();
    const response = await app.products(
      httpEvent({ method: "GET", path: "/products/prod-001", pathParameters: { id: "prod-001" } })
    );
    const body = parseBody(response);
    assert.equal(response.statusCode, 200);
    assert.equal(body.data.id, "prod-001");
    assert.equal(body.data.price, 8999);
    assert.equal(body.data.stock, 14);
  });

  it("returns 404 for a missing product", async () => {
    const app = createTestApp();
    const response = await app.products(
      httpEvent({ method: "GET", path: "/products/prod-missing", pathParameters: { id: "prod-missing" } })
    );
    const body = parseBody(response);
    assert.equal(response.statusCode, 404);
    assert.equal(body.success, false);
    assert.equal(body.error.code, "PRODUCT_NOT_FOUND");
  });

  it("rejects an invalid limit", async () => {
    const app = createTestApp();
    const response = await app.products(
      httpEvent({ method: "GET", path: "/products", query: { limit: "0" } })
    );
    assert.equal(response.statusCode, 400);
    assert.equal(parseBody(response).error.code, "INVALID_INPUT");
  });
});
