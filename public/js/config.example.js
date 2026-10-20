/**
 * Example CloudCart frontend runtime config (no secrets).
 *
 * After a backend deploy, copy these values into frontend/js/config.js
 * (or assign window.CLOUDCART_CONFIG before config.js runs).
 *
 * Do not put AWS access keys, Cognito client secrets, or DemoAdminKey here.
 */
window.CLOUDCART_CONFIG = {
  mode: "api",
  apiBaseUrl: "https://xxxxxxxx.execute-api.ap-south-1.amazonaws.com/Prod",
  userId: "demo-user",
};
