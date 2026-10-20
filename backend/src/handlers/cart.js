import { resolveUserId } from "../lib/auth.js";
import { getMethod } from "../lib/event.js";
import { Errors } from "../lib/errors.js";
import { requestLog } from "../lib/logger.js";
import { handleError, success } from "../lib/responses.js";
import { getDefaultServices } from "../lib/runtime.js";
import { parseJsonBody, parseProductId, parseQuantity } from "../lib/validation.js";

export function createCartHandler(services) {
  const { cartService, config } = services;

  return async (event) => {
    const origin = config.allowedOrigin;
    try {
      requestLog(event);
      const userId = resolveUserId(event, config);
      const method = getMethod(event);

      if (method === "GET") {
        const cart = await cartService.get(userId);
        return success(200, cart, origin);
      }

      if (method === "POST") {
        const body = parseJsonBody(event, config.maxBodyBytes);
        const productId = parseProductId(body.productId);
        const quantity = parseQuantity(body.quantity, { max: config.maxQuantity, allowZero: true });
        const mode = String(body.mode || "add").toLowerCase() === "set" ? "set" : "add";
        if (mode === "add" && quantity < 1) {
          throw Errors.invalidInput("quantity must be between 1 and 99.");
        }
        const cart = await cartService.addOrUpdate(userId, productId, quantity, mode);
        return success(200, cart, origin, {
          message: "Cart updated.",
          productId,
          quantity,
        });
      }

      throw Errors.methodNotAllowed();
    } catch (error) {
      return handleError(error, origin);
    }
  };
}

export async function handler(event) {
  return createCartHandler(getDefaultServices())(event);
}
