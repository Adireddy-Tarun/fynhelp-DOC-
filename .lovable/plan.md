## Goal
Make `src/components/Sidebar.tsx` (INTELLIGENCE section) and `src/components/intelligence/IntelligenceShell.tsx` (tab bar) use the exact same labels and Lucide icons, with the correct active/coming-soon split.

## Canonical module list (single source of truth)

Active (no badge):
| # | Label | Icon | Sidebar path | Tab id |
|---|---|---|---|---|
| 1 | Liquidity | `Droplets` | `/dashboard/liquidity` | `liquidity` |
| 2 | Revenue | `TrendingUp` | `/dashboard/revenue-intelligence` | `revenue` |
| 3 | Cost | `DollarSign` | `/dashboard/cost` | `cost` |
| 4 | GST & Tax | `FileText` | `/dashboard/gst` | `gst` |
| 5 | Governance | `Shield` | `/dashboard/compliance` | `governance` |
| 6 | HR & Workforce | `Users` | `/dashboard/hr` | `hr` |
| 7 | Investor | `BarChart3` | `/dashboard/investor` | `investor` |
| 8 | Ask Fynny | `MessageSquare` | `/dashboard/nidhi` | `fynny` |

Coming Soon (sidebar only, gray italic "Soon"):
| # | Label | Icon | Path |
|---|---|---|---|
| 9 | Decision Simulator | `Brain` | `/dashboard/simulator` |
| 10 | Market & Growth | `BarChart` | `/dashboard/market-growth` |
| 11 | Banking | `Landmark` | `/dashboard/banking` |
| 12 | CA Partner | `Building2` | `/dashboard/ca-partner` |

## Changes

### 1. `src/components/intelligence/IntelligenceShell.tsx`
- Update `TABS` array:
  - HR label: `"HR"` → `"HR & Workforce"`
  - Governance icon: `ShieldCheck` → `Shield`
  - Investor icon: `Briefcase` → `BarChart3`
  - Ask Fynny icon: `Bot` → `MessageSquare`
- Update the lucide-react import to match (drop `ShieldCheck`, `Briefcase`, `Bot`; add `Shield`, `MessageSquare`; keep `BarChart3`).

### 2. `src/components/Sidebar.tsx`
INTELLIGENCE section becomes (in this exact order):
```
Liquidity            Droplets             /dashboard/liquidity
Revenue              TrendingUp           /dashboard/revenue-intelligence
Cost                 DollarSign           /dashboard/cost
GST & Tax            FileText             /dashboard/gst
Governance           Shield               /dashboard/compliance          (active, remove `soon`)
HR & Workforce       Users                /dashboard/hr                  (active, remove `soon`)
Investor             BarChart3            /dashboard/investor            (new)
Ask Fynny            MessageSquare        /dashboard/nidhi               (new)
Decision Simulator   Brain                /dashboard/simulator           (soon)
Market & Growth      BarChart             /dashboard/market-growth       (soon, icon change)
Banking              Landmark             /dashboard/banking             (soon)
CA Partner           Building2            /dashboard/ca-partner          (soon)
```
- Adjust lucide imports: add `BarChart`, ensure `Shield`, `BarChart3`, `MessageSquare`, `Brain`, `Landmark`, `Building2` present.
- Remove the now-duplicate `CFO Fynny` entry from the OVERVIEW section (Ask Fynny in INTELLIGENCE replaces it). Keep `Dashboard` in OVERVIEW.

### 3. `src/components/DashboardLayout.tsx`
- Page-title map: ensure `/dashboard/hr` → `"HR & Workforce"` (already correct) and `/dashboard/investor` exists. No functional change required beyond verifying titles match the new labels.

## Non-goals
- No routing changes (all target paths already exist in `src/App.tsx`).
- No changes to demo footer, `_primitives`, `suiteStatus`, or marketing pages.
- No backend / RLS changes.
