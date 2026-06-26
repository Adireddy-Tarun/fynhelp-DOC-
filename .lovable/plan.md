
# Sever /demo from /dashboard — structural fix

## Part 1 — Audit (shared surface today)

Every /demo/* route currently shares code with /dashboard/*. Grouped by leak path:

**A. Shared page shells (rendered by both /demo/* and /dashboard/* routes)**
- `src/pages/intelligence/IntelligencePage.tsx` — used by all 8 demo tabs AND dashboard tabs
- `src/pages/intelligence/ReportsPage.tsx` — `/demo/reports` + `/dashboard/reports`
- `src/pages/dashboard/CustomersPage.tsx` — `/demo/customers` + `/dashboard/customers`
- `src/pages/dashboard/VendorsPage.tsx` — same pattern
- `src/pages/dashboard/InvoicesListPage.tsx`
- `src/pages/dashboard/ExpensesListPage.tsx`
- `src/pages/dashboard/EmployeesListPage.tsx`

**B. Shared "intelligence" components (mounted inside IntelligencePage)**
- `src/components/intelligence/IntelligenceShell.tsx`
- `src/components/intelligence/_primitives.tsx`
- `src/components/intelligence/actions.tsx`
- All of `src/components/intelligence/tabs/*` (8 tabs)
- All of `src/components/intelligence/sections/*`

**C. Shared list-page shell + cockpit panel**
- `src/components/dashboard/ListPageShell.tsx`
- `src/components/dashboard/LiveCockpitPanel.tsx`
- `src/components/dashboard/ui.tsx` (presentational primitives — safe to keep shared, no data/navigation)

**D. Shared detail drawer system**
- `src/components/dashboard/DetailDrawer.tsx` (registry + portal)
- `src/components/dashboard/detail/parts.tsx`
- `src/components/dashboard/detail/CustomerDetail.tsx`
- `VendorDetail.tsx`, `InvoiceDetail.tsx`, `ExpenseDetail.tsx`, `GstFilingDetail.tsx`, `RiskDetail.tsx`, `InsuranceDetail.tsx`, `EmployeeDetail.tsx`, `DealDetail.tsx`, `BankTxnDetail.tsx`

**E. Shared data layer**
- `src/hooks/dashboard/useDashboardData.ts` — every detail hook + list hook
- `src/components/intelligence/DataSource.tsx` — `useMode()`, `useScopedBusinessId()`, all `useScopedTable` hooks for the 8 tabs

**F. Shared navigation surfaces that can route demo→dashboard**
- `GlobalHeader.tsx`, `GlobalBackBar.tsx`, `Sidebar.tsx`, `productMeta.ts`, `ProductsNav.tsx`, `ProductWidgetModal.tsx` — these render on /demo/* and link to /dashboard/* paths

## Part 2 — New demo-only tree (no `useMode`, no shared data hooks)

Create a parallel tree. Every file hardcodes `DEMO_BIZ` and `/demo/...` paths. Zero conditional branching, zero imports from `/dashboard/*` or `useDashboardData.ts` or `DataSource.tsx`.

```
src/
  demo/                              ← new isolated root
    constants.ts                     ← export DEMO_BIZ
    hooks/
      useDemoData.ts                 ← ALL list hooks, hardcoded DEMO_BIZ
      useDemoDetails.ts              ← ALL detail hooks (customer, vendor, invoice,
                                       expense, gst, risk, insurance, employee,
                                       deal, bankTxn), hardcoded DEMO_BIZ
    pages/
      DemoIntelligencePage.tsx       ← replaces IntelligencePage(mode="demo")
      DemoReportsPage.tsx
      DemoCustomersPage.tsx
      DemoVendorsPage.tsx
      DemoInvoicesPage.tsx
      DemoExpensesPage.tsx
      DemoEmployeesPage.tsx
      details/
        DemoCustomerPage.tsx         ← full pages, route /demo/customers/:id
        DemoVendorPage.tsx           ← /demo/vendors/:id
        DemoInvoicePage.tsx          ← /demo/invoices/:id
        DemoExpensePage.tsx          ← /demo/expenses/:id
        DemoGstFilingPage.tsx        ← /demo/gst/:id
        DemoRiskPage.tsx             ← /demo/risks/:id
        DemoInsurancePage.tsx        ← /demo/insurance/:id
        DemoEmployeePage.tsx         ← /demo/employees/:id
        DemoDealPage.tsx             ← /demo/deals/:id
        DemoBankTxnPage.tsx          ← /demo/bank/:id
    components/
      DemoShell.tsx                  ← copies IntelligenceShell JSX
      DemoListShell.tsx              ← copies ListPageShell JSX
      DemoCockpitPanel.tsx           ← copies LiveCockpitPanel JSX
      DemoDetailParts.tsx            ← copies detail/parts.tsx JSX
      tabs/                          ← copies of all 8 intelligence tabs,
                                       imports rewired to useDemoData
      sections/                      ← copies of intelligence/sections/*
```

Rules enforced in every demo file:
- Imports `DEMO_BIZ` from `src/demo/constants.ts`. Never reads auth state.
- All Supabase queries `.eq("business_id", DEMO_BIZ)` directly.
- Every `<Link>` / `navigate(...)` / back-button hardcodes `/demo/...`.
- Presentational primitives from `components/dashboard/ui.tsx` are still imported (pure JSX, no data/nav) — this is the only allowed overlap and is documented at the top of each file.

## Part 3 — Detail pages as full routes

Replace the demo drawer pattern with full pages under `/demo/<entity>/:id`. Each page preserves the original spec (on-time payment rate + warning, revenue sparkline, deal-acquisition link, underinsured warning, ESOP/comp benchmarks, 5×5 risk heatmap, running-balance trace, etc.) by copying JSX from the current dashboard detail components and rewiring imports to `useDemoDetails`. List rows in demo list pages and demo tabs link to these routes instead of opening the shared `DetailDrawer`.

## Part 4 — Route table changes in `App.tsx`

Replace every `/demo/*` route to point at the new `src/demo/pages/*` components. Add the 10 new `/demo/<entity>/:id` routes. `/dashboard/*` routes are left untouched.

## Part 5 — Verification

Playwright as a non-DEMO authenticated user:
1. Visit each of 8 demo tabs + 5 demo list pages.
2. Click one of each entity type → assert URL stays under `/demo/*` AND assert (via `data-source="demo"` marker added to demo pages' root div) that the mounted component is from `src/demo/*`.
3. Assert the rendered data matches DEMO_BIZ row counts (e.g. 68 expenses, 80 bank txns).
4. Screenshot each detail page.

## Scope acknowledgement

This creates ~25 new files and roughly doubles the line count for these surfaces. That duplication is the deliverable — it removes every shared code path a future change could regress through.

## Technical notes

- `src/components/dashboard/ui.tsx` (FynButton, FynTable, FynLoading, etc.) stays shared. It's pure presentation, no data fetching, no navigation. Documented as the only sanctioned overlap.
- `GlobalHeader`/`Sidebar`/etc. are NOT rendered inside the new demo pages (the current demo routes already render `IntelligencePage` / `DemoModeBanner` only, without app chrome). Confirmed by re-reading `App.tsx`.
- `DemoModeBanner` stays but stops providing `IntelligenceProvider` (no longer needed — demo hooks don't read mode).

Proceed?
