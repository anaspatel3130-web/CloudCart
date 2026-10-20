# ☁️ CloudCart — API Contract & Specification

This document details the complete HTTP API contract for CloudCart, implemented in `backend/src/handlers/` and routed via Amazon API Gateway HTTP API in `backend/template.yaml`.

---

## 🌐 Base URL & Modes

| Mode | Base URL | Description |
|------|----------|-------------|
| **Local Demo** | `(none)` | Local storage simulation via `frontend/js/config.js` (`mode: "demo"`). |
| **AWS Deployed** | `https://<api-id>.execute-api.<region>.amazonaws.com/Prod` | Live API Gateway HTTP API. Output value `ApiUrl` in SAM. |

> **Note**: Do not append a trailing slash when configuring `apiBaseUrl` in `frontend/js/config.js`.

---

## 📦 Universal JSON Envelopes

Every endpoint returns a consistent JSON envelope with appropriate HTTP status codes:

### Success Envelope (`200 OK` / `201 Created`)
```json
{
  "success": true,
  "data": {
    /* payload data */
  }
}
```
*Certain endpoints also supply top-level convenience aliases (such as `products`, `orders`, or `orderId`) for backward compatibility with frontend consumers.*

### Error Envelope (`400`, `401`, `403`, `404`, `409`, `500`)
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE_STRING",
    "message": "Human-readable explanation of what went wrong."
  }
}
```

---

## 🛡️ Authentication & Authorization Rules

The backend supports two distinct authentication modes configurable via SAM / environment:

1. **`AUTH_MODE=demo` (Default for college demo)**:
   - User identity is resolved from the `X-CloudCart-User-Id` HTTP header.
   - If omitted, safely defaults to `"demo-user"`.
   - Admin routes require the `X-CloudCart-Admin-Key` header matching `DEMO_ADMIN_KEY`.
   - **Production Safeguard**: If `STAGE=prod` and `AUTH_MODE=demo`, all admin routes fail-closed with `403 ADMIN_NOT_CONFIGURED`.
2. **`AUTH_MODE=jwt`**:
   - Requires a valid `Authorization: Bearer <token>` signed by Amazon Cognito.
   - User identity is extracted from the JWT `sub` claim.
   - Admin routes require the token to include the Cognito group `"Admin"`.

---

## 🛒 Endpoints

### 1. `GET /products` — List Catalogue

Retrieves a paginated list of available products, with optional filtering by category or keyword search.

- **Method**: `GET`
- **Path**: `/products`
- **Authentication**: None (Public)
- **Headers**:
  - `Accept: application/json`
- **Query Parameters**:
  - `category` *(optional, string)*: Filter products by category (case-insensitive, e.g. `"Audio"`).
  - `search` *(optional, string)*: Substring match across product name, description, and category (max 80 chars).
  - `limit` *(optional, integer)*: Number of items per page (default: 50, max: 50).
  - `cursor` *(optional, base64url string)*: Opaque pagination cursor returned by a previous request.

#### Success Response (`200 OK`):
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": "prod-001",
        "name": "Aether Wireless Headphones",
        "description": "Closed-back wireless headphones with quiet profile.",
        "price": 8999,
        "previousPrice": 10999,
        "category": "Audio",
        "image": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e",
        "stock": 14,
        "featured": true,
        "newArrival": true,
        "createdAt": "2026-01-10T00:00:00.000Z"
      }
    ],
    "nextCursor": "eyJvZmZzZXQiOjF9",
    "count": 1
  },
  "products": [ /* same array as data.products for frontend compatibility */ ]
}
```

#### Error Response (`400 Bad Request`):
```json
{
  "success": false,
  "error": {
    "code": "INVALID_INPUT",
    "message": "limit must be an integer between 1 and 50."
  }
}
```

---

### 2. `GET /products/{id}` — Get Product by ID

Retrieves details for a single product.

- **Method**: `GET`
- **Path**: `/products/{id}`
- **Authentication**: None (Public)
- **Path Parameters**:
  - `id` *(required, string)*: The product identifier (e.g. `"prod-001"`).

#### Success Response (`200 OK`):
```json
{
  "success": true,
  "data": {
    "id": "prod-001",
    "name": "Aether Wireless Headphones",
    "description": "Closed-back wireless headphones with quiet profile.",
    "price": 8999,
    "previousPrice": 10999,
    "category": "Audio",
    "image": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e",
    "stock": 14,
    "featured": true,
    "newArrival": true,
    "createdAt": "2026-01-10T00:00:00.000Z"
  }
}
```

#### Error Response (`404 Not Found`):
```json
{
  "success": false,
  "error": {
    "code": "PRODUCT_NOT_FOUND",
    "message": "The requested product was not found."
  }
}
```

---

### 3. `GET /cart` — Get User Cart

Retrieves the calling user's shopping cart with real-time catalogue prices, stock levels, and line totals calculated by the server.

- **Method**: `GET`
- **Path**: `/cart`
- **Authentication**: User Identity (`X-CloudCart-User-Id` or JWT)
- **Headers**:
  - `X-CloudCart-User-Id: student-101` *(demo mode)*
  - `Authorization: Bearer <token>` *(jwt mode)*

#### Success Response (`200 OK`):
```json
{
  "success": true,
  "data": {
    "userId": "student-101",
    "items": [
      {
        "productId": "prod-001",
        "quantity": 2,
        "name": "Aether Wireless Headphones",
        "price": 8999,
        "image": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e",
        "category": "Audio",
        "stock": 14,
        "lineTotal": 17998
      }
    ],
    "total": 17998,
    "itemCount": 2,
    "updatedAt": "2026-10-20T14:00:00.000Z"
  }
}
```

---

### 4. `POST /cart` — Add or Update Cart Item

Adds an item to the calling user's cart or updates the quantity. Line totals and overall cart totals are always re-calculated on the server.

- **Method**: `POST`
- **Path**: `/cart`
- **Authentication**: User Identity (`X-CloudCart-User-Id` or JWT)
- **Headers**:
  - `Content-Type: application/json`
  - `X-CloudCart-User-Id: student-101` *(demo mode)*
  - `Authorization: Bearer <token>` *(jwt mode)*
- **Request Body**:
```json
{
  "productId": "prod-001",
  "quantity": 2,
  "mode": "add"
}
```
  - `productId` *(required, string)*: Valid product ID.
  - `quantity` *(required, integer)*: Whole number between 1 and 99 (or 0 when `mode: "set"`).
  - `mode` *(optional, string)*: `"add"` (default, increments existing quantity) or `"set"` (replaces quantity; 0 removes the item).

#### Success Response (`200 OK`):
```json
{
  "success": true,
  "data": {
    "userId": "student-101",
    "items": [
      {
        "productId": "prod-001",
        "quantity": 2,
        "name": "Aether Wireless Headphones",
        "price": 8999,
        "image": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e",
        "category": "Audio",
        "stock": 14,
        "lineTotal": 17998
      }
    ],
    "total": 17998,
    "itemCount": 2,
    "updatedAt": "2026-10-20T14:05:00.000Z"
  },
  "message": "Cart updated.",
  "productId": "prod-001",
  "quantity": 2
}
```

#### Error Response (`409 Conflict` — Insufficient Stock):
```json
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_STOCK",
    "message": "Insufficient stock for product prod-001."
  }
}
```

---

### 5. `POST /orders` — Create Order (Simulated Checkout)

Validates inventory availability, executes a transactional stock decrement in DynamoDB, clears the user's cart, and records a new order.

> **Demonstration Notice**: CloudCart uses simulated checkout. Real credit card details are neither accepted nor processed.

- **Method**: `POST`
- **Path**: `/orders`
- **Authentication**: User Identity (`X-CloudCart-User-Id` or JWT)
- **Headers**:
  - `Content-Type: application/json`
  - `X-CloudCart-User-Id: student-101`
- **Request Body**:
```json
{
  "items": [
    {
      "productId": "prod-001",
      "quantity": 2
    }
  ]
}
```
*(If `items` is omitted or empty, the server automatically checks out all items currently residing in the user's DynamoDB cart.)*

#### Success Response (`201 Created`):
```json
{
  "success": true,
  "data": {
    "id": "ord-7f3b891e-3cb4-4a2a-b9c1-923f18e11a01",
    "orderId": "ord-7f3b891e-3cb4-4a2a-b9c1-923f18e11a01",
    "userId": "student-101",
    "items": [
      {
        "productId": "prod-001",
        "name": "Aether Wireless Headphones",
        "quantity": 2,
        "unitPrice": 8999,
        "lineTotal": 17998
      }
    ],
    "total": 17998,
    "status": "CONFIRMED",
    "createdAt": "2026-10-20T14:10:00.000Z",
    "checkout": "simulated"
  },
  "orderId": "ord-7f3b891e-3cb4-4a2a-b9c1-923f18e11a01",
  "message": "Simulated checkout complete. No payment was processed."
}
```

#### Error Response (`409 Conflict` — Stock Conflict):
```json
{
  "success": false,
  "error": {
    "code": "CHECKOUT_CONFLICT",
    "message": "The order could not be completed because stock changed. Refresh the cart and try again."
  }
}
```

#### Error Response (`400 Bad Request` — Empty Cart):
```json
{
  "success": false,
  "error": {
    "code": "EMPTY_CART",
    "message": "The cart is empty."
  }
}
```

---

### 6. `GET /orders` — List User's Orders

Returns the caller's historical orders, sorted from newest to oldest via the `UserOrdersIndex` Global Secondary Index. Callers cannot view other users' orders.

- **Method**: `GET`
- **Path**: `/orders`
- **Authentication**: User Identity (`X-CloudCart-User-Id` or JWT)
- **Headers**:
  - `X-CloudCart-User-Id: student-101`

#### Success Response (`200 OK`):
```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "id": "ord-7f3b891e-3cb4-4a2a-b9c1-923f18e11a01",
        "orderId": "ord-7f3b891e-3cb4-4a2a-b9c1-923f18e11a01",
        "userId": "student-101",
        "items": [
          {
            "productId": "prod-001",
            "name": "Aether Wireless Headphones",
            "quantity": 2,
            "unitPrice": 8999,
            "lineTotal": 17998
          }
        ],
        "total": 17998,
        "status": "CONFIRMED",
        "createdAt": "2026-10-20T14:10:00.000Z",
        "checkout": "simulated"
      }
    ]
  },
  "orders": [ /* same array as data.orders */ ]
}
```

---

### 7. `GET /orders/{id}` — Get Single Order

Retrieves an authorized order by ID. Enforces strict user ownership.

- **Method**: `GET`
- **Path**: `/orders/{id}`
- **Authentication**: User Identity (`X-CloudCart-User-Id` or JWT)
- **Path Parameters**:
  - `id` *(required, string)*: Order identifier (e.g. `"ord-7f3b891e..."`).

#### Success Response (`200 OK`):
```json
{
  "success": true,
  "data": {
    "id": "ord-7f3b891e-3cb4-4a2a-b9c1-923f18e11a01",
    "orderId": "ord-7f3b891e-3cb4-4a2a-b9c1-923f18e11a01",
    "userId": "student-101",
    "items": [
      {
        "productId": "prod-001",
        "name": "Aether Wireless Headphones",
        "quantity": 2,
        "unitPrice": 8999,
        "lineTotal": 17998
      }
    ],
    "total": 17998,
    "status": "CONFIRMED",
    "createdAt": "2026-10-20T14:10:00.000Z",
    "checkout": "simulated"
  }
}
```

#### Error Response (`403 Forbidden` — Accessing Another User's Order):
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "You cannot access another user's order."
  }
}
```

---

### 8. `GET /admin/inventory` — Admin Inventory Overview

Returns stock levels and computed stock statuses for all catalogue products.

- **Method**: `GET`
- **Path**: `/admin/inventory`
- **Authentication**: Admin Authorization (`X-CloudCart-Admin-Key` or Cognito `Admin` group)
- **Headers**:
  - `X-CloudCart-Admin-Key: <DEMO_ADMIN_KEY>` *(dev mode)*
  - `Authorization: Bearer <token>` *(jwt mode)*

#### Success Response (`200 OK`):
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": "prod-001",
        "name": "Aether Wireless Headphones",
        "price": 8999,
        "stock": 14,
        "stockStatus": "IN_STOCK"
      },
      {
        "id": "prod-002",
        "name": "Graphite Mechanical Keyboard",
        "price": 6499,
        "stock": 3,
        "stockStatus": "LOW_STOCK"
      },
      {
        "id": "prod-009",
        "name": "Nimbus True Wireless Earbuds",
        "price": 3799,
        "stock": 0,
        "stockStatus": "OUT_OF_STOCK"
      }
    ],
    "totals": {
      "products": 3,
      "outOfStock": 1,
      "lowStock": 1
    }
  }
}
```

#### Error Response (`401 Unauthorized` / `403 Forbidden`):
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Admin key header is required in development mode."
  }
}
```

---

### 9. `PATCH /admin/products/{id}/stock` — Update Stock

Updates the available inventory stock for a product.

- **Method**: `PATCH`
- **Path**: `/admin/products/{id}/stock`
- **Authentication**: Admin Authorization
- **Headers**:
  - `Content-Type: application/json`
  - `X-CloudCart-Admin-Key: <DEMO_ADMIN_KEY>`
- **Request Body**:
```json
{
  "stock": 25
}
```

#### Success Response (`200 OK`):
```json
{
  "success": true,
  "data": {
    "id": "prod-001",
    "name": "Aether Wireless Headphones",
    "stock": 25,
    "price": 8999
  }
}
```

---

### 10. `PATCH /admin/orders/{id}/status` — Update Order Status

Transitions the status of an order.

- **Method**: `PATCH`
- **Path**: `/admin/orders/{id}/status`
- **Authentication**: Admin Authorization
- **Headers**:
  - `Content-Type: application/json`
  - `X-CloudCart-Admin-Key: <DEMO_ADMIN_KEY>`
- **Request Body**:
```json
{
  "status": "CANCELLED"
}
```
*(Permitted values: `"PENDING"`, `"CONFIRMED"`, `"CANCELLED"`)*

#### Success Response (`200 OK`):
```json
{
  "success": true,
  "data": {
    "orderId": "ord-7f3b891e-3cb4-4a2a-b9c1-923f18e11a01",
    "status": "CANCELLED",
    "total": 17998
  }
}
```

---

## 🌐 CORS Configuration

The API Gateway HTTP API enforces strict origin whitelisting:
- **`Access-Control-Allow-Origin`**: Configured via the `AllowedOrigin` parameter (e.g. `http://localhost:8080` in local testing, or the CloudFront/S3 website domain in production). Wildcard `*` is not used in production.
- **`Access-Control-Allow-Headers`**: `Content-Type`, `Authorization`, `X-CloudCart-User-Id`, `X-CloudCart-Admin-Key`.
- **`Access-Control-Allow-Methods`**: `GET`, `POST`, `PATCH`, `OPTIONS`.
- **`Access-Control-Max-Age`**: `600` (10 minutes).

---

## 🏷️ Error Code Reference

| Status Code | Error Code | Meaning |
|-------------|------------|---------|
| `400` | `INVALID_JSON` | Malformed JSON payload. |
| `400` | `PAYLOAD_TOO_LARGE` | Body exceeds 8 KB limit. |
| `400` | `INVALID_INPUT` | Field validation failed (e.g. quantity outside 1..99). |
| `400` | `INVALID_CURSOR` | Pagination cursor is invalid or tampered with. |
| `400` | `EMPTY_CART` | Cannot create an order with 0 items. |
| `401` | `UNAUTHORIZED` | Missing identity or missing admin key. |
| `403` | `FORBIDDEN` | Caller does not own the requested resource or lacks group. |
| `403` | `ADMIN_NOT_CONFIGURED` | Admin routes called in production without JWT configured. |
| `404` | `PRODUCT_NOT_FOUND` | Product ID does not exist in DynamoDB. |
| `404` | `ORDER_NOT_FOUND` | Order ID does not exist in DynamoDB. |
| `405` | `METHOD_NOT_ALLOWED` | HTTP method not supported for this path. |
| `409` | `INSUFFICIENT_STOCK` | Requested quantity exceeds current available inventory. |
| `409` | `CHECKOUT_CONFLICT` | Stock changed during checkout transaction (race condition). |
| `500` | `INTERNAL_ERROR` | Unhandled internal exception; safe error returned. |
