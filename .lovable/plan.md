# Plan: Demo dashboard (/demo/*) → mirror to /dashboard/*

Build the public **demo** experience first end-to-end. Once it looks and behaves correctly, copy the same components/queries into the authenticated **real** dashboard and swap the data source.

## Phase 1 — Database (one migration)

Reuse the 8 tables already created in the prior turn (`customers`, `vendors`, `invoices`, `expenses`, `bank_transactions`, `employees_demo`, `gst_filings_demo`, `clients`). One new migration to:

1. Add a `is_demo boolean default false` column to each of those 8 tables (lets the same tables back both demo and real dashboards).
2. Add RLS policy: `SELECT` allowed to role `anon` and `authenticated` **when `is_demo = true`**. Existing business-scoped policies stay for non-demo rows.
3. Keep all existing GRANTs; add `GRANT SELECT ... TO anon` on the 8 tables (policy still gates per-row).
4. Designate one fixed demo `business_id` constant: `4b30494f-4c30-4a74-a6bb-6bf56493a97d` (already used by prior seed).

## Phase 2 — Seed demo data

Mark every prior-seeded row `is_demo = true`. Re-seed to match the exact spec (counts and named entities):

- 20 customers (Acme Corp Surat, TechStart Ltd Bangalore, Beta Labs Hyderabad, MedPlus Chennai, NovaBuild Ahmedabad, FreshKart Bangalore, + 14 more) with GSTIN, contact, city, state, payment_terms_days, customer_category, total_receivable.
- 20 vendors (AWS, GCP, Razorpay, Zoho, WeWork India, Airtel Business, Swiggy Corporate, Freshworks, HubSpot, Notion, Figma, Keka HR, Tata Communications, IndiGo Corporate, Stripe India, + 5 more).
- 40 invoices INV-2025-0001..0040: 14 overdue, 4 sent, 22 paid; amounts ₹35K–₹320K; 18% GST math-consistent (subtotal/tax/total/paid/outstanding).
- 36 expenses across Infrastructure / Office / Salaries / SaaS / Marketing / Travel / Telecom / Legal with the exact named line items and amounts in the brief; mix Paid/Pending.
- 40 bank_transactions with running balance, credit/debit, category, reconciled flag.
- 10 employees: Tarun Kumar CTO ₹0, Nidhi Siddhapura CMO ₹0, Arjun Menon ₹1.25L, Deepika Iyer ₹95K, Rohit Saxena ₹85K, Sneha Kulkarni ₹75K, Mohammed Faizan ₹65K, Pooja Sharma ₹55K, Karthik Raman ₹1.05L, Ananya Bose ₹60K.
- 11 gst_filings: GSTR-1 + GSTR-3B for Mar/Apr/May 2025 (mix Filed/Pending), GSTR-9 FY 2024-25 Not Due.

## Phase 3 — Demo dashboard at `/demo/*` (public, read-only)

New top-level public section under `src/pages/demo/`, mounted in `App.tsx` outside the auth guard.

Routes:
- `/demo` — Cockpit (mirrors `CockpitPage` layout: Liquidity / Revenue / Cost / GST tabs, clickable cards)
- `/demo/customers`, `/demo/vendors`, `/demo/invoices`, `/demo/expenses`, `/demo/employees`, `/demo/gst`

Shared building blocks (new):
- `src/hooks/demo/useDemoData.ts` — typed React Query hooks. All queries hardcode `business_id = DEMO_BUSINESS_ID` and `is_demo = true`. Mirrors the existing `useDashboardData.ts` API surface 1:1.
- `src/components/demo/DemoLayout.tsx` — dark theme shell with a top "Demo mode — read-only. Sign up to use your own data →" banner and the existing sidebar/nav styling (no auth widgets).
- Reuse `ListPageShell`, `DetailDrawer`, and the `detail/*` components already built; pass a `readOnly` prop that hides edit/add/delete actions.

Behaviour:
- Public access, no login required.
- All cards clickable → list views; rows clickable → detail drawer (`?drawer=…&id=…`).
- Search debounced 300ms, filters, sorting, pagination 10/page.
- Headers show counts: `Customers (20)`, etc.
- INR formatting via existing `formatINR`.
- Any write attempt is hidden in UI; backend RLS has no INSERT/UPDATE/DELETE policy for anon as defence-in-depth.

## Phase 4 — Mirror into real `/dashboard/*`

Once `/demo/*` is verified:
1. Create `src/hooks/dashboard/useRealData.ts` with the same hook signatures as `useDemoData`, but scoping by `business_id = profile.business_id` and `is_demo = false` and using `useAuth`.
2. Build (or update) the parallel real pages under `src/pages/dashboard/`: same components from Phase 3, swapped data hook, `readOnly={false}`, edit/add/delete actions enabled (CRUD wired to the same tables).
3. Routes already exist (`/dashboard`, `/dashboard/customers`, …) — replace any leftover hardcoded panels with the mirrored components.
4. Auth gate stays as-is; redirect unauthenticated users to `/auth`.

## Phase 5 — Verification

- `psql` row counts for all 8 demo tables = spec counts, all `is_demo = true`.
- Anonymous load of `/demo` → cockpit numbers populate; tab through Liquidity/Revenue/Cost/GST; click each card → correct list view; click row → correct drawer.
- `/demo/customers` etc.: search, filter, sort, pagination, count header all work.
- Logged-in `/dashboard/*` shows the same UI against the user's own (non-demo) rows; CRUD round-trips.
- Console + network: zero errors on either surface.

## Out of scope

- Auth/onboarding changes, sidebar/nav redesign, PDF/email exports, real bank/GST integrations, marketing copy on `/demo`, the existing `receivables` / `payables` / `employees` / `gst_filings` legacy tables (untouched).

## Technical notes

- Demo business id constant lives in `src/lib/demo.ts` and is imported by demo hooks only.
- `is_demo` lets us keep one schema/codebase; the only difference between `/demo` and `/dashboard` is the hook (`useDemoData` vs `useRealData`) and the `readOnly` prop.
- RLS on the 8 tables: `USING (is_demo = true)` for anon SELECT; existing `business_id = get_user_business_id()` policies remain for authenticated full access.
