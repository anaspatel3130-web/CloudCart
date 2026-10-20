import { requireAdmin } from "../lib/auth.js";
import { getMethod, getPathParam } from "../lib/event.js";
import { Errors } from "../lib/errors.js";
import { requestLog } from "../lib/logger.js";
import { handleError, success } from "../lib/responses.js";
import { getDefaultServices } from "../lib/runtime.js";
import { parseJsonBody, parseOrderId, parseOrderStatus, parseProductId, parseStock } from "../lib/validation.js";

export function createAdminHandler(services) {
  const { inventoryService, orderService, config } = services;

  return async (event) => {
    const origin = config.allowedOrigin;
    try {
      requestLog(event);
      requireAdmin(event, config);
      const method = getMethod(event);
      const path = event.rawPath || event.path || "";
      const id = getPathParam(event, "id");

      if (method === "GET" && path.endsWith("/admin/inventory")) {
        const inventory = await inventoryService.list();
        return success(200, inventory, origin);
      }

      if (method === "PATCH" && id && path.includes("/admin/products/")) {
        const body = parseJsonBody(event, config.maxBodyBytes);
        const stock = parseStock(body.stock, config.maxStock);
        const product = await inventoryService.setStock(parseProductId(id, "id"), stock);
        return success(200, product, origin);
      }

      if (method === "PATCH" && id && path.includes("/admin/orders/")) {
        const body = parseJsonBody(event, config.maxBodyBytes);
        const status = parseOrderStatus(body.status);
        const order = await orderService.updateStatus(parseOrderId(id), status);
        return success(200, order, origin);
      }

      throw Errors.methodNotAllowed();
    } catch (error) {
      return handleError(error, origin);
    }
  };
}

export async function handler(event) {
  return createAdminHandler(getDefaultServices())(event);
}
