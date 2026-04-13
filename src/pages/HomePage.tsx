import { Link } from "react-router-dom";

const suites = [
  { name: "Liquidity Intelligence", desc: "Cash position, runway, burn rate, and working capital — in real time.", modules: 6, color: "bg-fyn-red" },
  { name: "Revenue Intelligence", desc: "Receivables AI, default prediction, customer risk scoring, collections.", modules: 8, color: "bg-blue-600" },
  { name: "Cost Intelligence", desc: "Spend control, vendor signals, payables optimization, capex decisions.", modules: 6, color: "bg-fyn-success" },
  { name: "GST & Tax Intelligence", desc: "ITC reconciliation, notice risk scoring, advance tax, vendor compliance.", modules: 10, color: "bg-amber-600" },
  { name: "Governance Intelligence", desc: "All regulatory obligations, ROC filing, MSME rights, audit readiness.", modules: 10, color: "bg-purple-600" },
  { name: "HR & Workforce Intelligence", desc: "Hiring forecast, payroll planning, attrition risk, labour compliance.", modules: 10, color: "bg-teal-600" },
  { name: "Decision Simulator Suite", desc: "What-if modeling for credit terms, hiring, pricing, loans, capex.", modules: 8, color: "bg-fyn-red" },
  { name: "Market & Growth Intelligence", desc: "Industry benchmarking, credit rating, export opportunities, fundraise readiness.", modules: 6, color: "bg-rose-500" },
  { name: "Banking & Fintech Intelligence", desc: "Multi-bank aggregation, AA framework, UPI tagging, loan eligibility.", modules: 6, color: "bg-teal-500" },
  { name: "CA & Partner Ecosystem", desc: "White-label dashboards for CAs managing multiple SME clients.", modules: 4, color: "bg-fyn-gold" },
];

const steps = [
  { title: "Connect your bank", desc: "Connect via RBI's Account Aggregator — no passwords shared. Covers HDFC, ICICI, SBI, Axis, Kotak, and 20+ more.", icon: "🏦" },
  { title: "Sync your books", desc: "Connect Tally, Zoho Books, or upload a CSV. FynHelp maps everything automatically.", icon: "📒" },
  { title: "Enter your GSTIN", desc: "We pull your filing history, reconcile your ITC, and score your compliance instantly.", icon: "📄" },
  { title: "Nidhi goes to work", desc: "Within minutes, Nidhi delivers your first CFO brief — cash position, top risks, and what to do today.", icon: "✨" },
];

const testimonials = [
  { quote: "Nidhi told us we'd run out of cash in 34 days — 5 weeks before our CA would have noticed. We collected from 3 clients and avoided a crisis entirely.", author: "Rajesh Mehta", company: "Mehta Textile Traders, Surat" },
  { quote: "Our GST notice risk score was 72 when we joined FynHelp. In 3 months of ITC reconciliation, it dropped to 18. We haven't had a single scrutiny notice since.", author: "Priya Sharma", company: "Sharma & Sons Distributors, Pune" },
  { quote: "I used to spend 3 hours every Monday understanding my finances. Now Nidhi sends me a 3-sentence brief at 8AM and I know everything I need to know in 30 seconds.", author: "Karthik Sundaram", company: "KS Engineering, Chennai" },
];

const metrics = [
  { value: "10,000+", label: "Businesses onboarded" },
  { value: "₹2,400 Cr", label: "Cash runway monitored daily" },
  { value: "₹180 Cr", label: "ITC recovered for clients" },
  { value: "98.7%", label: "Metric accuracy rate" },
  { value: "63M", label: "Indian SMEs we're building for" },
];

const HomePage = () => {
  return (
    <div>
      {/* ═══ HERO ═══ */}
      <section className="bg-fyn-ink min-h-screen flex flex-col justify-center relative overflow-hidden">
        <div className="fyn-container text-center py-20 lg:py-32">
          <span className="fyn-label text-fyn-gold text-[13px] mb-6 block">INDIA'S VIRTUAL CFO PLATFORM</span>
          <h1 className="text-4xl md:text-5xl lg:text-[64px] leading-[1.1] text-white max-w-[800px] mx-auto mb-6">
            Your business deserves a CFO.
            <br />
            Now every Indian SME can have one.
          </h1>
          <p className="text-lg md:text-xl text-white/60 max-w-[600px] mx-auto mb-10 font-sans">
            Nidhi, your AI CFO, monitors your cash, predicts your risks, files your compliance, and explains every number — in plain language, in your language.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
            <Link to="/signup" className="bg-fyn-red text-white font-medium px-8 py-3.5 rounded-lg text-base hover:opacity-90 transition-opacity">
              Start Your 15-Day Free Trial →
            </Link>
            <button className="border border-white/40 text-white font-medium px-8 py-3.5 rounded-lg text-base hover:bg-white/5 transition-colors">
              Watch Nidhi in Action
            </button>
          </div>
          <p className="text-fyn-gold text-[13px] italic mb-12">
            No credit card required. Setup in 10 minutes. Works with Tally, Zoho Books, and all Indian banks.
          </p>
          <p className="text-white/30 text-sm mb-3">Trusted by 10,000+ Indian businesses</p>
          <div className="flex flex-wrap justify-center gap-4 text-white/20 fyn-label text-[11px]">
            {["Textile Trading", "Manufacturing", "IT Services", "Healthcare", "Real Estate"].map((i) => (
              <span key={i} className="border border-white/10 px-3 py-1 rounded">{i}</span>
            ))}
          </div>

          {/* Dashboard mockup */}
          <div className="mt-16 max-w-4xl mx-auto bg-fyn-ink border border-white/10 rounded-xl p-6 text-left">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-white/40 text-xs fyn-label mb-1">Cash Runway</p>
                <p className="text-white text-3xl fyn-metric">52 days</p>
                <p className="text-fyn-red text-xs mt-1">↓ 8 days from last week</p>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-white/40 text-xs fyn-label mb-1">Bank Balance</p>
                <p className="text-white text-3xl fyn-metric">₹18.4L</p>
                <p className="text-fyn-success text-xs mt-1">↑ ₹2.1L today</p>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-white/40 text-xs fyn-label mb-1">GST Notice Risk</p>
                <p className="text-white text-3xl fyn-metric">24/100</p>
                <p className="text-fyn-success text-xs mt-1">Low risk</p>
              </div>
            </div>
            <div className="bg-white/5 rounded-lg p-4 flex gap-3 items-start">
              <div className="w-8 h-8 rounded-full bg-fyn-red flex items-center justify-center text-white text-sm font-bold shrink-0">N</div>
              <div>
                <p className="text-white/80 text-sm">Good morning. ABC Electronics owes ₹8.4L — 62 days overdue. Collecting this adds 15 days to your runway. Shall I draft a reminder?</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ PROBLEM ═══ */}
      <section className="bg-fyn-beige fyn-section">
        <div className="fyn-container">
          <span className="fyn-label text-fyn-gold text-[13px] block mb-4">THE PROBLEM</span>
          <h2 className="text-3xl md:text-4xl lg:text-[48px] leading-tight text-fyn-ink max-w-[900px] mb-16">
            63 million Indian SMEs are making ₹Crore decisions with zero financial intelligence.
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { num: "₹0", title: "No CFO, no clarity", desc: "Less than 2% of Indian SMEs have access to a qualified CFO. The rest fly blind on cash flow, GST, and working capital — making gut decisions that kill viable businesses." },
              { num: "42%", title: "Of SMEs cite cash flow as their #1 challenge", desc: "Most business owners discover a cash crisis 2 weeks before it happens — not 60 days out when there's still time to act." },
              { num: "₹3.2L", title: "Average ITC lost per SME per year", desc: "GST mismatches, vendor non-compliance, and missed reconciliations cost Indian SMEs crores in unclaimed input tax credit every year." },
            ].map((p) => (
              <div key={p.num}>
                <p className="text-fyn-red text-5xl font-serif font-bold mb-3">{p.num}</p>
                <h3 className="text-fyn-ink text-xl font-serif mb-3">{p.title}</h3>
                <p className="text-fyn-ink/70 text-sm leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ NIDHI INTRO ═══ */}
      <section className="bg-fyn-ink fyn-section">
        <div className="fyn-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            {/* Left: Nidhi card */}
            <div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-fyn-red flex items-center justify-center text-white text-xl font-bold">N</div>
                  <div>
                    <p className="text-white text-2xl font-serif">Nidhi</p>
                    <p className="text-fyn-gold text-sm fyn-label">Your AI CFO</p>
                  </div>
                  <span className="ml-auto text-green-400 text-xs flex items-center gap-1">● Online — Always monitoring</span>
                </div>
                <div className="space-y-4">
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-white/50 text-[11px] mb-1">Nidhi</p>
                    <p className="text-white/80 text-sm leading-relaxed">Good morning. Your runway is 52 days — 8 days less than last week. ABC Electronics owes ₹8.4L, 62 days overdue. Collecting this today adds 15 days to your runway. Shall I draft a reminder?</p>
                  </div>
                  <div className="bg-fyn-red/10 rounded-lg p-3 ml-8">
                    <p className="text-white/50 text-[11px] mb-1">You</p>
                    <p className="text-white/80 text-sm">Yes, and what happens if I hire 3 people next month?</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-white/50 text-[11px] mb-1">Nidhi</p>
                    <p className="text-white/80 text-sm leading-relaxed">At ₹7L CTC average, that's ₹1.75L additional monthly burn. Your runway drops to 31 days — below the safe threshold. I'd recommend hiring 1 now and 2 more after you collect from ABC Electronics.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Title block */}
            <div>
              <h2 className="text-4xl lg:text-[48px] leading-tight text-white mb-4">Meet Nidhi.</h2>
              <p className="text-white/60 text-xl mb-8">India's first AI CFO built for SMEs.</p>
              <ul className="space-y-4 mb-8">
                {[
                  "Speaks in plain Hindi, English, Gujarati, Tamil, Marathi",
                  "Monitors 50+ business metrics simultaneously — every day",
                  "Predicts cash crises 60 days before they happen",
                  "Reconciles your GST and catches ITC mismatches automatically",
                  "Explains every decision and its exact cash impact before you make it",
                ].map((b) => (
                  <li key={b} className="flex gap-3 items-start text-white text-base">
                    <span className="text-fyn-red mt-1">●</span>
                    <span className="text-white/80">{b}</span>
                  </li>
                ))}
              </ul>
              <Link to="/signup" className="inline-block bg-fyn-red text-white font-medium px-8 py-3.5 rounded-lg hover:opacity-90 transition-opacity">
                Talk to Nidhi for free →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ PRODUCT SUITES ═══ */}
      <section className="bg-fyn-beige fyn-section">
        <div className="fyn-container">
          <span className="fyn-label text-fyn-gold text-[13px] block mb-4">10 INTELLIGENCE SUITES</span>
          <h2 className="text-3xl md:text-4xl lg:text-[48px] leading-tight text-fyn-ink mb-12">
            Everything a CFO does. Automated. Intelligent. Always on.
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {suites.map((s) => (
              <div key={s.name} className="bg-fyn-beige-dark border border-fyn-ink-10 rounded-lg p-5 hover:shadow-md transition-shadow">
                <div className={`w-3 h-3 rounded-full ${s.color} mb-3`} />
                <h3 className="text-fyn-ink font-serif text-base mb-2">{s.name}</h3>
                <p className="text-fyn-ink/60 text-sm mb-3 leading-relaxed">{s.desc}</p>
                <p className="text-fyn-ink/40 text-xs mb-2">{s.modules} modules</p>
                <Link to="/products" className="text-fyn-red text-sm font-medium hover:underline">Explore →</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section className="bg-fyn-ink fyn-section">
        <div className="fyn-container">
          <h2 className="text-3xl md:text-4xl lg:text-[48px] leading-tight text-white text-center mb-16">
            Up and running in 10 minutes.
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            {/* Connection line */}
            <div className="hidden md:block absolute top-12 left-[12.5%] right-[12.5%] h-0.5 bg-fyn-red/30" />
            {steps.map((s, i) => (
              <div key={s.title} className="bg-fyn-beige-dark rounded-lg p-6 text-center relative">
                <div className="text-3xl mb-3">{s.icon}</div>
                <span className="fyn-label text-fyn-red text-[11px] block mb-2">Step {i + 1}</span>
                <h3 className="text-fyn-ink font-serif text-lg mb-3">{s.title}</h3>
                <p className="text-fyn-ink/60 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ DECISION SIMULATOR ═══ */}
      <section className="bg-fyn-beige fyn-section">
        <div className="fyn-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left: Simulator widget */}
            <div className="bg-fyn-beige-dark border border-fyn-ink-10 rounded-xl p-6">
              <h3 className="text-fyn-ink font-serif text-lg mb-4">What happens if I extend credit to 60 days?</h3>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="text-fyn-ink/60 text-xs fyn-label block mb-1">Current credit days</label>
                  <div className="h-2 bg-fyn-ink/10 rounded-full"><div className="h-2 bg-fyn-gold rounded-full w-[50%]" /></div>
                  <span className="text-fyn-ink fyn-metric text-sm">30 days</span>
                </div>
                <div>
                  <label className="text-fyn-ink/60 text-xs fyn-label block mb-1">New credit days</label>
                  <div className="h-2 bg-fyn-ink/10 rounded-full"><div className="h-2 bg-fyn-red rounded-full w-[100%]" /></div>
                  <span className="text-fyn-ink fyn-metric text-sm">60 days</span>
                </div>
                <div>
                  <label className="text-fyn-ink/60 text-xs fyn-label block mb-1">Monthly revenue</label>
                  <span className="text-fyn-ink fyn-metric text-lg">₹25,00,000</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-fyn-red-light border border-fyn-red/20 rounded-lg p-3 text-center">
                  <p className="text-fyn-red fyn-metric text-xl font-bold">−₹25L</p>
                  <p className="text-fyn-ink/50 text-xs mt-1">Cash gap</p>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-center">
                  <p className="text-fyn-warning fyn-metric text-xl font-bold">47 days</p>
                  <p className="text-fyn-ink/50 text-xs mt-1">New runway</p>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-center">
                  <p className="text-fyn-warning fyn-metric text-xl font-bold">Medium</p>
                  <p className="text-fyn-ink/50 text-xs mt-1">Risk level</p>
                </div>
              </div>
              <p className="text-fyn-ink/60 text-sm mt-4 italic">💡 Counter-propose 45 days with 2% early payment discount</p>
            </div>

            {/* Right */}
            <div>
              <h2 className="text-3xl lg:text-[48px] leading-tight text-fyn-ink mb-4">Simulate every decision before you make it.</h2>
              <p className="text-fyn-ink/70 text-base leading-relaxed mb-6">
                See the exact cash impact of extending credit terms, hiring new staff, changing your pricing, delaying a GST refund, or buying new machinery — before you commit. Nidhi models 8 scenarios with your live business data.
              </p>
              <div className="flex flex-wrap gap-2">
                {["Credit Terms", "Hiring", "Pricing", "GST Refund", "Capex", "Seasonal"].map((c) => (
                  <span key={c} className="bg-fyn-ink/5 border border-fyn-ink-10 text-fyn-ink text-sm px-3 py-1.5 rounded">{c}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ TESTIMONIALS ═══ */}
      <section className="bg-fyn-beige-dark fyn-section">
        <div className="fyn-container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.author} className="bg-fyn-beige border border-fyn-ink-10 rounded-lg p-6">
                <p className="text-fyn-ink/80 text-base leading-relaxed mb-6 italic">"{t.quote}"</p>
                <p className="text-fyn-ink font-medium text-sm">{t.author}</p>
                <p className="text-fyn-ink/50 text-sm">{t.company}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ METRICS STRIP ═══ */}
      <section className="bg-fyn-red py-12">
        <div className="fyn-container">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 text-center">
            {metrics.map((m) => (
              <div key={m.label}>
                <p className="text-white text-2xl md:text-3xl fyn-metric font-bold">{m.value}</p>
                <p className="text-white/70 text-sm mt-1">{m.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ PRICING ═══ */}
      <section className="bg-fyn-beige fyn-section">
        <div className="fyn-container">
          <span className="fyn-label text-fyn-gold text-[13px] block mb-4">TRANSPARENT PRICING</span>
          <h2 className="text-3xl md:text-4xl leading-tight text-fyn-ink mb-4">
            The cost of a real CFO: ₹30–50L/year.
          </h2>
          <p className="text-fyn-ink/60 text-xl mb-12">The cost of Nidhi: ₹24,000/year.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Starter */}
            <div className="bg-fyn-beige-dark border border-fyn-ink-10 rounded-lg p-6">
              <h3 className="text-fyn-ink font-serif text-xl mb-1">Starter</h3>
              <p className="text-fyn-red fyn-metric text-2xl font-bold">₹1,999<span className="text-sm font-normal text-fyn-ink/50">/month</span></p>
              <p className="text-fyn-ink/50 text-xs mb-4">or ₹19,999/year — save 17%</p>
              <p className="text-fyn-ink/60 text-sm mb-4">For businesses up to ₹5 Cr turnover</p>
              <ul className="space-y-2 text-sm text-fyn-ink/70 mb-6">
                <li>✓ Liquidity Intelligence (all 6 modules)</li>
                <li>✓ GST filing calendar + basic ITC alerts</li>
                <li>✓ Cash flow projection (30-day)</li>
                <li>✓ Nidhi morning brief (English)</li>
                <li>✓ 1 bank account connection</li>
                <li>✓ Email support</li>
              </ul>
              <Link to="/signup" className="block text-center bg-fyn-red text-white py-3 rounded-lg font-medium hover:opacity-90 transition-opacity">Start Free Trial</Link>
            </div>

            {/* Growth */}
            <div className="bg-fyn-ink border border-fyn-ink rounded-lg p-6 relative ring-2 ring-fyn-red">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-fyn-red text-white text-xs px-3 py-0.5 rounded-full fyn-label">MOST POPULAR</span>
              <h3 className="text-white font-serif text-xl mb-1">Growth</h3>
              <p className="text-fyn-red fyn-metric text-2xl font-bold">₹4,999<span className="text-sm font-normal text-white/50">/month</span></p>
              <p className="text-white/40 text-xs mb-4">or ₹49,999/year — save 17%</p>
              <p className="text-white/60 text-sm mb-4">For businesses ₹5–50 Cr turnover</p>
              <ul className="space-y-2 text-sm text-white/70 mb-6">
                <li>✓ Everything in Starter</li>
                <li>✓ Revenue Intelligence (all 8 modules)</li>
                <li>✓ Full ITC reconciliation engine</li>
                <li>✓ Decision Simulator (4 scenarios)</li>
                <li>✓ WhatsApp alerts + Hindi/Gujarati</li>
                <li>✓ Tally + Zoho Books integration</li>
                <li>✓ Priority support</li>
              </ul>
              <Link to="/signup" className="block text-center bg-fyn-red text-white py-3 rounded-lg font-medium hover:opacity-90 transition-opacity">Start Free Trial</Link>
            </div>

            {/* Pro */}
            <div className="bg-fyn-beige-dark border border-fyn-ink-10 rounded-lg p-6">
              <h3 className="text-fyn-ink font-serif text-xl mb-1">Pro</h3>
              <p className="text-fyn-red fyn-metric text-2xl font-bold">₹12,999<span className="text-sm font-normal text-fyn-ink/50">/month</span></p>
              <p className="text-fyn-ink/50 text-xs mb-4">or ₹1,29,999/year — save 17%</p>
              <p className="text-fyn-ink/60 text-sm mb-4">For businesses ₹50–200 Cr turnover</p>
              <ul className="space-y-2 text-sm text-fyn-ink/70 mb-6">
                <li>✓ Everything in Growth</li>
                <li>✓ Governance Intelligence (all 10 modules)</li>
                <li>✓ Full Decision Simulator (8 scenarios)</li>
                <li>✓ Working capital marketplace</li>
                <li>✓ CA white-label workspace</li>
                <li>✓ All 5 Indian languages</li>
                <li>✓ Dedicated relationship manager</li>
              </ul>
              <Link to="/signup" className="block text-center bg-fyn-red text-white py-3 rounded-lg font-medium hover:opacity-90 transition-opacity">Start Free Trial</Link>
            </div>

            {/* Enterprise */}
            <div className="bg-fyn-beige-dark border border-fyn-ink-10 rounded-lg p-6">
              <h3 className="text-fyn-ink font-serif text-xl mb-1">Enterprise</h3>
              <p className="text-fyn-ink fyn-metric text-2xl font-bold">Custom</p>
              <p className="text-fyn-ink/50 text-xs mb-4">For groups, CA firms, banks</p>
              <p className="text-fyn-ink/60 text-sm mb-4">Everything in Pro, plus:</p>
              <ul className="space-y-2 text-sm text-fyn-ink/70 mb-6">
                <li>✓ Bank API white-label deployment</li>
                <li>✓ Custom vertical modules</li>
                <li>✓ SLA guarantees + ISO 27001</li>
                <li>✓ On-site implementation</li>
                <li>✓ Custom integrations</li>
              </ul>
              <button className="w-full border-[1.5px] border-fyn-ink text-fyn-ink py-3 rounded-lg font-medium hover:bg-fyn-ink hover:text-white transition-colors">Talk to Sales</button>
            </div>
          </div>

          <p className="text-center text-fyn-ink/50 text-sm mt-8">
            All plans include a 15-day free trial. No credit card required. Cancel anytime. Switch plans instantly.
          </p>
        </div>
      </section>

      {/* ═══ FINAL CTA ═══ */}
      <section className="bg-fyn-ink py-16 text-center">
        <div className="fyn-container">
          <h2 className="text-3xl md:text-4xl lg:text-[48px] leading-tight text-white mb-4">
            Start finding your numbers today.
          </h2>
          <p className="text-white/60 text-lg mb-8">
            Join 10,000+ Indian businesses who finally understand their finances.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
            <Link to="/signup" className="bg-fyn-red text-white font-medium px-8 py-3.5 rounded-lg hover:opacity-90 transition-opacity">
              Start 15-Day Free Trial
            </Link>
            <button className="border border-white/40 text-white font-medium px-8 py-3.5 rounded-lg hover:bg-white/5 transition-colors">
              Book a Demo
            </button>
          </div>
          <p className="text-white/30 text-sm">Questions? Email support@fynhelp.com or call +91-XXXXXXXXXX</p>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
