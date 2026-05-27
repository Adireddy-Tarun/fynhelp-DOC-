# Demo Dashboard Ground-Up Redesign

This is a complete visual + structural rebuild of `/demo/dashboard` (~6,500 lines across 11 files). To keep quality high and avoid a single mega-edit that breaks everything, I'll deliver it in **5 sequential phases**, each shippable and visually verifiable in the preview before moving to the next.

No existing data, chart, table, calculation, or feature is removed. Everything specified is layered **on top of** what already exists. Brand palette is locked to the 7 hex values + opacity variants. Sora only. No shadows. No gradients on UI.

---

## Phase 1 — Foundation & shared primitives (no visual change yet)

Build the reusable building blocks every module will consume:

- `src/components/demo/_design/tokens.ts` — single source of truth for the 7 brand hex values, type scale, spacing, badge/button/chart presets.
- `src/components/demo/_design/primitives.tsx`:
  - `LedgerStrip` — full-width container with vertical-divider columns (replaces floating KPI cards).
  - `LedgerMetric` — eyebrow + display number + context + inline status.
  - `CFOBriefing` — red-bordered panel with eyebrow, sentence-with-`<strong>` numbers, timestamp.
  - `RecommendedAction` — gold-bordered footer strip used at end of every module.
  - `SectionHeader` — heading + optional right-aligned link.
  - `Pill`, `Badge` (5 variants), `PrimaryBtn`, `SecondaryBtn` — global button/badge standards.
  - `PlainEnglish` — gold-bordered explainer block (used in GST).
- `src/components/demo/_design/charts.ts` — recharts default props (palette, grid, axis, tooltip) so every chart is on-brand by default.
- Inject Sora @import + page-wide diagonal-grain background + scrollbar styles into `DemoDashboard.tsx` global `<style>`.

## Phase 2 — Header + tab bar + daily briefing ticker

- 64px sticky header: business name, "Data: uploaded-data.csv" sub-label, **new marquee ticker** (3 urgent alerts, 30s loop, hover-pause, fade masks), 12M/24M/All pills, Upload / Connect Zoho / Exit Demo buttons (standardized styles).
- 48px sticky tab bar: Liquidity · Revenue · Cost · GST & Tax · Governance · **Investor View (new tab)** · Ask Fynny. Active = red 2px bottom border + red icon.

## Phase 3 — Liquidity, Revenue, Cost modules

Each module rebuilt around the same skeleton:
`<CFOBriefing /> → <LedgerStrip /> → [module-specific sections, all charts restyled] → <RecommendedAction />`

- **Liquidity**: 5-metric ledger (DSO/DIO/DPO/Quick/Current) → CCC visual timeline (DSO→DIO−DPO=CCC) → Burn & Runway (existing, restyled, with "Model a scenario →" link) → Weekly cashflow (current-week emphasis + gold trend line) → AR Aging (table, no card bg) → Overdue Invoices (+ Priority column, specific recommended actions) → Major Payments (cash-impact row) → Recommended Action.
- **Revenue**: 5-metric ledger (incl. YoY top-6% callout + "₹5Cr ARR by Feb 2026") → composition bars restyled → **MRR Waterfall (new)** → at-risk accounts table + TechStart alert strip → growth metrics as ledger → Recommended Action.
- **Cost**: 4-metric ledger → cost breakdown chart + benchmark dashed lines → vendor table (+ Market Rate, Saving Opportunity columns) → 12+3 month spend trend with revenue overlay (new) → Recommended Action.

## Phase 4 — GST & Tax, Governance, Investor View

- **GST & Tax**: 5-metric ledger → `PlainEnglish` blocks before ITC and 2B sections → ITC table (+ Plain English column) → 120px compliance gauge with zone labels + needle → 6 risk cards with plain-language interpretations (penalty card highlighted) → tax liability ledger + due-date progress bar → Recommended Action.
- **Governance**: 4-metric ledger → filing calendar timeline (new) → Director & Shareholder table (new) → Recommended Action.
- **Investor View (NEW MODULE)**: 6-metric ledger → Tension Table (✓ working vs ⚠ needs attention, 4 rows) → Valuation Statement strip (₹8.5Cr–₹12.2Cr, 3 scenario bars, assumption list) → Series A Readiness Checklist (7 rows, color-tinted backgrounds) → Deep Metrics ledger → Recommended Action.

## Phase 5 — Ask Fynny + global polish + audit

- Ask Fynny header rebuilt (40px red avatar with Swiss mark, name + sub-label, Online badge).
- Chat surface on bare `#1A1008`; FYNNY bubble `#1F0E07` w/ asymmetric radius; user bubble `#C41E1E`.
- 2-row suggested chips (operational + investor-grade, row 2 tinted red).
- Replace generic error with grounded fallback ("I'm recalculating… MRR ₹14.2L · Runway 24 months · Burn Multiple 2.4x…").
- Restyled input bar + send button.
- **Full audit**: grep all demo files for any remaining hex/rgb/named colour outside the allowed palette, any `box-shadow`, any non-Sora font, any `bg-emerald/blue/indigo/purple/teal/amber/gray` Tailwind classes. Fix every hit. Verify each tab in the preview at desktop, tablet, mobile widths.

---

## Technical notes

- Component file layout stays the same (`LiquidityDashboard.tsx`, `RevenueDashboard.tsx`, etc.) — internals rewritten, exports unchanged so `DemoDashboard.tsx` routing keeps working.
- All numeric data + chart series stay sourced from the existing mock/data objects so nothing in business logic changes.
- New "Investor View" tab is added to the tab list in `DemoDashboard.tsx` with a new `InvestorDashboard.tsx` component.
- Recharts wrappers updated centrally so every bar/line/donut/tooltip inherits brand palette without touching each chart.
- Responsive: ledger strips use CSS grid `auto-fit minmax(180px, 1fr)` so they degrade to 2-col tablet / 1-col mobile automatically.

Reply **approve** to start with Phase 1, or tell me which phases to reorder/skip.