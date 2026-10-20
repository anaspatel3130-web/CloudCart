import json

def sync_data():
    with open('backend/scripts/seed-data.json', 'r', encoding='utf-8') as f:
        products = json.load(f)

    js_content = f'''/**
 * CloudCart catalogue — centralized demo products and image URLs.
 * Synchronized with backend/scripts/seed-data.json (60 realistic hardware items).
 */
const SAMPLE_PRODUCTS = {json.dumps(products, indent=2)};

const SAMPLE_ORDERS = [
  {{
    id: "ord-demo-1001",
    createdAt: "2026-10-12T09:20:00.000Z",
    status: "Confirmed",
    customer: {{ name: "Aarav Sharma", email: "aarav@example.com", city: "Bengaluru" }},
    total: 11498,
    items: [
      {{ productId: "prod-001", quantity: 1 }},
      {{ productId: "prod-003", quantity: 1 }}
    ]
  }},
  {{
    id: "ord-demo-1002",
    createdAt: "2026-10-16T14:05:00.000Z",
    status: "Dispatched",
    customer: {{ name: "Ananya Iyer", email: "ananya@example.com", city: "Mumbai" }},
    total: 6499,
    items: [
      {{ productId: "prod-002", quantity: 1 }}
    ]
  }},
  {{
    id: "ord-demo-1003",
    createdAt: "2026-10-19T18:42:00.000Z",
    status: "Processing",
    customer: {{ name: "Elena Rostova", email: "elena@future.design", city: "San Francisco" }},
    total: 24999,
    items: [
      {{ productId: "prod-012", quantity: 1 }}
    ]
  }}
];

const PROMO_CODES = {{
  "CLOUDCART10": {{ discountPercent: 10, label: "10% VIP Launch Discount" }},
  "FUTURE20": {{ discountPercent: 20, label: "20% Studio Collector Discount" }},
  "EDGE500": {{ discountAmount: 500, label: "₹500 Edge Welcome Credit" }}
}};

const DemoStore = {{
  read(key, fallback) {{
    try {{
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;
      return JSON.parse(raw);
    }} catch {{
      return fallback;
    }}
  }},
  write(key, value) {{
    localStorage.setItem(key, JSON.stringify(value));
  }},
  getProducts() {{
    const stored = this.read(CONFIG.storage.products, null);
    if (Array.isArray(stored) && stored.length >= SAMPLE_PRODUCTS.length) {{
      return stored.map(normalizeProduct).filter(Boolean);
    }}
    this.write(CONFIG.storage.products, SAMPLE_PRODUCTS);
    return SAMPLE_PRODUCTS.map((p) => ({{ ...p }}));
  }},
  setProducts(list) {{
    this.write(CONFIG.storage.products, list);
  }},
  getOrders() {{
    const stored = this.read(CONFIG.storage.orders, null);
    if (Array.isArray(stored) && stored.length) return stored;
    this.write(CONFIG.storage.orders, SAMPLE_ORDERS);
    return SAMPLE_ORDERS.map((o) => ({{ ...o, items: o.items.map((i) => ({{ ...i }})) }}));
  }},
  setOrders(list) {{
    this.write(CONFIG.storage.orders, list);
  }},
  resetDemoData() {{
    this.write(CONFIG.storage.products, SAMPLE_PRODUCTS);
    this.write(CONFIG.storage.orders, SAMPLE_ORDERS);
    return {{ products: SAMPLE_PRODUCTS, orders: SAMPLE_ORDERS }};
  }}
}};

function normalizeProduct(raw) {{
  if (!raw || typeof raw !== "object") return null;
  const id = String(raw.id || "").trim();
  const name = String(raw.name || "").trim();
  const price = Number(raw.price);
  if (!id || !name || !Number.isFinite(price) || price < 0) return null;
  const previousPrice = Number(raw.previousPrice);
  const stock = Number(raw.stock);

  const sampleMatch = SAMPLE_PRODUCTS.find((p) => p.id === id);

  return {{
    id,
    name,
    tagline: String(raw.tagline || (sampleMatch ? sampleMatch.tagline : "Precision hardware for modern workflows.")),
    description: String(raw.description || ""),
    price,
    previousPrice: Number.isFinite(previousPrice) && previousPrice > price ? previousPrice : (sampleMatch?.previousPrice || null),
    category: String(raw.category || "Uncategorised"),
    image: raw.image ? String(raw.image) : (sampleMatch?.image || ""),
    gallery: Array.isArray(raw.gallery) && raw.gallery.length ? raw.gallery : (sampleMatch?.gallery || (raw.image ? [raw.image] : [])),
    stock: Number.isFinite(stock) && stock >= 0 ? Math.floor(stock) : 0,
    featured: Boolean(raw.featured ?? sampleMatch?.featured),
    newArrival: Boolean(raw.newArrival ?? sampleMatch?.newArrival),
    rating: Number(raw.rating || sampleMatch?.rating || 4.8),
    reviewsCount: Number(raw.reviewsCount || sampleMatch?.reviewsCount || 112),
    specs: (raw.specs && Object.keys(raw.specs).length) ? raw.specs : (sampleMatch?.specs || {{
      "Material": "Anodized Aerospace Aluminum",
      "Connectivity": "USB-C / Wireless Low Latency",
      "Warranty": "2-Year Studio Limited Warranty",
      "Origin": "Designed in CloudCart Studio"
    }}),
    highlights: (Array.isArray(raw.highlights) && raw.highlights.length) ? raw.highlights : (sampleMatch?.highlights || [
      "Precision engineered with premium tactile feedback",
      "Minimalist footprint tailored for modern desk spaces",
      "Instant compatibility across macOS, Windows and mobile"
    ])
  }};
}}
'''

    with open('frontend/js/data.js', 'w', encoding='utf-8') as f:
        f.write(js_content)

    print(f"Successfully wrote {len(products)} products into frontend/js/data.js")

if __name__ == '__main__':
    sync_data()
