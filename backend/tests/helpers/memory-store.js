import { Errors } from "../../src/lib/errors.js";

export function createMemoryStore(seedProducts = []) {
  const products = new Map(seedProducts.map((item) => [item.id, { ...item }]));
  const carts = new Map();
  const orders = new Map();

  return {
    _products: products,
    _carts: carts,
    _orders: orders,

    async getProduct(id) {
      const item = products.get(id);
      return item ? { ...item } : null;
    },

    async listAllProducts() {
      return [...products.values()].map((item) => ({ ...item }));
    },

    async updateProductStock(id, stock) {
      const item = products.get(id);
      if (!item) throw Errors.productNotFound();
      const updated = { ...item, stock, updatedAt: new Date().toISOString() };
      products.set(id, updated);
      return { ...updated };
    },

    async getCart(userId) {
      const cart = carts.get(userId);
      return cart ? { ...cart, items: cart.items.map((item) => ({ ...item })) } : null;
    },

    async putCart(cart) {
      const saved = {
        userId: cart.userId,
        items: (cart.items || []).map((item) => ({ ...item })),
        updatedAt: cart.updatedAt,
      };
      carts.set(cart.userId, saved);
      return { ...saved, items: saved.items.map((item) => ({ ...item })) };
    },

    async getOrder(orderId) {
      const order = orders.get(orderId);
      return order ? structuredClone(order) : null;
    },

    async listOrdersByUser(userId) {
      return [...orders.values()]
        .filter((order) => order.userId === userId)
        .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))
        .map((order) => structuredClone(order));
    },

    async updateOrderStatus(orderId, status) {
      const order = orders.get(orderId);
      if (!order) throw Errors.orderNotFound();
      const updated = { ...order, status, updatedAt: new Date().toISOString() };
      orders.set(orderId, updated);
      return structuredClone(updated);
    },

    async transactCheckout({ decrements, order, cart }) {
      const snapshotProducts = new Map([...products.entries()].map(([k, v]) => [k, { ...v }]));
      const snapshotCarts = new Map([...carts.entries()].map(([k, v]) => [k, structuredClone(v)]));
      const snapshotOrders = new Map([...orders.entries()].map(([k, v]) => [k, structuredClone(v)]));

      try {
        for (const line of decrements) {
          const product = products.get(line.productId);
          if (!product || product.stock < line.quantity) {
            throw Errors.conflict(
              "CHECKOUT_CONFLICT",
              "The order could not be completed because stock changed. Refresh the cart and try again."
            );
          }
          product.stock -= line.quantity;
          product.updatedAt = new Date().toISOString();
        }
        if (orders.has(order.orderId)) {
          throw Errors.conflict("CHECKOUT_CONFLICT", "The order could not be completed.");
        }
        orders.set(order.orderId, structuredClone(order));
        carts.set(cart.userId, structuredClone(cart));
      } catch (error) {
        products.clear();
        snapshotProducts.forEach((value, key) => products.set(key, value));
        carts.clear();
        snapshotCarts.forEach((value, key) => carts.set(key, value));
        orders.clear();
        snapshotOrders.forEach((value, key) => orders.set(key, value));
        throw error;
      }
    },
  };
}

export function sampleProducts() {
  return [
    {
      id: "prod-001",
      name: "Aether Wireless Headphones",
      description: "Closed-back wireless headphones.",
      price: 8999,
      category: "Audio",
      image: "https://example.com/headphones.jpg",
      stock: 14,
      createdAt: "2026-01-01T00:00:00.000Z",
      featured: true,
    },
    {
      id: "prod-002",
      name: "Graphite Mechanical Keyboard",
      description: "Compact 75% layout.",
      price: 6499,
      category: "Desk Setup",
      image: "https://example.com/keyboard.jpg",
      stock: 3,
      createdAt: "2026-01-02T00:00:00.000Z",
      featured: true,
    },
    {
      id: "prod-009",
      name: "Nimbus True Wireless Earbuds",
      description: "Compact earbuds.",
      price: 3799,
      category: "Audio",
      image: "https://example.com/earbuds.jpg",
      stock: 0,
      createdAt: "2026-01-03T00:00:00.000Z",
    },
  ];
}
