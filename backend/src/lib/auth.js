import { Errors } from "./errors.js";
import { getHeader, getJwtClaims } from "./event.js";
import { parseUserId } from "./validation.js";

function adminGroupsFromClaims(claims) {
  const raw = claims?.["cognito:groups"];
  if (Array.isArray(raw)) return raw.map(String);
  if (typeof raw === "string") {
    return raw
      .replace(/[\[\]]/g, "")
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean);
  }
  return [];
}

export function resolveUserId(event, config) {
  const claims = getJwtClaims(event);
  if (claims?.sub) {
    return parseUserId(claims.sub);
  }

  if (config.authMode === "jwt") {
    throw Errors.unauthorized("A valid bearer token is required.");
  }

  const header = getHeader(event, "x-cloudcart-user-id");
  if (header) {
    return parseUserId(header);
  }
  return parseUserId(config.defaultDemoUserId);
}

export function requireAdmin(event, config) {
  if (config.stage === "prod" && config.authMode !== "jwt") {
    throw Errors.adminNotConfigured();
  }

  const claims = getJwtClaims(event);
  if (config.authMode === "jwt") {
    if (!claims?.sub) {
      throw Errors.unauthorized("A valid bearer token is required.");
    }
    const groups = adminGroupsFromClaims(claims);
    if (!groups.includes("Admin")) {
      throw Errors.forbidden("Admin group membership is required.");
    }
    return parseUserId(claims.sub);
  }

  if (!config.demoAdminKey) {
    throw Errors.adminNotConfigured();
  }

  const provided = getHeader(event, "x-cloudcart-admin-key");
  if (!provided) {
    throw Errors.unauthorized("Admin key header is required in development mode.");
  }
  if (provided !== config.demoAdminKey) {
    throw Errors.forbidden("Admin key is invalid.");
  }

  return resolveUserId(event, config);
}
