# CloudCart — Cost notes and cleanup

This is a student mini-project. Services are configured to **minimize idle cost**,
but **nothing is guaranteed free**. Charges depend on AWS region, usage, account
credits, and **current** AWS pricing. Always check the AWS Pricing pages and your
Billing dashboard.

This repository does **not** deploy itself. Cost starts only after someone runs
`sam deploy` or creates resources in the console.

---

## Potentially billable services

| Service | Why it might cost money | Idle cost if unused after deploy |
|---------|-------------------------|----------------------------------|
| AWS Lambda | Invocations and GB-seconds | Essentially none if unused |
| API Gateway HTTP API | Requests | Essentially none if unused |
| DynamoDB (on-demand) | Read/write request units + storage | Storage of leftover items |
| CloudWatch Logs | Ingestion and storage | Storage until retention/deletion |
| EventBridge Scheduler / scheduled rule | Rule + invocations when enabled | Small; turn the rule off |
| SNS email | Notifications (and unused topics) | Low; unconfirmed subscriptions still exist |
| S3 | Storage and requests | Storage of frontend objects |
| CloudFront | Requests and data transfer out | Distribution exists until deleted |
| Cognito (not created by default) | MAU beyond free tier | Monthly if you create a pool |
| CloudFormation | Free for the stack itself | N/A |
| IAM roles | Free | N/A |
| Data transfer | Internet egress | Only when traffic happens |

HTTP API, Lambda, DynamoDB on-demand, and S3 often fit inside the AWS Free Tier
for a short demo — **Free Tier is not a promise** and expires or is account-specific.

---

## Cost-saving choices already in the template

- **On-demand DynamoDB** (`PAY_PER_REQUEST`) — no provisioned capacity sitting idle.
- **No point-in-time recovery** — PITR adds backup storage cost; skipped for this lab.
- **AWS-owned DynamoDB encryption** (`SSEEnabled`) — no customer-managed KMS key charges.
- **128 MB Lambda**, 10 s API timeout, 30 s monitor timeout.
- **Inventory schedule off by default** (`InventoryMonitorEnabled=false`).
- **SNS off by default** (`EnableInventoryAlerts=false`).
- **CloudFront/S3 hosting off by default** (`EnableFrontendHosting=false`).
- **No Cognito user pool** created by the stack.
- **CloudWatch log retention 14 days** so logs do not live forever.
- **CloudFront `PriceClass_100`** (cheaper edge footprint; viewers in India may
  hit farther edges).
- **No X-Ray tracing, no WAF, no NAT gateway, no always-on compute.**

Avoid: extra global secondary indexes, multi-region replicas, provisioned
DynamoDB, `ADMINISTRATOR` IAM, public S3 listing of unrelated buckets, and
leaving `sam local` pointed at production tables.

---

## How to inspect resources and usage

```powershell
$env:AWS_PROFILE = "cloudcart"
$env:AWS_REGION = "ap-south-1"

aws cloudformation describe-stacks --stack-name cloudcart
aws cloudformation list-stack-resources --stack-name cloudcart
aws lambda list-functions --query "Functions[?starts_with(FunctionName, 'cloudcart')]"
aws dynamodb list-tables
aws logs describe-log-groups --query "logGroups[?contains(logGroupName, 'cloudcart')]"
aws events list-rules --query "Rules[?contains(Name, 'inventory-monitor')]"
```

Billing:

1. AWS Console → **Billing and Cost Management** → Bills / Cost Explorer.
2. Filter by service (Lambda, DynamoDB, AmazonCloudFront, AmazonS3, AmazonApiGateway, AmazonSNS, AmazonCloudWatch, AWSEvents).
3. Confirm the region `ap-south-1` and any global services (CloudFront, IAM, Route 53).

---

## Leftover resources to look for

After a failed deploy, these sometimes remain:

- CloudFormation stack in `ROLLBACK_COMPLETE` or `DELETE_FAILED`
- Lambda log groups if they were created outside the template
- S3 buckets that are **not empty** (CloudFormation cannot delete them until you empty them)
- CloudFront distributions (can take several minutes to disable/delete)
- SNS email subscriptions you created by hand
- Extra buckets from S3 website experiments
- `samconfig.toml` pointing at an old stack name

```powershell
aws cloudformation list-stacks --stack-status-filter CREATE_COMPLETE UPDATE_COMPLETE ROLLBACK_COMPLETE DELETE_FAILED --query "StackSummaries[?contains(StackName, 'cloudcart')]"
aws s3 ls
```

---

## Safe cleanup after the demonstration

1. Unsubscribe any SNS emails you confirmed.
2. Empty the frontend bucket if hosting was enabled:

```powershell
aws s3 rm s3://FRONTEND_BUCKET --recursive --profile cloudcart --region ap-south-1
```

3. Delete the stack (this is destructive — tables and data go away):

```powershell
cd backend
sam delete --stack-name cloudcart --profile cloudcart --region ap-south-1
```

4. Confirm the stack is gone:

```powershell
aws cloudformation describe-stacks --stack-name cloudcart --profile cloudcart --region ap-south-1
```

Expect `does not exist` when cleanup succeeded.

5. If log groups linger:

```powershell
aws logs delete-log-group --log-group-name /aws/lambda/cloudcart-products --profile cloudcart --region ap-south-1
```

Repeat for `-cart`, `-orders`, `-admin`, `-inventory-monitor`.

---

## What may need manual cleanup

| Resource | Why |
|----------|-----|
| Non-empty S3 bucket | Stack delete waits until objects are gone |
| CloudFront | Disable/delete can take 5–15 minutes |
| SNS confirmed emails | Human-created subscriptions |
| Extra S3 website buckets | Not in the SAM stack if you created them by hand |
| IAM leftover roles | Rare, only if delete failed mid-way |
| Cost Explorer / budgets | You may have created these outside the stack |

Do **not** run `aws s3 rb --force` against a bucket you did not create for this project.

---

## Destroying data

`sam delete` removes `CloudCart-Products`, `CloudCart-Carts`, `CloudCart-Orders`,
and `CloudCart-AutomationState` (names follow `TableNamePrefix`). There is no
PITR. Export anything you need **before** you delete the stack.
