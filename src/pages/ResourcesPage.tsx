import { useState } from "react";
import Layout from "@/components/Layout";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const downloadHref = (id: string) =>
  `${SUPABASE_URL}/functions/v1/download-resource?id=${encodeURIComponent(id)}`;

const tabs = ["Getting Started", "Templates & Downloads", "Financial Glossary"];

const guides = [
  { step: "Day 1", title: "Connecting your bank account", time: "5 minutes", content: "Connect via RBI's Account Aggregator framework. Open your bank app → Settings → Account Aggregator → Approve FynHelp consent. Supported banks: HDFC, ICICI, SBI, Axis, Kotak, Yes Bank, and 20+ more. Alternative: Upload PDF bank statements for banks not on AA." },
  { step: "Day 1", title: "Syncing Tally or your accounting software", time: "15 minutes", content: "Install the FynHelp Tally Agent (lightweight Windows service). Requirements: Tally Prime 2.0+, Windows PC, administrator access. The agent uses ODBC to sync your ledger data every 2 hours. Also supports Zoho Books and QuickBooks India via API." },
  { step: "Day 1", title: "Setting up your GSTIN and compliance calendar", time: "10 minutes", content: "Enter your 15-character GSTIN. FynHelp auto-detects your filing frequency (monthly or QRMP), composition scheme status, and turnover slab. Your specific filing deadlines are mapped and reminders set at 14, 7, 3, and 1 day before each due date." },
  { step: "Week 1", title: "Understanding your first dashboard", time: "20 minutes", content: "Your Cockpit shows 4 key metrics: Cash Position, Runway (days), ITC at Risk, and Financial Health Score (0-100). AI CFO Nidhi's morning brief appears at the top every day at 8 AM. The runway gauge uses color coding: green >90 days, amber 30-90, red <30." },
  { step: "Week 1", title: "Having your first conversation with AI CFO Nidhi", time: "10 minutes", content: "Try these opening questions: 'What is my cash position?' → Shows balance across all accounts. 'Who hasn't paid me this month?' → Lists overdue receivables ranked by amount. 'When is my next GST deadline?' → Shows date with filing prep status. 'Can I afford to hire 2 people?' → Triggers hiring simulation." },
  { step: "Week 2", title: "Running your first simulation", time: "15 minutes", content: "Go to Decision Simulator → Select 'Hiring Impact'. Enter: headcount (2), average CTC (₹8L/year), expected revenue per hire (₹2L/month). See: months to breakeven, burn rate increase, runway impact. Save and share with your CA for review." },
];

const templates = [
  { id: "gst-reconciliation", title: "GSTR-2B Reconciliation Tracker", format: "Excel", desc: "Track GSTR-2B vs purchase register. Columns: Vendor, GSTIN, Invoice, Amount, ITC, Match status.", icon: "https://wiknwxniwqvsxgyzqqxu.supabase.co/storage/v1/object/public/fynhelp-resources/icon_1_gstr2b.svg", url: "https://wiknwxniwqvsxgyzqqxu.supabase.co/storage/v1/object/public/fynhelp-resources/1_GSTR2B_Reconciliation_Tracker.xlsx" },
  { id: "cash-flow", title: "Cash Flow Projection Workbook", format: "Excel", desc: "12-month projection in ₹ Indian format with DSO/DPO impact modeling and seasonal adjustments.", icon: "https://wiknwxniwqvsxgyzqqxu.supabase.co/storage/v1/object/public/fynhelp-resources/icon_2_cashflow.svg", url: "https://wiknwxniwqvsxgyzqqxu.supabase.co/storage/v1/object/public/fynhelp-resources/2_Cash_Flow_Projection_Workbook.xlsx" },
  { id: "receivables-aging", title: "Receivables Aging Register", format: "Excel", desc: "Customer master + invoice tracker with auto-calculated 0-30, 31-60, 61-90, 90+ aging buckets.", icon: "https://wiknwxniwqvsxgyzqqxu.supabase.co/storage/v1/object/public/fynhelp-resources/icon_3_receivables.svg", url: "https://wiknwxniwqvsxgyzqqxu.supabase.co/storage/v1/object/public/fynhelp-resources/3_Receivables_Aging_Register.xlsx" },
  { id: "vendor-gst", title: "Vendor GST Compliance Checklist", format: "PDF", desc: "10-point checklist for onboarding new vendors. Includes GSTIN validation, filing history review.", icon: "https://wiknwxniwqvsxgyzqqxu.supabase.co/storage/v1/object/public/fynhelp-resources/icon_4_compliance.svg", url: "https://wiknwxniwqvsxgyzqqxu.supabase.co/storage/v1/object/public/fynhelp-resources/4_Vendor_GST_Compliance_Checklist.pdf" },
  { id: "msme-letter", title: "MSME Rights Demand Letter", format: "Word", desc: "Legally worded demand letter under Section 43B(h) with variable fields for buyer name, invoices, amounts.", icon: "https://wiknwxniwqvsxgyzqqxu.supabase.co/storage/v1/object/public/fynhelp-resources/icon_5_demand.svg", url: "https://wiknwxniwqvsxgyzqqxu.supabase.co/storage/v1/object/public/fynhelp-resources/5_MSME_Rights_Demand_Letter.docx" },
  { id: "advance-tax", title: "Advance Tax Calculation Workbook", format: "Excel", desc: "Calculates each installment (Jun/Sep/Dec/Mar) with YTD inputs and TDS offsets.", icon: "https://wiknwxniwqvsxgyzqqxu.supabase.co/storage/v1/object/public/fynhelp-resources/icon_6_tax.svg", url: "https://wiknwxniwqvsxgyzqqxu.supabase.co/storage/v1/object/public/fynhelp-resources/6_Advance_Tax_Calculation_Workbook.xlsx" },
  { id: "cfo-report", title: "Monthly CFO Report Template", format: "Word", desc: "12-page template: Executive Summary, Cash, Revenue, GST, Compliance, Risk, Next Month Outlook.", icon: "https://wiknwxniwqvsxgyzqqxu.supabase.co/storage/v1/object/public/fynhelp-resources/icon_7_cfo.svg", url: "https://wiknwxniwqvsxgyzqqxu.supabase.co/storage/v1/object/public/fynhelp-resources/7_Monthly_CFO_Report_Template.docx" },
  { id: "board-meeting", title: "Board Meeting Financial Update", format: "PPT", desc: "10-slide quarterly deck: Health Score, Runway, Revenue vs Budget, Risk Register, Outlook.", icon: "https://wiknwxniwqvsxgyzqqxu.supabase.co/storage/v1/object/public/fynhelp-resources/icon_8_board.svg", url: "https://wiknwxniwqvsxgyzqqxu.supabase.co/storage/v1/object/public/fynhelp-resources/8_Board_Meeting_Financial_Update.pptx" },
];

const videos = [
  { title: "How AI CFO Nidhi's morning brief works", dur: "4 min" },
  { title: "ITC reconciliation walkthrough", dur: "8 min" },
  { title: "Running a hiring simulation", dur: "6 min" },
  { title: "Setting up compliance calendar", dur: "5 min" },
  { title: "Understanding the 360 Dashboard", dur: "10 min" },
  { title: "WhatsApp alerts setup", dur: "3 min" },
  { title: "Connecting Tally to FynHelp", dur: "7 min" },
  { title: "Working capital marketplace", dur: "6 min" },
  { title: "CA partner dashboard setup", dur: "9 min" },
  { title: "Exporting reports for your CA", dur: "4 min" },
];

interface GlossaryTerm { term: string; definition: string; inFynHelp: string; formula?: string; related: string[] }

const glossary: GlossaryTerm[] = [
  { term: "Account Aggregator", definition: "RBI's consent-based data-sharing framework that allows financial institutions to share your data with apps you authorise — without sharing your login credentials. It's like giving a read-only view of your bank account, which you can revoke anytime.", inFynHelp: "FynHelp uses Account Aggregator (via Finvu and OneMoney) to fetch your daily transaction data and bank balance in real-time.", related: ["Bank Reconciliation", "Multi-Bank Aggregation"] },
  { term: "Advance Tax", definition: "Income tax paid in installments during the financial year itself — not as a lump sum at year-end. For businesses with tax liability above ₹10,000, advance tax is due in 4 installments: June 15 (15%), September 15 (45%), December 15 (75%), and March 15 (100%).", inFynHelp: "FynHelp computes your advance tax installments from your live P&L and alerts you 14 days before each due date.", formula: "Tax Liability = (Estimated Annual Taxable Income × Tax Rate) − TDS Already Deducted", related: ["TDS"] },
  { term: "Aging Buckets", definition: "Categories used to classify receivables or payables by how many days they've been outstanding: 0-30 days (current), 31-60 days (slightly overdue), 61-90 days (significantly overdue), and 90+ days (seriously overdue). Older buckets indicate higher risk.", inFynHelp: "AI CFO Nidhi uses aging buckets to prioritise collections and calculate default risk for each customer.", related: ["DSO", "Receivables"] },
  { term: "Audit Trail", definition: "A chronological record of all financial transactions and changes made to accounting records. Mandatory under the Companies Act 2013, an audit trail ensures that every entry can be traced back to its source document.", inFynHelp: "FynHelp maintains a complete audit trail of all imported transactions and any user modifications.", related: ["Compliance Calendar"] },
  { term: "Burn Rate", definition: "The speed at which your business spends its cash reserves, measured per month or per day. A business with ₹12L in cash spending ₹2L per month has a burn rate of ₹2L/month (₹66,667/day).", inFynHelp: "AI CFO Nidhi computes your 30-day rolling average daily burn from your bank transactions, excluding loan repayments and inter-account transfers.", formula: "Daily Burn Rate = Total Debits (last 30 days) ÷ 30", related: ["Runway", "Working Capital"] },
  { term: "CBIC", definition: "Central Board of Indirect Taxes and Customs — the governing body for GST in India. CBIC issues circulars, notifications, and policy changes that affect how businesses file returns and claim ITC.", inFynHelp: "FynHelp's GSTN Notification Tracker filters CBIC circulars to show only what's relevant to your business.", related: ["GST", "GSTR-1", "GSTR-3B"] },
  { term: "CGTMSE", definition: "Credit Guarantee Fund Trust for Micro and Small Enterprises. A government scheme that provides collateral-free loans up to ₹5 Crore to MSMEs. The guarantee covers 75-85% of the loan amount.", inFynHelp: "FynHelp's Loan Eligibility Scorer checks your CGTMSE eligibility and estimates the guarantee coverage.", related: ["MSME Registration", "Working Capital"] },
  { term: "Compliance Calendar", definition: "A schedule of all regulatory filing deadlines that a business must meet — GST returns, TDS, PF, ESIC, ROC filings, advance tax, and more. Missing deadlines results in penalties and interest.", inFynHelp: "FynHelp maintains your personalised compliance calendar and sends alerts at 14, 7, 3, and 1 day before each deadline.", related: ["GSTR-1", "GSTR-3B", "Advance Tax"] },
  { term: "Days Sales Outstanding (DSO)", definition: "The average number of days it takes to collect payment after a sale. If your DSO is 42, it means on average, customers take 42 days to pay you. The Indian SME average is 42 days; manufacturing can be 60+.", inFynHelp: "AI CFO Nidhi tracks your DSO weekly and compares it against your industry benchmark, showing the cash impact of improvement.", formula: "DSO = (Accounts Receivable ÷ Total Credit Sales) × Number of Days", related: ["DPO", "Working Capital Cycle"] },
  { term: "Days Payable Outstanding (DPO)", definition: "The average number of days it takes you to pay your suppliers. A higher DPO means you're holding cash longer, but too high may damage vendor relationships.", inFynHelp: "FynHelp tracks your DPO and recommends optimal payment timing to balance cash preservation with vendor relationships.", formula: "DPO = (Accounts Payable ÷ Cost of Goods Sold) × Number of Days", related: ["DSO", "Working Capital Cycle", "DIO"] },
  { term: "Default Prediction", definition: "Using statistical models to predict the likelihood that a customer will fail to pay an invoice before the default actually occurs. Factors include payment history, order frequency trends, and the customer's own GST compliance.", inFynHelp: "AI CFO Nidhi scores every customer 0-100 on default risk and flags rising scores 45-60 days before invoices come due.", related: ["Customer Risk Score", "Aging Buckets"] },
  { term: "E-Invoice", definition: "Electronic invoicing mandated by GSTN for businesses above the applicable turnover threshold. Each invoice gets a unique IRN (Invoice Reference Number) from the government portal, making it part of the digital tax ecosystem.", inFynHelp: "FynHelp's E-Invoice Manager tracks IRN generation and e-way bill compliance for all outgoing invoices.", related: ["GSTR-1", "ITC"] },
  { term: "ESIC", definition: "Employee State Insurance Corporation. A social security scheme for employees earning up to ₹21,000/month. Employer contributes 3.25% and employee 0.75% of gross wages.", inFynHelp: "FynHelp calculates ESIC obligations from payroll data and tracks filing deadlines.", formula: "Employer ESIC = Gross Wages × 3.25%. Employee ESIC = Gross Wages × 0.75%", related: ["PF", "Payroll"] },
  { term: "FEMA", definition: "Foreign Exchange Management Act — governs all foreign exchange transactions in India. Relevant for businesses receiving or making international payments, holding foreign currency accounts, or having overseas investments.", inFynHelp: "FynHelp's Governance suite tracks FEMA compliance obligations for businesses with foreign transactions.", related: ["ROC", "Compliance Calendar"] },
  { term: "Financial Health Score", definition: "A composite score (0-100) that measures the overall financial wellbeing of a business across four dimensions: liquidity, profitability, cash stability, and compliance. Higher is healthier.", inFynHelp: "AI CFO Nidhi computes your score daily using live data and opens every morning brief with the score and the dimension that changed most.", formula: "Score = (Liquidity × 0.30) + (Profitability × 0.25) + (Cash Stability × 0.25) + (Compliance × 0.20)", related: ["Burn Rate", "Runway", "DSO"] },
  { term: "GSTR-1", definition: "Monthly or quarterly return filed by businesses to report their outward supplies (sales). Due on the 11th of the following month (monthly filers). This data is used by your customers to claim ITC.", inFynHelp: "FynHelp tracks your GSTR-1 filing status and alerts if filing is delayed, as it affects your customers' ITC.", related: ["GSTR-3B", "GSTR-2B", "ITC"] },
  { term: "GSTR-2B", definition: "Auto-generated statement available on the 14th of each month showing ITC available to you based on your suppliers' GSTR-1 filings. This is the basis for ITC reconciliation.", inFynHelp: "On the 14th, AI CFO Nidhi auto-reconciles your purchase register against GSTR-2B and flags all mismatches.", related: ["GSTR-1", "ITC", "ITC Reconciliation"] },
  { term: "GSTR-3B", definition: "Monthly summary return filed by businesses to declare their tax liability and claim ITC. Due on the 20th of the following month. This is where you actually pay GST.", inFynHelp: "FynHelp prepares your GSTR-3B draft from reconciled data and alerts before the due date.", related: ["GSTR-1", "GSTR-2B", "ITC"] },
  { term: "GSP (GST Suvidha Provider)", definition: "A government-authorised technology provider with direct API access to GSTN infrastructure. GSPs can file returns, fetch data, and perform operations on behalf of taxpayers.", inFynHelp: "FynHelp is a certified GSP, giving us direct API access to GSTN for real-time data.", related: ["GSTR-1", "GSTR-2B", "ITC Reconciliation"] },
  { term: "ITC (Input Tax Credit)", definition: "The GST you've paid on your purchases that you can offset against the GST you owe on your sales. If you sell goods worth ₹1L (GST ₹18K) and buy inputs worth ₹60K (GST ₹10.8K), you pay only ₹7.2K to the government.", inFynHelp: "FynHelp monitors your total ITC, at-risk ITC (from non-compliant vendors), and safe ITC in real-time.", formula: "Net GST Payable = Output Tax (on sales) − Input Tax Credit (on purchases)", related: ["ITC Reconciliation", "GSTR-2B", "Vendor GST Health"] },
  { term: "ITC Reconciliation", definition: "The process of matching your purchase invoices against your GSTR-2B to ensure every ITC you're claiming is also reflected in your supplier's filings. Mismatches mean the government may deny your ITC claim.", inFynHelp: "FynHelp runs auto-reconciliation on the 14th of each month and generates a vendor chase list for mismatches.", related: ["ITC", "GSTR-2B", "Vendor GST Health"] },
  { term: "MSME Registration (Udyam)", definition: "Free online registration under the MSME Development Act via the Udyam portal. Unlocks benefits: collateral-free loans, delayed payment protection under Section 43B(h), government tender preference, lower interest rates.", inFynHelp: "FynHelp checks your Udyam registration and enforces your MSME rights for overdue payments.", related: ["Section 43B(h)", "CGTMSE"] },
  { term: "Notice Risk Score", definition: "A predictive score (0-100) estimating the probability that a business will receive a GST scrutiny notice. Factors: filing regularity, ITC mismatch rate, turnover consistency, late filing frequency, e-invoice compliance.", inFynHelp: "AI CFO Nidhi computes this monthly using 6 weighted factors and tells you exactly what to fix to reduce risk.", formula: "Score = Σ(factor_weight × factor_score) across 6 factors", related: ["ITC Reconciliation", "GSTR-3B"] },
  { term: "PF (Provident Fund)", definition: "Employee Provident Fund — mandatory retirement savings where both employer and employee contribute 12% of basic salary. Applies to establishments with 20+ employees.", inFynHelp: "FynHelp calculates monthly PF obligations from payroll data and sends filing reminders.", formula: "PF Contribution = Basic Salary × 12% (employee) + 12% (employer)", related: ["ESIC", "Payroll"] },
  { term: "Revenue Concentration Risk", definition: "The danger of relying too heavily on a small number of customers. If your top customer represents 40% of revenue and stops buying, your business faces a severe cash crisis.", inFynHelp: "FynHelp alerts when any customer exceeds 20% of revenue or top 3 exceed 50%.", related: ["Default Prediction", "DSO"] },
  { term: "ROC (Registrar of Companies)", definition: "The government authority that maintains records of companies registered in India. Companies must file annual returns, financial statements, and director information with ROC under the Companies Act.", inFynHelp: "FynHelp's Governance suite tracks all ROC filing deadlines including annual returns, director KYC, and charge modifications.", related: ["Compliance Calendar", "FEMA"] },
  { term: "Runway", definition: "The number of days your business can continue operating at its current burn rate before running out of cash. Runway = Current Cash Balance ÷ Daily Burn Rate.", inFynHelp: "Runway is the first metric in every FynHelp view. Color-coded: green >90 days, amber 30-90, red <30.", formula: "Runway (days) = Cash Balance ÷ Average Daily Burn Rate", related: ["Burn Rate", "Financial Health Score"] },
  { term: "Section 43B(h)", definition: "Amendment to the Income Tax Act (effective April 2024) that disallows expense deductions for large companies if they don't pay MSME suppliers within 45 days of acceptance. Gives MSMEs legal leverage to demand timely payment.", inFynHelp: "FynHelp identifies eligible invoices and generates ready-to-send demand letters with one tap.", related: ["MSME Registration", "Revenue Concentration Risk"] },
  { term: "TDS (Tax Deducted at Source)", definition: "Tax that the payer deducts before making a payment to you. For example, if a company pays you ₹1L for services, they may deduct 10% TDS (₹10K) and pay you ₹90K. The ₹10K is paid to the government on your behalf.", inFynHelp: "FynHelp tracks TDS deducted on your payments and offsets it against your advance tax liability.", related: ["Advance Tax", "Compliance Calendar"] },
  { term: "Working Capital", definition: "The money available for day-to-day operations, calculated as Current Assets minus Current Liabilities. Positive working capital means you can pay your immediate obligations; negative means you're borrowing from tomorrow.", inFynHelp: "FynHelp computes your working capital daily and tracks the Working Capital Cycle (DSO + DIO − DPO).", formula: "Working Capital = Current Assets − Current Liabilities. WC Cycle = DSO + DIO − DPO", related: ["DSO", "DPO", "DIO", "Runway"] },
];

const [videoModal, setVideoModal] = [null as string | null, (_: string | null) => {}]; // placeholder

const ResourcesPage = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [videoModalOpen, setVideoModalOpen] = useState<string | null>(null);
  const [glossarySearch, setGlossarySearch] = useState("");
  const [expandedGuide, setExpandedGuide] = useState<number | null>(null);

  const filteredGlossary = glossarySearch.trim()
    ? glossary.filter((g) => g.term.toLowerCase().includes(glossarySearch.toLowerCase()) || g.definition.toLowerCase().includes(glossarySearch.toLowerCase()))
    : glossary;

  const letters = [...new Set(glossary.map((g) => g.term[0].toUpperCase()))].sort();

  return (
    <Layout>
      <section className="bg-fyn-ink py-16">
        <div className="fyn-container text-center font-sans">
          <h1 className="text-3xl leading-tight text-white mb-4 font-serif md:text-7xl font-bold">FynHelp Resource Centre</h1>
          <p className="text-white/60 text-lg">Everything you need to get maximum value from your AI CFO.</p>
        </div>
      </section>

      {/* Tabs */}
      <div className="bg-fyn-beige-dark border-b border-fyn-ink-10 sticky top-[72px] z-20">
        <div className="fyn-container flex gap-0">
          {tabs.map((t, i) => (
            <button
              key={t}
              onClick={() => setActiveTab(i)}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === i
                  ? "border-fyn-red text-fyn-ink"
                  : "border-transparent text-fyn-ink/50 hover:text-fyn-ink/80"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <section className="bg-fyn-beige fyn-section">
        <div className="fyn-container">

          {/* Tab 0: Getting Started */}
          {activeTab === 0 && (
            <>
              <h2 className="text-3xl text-fyn-ink mb-8">Getting Started</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                {guides.map((c, i) => (
                  <div key={c.title} className="bg-fyn-beige-card border border-fyn-ink-10 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                    <button
                      className="w-full text-left p-6"
                      onClick={() => setExpandedGuide(expandedGuide === i ? null : i)}
                      aria-expanded={expandedGuide === i}
                    >
                      <span className="fyn-label text-fyn-red text-[11px] block mb-2">{c.step}</span>
                      <h3 className="text-fyn-ink font-serif text-lg mb-2">{c.title}</h3>
                      <p className="text-fyn-ink/40 text-sm">Estimated time: {c.time}</p>
                    </button>
                    <div style={{
                      maxHeight: expandedGuide === i ? 300 : 0,
                      overflow: "hidden",
                      transition: "max-height 300ms cubic-bezier(0.25, 0.1, 0.25, 1)",
                    }}>
                      <p className="px-6 pb-6 text-fyn-ink/70 text-sm leading-relaxed">{c.content}</p>
                    </div>
                  </div>
                ))}
              </div>

              <h2 className="text-3xl text-fyn-ink mb-8">Video Tutorials</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {videos.map((v) => (
                  <button
                    key={v.title}
                    onClick={() => setVideoModalOpen(v.title)}
                    className="bg-fyn-ink rounded-lg p-4 text-left cursor-pointer group"
                    style={{ transition: "all 250ms cubic-bezier(0.25, 0.1, 0.25, 1)" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = "scale(1.03)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 32px rgba(26,16,8,0.25)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = "scale(1)"; (e.currentTarget as HTMLElement).style.boxShadow = ""; }}
                    aria-label={`Watch: ${v.title}`}
                  >
                    <div className="bg-white/5 rounded-lg h-20 flex items-center justify-center mb-3 relative">
                      <div className="w-10 h-10 rounded-full bg-fyn-red flex items-center justify-center group-hover:scale-110 transition-transform">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 1.5l9 5.5-9 5.5z" fill="white"/></svg>
                      </div>
                    </div>
                    <p className="text-white text-sm font-medium">{v.title}</p>
                    <p className="text-white/40 text-xs">{v.dur}</p>
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Tab 1: Templates */}
          {activeTab === 1 && (
            <>
              <h2 className="text-3xl text-fyn-ink mb-8">Templates & Downloads</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {templates.map((t) => (
                  <div key={t.id} className="bg-fyn-beige-card border border-fyn-ink-10 rounded-lg p-5 hover:shadow-md transition-shadow">
                    {/* Template icon */}
                    <div className="bg-fyn-beige-dark rounded-lg h-24 flex items-center justify-center mb-4">
                      <img
                        src={t.icon}
                        alt={`${t.title} icon`}
                        className="w-16 h-16"
                        loading="lazy"
                      />
                    </div>
                    <h3 className="text-fyn-ink font-semibold text-sm mb-2">{t.title}</h3>
                    <p className="text-fyn-ink/60 text-xs leading-relaxed mb-4">{t.desc}</p>
                    <a
                      href={downloadHref(t.id)}
                      download
                      rel="noopener noreferrer"
                      className="block w-full py-2 rounded-lg bg-fyn-ink text-white text-sm font-medium hover:opacity-90 transition-opacity text-center"
                    >
                      Download {t.format}
                    </a>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Tab 2: Glossary */}
          {activeTab === 2 && (
            <>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl text-fyn-ink">Financial Glossary</h2>
                <input
                  type="search"
                  placeholder="Search terms..."
                  value={glossarySearch}
                  onChange={(e) => setGlossarySearch(e.target.value)}
                  className="text-sm px-4 py-2 rounded-lg border border-fyn-ink-10 bg-fyn-beige-card text-fyn-ink placeholder:text-fyn-ink/40 focus:outline-none focus:border-fyn-red"
                  style={{ width: 220 }}
                  aria-label="Search glossary"
                />
              </div>

              {/* A-Z index */}
              <div className="flex flex-wrap gap-1 mb-8">
                {letters.map((l) => (
                  <a
                    key={l}
                    href={`#glossary-${l}`}
                    className="w-8 h-8 flex items-center justify-center rounded text-sm font-medium text-fyn-ink/60 hover:bg-fyn-ink hover:text-white transition-colors"
                  >
                    {l}
                  </a>
                ))}
              </div>

              <div className="space-y-6">
                {filteredGlossary.map((g) => (
                  <div key={g.term} id={`glossary-${g.term[0].toUpperCase()}`} className="bg-fyn-beige-card border border-fyn-ink-10 rounded-lg p-6">
                    <h4 className="font-serif text-xl text-fyn-ink mb-2">{g.term}</h4>
                    <p className="text-fyn-ink/80 text-sm leading-relaxed mb-3">{g.definition}</p>
                    <div className="mb-3">
                      <span className="fyn-caption text-fyn-gold text-[10px]">In FynHelp:</span>
                      <p className="text-fyn-ink/70 text-sm mt-1">{g.inFynHelp}</p>
                    </div>
                    {g.formula && (
                      <div className="mb-3">
                        <span className="fyn-caption text-fyn-gold text-[10px]">Formula:</span>
                        <p className="fyn-mono text-fyn-ink/70 mt-1 bg-fyn-beige-dark rounded px-3 py-2">{g.formula}</p>
                      </div>
                    )}
                    <div className="flex flex-wrap gap-1.5">
                      {g.related.map((r) => (
                        <a key={r} href={`#glossary-${r[0].toUpperCase()}`}
                          className="text-[11px] px-2 py-1 rounded border border-fyn-ink-10 text-fyn-ink/50 hover:border-fyn-red hover:text-fyn-red transition-colors">
                          {r}
                        </a>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Video Modal */}
      {videoModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(26,16,8,0.85)", backdropFilter: "blur(8px)" }}
          onClick={() => setVideoModalOpen(null)}
        >
          <div
            className="bg-fyn-ink rounded-xl max-w-[800px] w-full mx-4 overflow-hidden"
            style={{ animation: "scale-in 250ms cubic-bezier(0.34, 1.56, 0.64, 1)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h3 className="font-serif text-xl text-white">{videoModalOpen}</h3>
              <button onClick={() => setVideoModalOpen(null)} className="text-white/40 hover:text-white text-xl" aria-label="Close">×</button>
            </div>
            <div className="aspect-video bg-black flex items-center justify-center">
              <div className="text-center p-8">
                <svg width="64" height="64" viewBox="0 0 64 64" fill="none" className="mx-auto mb-4">
                  <circle cx="32" cy="32" r="28" stroke="hsl(38 74% 31%)" strokeWidth="2" />
                  <path d="M26 20l18 12-18 12z" stroke="hsl(38 74% 31%)" strokeWidth="2" fill="none" />
                </svg>
                <p className="text-white/70 text-sm mb-1">This tutorial is being recorded.</p>
                <p className="text-white/40 text-xs mb-4">Estimated availability: May 2026</p>
                <p className="text-fyn-gold text-sm">In the meantime, check our written guides in the Getting Started tab.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default ResourcesPage;
