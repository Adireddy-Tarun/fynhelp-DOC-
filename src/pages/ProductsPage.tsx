import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";

interface Module {
  name: string;
  plan: string;
  updated: string;
  desc: string;
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
    description: "The heartbeat of your business. Monitors every dimension of your cash health, not just what's in the bank today, but what will be there in 30, 60, and 90 days.",
    modules: [
      { name: "Financial Health Score", plan: "All Plans", updated: "Daily", desc: "Composite score (0-100) across liquidity, stability, compliance, and growth." },
      { name: "Cash Flow Projection", plan: "All Plans", updated: "Every 6h", desc: "Daily projected cash for next 180 days with AI confidence bands." },
      { name: "Burn Rate Monitor", plan: "All Plans", updated: "Daily", desc: "30-day rolling average daily burn with category breakdown." },
      { name: "Working Capital Optimizer", plan: "Growth+", updated: "Weekly", desc: "DSO vs industry benchmark with rupee cost of non-optimal working capital." },
      { name: "Liquidity Alerts", plan: "All Plans", updated: "Real-time", desc: "WhatsApp + in-app push when cash crosses any configured threshold." },
      { name: "Runway Calculator", plan: "All Plans", updated: "Every 6h", desc: "Current runway with scenario-adjusted projections and peer comparison." },
    ],
  },
  {
    id: "revenue", name: "Revenue Intelligence", color: "#1A4A8B",
    description: "Your revenue is only as real as what arrives in your bank. Tracks what you'll collect, when, and which customers are at risk of default.",
    modules: [
      { name: "Receivables AI", plan: "Growth+", updated: "Daily", desc: "Outstanding by aging bucket with auto-payment detection from bank credits." },
      { name: "Default Prediction", plan: "Growth+", updated: "Weekly", desc: "ML model scoring each customer 0-100 on payment likelihood." },
      { name: "Customer Risk Score", plan: "Growth+", updated: "Weekly", desc: "Payment reliability, order stability, and GST compliance combined score." },
      { name: "Collections Automation", plan: "Growth+", updated: "Real-time", desc: "WhatsApp + email chase sequences with personalised messages." },
      { name: "Revenue Concentration Risk", plan: "Pro+", updated: "Monthly", desc: "Alerts when any customer exceeds 20% of total revenue." },
      { name: "Churn Early Warning", plan: "Pro+", updated: "Weekly", desc: "Detects declining order frequency and payment slowdowns." },
      { name: "Pricing Intelligence", plan: "Pro+", updated: "Monthly", desc: "Gross margin per customer segment and product category." },
      { name: "Payment Behaviour Analytics", plan: "Growth+", updated: "Weekly", desc: "Per-customer payment patterns with prediction of exact payment date." },
    ],
  },
  {
    id: "cost", name: "Cost Intelligence", color: "#1A6B3C",
    description: "Control spending before it controls you. Tracks vendor payments, cost trends, and identifies optimization opportunities.",
    modules: [
      { name: "Spend Analytics", plan: "Growth+", updated: "Daily", desc: "Category-wise spend breakdown with anomaly detection." },
      { name: "Vendor Signals", plan: "Growth+", updated: "Weekly", desc: "Early payment discount opportunities and vendor consolidation suggestions." },
      { name: "Payables Optimization", plan: "Growth+", updated: "Daily", desc: "Optimal payment timing to preserve cash while maintaining relationships." },
      { name: "Capex Decision AI", plan: "Pro+", updated: "On demand", desc: "ROI analysis with loan vs self-fund comparison and break-even calculation." },
      { name: "DPO Tracker", plan: "Growth+", updated: "Weekly", desc: "Days Payable Outstanding trend vs industry benchmark." },
      { name: "Cost Benchmarking", plan: "Pro+", updated: "Monthly", desc: "Your cost ratios vs 500+ similar businesses in your industry." },
    ],
  },
  {
    id: "gst", name: "GST & Tax Intelligence", color: "#8B5A00",
    description: "FynHelp's most India-specific suite. Protects your ITC, prevents GST notices, and keeps you ahead of every filing deadline.",
    modules: [
      { name: "ITC Reconciliation Engine", plan: "Growth+", updated: "Monthly", desc: "Auto-matches purchase register vs GSTR-2B with vendor chase list." },
      { name: "Notice Risk Scorer", plan: "Growth+", updated: "Monthly", desc: "0-100 score using 6 weighted factors including filing gaps and ITC mismatch." },
      { name: "Smart Filing Calendar", plan: "All Plans", updated: "Real-time", desc: "Your GSTIN-based deadlines with 14/7/3/1-day advance alerts." },
      { name: "Vendor GST Health", plan: "Growth+", updated: "Monthly", desc: "Filing compliance score per vendor with suspension/cancellation alerts." },
      { name: "Advance Tax Calculator", plan: "Pro+", updated: "Quarterly", desc: "Live P&L to tax liability with 4-installment calculation." },
      { name: "ITC Refund Tracker", plan: "Pro+", updated: "Monthly", desc: "For exporters and inverted duty businesses with cash flow impact." },
      { name: "TDS Obligation Tracker", plan: "Pro+", updated: "Monthly", desc: "Links vendor payments to TDS obligations with filing due dates." },
      { name: "E-Invoice Manager", plan: "Pro+", updated: "Real-time", desc: "IRN generation tracking with e-way bill integration." },
      { name: "GSTN Notification Tracker", plan: "Growth+", updated: "Weekly", desc: "CBIC circulars filtered to show only what affects your business." },
      { name: "GSTR-9 Annual Return Preparer", plan: "Pro+", updated: "Annual", desc: "Auto-drafts from 12 months of monthly data for CA review." },
    ],
  },
  {
    id: "governance", name: "Governance Intelligence", color: "#6B21A8",
    description: "50+ compliance obligations tracked automatically. ROC, FEMA, MCA, audit readiness: nothing falls through the cracks.",
    modules: [
      { name: "Compliance Dashboard", plan: "Pro+", updated: "Daily", desc: "All regulatory obligations in one view with priority ranking." },
      { name: "MCA/ROC Tracker", plan: "Pro+", updated: "Monthly", desc: "Annual return filing status, Director KYC, and board meeting compliance." },
      { name: "Audit Readiness Score", plan: "Pro+", updated: "Quarterly", desc: "Documentation completeness check with gap identification." },
      { name: "MSME Rights Enforcer", plan: "Growth+", updated: "On demand", desc: "Identifies invoices eligible for 43B(h) claims with demand letters." },
    ],
  },
  {
    id: "hr", name: "HR & Workforce Intelligence", color: "#0F766E",
    description: "Know when you can afford to grow. Hiring forecast, payroll cash planning, attrition risk, all backed by financial data.",
    modules: [
      { name: "Hiring Forecast AI", plan: "Growth+", updated: "Monthly", desc: "Revenue-per-employee trend with time-to-breakeven per new hire." },
      { name: "Workforce Cost Model", plan: "Growth+", updated: "Monthly", desc: "True cost per employee including PF, ESIC, gratuity, bonus provisions." },
      { name: "Attrition Risk", plan: "Pro+", updated: "Quarterly", desc: "Department-wise attrition trends with cost of replacement per role." },
      { name: "Payroll Cash Planner", plan: "Growth+", updated: "Monthly", desc: "Next payroll date, amount, and cash reserve requirement." },
      { name: "PF & ESIC Compliance", plan: "Growth+", updated: "Monthly", desc: "Monthly PF contribution calculation with filing due date reminders." },
    ],
  },
  {
    id: "simulator", name: "Decision Simulator", color: "#C41E1E",
    description: "Model every major decision before you commit. 8 what-if scenarios modelled against your live financial data.",
    modules: [
      { name: "Credit Terms Simulator", plan: "Growth+", updated: "On demand", desc: "Impact of changing payment terms on cash flow over 6 months." },
      { name: "Hiring Impact Model", plan: "Growth+", updated: "On demand", desc: "Revenue-per-hire breakeven timeline with runway impact." },
      { name: "Pricing Change Analyzer", plan: "Growth+", updated: "On demand", desc: "Volume elasticity estimation with margin impact at different price points." },
      { name: "GST Refund Delay Model", plan: "Growth+", updated: "On demand", desc: "Cash flow impact of 30/60/90-day refund delay scenarios." },
      { name: "Capex Decision Model", plan: "Pro+", updated: "On demand", desc: "Loan vs self-fund comparison with 24-month cash flow projection." },
      { name: "Loan Impact Analyzer", plan: "Growth+", updated: "On demand", desc: "EMI burden on monthly cash flow with total interest cost analysis." },
      { name: "Seasonal Push Model", plan: "Pro+", updated: "On demand", desc: "Inventory buildup cash requirement with working capital gap analysis." },
      { name: "M&A Scenario Builder", plan: "Pro+", updated: "On demand", desc: "Acquisition cost vs synergy savings with payback period calculation." },
    ],
  },
  {
    id: "market", name: "Market & Growth Intelligence", color: "#DC6B19",
    description: "Know where you stand. Industry benchmarks, credit rating simulation, fundraise readiness assessment.",
    modules: [
      { name: "Industry Benchmarking", plan: "Pro+", updated: "Monthly", desc: "Revenue growth vs sector average with cost ratio benchmarks." },
      { name: "Credit Rating Simulator", plan: "Pro+", updated: "Monthly", desc: "Simulated credit score with improvement actions ranked by impact." },
      { name: "Fundraise Readiness", plan: "Pro+", updated: "Quarterly", desc: "Documentation completeness with unit economics clarity scoring." },
      { name: "Export Opportunities", plan: "Pro+", updated: "Quarterly", desc: "Export incentive eligibility with market sizing and compliance requirements." },
    ],
  },
  {
    id: "banking", name: "Banking & Fintech Intelligence", color: "#1A4A8B",
    description: "All your accounts in one intelligent view. Multi-bank aggregation via RBI's Account Aggregator framework.",
    modules: [
      { name: "Multi-Bank Aggregation", plan: "All Plans", updated: "Every 6h", desc: "All bank accounts in one dashboard with transaction categorization." },
      { name: "Loan Eligibility Scorer", plan: "Growth+", updated: "Monthly", desc: "Working capital and term loan eligibility with CGTMSE scheme check." },
      { name: "Bank Reconciliation", plan: "Growth+", updated: "Daily", desc: "Book vs bank balance matching with duplicate payment detection." },
      { name: "Working Capital Marketplace", plan: "Growth+", updated: "Real-time", desc: "Invoice discounting offers from 8 NBFCs with one-click application." },
    ],
  },
  {
    id: "ca-partner", name: "CA Partner Ecosystem", color: "#8B6914",
    description: "White-label dashboard for CA firms. Manage multiple clients, bulk filing, and portfolio health from one screen.",
    modules: [
      { name: "White-Label Dashboard", plan: "Enterprise", updated: "Real-time", desc: "Your branding, your URL, your client experience with all FynHelp modules." },
      { name: "Multi-Client Manager", plan: "Enterprise", updated: "Real-time", desc: "Portfolio view of all clients with health ranking and deadline tracker." },
      { name: "Client Health Overview", plan: "Enterprise", updated: "Daily", desc: "Financial health score per client with risk alerts across portfolio." },
      { name: "Bulk Filing Assistant", plan: "Enterprise", updated: "Monthly", desc: "Batch GSTR-1/3B preparation with cross-client deadline management." },
    ],
  },
];

const suiteColors: Record<string, string> = {
  liquidity: "#C41E1E",
  revenue: "#1A4A8B",
  cost: "#1A6B3C",
  gst: "#8B5A00",
  governance: "#6B21A8",
  hr: "#0F766E",
  simulator: "#C41E1E",
  market: "#DC6B19",
  banking: "#1A4A8B",
  "ca-partner": "#8B6914",
};

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
  const [selectedSuite, setSelectedSuite] = useState("liquidity");
  const [search, setSearch] = useState("");
  const [authModal, setAuthModal] = useState<string | null>(null);
  const [panelKey, setPanelKey] = useState(0);
  const { user } = useAuth();
  const navigate = useNavigate();

  const currentSuite = suites.find((s) => s.id === selectedSuite) || suites[0];

  const filteredModules = useMemo(() => {
    if (!search.trim()) return currentSuite.modules;
    const q = search.toLowerCase();
    return currentSuite.modules.filter(
      (m) => m.name.toLowerCase().includes(q) || m.desc.toLowerCase().includes(q)
    );
  }, [currentSuite, search]);

  const totalModules = suites.reduce((a, s) => a + s.modules.length, 0);

  const handleModuleClick = (moduleName: string) => {
    if (!user) {
      setAuthModal(moduleName);
    } else {
      navigate("/dashboard/cockpit");
    }
  };

  const handleSuiteChange = (id: string) => {
    setSelectedSuite(id);
    setSearch("");
    setPanelKey((k) => k + 1);
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
      <section className="bg-fyn-ink" style={{ padding: "48px 0" }}>
        <div className="fyn-container text-center">
          <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 700, fontSize: 48, color: "#FFFFFF", lineHeight: 1.15, marginBottom: 16 }}>
            {totalModules}+ modules. One AI connecting everything.
          </h1>
          <p style={{ color: "rgba(255,255,255,0.70)", fontSize: 18, maxWidth: 720, margin: "0 auto", lineHeight: 1.7 }}>
            FynHelp's intelligence modules are interconnected systems that feed a single intelligence engine: Nidhi. Every module's output is an input into Nidhi's reasoning.
          </p>
        </div>
      </section>

      {/* Mobile suite pills */}
      <div className="md:hidden sticky top-[72px] z-30 bg-fyn-beige-dark border-b border-fyn-ink-10 overflow-x-auto" style={{ padding: "8px 16px" }}>
        <div className="flex gap-2" style={{ width: "max-content" }}>
          {suites.map((s) => (
            <button
              key={s.id}
              onClick={() => handleSuiteChange(s.id)}
              className="whitespace-nowrap rounded-full px-3 transition-all"
              style={{
                height: 32,
                fontSize: 13,
                fontWeight: 500,
                background: selectedSuite === s.id ? "#C41E1E" : "transparent",
                color: selectedSuite === s.id ? "#FFFFFF" : "rgba(26,16,8,0.60)",
                border: selectedSuite === s.id ? "none" : "1px solid rgba(26,16,8,0.15)",
              }}
            >
              {s.name.replace(" Intelligence", "").replace(" & Workforce", "").replace(" & Fintech", "").replace(" & Growth", "").replace(" Partner Ecosystem", " Partner")}
            </button>
          ))}
        </div>
      </div>

      {/* Two-panel explorer */}
      <section className="bg-fyn-beige fyn-section">
        <div className="fyn-container">
          <p className="text-fyn-ink/60 text-sm mb-6">{totalModules} modules across {suites.length} intelligence suites</p>

          <div className="flex gap-0" style={{ minHeight: 600 }}>
            {/* Left panel - desktop only */}
            <div className="hidden md:block flex-shrink-0" style={{ width: 340, position: "sticky", top: 96, alignSelf: "flex-start" }}>
              <div className="bg-white rounded-lg border" style={{ borderColor: "#D4C9A8" }}>
                {suites.map((s, i) => (
                  <div key={s.id}>
                    <button
                      onClick={() => handleSuiteChange(s.id)}
                      className="w-full flex items-center justify-between transition-all"
                      style={{
                        height: 56,
                        padding: "0 20px",
                        background: selectedSuite === s.id ? "#FDF2F1" : "transparent",
                        borderLeft: selectedSuite === s.id ? "3px solid #C41E1E" : "3px solid transparent",
                        transition: "all 200ms",
                      }}
                      onMouseEnter={(e) => {
                        if (selectedSuite !== s.id) {
                          e.currentTarget.style.background = "#FAF7F0";
                          e.currentTarget.style.borderLeft = "3px solid transparent";
                          e.currentTarget.style.transform = "translateX(2px)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (selectedSuite !== s.id) {
                          e.currentTarget.style.background = "transparent";
                          e.currentTarget.style.borderLeft = "3px solid transparent";
                          e.currentTarget.style.transform = "translateX(0)";
                        }
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="rounded-full" style={{ width: 8, height: 8, background: suiteColors[s.id] }} />
                        <span style={{
                          fontFamily: "'Inter', sans-serif",
                          fontWeight: 600,
                          fontSize: 16,
                          color: selectedSuite === s.id ? "#C41E1E" : "#1A1008",
                        }}>
                          {s.name}
                        </span>
                      </div>
                      <span style={{
                        fontFamily: "'Inter', sans-serif",
                        fontWeight: 500,
                        fontSize: 12,
                        color: "rgba(26,16,8,0.60)",
                        background: "hsl(40 42% 86%)",
                        padding: "2px 8px",
                        borderRadius: 10,
                      }}>
                        {s.modules.length}
                      </span>
                    </button>
                    {i < suites.length - 1 && <div style={{ height: 1, background: "#E0D9C8", margin: "0 20px" }} />}
                  </div>
                ))}
              </div>
            </div>

            {/* Right panel */}
            <div className="flex-1 md:pl-8" key={panelKey} style={{ animation: "fade-in 350ms ease-out" }}>
              {/* Suite header */}
              <div style={{ borderRadius: 12, overflow: "hidden", background: "#FFFFFF", border: "1px solid #D4C9A8", marginBottom: 24 }}>
                <div style={{ height: 4, background: suiteColors[currentSuite.id], width: "100%" }} />
                <div style={{ padding: "24px 28px" }}>
                  <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 700, fontSize: 32, color: "#1A1008", marginBottom: 8 }}>
                    {currentSuite.name}
                  </h2>
                  <p style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: 16, color: "rgba(26,16,8,0.70)", lineHeight: 1.7, maxWidth: 480 }}>
                    {currentSuite.description}
                  </p>
                  <div className="flex gap-2 mt-3">
                    <span style={{ fontSize: 12, fontWeight: 500, background: "hsl(40 42% 86%)", color: "rgba(26,16,8,0.60)", padding: "3px 10px", borderRadius: 10 }}>
                      {currentSuite.modules.length} modules
                    </span>
                  </div>
                </div>
              </div>

              {/* Search */}
              <input
                type="search"
                placeholder={`Search modules in ${currentSuite.name}...`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full mb-4 text-sm px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-fyn-red/30"
                style={{ height: 36, border: "1px solid #C4B896", background: "#FFFFFF", color: "#1A1008", fontFamily: "'Inter', sans-serif" }}
              />

              {/* Module list */}
              <div className="bg-white rounded-lg border" style={{ borderColor: "#D4C9A8" }}>
                {filteredModules.map((m, i) => (
                  <div
                    key={m.name}
                    onClick={() => handleModuleClick(m.name)}
                    className="flex items-center gap-4 cursor-pointer group"
                    style={{
                      minHeight: 72,
                      padding: "12px 20px",
                      borderBottom: i < filteredModules.length - 1 ? "1px solid #E0D9C8" : "none",
                      transition: "all 200ms",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#FAF7F0";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                    }}
                    role="button"
                    tabIndex={0}
                  >
                    {/* Number */}
                    <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: 13, color: "rgba(26,16,8,0.30)", fontVariantNumeric: "tabular-nums", minWidth: 20 }}>
                      {String(i + 1).padStart(2, "0")}
                    </span>

                    {/* Center */}
                    <div className="flex-1 min-w-0">
                      <p className="group-hover:text-[#C41E1E]" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 15, color: "#1A1008", transition: "color 200ms", lineHeight: 1.4 }}>
                        {m.name}
                      </p>
                      <p style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: 13, color: "rgba(26,16,8,0.60)", lineHeight: 1.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {m.desc}
                      </p>
                    </div>

                    {/* Right badges */}
                    <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
                      <span style={{ fontSize: 11, fontWeight: 500, background: "#F5E9C8", color: "#6B5010", padding: "2px 8px", borderRadius: 4 }}>
                        {m.plan}
                      </span>
                      <span style={{ fontSize: 11, fontWeight: 500, background: "hsl(40 42% 86%)", color: "rgba(26,16,8,0.60)", padding: "2px 8px", borderRadius: 4 }}>
                        {m.updated}
                      </span>
                    </div>

                    {/* Arrow */}
                    <span
                      className="group-hover:translate-x-1 group-hover:text-[#C41E1E]"
                      style={{ fontSize: 14, color: "rgba(26,16,8,0.20)", transition: "all 150ms", flexShrink: 0 }}
                    >
                      →
                    </span>
                  </div>
                ))}
                {filteredModules.length === 0 && (
                  <div style={{ padding: 40, textAlign: "center", color: "rgba(26,16,8,0.40)", fontSize: 14 }}>
                    No modules match your search.
                  </div>
                )}
              </div>
            </div>
          </div>

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
                    <tr key={r.feature} className={i % 2 === 0 ? "bg-white" : "bg-fyn-beige"}>
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
            className="bg-white rounded-xl p-8 max-w-[420px] w-full mx-4 relative"
            style={{ boxShadow: "0 24px 64px rgba(26,16,8,0.20)", animation: "scale-in 250ms cubic-bezier(0.34, 1.56, 0.64, 1)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setAuthModal(null)}
              className="absolute top-4 right-4"
              aria-label="Close"
              style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: "rgba(26,16,8,0.40)" }}
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
