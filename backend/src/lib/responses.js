import { AppError } from "./errors.js";
import { log } from "./logger.js";

export function corsHeaders(origin = "*") {
  return {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": origin || "*",
    "Access-Control-Allow-Headers":
      "Content-Type,Authorization,X-CloudCart-User-Id,X-CloudCart-Admin-Key",
    "Access-Control-Allow-Methods": "GET,POST,PATCH,OPTIONS",
  };
}

export function success(statusCode, data, origin, extras = {}) {
  return {
    statusCode,
    headers: corsHeaders(origin),
    body: JSON.stringify({ success: true, data, ...extras }),
  };
}

export function failure(statusCode, code, message, origin) {
  return {
    statusCode,
    headers: corsHeaders(origin),
    body: JSON.stringify({
      success: false,
      error: { code, message },
    }),
  };
}

export function handleError(error, origin, context = {}) {
  if (error instanceof AppError) {
    log("warn", "handled_error", {
      code: error.code,
      statusCode: error.statusCode,
      ...context,
    });
    return failure(error.statusCode, error.code, error.message, origin);
  }

  log("error", "unhandled_error", {
    name: error?.name,
    ...context,
  });
  return failure(500, "INTERNAL_ERROR", "An unexpected error occurred.", origin);
}
