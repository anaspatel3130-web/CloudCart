/**
 * CloudCart catalogue — centralized demo products and image URLs.
 * Synchronized with backend/scripts/seed-data.json (60 realistic hardware items).
 */
const SAMPLE_PRODUCTS = [
  {
    "id": "prod-001",
    "name": "Aether Wireless Headphones",
    "tagline": "Studio acoustics. Uncompromising silence.",
    "description": "Closed-back wireless headphones engineered with custom 40mm bio-cellulose drivers, active acoustic noise cancellation, and up to 40 hours of continuous high-fidelity playback.",
    "price": 8999,
    "previousPrice": 10999,
    "category": "Audio",
    "image": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80",
    "gallery": [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1200&q=80"
    ],
    "stock": 14,
    "featured": true,
    "newArrival": true,
    "rating": 4.9,
    "reviewsCount": 148,
    "demandScore": "High Demand \u00b7 18 ordered in last 24h",
    "specs": {
      "Frequency Response": "10Hz \u2013 40,000Hz",
      "Battery Life": "40 hours (ANC on)",
      "Connectivity": "Bluetooth 5.3, USB-C Lossless Audio",
      "Materials": "Anodized aluminum, Memory foam, Vegan leather",
      "Weight": "248 grams"
    },
    "highlights": [
      "Adaptive Hybrid Active Noise Cancellation",
      "Lossless 24-bit/96kHz wired audio over USB-C",
      "Ultra-low latency gaming and media mode",
      "Multipoint pairing for two devices simultaneously"
    ],
    "reviews": [
      {
        "author": "Vikram N.",
        "rating": 5,
        "title": "Acoustic clarity is breathtaking",
        "date": "14 Oct 2026",
        "verified": true,
        "comment": "The bio-cellulose drivers deliver tight sub-bass without masking mid vocals. The tactile knurled volume dial feels incredible."
      },
      {
        "author": "Maya S.",
        "rating": 5,
        "title": "40hr battery is genuine",
        "date": "08 Oct 2026",
        "verified": true,
        "comment": "I flew from Delhi to London and back on a single charge with ANC enabled throughout. Absolute studio craft."
      }
    ]
  },
  {
    "id": "prod-002",
    "name": "Pulse Portable Speaker",
    "tagline": "Deep omnidirectional acoustics. IPX7 waterproof.",
    "description": "Travel-ready speaker engineered with dual passive radiators and balanced 360-degree sound. Wrapped in custom acoustic mesh with a durable silicone bumper for adventure and studio use alike.",
    "price": 4199,
    "previousPrice": 4999,
    "category": "Audio",
    "image": "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=1200&q=80",
    "gallery": [
      "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=1200&q=80"
    ],
    "stock": 5,
    "featured": true,
    "newArrival": true,
    "rating": 4.9,
    "reviewsCount": 203,
    "demandScore": "Trending \u00b7 Only 5 left in stock",
    "specs": {
      "Power Output": "30W RMS with DSP equalization",
      "Battery Playtime": "24 hours at moderate volume",
      "Water Resistance": "IPX7 submersible up to 1 meter",
      "Wireless Range": "Up to 30 meters (Bluetooth 5.3)",
      "Charging": "Fast USB-C (2.5 hrs to 100%)"
    },
    "highlights": [
      "Stereo party sync to link 2+ Pulse units",
      "Engineered passive radiators for deep sub-bass",
      "Built-in beamforming mic for crystal clear calls",
      "Tactile knurled volume wheel"
    ],
    "reviews": [
      {
        "author": "Arun K.",
        "rating": 5,
        "title": "Room-filling punch in a compact cylinder",
        "date": "18 Oct 2026",
        "verified": true,
        "comment": "Deep sound signature that does not distort at maximum output. Solid build quality."
      }
    ]
  },
  {
    "id": "prod-003",
    "name": "Nimbus True Wireless Earbuds",
    "tagline": "Featherlight fit with bespoke titanium drivers.",
    "description": "True wireless earbuds weighing just 4.1 grams per bud, packed with 11mm custom dynamic drivers, intelligent noise suppression, and wireless charging case.",
    "price": 3799,
    "previousPrice": 4499,
    "category": "Audio",
    "image": "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=1200&q=80",
    "gallery": [
      "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=1200&q=80"
    ],
    "stock": 18,
    "featured": false,
    "newArrival": false,
    "rating": 4.8,
    "reviewsCount": 172,
    "demandScore": "Popular daily carry",
    "specs": {
      "Earbud Weight": "4.1 grams each",
      "Total Playtime": "32 hours with wireless case",
      "Codec Support": "AAC, SBC, aptX Adaptive",
      "Microphones": "6-mic array with neural noise reduction",
      "Water Resistance": "IPX5 sweat & rain resistant"
    },
    "highlights": [
      "Qi-certified wireless charging pod",
      "Transparency audio pass-through mode",
      "Touch sensor gestures with haptic feedback",
      "10-minute fast charge yields 2 hours playtime"
    ]
  },
  {
    "id": "prod-004",
    "name": "Apex Studio Reference Monitors",
    "tagline": "Bi-amplified acoustic desktop fidelity.",
    "description": "Pair of active nearfield studio monitors featuring woven Kevlar woofers, silk dome tweeters, and balanced TRS inputs for uncolored audio reproduction.",
    "price": 18999,
    "previousPrice": 21999,
    "category": "Audio",
    "image": "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=1200&q=80",
    "gallery": [
      "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=1200&q=80"
    ],
    "stock": 7,
    "featured": true,
    "newArrival": false,
    "rating": 4.9,
    "reviewsCount": 64,
    "demandScore": "Studio choice",
    "specs": {
      "Frequency Range": "45Hz \u2013 22,000Hz",
      "Amplification": "70W Class-D Bi-amp",
      "Drivers": "5\" Woven Kevlar LF, 1\" Silk Dome HF",
      "Inputs": "Balanced XLR, 1/4\" TRS, RCA Unbalanced"
    },
    "highlights": [
      "Acoustic space tuning boundary switches",
      "Low-resonance MDF wooden cabinetry",
      "Zero-hum toroidal shielding"
    ]
  },
  {
    "id": "prod-005",
    "name": "Vocalis Broadcast Condenser Mic",
    "tagline": "24-bit 192kHz cardioid capsule for creators.",
    "description": "Studio-grade cardioid condenser microphone with internal pop filter, zero-latency headphone monitoring, and integrated zinc shock mount.",
    "price": 7499,
    "previousPrice": 8999,
    "category": "Audio",
    "image": "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=1200&q=80",
    "gallery": [
      "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=1200&q=80"
    ],
    "stock": 11,
    "featured": false,
    "newArrival": true,
    "rating": 4.8,
    "reviewsCount": 88,
    "demandScore": "Creator essential",
    "specs": {
      "Polar Pattern": "Cardioid",
      "Sample Rate": "24-bit / 192kHz",
      "Connectivity": "USB-C and XLR dual output",
      "Chassis": "Matte Black Die-Cast Zinc"
    },
    "highlights": [
      "Zero-latency hardware headphone monitoring",
      "Touch-capacitive mute button with LED halo",
      "Internal multi-stage pop mesh"
    ]
  },
  {
    "id": "prod-006",
    "name": "Resonance Desktop Subwoofer",
    "tagline": "150W downward-firing sealed sub-bass.",
    "description": "Compact sealed subwoofer engineered to deliver tight, musical low frequencies down to 28Hz without port turbulence or desk vibration.",
    "price": 14499,
    "previousPrice": 16999,
    "category": "Audio",
    "image": "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=1200&q=80",
    "gallery": [
      "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=1200&q=80"
    ],
    "stock": 4,
    "featured": false,
    "newArrival": false,
    "rating": 4.7,
    "reviewsCount": 42,
    "demandScore": "Low stock alert",
    "specs": {
      "Driver": "8\" Long-throw composite cone",
      "Power": "150W RMS continuous",
      "Crossover": "Variable 40Hz \u2013 160Hz",
      "Enclosure": "Sealed acoustic suspension"
    },
    "highlights": [
      "Downward firing for omnidirectional room loading",
      "Sorbothane acoustic isolation feet included"
    ]
  },
  {
    "id": "prod-007",
    "name": "AudioPure Hi-Res Desktop DAC",
    "tagline": "Dual ESS Sabre D/A with MQA rendering.",
    "description": "Audiophile digital-to-analog converter and high-output headphone amplifier. Drives planar and high-impedance headphones with pristine transparency.",
    "price": 11299,
    "previousPrice": 12999,
    "category": "Audio",
    "image": "https://images.unsplash.com/photo-1558089687-f282ffcbc126?auto=format&fit=crop&w=1200&q=80",
    "gallery": [
      "https://images.unsplash.com/photo-1558089687-f282ffcbc126?auto=format&fit=crop&w=1200&q=80"
    ],
    "stock": 9,
    "featured": false,
    "newArrival": true,
    "rating": 4.9,
    "reviewsCount": 55,
    "demandScore": "Audiophile pick",
    "specs": {
      "DAC Chip": "Dual ESS ES9038Q2M",
      "Decoding": "PCM 32-bit/768kHz, Native DSD512",
      "Outputs": "4.4mm Balanced, 6.35mm Single-ended, RCA line out",
      "THD+N": "0.00015%"
    },
    "highlights": [
      "High gain switch for 600 ohm headphones",
      "Machined aluminium chassis with OLED sample rate display"
    ]
  },
  {
    "id": "prod-008",
    "name": "Echo ANC Earphones (Wired)",
    "tagline": "Zero-latency USB-C in-ear audiophile monitors.",
    "description": "Precision CNC aluminum in-ear monitors equipped with dual balanced armature drivers and a 10mm dynamic woofer for mastering on the move.",
    "price": 2999,
    "previousPrice": 3499,
    "category": "Audio",
    "image": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80",
    "gallery": [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80"
    ],
    "stock": 26,
    "featured": false,
    "newArrival": false,
    "rating": 4.6,
    "reviewsCount": 119,
    "demandScore": "Budget essential",
    "specs": {
      "Configuration": "1 Dynamic + 2 Balanced Armature",
      "Cable": "Silver-plated oxygen-free copper, MMCX detachable",
      "Sensitivity": "108dB/mW"
    },
    "highlights": [
      "MMCX detachable cable for longevity",
      "Comply memory foam tips included"
    ]
  },
  {
    "id": "prod-009",
    "name": "Beamforming Conference Soundbar",
    "tagline": "Acoustic clarity for video meetings & media.",
    "description": "Compact desktop soundbar engineered for crystal-clear voice reproduction, acoustic stereo separation, and background noise canceling microphones.",
    "price": 5499,
    "previousPrice": 6299,
    "category": "Audio",
    "image": "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=1200&q=80",
    "gallery": [
      "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=1200&q=80"
    ],
    "stock": 13,
    "featured": false,
    "newArrival": false,
    "rating": 4.7,
    "reviewsCount": 73,
    "demandScore": "Remote work favorite",
    "specs": {
      "Output": "40W Peak Stereo",
      "Microphones": "4-array beamforming with noise cancellation",
      "Connectivity": "USB-C, Bluetooth 5.2, Optical"
    },
    "highlights": [
      "Fits neatly under any monitor",
      "One-touch hardware mic mute button"
    ]
  },
  {
    "id": "prod-010",
    "name": "Acoustic Wall Panels (Set of 6)",
    "tagline": "Hexagonal high-density sound dampeners.",
    "description": "Sculpted PET felt acoustic dampening panels designed to reduce echo and reflections in home recording studios and offices.",
    "price": 2499,
    "previousPrice": 2999,
    "category": "Audio",
    "image": "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?auto=format&fit=crop&w=1200&q=80",
    "gallery": [
      "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?auto=format&fit=crop&w=1200&q=80"
    ],
    "stock": 31,
    "featured": false,
    "newArrival": true,
    "rating": 4.8,
    "reviewsCount": 94,
    "demandScore": "Studio acoustic favorite",
    "specs": {
      "Dimensions": "30 x 26 x 1 cm per hexagon",
      "Material": "100% Recycled polyester fiber",
      "Mounting": "Damage-free 3M adhesive backing"
    },
    "highlights": [
      "NRC 0.90 sound absorption rating",
      "Flame retardant and non-toxic"
    ]
  },
  {
    "id": "prod-011",
    "name": "Graphite Mechanical Keyboard",
    "tagline": "Precision tactile switches in CNC aluminum.",
    "description": "A compact 75% layout keyboard crafted from CNC-machined aerospace aluminum, featuring pre-lubricated hot-swappable switches, sound-dampening gasket mount, and per-key RGB backlighting.",
    "price": 6499,
    "previousPrice": null,
    "category": "Desk Setup",
    "image": "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?auto=format&fit=crop&w=1200&q=80",
    "gallery": [
      "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1200&q=80"
    ],
    "stock": 3,
    "featured": true,
    "newArrival": true,
    "rating": 4.8,
    "reviewsCount": 94,
    "demandScore": "Selling fast \u00b7 Only 3 left",
    "specs": {
      "Layout": "75% ANSI (84 keys)",
      "Switches": "Hot-swappable linear mechanical",
      "Connectivity": "2.4GHz Wireless, Bluetooth 5.1, USB-C",
      "Battery": "4,000 mAh (up to 200 hours without backlight)",
      "Chassis": "6063 Anodized CNC Aluminum"
    },
    "highlights": [
      "Triple-gasket acoustic dampening system",
      "Double-shot PBT keycaps resistant to shine",
      "Seamless Mac and Windows OS switching",
      "Programmable VIA/QMK firmware support"
    ]
  },
  {
    "id": "prod-012",
    "name": "Lift Laptop Stand",
    "tagline": "Ergonomic elevation with passive heat dissipation.",
    "description": "One-piece folded aerospace aluminum laptop stand designed to elevate your screen by 6 inches for optimal cervical spine alignment and enhanced cooling airflow.",
    "price": 1999,
    "previousPrice": 2499,
    "category": "Desk Setup",
    "image": "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=1200&q=80",
    "gallery": [
      "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=1200&q=80"
    ],
    "stock": 27,
    "featured": false,
    "newArrival": false,
    "rating": 4.8,
    "reviewsCount": 154,
    "demandScore": "Desk bestseller",
    "specs": {
      "Material": "Solid 4mm Sandblasted Aluminum",
      "Elevation": "15 cm (6 inches) angle",
      "Compatibility": "All 11\" to 17\" laptops",
      "Protection": "Non-slip silicone contact pads"
    },
    "highlights": [
      "Improves cooling airflow significantly",
      "Rear cable pass-through port",
      "Keyboard tucks underneath"
    ]
  },
  {
    "id": "prod-013",
    "name": "Monolith Dual-Monitor Riser",
    "tagline": "Solid walnut shelf with integrated aluminum tray.",
    "description": "Engineered walnut hardwood monitor riser sized to support dual 27-inch displays or an ultrawide setup. Built-in aluminum accessory tray for pens and devices.",
    "price": 4999,
    "previousPrice": 5999,
    "category": "Desk Setup",
    "image": "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?auto=format&fit=crop&w=1200&q=80",
    "gallery": [
      "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?auto=format&fit=crop&w=1200&q=80"
    ],
    "stock": 8,
    "featured": true,
    "newArrival": false,
    "rating": 4.9,
    "reviewsCount": 78,
    "demandScore": "Executive workspace pick",
    "specs": {
      "Length": "115 cm (45 inches)",
      "Depth": "23 cm",
      "Weight Capacity": "Up to 50 kg",
      "Finish": "Hand-rubbed natural oil walnut"
    },
    "highlights": [
      "Supports dual 27\" screens or 49\" ultrawide",
      "Frees up 60% of desk surface space underneath"
    ]
  },
  {
    "id": "prod-014",
    "name": "Merino Wool Felt Desk Mat",
    "tagline": "Non-scratch tactile wool pad with cork backing.",
    "description": "Natural merino wool felt desk pad offering plush wrist comfort, silent keyboard acoustics, and organic desk warmth. Backed with high-grip natural cork.",
    "price": 1699,
    "previousPrice": 1999,
    "category": "Desk Setup",
    "image": "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=1200&q=80",
    "gallery": [
      "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=1200&q=80"
    ],
    "stock": 35,
    "featured": false,
    "newArrival": true,
    "rating": 4.7,
    "reviewsCount": 110,
    "demandScore": "Tactile favorite",
    "specs": {
      "Dimensions": "90 x 40 cm (Extended)",
      "Thickness": "4 mm dual layer",
      "Material": "Natural Wool Felt + Portuguese Cork"
    },
    "highlights": [
      "Natural sound dampening for mechanical keyboards",
      "Water-resistant treated fiber"
    ]
  },
  {
    "id": "prod-015",
    "name": "Kevlar Under-Desk Cable Raceway",
    "tagline": "Concealed high-capacity cable management tray.",
    "description": "Sturdy steel mesh raceway that mounts cleanly underneath any desk without drilling, holding heavy power strips and brick adapters out of sight.",
    "price": 1299,
    "previousPrice": 1599,
    "category": "Desk Setup",
    "image": "https://images.unsplash.com/photo-1618384887929-16ec33cad9ea?auto=format&fit=crop&w=1200&q=80",
    "gallery": [
      "https://images.unsplash.com/photo-1618384887929-16ec33cad9ea?auto=format&fit=crop&w=1200&q=80"
    ],
    "stock": 29,
    "featured": false,
    "newArrival": false,
    "rating": 4.8,
    "reviewsCount": 85,
    "demandScore": "Clean desk essential",
    "specs": {
      "Length": "43 cm",
      "Mounting": "Heavy duty C-clamp (zero drilling)",
      "Capacity": "Up to 8 kg of cabling"
    },
    "highlights": [
      "Fits desks from 1cm to 5cm thick",
      "Includes 10x reusable hook-and-loop ties"
    ]
  },
  {
    "id": "prod-016",
    "name": "Apex Gas-Spring Monitor Arm",
    "tagline": "Counterbalanced fluid arm for screens up to 34\".",
    "description": "Heavy-duty gas spring articulating monitor mount with integrated cable channels and smooth 360-degree rotation for portrait and landscape workflows.",
    "price": 3899,
    "previousPrice": 4699,
    "category": "Desk Setup",
    "image": "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=1200&q=80",
    "gallery": [
      "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=1200&q=80"
    ],
    "stock": 16,
    "featured": false,
    "newArrival": false,
    "rating": 4.9,
    "reviewsCount": 98,
    "demandScore": "Ergonomic essential",
    "specs": {
      "Screen Compatibility": "17\" to 34\" (VESA 75x75, 100x100)",
      "Load Capacity": "Up to 9 kg",
      "Adjustment": "Tilt +90\u00b0/-45\u00b0, Swivel 180\u00b0, Rotation 360\u00b0"
    },
    "highlights": [
      "Finger-touch fluid height adjustment",
      "Desk clamp and grommet mounting both included"
    ]
  },
  {
    "id": "prod-017",
    "name": "Veloce 60% Compact Keyboard",
    "tagline": "Minimalist tournament-grade layout.",
    "description": "Ultra-compact 60% layout mechanical keyboard with customized linear switches, factory sound foam, and detachable braided USB-C cable.",
    "price": 4999,
    "previousPrice": 5799,
    "category": "Desk Setup",
    "image": "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1200&q=80",
    "gallery": [
      "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1200&q=80"
    ],
    "stock": 12,
    "featured": false,
    "newArrival": true,
    "rating": 4.7,
    "reviewsCount": 63,
    "demandScore": "Nomadic coder pick",
    "specs": {
      "Layout": "60% ANSI (61 keys)",
      "Switches": "Pre-lubed Red linear",
      "Keycaps": "PBT OEM profile"
    },
    "highlights": [
      "Frees up mouse sweep area",
      "Onboard macro recording"
    ]
  },
  {
    "id": "prod-018",
    "name": "Alloy Desktop Headphone Stand",
    "tagline": "Balanced cradle with integrated cable organizer.",
    "description": "Sculpted weighted aluminum stand that cradles any headband without creasing the leather or stretching tension.",
    "price": 1499,
    "previousPrice": 1899,
    "category": "Desk Setup",
    "image": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80",
    "gallery": [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80"
    ],
    "stock": 22,
    "featured": false,
    "newArrival": false,
    "rating": 4.8,
    "reviewsCount": 114,
    "demandScore": "Desk organizer",
    "specs": {
      "Base Weight": "320g non-tip weighted base",
      "Height": "26 cm",
      "Material": "Anodized space graphite aluminum"
    },
    "highlights": [
      "Non-slip silicone footpad",
      "Curved silicone head rest protects headband"
    ]
  },
  {
    "id": "prod-019",
    "name": "Dual-Device Vertical Laptop Stand",
    "tagline": "Clamshell cradle for MacBook and iPad.",
    "description": "Adjustable width CNC aluminum vertical stand that docks two laptops or tablets upright to save desk real estate and improve clamshell airflow.",
    "price": 1899,
    "previousPrice": 2299,
    "category": "Desk Setup",
    "image": "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=1200&q=80",
    "gallery": [
      "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=1200&q=80"
    ],
    "stock": 19,
    "featured": false,
    "newArrival": false,
    "rating": 4.9,
    "reviewsCount": 82,
    "demandScore": "Space saver pick",
    "specs": {
      "Slots": "2x Adjustable bays (14mm to 42mm)",
      "Chassis": "Solid sandblasted aluminum",
      "Protection": "Internal silicone lining"
    },
    "highlights": [
      "Keeps desk completely clear in monitor-docked mode",
      "Heavy anti-tip base"
    ]
  },
  {
    "id": "prod-020",
    "name": "Titanium Desk Pegboard System",
    "tagline": "Modular vertical organization with 8 attachments.",
    "description": "Heavy-gauge steel pegboard that clamps to the back or side of any desk. Includes headphone hooks, controller mounts, and stationary trays.",
    "price": 3499,
    "previousPrice": 3999,
    "category": "Desk Setup",
    "image": "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?auto=format&fit=crop&w=1200&q=80",
    "gallery": [
      "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?auto=format&fit=crop&w=1200&q=80"
    ],
    "stock": 10,
    "featured": false,
    "newArrival": true,
    "rating": 4.8,
    "reviewsCount": 47,
    "demandScore": "Modular desk pick",
    "specs": {
      "Dimensions": "52 x 42 cm panel",
      "Included Accessories": "2x Hooks, 1x Shelf tray, 2x Cable clips, 1x Cup holder",
      "Finish": "Powder coated matte graphite"
    },
    "highlights": [
      "Clamp mounted with zero drilling",
      "Keeps gadgets off desk surface"
    ]
  },
  {
    "id": "prod-021",
    "name": "Precision Wireless Mouse",
    "tagline": "Low-latency sensor with 26,000 DPI optics.",
    "description": "Sculpted for all-day desk endurance with near-silent optical-mechanical microswitches, an ultra-precise 26,000 DPI optical sensor, and machined magnetic scroll wheel.",
    "price": 2499,
    "previousPrice": 2999,
    "category": "Accessories",
    "image": "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=1200&q=80",
    "gallery": [
      "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=1200&q=80"
    ],
    "stock": 22,
    "featured": true,
    "newArrival": false,
    "rating": 4.7,
    "reviewsCount": 112,
    "demandScore": "Top rated peripheral",
    "specs": {
      "Sensor": "PixArt 26K Optical Sensor",
      "Tracking Speed": "650 IPS / 50G Acceleration",
      "Battery Life": "Up to 70 days on a single USB-C charge",
      "Weight": "63 grams ultra-lightweight"
    },
    "highlights": [
      "Dual-mode SmartScroll magnetic wheel",
      "PTFE glide feet for frictionless motion",
      "Silent microswitches"
    ]
  },
  {
    "id": "prod-022",
    "name": "Orbit USB-C Hub",
    "tagline": "7-in-1 high-speed expansion in forged unibody.",
    "description": "Seven-port aluminium expansion hub supporting dual 4K displays at 60Hz, 100W Power Delivery pass-through, and 10Gbps USB 3.2 data transfer over a single woven cable.",
    "price": 3299,
    "previousPrice": 3799,
    "category": "Accessories",
    "image": "https://images.unsplash.com/photo-1618384887929-16ec33cad9ea?auto=format&fit=crop&w=1200&q=80",
    "gallery": [
      "https://images.unsplash.com/photo-1618384887929-16ec33cad9ea?auto=format&fit=crop&w=1200&q=80"
    ],
    "stock": 18,
    "featured": true,
    "newArrival": false,
    "rating": 4.8,
    "reviewsCount": 86,
    "demandScore": "Must-have dock",
    "specs": {
      "Ports": "2x HDMI 4K@60Hz, 2x USB-C 10Gbps, 2x USB-A 3.2, 1x PD 100W",
      "Power Delivery": "100W Pass-Through Charging",
      "Cable": "Braided Kevlar reinforced 20cm"
    },
    "highlights": [
      "Simultaneous dual 4K monitor support",
      "Zero-throttling thermal dissipation vents"
    ]
  },
  {
    "id": "prod-023",
    "name": "Chronos Macro Rotary Controller",
    "tagline": "Custom aluminum dial for scrub & zoom.",
    "description": "Tactile CNC aluminum knob with 3 programmable macro switches for timeline scrubbing, brush sizing, volume stepped adjustments, and code navigation.",
    "price": 2899,
    "previousPrice": 3299,
    "category": "Accessories",
    "image": "https://images.unsplash.com/photo-1558089687-f282ffcbc126?auto=format&fit=crop&w=1200&q=80",
    "gallery": [
      "https://images.unsplash.com/photo-1558089687-f282ffcbc126?auto=format&fit=crop&w=1200&q=80"
    ],
    "stock": 15,
    "featured": false,
    "newArrival": true,
    "rating": 4.9,
    "reviewsCount": 51,
    "demandScore": "Designer favorite",
    "specs": {
      "Encoder": "64-step optical encoder with push button",
      "Switches": "3x Low profile mechanical Kailh",
      "Connectivity": "USB-C detachable"
    },
    "highlights": [
      "Works natively in Final Cut, Photoshop & Premiere",
      "Fully programmable via VIA browser configurator"
    ]
  },
  {
    "id": "prod-024",
    "name": "Precision Glass Gaming Mousepad",
    "tagline": "Aluminosilicate micro-etched glass surface.",
    "description": "Ultra-fast tempered glass mouse surface designed for instantaneous micro-adjustments and zero surface wear over years of daily use.",
    "price": 3499,
    "previousPrice": 3999,
    "category": "Accessories",
    "image": "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=1200&q=80",
    "gallery": [
      "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=1200&q=80"
    ],
    "stock": 11,
    "featured": false,
    "newArrival": false,
    "rating": 4.8,
    "reviewsCount": 49,
    "demandScore": "Precision surface",
    "specs": {
      "Dimensions": "45 x 40 cm",
      "Material": "Chemically hardened tempered glass",
      "Base": "Full-coverage molded natural rubber"
    },
    "highlights": [
      "Never wears out or collects humidity",
      "Beveled safety edges"
    ]
  },
  {
    "id": "prod-025",
    "name": "Thunderbolt 4 Pro Docking Station",
    "tagline": "40Gbps bandwidth with 96W upstream charging.",
    "description": "Enterprise-grade 14-port Thunderbolt 4 hub capable of driving 8K displays or dual 4K at 120Hz while charging laptops at full wattage.",
    "price": 16999,
    "previousPrice": 19999,
    "category": "Accessories",
    "image": "https://images.unsplash.com/photo-1618384887929-16ec33cad9ea?auto=format&fit=crop&w=1200&q=80",
    "gallery": [
      "https://images.unsplash.com/photo-1618384887929-16ec33cad9ea?auto=format&fit=crop&w=1200&q=80"
    ],
    "stock": 6,
    "featured": true,
    "newArrival": false,
    "rating": 4.9,
    "reviewsCount": 38,
    "demandScore": "Pro workstation dock",
    "specs": {
      "Bandwidth": "40Gbps Thunderbolt 4",
      "Power Delivery": "96W Host charging",
      "Ports": "3x TB4, 4x USB-A 10Gbps, 1x 2.5G Ethernet, 1x SD 4.0, DisplayPort 1.4"
    },
    "highlights": [
      "Certified Apple Silicon and Intel Evo compatibility",
      "Daisy-chain up to 5 additional devices"
    ]
  },
  {
    "id": "prod-026",
    "name": "Tactile Glass Wireless Trackpad",
    "tagline": "Haptic feedback with multi-touch gesture support.",
    "description": "Spacious glass touch surface that registers full macOS and Windows precision gestures with customizable haptic tap response.",
    "price": 4299,
    "previousPrice": 4999,
    "category": "Accessories",
    "image": "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=1200&q=80",
    "gallery": [
      "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=1200&q=80"
    ],
    "stock": 14,
    "featured": false,
    "newArrival": true,
    "rating": 4.7,
    "reviewsCount": 67,
    "demandScore": "Ergonomic alternative",
    "specs": {
      "Surface": "Silky matte frosted glass",
      "Battery": "Up to 60 days per charge",
      "Connectivity": "Bluetooth + 2.4GHz + Wired USB-C"
    },
    "highlights": [
      "Full fluid gesture support",
      "Eliminates wrist pronation fatigue"
    ]
  },
  {
    "id": "prod-027",
    "name": "Compact SD / MicroSD UHS-II Reader",
    "tagline": "312 MB/s burst data transfer for photographers.",
    "description": "Aircraft aluminum high-speed card reader capable of reading high-bitrate RAW photos and 4K cinema footage without thermal throttling.",
    "price": 1499,
    "previousPrice": 1799,
    "category": "Accessories",
    "image": "https://images.unsplash.com/photo-1618384887929-16ec33cad9ea?auto=format&fit=crop&w=1200&q=80",
    "gallery": [
      "https://images.unsplash.com/photo-1618384887929-16ec33cad9ea?auto=format&fit=crop&w=1200&q=80"
    ],
    "stock": 28,
    "featured": false,
    "newArrival": false,
    "rating": 4.8,
    "reviewsCount": 92,
    "demandScore": "Creator staple",
    "specs": {
      "Speeds": "Up to 312 MB/s read and write",
      "Slots": "1x SD UHS-II, 1x MicroSD UHS-II",
      "Connector": "Reversible USB-C"
    },
    "highlights": [
      "Simultaneous dual-card read and copy",
      "Anodized heat sink body"
    ]
  },
  {
    "id": "prod-028",
    "name": "Coiled Aviator Keyboard Cable",
    "tagline": "Double-sleeved Paracord with GX16 connector.",
    "description": "Handmade aesthetic coiled keyboard cable featuring PET techflex sleeve, zinc aviator quick-release junction, and gold-plated USB-C plugs.",
    "price": 1899,
    "previousPrice": 2299,
    "category": "Accessories",
    "image": "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1200&q=80",
    "gallery": [
      "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1200&q=80"
    ],
    "stock": 17,
    "featured": false,
    "newArrival": false,
    "rating": 4.8,
    "reviewsCount": 79,
    "demandScore": "Desk styling pick",
    "specs": {
      "Length": "1.5m straight + 15cm tight coil",
      "Connector": "GX16 5-Pin Aviator",
      "Shielding": "Triple-layer interference isolation"
    },
    "highlights": [
      "Tight coil retains shape permanently",
      "Universal Type-C compatibility"
    ]
  },
  {
    "id": "prod-029",
    "name": "Magnetic Stream Deck Keypad (9-Key)",
    "tagline": "Customizable LCD micro-switches for studio shortcuts.",
    "description": "Nine-key programmable macro keypad with miniature LCD screen icons. Triggers apps, streams, automations, and audio mixing with a single press.",
    "price": 6499,
    "previousPrice": 7299,
    "category": "Accessories",
    "image": "https://images.unsplash.com/photo-1558089687-f282ffcbc126?auto=format&fit=crop&w=1200&q=80",
    "gallery": [
      "https://images.unsplash.com/photo-1558089687-f282ffcbc126?auto=format&fit=crop&w=1200&q=80"
    ],
    "stock": 8,
    "featured": true,
    "newArrival": true,
    "rating": 4.9,
    "reviewsCount": 44,
    "demandScore": "Automation favorite",
    "specs": {
      "Keys": "9x Custom LCD micro-keys",
      "Software": "Cross-platform Mac & Windows",
      "Stand": "Magnetic 45-degree angle stand"
    },
    "highlights": [
      "Instant feedback icon displays",
      "Integrates with OBS, Spotify, VS Code"
    ]
  },
  {
    "id": "prod-030",
    "name": "Anti-Static Tech Cleaning Kit",
    "tagline": "Precision brushes, air blower & microfiber cloth.",
    "description": "Essential maintenance toolkit with keycap puller, sensor cleaning swabs, optical anti-static lens solution, and soft boar-hair detailing brush.",
    "price": 799,
    "previousPrice": 999,
    "category": "Accessories",
    "image": "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=1200&q=80",
    "gallery": [
      "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=1200&q=80"
    ],
    "stock": 45,
    "featured": false,
    "newArrival": false,
    "rating": 4.7,
    "reviewsCount": 130,
    "demandScore": "Essential add-on",
    "specs": {
      "Pieces": "8-in-1 complete cleaning bundle",
      "Safe On": "Keyboards, camera lenses, monitor glass, earbuds"
    },
    "highlights": [
      "Alcohol-free streakless spray formula",
      "Fits neatly in desk drawer"
    ]
  },
  {
    "id": "prod-031",
    "name": "Charge Compact Power Bank (10k)",
    "tagline": "10,000 mAh pocket capacity with 30W Power Delivery.",
    "description": "Ultra-dense pocket power bank clad in scratch-resistant anodized aluminum. Charges modern smartphones to 50% in under 25 minutes with intelligent thermal regulation.",
    "price": 1499,
    "previousPrice": 1899,
    "category": "Mobile Essentials",
    "image": "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?auto=format&fit=crop&w=1200&q=80",
    "gallery": [
      "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?auto=format&fit=crop&w=1200&q=80"
    ],
    "stock": 4,
    "featured": true,
    "newArrival": false,
    "rating": 4.7,
    "reviewsCount": 89,
    "demandScore": "Low stock \u00b7 Only 4 units left",
    "specs": {
      "Capacity": "10,000 mAh / 37Wh (Flight Approved)",
      "Output Ports": "1x USB-C (30W PD), 1x USB-A (22.5W QC)",
      "Dimensions": "105 x 62 x 15 mm",
      "Weight": "180 grams"
    },
    "highlights": [
      "30W fast charge for phones & tablets",
      "Micro-dot LED power indicator"
    ]
  },
  {
    "id": "prod-032",
    "name": "Arc Magnetic Phone Stand",
    "tagline": "Fold-flat CNC MagSafe stand for desk & bedside.",
    "description": "Fold-flat magnetic phone dock precision-milled from aluminum alloy. Houses a strong N52 neodymium magnetic array for solid portrait and landscape positioning with cable management.",
    "price": 799,
    "previousPrice": 999,
    "category": "Mobile Essentials",
    "image": "https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=1200&q=80",
    "gallery": [
      "https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=1200&q=80"
    ],
    "stock": 36,
    "featured": false,
    "newArrival": true,
    "rating": 4.9,
    "reviewsCount": 220,
    "demandScore": "Top community pick",
    "specs": {
      "Magnets": "32x N52 Neodymium rare-earth array",
      "Adjustment": "Dual-hinge 180\u00b0 tilt and 360\u00b0 rotation",
      "Folded Thickness": "8 mm ultra-slim"
    },
    "highlights": [
      "Supports iOS StandBy mode perfectly",
      "One-handed attach and release"
    ]
  },
  {
    "id": "prod-033",
    "name": "Volt 100W GaN Travel Charger",
    "tagline": "4-port pocket fast charger with international pins.",
    "description": "Next-generation Gallium Nitride fast charger with 3x USB-C and 1x USB-A ports. Powers a MacBook Pro, iPad, and phone simultaneously from a compact wall brick.",
    "price": 3199,
    "previousPrice": 3799,
    "category": "Mobile Essentials",
    "image": "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?auto=format&fit=crop&w=1200&q=80",
    "gallery": [
      "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?auto=format&fit=crop&w=1200&q=80"
    ],
    "stock": 21,
    "featured": true,
    "newArrival": true,
    "rating": 4.9,
    "reviewsCount": 105,
    "demandScore": "Traveler choice",
    "specs": {
      "Total Wattage": "100W Max GaN III",
      "Ports": "3x USB-C (100W single), 1x USB-A (22.5W)",
      "Pins": "Foldable US + snap-on UK/EU/IN adapters"
    },
    "highlights": [
      "Intelligent power redistribution",
      "Over-temperature safety shutdown"
    ]
  },
  {
    "id": "prod-034",
    "name": "Titanium 25,000 mAh Laptop Power Bank",
    "tagline": "140W dual-directional PD 3.1 emergency battery.",
    "description": "Massive capacity battery bank delivering up to 140W fast charging via USB-C PD 3.1. Recharges high-performance laptops anywhere with real-time digital wattage screen.",
    "price": 6999,
    "previousPrice": 7999,
    "category": "Mobile Essentials",
    "image": "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?auto=format&fit=crop&w=1200&q=80",
    "gallery": [
      "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?auto=format&fit=crop&w=1200&q=80"
    ],
    "stock": 9,
    "featured": false,
    "newArrival": false,
    "rating": 4.8,
    "reviewsCount": 71,
    "demandScore": "Pro nomad pick",
    "specs": {
      "Capacity": "25,000 mAh / 92.5Wh (TSA airline safe)",
      "Max Output": "140W Single Port PD 3.1",
      "Display": "Color IPS display with wattage & health telemetry"
    },
    "highlights": [
      "Charges MacBook Pro 16\" to 50% in 30 minutes",
      "Pass-through UPS battery mode"
    ]
  },
  {
    "id": "prod-035",
    "name": "3-in-1 Foldable Travel Wireless Station",
    "tagline": "Charges iPhone, Apple Watch and AirPods in one fold.",
    "description": "Origami-inspired folding silicone and aluminum charging station that neatly powers your phone, smartwatch, and earbuds from a single USB-C cable.",
    "price": 2799,
    "previousPrice": 3299,
    "category": "Mobile Essentials",
    "image": "https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=1200&q=80",
    "gallery": [
      "https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=1200&q=80"
    ],
    "stock": 17,
    "featured": false,
    "newArrival": true,
    "rating": 4.8,
    "reviewsCount": 84,
    "demandScore": "Best travel accessory",
    "specs": {
      "Phone Output": "15W MagSafe Fast Charge",
      "Watch Output": "5W Fast Watch Puck",
      "Earbuds Output": "5W Qi pad"
    },
    "highlights": [
      "Folds into palm-sized square",
      "Includes hard zippered travel carry pouch"
    ]
  },
  {
    "id": "prod-036",
    "name": "Armored Kevlar USB-C Cable (2m)",
    "tagline": "240W Power Delivery with 50,000 bend rating.",
    "description": "Double-braided DuPont Kevlar charging and sync cable rated for 240W (48V/5A) Power Delivery with silicone cable tie.",
    "price": 899,
    "previousPrice": 1199,
    "category": "Mobile Essentials",
    "image": "https://images.unsplash.com/photo-1618384887929-16ec33cad9ea?auto=format&fit=crop&w=1200&q=80",
    "gallery": [
      "https://images.unsplash.com/photo-1618384887929-16ec33cad9ea?auto=format&fit=crop&w=1200&q=80"
    ],
    "stock": 42,
    "featured": false,
    "newArrival": false,
    "rating": 4.9,
    "reviewsCount": 195,
    "demandScore": "Indestructible cable",
    "specs": {
      "Power Rating": "240W USB PD 3.1",
      "Length": "2 meters (6.6 ft)",
      "Data Speed": "480 Mbps"
    },
    "highlights": [
      "Laser welded zinc connector housings",
      "Backed by lifetime cable replacement"
    ]
  },
  {
    "id": "prod-037",
    "name": "Ballistic Tech Organizer Pouch",
    "tagline": "Waterproof Cordura travel kit for chargers & cords.",
    "description": "Structured tech organizer with origami internal pockets, YKK weather-sealed zippers, and magnetic accessory compartment.",
    "price": 1999,
    "previousPrice": 2499,
    "category": "Mobile Essentials",
    "image": "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?auto=format&fit=crop&w=1200&q=80",
    "gallery": [
      "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?auto=format&fit=crop&w=1200&q=80"
    ],
    "stock": 25,
    "featured": false,
    "newArrival": false,
    "rating": 4.8,
    "reviewsCount": 87,
    "demandScore": "Commuter favorite",
    "specs": {
      "Capacity": "2 Liters",
      "Material": "500D Recycled Ballistic Cordura",
      "Zippers": "YKK AquaGuard weather sealed"
    },
    "highlights": [
      "Opens flat in clamshell format",
      "Dedicated pen and stylus loops"
    ]
  },
  {
    "id": "prod-038",
    "name": "MagSafe Slim Card Wallet & Stand",
    "tagline": "Holds 3 cards with adjustable steel hinge stand.",
    "description": "Minimalist vegan leather phone wallet with shielded RFID blocking and an integrated steel friction hinge for 45-degree desk viewing.",
    "price": 1199,
    "previousPrice": 1499,
    "category": "Mobile Essentials",
    "image": "https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=1200&q=80",
    "gallery": [
      "https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=1200&q=80"
    ],
    "stock": 33,
    "featured": false,
    "newArrival": false,
    "rating": 4.6,
    "reviewsCount": 118,
    "demandScore": "Daily carry item",
    "specs": {
      "Capacity": "Up to 3 cards + cash fold",
      "Magnetism": "Strong 3800 gauss magnetic hold",
      "Stand Angles": "Portrait & landscape"
    },
    "highlights": [
      "Built-in thumb slot for easy card slide",
      "RFID theft shielding"
    ]
  },
  {
    "id": "prod-039",
    "name": "65W Ultra-Slim GaN Wall Plug",
    "tagline": "Card-thin fast charger that sits flat against outlets.",
    "description": "Just 14mm thick with folding pins. Plugs into tight spaces behind desks, bedside nightstands, and sofas without sticking out.",
    "price": 1999,
    "previousPrice": 2399,
    "category": "Mobile Essentials",
    "image": "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?auto=format&fit=crop&w=1200&q=80",
    "gallery": [
      "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?auto=format&fit=crop&w=1200&q=80"
    ],
    "stock": 15,
    "featured": false,
    "newArrival": true,
    "rating": 4.9,
    "reviewsCount": 62,
    "demandScore": "Compact innovation",
    "specs": {
      "Thickness": "14 mm ultra-slim",
      "Output": "65W USB-C Power Delivery",
      "Weight": "85 grams"
    },
    "highlights": [
      "Fits flush against walls",
      "Charges ultrabooks and phones"
    ]
  },
  {
    "id": "prod-040",
    "name": "Smart Bluetooth Item Tracker (2-Pack)",
    "tagline": "Precision finding with loud 95dB chime.",
    "description": "Ultra-thin tracker disc that works with Apple Find My and Android networks to track keys, backpack, and laptop sleeve globally.",
    "price": 1599,
    "previousPrice": 1999,
    "category": "Mobile Essentials",
    "image": "https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=1200&q=80",
    "gallery": [
      "https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=1200&q=80"
    ],
    "stock": 28,
    "featured": false,
    "newArrival": false,
    "rating": 4.7,
    "reviewsCount": 96,
    "demandScore": "Loss prevention tag",
    "specs": {
      "Battery": "Replaceable CR2032 (1-year life)",
      "Network": "Apple Find My & CloudCart Global Network",
      "Water Resistance": "IP67 waterproof"
    },
    "highlights": [
      "Left-behind proximity alerts",
      "Encrypted anonymous location pings"
    ]
  },
  {
    "id": "prod-041",
    "name": "Halo Desk Lamp",
    "tagline": "Stepless dimming and circadian color tuning.",
    "description": "Architectural minimal desk light featuring edge-lit glare-free optics, adjustable color temperature (2700K to 6500K), and a precision counterbalanced articulated arm.",
    "price": 2899,
    "previousPrice": 3499,
    "category": "Workspace Lighting",
    "image": "https://images.unsplash.com/photo-1507473887607-a6e529184d03?auto=format&fit=crop&w=1200&q=80",
    "gallery": [
      "https://images.unsplash.com/photo-1507473887607-a6e529184d03?auto=format&fit=crop&w=1200&q=80"
    ],
    "stock": 11,
    "featured": true,
    "newArrival": false,
    "rating": 4.6,
    "reviewsCount": 67,
    "demandScore": "Studio lighting staple",
    "specs": {
      "Color Temperature": "2700K \u2013 6500K Tunable White",
      "Color Rendering": "Ra > 97 True Color Reproduction",
      "Brightness": "Up to 1200 Lux at desk level",
      "Controls": "Capacitive touch slider"
    },
    "highlights": [
      "Circadian rhythm auto-temperature sync",
      "Zero flicker tested against eye fatigue",
      "Weighted zinc base"
    ]
  },
  {
    "id": "prod-042",
    "name": "Lumina Pro Monitor ScreenBar",
    "tagline": "Asymmetric optical path with zero screen glare.",
    "description": "Precision monitor-mounted task light that illuminates your desk workspace evenly without casting glare or reflections onto the display glass.",
    "price": 3299,
    "previousPrice": 3899,
    "category": "Workspace Lighting",
    "image": "https://images.unsplash.com/photo-1507473887607-a6e529184d03?auto=format&fit=crop&w=1200&q=80",
    "gallery": [
      "https://images.unsplash.com/photo-1507473887607-a6e529184d03?auto=format&fit=crop&w=1200&q=80"
    ],
    "stock": 16,
    "featured": true,
    "newArrival": true,
    "rating": 4.9,
    "reviewsCount": 142,
    "demandScore": "Top seller for screen comfort",
    "specs": {
      "Illumination": "Asymmetric 45-degree beam angle",
      "Power": "USB-C powered from monitor or hub",
      "Mounting": "Gravity counterweight clamp (fits curved & flat screens)"
    },
    "highlights": [
      "Auto-dimming ambient light sensor",
      "Wireless rotary desktop control dial"
    ]
  },
  {
    "id": "prod-043",
    "name": "Aura Smart Ambient Lightbar (Pair)",
    "tagline": "Dynamic bias backlighting with music sync.",
    "description": "Pair of vertical magnetic light towers that cast soft diffuse RGB and tunable white illumination behind monitors or television displays to reduce eye strain.",
    "price": 3999,
    "previousPrice": 4799,
    "category": "Workspace Lighting",
    "image": "https://images.unsplash.com/photo-1507473887607-a6e529184d03?auto=format&fit=crop&w=1200&q=80",
    "gallery": [
      "https://images.unsplash.com/photo-1507473887607-a6e529184d03?auto=format&fit=crop&w=1200&q=80"
    ],
    "stock": 8,
    "featured": false,
    "newArrival": false,
    "rating": 4.8,
    "reviewsCount": 59,
    "demandScore": "Desk aesthetic upgrade",
    "specs": {
      "LEDs": "64 Addressable LEDs per bar",
      "Sync Mode": "Screen color sampling & audio reactive",
      "Stands": "Flat base or monitor rear adhesive"
    },
    "highlights": [
      "Reduces eye fatigue in dark rooms",
      "16 million color transitions"
    ]
  },
  {
    "id": "prod-044",
    "name": "Orb Circadian Nightfall Light",
    "tagline": "Hand-blown frosted glass ambient orb.",
    "description": "Spherical frosted glass mood lamp programmed with amber red spectrums that promote natural melatonin release for evening reading.",
    "price": 2199,
    "previousPrice": 2599,
    "category": "Workspace Lighting",
    "image": "https://images.unsplash.com/photo-1507473887607-a6e529184d03?auto=format&fit=crop&w=1200&q=80",
    "gallery": [
      "https://images.unsplash.com/photo-1507473887607-a6e529184d03?auto=format&fit=crop&w=1200&q=80"
    ],
    "stock": 19,
    "featured": false,
    "newArrival": true,
    "rating": 4.7,
    "reviewsCount": 46,
    "demandScore": "Sleep & focus light",
    "specs": {
      "Light Modes": "Deep Amber (1800K), Warm Glow (2700K)",
      "Battery": "Built-in 2,400 mAh rechargeable battery (14 hrs)",
      "Control": "Tap touch surface"
    },
    "highlights": [
      "Cordless placement anywhere",
      "100% blue-light free night mode"
    ]
  },
  {
    "id": "prod-045",
    "name": "Linear Under-Shelf Light Strip (2m)",
    "tagline": "Concealed COB LED strip with aluminum diffuser.",
    "description": "Dot-free continuous chip-on-board LED strip with anodized aluminum channel and hand-wave gesture sensor.",
    "price": 1499,
    "previousPrice": 1899,
    "category": "Workspace Lighting",
    "image": "https://images.unsplash.com/photo-1507473887607-a6e529184d03?auto=format&fit=crop&w=1200&q=80",
    "gallery": [
      "https://images.unsplash.com/photo-1507473887607-a6e529184d03?auto=format&fit=crop&w=1200&q=80"
    ],
    "stock": 24,
    "featured": false,
    "newArrival": false,
    "rating": 4.8,
    "reviewsCount": 78,
    "demandScore": "Clean shelf mod",
    "specs": {
      "Density": "480 LEDs per meter (zero hot-spotting)",
      "Control": "IR motion sensor (wave to turn on/dim)",
      "Power": "USB 5V/2A"
    },
    "highlights": [
      "Uniform spotless light line",
      "Cut to length markers"
    ]
  },
  {
    "id": "prod-046",
    "name": "Beam Foldable Portable Video Keylight",
    "tagline": "Pocket video conferencing light with 96+ CRI.",
    "description": "Magnetic travel keylight with built-in diffusion panel for zoom calls and streams. Mounts directly to laptops or monitors without scratching.",
    "price": 1899,
    "previousPrice": 2299,
    "category": "Workspace Lighting",
    "image": "https://images.unsplash.com/photo-1507473887607-a6e529184d03?auto=format&fit=crop&w=1200&q=80",
    "gallery": [
      "https://images.unsplash.com/photo-1507473887607-a6e529184d03?auto=format&fit=crop&w=1200&q=80"
    ],
    "stock": 14,
    "featured": false,
    "newArrival": false,
    "rating": 4.7,
    "reviewsCount": 63,
    "demandScore": "Streamer staple",
    "specs": {
      "Battery Life": "4 hours at maximum brightness",
      "Temperature": "3200K to 5600K Bi-color",
      "Mounting": "Padded laptop clamp + 1/4\" tripod thread"
    },
    "highlights": [
      "Soft flattering edge illumination",
      "OLED back display"
    ]
  },
  {
    "id": "prod-047",
    "name": "Helios Articulated Architect Lamp",
    "tagline": "Heavy-duty double arm lamp with 80cm reach.",
    "description": "Classic drafting desk lamp reimagined in matte powder-coated steel with internal spring counterweights and 360-degree pivoting shade.",
    "price": 3499,
    "previousPrice": 4199,
    "category": "Workspace Lighting",
    "image": "https://images.unsplash.com/photo-1507473887607-a6e529184d03?auto=format&fit=crop&w=1200&q=80",
    "gallery": [
      "https://images.unsplash.com/photo-1507473887607-a6e529184d03?auto=format&fit=crop&w=1200&q=80"
    ],
    "stock": 7,
    "featured": false,
    "newArrival": false,
    "rating": 4.8,
    "reviewsCount": 41,
    "demandScore": "Architect choice",
    "specs": {
      "Reach": "80 cm (31.5 inches)",
      "Bulb Socket": "E27 Standard (Smart bulb compatible)",
      "Base": "Reinforced aluminum desk edge clamp"
    },
    "highlights": [
      "Reaches across large drafting tables",
      "Concealed internal tension springs"
    ]
  },
  {
    "id": "prod-048",
    "name": "Prism Ambient Hexagon Wall Panels (3-Pack)",
    "tagline": "Touch-sensitive modular geometric light tiles.",
    "description": "Magnetic interlocking geometric wall tiles that light up and change color with capacitive touch and desktop app sync.",
    "price": 2999,
    "previousPrice": 3699,
    "category": "Workspace Lighting",
    "image": "https://images.unsplash.com/photo-1507473887607-a6e529184d03?auto=format&fit=crop&w=1200&q=80",
    "gallery": [
      "https://images.unsplash.com/photo-1507473887607-a6e529184d03?auto=format&fit=crop&w=1200&q=80"
    ],
    "stock": 12,
    "featured": false,
    "newArrival": true,
    "rating": 4.6,
    "reviewsCount": 38,
    "demandScore": "Creative studio art",
    "specs": {
      "Tiles": "3x Interlocking hexagonal units",
      "Colors": "16.8 million RGB hues",
      "Connectivity": "Wi-Fi & Bluetooth Smart Home"
    },
    "highlights": [
      "Expandable up to 30 tiles on one power supply",
      "Touch swipe color waves"
    ]
  },
  {
    "id": "prod-049",
    "name": "CloudGel Ergonomic Wrist Rest",
    "tagline": "Cooling memory gel with breathable Lycra cover.",
    "description": "Contoured keyboard palm rest engineered with high-density cooling memory foam that alleviates wrist extension fatigue during marathon typing.",
    "price": 999,
    "previousPrice": 1299,
    "category": "Ergonomics & Seating",
    "image": "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1200&q=80",
    "gallery": [
      "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1200&q=80"
    ],
    "stock": 38,
    "featured": true,
    "newArrival": false,
    "rating": 4.8,
    "reviewsCount": 165,
    "demandScore": "Wrist health essential",
    "specs": {
      "Dimensions": "44 x 8 x 2 cm (Standard 75%/TKL/Full)",
      "Core": "Cooling Gel Infused Memory Foam",
      "Base": "Non-skid textured polyurethane"
    },
    "highlights": [
      "Keeps wrists in neutral carpal alignment",
      "Anti-fray reinforced edge stitching"
    ]
  },
  {
    "id": "prod-050",
    "name": "ErgoMotion Active Footrest",
    "tagline": "Dual-height rockable wooden foot elevation pad.",
    "description": "Ergonomic wooden footrest with rocking curved base that encourages subtle leg motion, relieves lower back strain, and enhances blood circulation.",
    "price": 2499,
    "previousPrice": 2999,
    "category": "Ergonomics & Seating",
    "image": "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?auto=format&fit=crop&w=1200&q=80",
    "gallery": [
      "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?auto=format&fit=crop&w=1200&q=80"
    ],
    "stock": 17,
    "featured": false,
    "newArrival": true,
    "rating": 4.9,
    "reviewsCount": 82,
    "demandScore": "Posture enhancer",
    "specs": {
      "Tilt Range": "0\u00b0 to 30\u00b0 active rocking motion",
      "Material": "Bent plywood + textured rubber traction tread",
      "Weight Capacity": "100 kg"
    },
    "highlights": [
      "Encourages active sitting and movement",
      "Can be flipped for static foot massage ridges"
    ]
  },
  {
    "id": "prod-051",
    "name": "Contour Memory Foam Lumbar Cushion",
    "tagline": "Orthopedic lower back support for any chair.",
    "description": "Anatomically molded memory foam back cushion that cradles the lumbar spine, promoting natural lordotic curvature and reducing slouching.",
    "price": 1699,
    "previousPrice": 2199,
    "category": "Ergonomics & Seating",
    "image": "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=1200&q=80",
    "gallery": [
      "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=1200&q=80"
    ],
    "stock": 29,
    "featured": false,
    "newArrival": false,
    "rating": 4.7,
    "reviewsCount": 110,
    "demandScore": "Spine health essential",
    "specs": {
      "Cover": "3D breathable mesh (machine washable)",
      "Straps": "Dual adjustable security buckles",
      "Core": "100% High density rebound memory foam"
    },
    "highlights": [
      "Never flattens over years of sitting",
      "Universally fits office and gaming chairs"
    ]
  },
  {
    "id": "prod-052",
    "name": "Vertical Ergonomic Wireless Mouse",
    "tagline": "57-degree handshake grip prevents strain.",
    "description": "Ergonomic vertical mouse shaped to reduce forearm twisting and wrist pressure. Smooth optical tracking with low-friction thumb rest.",
    "price": 2199,
    "previousPrice": 2699,
    "category": "Ergonomics & Seating",
    "image": "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=1200&q=80",
    "gallery": [
      "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=1200&q=80"
    ],
    "stock": 19,
    "featured": false,
    "newArrival": true,
    "rating": 4.8,
    "reviewsCount": 74,
    "demandScore": "RSI prevention mouse",
    "specs": {
      "Angle": "57-degree natural handshake posture",
      "DPI": "Adjustable 800 - 1600 - 2400 DPI",
      "Battery": "Rechargeable via USB-C (3 months per charge)"
    },
    "highlights": [
      "Alleviates carpal tunnel pressure",
      "Quiet-click buttons"
    ]
  },
  {
    "id": "prod-053",
    "name": "Adjustable Clamp Desk Armrests (Pair)",
    "tagline": "360-degree rotating elbow supports for deep desks.",
    "description": "Pair of aluminum clamp-on arm supports that extend your desk surface and cradle forearms to eliminate shoulder and neck tension.",
    "price": 2899,
    "previousPrice": 3499,
    "category": "Ergonomics & Seating",
    "image": "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?auto=format&fit=crop&w=1200&q=80",
    "gallery": [
      "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?auto=format&fit=crop&w=1200&q=80"
    ],
    "stock": 12,
    "featured": false,
    "newArrival": false,
    "rating": 4.9,
    "reviewsCount": 41,
    "demandScore": "Heavy typist aid",
    "specs": {
      "Rotation": "Full 360-degree pivot",
      "Clamp Range": "Up to 6 cm desktop thickness",
      "Padding": "Thick memory foam top"
    },
    "highlights": [
      "Takes weight directly off shoulders",
      "Folds under desk when not in use"
    ]
  },
  {
    "id": "prod-054",
    "name": "Aether Pro Ergonomic Task Chair",
    "tagline": "Adaptive auto-weight lumbar with Korean mesh.",
    "description": "Flagship ergonomic task chair featuring self-adjusting recline tension, 4D armrests, dynamic spine support, and breathable temperature-regulating mesh.",
    "price": 24999,
    "previousPrice": 28999,
    "category": "Ergonomics & Seating",
    "image": "https://images.unsplash.com/photo-1580481077195-c3a821a58875?auto=format&fit=crop&w=1200&q=80",
    "gallery": [
      "https://images.unsplash.com/photo-1580481077195-c3a821a58875?auto=format&fit=crop&w=1200&q=80"
    ],
    "stock": 5,
    "featured": true,
    "newArrival": true,
    "rating": 4.9,
    "reviewsCount": 68,
    "demandScore": "Flagship ergonomic seating",
    "specs": {
      "Weight Capacity": "Up to 150 kg",
      "Adjustments": "4D Armrests, Seat depth slider, 3-position tilt lock",
      "Base": "Cast aluminum 5-wheel base with silent PU casters"
    },
    "highlights": [
      "10-year warranty on frame & mechanism",
      "Zero pressure point suspension mesh"
    ]
  },
  {
    "id": "prod-055",
    "name": "Magnetic Standing Desk Balance Board",
    "tagline": "Micro-movement rocker for height adjustable desks.",
    "description": "Ergonomic standing desk balance board that stimulates leg muscles and relieves foot fatigue during standing work sessions.",
    "price": 3199,
    "previousPrice": 3799,
    "category": "Ergonomics & Seating",
    "image": "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?auto=format&fit=crop&w=1200&q=80",
    "gallery": [
      "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?auto=format&fit=crop&w=1200&q=80"
    ],
    "stock": 15,
    "featured": false,
    "newArrival": false,
    "rating": 4.8,
    "reviewsCount": 52,
    "demandScore": "Standing desk essential",
    "specs": {
      "Tilt Angle": "8.5 degrees gentle rock",
      "Material": "Multi-ply birch wood + high-density PU cushion"
    },
    "highlights": [
      "Doubles standing endurance without joint fatigue",
      "Built-in carry handle"
    ]
  },
  {
    "id": "prod-056",
    "name": "Anti-Fatigue Beveled Standing Mat",
    "tagline": "Solid polyurethane cushion with massage mounds.",
    "description": "High-density polyurethane standing mat with central balance ball mound and perimeter stretch wedges for active standing comfort.",
    "price": 1999,
    "previousPrice": 2499,
    "category": "Ergonomics & Seating",
    "image": "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=1200&q=80",
    "gallery": [
      "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=1200&q=80"
    ],
    "stock": 21,
    "featured": false,
    "newArrival": false,
    "rating": 4.7,
    "reviewsCount": 83,
    "demandScore": "Desk floor comfort",
    "specs": {
      "Thickness": "2.5 cm ultra-cushioned",
      "Dimensions": "75 x 50 cm",
      "Edges": "Beveled anti-trip safety border"
    },
    "highlights": [
      "Relieves heel and spine pressure",
      "Non-slip waterproof bottom"
    ]
  },
  {
    "id": "prod-057",
    "name": "Orthopedic Mouse Wrist Rest",
    "tagline": "Ergonomic gliding palm glider for optical mice.",
    "description": "Palm-sized frictionless glider that moves with your hand as you mouse, keeping the carpal tunnel elevated off the desk.",
    "price": 799,
    "previousPrice": 999,
    "category": "Ergonomics & Seating",
    "image": "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=1200&q=80",
    "gallery": [
      "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=1200&q=80"
    ],
    "stock": 34,
    "featured": false,
    "newArrival": false,
    "rating": 4.6,
    "reviewsCount": 97,
    "demandScore": "Mouse relief tool",
    "specs": {
      "Feet": "4x Smooth PTFE glides",
      "Material": "Silicone padded palm cradle"
    },
    "highlights": [
      "Moves seamlessly with your hand",
      "Prevents friction burns on wrist"
    ]
  },
  {
    "id": "prod-058",
    "name": "Adjustable Monitor Laptop Combo Mount",
    "tagline": "Dual articulated pole holding screen & laptop.",
    "description": "Heavy-duty steel dual mount holding a 32-inch monitor alongside an elevated laptop tray for seamless side-by-side dual-screen alignment.",
    "price": 4499,
    "previousPrice": 5299,
    "category": "Desk Setup",
    "image": "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=1200&q=80",
    "gallery": [
      "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=1200&q=80"
    ],
    "stock": 13,
    "featured": false,
    "newArrival": true,
    "rating": 4.8,
    "reviewsCount": 61,
    "demandScore": "Dual screen setup",
    "specs": {
      "Monitor Support": "Up to 32\" (9 kg)",
      "Laptop Tray": "11\" to 17\" ventilated tray",
      "Base": "Dual C-clamp or grommet mount"
    },
    "highlights": [
      "Independent height and tilt adjustment",
      "Frees 85% of desktop space"
    ]
  },
  {
    "id": "prod-059",
    "name": "Ergonomic Split Mechanical Keyboard",
    "tagline": "Ortholinear split halves with magnetic tenting.",
    "description": "Two independent keyboard halves connected via USB-C, allowing your arms to type at shoulder-width to completely open chest posture.",
    "price": 9499,
    "previousPrice": 11499,
    "category": "Desk Setup",
    "image": "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?auto=format&fit=crop&w=1200&q=80",
    "gallery": [
      "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?auto=format&fit=crop&w=1200&q=80"
    ],
    "stock": 6,
    "featured": true,
    "newArrival": true,
    "rating": 4.9,
    "reviewsCount": 39,
    "demandScore": "Developer favorite",
    "specs": {
      "Layout": "Split 58-key columnar layout",
      "Tenting": "Adjustable 5\u00b0 to 20\u00b0 tenting legs",
      "Switches": "Hot-swappable tactile Gateron Pro"
    },
    "highlights": [
      "Eliminates ulnar deviation strain",
      "Full QMK/VIA key remapping"
    ]
  },
  {
    "id": "prod-060",
    "name": "Posture Corrector Smart Sensor",
    "tagline": "Gentle haptic reminder for spine alignment.",
    "description": "Discreet featherlight sensor that adheres between shoulder blades or clips to shirt collar, providing a gentle vibration whenever slouching occurs.",
    "price": 1799,
    "previousPrice": 2199,
    "category": "Ergonomics & Seating",
    "image": "https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=1200&q=80",
    "gallery": [
      "https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=1200&q=80"
    ],
    "stock": 23,
    "featured": false,
    "newArrival": false,
    "rating": 4.7,
    "reviewsCount": 81,
    "demandScore": "Posture biofeedback",
    "specs": {
      "Battery": "14 days battery life per charge",
      "Weight": "11 grams",
      "App": "Real-time posture analytics & angle calibration"
    },
    "highlights": [
      "Trains muscle memory over 21 days",
      "Invisible under clothing"
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
  },
  {
    id: "ord-demo-1003",
    createdAt: "2026-10-19T18:42:00.000Z",
    status: "Processing",
    customer: { name: "Elena Rostova", email: "elena@future.design", city: "San Francisco" },
    total: 24999,
    items: [
      { productId: "prod-012", quantity: 1 }
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
    if (Array.isArray(stored) && stored.length >= SAMPLE_PRODUCTS.length) {
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
    specs: (raw.specs && Object.keys(raw.specs).length) ? raw.specs : (sampleMatch?.specs || {
      "Material": "Anodized Aerospace Aluminum",
      "Connectivity": "USB-C / Wireless Low Latency",
      "Warranty": "2-Year Studio Limited Warranty",
      "Origin": "Designed in CloudCart Studio"
    }),
    highlights: (Array.isArray(raw.highlights) && raw.highlights.length) ? raw.highlights : (sampleMatch?.highlights || [
      "Precision engineered with premium tactile feedback",
      "Minimalist footprint tailored for modern desk spaces",
      "Instant compatibility across macOS, Windows and mobile"
    ])
  };
}
