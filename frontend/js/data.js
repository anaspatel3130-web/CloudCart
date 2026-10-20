/**
 * CloudCart catalogue — centralized demo products and image URLs.
 * Replace image URLs here when moving to owned assets.
 */
const SAMPLE_PRODUCTS = [
  {
    id: "prod-001",
    name: "Aether Wireless Headphones",
    tagline: "Studio acoustics. Uncompromising silence.",
    description: "Closed-back wireless headphones engineered with custom 40mm bio-cellulose drivers, active acoustic noise cancellation, and up to 40 hours of continuous high-fidelity playback.",
    price: 8999,
    previousPrice: 10999,
    category: "Audio",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1200&q=80"
    ],
    stock: 14,
    featured: true,
    newArrival: true,
    rating: 4.9,
    reviewsCount: 148,
    specs: {
      "Frequency Response": "10Hz – 40,000Hz",
      "Battery Life": "40 hours (ANC on)",
      "Connectivity": "Bluetooth 5.3, USB-C Lossless Audio",
      "Materials": "Anodized aluminum, Memory foam, Vegan leather",
      "Weight": "248 grams"
    },
    highlights: [
      "Adaptive Hybrid Active Noise Cancellation",
      "Lossless 24-bit/96kHz wired audio over USB-C",
      "Ultra-low latency gaming and media mode",
      "Multipoint pairing for two devices simultaneously"
    ]
  },
  {
    id: "prod-002",
    name: "Graphite Mechanical Keyboard",
    tagline: "Precision tactile switches in CNC aluminum.",
    description: "A compact 75% layout keyboard crafted from CNC-machined aerospace aluminum, featuring pre-lubricated hot-swappable switches, sound-dampening gasket mount, and per-key RGB backlighting.",
    price: 6499,
    previousPrice: null,
    category: "Desk Setup",
    image: "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1618384887929-16ec33cad9ea?auto=format&fit=crop&w=1200&q=80"
    ],
    stock: 3,
    featured: true,
    newArrival: true,
    rating: 4.8,
    reviewsCount: 94,
    specs: {
      "Layout": "75% ANSI (84 keys)",
      "Switches": "Hot-swappable linear mechanical",
      "Connectivity": "2.4GHz Wireless, Bluetooth 5.1, USB-C",
      "Battery": "4,000 mAh (up to 200 hours without backlight)",
      "Chassis": "6063 Anodized CNC Aluminum"
    },
    highlights: [
      "Triple-gasket acoustic dampening system",
      "Double-shot PBT keycaps resistant to shine",
      "Seamless Mac and Windows OS switching",
      "Programmable VIA/QMK firmware support"
    ]
  },
  {
    id: "prod-003",
    name: "Precision Wireless Mouse",
    tagline: "Ergonomic contour with 26,000 DPI sensor.",
    description: "Sculpted for all-day desk endurance with near-silent optical-mechanical microswitches, an ultra-precise 26,000 DPI optical sensor, and machined magnetic scroll wheel.",
    price: 2499,
    previousPrice: 2999,
    category: "Accessories",
    image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=1200&q=80"
    ],
    stock: 22,
    featured: true,
    rating: 4.7,
    reviewsCount: 112,
    specs: {
      "Sensor": "PixArt 26K Optical Sensor",
      "Tracking Speed": "650 IPS / 50G Acceleration",
      "Battery Life": "Up to 70 days on a single USB-C charge",
      "Weight": "63 grams ultra-lightweight",
      "Switches": "Optical Microswitch rated for 80M clicks"
    },
    highlights: [
      "Dual-mode SmartScroll magnetic wheel",
      "PTFE glide feet for frictionless motion",
      "Silent click mechanism ideal for open offices",
      "Onboard memory for customized sensitivity profiles"
    ]
  },
  {
    id: "prod-004",
    name: "Orbit USB-C Hub",
    tagline: "7-in-1 high-speed port expansion in forged unibody.",
    description: "Seven-port aluminium expansion hub supporting dual 4K displays at 60Hz, 100W Power Delivery pass-through, and 10Gbps USB 3.2 data transfer over a single woven cable.",
    price: 3299,
    category: "Accessories",
    image: "https://images.unsplash.com/photo-1618384887929-16ec33cad9ea?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1618384887929-16ec33cad9ea?auto=format&fit=crop&w=1200&q=80"
    ],
    stock: 18,
    featured: true,
    rating: 4.8,
    reviewsCount: 86,
    specs: {
      "Ports": "2x HDMI 4K@60Hz, 2x USB-C 10Gbps, 2x USB-A 3.2, 1x PD 100W",
      "Power Delivery": "100W Pass-Through Charging",
      "Cable": "Braided Kevlar reinforced 20cm",
      "Chassis": "Sandblasted Space Grey Aluminum",
      "Compatibility": "macOS, Windows, iPadOS, Linux"
    },
    highlights: [
      "Zero-throttling thermal dissipation vents",
      "Simultaneous dual 4K monitor support",
      "Integrated SD and MicroSD UHS-II readers",
      "Compact pocket-ready silhouette"
    ]
  },
  {
    id: "prod-005",
    name: "Pulse Portable Speaker",
    tagline: "Deep omnidirectional acoustics. IPX7 waterproof.",
    description: "Travel-ready speaker engineered with dual passive radiators and balanced 360-degree sound. Wrapped in custom acoustic mesh with a durable silicone bumper for adventure and studio use alike.",
    price: 4199,
    category: "Audio",
    image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=1200&q=80"
    ],
    stock: 5,
    featured: true,
    newArrival: true,
    rating: 4.9,
    reviewsCount: 203,
    specs: {
      "Power Output": "30W RMS with DSP equalization",
      "Battery Playtime": "24 hours at moderate volume",
      "Water Resistance": "IPX7 submersible up to 1 meter",
      "Wireless Range": "Up to 30 meters (Bluetooth 5.3)",
      "Charging": "Fast USB-C (2.5 hrs to 100%)"
    },
    highlights: [
      "Stereo party sync to link 2+ Pulse units",
      "Engineered passive radiators for deep sub-bass",
      "Built-in beamforming mic for crystal clear calls",
      "Tactile knurled volume wheel"
    ]
  },
  {
    id: "prod-006",
    name: "Halo Desk Lamp",
    tagline: "Stepless dimming and circadian color tuning.",
    description: "Architectural minimal desk light featuring edge-lit glare-free optics, adjustable color temperature (2700K to 6500K), and a precision counterbalanced articulated arm.",
    price: 2899,
    category: "Desk Setup",
    image: "https://images.unsplash.com/photo-1507473887607-a6e529184d03?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1507473887607-a6e529184d03?auto=format&fit=crop&w=1200&q=80"
    ],
    stock: 11,
    rating: 4.6,
    reviewsCount: 67,
    specs: {
      "Color Temperature": "2700K – 6500K Tunable White",
      "Color Rendering": "Ra > 97 True Color Reproduction",
      "Brightness": "Up to 1200 Lux at desk level",
      "Controls": "Capacitive touch slider",
      "Power": "15W USB-C or AC Adapter"
    },
    highlights: [
      "Circadian rhythm auto-temperature sync",
      "Zero flicker tested against eye fatigue",
      "Weighted low-profile zinc alloy base",
      "USB-C accessory power port on base"
    ]
  },
  {
    id: "prod-007",
    name: "Lift Laptop Stand",
    tagline: "Ergonomic elevation with passive heat dissipation.",
    description: "One-piece folded aerospace aluminum laptop stand designed to elevate your screen by 6 inches for optimal cervical spine alignment and enhanced cooling airflow.",
    price: 1999,
    category: "Desk Setup",
    image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=1200&q=80"
    ],
    stock: 27,
    rating: 4.8,
    reviewsCount: 154,
    specs: {
      "Material": "Solid 4mm Sandblasted Aluminum",
      "Elevation": "15 cm (6 inches) angle",
      "Compatibility": "All 11\" to 17\" laptops",
      "Load Capacity": "Up to 10 kg",
      "Protection": "Non-slip silicone contact pads"
    },
    highlights: [
      "Integrated rear cable routing pass-through",
      "Substantially improves fan airflow & thermals",
      "Keyboard tucks neatly underneath when not in use",
      "Machined chamfered edges with matte graphite finish"
    ]
  },
  {
    id: "prod-008",
    name: "Charge Compact Power Bank",
    tagline: "10,000 mAh pocket capacity with 30W Power Delivery.",
    description: "Ultra-dense pocket power bank clad in scratch-resistant anodized aluminum. Charges modern smartphones to 50% in under 25 minutes with intelligent thermal regulation.",
    price: 1499,
    category: "Mobile Essentials",
    image: "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?auto=format&fit=crop&w=1200&q=80"
    ],
    stock: 4,
    rating: 4.7,
    reviewsCount: 89,
    specs: {
      "Capacity": "10,000 mAh / 37Wh (Flight Approved)",
      "Output Ports": "1x USB-C (30W PD), 1x USB-A (22.5W QC)",
      "Dimensions": "105 x 62 x 15 mm",
      "Weight": "180 grams",
      "Display": "Micro-dot LED power percentage indicator"
    },
    highlights: [
      "30W fast charge for phones, tablets & earbuds",
      "Low-current mode for smartwatches and trackers",
      "Pass-through charging support",
      "Multi-protection short circuit safeguard"
    ]
  },
  {
    id: "prod-009",
    name: "Nimbus True Wireless Earbuds",
    tagline: "Featherlight fit with bespoke titanium drivers.",
    description: "True wireless earbuds weighing just 4.1 grams per bud, packed with 11mm custom dynamic drivers, intelligent noise suppression, and wireless charging case.",
    price: 3799,
    category: "Audio",
    image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=1200&q=80"
    ],
    stock: 0,
    rating: 4.8,
    reviewsCount: 172,
    specs: {
      "Earbud Weight": "4.1 grams each",
      "Total Playtime": "32 hours with wireless case",
      "Codec Support": "AAC, SBC, aptX Adaptive",
      "Microphones": "6-mic array with neural noise reduction",
      "Water Resistance": "IPX5 sweat & rain resistant"
    },
    highlights: [
      "Qi-certified wireless charging pod",
      "Transparency audio pass-through mode",
      "Touch sensor gestures with haptic feedback",
      "10-minute fast charge yields 2 hours playtime"
    ]
  },
  {
    id: "prod-010",
    name: "Arc Magnetic Phone Stand",
    tagline: "Fold-flat CNC MagSafe stand for desk & bedside.",
    description: "Fold-flat magnetic phone dock precision-milled from aluminum alloy. Houses a strong N52 neodymium magnetic array for solid portrait and landscape positioning with cable management.",
    price: 799,
    category: "Mobile Essentials",
    image: "https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=1200&q=80"
    ],
    stock: 36,
    newArrival: true,
    rating: 4.9,
    reviewsCount: 220,
    specs: {
      "Magnets": "32x N52 Neodymium rare-earth array",
      "Adjustment": "Dual-hinge 180° tilt and 360° rotation",
      "Folded Thickness": "8 mm ultra-slim",
      "Base Weight": "145 grams for stable one-hand detachment",
      "Compatibility": "MagSafe iPhones and magnetic cases"
    },
    highlights: [
      "Solid one-handed attach and release",
      "Folds completely flat for travel",
      "Supports iOS StandBy mode seamlessly",
      "Silicone protective backpad prevents scratches"
    ]
  }
];

const SAMPLE_ORDERS = [
  {
    id: "ord-demo-1001",
    createdAt: "2026-10-12T09:20:00.000Z",
    status: "Confirmed",
    customer: { name: "Aarav Sharma", email: "aarav@example.com", city: "Bengaluru" },
    total: 11498,
    items: [
      { productId: "prod-001", quantity: 1 },
      { productId: "prod-003", quantity: 1 }
    ]
  },
  {
    id: "ord-demo-1002",
    createdAt: "2026-10-16T14:05:00.000Z",
    status: "Dispatched",
    customer: { name: "Ananya Iyer", email: "ananya@example.com", city: "Mumbai" },
    total: 6499,
    items: [
      { productId: "prod-002", quantity: 1 }
    ]
  }
];

const PROMO_CODES = {
  "CLOUDCART10": { discountPercent: 10, label: "10% VIP Launch Discount" },
  "FUTURE20": { discountPercent: 20, label: "20% Studio Collector Discount" },
  "EDGE500": { discountAmount: 500, label: "₹500 Edge Welcome Credit" }
};

const DemoStore = {
  read(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;
      return JSON.parse(raw);
    } catch {
      return fallback;
    }
  },
  write(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  },
  getProducts() {
    const stored = this.read(CONFIG.storage.products, null);
    if (Array.isArray(stored) && stored.length) {
      return stored.map(normalizeProduct).filter(Boolean);
    }
    this.write(CONFIG.storage.products, SAMPLE_PRODUCTS);
    return SAMPLE_PRODUCTS.map((p) => ({ ...p }));
  },
  setProducts(list) {
    this.write(CONFIG.storage.products, list);
  },
  getOrders() {
    const stored = this.read(CONFIG.storage.orders, null);
    if (Array.isArray(stored) && stored.length) return stored;
    this.write(CONFIG.storage.orders, SAMPLE_ORDERS);
    return SAMPLE_ORDERS.map((o) => ({ ...o, items: o.items.map((i) => ({ ...i })) }));
  },
  setOrders(list) {
    this.write(CONFIG.storage.orders, list);
  },
  resetDemoData() {
    this.write(CONFIG.storage.products, SAMPLE_PRODUCTS);
    this.write(CONFIG.storage.orders, SAMPLE_ORDERS);
    return { products: SAMPLE_PRODUCTS, orders: SAMPLE_ORDERS };
  }
};

function normalizeProduct(raw) {
  if (!raw || typeof raw !== "object") return null;
  const id = String(raw.id || "").trim();
  const name = String(raw.name || "").trim();
  const price = Number(raw.price);
  if (!id || !name || !Number.isFinite(price) || price < 0) return null;
  const previousPrice = Number(raw.previousPrice);
  const stock = Number(raw.stock);

  // Fallback specs generator if backend or custom object doesn't have detailed specs
  const defaultSpecs = {
    "Material": "Anodized Aerospace Aluminum",
    "Connectivity": "USB-C / Wireless Low Latency",
    "Warranty": "2-Year Studio Limited Warranty",
    "Origin": "Designed in CloudCart Studio"
  };

  const sampleMatch = SAMPLE_PRODUCTS.find((p) => p.id === id);

  return {
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
    specs: (raw.specs && Object.keys(raw.specs).length) ? raw.specs : (sampleMatch?.specs || defaultSpecs),
    highlights: (Array.isArray(raw.highlights) && raw.highlights.length) ? raw.highlights : (sampleMatch?.highlights || [
      "Precision engineered with premium tactile feedback",
      "Minimalist footprint tailored for modern desk spaces",
      "Instant compatibility across macOS, Windows and mobile"
    ])
  };
}
