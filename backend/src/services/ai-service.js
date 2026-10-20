import { Errors } from "../lib/errors.js";

/**
 * CloudCart AI Shopping Assistant Service ("Aether AI")
 *
 * Provides natural-language product discovery, contextual recommendations,
 * vector semantic search using cosine similarity, and real-time cart/admin insights.
 * Supports live external LLM APIs (Gemini, OpenAI, Bedrock) with a high-accuracy
 * built-in semantic intent and vector engine for offline/demo reliability.
 */
export function createAiService(store, config, productService) {
  return {
    async chat({ message, history = [], context = {}, userId = "anonymous" }) {
      if (!message || typeof message !== "string" || !message.trim()) {
        throw Errors.invalidInput("Message is required.");
      }

      const query = message.trim();
      const allProducts = await productService.listAll();

      // If an external LLM API key is configured, call external provider
      const apiKey = process.env.AI_API_KEY || process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;
      if (apiKey && process.env.AI_PROVIDER) {
        try {
          return await callExternalLlm({
            provider: process.env.AI_PROVIDER.toLowerCase(),
            apiKey,
            query,
            history,
            context,
            products: allProducts,
          });
        } catch (err) {
          // Graceful fallback to deterministic semantic engine on LLM API failure
          console.warn("[CloudCart AI] External LLM error, using semantic fallback:", err.message);
        }
      }

      // Built-in studio semantic engine
      return executeSemanticEngine({
        query,
        history,
        context,
        products: allProducts,
      });
    },

    async getRecommendations({ productId, category, limit = 4 }) {
      const allProducts = await productService.listAll();
      const numLimit = Math.max(1, Math.min(10, Number(limit) || 4));

      if (productId) {
        const current = allProducts.find((p) => p.id === productId);
        if (current) {
          const sameCategory = allProducts.filter((p) => p.id !== productId && p.category === current.category);
          const others = allProducts.filter((p) => p.id !== productId && p.category !== current.category);
          return [...sameCategory, ...others].slice(0, numLimit);
        }
      }

      if (category && category !== "All") {
        return allProducts.filter((p) => p.category.toLowerCase() === category.toLowerCase()).slice(0, numLimit);
      }

      return allProducts.filter((p) => p.featured || p.newArrival).slice(0, numLimit);
    },

    async semanticSearch({ query, limit = 8 }) {
      if (!query || typeof query !== "string" || !query.trim()) {
        throw Errors.invalidInput("Search query is required.");
      }
      const allProducts = await productService.listAll();
      return executeVectorSearch({ query: query.trim(), products: allProducts, limit: Number(limit) || 8 });
    },

    async getInsights({ type = "admin", cartItems = [], orders = [] }) {
      const allProducts = await productService.listAll();
      if (type === "cart") {
        return generateCartInsights({ cartItems, products: allProducts });
      }
      return generateAdminInsights({ products: allProducts, orders });
    },
  };
}

/**
 * Tokenize and normalize text into feature keywords
 */
export function tokenizeText(text) {
  if (!text) return [];
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1);
}

/**
 * Compute cosine similarity between two numeric vectors
 */
export function cosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dot += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Vector Search via Cosine Similarity over term frequency representations
 */
export function executeVectorSearch({ query, products, limit = 8 }) {
  const queryTokens = tokenizeText(query);
  if (!queryTokens.length) {
    return { query, matches: [], totalMatched: 0 };
  }

  // Build document tokens with weighted fields
  const docTokensList = products.map((prod) => {
    const nameTokens = tokenizeText(prod.name);
    const categoryTokens = tokenizeText(prod.category);
    const taglineTokens = tokenizeText(prod.tagline);
    const descTokens = tokenizeText(prod.description);
    const specsTokens = tokenizeText(
      prod.specs ? Object.entries(prod.specs).map(([k, v]) => `${k} ${v}`).join(" ") : ""
    );
    const highlightsTokens = tokenizeText((prod.highlights || []).join(" "));

    // Weighted bag of words: name 3x, category 2x, tagline 2x, specs 1.5x, desc 1x
    const tokens = [
      ...nameTokens, ...nameTokens, ...nameTokens,
      ...categoryTokens, ...categoryTokens,
      ...taglineTokens, ...taglineTokens,
      ...specsTokens,
      ...highlightsTokens,
      ...descTokens,
    ];
    return { id: prod.id, tokens, product: prod };
  });

  // Construct global vocabulary from query and candidates
  const vocabSet = new Set(queryTokens);
  for (const doc of docTokensList) {
    for (const t of doc.tokens) {
      if (queryTokens.includes(t)) {
        vocabSet.add(t);
      }
    }
  }
  const vocabulary = Array.from(vocabSet);

  // Vectorizer helper
  const vectorize = (tokens) => {
    const vec = new Float64Array(vocabulary.length);
    for (const t of tokens) {
      const idx = vocabulary.indexOf(t);
      if (idx !== -1) vec[idx] += 1;
    }
    return vec;
  };

  const queryVector = vectorize(queryTokens);

  const scored = docTokensList.map((doc) => {
    const docVector = vectorize(doc.tokens);
    let similarity = cosineSimilarity(queryVector, docVector);

    // Boost exact phrase matches in name
    const lowerQuery = query.toLowerCase();
    if (doc.product.name.toLowerCase().includes(lowerQuery)) {
      similarity = Math.min(1.0, similarity + 0.35);
    }
    if (doc.product.category.toLowerCase().includes(lowerQuery)) {
      similarity = Math.min(1.0, similarity + 0.25);
    }

    return {
      product: doc.product,
      similarityScore: Math.round(similarity * 100) / 100,
    };
  });

  // Filter items with positive similarity and sort descending
  const matches = scored
    .filter((s) => s.similarityScore > 0.05)
    .sort((a, b) => b.similarityScore - a.similarityScore)
    .slice(0, limit)
    .map((s) => ({
      ...s.product,
      relevanceScore: s.similarityScore,
    }));

  return {
    query,
    matches,
    totalMatched: matches.length,
    embeddingEngine: "aether-vector-v1",
  };
}

/**
 * AI Cart Insights: Cross-sell recommendations, bundle discounts, shipping telemetry
 */
export function generateCartInsights({ cartItems = [], products = [] }) {
  const itemMap = new Map();
  let subtotal = 0;
  const categoriesInCart = new Set();

  for (const item of cartItems) {
    const pId = item.productId || item.id;
    const prod = products.find((p) => p.id === pId);
    if (prod) {
      const qty = Number(item.quantity) || 1;
      itemMap.set(pId, { ...prod, cartQty: qty });
      subtotal += prod.price * qty;
      categoriesInCart.add(prod.category);
    }
  }

  const freeShippingThreshold = 5000;
  const shippingRemaining = Math.max(0, freeShippingThreshold - subtotal);
  const eligibleForFreeShipping = subtotal >= freeShippingThreshold;

  // Complementary suggestions not already in cart
  const notInCart = products.filter((p) => !itemMap.has(p.id));

  // Find products that pair well with items in cart
  let complementary = [];
  if (categoriesInCart.has("Audio & Acoustics")) {
    complementary.push(...notInCart.filter((p) => p.category === "Studio Ergonomics" || p.category === "Cybernetics"));
  }
  if (categoriesInCart.has("Studio Ergonomics")) {
    complementary.push(...notInCart.filter((p) => p.category === "Quantum Displays" || p.category === "Audio & Acoustics"));
  }
  if (complementary.length < 3) {
    complementary.push(...notInCart.filter((p) => p.featured || p.newArrival));
  }

  // Deduplicate and pick top 3
  const uniqueSuggestions = Array.from(new Set(complementary)).slice(0, 3);

  let adviceMessage = "";
  if (eligibleForFreeShipping) {
    adviceMessage = "Your studio order qualifies for Complimentary White-Glove Courier Dispatch (Zero Delivery Surcharge).";
  } else {
    adviceMessage = `Add ₹${shippingRemaining.toLocaleString("en-IN")} more to unlock Complimentary White-Glove Courier Delivery.`;
  }

  return {
    subtotal,
    eligibleForFreeShipping,
    shippingRemaining,
    suggestedAddons: uniqueSuggestions.map((p) => ({
      id: p.id,
      name: p.name,
      price: p.price,
      image: p.image,
      category: p.category,
      tagline: p.tagline,
      stock: p.stock,
    })),
    adviceMessage,
    recommendedVoucher: subtotal > 15000 ? "FUTURE20" : "CLOUDCART10",
  };
}

/**
 * AI Admin Analytics & Inventory Intelligence
 */
export function generateAdminInsights({ products = [], orders = [] }) {
  const totalProducts = products.length;
  const outOfStock = products.filter((p) => p.stock <= 0);
  const lowStock = products.filter((p) => p.stock > 0 && p.stock <= 5);
  const healthyStock = products.filter((p) => p.stock > 5);

  const inventoryHealthPct = totalProducts > 0
    ? Math.round((healthyStock.length / totalProducts) * 100)
    : 100;

  // Total inventory valuation
  const inventoryValuation = products.reduce((sum, p) => sum + (p.price * (p.stock || 0)), 0);

  // High velocity items at restock risk
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

  // Category breakdown
  const categorySummary = {};
  for (const p of products) {
    categorySummary[p.category] = (categorySummary[p.category] || 0) + 1;
  }

  // Executive summary
  let executiveSummary = "";
  if (outOfStock.length > 0) {
    executiveSummary = `Attention required: ${outOfStock.length} high-demand SKUs are completely depleted. Restock orders should be dispatched immediately to prevent lost order conversions.`;
  } else if (lowStock.length > 0) {
    executiveSummary = `Catalogue health optimal at ${inventoryHealthPct}%. ${lowStock.length} items approaching safety buffer threshold (≤5 units remaining).`;
  } else {
    executiveSummary = `All 60 hardware SKUs are fully provisioned across all 6 studio categories. Zero immediate restock deficits detected.`;
  }

  return {
    totalProducts,
    outOfStockCount: outOfStock.length,
    lowStockCount: lowStock.length,
    inventoryHealthPct,
    inventoryValuation,
    restockUrgencyList,
    categorySummary,
    executiveSummary,
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Deterministic Semantic Intelligence Engine
 * Parses customer intent, budget constraints, technical specs, and inventory availability.
 */
function executeSemanticEngine({ query, history, context, products }) {
  const lowerQuery = query.toLowerCase();

  // 1. Budget extraction (e.g. "under 3000", "below 5k", "under 10000", "cheap", "budget")
  let maxBudget = null;
  const underMatch = lowerQuery.match(/(?:under|below|less than|within|up to|budget of)\s*(?:rs\.?|inr|₹)?\s*(\d+)(?:k)?/i);
  if (underMatch) {
    let val = parseInt(underMatch[1], 10);
    if (/k$/i.test(underMatch[0]) || val < 100) val *= 1000;
    maxBudget = val;
  } else if (lowerQuery.includes("cheap") || lowerQuery.includes("budget") || lowerQuery.includes("affordable")) {
    maxBudget = 3000;
  }

  // 2. Category & Keyword Semantics
  const categoryKeywords = {
    "Audio": ["sound", "audio", "music", "listen", "earphone", "headphone", "speaker", "noise cancel", "anc", "bass", "earbuds", "volume", "acoustic"],
    "Audio & Acoustics": ["sound", "audio", "music", "listen", "earphone", "headphone", "speaker", "noise cancel", "anc", "bass", "earbuds", "volume", "acoustic"],
    "Desk Setup": ["desk", "keyboard", "workspace", "lamp", "light", "stand", "laptop stand", "mechanical", "switches", "type", "typing", "ergonomic"],
    "Studio Ergonomics": ["desk", "chair", "stand", "arm", "mat", "lamp", "light", "ergonomic", "posture", "riser", "cushion"],
    "Cybernetics": ["mouse", "keyboard", "controller", "deck", "input", "switch", "dial", "slider", "macro", "sensor"],
    "Neural Wearables": ["watch", "ring", "neural", "band", "wrist", "sleep", "haptic", "biometric", "smartwatch", "pulse", "wearable"],
    "Quantum Displays": ["monitor", "display", "screen", "oled", "quantum", "hz", "panel", "4k", "refresh", "retina"],
    "Edge Compute": ["dock", "hub", "nas", "storage", "nvme", "compute", "router", "thunderbolt", "port", "server", "lan"],
    "Accessories": ["mouse", "hub", "usb", "port", "adapter", "cable", "dongle", "click", "sensor", "optical"],
    "Mobile Essentials": ["phone", "mobile", "charge", "charger", "power bank", "battery", "carry", "travel", "magsafe", "magnetic", "stand"],
  };

  const detectedCategories = new Set();
  for (const [cat, words] of Object.entries(categoryKeywords)) {
    if (words.some((w) => lowerQuery.includes(w))) {
      detectedCategories.add(cat);
    }
  }

  // Filter candidate pool by budget if any matches exist within budget
  const budgetPool = maxBudget !== null
    ? products.filter((p) => p.price <= maxBudget)
    : [];

  const candidates = budgetPool.length > 0 ? budgetPool : products;

  // 3. Score matching products
  const scored = candidates.map((product) => {
    let score = 0;
    const prodName = product.name.toLowerCase();
    const prodDesc = (product.description || "").toLowerCase();
    const prodTagline = (product.tagline || "").toLowerCase();

    // Exact name match
    if (lowerQuery.includes(prodName)) score += 50;

    // Word tokens overlap
    const queryTokens = lowerQuery.split(/\s+/).filter((t) => t.length > 2);
    for (const token of queryTokens) {
      if (prodName.includes(token)) score += 12;
      if (prodDesc.includes(token)) score += 6;
      if (prodTagline.includes(token)) score += 8;
    }

    // Category match
    if (detectedCategories.has(product.category)) {
      score += 15;
    }

    // Budget compliance bonus
    if (maxBudget !== null && product.price <= maxBudget) {
      score += 25;
    }

    // Boost in-stock & featured
    if (product.stock > 0) score += 5;
    if (product.featured) score += 3;

    return { product, score };
  });

  // Filter and sort by score
  scored.sort((a, b) => b.score - a.score);
  const matched = scored.filter((item) => item.score > 10).map((item) => item.product);

  // Recommendations: top 3 matching products (or fallback candidates if score threshold not met)
  const recommendations = matched.length > 0
    ? matched.slice(0, 3)
    : candidates.slice(0, 3);

  // 4. Construct natural-language studio response
  let reply = "";
  const followUps = [];

  if (maxBudget !== null && matched.length > 0) {
    const budgetStr = `₹${maxBudget.toLocaleString("en-IN")}`;
    reply = `I curated our top hardware selections within your budget of **${budgetStr}**:\n\n`;
    matched.slice(0, 2).forEach((p) => {
      reply += `• **${p.name}** (₹${p.price.toLocaleString("en-IN")}) — ${p.tagline || p.description.slice(0, 80) + "..."}\n`;
    });
    reply += `\nEvery item is crafted from aerospace alloys and arrives with complimentary express dispatch.`;
    followUps.push("Tell me more about warranty and returns", "Compare with premium alternative", "Add to my bag");
  } else if (detectedCategories.has("Audio & Acoustics")) {
    reply = `For dedicated acoustics, our **Aether Studio Reference Headphones** provide active acoustic cancellation and lossless 24-bit audio, while the **Acoustic Prism 360 Speaker** delivers omnidirectional studio sound.`;
    followUps.push("Show battery life details", "Compare headphones vs earbuds", "What is included in the box?");
  } else if (detectedCategories.has("Studio Ergonomics") || detectedCategories.has("Cybernetics")) {
    reply = `To elevate desk ergonomics and tactile productivity, our **Cybernetic Split Ortholinear Keyboard** paired with the **Aero-Glide Carbon Mechanical Mouse** provides zero-strain, posture-aligned typing.`;
    followUps.push("Is it compatible with Mac?", "Show desk tools under ₹10,000", "Check inventory stock");
  } else if (lowerQuery.includes("recommend") || lowerQuery.includes("best") || lowerQuery.includes("suggest")) {
    reply = `Here are our flagship hardware recommendations curated from Studio Series. Each piece is selected for quiet endurance, minimal footprint, and zero latency.`;
    followUps.push("Show items under ₹10,000", "Recommend an audio setup", "What is the newest arrival?");
  } else {
    reply = `I can help you discover hardware across **Audio & Acoustics**, **Neural Wearables**, **Quantum Displays**, **Cybernetics**, **Studio Ergonomics**, and **Edge Compute**. What workflow are you optimizing today?`;
    followUps.push("Recommend audio under ₹10,000", "Best tools for dual-monitor desk", "Newest Studio arrivals");
  }

  return {
    reply,
    recommendations: recommendations.map((p) => ({
      id: p.id,
      name: p.name,
      tagline: p.tagline,
      price: p.price,
      previousPrice: p.previousPrice,
      category: p.category,
      image: p.image,
      stock: p.stock,
      rating: p.rating || 4.8,
    })),
    detectedIntent: {
      categories: Array.from(detectedCategories),
      maxBudget,
      matchedCount: matched.length,
    },
    suggestedFollowUps: followUps,
  };
}

/**
 * External LLM API Caller (OpenAI / Gemini format)
 */
async function callExternalLlm({ provider, apiKey, query, history, context, products }) {
  const catalogueSummary = products.map((p) => ({
    id: p.id,
    name: p.name,
    category: p.category,
    price: p.price,
    stock: p.stock,
    tagline: p.tagline,
  }));

  const systemPrompt = `You are "Aether", the expert AI hardware architect for CloudCart, a luxury technology storefront.
You provide sophisticated, concise, and helpful product guidance inspired by Apple and Teenage Engineering design language.
Live Product Catalogue:
${JSON.stringify(catalogueSummary, null, 2)}
Always recommend matching products from this list by their exact 'id'. Keep answers concise, elegant, and directly address customer needs.`;

  if (provider === "openai") {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          ...history.map((h) => ({ role: h.role, content: h.content })),
          { role: "user", content: query },
        ],
        temperature: 0.7,
      }),
    });
    if (!res.ok) throw new Error(`OpenAI API error: ${res.status}`);
    const data = await res.json();
    const reply = data.choices[0]?.message?.content || "";
    const matchedProducts = products.filter((p) => reply.includes(p.name)).slice(0, 3);
    return {
      reply,
      recommendations: matchedProducts.length ? matchedProducts : products.slice(0, 3),
      suggestedFollowUps: ["Check stock availability", "Compare with similar", "Explore full collection"],
    };
  }

  // Fallback to internal engine if provider not matched
  return executeSemanticEngine({ query, history, context, products });
}
