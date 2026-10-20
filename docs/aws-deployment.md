# CloudCart — AWS deployment

This project uses **one AWS SAM template**: `backend/template.yaml`.
That stack owns the HTTP API, API Lambdas, DynamoDB tables, the inventory-monitor
Lambda from `automation/`, optional SNS alerts, and optional private S3 + CloudFront
frontend hosting.

Nothing in this document is already running in AWS unless you (or a teammate)
deployed it. This session did **not** create billable resources.

Suggested region for this course project: **`ap-south-1`** (Mumbai). Resource names
below assume `TableNamePrefix=CloudCart`.

---

## 0. Architecture and deploy order

There is only one stack. Deploy it once from `backend/`.

| Order | What | Notes |
|------:|------|--------|
| 1 | SAM stack (`backend/template.yaml`) | Creates API, tables, Lambdas, monitor |
| 2 | Record `ApiUrl` from stack outputs | Paste into `frontend/js/config.js` |
| 3 | Seed products (optional) | `backend/scripts/seed-products.js` |
| 4 | Frontend upload | Manual `aws s3 sync` **or** enable `EnableFrontendHosting` |
| 5 | Turn on the inventory schedule | Only after a successful **manual** Lambda invoke |
| 6 | SNS email (optional) | Only if `EnableInventoryAlerts=true` |

Do **not** create a second DynamoDB Products table or a second inventory-monitor
rule. Automation is already wired in the backend template.

---

## 1. Install and verify the AWS CLI

Windows (PowerShell):

```powershell
aws --version
```

Install from [AWS CLI v2](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)
if the command is missing.

---

## 2. Install and verify AWS SAM CLI

```powershell
sam --version
```

Install from [Installing the AWS SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html).
`sam build` for Node.js does not require Docker. `sam local invoke` **does**.

On the development machine used to finish this repository, `sam` and `aws`
were **not** on `PATH`. Local unit tests still ran. After you install the CLIs,
run the commands in section 5 yourself. This repository still has **not** been
deployed to AWS from this work.

---

## 3. Configure an AWS profile securely

Never put access keys in the repository.

```powershell
aws configure --profile cloudcart
```

You will be prompted for an access key, secret, region, and output format.
Use region `ap-south-1` and output `json`. Prefer an IAM user/role that can
create CloudFormation, Lambda, API Gateway, DynamoDB, IAM roles, Logs, and
(optionally) S3, CloudFront, SNS, and Events — not `AdministratorAccess` if
your course account can use a narrower lab role.

Verify:

```powershell
aws sts get-caller-identity --profile cloudcart
aws configure get region --profile cloudcart
```

---

## 4. Select the AWS region

```powershell
$env:AWS_PROFILE = "cloudcart"
$env:AWS_REGION = "ap-south-1"
$env:AWS_DEFAULT_REGION = "ap-south-1"
```

Copy `backend/samconfig.toml.example` to `backend/samconfig.toml` if you want
repeatable local SAM defaults. `samconfig.toml` is gitignored.

---

## 5. Validate and build

From the repository:

```powershell
cd backend
npm install
cd ..\automation
npm install
cd ..\backend
sam validate --lint --region ap-south-1
sam build
```

`sam build` packages `CodeUri: .` (backend) and `CodeUri: ../automation`
(inventory monitor). It does not deploy.

Local invoke of the monitor (needs Docker + SAM; talks to **real** DynamoDB if
credentials and table names point at AWS):

```powershell
sam local invoke InventoryMonitorFunction --event ..\automation\events\manual-invoke.json --region ap-south-1
```

Safer: run the automation unit tests with no AWS account:

```powershell
cd ..\automation
npm test
```

---

## 6. Deploy (only with your approval)

This command **creates billable AWS resources**. Do not run it until you intend
to spend against the account.

```powershell
cd backend
sam deploy --guided --profile cloudcart --region ap-south-1 --parameter-overrides `
  AllowedOrigin="http://localhost:8080" `
  AuthMode="demo" `
  DeployStage="dev" `
  InventoryMonitorEnabled="false" `
  EnableInventoryAlerts="false" `
  EnableFrontendHosting="false" `
  LowStockThreshold="5" `
  InventoryMonitorSchedule="rate(1 day)" `
  TableNamePrefix="CloudCart" `
  LogRetentionDays="14"
```

Leave `DemoAdminKey` empty at the prompt unless you need `/admin/*` in **dev**.
Never commit that value.

On later deploys (after `samconfig.toml` exists):

```powershell
cd backend
sam deploy --profile cloudcart
```

---

## 7. Record the API Gateway URL

```powershell
aws cloudformation describe-stacks --stack-name cloudcart --profile cloudcart --region ap-south-1 --query "Stacks[0].Outputs" --output table
```

Copy **`ApiUrl`**. Example shape (not a real endpoint):

```text
https://xxxxxxxx.execute-api.ap-south-1.amazonaws.com/Prod
```

---

## 8. Configure the frontend API URL

Edit `frontend/js/config.js` (the existing configuration mechanism):

```javascript
window.CLOUDCART_CONFIG = Object.assign(
  {
    mode: "api",
    apiBaseUrl: "https://xxxxxxxx.execute-api.ap-south-1.amazonaws.com/Prod",
    userId: "demo-user",
  },
  window.CLOUDCART_CONFIG || {}
);
```

See `frontend/js/config.example.js`. Do not add AWS keys.

If you later host the site on CloudFront, redeploy the stack with
`AllowedOrigin` set to `https://<distribution-id>.cloudfront.net` or the
browser will block API calls.

---

## 9. Upload the frontend

The frontend is already static HTML/CSS/JS. Entry files:

| Page | File |
|------|------|
| Home | `frontend/index.html` |
| Catalogue | `frontend/products.html` |
| Cart | `frontend/cart.html` |
| Admin (demo catalogue editor) | `frontend/admin.html` |

Assets are relative (`css/`, `js/`). Keep that folder layout when you upload.

### Option A — private S3 + CloudFront (preferred)

Redeploy with `EnableFrontendHosting=true`. Then:

```powershell
aws s3 sync ..\frontend s3://BUCKET_NAME --profile cloudcart --region ap-south-1 --exclude "*.example.js" --exclude "js/config.example.js"
aws cloudfront create-invalidation --distribution-id DISTRIBUTION_ID --paths "/*" --profile cloudcart
```

`BUCKET_NAME` and `DISTRIBUTION_ID` are stack outputs `FrontendBucketName` and
`CloudFrontDistributionId`. The bucket stays **private**. CloudFront is the only
reader (origin access control). The public URL is output `CloudFrontUrl` (HTTPS).

### Option B — S3 website hosting (HTTP, public objects)

This is simpler and often used in labs, but it makes the **bucket website
endpoint public** and does **not** provide HTTPS on the `s3-website` URL.

```powershell
# Example only — creates a public website bucket. Prefer Option A for HTTPS.
aws s3 mb s3://YOUR-UNIQUE-cloudcart-frontend --profile cloudcart --region ap-south-1
```

Then enable static website hosting in the S3 console (index document
`index.html`) and upload `frontend/`. You must also attach a bucket policy that
allows `s3:GetObject` for `*` — that is public read of every object.

### S3 website vs private S3 + CloudFront

| | S3 website hosting | Private S3 + CloudFront |
|--|--------------------|-------------------------|
| HTTPS | Not on the website endpoint | Yes (CloudFront certificate) |
| Public bucket | Yes | No |
| Cost | Storage + requests | Storage + CloudFront request/data fees |
| Best for | Quick HTTP lab | Demo URL you can share over HTTPS |

---

## 10. Configure the inventory-monitor schedule

Default SAM parameter `InventoryMonitorEnabled=false` so EventBridge does not
invoke until you have seeded data and tested once.

Manual invoke after deploy:

```powershell
aws lambda invoke --function-name cloudcart-inventory-monitor --cli-binary-format raw-in-base64-out --payload file://..\automation\events\manual-invoke.json outfile.json --profile cloudcart --region ap-south-1
Get-Content outfile.json
```

The physical name is stack output `InventoryMonitorFunctionName` (pattern
`<stack>-inventory-monitor`).

Then redeploy with `InventoryMonitorEnabled=true` and
`InventoryMonitorSchedule="rate(1 day)"` (or `cron(0 6 * * ? *)` for 06:00 UTC).

Optional email: `EnableInventoryAlerts=true`, subscribe, **confirm** the SNS
email. See `automation/README.md`.

---

## 11. Test

### Seed catalogue

```powershell
cd backend
$env:AWS_PROFILE = "cloudcart"
$env:AWS_REGION = "ap-south-1"
$env:PRODUCTS_TABLE = "CloudCart-Products"
$env:SEED_CONFIRM = "yes"
npm run seed
```

### HTTP API (replace the URL)

```powershell
curl https://xxxxxxxx.execute-api.ap-south-1.amazonaws.com/Prod/products
curl https://xxxxxxxx.execute-api.ap-south-1.amazonaws.com/Prod/products/prod-001
curl https://xxxxxxxx.execute-api.ap-south-1.amazonaws.com/Prod/cart -H "X-CloudCart-User-Id: demo-user"
```

Checkout and admin calls need JSON bodies. Admin in `STAGE=dev` also needs
`X-CloudCart-Admin-Key` matching `DemoAdminKey`. `STAGE=prod` with
`AuthMode=demo` **rejects** admin routes (`ADMIN_NOT_CONFIGURED`).

### Frontend

1. Serve `frontend/` locally or open the CloudFront URL.
2. Confirm `mode: "api"` and `apiBaseUrl`.
3. Browse products, add to cart, checkout.
4. Confirm CORS: the page origin must equal `AllowedOrigin`.

### CloudWatch

Log groups (14-day retention):

- `/aws/lambda/<stack>-products`
- `/aws/lambda/<stack>-cart`
- `/aws/lambda/<stack>-orders`
- `/aws/lambda/<stack>-admin`
- `/aws/lambda/<stack>-inventory-monitor`

Look for JSON lines with `message":"request"` (API) or
`"service":"cloudcart-inventory-monitor"` (automation).

---

## 12. Clean up

See [aws-cost-and-cleanup.md](./aws-cost-and-cleanup.md).

```powershell
cd backend
sam delete --stack-name cloudcart --profile cloudcart --region ap-south-1
```

---

## Parameters (reference)

| Parameter | Default | Purpose |
|-----------|---------|---------|
| `AllowedOrigin` | `http://localhost:8080` | CORS allow-list (single origin) |
| `AuthMode` | `demo` | `demo` header identity or `jwt` claims |
| `DeployStage` | `dev` | `prod` disables demo admin keys |
| `DemoAdminKey` | empty | Dev-only admin header |
| `CognitoUserPoolId` / `CognitoUserPoolClientId` | empty | Existing pool only; attaches HTTP API JWT authorizer when `AuthMode=jwt` |
| `TableNamePrefix` | `CloudCart` | Table names `{prefix}-Products` etc. |
| `InventoryMonitorSchedule` | `rate(1 day)` | EventBridge expression |
| `LowStockThreshold` | `5` | Monitor classification |
| `InventoryMonitorEnabled` | `false` | Schedule on/off |
| `EnableInventoryAlerts` | `false` | Create SNS topic |
| `EnableFrontendHosting` | `false` | Private S3 + CloudFront |
| `FrontendBucketName` | empty | Optional globally unique name |
| `LogRetentionDays` | `14` | CloudWatch retention |

This template does **not** create a Cognito user pool (extra cost and unused by
the current storefront). JWT support is opt-in against an existing pool.

---

## Authentication (keep this consistent)

| Surface | `AuthMode=demo` (course default) | `AuthMode=jwt` + Cognito IDs |
|---------|----------------------------------|------------------------------|
| `GET /products` | Public | Public (no gateway authorizer) |
| `/cart`, `/orders` | `X-CloudCart-User-Id` or `demo-user` | HTTP API JWT authorizer + Lambda `sub` |
| `/admin/*` | `X-CloudCart-Admin-Key` in **dev** only | JWT + Cognito group `Admin` |

The admin HTML page still edits **local demo data**. It does not send the admin
key. Use curl/Postman for live `/admin/*` calls.

The current storefront does **not** implement a Cognito Hosted UI. Stay on
`AuthMode=demo` for the college demonstration unless you add sign-in.

---

## Handler and schema checklist

| Lambda | Handler | Routes |
|--------|---------|--------|
| `src/handlers/products.handler` | Node.js 22 | `GET /products`, `GET /products/{id}` |
| `src/handlers/cart.handler` | Node.js 22 | `GET /cart`, `POST /cart` |
| `src/handlers/orders.handler` | Node.js 22 | `POST /orders`, `GET /orders`, `GET /orders/{id}` |
| `src/handlers/admin.handler` | Node.js 22 | `GET /admin/inventory`, `PATCH /admin/products/{id}/stock`, `PATCH /admin/orders/{id}/status` |
| `automation/inventory-monitor.handler` | Node.js 22 | EventBridge schedule / manual invoke |

| Table | Keys | Used by |
|-------|------|---------|
| `CloudCart-Products` | PK `id` | Products, cart, orders, admin, monitor |
| `CloudCart-Carts` | PK `userId` | Cart, checkout |
| `CloudCart-Orders` | PK `orderId`, GSI `UserOrdersIndex` (`userId` + `createdAt`) | Orders, admin status |
| `CloudCart-AutomationState` | PK `pk` | Monitor SNS fingerprint only |

Environment variables match `backend/src/lib/config.js` and
`automation/inventory-monitor.js`.

---

## Manual steps that cannot be finished locally

- Installing AWS CLI v2 and AWS SAM CLI if they are missing (`sam` / `aws` not on PATH here)
- Running `sam validate --lint` and `sam build` after those CLIs are installed
- Creating the live API Gateway URL (`sam deploy` — billable; needs your approval)
- Seeding DynamoDB in your account
- Confirming an SNS email subscription
- Opening a real CloudFront URL
- Paying for or cleaning up an AWS account
