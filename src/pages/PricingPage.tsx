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
];

const PricingPage = () => (
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
        {/* Same pricing grid as homepage - abbreviated */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {[
            { name: "Starter", price: "₹1,999", annual: "₹19,999/year", desc: "Up to ₹5 Cr turnover", featured: false },
            { name: "Growth", price: "₹4,999", annual: "₹49,999/year", desc: "₹5–50 Cr turnover", featured: true },
            { name: "Pro", price: "₹12,999", annual: "₹1,29,999/year", desc: "₹50–200 Cr turnover", featured: false },
            { name: "Enterprise", price: "Custom", annual: "", desc: "Groups, CA firms, banks", featured: false },
          ].map((p) => (
            <div key={p.name} className={`rounded-lg p-6 ${p.featured ? "bg-fyn-ink ring-2 ring-fyn-red text-white relative" : "bg-fyn-beige-dark border border-fyn-ink-10"}`}>
              {p.featured && <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-fyn-red text-white text-xs px-3 py-0.5 rounded-full fyn-label">MOST POPULAR</span>}
              <h3 className="font-serif text-xl mb-1">{p.name}</h3>
              <p className="text-fyn-red fyn-metric text-2xl font-bold">{p.price}{p.price !== "Custom" && <span className="text-sm font-normal opacity-50">/month</span>}</p>
              {p.annual && <p className="opacity-50 text-xs mb-3">{p.annual} — save 17%</p>}
              <p className="opacity-60 text-sm mb-6">{p.desc}</p>
              <Link to="/signup" className={`block text-center py-3 rounded-lg font-medium ${p.name === "Enterprise" ? "border-[1.5px] border-current" : "bg-fyn-red text-white hover:opacity-90"}`}>
                {p.name === "Enterprise" ? "Talk to Sales" : "Start Free Trial"}
              </Link>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl text-fyn-ink mb-8 text-center">Frequently asked questions</h2>
          <div className="space-y-6">
            {faqs.map((f) => (
              <div key={f.q} className="bg-fyn-beige-dark border border-fyn-ink-10 rounded-lg p-6">
                <h3 className="text-fyn-ink font-serif text-lg mb-2">{f.q}</h3>
                <p className="text-fyn-ink/70 text-sm leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  </Layout>
);

export default PricingPage;
