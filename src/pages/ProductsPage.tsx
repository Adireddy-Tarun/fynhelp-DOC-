import Layout from "@/components/Layout";

const suites = [
  { name: "Liquidity Intelligence", modules: ["Financial Health Score", "Cash Flow Projection", "Burn Rate Monitor", "Working Capital Optimizer", "Liquidity Alerts", "Runway Calculator"], color: "bg-fyn-red" },
  { name: "Revenue Intelligence", modules: ["Receivables AI", "Default Prediction", "Customer Risk Score", "Collections Automation", "MSME Rights Enforcer", "Revenue Forecasting", "DSO Tracker", "Invoice Intelligence"], color: "bg-blue-600" },
  { name: "Cost Intelligence", modules: ["Spend Analytics", "Vendor Signals", "Payables Optimization", "Capex Decision AI", "DPO Tracker", "Cost Benchmarking"], color: "bg-green-600" },
  { name: "GST & Tax Intelligence", modules: ["ITC Reconciliation Engine", "Notice Risk Scorer", "Smart Filing Calendar", "Vendor GST Health", "Advance Tax Calculator", "TDS Tracker", "E-Invoice Manager", "HSN Validator", "GSTR-2B Matcher", "Input Credit Optimizer"], color: "bg-amber-600" },
  { name: "Governance Intelligence", modules: ["Compliance Dashboard", "Filing Alerts", "MCA/ROC Tracker", "Audit Readiness Score", "MSME Rights", "Board Governance", "PF/ESIC Monitor", "Labour Law Alerts", "FEMA Tracker", "Director KYC"], color: "bg-purple-600" },
  { name: "HR & Workforce Intelligence", modules: ["Hiring Forecast AI", "Workforce Cost Model", "Attrition Risk", "Payroll Cash Planner", "PF & ESIC Compliance", "Labour Law Alerts", "Seat Cost Calculator", "CTC Benchmarking", "Leave Liability", "Gratuity Provision"], color: "bg-teal-600" },
  { name: "Decision Simulator", modules: ["Credit Terms Simulator", "Hiring Impact Model", "Pricing Change Analyzer", "GST Refund Delay Model", "Capex Decision Model", "Loan Impact Analyzer", "Seasonal Push Model", "M&A Scenario Builder"], color: "bg-red-600" },
  { name: "Market & Growth Intelligence", modules: ["Industry Benchmarking", "Credit Rating Simulator", "Export Opportunities", "Fundraise Readiness", "Market Sizing", "Competitor Signals"], color: "bg-rose-500" },
  { name: "Banking & Fintech Intelligence", modules: ["Multi-Bank Aggregation", "AA Framework", "UPI Tagging", "Loan Eligibility", "Working Capital Marketplace", "Bank Reconciliation"], color: "bg-teal-500" },
  { name: "CA & Partner Ecosystem", modules: ["White-Label Dashboard", "Multi-Client Manager", "Client Health Overview", "Bulk Filing Assistant"], color: "bg-yellow-700" },
];

const integrations = [
  { category: "Banking", items: ["HDFC", "ICICI", "SBI", "Axis", "Kotak", "Yes Bank", "+ 15 more"] },
  { category: "Accounting", items: ["Tally Prime", "Zoho Books", "QuickBooks India", "Busy", "Marg"] },
  { category: "Payroll", items: ["Keka", "GreytHR", "Razorpay Payroll", "Darwinbox"] },
  { category: "GST", items: ["GSP Certified", "CBIC Partner", "GSTIN API", "E-Invoice", "E-Way Bill"] },
  { category: "Communication", items: ["WhatsApp Business", "Gmail", "Outlook"] },
];

const ProductsPage = () => (
  <Layout>
    <section className="bg-fyn-ink py-16">
      <div className="fyn-container text-center">
        <h1 className="text-3xl md:text-[48px] leading-tight text-white">
          50+ intelligence modules. One platform. One AI CFO named Nidhi.
        </h1>
      </div>
    </section>

    <section className="bg-fyn-beige fyn-section">
      <div className="fyn-container">
        {suites.map((s) => (
          <div key={s.name} className="mb-8 bg-fyn-beige-dark border border-fyn-ink-10 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-3 h-3 rounded-full ${s.color}`} />
              <h3 className="text-fyn-ink font-serif text-xl">{s.name}</h3>
              <span className="text-fyn-ink/40 text-sm ml-auto">{s.modules.length} modules</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {s.modules.map((m) => (
                <div key={m} className="bg-fyn-beige border border-fyn-ink-10 rounded px-3 py-2 text-sm text-fyn-ink/70">{m}</div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>

    <section className="bg-fyn-ink fyn-section">
      <div className="fyn-container">
        <h2 className="text-3xl text-white text-center mb-12">Works with everything Indian businesses already use</h2>
        <div className="space-y-8">
          {integrations.map((cat) => (
            <div key={cat.category}>
              <h3 className="text-white/40 fyn-label text-xs mb-3">{cat.category}</h3>
              <div className="flex flex-wrap gap-3">
                {cat.items.map((i) => (
                  <span key={i} className="bg-white/5 border border-white/10 text-white/70 text-sm px-4 py-2 rounded-lg">{i}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  </Layout>
);

export default ProductsPage;
