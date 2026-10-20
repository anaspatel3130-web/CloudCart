import { randomUUID } from "node:crypto";
import { Errors } from "../lib/errors.js";
import { publicProduct } from "./product-service.js";

function publicOrder(order) {
  return {
    id: order.orderId,
    orderId: order.orderId,
    userId: order.userId,
    items: order.items,
    total: order.total,
    status: order.status,
    createdAt: order.createdAt,
    checkout: "simulated",
  };
}

function assertOwner(order, userId) {
  if (!order) throw Errors.orderNotFound();
  if (order.userId !== userId) throw Errors.forbidden("You cannot access another user's order.");
  return order;
}

export function createOrderService(store, config, cartService) {
  return {
    async createFromCart(userId, requestedItems) {
      const cart = await cartService.get(userId);
      const sourceItems =
        Array.isArray(requestedItems) && requestedItems.length > 0
          ? requestedItems
          : cart.items.map((item) => ({ productId: item.productId, quantity: item.quantity }));

      if (!sourceItems.length) throw Errors.emptyCart();
      if (sourceItems.length > config.maxCartItems) {
        throw Errors.invalidInput(`An order can contain at most ${config.maxCartItems} items.`);
      }

      const merged = new Map();
      for (const line of sourceItems) {
        const current = merged.get(line.productId) || 0;
        merged.set(line.productId, current + line.quantity);
      }

      const pricedItems = [];
      const decrements = [];
      for (const [productId, quantity] of merged.entries()) {
        const product = publicProduct(await store.getProduct(productId));
        if (!product) throw Errors.productNotFound();
        if (quantity > product.stock) throw Errors.insufficientStock(productId);
        pricedItems.push({
          productId: product.id,
          name: product.name,
          quantity,
          unitPrice: product.price,
          lineTotal: product.price * quantity,
        });
        decrements.push({ productId: product.id, quantity });
      }

      const total = pricedItems.reduce((sum, item) => sum + item.lineTotal, 0);
      const createdAt = new Date().toISOString();
      const order = {
        orderId: `ord-${randomUUID()}`,
        userId,
        items: pricedItems,
        total,
        status: "CONFIRMED",
        createdAt,
        updatedAt: createdAt,
        checkout: "simulated",
      };

      await store.transactCheckout({
        decrements,
        order,
        cart: { userId, items: [], updatedAt: createdAt },
      });

      return {
        ...publicOrder(order),
        message: "Simulated checkout complete. No payment was processed.",
      };
    },

    async listForUser(userId) {
      const orders = await store.listOrdersByUser(userId);
      return orders.map(publicOrder);
    },

    async getForUser(userId, orderId) {
      const order = assertOwner(await store.getOrder(orderId), userId);
      return publicOrder(order);
    },

    async getAny(orderId) {
      const order = await store.getOrder(orderId);
      if (!order) throw Errors.orderNotFound();
      return publicOrder(order);
    },

    async updateStatus(orderId, status) {
      const updated = await store.updateOrderStatus(orderId, status);
      return publicOrder(updated);
    },
  };
}
