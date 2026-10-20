# ☁️ CloudCart — Serverless E-Commerce Platform

A college Cloud Computing mini-project demonstrating a serverless e-commerce platform built with AWS services.

> **Project Status:** Frontend demo mode works without AWS. Backend, DynamoDB schema, SAM template, and inventory automation are implemented in-repo. **Nothing is deployed to AWS until you run `sam deploy` with approval.**

---

## 🎯 Project Overview

CloudCart is a lightweight e-commerce platform designed to showcase core cloud computing concepts:

- **Serverless compute** using AWS Lambda
- **NoSQL database** using Amazon DynamoDB
- **Static hosting** using Amazon S3
- **Event-driven automation** using EventBridge + Lambda
- **Monitoring** using Amazon CloudWatch
- **Infrastructure as Code** using AWS SAM

---

## 🛠️ Technology Stack

| Layer          | Technology                        |
|----------------|-----------------------------------|
| Frontend       | HTML, CSS, Vanilla JavaScript     |
| Backend        | Node.js, AWS Lambda, API Gateway  |
| Database       | Amazon DynamoDB                   |
| Hosting        | Amazon S3 + optional CloudFront   |
| Automation     | EventBridge + Lambda              |
| Monitoring     | Amazon CloudWatch                 |
| Notifications  | Amazon SNS (optional)             |
| IaC            | AWS SAM (template.yaml)           |

---

## 📁 Folder Structure

```
cloudcart/
├── frontend/                   # Static frontend (HTML/CSS/JS)
│   ├── index.html              # Homepage with immersive flagship hardware showcase
│   ├── products.html           # Product catalog with real-time filters & view toggle
│   ├── product.html            # Dedicated Product Details page with multi-angle gallery
│   ├── cart.html               # Shopping bag with free shipping progress meter & vouchers
│   ├── checkout.html           # Stripe-grade checkout with interactive credit card simulator
│   ├── orders.html             # Real-time Order Tracking & Logistics telemetry
│   ├── admin.html              # Admin operations dashboard & quick stock adjusters
│   ├── css/
│   │   ├── styles.css          # Design system (graphite, electric neon, cyan highlights)
│   │   ├── components.css      # Reusable UI components & luxury product card styling
│   │   └── responsive.css      # Fluid mobile & tablet responsive rules
│   ├── js/
│   │   ├── config.js           # API URLs and feature flags
│   │   ├── data.js             # Sample product catalog, specs, and demo storage
│   │   ├── api.js              # API abstraction (local sandbox & live AWS API Gateway)
│   │   ├── app.js              # Shared chrome, Aether AI assistant & quick view
│   │   ├── products.js         # Collection page filtering and layout controller
│   │   ├── product.js          # Product details page controller & specs tabs
│   │   ├── cart.js             # Shopping bag logic & promotional codes
│   │   ├── checkout.js         # Express checkout & atomic order persistence
│   │   ├── orders.js           # Order tracking, timeline telemetry & receipts
│   │   └── admin.js            # Admin dashboard operations logic
│   └── assets/
│       └── images/             # Product images and icons
│
├── backend/                    # AWS Lambda functions & SAM template
│   ├── package.json            # Node.js dependencies
│   ├── template.yaml           # AWS SAM template (API + tables + monitor + AI + optional hosting)
│   ├── samconfig.toml.example  # Copy to samconfig.toml (gitignored)
│   ├── .env.example            # Environment configuration template
│   ├── README.md               # Comprehensive backend documentation
│   ├── src/
│   │   ├── handlers/           # Lambda entrypoints (products, cart, orders, admin, ai)
│   │   ├── services/           # Business logic services (product, cart, order, inventory, ai)
│   │   └── lib/                # Shared helpers (dynamodb, validation, responses, auth)
│   ├── scripts/                # DynamoDB seed script & seed data
│   └── tests/                  # Unit tests (node:test, in-memory mock store)
│
├── automation/                 # Scheduled cloud automation
│   ├── inventory-monitor.js    # Low-stock monitoring Lambda
│   ├── inventory-monitor.test.js  # Tests for the monitor
│   └── README.md               # Automation documentation
│
├── docs/                       # Project documentation
│   ├── architecture.md         # System architecture overview
│   ├── api-contract.md         # API endpoint documentation
│   ├── aws-deployment.md       # SAM deploy, frontend upload, monitor, tests
│   ├── aws-cost-and-cleanup.md # Billing risks and stack teardown
│   └── demo-checklist.md       # Demo day preparation checklist
│
├── vercel.json                 # Vercel zero-config single-command deployment
├── package.json                # Root test scripts & dev runner (48/48 tests)
├── .gitignore                  # Git ignore rules
└── README.md                   # This file
```

---

## 🚀 Local Setup (Demo Mode)

The frontend runs entirely in the browser using sample data — no backend or AWS account needed.

### Option 1: Open directly

1. Navigate to the `frontend/` folder.
2. Open `index.html` in your browser.

### Option 2: Use a local server (recommended)

Using VS Code Live Server or Python:

```bash
# Using Python 3
cd frontend
python -m http.server 8080

# Then open http://localhost:8080 in your browser
```

### Option 3: Open in Cursor IDE

1. Open Cursor.
2. Go to **File → Open Folder**.
3. Select the `cloudcart/` folder.
4. Right-click `frontend/index.html` → **Open with Live Server** (if the extension is installed).

---

## ☁️ AWS deployment (do not run until you approve charges)

Infrastructure lives in **one** SAM template: `backend/template.yaml`. It already
includes the inventory-monitor from `automation/` so you do **not** deploy a
second stack for DynamoDB or EventBridge.

Full command list (Windows PowerShell and parameter reference): **[docs/aws-deployment.md](docs/aws-deployment.md)**.
Cost and teardown: **[docs/aws-cost-and-cleanup.md](docs/aws-cost-and-cleanup.md)**.

Short path after AWS CLI + SAM CLI + a named profile (`cloudcart`) in `ap-south-1`:

```powershell
cd backend
npm install
cd ..\automation
npm install
cd ..\backend
sam validate --lint --region ap-south-1
sam build
# STOP: the next command creates AWS resources
sam deploy --guided --profile cloudcart --region ap-south-1
```

Then:

1. Copy stack output `ApiUrl` into `frontend/js/config.js` (`mode: "api"`, `apiBaseUrl`).
2. Seed products with `SEED_CONFIRM=yes` — see `backend/scripts/seed-products.js`.
3. Keep `InventoryMonitorEnabled=false` until a manual `aws lambda invoke` works.
4. Upload `frontend/` to S3 yourself, **or** redeploy with `EnableFrontendHosting=true` and sync to the private bucket behind CloudFront.

Default demo auth uses `X-CloudCart-User-Id` (or `demo-user`). Admin HTTP routes require a dev-only `X-CloudCart-Admin-Key` and are **disabled** in `STAGE=prod` unless JWT + Cognito group `Admin` is configured. Do not put AWS keys in the frontend.

---

## 👥 Team

| Name | Role |
|------|------|
| –    | Frontend Developer |
| –    | Backend / Cloud Developer |
| –    | Automation & Documentation |

---

## 📜 License

This project is for educational purposes as part of our Cloud Computing course.
