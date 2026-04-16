import { useState, useMemo } from "react";
import Layout from "@/components/Layout";
import { Link } from "react-router-dom";

const faqs = [
  { q: "Is my financial data safe with FynHelp?", a: "Yes. We are ISO 27001 compliant (in progress). All data is encrypted at rest with AES-256 and in transit with TLS 1.3. We store your data on AWS Mumbai servers (ap-south-1) for Indian data residency. We never share your data with third parties without your explicit consent." },
  { q: "Does FynHelp replace my CA?", a: "No — and we never will. Nidhi organises your data, catches mismatches, prepares your filing drafts, and flags risks — so when your CA sits down, they spend 10 minutes reviewing instead of 3 hours computing." },
  { q: "How does the 15-day free trial work?", a: "Sign up, connect your bank (2 minutes via Account Aggregator) and tell us your GSTIN. Nidhi starts working immediately. No credit card required. After 15 days, choose the plan that fits." },
  { q: "Which Indian banks are supported?", a: "Via RBI's Account Aggregator: HDFC, ICICI, SBI, Axis, Kotak, Yes Bank, IndusInd, PNB, BOB, Canara, Union Bank, UCO, and 20+ more. For banks not yet on AA, upload PDF bank statements." },
  { q: "Does FynHelp work with Tally?", a: "Yes. FynHelp has a dedicated Tally Prime connector — it installs a lightweight agent and syncs your ledger data every 2 hours. Works with Tally 9, Tally ERP 9, and Tally Prime." },
  { q: "In which languages does Nidhi speak?", a: "English and Hindi (all plans), Gujarati and Tamil (Growth+), and Marathi (Pro+). More languages are on our roadmap." },
  { q: "Can multiple people access FynHelp?", a: "Yes. Invite your CA (read-only, free), your accountant (read + data entry), and team members with module-specific access. User management on Growth and above." },
  { q: "What happens to my data if I cancel?", a: "Export all your data in Excel and JSON formats before cancelling. After cancellation, data is retained for 90 days, then permanently deleted." },
  { q: "What happens to my data if there's a billing dispute?", a: "Your data and your account are never held hostage over billing disputes. If there is a billing dispute, your account remains fully active while the dispute is resolved. In the event of cancellation for any reason, you will always have 30 days to export all your data in full before anything is deleted." },
  { q: "Does FynHelp provide any guarantees on Nidhi's accuracy?", a: "Yes. FynHelp publishes a monthly accuracy report measuring Nidhi against a golden dataset of known-answer questions. Our accuracy target is 95%+. Every Nidhi response includes a data provenance note showing which data sources were used and when they were last updated. We believe in radical transparency about what our AI knows and when it learned it." },
];

const planFeatures: Record<string, { included: string[]; excluded?: string[]; prefix?: string }> = {
  Starter: {
    included: [
      "Liquidity Intelligence — all 6 modules (cash, runway, burn, alerts)",
      "Cash flow projection — 30-day forecast with AA bank data",
      "GST filing calendar — your specific deadlines, 14/7/3/0-day alerts",
      "Basic ITC monitoring — up to 100 invoices per month",
      "Nidhi morning brief — daily 8AM brief in English",
      "1 bank account via Account Aggregator",
      "Bank statement PDF parser — all Indian bank formats",
      "WhatsApp alerts for critical cash thresholds",
      "1 user account",
      "Email support — response within 8 hours",
    ],
    excluded: [
      "Full ITC reconciliation engine",
      "Revenue intelligence & collections",
      "HR & workforce intelligence",
      "Decision Simulator",
    ],
  },
  Growth: {
    prefix: "Everything in Starter, plus:",
    included: [
      "Revenue Intelligence — all 8 modules (receivables AI, default prediction, customer risk scoring, collections automation)",
      "Full ITC reconciliation — unlimited invoices, auto-runs on 14th",
      "GST notice risk scorer — 0-100 score with fix recommendations",
      "Vendor GST health monitoring — score all your suppliers",
      "HR & Workforce Intelligence — all 10 modules",
      "Decision Simulator — credit terms, hiring, pricing, GST delay scenarios",
      "Nidhi in Hindi + Gujarati (in addition to English)",
      "WhatsApp daily brief + all alert categories",
      "Account Aggregator — up to 5 bank accounts",
      "Tally Prime ODBC + Zoho Books + QuickBooks India",
      "Working capital marketplace access (invoice discounting)",
      "Monthly automated CFO report (PDF, shareable with CA)",
      "3 user accounts (owner + accountant + CA read-only)",
      "Priority support — response within 2 hours",
    ],
  },
  Pro: {
    prefix: "Everything in Growth, plus:",
    included: [
      "Governance Intelligence — all 10 modules (ROC/MCA, FEMA, audit readiness, MSME rights, board governance)",
      "Decision Simulator — all 8 scenarios including M&A and capex",
      "Market & Growth Intelligence — industry benchmarking, credit rating simulator, export opportunity scoring",
      "Banking & Fintech Intelligence — multi-bank aggregation, loan eligibility scoring",
      "Nidhi in all 5 languages: English, Hindi, Gujarati, Tamil, Marathi",
      "Unlimited bank accounts",
      "All payroll software integrations (Keka, GreytHR, Razorpay Payroll)",
      "CA white-label workspace (your CA manages your account)",
      "Advance tax calculator with live P&L integration",
      "Custom report templates (board pack, investor brief)",
      "10 user accounts + granular role-based access",
      "Dedicated relationship manager (named contact, direct WhatsApp)",
      "SLA: 99.5% uptime guarantee with monthly credit if breached",
    ],
  },
  Enterprise: {
    prefix: "Everything in Pro, deployed for your organisation:",
    included: [
      "Bank/NBFC API white-label deployment",
      "Custom intelligence modules for your vertical",
      "Unlimited users + API access for integration",
      "On-site implementation support (Bengaluru + 4 major cities)",
      "Custom SLA agreements",
      "ISO 27001 + SOC 2 compliance documentation (in progress)",
      "Dedicated engineering team for custom integrations",
    ],
  },
};

const formatINR = (n: number) => {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)} Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  return `₹${n.toLocaleString("en-IN")}`;
};

const PricingPage = () => {
  const [calcOpen, setCalcOpen] = useState(false);
  const [turnover, setTurnover] = useState(10); // in Cr
  const [hours, setHours] = useState(8);
  const [itcLoss, setItcLoss] = useState(3); // in L
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const roi = useMemo(() => {
    const hourlyRate = (turnover * 10000000) / 2000 / 52 / 40; // rough effective rate
    const timeSaved = hours * 0.6 * 52 * Math.max(hourlyRate, 500);
    const itcRecovery = itcLoss * 100000 * 0.74;
    const crisisPrevention = turnover * 10000000 * 0.015;
    const total = timeSaved + itcRecovery + crisisPrevention;
    const recommendedPlan = turnover <= 5 ? "Starter" : turnover <= 50 ? "Growth" : "Pro";
    return { timeSaved, itcRecovery, crisisPrevention, total, recommendedPlan };
  }, [turnover, hours, itcLoss]);

  const plans = [
    { name: "Starter", price: "₹1,999", annual: "₹19,999/year", desc: "Up to ₹5 Cr turnover", featured: false },
    { name: "Growth", price: "₹4,999", annual: "₹49,999/year", desc: "₹5–50 Cr turnover", featured: true },
    { name: "Pro", price: "₹12,999", annual: "₹1,29,999/year", desc: "₹50–200 Cr turnover", featured: false },
    { name: "Enterprise", price: "Custom", annual: "", desc: "Groups, CA firms, banks", featured: false },
  ];

  return (
    <Layout>
      <section className="bg-fyn-ink py-16">
        <div className="fyn-container text-center">
          <span className="fyn-label text-fyn-gold text-[13px] block mb-4">TRANSPARENT PRICING</span>
          <h1 className="text-3xl md:text-[48px] leading-tight text-white mb-4">Simple, fair pricing for every Indian SME.</h1>
          <p className="text-white/60 text-lg">The cost of a real CFO: ₹30–50L/year. The cost of Nidhi: from ₹1,999/month.</p>
        </div>
      </section>

      <section className="bg-fyn-beige fyn-section">
        <div className="fyn-container">
          {/* ROI Calculator */}
          <div className="bg-fyn-beige-card border border-fyn-ink-10 rounded-lg mb-12 overflow-hidden">
            <button
              onClick={() => setCalcOpen(!calcOpen)}
              className="w-full flex items-center justify-between p-6 text-left"
              aria-expanded={calcOpen}
            >
              <div>
                <h3 className="font-serif text-xl text-fyn-ink">Calculate your ROI before you buy</h3>
                <p className="text-fyn-ink/60 text-sm mt-1">See how much FynHelp saves based on your business</p>
              </div>
              <svg
                width="20" height="20" viewBox="0 0 20 20" fill="none"
                style={{ transform: calcOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 300ms" }}
              >
                <path d="M5 8l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>

            <div
              style={{
                maxHeight: calcOpen ? 600 : 0,
                overflow: "hidden",
                transition: "max-height 400ms cubic-bezier(0.25, 0.1, 0.25, 1)",
              }}
            >
              <div className="px-6 pb-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="fyn-label text-fyn-ink/60 text-[11px] block mb-2">Annual turnover: ₹{turnover} Cr</label>
                    <input type="range" min={1} max={200} value={turnover} onChange={(e) => setTurnover(+e.target.value)}
                      className="w-full accent-fyn-red" aria-label="Annual turnover" />
                    <div className="flex justify-between text-[10px] text-fyn-ink/40"><span>₹1 Cr</span><span>₹200 Cr</span></div>
                  </div>
                  <div>
                    <label className="fyn-label text-fyn-ink/60 text-[11px] block mb-2">Hours/week on financial management: {hours}</label>
                    <input type="range" min={2} max={20} value={hours} onChange={(e) => setHours(+e.target.value)}
                      className="w-full accent-fyn-red" aria-label="Hours per week" />
                    <div className="flex justify-between text-[10px] text-fyn-ink/40"><span>2h</span><span>20h</span></div>
                  </div>
                  <div>
                    <label className="fyn-label text-fyn-ink/60 text-[11px] block mb-2">Estimated unrecovered ITC/year: ₹{itcLoss}L</label>
                    <input type="range" min={0} max={20} value={itcLoss} onChange={(e) => setItcLoss(+e.target.value)}
                      className="w-full accent-fyn-red" aria-label="Unrecovered ITC" />
                    <div className="flex justify-between text-[10px] text-fyn-ink/40"><span>₹0</span><span>₹20L</span></div>
                  </div>
                </div>

                <div className="bg-fyn-beige-dark rounded-lg p-6">
                  <p className="text-fyn-ink/60 text-sm mb-2">Based on your inputs, FynHelp saves approximately:</p>
                  <p className="font-serif text-fyn-red" style={{ fontSize: 48, fontWeight: 700, lineHeight: 1.1 }}>
                    {formatINR(roi.total)}
                  </p>
                  <p className="text-fyn-ink/40 text-xs mb-4">per year</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm"><span className="text-fyn-ink/60">Time saved</span><span className="fyn-metric text-fyn-ink">{formatINR(roi.timeSaved)}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-fyn-ink/60">ITC recovery</span><span className="fyn-metric text-fyn-ink">{formatINR(roi.itcRecovery)}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-fyn-ink/60">Crisis prevention</span><span className="fyn-metric text-fyn-ink">{formatINR(roi.crisisPrevention)}</span></div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-fyn-ink-10">
                    <p className="text-sm text-fyn-ink/60">Recommended plan:
                      <span className="ml-2 bg-fyn-red text-white text-xs px-3 py-1 rounded-full font-medium">{roi.recommendedPlan}</span>
                    </p>
                    <Link to="/signup" className="mt-3 inline-block bg-fyn-red text-white text-sm font-semibold px-6 py-2.5 rounded-lg hover-btn-primary">
                      Start your {roi.recommendedPlan} trial →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {plans.map((p) => {
              const features = planFeatures[p.name];
              const isDark = p.featured;
              return (
                <div key={p.name} className={`rounded-lg p-6 flex-col flex items-start justify-start text-left ${isDark ? "bg-fyn-ink ring-2 ring-fyn-red text-white relative" : "bg-fyn-beige-dark border border-fyn-ink-10"}`}>
                  {p.featured && <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-fyn-red text-white text-xs px-3 py-0.5 rounded-full fyn-label">MOST POPULAR</span>}
                  <h3 className="font-serif text-xl mb-1">{p.name}</h3>
                  <p className="fyn-metric text-2xl font-bold text-primary">{p.price}{p.price !== "Custom" && <span className="text-sm text-primary font-bold font-sans opacity-100">/month</span>}</p>
                  {p.annual && <p className="opacity-50 text-xs mb-3">{p.annual} — save 17%</p>}
                  <p className="opacity-60 text-sm mb-4">{p.desc}</p>
                  {p.name === "Enterprise" && <p className="opacity-40 text-xs mb-4">Starting from ₹2,50,000/month for CA firms managing 50+ clients</p>}
                  <Link to="/signup" className={`block text-center py-3 font-medium mb-4 ${p.name === "Enterprise" ? "border-[1.5px] border-current rounded-none px-[10px]" : "bg-fyn-red text-white hover:opacity-90 rounded-lg"}`}>
                    {p.name === "Enterprise" ? "Talk to Sales" : "Start Free Trial"}
                  </Link>

                  {/* Feature list */}
                  <div className="py-[12px]" style={{ borderTop: isDark ? "1px solid rgba(255,255,255,0.10)" : "1px solid rgba(26,16,8,0.10)", paddingTop: 16, marginTop: "auto" }}>
                    {features.prefix && (
                      <p className="fyn-caption text-fyn-gold mb-3 font-sans font-bold text-sm">{features.prefix}</p>
                    )}
                    {!features.prefix && (
                      <p className="fyn-caption text-fyn-gold mb-3 text-sm font-sans">What's included</p>
                    )}
                    <ul className="space-y-2">
                      {features.included.map((f) => (
                        <li key={f} className="flex gap-2 items-start text-accent opacity-100 text-base font-sans font-extrabold" style={{ minHeight: 16 }}>
                          <span className="text-fyn-success text-sm flex-shrink-0 mt-0.5">✓</span>
                          <span className={`text-[13px] leading-snug ${isDark ? "font-medium opacity-100 text-primary" : "text-fyn-ink/80"}`}>{f}</span>
                        </li>
                      ))}
                    </ul>
                    {features.excluded && (
                      <ul className="space-y-2 mt-3 pt-3" style={{ borderTop: isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(26,16,8,0.06)" }}>
                        {features.excluded.map((f) => (
                          <li key={f} className="flex gap-2 items-start text-accent opacity-100 text-base font-sans font-extrabold" style={{ minHeight: 16 }}>
                            <span className={`text-sm flex-shrink-0 mt-0.5 ${isDark ? "text-white/30" : "text-fyn-ink/30"}`}>×</span>
                            <span className={`text-[13px] leading-snug ${isDark ? "font-medium opacity-100 text-primary" : "text-fyn-ink/30"}`}>{f}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* FAQ */}
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl text-fyn-ink mb-8 text-center">Frequently asked questions</h2>
            <div className="space-y-3">
              {faqs.map((f, i) => (
                <div key={f.q} className="bg-fyn-beige-dark border border-fyn-ink-10 rounded-lg overflow-hidden">
                  <button
                    className="w-full text-left p-6 flex items-center justify-between"
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    aria-expanded={openFaq === i}
                  >
                    <h3 className="text-fyn-ink font-serif text-lg pr-4">{f.q}</h3>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"
                      style={{ transform: openFaq === i ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 300ms", flexShrink: 0 }}>
                      <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </button>
                  <div style={{
                    maxHeight: openFaq === i ? 300 : 0,
                    overflow: "hidden",
                    transition: "max-height 300ms cubic-bezier(0.25, 0.1, 0.25, 1)",
                  }}>
                    <p className="text-fyn-ink/70 text-sm leading-relaxed px-6 pb-6">{f.a}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default PricingPage;
