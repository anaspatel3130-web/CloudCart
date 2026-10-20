import { loadConfig } from "./config.js";
import { createDocumentClient } from "./dynamodb.js";
import { createDynamoStore } from "./store.js";
import { createProductService } from "../services/product-service.js";
import { createCartService } from "../services/cart-service.js";
import { createOrderService } from "../services/order-service.js";
import { createInventoryService } from "../services/inventory-service.js";
import { createAiService } from "../services/ai-service.js";

let cached;

export function createServices({ store, config } = {}) {
  const resolvedConfig = config || loadConfig();
  const resolvedStore =
    store ||
    createDynamoStore(createDocumentClient(), {
      products: resolvedConfig.productsTable,
      carts: resolvedConfig.cartsTable,
      orders: resolvedConfig.ordersTable,
    });
  const productService = createProductService(resolvedStore, resolvedConfig);
  const cartService = createCartService(resolvedStore, resolvedConfig);
  const orderService = createOrderService(resolvedStore, resolvedConfig, cartService);
  const inventoryService = createInventoryService(resolvedStore, resolvedConfig);
  const aiService = createAiService(resolvedStore, resolvedConfig, productService);
  return {
    config: resolvedConfig,
    store: resolvedStore,
    productService,
    cartService,
    orderService,
    inventoryService,
    aiService,
  };
}

export function getDefaultServices() {
  if (!cached) cached = createServices();
  return cached;
}
