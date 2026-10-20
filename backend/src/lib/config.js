function readString(env, key, fallback = "") {
  const value = env[key];
  if (value === undefined || value === null) return fallback;
  return String(value).trim();
}

export function loadConfig(env = process.env) {
  const authMode = (readString(env, "AUTH_MODE", "demo") || "demo").toLowerCase();
  const stage = (readString(env, "STAGE", "dev") || "dev").toLowerCase();
  const allowedOrigin = readString(env, "ALLOWED_ORIGIN", "*") || "*";

  return {
    productsTable: readString(env, "PRODUCTS_TABLE", "CloudCart-Products"),
    cartsTable: readString(env, "CARTS_TABLE", "CloudCart-Carts"),
    ordersTable: readString(env, "ORDERS_TABLE", "CloudCart-Orders"),
    authMode: authMode === "jwt" ? "jwt" : "demo",
    stage: stage === "prod" ? "prod" : "dev",
    allowedOrigin,
    demoAdminKey: readString(env, "DEMO_ADMIN_KEY", ""),
    defaultDemoUserId: readString(env, "DEFAULT_DEMO_USER_ID", "demo-user") || "demo-user",
    maxBodyBytes: 8192,
    maxCatalogueItems: 500,
    defaultPageSize: 50,
    maxPageSize: 50,
    maxQuantity: 99,
    maxCartItems: 50,
    maxStock: 100000,
  };
}
