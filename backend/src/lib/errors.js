export class AppError extends Error {
  constructor(statusCode, code, message) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code;
  }
}

export const Errors = {
  invalidJson: () => new AppError(400, "INVALID_JSON", "Request body must be valid JSON."),
  payloadTooLarge: () =>
    new AppError(400, "PAYLOAD_TOO_LARGE", "Request body exceeds the maximum allowed size."),
  invalidInput: (message) => new AppError(400, "INVALID_INPUT", message),
  invalidCursor: () => new AppError(400, "INVALID_CURSOR", "The pagination cursor is invalid."),
  unauthorized: (message = "Authentication is required.") =>
    new AppError(401, "UNAUTHORIZED", message),
  forbidden: (message = "You are not allowed to perform this action.") =>
    new AppError(403, "FORBIDDEN", message),
  adminNotConfigured: () =>
    new AppError(
      403,
      "ADMIN_NOT_CONFIGURED",
      "Admin routes are disabled because production authorization is not configured."
    ),
  notFound: (code, message) => new AppError(404, code, message),
  productNotFound: () => new AppError(404, "PRODUCT_NOT_FOUND", "The requested product was not found."),
  orderNotFound: () => new AppError(404, "ORDER_NOT_FOUND", "The requested order was not found."),
  conflict: (code, message) => new AppError(409, code, message),
  insufficientStock: (productId) =>
    new AppError(
      409,
      "INSUFFICIENT_STOCK",
      `Insufficient stock for product ${productId}.`
    ),
  emptyCart: () => new AppError(400, "EMPTY_CART", "The cart is empty."),
  methodNotAllowed: () => new AppError(405, "METHOD_NOT_ALLOWED", "This HTTP method is not supported."),
};
