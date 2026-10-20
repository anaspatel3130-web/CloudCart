# 🛒 CloudCart — Backend Service

The serverless backend for **CloudCart**, a college Cloud Computing demonstration project. Built with AWS Lambda, Amazon API Gateway HTTP API, Amazon DynamoDB, and AWS SAM.

---

## 🏛️ Architecture Overview

The backend is built around a modern AWS serverless architecture designed for scalability, zero idle cost, and minimal operational overhead:

```
                      ┌────────────────────────────────┐
                      │    Static Frontend (Browser)   │
                      └───────────────┬────────────────┘
                                      │ HTTPS
                                      ▼
                      ┌────────────────────────────────┐
                      │  Amazon API Gateway (HTTP API) │
                      │  - CORS origin validation      │
                      │  - Optional Cognito JWT auth   │
                      └───────┬──────────────┬─────────┘
                              │              │
      ┌───────────────────────┼──────────────┼────────────────────────┐
      │                       │              │                        │
      ▼                       ▼              ▼                        ▼
┌──────────────┐      ┌──────────────┐ ┌──────────────┐      ┌────────────────┐
│   Products   │      │     Cart     │ │    Orders    │      │ Admin/Inventory│
│    Lambda    │      │    Lambda    │ │    Lambda    │      │     Lambda     │
└──────┬───────┘      └──────┬───────┘ └──────┬───────┘      └───────┬────────┘
       │                     │                │                      │
       ▼                     ▼                ▼                      ▼
┌──────────────┐      ┌──────────────┐ ┌──────────────┐      ┌────────────────┐
│  DynamoDB    │      │  DynamoDB    │ │  DynamoDB    │      │  DynamoDB      │
│   Products   │◄─────┤    Carts     │ │    Orders    │◄─────┤   Products &   │
│    Table     │      │    Table     │ │    Table     │      │  Orders Tables │
└──────────────┘      └──────────────┘ └──────────────┘      └────────────────┘
```

- **Compute**: AWS Lambda (Node.js 22 runtime, ES modules).
- **API Entrypoint**: Amazon API Gateway HTTP API (v2) with CORS origin controls and payload size safeguards.
- **Data Layer**: Amazon DynamoDB with On-Demand billing (Pay-Per-Request) and server-side encryption (SSE).
- **Transactions & Concurrency**: Atomic DynamoDB `TransactWriteItems` for checkout to prevent overselling inventory.
- **Monitoring & Observability**: Amazon CloudWatch Logs with structured JSON logging and configurable retention.
- **Infrastructure as Code**: AWS SAM (`template.yaml`).

---

## 📋 Prerequisites

To run and develop locally:
- **Node.js**: `v22.x` or later.
- **npm**: `v10.x` or later.
- Optional for AWS deployment:
  - **AWS CLI**: configured with credentials (`aws configure --profile cloudcart`).
  - **AWS SAM CLI**: `v1.100.x` or later.

---

## 🚀 Local Setup & Installation

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies (AWS SDK v3):
   ```bash
   npm install
   ```

3. Copy the example environment variables:
   ```bash
   cp .env.example .env
   ```

---

## 🧪 Running Unit Tests

The backend includes a comprehensive unit test suite written with Node.js's built-in test runner (`node:test` and `node:assert/strict`).

All tests run **entirely in-memory** using a high-fidelity mock DynamoDB store, so **no AWS credentials, cloud resources, or local DynamoDB containers are required**:

```bash
npm test
```

### What is tested:
- **Products API**: catalogue listing, pagination cursor encoding/decoding, category filtering, text search, single product lookup, 404 for missing items, query validation.
- **Cart API**: cart retrieval, adding items, quantity incrementing, explicit quantity updates (`mode: "set"`), item deletion on zero quantity, server-side price calculation, inventory limit enforcement, user cart isolation.
- **Orders & Checkout**: atomic transactions, server-side pricing verification (ignoring client-submitted totals), automatic stock decrements, emptying user cart upon checkout, preventing checkout when stock is insufficient, serialized conflict handling for concurrent buyers, order ownership checks, order lookup by ID.
- **Admin API**: authentication key validation, production fail-closed behavior, JWT claims with Cognito `Admin` group, inventory status calculation (`HEALTHY`, `LOW_STOCK`, `OUT_OF_STOCK`), stock level updates, order status transitions (`PENDING`, `CONFIRMED`, `CANCELLED`).

---

## 🗄️ DynamoDB Data Model

The data plane uses three primary tables designed for simplicity, clear separation of concerns, and ease of demonstration:

### 1. Products Table (`CloudCart-Products`)
- **Partition Key (PK)**: `id` (String, e.g. `"prod-001"`)
- **Attributes**:
  - `name` (String)
  - `description` (String)
  - `price` (Number, INR)
  - `previousPrice` (Number, optional original price for discounts)
  - `category` (String, e.g. `"Audio"`, `"Desk Setup"`)
  - `image` (String, URL)
  - `stock` (Number, integer $\ge 0$)
  - `featured` (Boolean)
  - `newArrival` (Boolean)
  - `createdAt` (String, ISO 8601)
  - `updatedAt` (String, ISO 8601)

### 2. Carts Table (`CloudCart-Carts`)
- **Partition Key (PK)**: `userId` (String, e.g. `"demo-user"`)
- **Attributes**:
  - `items` (List of objects: `[{ productId: "prod-001", quantity: 2 }]`)
  - `updatedAt` (String, ISO 8601)

### 3. Orders Table (`CloudCart-Orders`)
- **Partition Key (PK)**: `orderId` (String, e.g. `"ord-1a2b3c4d-..."`)
- **Global Secondary Index (GSI)**: `UserOrdersIndex`
  - **GSI PK**: `userId` (String)
  - **GSI SK**: `createdAt` (String, descending sort for order history)
  - **Projection**: `ALL`
- **Attributes**:
  - `userId` (String)
  - `items` (List of line items with captured `unitPrice`, `lineTotal`, and product details)
  - `total` (Number, server-calculated sum of lines)
  - `status` (String: `"PENDING"`, `"CONFIRMED"`, or `"CANCELLED"`)
  - `checkout` (String: `"simulated"`)
  - `createdAt` (String, ISO 8601)
  - `updatedAt` (String, ISO 8601)

### 4. Automation State Table (`CloudCart-AutomationState`)
- **Partition Key (PK)**: `pk` (String, `"INVENTORY_ALERT_FINGERPRINT"`)
- **Attributes**: `fingerprint`, `updatedAt` (used by the EventBridge scheduled inventory monitor to avoid alert spam).

---

## ⚡ Concurrency & Stock Protection (Transactions)

To prevent overselling when multiple users attempt to check out the last available item simultaneously, `orderService.createFromCart` executes an atomic DynamoDB transaction (`TransactWriteItems`):

1. **Conditional Update on Products**:
   ```
   SET stock = stock - :qty
   CONDITION: attribute_exists(id) AND stock >= :qty
   ```
2. **Put Order**:
   ```
   CONDITION: attribute_not_exists(orderId)
   ```
3. **Reset Cart**:
   Empties the user's cart in the same transaction.

If any product lacks sufficient stock at the exact moment of execution, DynamoDB cancels the entire transaction (`TransactionCanceledException`), throwing a `409 Conflict` (`CHECKOUT_CONFLICT`). No stock is decremented and no orphan order is written.

---

## 🔒 Security & Authorization

### 1. User Identity
- **Development/Demo Mode (`AUTH_MODE=demo`)**:
  - The API extracts user identity from the `X-CloudCart-User-Id` HTTP header.
  - Defaults safely to `"demo-user"` if omitted.
- **Production Mode (`AUTH_MODE=jwt`)**:
  - The API Gateway JWT Authorizer validates the Cognito Bearer token.
  - The backend Lambda extracts the verified subject claim (`sub`) directly from `event.requestContext.authorizer.jwt.claims`.

### 2. Admin Protection & Fail-Closed Safeguard
- In development (`STAGE=dev`), admin requests require the header `X-CloudCart-Admin-Key` matching `DEMO_ADMIN_KEY`.
- In production (`STAGE=prod`), **admin routes fail-closed with HTTP 403 `ADMIN_NOT_CONFIGURED`** unless `AUTH_MODE=jwt` and the user's verified token contains the Cognito `Admin` group.
- Browser-submitted flags like `isAdmin: true` are strictly ignored.

---

## 📡 Sample cURL Requests

Replace `https://<api-id>.execute-api.ap-south-1.amazonaws.com/Prod` with your API Gateway URL:

### 1. Public Catalogue
```bash
# List products with pagination and category filter
curl -s "https://<api-id>.execute-api.ap-south-1.amazonaws.com/Prod/products?category=Audio&limit=10"

# Get single product details
curl -s "https://<api-id>.execute-api.ap-south-1.amazonaws.com/Prod/products/prod-001"
```

### 2. Shopping Cart
```bash
# Retrieve user's cart
curl -s "https://<api-id>.execute-api.ap-south-1.amazonaws.com/Prod/cart" \
  -H "X-CloudCart-User-Id: student-101"

# Add item to cart
curl -s -X POST "https://<api-id>.execute-api.ap-south-1.amazonaws.com/Prod/cart" \
  -H "Content-Type: application/json" \
  -H "X-CloudCart-User-Id: student-101" \
  -d '{"productId":"prod-001","quantity":2}'
```

### 3. Checkout & Orders
```bash
# Create order (simulated checkout)
curl -s -X POST "https://<api-id>.execute-api.ap-south-1.amazonaws.com/Prod/orders" \
  -H "Content-Type: application/json" \
  -H "X-CloudCart-User-Id: student-101" \
  -d '{"items":[{"productId":"prod-001","quantity":2}]}'

# Get order history for caller
curl -s "https://<api-id>.execute-api.ap-south-1.amazonaws.com/Prod/orders" \
  -H "X-CloudCart-User-Id: student-101"

# Lookup single order
curl -s "https://<api-id>.execute-api.ap-south-1.amazonaws.com/Prod/orders/ord-sample-id" \
  -H "X-CloudCart-User-Id: student-101"
```

### 4. Admin Management (Development Mode)
```bash
# Inspect inventory health
curl -s "https://<api-id>.execute-api.ap-south-1.amazonaws.com/Prod/admin/inventory" \
  -H "X-CloudCart-Admin-Key: your-dev-admin-key"

# Restock a product
curl -s -X PATCH "https://<api-id>.execute-api.ap-south-1.amazonaws.com/Prod/admin/products/prod-001/stock" \
  -H "Content-Type: application/json" \
  -H "X-CloudCart-Admin-Key: your-dev-admin-key" \
  -d '{"stock":25}'

# Update order status
curl -s -X PATCH "https://<api-id>.execute-api.ap-south-1.amazonaws.com/Prod/admin/orders/ord-sample-id/status" \
  -H "Content-Type: application/json" \
  -H "X-CloudCart-Admin-Key: your-dev-admin-key" \
  -d '{"status":"CONFIRMED"}'
```

---

## 📦 Database Seeding

To populate the DynamoDB `CloudCart-Products` table with initial products:

```bash
# Requires explicit confirmation flag to avoid accidental overwrite
SEED_CONFIRM=yes PRODUCTS_TABLE=CloudCart-Products node scripts/seed-products.js
```

---

## 🛠️ AWS SAM Deployment Commands

> **Important**: Never run `sam deploy` without verifying AWS credentials and budget approval.

1. **Validate SAM template syntax**:
   ```bash
   sam validate --lint
   ```

2. **Build artifacts**:
   ```bash
   sam build
   ```

3. **Deploy guided**:
   ```bash
   sam deploy --guided --profile cloudcart --region ap-south-1
   ```

4. **Connect Frontend to Deployed API**:
   - Copy the `ApiUrl` from CloudFormation outputs.
   - Open `frontend/js/config.js` and update:
     ```javascript
     window.CLOUDCART_CONFIG = {
       mode: "api",
       apiBaseUrl: "https://<api-id>.execute-api.ap-south-1.amazonaws.com/Prod",
       userId: "demo-user"
     };
     ```

---

## ⚠️ Common Errors & Troubleshooting

| Error Code / Message | Cause | Resolution |
|----------------------|-------|------------|
| `CORS error in browser` | The browser origin does not match `AllowedOrigin` in SAM. | Set `AllowedOrigin` parameter to your exact frontend origin (e.g., `http://localhost:8080` or CloudFront URL) and redeploy. |
| `401 UNAUTHORIZED` | Missing `X-CloudCart-Admin-Key` (in dev) or missing JWT bearer token. | Supply the expected authorization header. |
| `403 ADMIN_NOT_CONFIGURED` | Admin route invoked in `STAGE=prod` without Cognito JWT configured. | Configure a Cognito User Pool with an `Admin` group, or test in `STAGE=dev`. |
| `409 INSUFFICIENT_STOCK` | Requested quantity exceeds remaining product inventory. | Reduce cart quantity or restock the product via admin API. |
| `409 CHECKOUT_CONFLICT` | A concurrent purchase depleted stock during checkout. | Refresh the cart to view updated stock levels and retry. |
| `404 PRODUCT_NOT_FOUND` | The product ID does not exist in the database. | Verify the product ID with `GET /products` or run the seed script. |
| `EMPTY_CART` | User attempted checkout with 0 items. | Add at least one item before invoking `POST /orders`. |
