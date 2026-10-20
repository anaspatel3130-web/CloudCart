import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createTestApp, httpEvent, parseBody } from "./helpers/invoke.js";

describe("AI shopping assistant API", () => {
  it("rejects non-POST requests with 405", async () => {
    const app = createTestApp();
    const res = await app.ai(httpEvent({ method: "GET", path: "/ai/chat" }));
    assert.equal(res.statusCode, 405);
  });

  it("rejects empty message with 400", async () => {
    const app = createTestApp();
    const res = await app.ai(httpEvent({ method: "POST", path: "/ai/chat", body: { message: "" } }));
    assert.equal(res.statusCode, 400);
  });

  it("parses natural language query and returns recommendations", async () => {
    const app = createTestApp();
    const res = await app.ai(
      httpEvent({
        method: "POST",
        path: "/ai/chat",
        body: { message: "I want headphones for audio listening" },
      })
    );
    const body = parseBody(res);
    assert.equal(res.statusCode, 200);
    assert.equal(body.success, true);
    assert.ok(body.data.reply);
    assert.ok(Array.isArray(body.data.recommendations));
    assert.ok(body.data.recommendations.some((p) => p.category === "Audio"));
    assert.ok(Array.isArray(body.data.suggestedFollowUps));
  });

  it("handles budget constraint queries (e.g. under 7000)", async () => {
    const app = createTestApp();
    const res = await app.ai(
      httpEvent({
        method: "POST",
        path: "/ai/chat",
        body: { message: "Show me desk accessories under 7000" },
      })
    );
    const body = parseBody(res);
    assert.equal(res.statusCode, 200);
    assert.equal(body.data.detectedIntent.maxBudget, 7000);
    assert.ok(body.data.recommendations.some((p) => p.price <= 7000));
  });

  it("serves contextual recommendations for a product", async () => {
    const app = createTestApp();
    const res = await app.ai(
      httpEvent({
        method: "POST",
        path: "/ai/recommendations",
        body: { productId: "prod-001", limit: 2 },
      })
    );
    const body = parseBody(res);
    assert.equal(res.statusCode, 200);
    assert.ok(Array.isArray(body.data.recommendations));
    assert.equal(body.data.recommendations.length, 2);
    // Should not recommend the same product
    assert.ok(body.data.recommendations.every((p) => p.id !== "prod-001"));
  });

  it("performs semantic vector search using cosine similarity", async () => {
    const app = createTestApp();
    const res = await app.ai(
      httpEvent({
        method: "POST",
        path: "/ai/search",
        body: { query: "mechanical keyboard typing", limit: 3 },
      })
    );
    const body = parseBody(res);
    assert.equal(res.statusCode, 200);
    assert.equal(body.success, true);
    assert.ok(Array.isArray(body.data.matches));
    assert.ok(body.data.matches.length > 0);
    assert.equal(body.data.matches[0].id, "prod-002");
    assert.ok(body.data.matches[0].relevanceScore > 0);
  });

  it("generates AI cart cross-sell insights and advice", async () => {
    const app = createTestApp();
    const res = await app.ai(
      httpEvent({
        method: "POST",
        path: "/ai/insights",
        body: {
          type: "cart",
          cartItems: [{ productId: "prod-002", quantity: 1 }],
        },
      })
    );
    const body = parseBody(res);
    assert.equal(res.statusCode, 200);
    assert.equal(body.success, true);
    assert.equal(body.data.subtotal, 6499);
    assert.equal(body.data.eligibleForFreeShipping, true);
    assert.ok(Array.isArray(body.data.suggestedAddons));
    assert.ok(body.data.adviceMessage);
  });

  it("generates AI admin inventory telemetry and restock urgency", async () => {
    const app = createTestApp();
    const res = await app.ai(
      httpEvent({
        method: "POST",
        path: "/ai/insights",
        body: { type: "admin" },
      })
    );
    const body = parseBody(res);
    assert.equal(res.statusCode, 200);
    assert.equal(body.success, true);
    assert.ok(typeof body.data.inventoryHealthPct === "number");
    assert.ok(Array.isArray(body.data.restockUrgencyList));
    assert.ok(body.data.executiveSummary);
  });
});
