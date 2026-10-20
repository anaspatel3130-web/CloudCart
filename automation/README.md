# CloudCart Automation — Inventory Monitor

Scheduled inventory monitoring for CloudCart. The Lambda **reads** the existing Products table; it does **not** change stock, create orders, or talk to the browser.

This workflow is independently testable on a laptop. It has **not** been deployed to AWS from this work session.

## 1. Architecture

```
EventBridge schedule  (default: rate(1 day), disabled until deploy approval)
        │
        ▼
AWS Lambda  automation/inventory-monitor.js
        │
        ├── DynamoDB Scan of CloudCart-Products  (paginated)
        ├── Classify each product using the `stock` attribute
        ├── Structured JSON logs → CloudWatch Logs
        ├── Optional fingerprint in CloudCart-AutomationState  (dedupe)
        └── Optional SNS publish → CloudCart-InventoryAlerts
```

Schema used (already defined by the backend SAM template and `docs/api-contract.md`):

| Item | Value |
|------|--------|
| Table | `CloudCart-Products` (env `PRODUCTS_TABLE`) |
| Partition key | `id` (String) |
| Stock field | `stock` |
| Product name | `name` |

There is no stock index, so a **paginated Scan** is the access pattern. The monitor never assumes the first page contains every product.

## 2. How the inventory threshold works

Environment variable `LOW_STOCK_THRESHOLD` (SAM parameter `LowStockThreshold`, default **5**).

For each product:

| Status | Rule |
|--------|------|
| `OUT_OF_STOCK` | quantity is exactly `0` |
| `LOW_STOCK` | quantity is an integer `> 0` and `<=` threshold |
| `HEALTHY` | quantity is an integer `>` threshold |
| `INVALID` | missing, negative, non-integer, or non-numeric |

Quantities are validated **before** classification. Empty tables still succeed with `tableEmpty: true`.

## 3. How to run unit tests

No AWS account and no network are required.

```bash
cd automation
node --test inventory-monitor.test.js
```

From the repository root:

```bash
node --test automation/inventory-monitor.test.js
```

Optional: `cd automation && npm test` after `npm install` (install is only needed to **deploy** the Lambda, not to run these tests).

Classification is exported separately from AWS clients, so the tests inject fake DynamoDB/SNS.

## 4. How to invoke the function manually

Evaluators should not wait for the daily schedule.

**Local (no AWS), using the same handler the Lambda uses:**

```bash
node -e "require('./automation/inventory-monitor').createHandler({ env: { PRODUCTS_TABLE: 'CloudCart-Products', LOW_STOCK_THRESHOLD: '5' }, scanInventory: async () => ({ items: [{ id: 'prod-008', name: 'Mechanical Keyboard', stock: 3 }], pages: 1 }) })({}).then(r => console.log(JSON.stringify(r, null, 2)))"
```

**After a stack deploy you approved** (replace names as needed):

```bash
aws lambda invoke --function-name cloudcart-inventory-monitor --cli-binary-format raw-in-base64-out --payload file://automation/events/manual-invoke.json outfile.json
type outfile.json
```

The SAM logical name is `InventoryMonitorFunction`. The physical name is stack output `InventoryMonitorFunctionName` (`<stack>-inventory-monitor`).

**SAM local** (needs Docker + SAM CLI + `npm install` inside `automation/`):

```bash
cd backend
sam build
sam local invoke InventoryMonitorFunction --event ../automation/events/manual-invoke.json
```

`sam local invoke` still talks to real AWS if credentials and `PRODUCTS_TABLE` point at a real table. Use mocks or a dedicated lab account.

## 5. How the EventBridge schedule works

Defined once in `backend/template.yaml` on `InventoryMonitorFunction` → `Events.ScheduledCheck`. Do not create a second rule by hand.

| SAM parameter | Default | Meaning |
|---------------|---------|---------|
| `InventoryMonitorSchedule` | `rate(1 day)` | Rate or cron expression |
| `InventoryMonitorEnabled` | `false` | EventBridge does not invoke until this is `true` |

Example cron for 06:00 UTC daily: `cron(0 6 * * ? *)`.

## 6. How to inspect CloudWatch logs

After a deploy and at least one invocation:

1. CloudWatch → Log groups → `/aws/lambda/<InventoryMonitorFunction physical name>`
2. Look for JSON lines with `"service":"cloudcart-inventory-monitor"`
3. Useful `message` values: `inventory_monitor_started`, `inventory_monitor_summary`, `inventory_attention_required`, `inventory_monitor_succeeded`, `inventory_monitor_failed`

The Lambda also records duration, error count, and invocation count as standard CloudWatch metrics.

Logs do not include credentials, tokens, or personal data. Product ids and names used in the store catalogue may appear in the inventory report.

## 7. How to configure optional SNS alerts

Core monitoring works with SNS unset. CloudWatch logs are enough.

To enable email:

1. Deploy with `EnableInventoryAlerts=true` (creates topic `CloudCart-InventoryAlerts`).
2. Subscribe an email: `aws sns subscribe --topic-arn <InventoryAlertTopicArn> --protocol email --notification-endpoint you@example.com`
3. **Confirm the subscription** from the email AWS sends. Unconfirmed subscriptions receive nothing.
4. Do not hardcode addresses or topic ARNs in source. The Lambda reads `ALERT_TOPIC_ARN`.

A summary is published only when at least one product is `LOW_STOCK` or `OUT_OF_STOCK`. A SHA-256 fingerprint of those items is stored in `CloudCart-AutomationState` so **unchanged** inventory does not send another email.

If SNS publish fails, the inventory report still returns; `notification.error` is set and an error is logged. The invocation does **not** pretend monitoring failed because of DynamoDB.

Email subscriptions and SNS are optional. Leave `EnableInventoryAlerts=false` for a logs-only demo.

## 8. How to deploy with approval

This folder does **not** deploy by itself. Student 3 owns `sam deploy`. Do not run deploy without explicit team approval.

Possible AWS charges (pay-per-use, typically cents at student scale, still not free):

- Lambda invocations and duration
- DynamoDB read request units (and one small write to the automation state table when alerts are used)
- CloudWatch Logs storage
- EventBridge scheduled rules
- SNS: first 1,000 email notifications/month are in the AWS Free Tier; confirm current pricing
- If the stack also creates API Gateway, extra Lambdas, and two product/order tables, those have their own cost

Quotas that can bite a demo: Lambda concurrent executions, SNS sandbox/account limits, CloudWatch log retention.

Suggested deploy (Student 3), after `npm install` in `automation/` and `backend/`:

```bash
cd backend
sam build
sam deploy --guided --parameter-overrides InventoryMonitorEnabled=false EnableInventoryAlerts=false LowStockThreshold=5 InventoryMonitorSchedule="rate(1 day)"
```

Turn the schedule on only after a successful **manual** invoke.

## 9. How to clean up deployed resources

If this stack was deployed:

```bash
cd backend
sam delete
```

Or delete the CloudFormation stack in the AWS console. That removes the Lambdas, EventBridge rule, DynamoDB tables defined in the template (including `CloudCart-Products` / `CloudCart-Orders` / `CloudCart-AutomationState`), the SNS topic (if created), and log groups only if the template owns them. CloudWatch log groups sometimes remain; delete `/aws/lambda/…` if they linger.

Unsubscribe emails before deleting the topic if you created extra subscriptions outside the stack.

## 10. What remains unimplemented

- **Not deployed from documentation alone.** No live EventBridge rule, Lambda, or SNS topic is created until someone runs `sam deploy`.
- The **admin HTML page** still edits local demo data. Live stock changes use `GET /admin/inventory` and `PATCH /admin/products/{id}/stock` with an admin key or JWT — not the browser admin form.
- **No CloudWatch alarms** (error-rate / throttle) were added (avoids extra cost).
- Email sending is not guaranteed until a human confirms the SNS subscription.
- The catalogue is empty in DynamoDB until you run the seed script.

## Environment variables

| Variable | Required | Source |
|----------|----------|--------|
| `PRODUCTS_TABLE` | Yes in AWS | SAM → `CloudCart-Products` |
| `LOW_STOCK_THRESHOLD` | No (default 5) | SAM parameter |
| `ALERT_TOPIC_ARN` | No | Empty disables SNS |
| `AUTOMATION_STATE_TABLE` | Recommended if SNS is on | `CloudCart-AutomationState` |

Never put AWS keys in this repo or in Lambda environment variables. The execution role is enough.

## Deploy checklist

1. Keep using the **single** `backend/template.yaml` (parameters, `AutomationStateTable`, optional SNS, `InventoryMonitorFunction` with `CodeUri: ../automation`). Do not clone the Products table.
2. `npm install` in `automation/` and `backend/`, then `sam validate` / `sam build` from `backend/`.
3. Deploy only with approval; keep `InventoryMonitorEnabled=false` until a manual invoke works.
4. If SNS is wanted, deploy with `EnableInventoryAlerts=true`, subscribe email, confirm the message.
5. Grant no extra `*` IAM. Monitor policies: DynamoDB **read** on products, **GetItem/PutItem** on the state table, SNS publish only when alerts are enabled.
