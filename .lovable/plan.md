## Phase 1 — Clickable entity inventory (report-first)

Before any code, produce a single audit table covering all 8 intelligence tabs + 5 list pages, with columns:
**entity • surface (tab/list/section) • currently clickable? • current target (drawer/page/none) • demo-correct? (scoped to DEMO_BIZ)**

Expected coverage (10 entity types):

| Entity | Surfaces today | Current state |
|---|---|---|
| Customer | Customers list, Revenue tab top-customers, Invoice rows (customer name), Cockpit aging | Drawer exists (`CustomerDetail.tsx`), opens via `?drawer=customer&id=` |
| Vendor | Vendors list, Cost tab top-vendors, Expense rows (vendor name) | Drawer exists (`VendorDetail.tsx`) |
| Invoice | Invoices list, Customer drawer history, Liquidity AR section, Cockpit overdue | Drawer exists (`InvoiceDetail.tsx`) — thin |
| Expense | Expenses list, Vendor drawer history, Cost tab category drilldown | Drawer exists (`ExpenseDetail.tsx`) — thin |
| GST Filing | GST tab filings table | **No detail view** |
| Risk Register entry | Governance tab risk register | **No detail view** |
| Insurance Policy | Governance tab insurance section | **No detail view** |
| Employee | HR tab roster, Employees list page | **No detail view** |
| Sales Pipeline Deal | Revenue tab pipeline section | **No detail view** |
| Bank Transaction | Liquidity tab transactions list | **No detail view** |

Phase 1 deliverable: a single markdown table reported in chat, plus list of any surfaces where the entity name renders as plain text and needs to become clickable.

## Phase 2 — Extend the drawer pattern

Use the existing `DetailDrawer` + `useDrawer()` pattern (URL-controlled `?drawer=X&id=Y`, `Sheet` from shadcn, IntelligenceProvider mode auto-routes back to `/demo/*`). Add 6 new `DrawerKind` values: `gst_filing | risk | insurance | employee | deal | bank_txn`. All new detail components live under `src/components/dashboard/detail/`. All open through the same `useDrawer().open(kind, id)` so navigation, ESC, backdrop, URL sharing, and back-to-/demo behavior come free.

## Phase 3 — Hooks

Add to `src/hooks/dashboard/useDashboardData.ts` (mode-aware via `useBusinessId()` already fixed this session):
- `useGstFilingDetail(id)` — from `gst_filings_demo` for demo, `gst_filings` for live
- `useRiskDetail(id)` — `risk_register`
- `useInsuranceDetail(id)` — `insurance_policies`
- `useEmployeeDetail(id)` — `employees` + LEFT JOIN `esop_grants` + LEFT JOIN `compensation_benchmarks` on designation
- `useDealDetail(id)` — `sales_pipeline` + LEFT JOIN `customers` when `closed_won`
- `useBankTxnDetail(id)` — `bank_transactions`
- Enrich `useCustomerDetail` to also return on-time-payment-rate + linked `closed_won` deal
- Enrich `useVendorDetail` to return monthly-spend series
- Enrich `useInvoiceDetail` to return computed days_overdue + partial-payment split (already partially present)
- Enrich `useExpenseDetail` to compute recurring-pattern stats for the vendor

## Phase 4 — Detail component specs

All reuse: `DrawerHeader`, `DrawerSection`, `DrawerMetricRow`, `StatusBadgeFor` from `detail/parts.tsx`; `FynButton`, `FynTable`, `FynLoading` from `dashboard/ui.tsx`; `formatINR`. New status mappings added to `StatusBadgeFor` for `risk_score`, `mitigation_status`, `policy_status`, `deal_stage`, `filing_status`, `employee_status`.

Each detail page implements exactly the field list in the brief (header, summary metrics, history table or trend chart, plain-language insight line where the brief specifies one, action buttons with toast for non-mutating demo actions).

Charts use the existing Recharts wrappers (`src/components/ui/chart.tsx`) so they inherit the v3-compatible defs fix from earlier today. Mini sparkline = `LineChart` for customer revenue and vendor monthly spend; risk heatmap = small 5×5 CSS grid (no chart dependency).

## Phase 5 — Wire entry points

For each surface where an entity name currently renders as plain text, wrap in a button that calls `open(kind, id)`. Surfaces to update:
- Revenue tab top-customers list, sales pipeline section
- Cost tab top-vendors list, category breakdown rows
- Liquidity tab AR aging buckets (invoice numbers), bank transactions list
- GST tab filings table rows
- Governance tab risk register + insurance tables
- HR tab employee roster
- Investor tab cap table → ESOP grants (route to Employee drawer for grantee)
- Cockpit panel overdue invoices already wired

## Phase 6 — Verification (per session standard)

Spawn Playwright as authenticated **non-DEMO_BIZ user** (the only case that exposes data-leakage bugs per today's findings). Click through every entity surface in the live `/demo/*` route and screenshot each opened drawer. Confirm: (1) drawer renders, (2) data is DEMO_BIZ's data, not the auth user's, (3) status badges match existing list-page colors, (4) back navigation lands at `/demo/*` not `/dashboard/*`, (5) action toasts fire.

Report back as a single status table:
**entity • drawer built • opened from live surface • real demo data • design matches • notes**

## Phase 7 — Out of scope (will not touch)

- Marketing pages (`/`, `/pricing`, `/about`, `/login`, `/signup`) — per memory rule.
- `/dashboard/*` pages — only the shared components they share with `/demo/*` are affected; route trees unchanged.
- No schema migrations expected. If a needed field is genuinely missing (unlikely given the rebuilt data), I'll stop and flag — per your "real product decision" carve-out.

## Technical notes

- All new files under `src/components/dashboard/detail/` + 1 edit to `DetailDrawer.tsx` switch statement.
- No new dependencies. Recharts + shadcn Sheet + existing Fyn primitives only.
- Single pass, no schema changes anticipated.
- Estimated diff: ~6 new detail components (~120 LoC each), ~6 new hooks (~40 LoC each), `parts.tsx` badge extensions, `DetailDrawer.tsx` switch additions, ~8 tab/section edits to wire clicks.

Ready to start Phase 1 inventory on approval.