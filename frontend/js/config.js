/**
 * CloudCart configuration
 *
 * Switch modes here — do not put AWS keys, Cognito secrets, or admin keys in this file.
 *
 * Demo mode: local catalogue, cart, and orders in the browser.
 * API mode:  products/orders call API Gateway. Requires apiBaseUrl from the
 *            CloudFormation output ApiUrl (see docs/aws-deployment.md).
 *
 * Example after backend deploy (also see js/config.example.js):
 *   window.CLOUDCART_CONFIG = {
 *     mode: "api",
 *     apiBaseUrl: "https://abc123.execute-api.ap-south-1.amazonaws.com/Prod",
 *     userId: "demo-user"
 *   };
 */
window.CLOUDCART_CONFIG = Object.assign(
  { mode: "demo", apiBaseUrl: "", userId: "demo-user" },
  window.CLOUDCART_CONFIG || {}
);

const CONFIG = {
  get mode() {
    return window.CLOUDCART_CONFIG.mode === "api" ? "api" : "demo";
  },
  isDemo() {
    return CONFIG.mode === "demo";
  },
  get apiBaseUrl() {
    return String(window.CLOUDCART_CONFIG.apiBaseUrl || "").replace(/\/$/, "");
  },
  get userId() {
    return String(window.CLOUDCART_CONFIG.userId || "demo-user");
  },
  endpoints: {
    products: "/products",
    cart: "/cart",
    orders: "/orders",
    ai: "/ai",
  },
  currency: "INR",
  storage: {
    cart: "cloudcart_cart",
    products: "cloudcart_demo_products",
    orders: "cloudcart_demo_orders",
  },
  lowStockAt: 5,
};
