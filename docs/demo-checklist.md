# 🎤 CloudCart — Demo Day Checklist

Use this checklist to prepare for the project presentation and live demo.

---

## Before Demo Day

- [ ] All team members understand the architecture diagram
- [ ] Frontend runs locally without errors (open `index.html` in a browser)
- [ ] All four pages work: Home, Products, Cart, Admin
- [ ] Cart add/remove/checkout flow works end-to-end (demo mode)
- [ ] Inventory monitor test passes: `node --test automation/inventory-monitor.test.js`
- [ ] If AWS was deployed: `ApiUrl` is in `frontend/js/config.js` and CORS origin matches
- [ ] You know how to `sam delete` after the demo ([aws-cost-and-cleanup.md](./aws-cost-and-cleanup.md))
- [ ] `README.md` is up to date with team member names
- [ ] Code is pushed to a shared Git repository
- [ ] PowerPoint / slides are prepared covering:
  - [ ] Problem statement
  - [ ] Architecture diagram
  - [ ] Tech stack justification
  - [ ] Live demo
  - [ ] Challenges faced
  - [ ] Future scope

---

## Demo Flow (Suggested)

1. **Open the homepage** — show the neon-black design and tech stack cards
2. **Browse products** — use the search bar to filter
3. **Add items to cart** — show the toast notification and badge count
4. **Open cart** — change quantities, remove items
5. **Checkout** — show the demo order confirmation
6. **Admin dashboard** — show stats and inventory table
7. **Run inventory monitor** — execute test in terminal to show automation
8. **Show architecture** — walk through the architecture diagram
9. **Show SAM template** — explain the infrastructure-as-code approach

---

## Talking Points for Q&A

| Topic | Key point |
|-------|-----------|
| Why serverless? | No servers to manage, pay-per-use, auto-scaling |
| Why DynamoDB? | Fully managed NoSQL, low latency, scales with demand |
| Why S3 for hosting? | Cheap, fast, built-in CDN via CloudFront |
| Why SAM? | Simplifies Lambda + API Gateway deployment, version-controlled |
| What is EventBridge? | Managed event bus for scheduling and routing events |
| Demo vs production? | Demo mode uses local data; production uses API Gateway + Lambda |

---

## If Something Breaks During Demo

- **Products don't load?** — Check that `frontend/js/config.js` uses `mode: "demo"` locally, or `mode: "api"` plus a valid `apiBaseUrl`
- **Cart is empty after refresh?** — Cart uses `localStorage`, make sure same browser
- **Styles look wrong?** — Ensure all three CSS files are linked in the HTML
- **Test fails?** — Run from the `cloudcart/` root directory

---

## After Demo Day

- [ ] Gather feedback from the evaluator
- [ ] Document lessons learned
- [ ] Archive the project repository
