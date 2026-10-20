# CloudCart — System architecture

College demonstration of a **serverless** storefront. One SAM stack
(`backend/template.yaml`) defines the data plane, HTTP API, and inventory
automation. The browser app in `frontend/` is static files.

```
                    ┌──────────────────────────┐
                    │  Static frontend         │
                    │  S3 (private) + CloudFront│
                    │  or local http.server    │
                    └────────────┬─────────────┘
                                 │ HTTPS / fetch
                                 ▼
                    ┌──────────────────────────┐
                    │  API Gateway HTTP API    │
                    │  CORS: AllowedOrigin     │
                    └────────────┬─────────────┘
                                 │
          ┌──────────────┬───────┴────────┬──────────────┐
          ▼              ▼                ▼              ▼
     Products Λ      Cart Λ          Orders Λ       Admin Λ
     GET /products   GET/POST /cart  GET/POST /orders  /admin/*
          │              │                │              │
          └──────────────┴───────┬────────┴──────────────┘
                                 ▼
                    ┌──────────────────────────┐
                    │  DynamoDB (on-demand)    │
                    │  Products, Carts, Orders │
                    └──────────────────────────┘

  EventBridge schedule (off by default)
            │
            ▼
  inventory-monitor Λ  ──► CloudWatch Logs
            │
            └── optional SNS email (off by default)
```

---

## Component breakdown

### Frontend (static)

- HTML / CSS / vanilla JS (`frontend/`).
- Demo mode uses in-browser sample data (`js/data.js`).
- API mode uses `window.CLOUDCART_CONFIG.apiBaseUrl` from the stack output `ApiUrl`.
- Hosting options: local server, public S3 website (HTTP), or private S3 + CloudFront (HTTPS). Prefer the last for a shareable demo URL.

### API Gateway HTTP API

- Stage name `Prod` (URL suffix `/Prod`).
- Routes exist only where handlers exist (see `docs/api-contract.md`).
- CORS is a **single explicit origin** (`AllowedOrigin`), not `*`.

### AWS Lambda (Node.js 22)

| Function | Code | Role |
|----------|------|------|
| products | `backend/src/handlers/products.js` | Catalogue reads |
| cart | `backend/src/handlers/cart.js` | Per-user cart |
| orders | `backend/src/handlers/orders.js` | Checkout transaction + history |
| admin | `backend/src/handlers/admin.js` | Stock and order status (authorized) |
| inventory-monitor | `automation/inventory-monitor.js` | Read-only scan + structured logs |

### DynamoDB

| Table | Keys |
|-------|------|
| `{prefix}-Products` | PK `id` |
| `{prefix}-Carts` | PK `userId` |
| `{prefix}-Orders` | PK `orderId`; GSI `UserOrdersIndex` (`userId`, `createdAt`) |
| `{prefix}-AutomationState` | PK `pk` (monitor fingerprint) |

On-demand billing, AES-256 encryption at rest, no PITR (lab cost).

### EventBridge + inventory monitor

- Schedule parameter default `rate(1 day)`, **disabled** until you set `InventoryMonitorEnabled=true`.
- Reads `stock` on the Products table; never decrements stock.
- Optional SNS when `EnableInventoryAlerts=true`.

### CloudWatch

- One log group per function, 14-day retention.
- API handlers log request method/path (no tokens). Monitor logs JSON with `service: cloudcart-inventory-monitor`.

### IAM

- Least privilege per function (read vs write vs `TransactWriteItems` on checkout).
- Monitor: DynamoDB **read** on products, Get/Put on automation state, SNS publish only if the topic exists.
- No access keys in Lambda environment variables.

### Cognito (optional, not created)

- Backend already reads JWT claims (`requestContext.authorizer.jwt.claims`).
- If you pass an **existing** user pool id and app client id and `AuthMode=jwt`, the HTTP API attaches a JWT authorizer on cart, orders, and admin routes.
- The storefront does not yet host a sign-in page. Use `AuthMode=demo` for the course demo.

---

## Data flow — placing an order

1. Browser (API mode) `POST /cart` then `POST /orders` (or `POST /orders` with `items`).
2. Orders Lambda loads the cart (or requested lines), checks stock, and runs a DynamoDB transaction: decrement product stock, put order, put empty cart.
3. Response is JSON `{ success, data, orderId, message }`. Checkout is **simulated** (no payment processor).

---

## Infrastructure as code

All of the above is in `backend/template.yaml` (AWS SAM). Do not add a second template that recreates the same tables or monitor. Deploy steps: `docs/aws-deployment.md`.
