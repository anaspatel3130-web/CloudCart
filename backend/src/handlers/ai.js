import { getMethod } from "../lib/event.js";
import { Errors } from "../lib/errors.js";
import { requestLog } from "../lib/logger.js";
import { handleError, success } from "../lib/responses.js";
import { getDefaultServices } from "../lib/runtime.js";
import { parseJsonBody } from "../lib/validation.js";

export function createAiHandler(services) {
  const { aiService, config } = services;

  return async (event) => {
    const origin = config.allowedOrigin;
    try {
      requestLog(event);
      const method = getMethod(event);
      const path = event.rawPath || event.path || "";

      if (method !== "POST") throw Errors.methodNotAllowed();

      const body = parseJsonBody(event, config.maxBodyBytes) || {};

      if (path.endsWith("/chat")) {
        const result = await aiService.chat({
          message: body.message,
          history: body.history || [],
          context: body.context || {},
          userId: event.requestContext?.authorizer?.claims?.sub || config.defaultDemoUserId,
        });
        return success(200, result, origin);
      }

      if (path.endsWith("/recommendations")) {
        const result = await aiService.getRecommendations({
          productId: body.productId,
          category: body.category,
          limit: body.limit,
        });
        return success(200, { recommendations: result }, origin);
      }

      if (path.endsWith("/search")) {
        const result = await aiService.semanticSearch({
          query: body.query || "",
          limit: body.limit,
        });
        return success(200, result, origin);
      }

      if (path.endsWith("/insights")) {
        const result = await aiService.getInsights({
          type: body.type,
          cartItems: body.cartItems,
          orders: body.orders,
        });
        return success(200, result, origin);
      }

      throw Errors.routeNotFound();
    } catch (error) {
      return handleError(error, origin);
    }
  };
}

export async function handler(event) {
  return createAiHandler(getDefaultServices())(event);
}
