import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";

interface Module {
  name: string;
  plan: string;
  updated: string;
  tracks: string[];
  nidhi: string;
  sources: string[];
}

interface Suite {
  id: string;
  name: string;
  color: string;
  description: string;
  modules: Module[];
}

const suites: Suite[] = [
  {
    id: "liquidity", name: "Liquidity Intelligence", color: "#C41E1E",
    description: "The heartbeat of your business. Monitors every dimension of your business's cash health — not just what's in the bank today, but what will be there in 30, 60, and 90 days.",
    modules: [
      { name: "Financial Health Score", plan: "All Plans", updated: "Daily", tracks: ["Composite score (0-100) across 4 dimensions", "Liquidity ratio: current assets vs current liabilities (30%)", "Cash stability: runway days + burn volatility (25%)", "Compliance health: filing regularity + notice risk (20%)"], nidhi: "Opens every morning brief with your score and the one dimension that changed most.", sources: ["Bank AA", "Transactions", "Receivables", "Payables"] },
      { name: "Cash Flow Projection", plan: "All Plans", updated: "Every 6h", tracks: ["Daily projected cash for next 180 days", "AI model using receivables + payment history", "Scheduled payables, payroll, GST, loan EMIs", "80% and 95% confidence bands"], nidhi: "Identifies the exact date cash will cross your threshold and suggests 3 actions.", sources: ["Bank AA", "Receivables", "Payables", "Payroll"] },
      { name: "Burn Rate Monitor", plan: "All Plans", updated: "Daily", tracks: ["30-day rolling average daily burn", "Month-over-month change in burn rate", "Category breakdown of burn increase", "Seasonality-adjusted burn"], nidhi: "Alerts when burn increases >15% vs prior month with exact cause.", sources: ["Transactions"] },
      { name: "Working Capital Optimizer", plan: "Growth+", updated: "Weekly", tracks: ["DSO vs industry benchmark", "DPO optimization opportunities", "Working Capital Cycle = DSO + DIO − DPO", "Rupee cost of non-optimal working capital"], nidhi: "Shows how many extra days of cash you're giving away through slow collections.", sources: ["Receivables", "Payables", "Transactions"] },
      { name: "Liquidity Alerts", plan: "All Plans", updated: "Real-time", tracks: ["Cash balance vs 3 configurable thresholds", "Per-account and aggregate monitoring", "Balance change velocity (sudden large debits)", "Insufficient funds risk before scheduled payments"], nidhi: "Sends WhatsApp + in-app push when cash crosses any threshold.", sources: ["Bank AA"] },
      { name: "Runway Calculator", plan: "All Plans", updated: "Every 6h", tracks: ["Current runway = cash ÷ daily burn", "Scenario-adjusted runway", "Historical runway trend (12 months)", "Industry peer comparison (anonymised)"], nidhi: "Shows runway as first metric in every view. Green >90d, amber 30-90d, red <30d.", sources: ["Bank AA", "Transactions"] },
    ],
  },
  {
    id: "revenue", name: "Revenue Intelligence", color: "#1A4A8B",
    description: "Your revenue is only as real as what arrives in your bank. Tracks what you'll collect, when, and which customers are at risk of default.",
    modules: [
      { name: "Receivables AI", plan: "Growth+", updated: "Daily", tracks: ["Outstanding by aging bucket (0-30, 31-60, 61-90, 90+)", "Invoice-level payment tracking", "Partial payment handling", "Auto-marks paid when bank credit arrives"], nidhi: "Every Monday, surfaces 5 highest-priority collections by overdue × risk × runway impact.", sources: ["Receivables", "Transactions"] },
      { name: "Default Prediction", plan: "Growth+", updated: "Weekly", tracks: ["ML model scoring each customer 0-100", "Days since last payment, payment history variance", "Order frequency change (declining = danger)", "Customer GST filing compliance"], nidhi: "Flags rising default scores 45-60 days before invoice comes due.", sources: ["Receivables", "GST Portal"] },
      { name: "Customer Risk Score", plan: "Growth+", updated: "Weekly", tracks: ["Payment reliability (50%), order stability (25%)", "Financial health from GST compliance (25%)", "12-month score trend history", "Categories: Safe (80+), Monitor (50-79), At Risk (<50)"], nidhi: "Risk score shown on every invoice and collection action.", sources: ["Receivables", "Transactions", "GST"] },
      { name: "Collections Automation", plan: "Growth+", updated: "Real-time", tracks: ["WhatsApp + email chase sequences", "Day 1 gentle → Day 30 legal → Day 45 MSME rights", "Personalised messages with invoice details", "Track: sent, delivered, read, action taken"], nidhi: "One-tap send from app with personalised chase messages.", sources: ["Receivables", "WhatsApp API"] },
      { name: "Revenue Concentration Risk", plan: "Pro+", updated: "Monthly", tracks: ["Alert when any customer > 20% of revenue", "Alert when top 3 > 50% of revenue", "Trend: is concentration increasing or decreasing?", "What-if: if top customer stops, runway impact?"], nidhi: "Warns about dangerous customer concentration with runway impact.", sources: ["Receivables", "Transactions"] },
      { name: "Churn Early Warning", plan: "Pro+", updated: "Weekly", tracks: ["Order frequency declining 30%+ vs prior quarter", "Order value shrinking", "Payment terms changing (paying slower)", "Communication declining"], nidhi: "Suggests proactive outreach message before churn happens.", sources: ["Receivables", "Transactions"] },
      { name: "Pricing Intelligence", plan: "Pro+", updated: "Monthly", tracks: ["Gross margin per customer segment", "Gross margin per product category", "12-month margin trend", "Price sensitivity modeling"], nidhi: "Identifies which customers/segments are most profitable.", sources: ["Transactions", "Receivables"] },
      { name: "Payment Behaviour Analytics", plan: "Growth+", updated: "Weekly", tracks: ["Per-customer payment patterns (days, methods)", "Pattern-based prediction: exact payment date", "Partial payment tendencies", "Best chase method per customer"], nidhi: "Recommends when and how to chase each specific customer.", sources: ["Receivables", "Transactions"] },
    ],
  },
  {
    id: "cost", name: "Cost Intelligence", color: "#1A6B3C",
    description: "Control spending before it controls you. Tracks vendor payments, cost trends, and identifies optimization opportunities.",
    modules: [
      { name: "Spend Analytics", plan: "Growth+", updated: "Daily", tracks: ["Category-wise spend breakdown", "Month-over-month spend trends", "Top 10 vendors by spend", "Anomaly detection on unusual spends"], nidhi: "Highlights unusual spend spikes with specific vendor and category.", sources: ["Transactions", "Payables"] },
      { name: "Vendor Signals", plan: "Growth+", updated: "Weekly", tracks: ["Vendor payment terms analysis", "Early payment discount opportunities", "Vendor consolidation suggestions", "Alternative vendor benchmarks"], nidhi: "Identifies vendors where renegotiation could save money.", sources: ["Payables", "Transactions"] },
      { name: "Payables Optimization", plan: "Growth+", updated: "Daily", tracks: ["Payables aging analysis", "Cash outflow scheduling", "Discount vs cash preservation tradeoffs", "Vendor priority ranking"], nidhi: "Recommends optimal payment timing to preserve cash.", sources: ["Payables", "Bank AA"] },
      { name: "Capex Decision AI", plan: "Pro+", updated: "On demand", tracks: ["ROI analysis for capital expenditure", "Loan vs self-fund comparison", "Break-even period calculation", "Cash flow impact modeling"], nidhi: "Models the full 24-month cash impact of any capex decision.", sources: ["Transactions", "Bank AA"] },
      { name: "DPO Tracker", plan: "Growth+", updated: "Weekly", tracks: ["Days Payable Outstanding trend", "Industry benchmark comparison", "Vendor-wise DPO breakdown", "Cash retention opportunity"], nidhi: "Shows if you're paying vendors too fast relative to industry.", sources: ["Payables", "Transactions"] },
      { name: "Cost Benchmarking", plan: "Pro+", updated: "Monthly", tracks: ["Your cost ratios vs industry peers", "Rent, payroll, materials as % of revenue", "Efficiency metrics per employee", "Margin optimization opportunities"], nidhi: "Benchmarks your cost structure against 500+ similar businesses.", sources: ["Transactions", "Payroll"] },
    ],
  },
  {
    id: "gst", name: "GST & Tax Intelligence", color: "#8B5A00",
    description: "FynHelp's most India-specific suite. Protects your ITC, prevents GST notices, and keeps you ahead of every filing deadline.",
    modules: [
      { name: "ITC Reconciliation Engine", plan: "Growth+", updated: "Monthly (14th)", tracks: ["Auto-matches purchase register vs GSTR-2B", "Identifies mismatches by vendor", "Calculates ITC at risk", "Generates vendor chase list"], nidhi: "Runs automatically on 14th, tells you exactly which vendors to chase.", sources: ["GSP API", "Purchase Register"] },
      { name: "Notice Risk Scorer", plan: "Growth+", updated: "Monthly", tracks: ["0-100 score using 6 weighted factors", "Late filing penalty risk", "ITC mismatch severity", "Turnover vs filing consistency"], nidhi: "Tells you your notice probability and exactly what to fix.", sources: ["GSP API", "Filing History"] },
      { name: "Smart Filing Calendar", plan: "All Plans", updated: "Real-time", tracks: ["Your specific GSTIN-based deadlines", "QRMP vs monthly filing schedule", "14/7/3/1-day advance alerts", "Penalty calculation if late"], nidhi: "Sends reminders at 14, 7, 3, and 1 day before each deadline.", sources: ["GSTIN", "CBIC"] },
      { name: "Vendor GST Health", plan: "Growth+", updated: "Monthly", tracks: ["Filing compliance score per vendor", "GSTR-1 and 3B filing regularity", "Return filing gaps detection", "GSTIN suspension/cancellation alerts"], nidhi: "Scores every vendor's compliance and flags risky ones.", sources: ["GSP API"] },
      { name: "Advance Tax Calculator", plan: "Pro+", updated: "Quarterly", tracks: ["Live P&L to tax liability computation", "4-installment calculation (Jun/Sep/Dec/Mar)", "TDS already deposited offset", "Interest computation if late"], nidhi: "Alerts 14 days before each installment with exact amount due.", sources: ["Transactions", "TDS Records"] },
      { name: "ITC Refund Tracker", plan: "Pro+", updated: "Monthly", tracks: ["For exporters and inverted duty businesses", "Refund application status tracking", "Expected refund timeline", "Cash flow impact of delayed refunds"], nidhi: "Models the cash impact of delayed GST refunds.", sources: ["GSP API", "Bank AA"] },
      { name: "TDS Obligation Tracker", plan: "Pro+", updated: "Monthly", tracks: ["TDS deduction obligations on vendor payments", "Section-wise TDS rates", "Filing due dates for TDS returns", "Certificate issuance tracking"], nidhi: "Links actual vendor payments to TDS obligations.", sources: ["Payables", "Transactions"] },
      { name: "E-Invoice Manager", plan: "Pro+", updated: "Real-time", tracks: ["IRN generation tracking", "E-way bill integration", "Compliance for turnover thresholds", "Auto-validation of invoice data"], nidhi: "Ensures every invoice meets e-invoice requirements.", sources: ["Invoices", "GSP API"] },
      { name: "GSTN Notification Tracker", plan: "Growth+", updated: "Weekly", tracks: ["CBIC circulars filtered for your business", "Rate changes affecting your HSN codes", "New compliance requirements", "Deadline extensions and relaxations"], nidhi: "Filters CBIC notifications to show only what affects you.", sources: ["CBIC Portal"] },
      { name: "GSTR-9 Annual Return Preparer", plan: "Pro+", updated: "Annual", tracks: ["Auto-drafts from 12 months of monthly data", "Reconciles GSTR-1, 3B, and 2B", "Identifies discrepancies before filing", "Downloadable draft for CA review"], nidhi: "Prepares a complete annual return draft for your CA to review.", sources: ["GSP API", "All Monthly Returns"] },
    ],
  },
  {
    id: "governance", name: "Governance Intelligence", color: "#8B6914",
    description: "50+ compliance obligations tracked automatically. ROC, FEMA, MCA, audit readiness — nothing falls through the cracks.",
    modules: [
      { name: "Compliance Dashboard", plan: "Pro+", updated: "Daily", tracks: ["All regulatory obligations in one view", "Status: Filed/Pending/Overdue per obligation", "Priority ranking by penalty severity", "Historical compliance score"], nidhi: "Shows compliance health in morning brief with upcoming deadlines.", sources: ["Filing Records", "ROC Portal"] },
      { name: "MCA/ROC Tracker", plan: "Pro+", updated: "Monthly", tracks: ["Annual return filing status", "Director KYC due dates", "Board meeting compliance", "Charge creation/modification tracking"], nidhi: "Alerts 30 days before ROC deadlines with exact form details.", sources: ["MCA Portal"] },
      { name: "Audit Readiness Score", plan: "Pro+", updated: "Quarterly", tracks: ["Documentation completeness check", "Transaction audit trail verification", "Book vs bank reconciliation status", "Provision adequacy review"], nidhi: "Scores your audit readiness and lists gaps to close.", sources: ["All Tables"] },
      { name: "MSME Rights Enforcer", plan: "Growth+", updated: "On demand", tracks: ["Identifies invoices eligible for 43B(h) claims", "Generates formal demand letters", "Tracks buyer compliance history", "Calculates interest for delayed payments"], nidhi: "Generates ready-to-send demand letters with one tap.", sources: ["Receivables", "Udyam"] },
    ],
  },
  {
    id: "hr", name: "HR & Workforce Intelligence", color: "#0F766E",
    description: "Know when you can afford to grow. Hiring forecast, payroll cash planning, attrition risk — workforce decisions backed by financial data.",
    modules: [
      { name: "Hiring Forecast AI", plan: "Growth+", updated: "Monthly", tracks: ["Revenue-per-employee trend", "Department-wise headcount optimization", "Time-to-breakeven per new hire", "Hiring budget vs runway impact"], nidhi: "Models the cash impact of every hire before you commit.", sources: ["Payroll", "Transactions"] },
      { name: "Workforce Cost Model", plan: "Growth+", updated: "Monthly", tracks: ["True cost per employee (CTC + overheads)", "PF, ESIC, gratuity, bonus provisions", "Seat cost by city benchmarks", "CTC vs take-home breakdown"], nidhi: "Shows the real cost of every employee, not just CTC.", sources: ["Payroll Records"] },
      { name: "Attrition Risk", plan: "Pro+", updated: "Quarterly", tracks: ["Department-wise attrition trends", "Cost of replacement per role", "Knowledge loss risk assessment", "Retention budget optimization"], nidhi: "Flags departments with rising attrition risk and cost impact.", sources: ["Payroll", "HR Records"] },
      { name: "Payroll Cash Planner", plan: "Growth+", updated: "Monthly", tracks: ["Next payroll date and amount", "PF and ESIC due dates", "Bonus and increment calendar", "Cash reserve requirement"], nidhi: "Ensures cash is reserved for payroll 7 days in advance.", sources: ["Payroll Records", "Bank AA"] },
      { name: "PF & ESIC Compliance", plan: "Growth+", updated: "Monthly", tracks: ["Monthly PF contribution calculation", "ESIC threshold monitoring", "Filing due date reminders", "Payment receipt tracking"], nidhi: "Calculates exact PF/ESIC amounts and alerts before due dates.", sources: ["Payroll Records"] },
    ],
  },
  {
    id: "simulator", name: "Decision Simulator", color: "#C41E1E",
    description: "Model every major decision before you commit. 8 what-if scenarios modelled against your live financial data.",
    modules: [
      { name: "Credit Terms Simulator", plan: "Growth+", updated: "On demand", tracks: ["Impact of changing payment terms", "DSO change projection", "Cash flow impact over 6 months", "Customer retention risk assessment"], nidhi: "Shows exact cash impact of offering/reducing credit days.", sources: ["Receivables", "Transactions"] },
      { name: "Hiring Impact Model", plan: "Growth+", updated: "On demand", tracks: ["Revenue-per-hire breakeven timeline", "Burn rate increase projection", "Runway impact at current cash", "Best month to hire based on cash cycle"], nidhi: "Models months to breakeven for each new hire.", sources: ["Payroll", "Transactions", "Bank AA"] },
      { name: "Pricing Change Analyzer", plan: "Growth+", updated: "On demand", tracks: ["Volume elasticity estimation", "Margin impact at different price points", "Customer churn risk from increases", "Revenue vs profit tradeoff"], nidhi: "Models the revenue and churn impact of price changes.", sources: ["Transactions", "Receivables"] },
      { name: "GST Refund Delay Model", plan: "Growth+", updated: "On demand", tracks: ["Cash flow impact of refund delays", "30/60/90-day delay scenarios", "Working capital gap calculation", "Bridge financing options"], nidhi: "Shows exactly how delayed refunds affect your cash position.", sources: ["GSP API", "Bank AA"] },
      { name: "Capex Decision Model", plan: "Pro+", updated: "On demand", tracks: ["Loan vs self-fund comparison", "EMI schedule and cash impact", "ROI timeline projection", "Break-even analysis"], nidhi: "Models the 24-month cash flow of any capex decision.", sources: ["Bank AA", "Transactions"] },
      { name: "Loan Impact Analyzer", plan: "Growth+", updated: "On demand", tracks: ["EMI burden on monthly cash flow", "Total interest cost over tenure", "Prepayment benefit analysis", "Optimal loan amount calculation"], nidhi: "Shows the real cost of borrowing on your specific business.", sources: ["Bank AA", "Transactions"] },
      { name: "Seasonal Push Model", plan: "Pro+", updated: "On demand", tracks: ["Inventory buildup cash requirement", "Expected revenue timing", "Working capital gap during buildup", "Bridge financing options"], nidhi: "Models the cash gap between spending and earning in peak seasons.", sources: ["Transactions", "Receivables"] },
      { name: "M&A Scenario Builder", plan: "Pro+", updated: "On demand", tracks: ["Acquisition cost vs synergy savings", "Integration cost timeline", "Combined entity cash flow", "Payback period calculation"], nidhi: "Models whether an acquisition makes financial sense.", sources: ["All Financial Data"] },
    ],
  },
  {
    id: "market", name: "Market & Growth Intelligence", color: "#DC6B19",
    description: "Know where you stand. Industry benchmarks, credit rating simulation, fundraise readiness assessment.",
    modules: [
      { name: "Industry Benchmarking", plan: "Pro+", updated: "Monthly", tracks: ["Revenue growth vs sector average", "Margin comparison (gross and net)", "Cost ratio benchmarks", "Working capital efficiency ranking"], nidhi: "Compares your metrics against 500+ anonymised businesses.", sources: ["All Financial Data", "Benchmark Database"] },
      { name: "Credit Rating Simulator", plan: "Pro+", updated: "Monthly", tracks: ["Simulated credit score (0-100)", "Key factors affecting your score", "Improvement actions ranked by impact", "Lender-specific eligibility estimates"], nidhi: "Shows what lenders see and how to improve your score.", sources: ["Bank AA", "Compliance", "Financials"] },
      { name: "Fundraise Readiness", plan: "Pro+", updated: "Quarterly", tracks: ["Financial documentation completeness", "Growth metrics presentation", "Unit economics clarity", "Valuation range estimation"], nidhi: "Scores your fundraise readiness and lists gaps to close.", sources: ["All Financial Data"] },
      { name: "Export Opportunities", plan: "Pro+", updated: "Quarterly", tracks: ["Export incentive eligibility", "Market sizing for products", "Compliance requirements by country", "Currency risk assessment"], nidhi: "Identifies export incentives you may be missing.", sources: ["Transactions", "GST Export Data"] },
    ],
  },
  {
    id: "banking", name: "Banking & Fintech Intelligence", color: "#1A4A8B",
    description: "All your accounts in one intelligent view. Multi-bank aggregation via RBI's Account Aggregator framework.",
    modules: [
      { name: "Multi-Bank Aggregation", plan: "All Plans", updated: "Every 6h", tracks: ["All bank accounts in one dashboard", "Aggregate and per-account balance", "Transaction categorization across banks", "Inter-account transfer detection"], nidhi: "Shows total cash position across all accounts every morning.", sources: ["Bank AA", "PDF Upload"] },
      { name: "Loan Eligibility Scorer", plan: "Growth+", updated: "Monthly", tracks: ["Working capital loan eligibility", "Term loan eligibility", "CGTMSE scheme eligibility", "NBFC vs bank comparison"], nidhi: "Tells you exactly what loans you qualify for and at what rates.", sources: ["Bank AA", "Financials"] },
      { name: "Bank Reconciliation", plan: "Growth+", updated: "Daily", tracks: ["Book vs bank balance matching", "Unreconciled transaction flagging", "Duplicate payment detection", "Missing receipt identification"], nidhi: "Flags unreconciled transactions daily.", sources: ["Bank AA", "Tally"] },
      { name: "Working Capital Marketplace", plan: "Growth+", updated: "Real-time", tracks: ["Invoice discounting offers from 8 NBFCs", "Working capital loan pre-approvals", "Best rate comparison", "One-click application"], nidhi: "Connects you to financing when runway drops below 30 days.", sources: ["Bank AA", "Receivables", "NBFC Partners"] },
    ],
  },
  {
    id: "ca-partner", name: "CA Partner Ecosystem", color: "#8B6914",
    description: "White-label dashboard for CA firms. Manage multiple clients, bulk filing, and portfolio health from one screen.",
    modules: [
      { name: "White-Label Dashboard", plan: "Enterprise", updated: "Real-time", tracks: ["Your branding, your URL, your client experience", "All FynHelp modules under your brand", "Custom report templates", "Client onboarding workflow"], nidhi: "Delivers insights to your clients under your firm's brand.", sources: ["All Client Data"] },
      { name: "Multi-Client Manager", plan: "Enterprise", updated: "Real-time", tracks: ["Portfolio view of all clients", "Client health ranking", "Deadline tracker across clients", "Bulk action capabilities"], nidhi: "Shows which clients need attention today, ranked by urgency.", sources: ["All Client Data"] },
      { name: "Client Health Overview", plan: "Enterprise", updated: "Daily", tracks: ["Financial health score per client", "Compliance status per client", "Risk alerts across portfolio", "Revenue at risk summary"], nidhi: "Morning brief includes portfolio-wide summary for CAs.", sources: ["All Client Financial Data"] },
      { name: "Bulk Filing Assistant", plan: "Enterprise", updated: "Monthly", tracks: ["Batch GSTR-1/3B preparation", "Cross-client deadline management", "Bulk data validation", "Filing status tracking"], nidhi: "Prepares filing drafts for multiple clients simultaneously.", sources: ["GSP API", "Client Tally Data"] },
    ],
  },
];

const filterTabs = [
  { id: "all", label: "All 50+" },
  ...suites.map((s) => ({ id: s.id, label: s.name.replace(" Intelligence", "").replace(" & Workforce", "").replace(" & Fintech", "").replace(" & Growth", "").replace(" Partner Ecosystem", " Partner") })),
];

const comparisonData = [
  { feature: "AI-powered insights", fyn: "✓", tally: "✗", zoho: "~", khata: "✗", ca: "~", cfo: "✓" },
  { feature: "Cash flow forecasting", fyn: "✓", tally: "✗", zoho: "~", khata: "✗", ca: "✗", cfo: "✓" },
  { feature: "GST ITC reconciliation", fyn: "✓", tally: "~", zoho: "~", khata: "✗", ca: "✓", cfo: "~" },
  { feature: "Notice risk scoring", fyn: "✓", tally: "✗", zoho: "✗", khata: "✗", ca: "~", cfo: "~" },
  { feature: "Decision simulator", fyn: "✓", tally: "✗", zoho: "✗", khata: "✗", ca: "✗", cfo: "✓" },
  { feature: "WhatsApp alerts in Hindi", fyn: "✓", tally: "✗", zoho: "✗", khata: "~", ca: "✗", cfo: "✗" },
  { feature: "Working capital marketplace", fyn: "✓", tally: "✗", zoho: "✗", khata: "✗", ca: "✗", cfo: "~" },
  { feature: "Daily monitoring", fyn: "✓", tally: "✗", zoho: "✗", khata: "✗", ca: "✗", cfo: "~" },
  { feature: "Available 24/7", fyn: "✓", tally: "✗", zoho: "✗", khata: "✗", ca: "✗", cfo: "✗" },
  { feature: "Cost per year", fyn: "₹24K-1.6L", tally: "₹18K-54K", zoho: "₹12K-60K", khata: "Free-₹6K", ca: "₹60K-3L", cfo: "₹30-50L" },
];

export default function ProductsPage() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [authModal, setAuthModal] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const filteredSuites = useMemo(() => {
    let result = activeFilter === "all" ? suites : suites.filter((s) => s.id === activeFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.map((s) => ({
        ...s,
        modules: s.modules.filter((m) => m.name.toLowerCase().includes(q) || m.tracks.some((t) => t.toLowerCase().includes(q))),
      })).filter((s) => s.modules.length > 0);
    }
    return result;
  }, [activeFilter, search]);

  const totalModules = suites.reduce((a, s) => a + s.modules.length, 0);

  const handleModuleClick = (moduleName: string) => {
    if (!user) {
      setAuthModal(moduleName);
    } else {
      // BACKEND: Check subscription status from businesses table
      // If active/trial → navigate to dashboard module
      // If expired → navigate to /pricing?upgrade=true
      navigate("/dashboard/cockpit");
    }
  };

  const cellColor = (v: string) => {
    if (v === "✓") return "text-fyn-success";
    if (v === "~") return "text-fyn-warning";
    if (v === "✗") return "text-fyn-red";
    return "text-fyn-ink";
  };

  return (
    <Layout>
      {/* Hero */}
      <section className="bg-muted" style={{ padding: "48px 0" }}>
        <div className="fyn-container text-center font-serif">
          <h1 className="font-serif text-5xl text-primary" style={{ fontWeight: 700, lineHeight: 1.15, marginBottom: 16 }}>
            50+ modules. One AI connecting everything.
          </h1>
          <p className="text-secondary-foreground font-sans" style={{ fontSize: 18, maxWidth: 720, margin: "0 auto", lineHeight: 1.7 }}>
            FynHelp's intelligence modules are not independent features — they are interconnected systems that feed a single intelligence engine: Nidhi. Every module's output is an input into Nidhi's reasoning.
          </p>
        </div>
      </section>

      {/* Sticky filter bar */}
      <div className="sticky top-[72px] z-30 bg-fyn-beige-dark border-b border-fyn-ink-10" style={{ padding: "12px 0" }}>
        <div className="fyn-container flex flex-wrap items-center gap-2 text-primary-foreground border-primary-foreground bg-primary-foreground">
          {filterTabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveFilter(t.id)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                activeFilter === t.id
                  ? "bg-fyn-ink text-white border-fyn-ink"
                  : "text-primary-foreground border-accent bg-primary"
              }`}
              style={{ transition: "all 250ms cubic-bezier(0.25, 0.1, 0.25, 1)" }}
            >
              {t.label}
            </button>
          ))}
          <div className="ml-auto">
            <input
              type="search"
              placeholder="Search modules..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="text-sm px-3 py-1.5 rounded-lg border bg-fyn-beige-card text-fyn-ink placeholder:text-fyn-ink/40 focus:outline-none border-accent"
              style={{ width: 180 }}
              aria-label="Search modules"
            />
          </div>
        </div>
      </div>

      {/* Suites */}
      <section className="bg-fyn-beige fyn-section">
        <div className="fyn-container">
          <p className="mb-8 text-base font-semibold font-sans text-secondary-foreground">{totalModules} modules across {suites.length} intelligence suites</p>

          {filteredSuites.map((s) => (
            <div key={s.id} className="mb-12 bg-fyn-beige-card border border-fyn-ink-10 rounded-lg overflow-hidden">
              {/* Suite header */}
              <div className="flex items-center gap-3 p-6 border-b border-fyn-ink-10" style={{ borderLeft: `6px solid ${s.color}` }}>
                <div className="w-3 h-3 rounded-full" style={{ background: s.color }} />
                <h3 className="font-serif text-xl text-fyn-ink">{s.name}</h3>
                <span className="text-sm ml-auto text-secondary-foreground">{s.modules.length} modules</span>
              </div>
              <p className="px-6 pt-4 pb-2 text-fyn-ink/70 text-sm leading-relaxed max-w-3xl">{s.description}</p>

              {/* Modules grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
                {s.modules.map((m) => (
                  <div
                    key={m.name}
                    onClick={() => handleModuleClick(m.name)}
                    className="bg-fyn-beige border rounded-lg p-5 cursor-pointer relative group border-secondary-foreground text-secondary-foreground font-bold"
                    style={{ transition: "all 250ms cubic-bezier(0.25, 0.1, 0.25, 1)" }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)";
                      (e.currentTarget as HTMLElement).style.borderColor = s.color;
                      (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 24px rgba(26,16,8,0.10)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                      (e.currentTarget as HTMLElement).style.borderColor = "";
                      (e.currentTarget as HTMLElement).style.boxShadow = "";
                    }}
                    role="button"
                    tabIndex={0}
                    aria-label={`Explore ${m.name}`}
                  >
                    {/* Arrow icon */}
                    <span className="absolute top-3 right-3 text-fyn-red opacity-0 -translate-x-1.5 group-hover:opacity-100 group-hover:translate-x-0"
                      style={{ transition: "all 200ms" }}>→</span>

                    <div className="flex items-center gap-2 mb-3">
                      <span className="font-semibold text-fyn-ink text-[15px]" style={{ fontFamily: "'Inter', sans-serif" }}>{m.name}</span>
                    </div>
                    <div className="flex gap-2 mb-3">
                      <span className="text-[10px] px-2 py-0.5 rounded bg-fyn-gold-light text-fyn-gold fyn-label">{m.plan}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-fyn-beige-dark text-fyn-ink/50 fyn-label">{m.updated}</span>
                    </div>
                    <div className="mb-3">
                      <p className="fyn-caption text-fyn-gold text-[10px] mb-1">What it tracks</p>
                      <ul className="space-y-1">
                        {m.tracks.map((t) => (
                          <li key={t} className="text-fyn-ink/60 text-[12px] leading-snug flex gap-1.5">
                            <span className="text-fyn-ink/30 flex-shrink-0">•</span>
                            <span>{t}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <p className="text-fyn-ink/80 text-[12px] leading-snug mb-3">
                      <span className="text-fyn-gold fyn-caption text-[10px]">Nidhi: </span>{m.nidhi}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {m.sources.map((src) => (
                        <span key={src} className="text-[10px] px-2 py-0.5 rounded bg-fyn-beige-dark text-fyn-ink/40">{src}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Comparison Table */}
          <div className="mt-16">
            <h2 className="text-3xl text-fyn-ink mb-8 text-center">FynHelp vs. alternatives</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-fyn-ink text-white">
                    <th className="text-left p-3 font-medium sticky left-0 bg-fyn-ink z-10">Feature</th>
                    <th className="p-3 font-semibold text-fyn-red">FynHelp</th>
                    <th className="p-3 font-medium">Tally Prime</th>
                    <th className="p-3 font-medium">Zoho Books</th>
                    <th className="p-3 font-medium">Khatabook</th>
                    <th className="p-3 font-medium">Your CA</th>
                    <th className="p-3 font-medium">Real CFO</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonData.map((r, i) => (
                    <tr key={r.feature} className={i % 2 === 0 ? "bg-fyn-beige-card" : "bg-fyn-beige"}>
                      <td className="p-3 text-fyn-ink font-medium sticky left-0 z-10" style={{ background: "inherit" }}>{r.feature}</td>
                      <td className={`p-3 text-center font-semibold ${cellColor(r.fyn)}`}>{r.fyn}</td>
                      <td className={`p-3 text-center ${cellColor(r.tally)}`}>{r.tally}</td>
                      <td className={`p-3 text-center ${cellColor(r.zoho)}`}>{r.zoho}</td>
                      <td className={`p-3 text-center ${cellColor(r.khata)}`}>{r.khata}</td>
                      <td className={`p-3 text-center ${cellColor(r.ca)}`}>{r.ca}</td>
                      <td className={`p-3 text-center ${cellColor(r.cfo)}`}>{r.cfo}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Auth Modal */}
      {authModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(26,16,8,0.60)", backdropFilter: "blur(4px)" }}
          onClick={() => setAuthModal(null)}
        >
          <div
            className="bg-fyn-beige-card rounded-xl p-8 max-w-[420px] w-full mx-4"
            style={{
              boxShadow: "0 24px 64px rgba(26,16,8,0.20)",
              animation: "scale-in 250ms cubic-bezier(0.34, 1.56, 0.64, 1)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setAuthModal(null)}
              className="absolute top-4 right-4 text-fyn-ink/40 hover:text-fyn-ink"
              aria-label="Close"
              style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", cursor: "pointer", fontSize: 20 }}
            >×</button>
            <h3 className="font-serif text-xl text-fyn-ink mb-2">Sign in to explore {authModal}</h3>
            <p className="text-fyn-ink/60 text-sm mb-6">
              FynHelp's {authModal} module is available free for 15 days. Sign in or create your account to start.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => { setAuthModal(null); navigate("/signin"); }}
                className="w-full py-3 rounded-lg border border-fyn-ink text-fyn-ink font-medium hover:bg-fyn-ink hover:text-white"
                style={{ transition: "all 250ms" }}
              >
                Sign In
              </button>
              <button
                onClick={() => { setAuthModal(null); navigate("/signup"); }}
                className="w-full py-3 rounded-lg bg-fyn-red text-white font-semibold hover:opacity-90"
                style={{ transition: "all 250ms" }}
              >
                Start Free Trial
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
