/**
 * CloudCart API abstraction.
 *
 * Demo: local catalogue + localStorage cart/orders.
 * API:  GET /products, GET /products/{id}, POST /cart, POST /orders, GET /orders
 *       matching docs/api-contract.md. Cart UI still mirrors items in localStorage.
 */
const API = {
  async getProducts() {
    if (CONFIG.isDemo()) {
      await delay(280);
      return DemoStore.getProducts();
    }
    const data = await request("GET", CONFIG.endpoints.products);
    const list = Array.isArray(data) ? data : data.products;
    if (!Array.isArray(list)) throw new Error("Unexpected products response.");
    return list.map(normalizeProduct).filter(Boolean);
  },

  async getProduct(id) {
    if (CONFIG.isDemo()) {
      await delay(120);
      return DemoStore.getProducts().find((p) => p.id === id) || null;
    }
    const data = await request("GET", `${CONFIG.endpoints.products}/${encodeURIComponent(id)}`);
    return normalizeProduct(data);
  },

  async getCart() {
    return readValidCart();
  },

  async addToCart(productId, quantity = 1) {
    const qty = clampQty(quantity);
    const products = CONFIG.isDemo() ? DemoStore.getProducts() : await this.getProducts();
    const product = products.find((p) => p.id === productId);
    if (!product) throw new Error("Product not found.");
    if (product.stock <= 0) throw new Error("This item is currently out of stock.");

    if (!CONFIG.isDemo()) {
      await request("POST", CONFIG.endpoints.cart, { productId, quantity: qty });
    }

    const cart = readValidCart();
    const existing = cart.find((item) => item.productId === productId);
    const nextQty = (existing ? existing.quantity : 0) + qty;
    if (nextQty > product.stock) throw new Error("Not enough stock for that quantity.");

    if (existing) {
      existing.quantity = nextQty;
    } else {
      cart.push({
        productId: product.id,
        quantity: qty,
        name: product.name,
        price: product.price,
        image: product.image,
        category: product.category,
      });
    }
    writeCart(cart);
    return cart;
  },

  async updateCartQuantity(productId, quantity) {
    const cart = readValidCart();
    const item = cart.find((i) => i.productId === productId);
    if (!item) return cart;
    const qty = clampQty(quantity, true);
    if (qty <= 0) return this.removeFromCart(productId);
    const product = DemoStore.getProducts().find((p) => p.id === productId);
    if (product && qty > product.stock) throw new Error("Not enough stock for that quantity.");
    item.quantity = qty;
    writeCart(cart);
    return cart;
  },

  async removeFromCart(productId) {
    const cart = readValidCart().filter((i) => i.productId !== productId);
    writeCart(cart);
    return cart;
  },

  async createOrder(orderData) {
    const cart = readValidCart();
    const items = (orderData && orderData.items) || cart.map((i) => ({
      productId: i.productId,
      quantity: i.quantity,
    }));
    if (!items.length) throw new Error("Your cart is empty.");
    const total = Number(orderData && orderData.total);
    const payload = {
      items,
      total: Number.isFinite(total) ? total : cart.reduce((s, i) => s + i.price * i.quantity, 0),
    };

    if (!CONFIG.isDemo()) {
      return request("POST", CONFIG.endpoints.orders, payload);
    }

    await delay(420);
    const orders = DemoStore.getOrders();
    const record = {
      id: "ord-demo-" + (orderData && orderData.orderId ? orderData.orderId : Date.now().toString(36).toUpperCase()),
      createdAt: new Date().toISOString(),
      status: "Confirmed",
      total: payload.total,
      items: payload.items,
      customer: (orderData && orderData.customer) || { name: "Studio Patron", email: "client@cloudcart.dev", city: "Bengaluru" },
      shipping: (orderData && orderData.shipping) || { method: "Standard", fee: 0 }
    };
    DemoStore.setOrders([record, ...orders]);
    writeCart([]);
    return {
      success: true,
      orderId: record.id,
      order: record,
      message: "Order placed successfully (Demo verification).",
    };
  },

  async getOrderById(orderId) {
    if (!orderId) throw new Error("Order ID is required.");
    if (CONFIG.isDemo()) {
      await delay(120);
      const orders = DemoStore.getOrders();
      const match = orders.find((o) => o.id.toLowerCase() === orderId.toLowerCase());
      if (!match) throw new Error("Order not found in local system.");
      return match;
    }
    const data = await request("GET", `${CONFIG.endpoints.orders}/${encodeURIComponent(orderId)}`);
    return data;
  },

  async sendAiMessage({ message, history = [], context = {} }) {
    if (!message || !message.trim()) throw new Error("Message cannot be empty.");
    if (!CONFIG.isDemo()) {
      return request("POST", `${CONFIG.endpoints.ai}/chat`, { message, history, context });
    }
    await delay(320);
    // Use client-side semantic parser when in demo mode
    const products = DemoStore.getProducts();
    return executeClientAi({ message, history, context, products });
  },

  async getAiRecommendations({ productId, category, limit = 4 }) {
    if (!CONFIG.isDemo()) {
      const res = await request("POST", `${CONFIG.endpoints.ai}/recommendations`, { productId, category, limit });
      return res.recommendations || [];
    }
    await delay(150);
    const products = DemoStore.getProducts();
    if (productId) {
      const current = products.find((p) => p.id === productId);
      if (current) {
        return products.filter((p) => p.id !== productId && p.category === current.category).slice(0, limit);
      }
    }
    return products.filter((p) => p.featured).slice(0, limit);
  },

  async searchAi({ query, limit = 8 }) {
    if (!query || !query.trim()) return { query: "", matches: [], totalMatched: 0 };
    if (!CONFIG.isDemo()) {
      return request("POST", `${CONFIG.endpoints.ai}/search`, { query, limit });
    }
    await delay(120);
    const products = DemoStore.getProducts();
    return clientVectorSearch(query, products, limit);
  },

  async getAiInsights({ type = "cart", cartItems = [], orders = [] }) {
    if (!CONFIG.isDemo()) {
      return request("POST", `${CONFIG.endpoints.ai}/insights`, { type, cartItems, orders });
    }
    await delay(160);
    const products = DemoStore.getProducts();
    if (type === "cart") {
      return clientCartInsights(cartItems, products);
    }
    return clientAdminInsights(products, orders);
  },

  async getWishlist() {
    const ids = DemoStore.read(CONFIG.storage.wishlist, []);
    const products = await this.getProducts();
    return (Array.isArray(ids) ? ids : []).map((id) => products.find((p) => p.id === id)).filter(Boolean);
  },

  isInWishlist(productId) {
    const ids = DemoStore.read(CONFIG.storage.wishlist, []);
    return Array.isArray(ids) && ids.includes(productId);
  },

  async toggleWishlist(productId) {
    let ids = DemoStore.read(CONFIG.storage.wishlist, []);
    if (!Array.isArray(ids)) ids = [];
    const index = ids.indexOf(productId);
    let isWishlisted = false;
    if (index >= 0) {
      ids.splice(index, 1);
      isWishlisted = false;
    } else {
      ids.push(productId);
      isWishlisted = true;
    }
    DemoStore.write(CONFIG.storage.wishlist, ids);
    return { isWishlisted, count: ids.length };
  },

  async updateProductStock(id, newStock) {
    const list = DemoStore.getProducts();
    const product = list.find((p) => p.id === id);
    if (!product) throw new Error("Product not found.");
    product.stock = Math.max(0, Math.floor(Number(newStock) || 0));
    DemoStore.setProducts(list);
    return product;
  },

  async getOrders() {
    if (CONFIG.isDemo()) {
      await delay(180);
      return DemoStore.getOrders();
    }
    try {
      const data = await request("GET", CONFIG.endpoints.orders);
      return Array.isArray(data) ? data : data.orders || [];
    } catch (err) {
      throw new Error("Orders are not available from the API yet. " + err.message);
    }
  },

  /* Demo-only catalogue writes. Not authorization. */
  async saveProduct(product, originalId) {
    if (!CONFIG.isDemo()) {
      throw new Error("Product writes are demo-only. No admin API is connected.");
    }
    const list = DemoStore.getProducts();
    const normalized = normalizeProduct(product);
    if (!normalized) throw new Error("Invalid product data.");
    if (originalId && originalId !== normalized.id) {
      const idx = list.findIndex((p) => p.id === originalId);
      if (idx >= 0) list.splice(idx, 1);
    }
    const existing = list.findIndex((p) => p.id === normalized.id);
    if (existing >= 0) list[existing] = { ...list[existing], ...normalized };
    else list.unshift(normalized);
    DemoStore.setProducts(list);
    return normalized;
  },

  async deleteProduct(id) {
    if (!CONFIG.isDemo()) {
      throw new Error("Product writes are demo-only. No admin API is connected.");
    }
    DemoStore.setProducts(DemoStore.getProducts().filter((p) => p.id !== id));
  },
};

async function request(method, path, body) {
  if (!CONFIG.apiBaseUrl) {
    throw new Error("API mode is on, but apiBaseUrl is empty. Set window.CLOUDCART_CONFIG.apiBaseUrl.");
  }
  const headers = { "Content-Type": "application/json" };
  if (CONFIG.userId) headers["X-CloudCart-User-Id"] = CONFIG.userId;

  const response = await fetch(CONFIG.apiBaseUrl + path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await response.json().catch(() => ({}));
  const errorMessage =
    (data.error && typeof data.error === "object" && data.error.message) ||
    (typeof data.error === "string" ? data.error : null) ||
    `Request failed (${response.status})`;
  if (!response.ok) {
    throw new Error(errorMessage);
  }
  if (data && typeof data === "object" && data.data !== undefined) {
    if (data.data && typeof data.data === "object" && !Array.isArray(data.data)) {
      return { ...data, ...data.data };
    }
    return data.data;
  }
  return data;
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function clampQty(value, allowZero) {
  const n = Number(value);
  if (!Number.isFinite(n)) return allowZero ? 0 : 1;
  const rounded = Math.floor(n);
  if (allowZero && rounded <= 0) return 0;
  return Math.min(99, Math.max(1, rounded));
}

function readValidCart() {
  const raw = DemoStore.read(CONFIG.storage.cart, []);
  if (!Array.isArray(raw)) {
    writeCart([]);
    return [];
  }
  const cart = raw
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const productId = String(item.productId || "").trim();
      const quantity = clampQty(item.quantity);
      const price = Number(item.price);
      const name = String(item.name || "").trim();
      if (!productId || !name || !Number.isFinite(price) || price < 0) return null;
      return {
        productId,
        quantity,
        name,
        price,
        image: item.image ? String(item.image) : "",
        category: item.category ? String(item.category) : "",
      };
    })
    .filter(Boolean);
  return cart;
}

function writeCart(cart) {
  DemoStore.write(CONFIG.storage.cart, cart);
}

function executeClientAi({ message, history, context, products }) {
  const lowerQuery = message.toLowerCase();

  let maxBudget = null;
  const underMatch = lowerQuery.match(/(?:under|below|less than|within|up to|budget of)\s*(?:rs\.?|inr|₹)?\s*(\d+)(?:k)?/i);
  if (underMatch) {
    let val = parseInt(underMatch[1], 10);
    if (/k$/i.test(underMatch[0]) || val < 100) val *= 1000;
    maxBudget = val;
  } else if (lowerQuery.includes("cheap") || lowerQuery.includes("budget") || lowerQuery.includes("affordable")) {
    maxBudget = 3000;
  }

  const categoryKeywords = {
    Audio: ["sound", "audio", "music", "listen", "earphone", "headphone", "speaker", "noise cancel", "anc", "bass", "earbuds"],
    "Desk Setup": ["desk", "keyboard", "workspace", "lamp", "light", "stand", "laptop stand", "mechanical", "switches", "type", "ergonomic"],
    Accessories: ["mouse", "hub", "usb", "port", "adapter", "cable", "dongle", "sensor"],
    "Mobile Essentials": ["phone", "mobile", "charge", "charger", "power bank", "battery", "carry", "travel", "magsafe", "magnetic"],
  };

  const detectedCategories = new Set();
  for (const [cat, words] of Object.entries(categoryKeywords)) {
    if (words.some((w) => lowerQuery.includes(w))) detectedCategories.add(cat);
  }

  const candidates = maxBudget !== null ? products.filter((p) => p.price <= maxBudget) : products;
  const scored = (candidates.length ? candidates : products).map((product) => {
    let score = 0;
    const name = product.name.toLowerCase();
    const desc = (product.description || "").toLowerCase();
    const tagline = (product.tagline || "").toLowerCase();

    if (lowerQuery.includes(name)) score += 50;
    const tokens = lowerQuery.split(/\s+/).filter((t) => t.length > 2);
    for (const token of tokens) {
      if (name.includes(token)) score += 12;
      if (desc.includes(token)) score += 6;
      if (tagline.includes(token)) score += 8;
    }
    if (detectedCategories.has(product.category)) score += 18;
    if (maxBudget !== null && product.price <= maxBudget) score += 20;
    if (product.stock > 0) score += 5;
    if (product.featured) score += 3;
    return { product, score };
  });

  scored.sort((a, b) => b.score - a.score);
  const matched = scored.filter((item) => item.score > 10).map((item) => item.product);
  const recommendations = matched.length ? matched.slice(0, 3) : products.filter((p) => p.featured).slice(0, 3);

  let reply = "";
  const followUps = [];

  if (maxBudget !== null && matched.length > 0) {
    reply = `I curated these top hardware selections matching your budget of **₹${maxBudget.toLocaleString("en-IN")}**:\n\n`;
    matched.slice(0, 2).forEach((p) => {
      reply += `• **${p.name}** (₹${p.price.toLocaleString("en-IN")}) — ${p.tagline || p.description.slice(0, 75) + "..."}\n`;
    });
    reply += `\nEach piece features aerospace-grade materials and complimentary express delivery.`;
    followUps.push("Tell me about warranty", "Compare with premium alternative", "Add to bag");
  } else if (detectedCategories.has("Audio")) {
    reply = `For audio precision, our **Aether Wireless Headphones** provide studio active noise cancellation, while the **Pulse Portable Speaker** delivers 360-degree omnidirectional acoustics with IPX7 waterproofing.`;
    followUps.push("Compare Aether vs Nimbus Earbuds", "Show battery life", "Add Aether to bag");
  } else if (detectedCategories.has("Desk Setup")) {
    reply = `To optimize your workspace, the **Graphite Mechanical Keyboard** (CNC aluminum, hot-swappable) combined with the **Lift Laptop Stand** creates an ergonomic, posture-aligned setup.`;
    followUps.push("Is it compatible with Mac?", "Show desk tools under ₹3,000", "Add Keyboard to bag");
  } else {
    reply = `I am Aether, your CloudCart hardware advisor. I can help find the perfect equipment across **Audio**, **Desk Architecture**, and **Mobile Carry**. What are you looking to optimize?`;
    followUps.push("Recommend audio under ₹5,000", "Best tools for dual-monitor desk", "Newest Studio arrivals");
  }

  return {
    reply,
    recommendations,
    suggestedFollowUps: followUps,
  };
}

function clientTokenize(text) {
  if (!text) return [];
  return String(text).toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter((t) => t.length > 1);
}

function clientVectorSearch(query, products, limit = 8) {
  const queryTokens = clientTokenize(query);
  if (!queryTokens.length) return { query, matches: [], totalMatched: 0 };

  const scored = products.map((prod) => {
    const tokens = [
      ...clientTokenize(prod.name), ...clientTokenize(prod.name), ...clientTokenize(prod.name),
      ...clientTokenize(prod.category), ...clientTokenize(prod.category),
      ...clientTokenize(prod.tagline),
      ...clientTokenize(prod.description)
    ];

    let dot = 0;
    for (const qt of queryTokens) {
      if (tokens.includes(qt)) dot += 1;
    }
    const magA = Math.sqrt(queryTokens.length);
    const magB = Math.sqrt(tokens.length);
    let score = magA && magB ? dot / (magA * magB) : 0;

    const lower = query.toLowerCase();
    if (prod.name.toLowerCase().includes(lower)) score += 0.35;
    if (prod.category.toLowerCase().includes(lower)) score += 0.20;

    return { product: prod, score: Math.round(score * 100) / 100 };
  });

  const matches = scored
    .filter((s) => s.score > 0.05)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => ({ ...s.product, relevanceScore: s.score }));

  return { query, matches, totalMatched: matches.length };
}

function clientCartInsights(cartItems, products) {
  const itemMap = new Map();
  let subtotal = 0;
  for (const item of cartItems) {
    const pId = item.productId || item.id;
    const prod = products.find((p) => p.id === pId);
    if (prod) {
      const qty = Number(item.quantity) || 1;
      itemMap.set(pId, { ...prod, cartQty: qty });
      subtotal += prod.price * qty;
    }
  }

  const freeShippingThreshold = 5000;
  const shippingRemaining = Math.max(0, freeShippingThreshold - subtotal);
  const eligibleForFreeShipping = subtotal >= freeShippingThreshold;

  const notInCart = products.filter((p) => !itemMap.has(p.id));
  const suggestedAddons = notInCart.filter((p) => p.featured || p.newArrival).slice(0, 3);

  return {
    subtotal,
    eligibleForFreeShipping,
    shippingRemaining,
    suggestedAddons,
    adviceMessage: eligibleForFreeShipping
      ? "Your studio order qualifies for Complimentary White-Glove Courier Dispatch."
      : `Add ₹${shippingRemaining.toLocaleString("en-IN")} more to unlock Complimentary White-Glove Courier Delivery.`,
    recommendedVoucher: subtotal > 15000 ? "FUTURE20" : "CLOUDCART10",
  };
}

function clientAdminInsights(products, orders) {
  const outOfStock = products.filter((p) => p.stock <= 0);
  const lowStock = products.filter((p) => p.stock > 0 && p.stock <= 5);
  const healthyStock = products.filter((p) => p.stock > 5);

  const inventoryHealthPct = products.length > 0
    ? Math.round((healthyStock.length / products.length) * 100)
    : 100;

  const inventoryValuation = products.reduce((sum, p) => sum + (p.price * (p.stock || 0)), 0);

  const restockUrgencyList = [...outOfStock, ...lowStock]
    .sort((a, b) => (b.demandScore || 50) - (a.demandScore || 50))
    .slice(0, 6)
    .map((p) => ({
      id: p.id,
      name: p.name,
      stock: p.stock,
      category: p.category,
      demandScore: p.demandScore || 70,
      urgency: p.stock === 0 ? "CRITICAL" : "HIGH",
      suggestedReorderUnits: Math.max(15, 25 - p.stock),
    }));

  return {
    totalProducts: products.length,
    outOfStockCount: outOfStock.length,
    lowStockCount: lowStock.length,
    inventoryHealthPct,
    inventoryValuation,
    restockUrgencyList,
    executiveSummary: outOfStock.length > 0
      ? `Attention required: ${outOfStock.length} high-demand SKUs are depleted. Immediate restock recommended.`
      : `Catalogue health optimal at ${inventoryHealthPct}%. ${lowStock.length} SKUs in low-buffer range.`,
    generatedAt: new Date().toISOString(),
  };
}
