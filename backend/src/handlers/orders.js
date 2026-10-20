import { resolveUserId } from "../lib/auth.js";
import { getMethod, getPathParam } from "../lib/event.js";
import { Errors } from "../lib/errors.js";
import { requestLog } from "../lib/logger.js";
import { handleError, success } from "../lib/responses.js";
import { getDefaultServices } from "../lib/runtime.js";
import { parseJsonBody, parseOrderId, parseProductId, parseQuantity } from "../lib/validation.js";

function parseOrderItems(body, config) {
  if (body.items === undefined) return undefined;
  if (!Array.isArray(body.items)) {
    throw Errors.invalidInput("items must be an array.");
  }
  return body.items.map((line, index) => {
    if (!line || typeof line !== "object") {
      throw Errors.invalidInput(`items[${index}] must be an object.`);
    }
    return {
      productId: parseProductId(line.productId),
      quantity: parseQuantity(line.quantity, { max: config.maxQuantity }),
    };
  });
}

export function createOrdersHandler(services) {
  const { orderService, config } = services;

  return async (event) => {
    const origin = config.allowedOrigin;
    try {
      requestLog(event);
      const userId = resolveUserId(event, config);
      const method = getMethod(event);
      const id = getPathParam(event, "id");

      if (method === "GET" && id) {
        const order = await orderService.getForUser(userId, parseOrderId(id));
        return success(200, order, origin);
      }

      if (method === "GET") {
        const orders = await orderService.listForUser(userId);
        return success(200, { orders }, origin, { orders });
      }

      if (method === "POST") {
        const body = parseJsonBody(event, config.maxBodyBytes);
        const items = parseOrderItems(body, config);
        const order = await orderService.createFromCart(userId, items);
        return success(201, order, origin, {
          orderId: order.orderId,
          message: order.message,
        });
      }

      throw Errors.methodNotAllowed();
    } catch (error) {
      return handleError(error, origin);
    }
  };
}

export async function handler(event) {
  return createOrdersHandler(getDefaultServices())(event);
}
