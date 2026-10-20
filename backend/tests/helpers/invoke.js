import { loadConfig } from "../../src/lib/config.js";
import { createServices } from "../../src/lib/runtime.js";
import { createProductsHandler } from "../../src/handlers/products.js";
import { createCartHandler } from "../../src/handlers/cart.js";
import { createOrdersHandler } from "../../src/handlers/orders.js";
import { createAdminHandler } from "../../src/handlers/admin.js";
import { createAiHandler } from "../../src/handlers/ai.js";
import { createMemoryStore, sampleProducts } from "./memory-store.js";

export function parseBody(response) {
  return JSON.parse(response.body);
}

export function createTestApp(options = {}) {
  const store = createMemoryStore(options.products || sampleProducts());
  const config = loadConfig({
    AUTH_MODE: options.authMode || "demo",
    STAGE: options.stage || "dev",
    ALLOWED_ORIGIN: "http://localhost:8080",
    DEMO_ADMIN_KEY: options.demoAdminKey ?? "test-admin-key",
    DEFAULT_DEMO_USER_ID: options.defaultDemoUserId || "demo-user",
  });
  const services = createServices({ store, config });
  return {
    store,
    services,
    products: createProductsHandler(services),
    cart: createCartHandler(services),
    orders: createOrdersHandler(services),
    admin: createAdminHandler(services),
    ai: createAiHandler(services),
  };
}

export function httpEvent({
  method,
  path,
  pathParameters,
  query,
  body,
  headers,
  claims,
} = {}) {
  const event = {
    rawPath: path || "/",
    path,
    httpMethod: method,
    pathParameters: pathParameters || undefined,
    queryStringParameters: query || undefined,
    headers: headers || {},
    body: body === undefined ? undefined : typeof body === "string" ? body : JSON.stringify(body),
    requestContext: {
      http: { method },
      requestId: "test-request",
    },
  };
  if (claims) {
    event.requestContext.authorizer = { jwt: { claims } };
  }
  return event;
}
