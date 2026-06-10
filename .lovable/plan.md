## Goal
Replace hardcoded numbers in the `/dashboard/*` cockpit with live Lovable Cloud queries, and add drill-down list views + detail drawers for Customers, Vendors, Invoices, Expenses, Employees.

## 1. Database (single migration)

Create 8 new tables in the `public` schema, alongside existing ones (existing `employees`, `gst_filings`, `receivables`, `payables` are left untouched). All scoped to `business_id`, with the brief's exact column names.

New tables: `customers`, `vendors`, `invoices`, `expenses`, `bank_transactions`, `employees_demo`, `gst_filings_demo`, `clients`.

Each table:
- `id uuid pk`, `business_id uuid not null`, `created_at`, `updated_at`
- GRANTs to `authenticated` (SELECT/INSERT/UPDATE/DELETE) and `service_role` (ALL)
- RLS enabled with policy `business_id = public.get_user_business_id()` (helper already exists)
- FKs: `invoices.customer_id → customers.id`, `expenses.vendor_id → vendors.id`
- `updated_at` trigger using existing `public.update_updated_at_column()`

Status enums use `text` with CHECK constraints matching the brief (e.g. invoice status one of `draft|sent|partially_paid|paid|overdue|cancelled`).

## 2. Seed data

After migration approval, insert deterministic synthetic rows for `business_id = 4b30494f-4c30-4a74-a6bb-6bf56493a97d`:
- 20 customers (Indian SME names, mixed cities, categories Enterprise/SMB/Startup)
- 20 vendors (SaaS, Logistics, Office, Marketing categories)
- 40 invoices spread over last 6 months; ~30% paid, 20% sent, 25% overdue, 15% partially_paid, 10% draft
- 36 expenses across 8 categories, 60% Paid / 40% Pending
- 40 bank_transactions ending today with running `balance`
- 10 employees across 4 departments
- 11 gst_filings (GSTR-1, GSTR-3B) over last 6 months
- 20 clients (CA-firm style records)

Amounts in INR, totals math-consistent (subtotal+tax=total; paid+outstanding=total).

## 3. Data layer

`src/hooks/dashboard/` — typed React Query hooks, one per query in the brief:
- `useLiquidityMetrics` (gross burn, net burn, runway, cash balance)
- `useOverdueInvoices`, `useUpcomingPayments`
- `useRevenueTrend`, `useTopCustomers`
- `useExpensesByCategory`, `useVendorSpend`, `usePersonnelCosts`
- `useGstFilings`, `useItcSummary`
- List-page hooks: `useCustomers`, `useVendors`, `useInvoices`, `useExpenses`, `useEmployees` (with search/filter/sort/pagination params)
- Detail hooks: `useCustomerDetail(id)`, `useVendorDetail(id)`, `useInvoiceDetail(id)`, `useExpenseDetail(id)`

All currency formatting via existing `formatINR` in `src/lib/indian-format.ts`.

## 4. Cockpit rewrite

Replace hardcoded values in:
- `src/pages/dashboard/LiquidityIntelligencePage.tsx`
- `src/pages/dashboard/RevenueIntelligencePage.tsx`
- `src/pages/dashboard/CostPage.tsx`
- `src/pages/dashboard/GSTPage.tsx`
- `src/pages/dashboard/CockpitPage.tsx` (top KPI strip)

Each card gets:
- Loading skeleton, error fallback, empty state
- `cursor-pointer`, hover lift+glow per brief, small `→` arrow at 30% opacity top-right
- `onClick` navigating to its list route or opening the relevant drawer
- "View all →" link added under section headers (overdue invoices, top customers, vendor spend, etc.)

## 5. New list pages

Routes registered in `src/App.tsx`:
- `/dashboard/customers` (rewrite existing `CustomersPage.tsx` to use `customers` table)
- `/dashboard/vendors` (rewrite existing `VendorsPage.tsx`)
- `/dashboard/invoices` (new)
- `/dashboard/expenses` (new)
- `/dashboard/employees` (new — distinct from existing `/dashboard/hr`)

Shared `ListPageShell` component built on `FynCard` / `FynTable` / `FynBadge` primitives:
- Header: `"<Entity> (count)"`, breadcrumb `Dashboard > <Entity>`, "← Back to Cockpit" link
- Debounced search (300ms), filter chips, sort dropdown, 10-per-page pagination
- Row click opens corresponding detail drawer (uses URL search param `?id=…` so links are shareable)
- Status badges with brand-aligned colors (paid=green, overdue=red, sent=amber, draft=neutral, partial=orange, cancelled=muted)
- Responsive: horizontal scroll on mobile

## 6. Detail drawer

New `src/components/dashboard/DetailDrawer.tsx` built on existing shadcn `Sheet` (right side, 500px desktop / full-width mobile, ESC + backdrop close). Four content components:
- `CustomerDetail` — header, 3 metric cards (revenue/outstanding/avg payment days), invoice history table, actions (Send Reminder, View All Invoices→filtered list)
- `VendorDetail` — header, metrics (total spend/outstanding/avg monthly), expense history, actions
- `InvoiceDetail` — header, dates, days overdue, amount breakdown, payment info, actions (Send Reminder, Mark Paid, Download PDF placeholder)
- `ExpenseDetail` — header, category path, vendor, amount, status, actions (Mark Paid, Download Receipt placeholder)

Drawer open state driven by `?drawer=customer&id=…` so cockpit cards and list rows both deep-link in.

## 7. Drill-down wiring

- Liquidity: Gross Burn → `/dashboard/expenses?range=30d`; Runway card → runway breakdown drawer; overdue rows → InvoiceDetail; Send Reminder → CustomerDetail; payments → ExpenseDetail; Optimize Schedule → `/dashboard/expenses?status=Pending`
- Revenue: MRR → `/dashboard/invoices?status=paid&range=30d`; top-customer row → CustomerDetail
- Cost: OPEX → `/dashboard/expenses`; vendor row → VendorDetail; personnel → `/dashboard/employees`
- GST: filing row → filing detail drawer; ITC row → ITC detail drawer

## 8. Verification

After implementation:
- `psql` row counts on the 8 new tables
- Open each cockpit tab → confirm numbers render and skeletons resolve
- Click each card variant → confirm correct route/drawer
- Read console + network for query errors

## Out of scope (will not change)
- Auth flow, sidebar, settings pages
- Existing `receivables`/`payables`/`employees`/`gst_filings` tables and the pages bound to them (CA portal, HR page, etc.)
- Real PDF download / real reminder email

---

### Technical notes

Filter encoding: list pages read filters from URL params (`?status=overdue&q=acme&sort=amount&page=2`) so cockpit links are deterministic and shareable.

Query keys: `['dash', '<entity>', businessId, params]` so React Query cache buckets per filter combo. Stale time 60s for list/detail, 30s for cockpit aggregates.

`business_id` resolution: pull once via `useAuth` → `profile.business_id`, fall back to the seeded demo business id when developing without a profile so screenshots still render.

Aggregations done client-side over the small seeded dataset (no RPC needed). If volumes grow, swap individual hooks for SQL views in a follow-up.
