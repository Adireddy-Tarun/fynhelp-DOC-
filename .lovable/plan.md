## Goal
Run an end-to-end browser test of the public product demo (`/demo/*`) and adjacent flows, then report every broken thing found — no code changes.

## Scope
Demo is public (no auth required per `DemoShell` footer), so this can run without a signed-in session.

Routes to exercise:
1. `/demo` (or `/demo/dashboard`) — Intelligence shell entry
2. All 8 tabs: Liquidity, Revenue, Cost, GST & Tax, Governance, HR & Workforce, Investor, Ask Fynny
3. Header actions (Export/PDF/etc.) and LiveTimestamp render
4. Footer links: `/demo/login`, `/demo/onboarding`
5. Demo list pages: `/demo/customers`, `/demo/vendors`, `/demo/invoices`, `/demo/expenses`, `/demo/employees`, `/demo/gst`, `/demo/risks`, `/demo/insurance`, `/demo/deals`, `/demo/bank`
6. Detail routes (`/demo/customers/:id` etc.) — click one row per list to verify navigation
7. `/demo/onboarding` chat flow (send one message, check Supabase insert doesn't error)
8. `/demo/upload` and `/demo/login` render

## Method
Playwright headless Chromium at `http://localhost:8080`. Per route:
- Navigate, wait for network idle
- Capture screenshot to `/tmp/browser/demo-test/`
- Capture console errors + failed network requests
- Check for visible error boundaries, empty tables where data is expected, broken images, 404s

For the intelligence shell:
- Click each of 8 tabs; screenshot each; log any React error or empty tab
- Check `useCustomers`, `useInvoices` etc. actually return rows for `DEMO_BIZ` (`4b30494f-...`) — if a hook errors or returns 0 rows the tab will look broken

For lists:
- Verify rows render; click first row → verify detail page loads without crash

For onboarding:
- Type an answer, submit, verify next question appears; do NOT complete the flow (avoids polluting `demo_organizations`)

## Deliverable
A single report grouped as:
- **Broken** (route + exact console error / network failure / visual defect + screenshot path)
- **Warnings** (empty states where data expected, slow loads, minor visual issues)
- **OK** (routes that passed cleanly)

No code will be modified. If issues are found, I'll ask before proposing fixes.
