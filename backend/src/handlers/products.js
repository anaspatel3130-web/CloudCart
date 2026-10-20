import { getMethod, getPathParam, getQuery } from "../lib/event.js";
import { Errors } from "../lib/errors.js";
import { requestLog } from "../lib/logger.js";
import { handleError, success } from "../lib/responses.js";
import { getDefaultServices } from "../lib/runtime.js";
import { parseCategory, parseLimit, parseProductId, parseSearch } from "../lib/validation.js";

export function createProductsHandler(services) {
  const { productService, config } = services;

  return async (event) => {
    const origin = config.allowedOrigin;
    try {
      requestLog(event);
      const method = getMethod(event);
      if (method !== "GET") throw Errors.methodNotAllowed();

      const id = getPathParam(event, "id");
      if (id) {
        const product = await productService.getById(parseProductId(id, "id"));
        return success(200, product, origin);
      }

      const query = getQuery(event);
      const result = await productService.list({
        category: parseCategory(query.category),
        search: parseSearch(query.search),
        limit: parseLimit(query.limit, config.defaultPageSize, config.maxPageSize),
        cursor: query.cursor,
      });
      return success(200, result, origin, { products: result.products });
    } catch (error) {
      return handleError(error, origin);
    }
  };
}

export async function handler(event) {
  return createProductsHandler(getDefaultServices())(event);
}
