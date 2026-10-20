import { AppError, Errors } from "./errors.js";

const USER_ID_PATTERN = /^[A-Za-z0-9_-]{1,64}$/;
const PRODUCT_ID_PATTERN = /^[A-Za-z0-9_-]{1,64}$/;
const ORDER_ID_PATTERN = /^[A-Za-z0-9_-]{1,80}$/;
const CATEGORY_PATTERN = /^[A-Za-z0-9 _-]{1,40}$/;

export const ORDER_STATUSES = Object.freeze(["PENDING", "CONFIRMED", "CANCELLED"]);

export function parseJsonBody(event, maxBytes) {
  if (event.body === undefined || event.body === null || event.body === "") {
    return {};
  }

  let raw = event.body;
  if (event.isBase64Encoded) {
    raw = Buffer.from(event.body, "base64").toString("utf8");
  }
  if (typeof raw !== "string") {
    throw Errors.invalidJson();
  }
  if (Buffer.byteLength(raw, "utf8") > maxBytes) {
    throw Errors.payloadTooLarge();
  }

  try {
    const parsed = JSON.parse(raw);
    if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw Errors.invalidJson();
    }
    return parsed;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw Errors.invalidJson();
  }
}

export function requireObject(value, message) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw Errors.invalidInput(message);
  }
  return value;
}

export function parseLimit(raw, defaultSize, maxSize) {
  if (raw === undefined || raw === null || raw === "") return defaultSize;
  const n = Number(raw);
  if (!Number.isInteger(n) || n < 1 || n > maxSize) {
    throw Errors.invalidInput(`limit must be an integer between 1 and ${maxSize}.`);
  }
  return n;
}

export function parseSearch(raw) {
  if (raw === undefined || raw === null || raw === "") return "";
  const value = String(raw).trim();
  if (value.length > 80) {
    throw Errors.invalidInput("search must be 80 characters or fewer.");
  }
  return value;
}

export function parseCategory(raw) {
  if (raw === undefined || raw === null || raw === "") return "";
  const value = String(raw).trim();
  if (!CATEGORY_PATTERN.test(value)) {
    throw Errors.invalidInput("category contains invalid characters.");
  }
  return value;
}

export function parseProductId(raw, label = "productId") {
  const value = String(raw || "").trim();
  if (!PRODUCT_ID_PATTERN.test(value)) {
    throw Errors.invalidInput(`${label} is required and must be 1-64 letters, numbers, hyphens, or underscores.`);
  }
  return value;
}

export function parseOrderId(raw) {
  const value = String(raw || "").trim();
  if (!ORDER_ID_PATTERN.test(value)) {
    throw Errors.invalidInput("Order id is invalid.");
  }
  return value;
}

export function parseUserId(raw) {
  const value = String(raw || "").trim();
  if (!USER_ID_PATTERN.test(value)) {
    throw Errors.invalidInput("User id is invalid.");
  }
  return value;
}

export function parseQuantity(raw, { allowZero = false, max = 99 } = {}) {
  if (raw === undefined || raw === null || raw === "") {
    throw Errors.invalidInput("quantity is required.");
  }
  if (typeof raw === "boolean" || Array.isArray(raw) || typeof raw === "object") {
    throw Errors.invalidInput("quantity must be a whole number.");
  }
  const n = typeof raw === "number" ? raw : Number(String(raw).trim());
  if (!Number.isInteger(n)) {
    throw Errors.invalidInput("quantity must be a whole number.");
  }
  const min = allowZero ? 0 : 1;
  if (n < min || n > max) {
    throw Errors.invalidInput(`quantity must be between ${min} and ${max}.`);
  }
  return n;
}

export function parseStock(raw, maxStock) {
  if (raw === undefined || raw === null || raw === "") {
    throw Errors.invalidInput("stock is required.");
  }
  if (typeof raw === "boolean" || Array.isArray(raw) || typeof raw === "object") {
    throw Errors.invalidInput("stock must be a whole number of 0 or more.");
  }
  const n = typeof raw === "number" ? raw : Number(String(raw).trim());
  if (!Number.isInteger(n) || n < 0 || n > maxStock) {
    throw Errors.invalidInput(`stock must be an integer between 0 and ${maxStock}.`);
  }
  return n;
}

export function parseOrderStatus(raw) {
  const value = String(raw || "").trim().toUpperCase();
  if (!ORDER_STATUSES.includes(value)) {
    throw Errors.invalidInput(`status must be one of: ${ORDER_STATUSES.join(", ")}.`);
  }
  return value;
}

export function decodeCursor(raw) {
  if (raw === undefined || raw === null || raw === "") return null;
  try {
    const json = Buffer.from(String(raw), "base64url").toString("utf8");
    const parsed = JSON.parse(json);
    if (!parsed || typeof parsed !== "object") throw new Error("bad cursor");
    return parsed;
  } catch {
    throw Errors.invalidCursor();
  }
}

export function encodeCursor(payload) {
  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
}
