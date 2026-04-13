import Layout from "@/components/Layout";

const SolutionsPage = () => (
  <Layout>
    <section className="bg-fyn-ink py-16">
      <div className="fyn-container text-center">
        <span className="fyn-label text-fyn-gold text-[13px] block mb-4">HOW FYNHELP WORKS</span>
        <h1 className="text-3xl md:text-[48px] leading-tight text-white max-w-[900px] mx-auto mb-4">
          One platform. Every financial problem an Indian SME faces. Solved.
        </h1>
        <p className="text-white/60 text-lg max-w-[700px] mx-auto">
          FynHelp's intelligence suites are deeply interconnected — when Nidhi spots a cash crunch, she simultaneously checks your receivables for quick wins, your GST for refunds due, your payables for deferral options, and your working capital marketplace for financing.
        </p>
      </div>
    </section>

    {/* Relationship map */}
    <section className="bg-fyn-beige fyn-section">
      <div className="fyn-container text-center">
        <h2 className="text-3xl text-fyn-ink mb-12">How the product ecosystem works together</h2>
        <div className="relative max-w-lg mx-auto">
          <svg viewBox="0 0 400 400" className="w-full max-w-md mx-auto">
            <circle cx="200" cy="200" r="40" fill="#C41E1E" />
            <text x="200" y="205" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">Nidhi</text>
            {[
              { label: "Liquidity", angle: 0 },
              { label: "Revenue", angle: 60 },
              { label: "GST", angle: 120 },
              { label: "HR", angle: 180 },
              { label: "Governance", angle: 240 },
              { label: "Simulator", angle: 300 },
            ].map((n) => {
              const rad = (n.angle * Math.PI) / 180;
              const x = 200 + 140 * Math.cos(rad);
              const y = 200 + 140 * Math.sin(rad);
              return (
                <g key={n.label}>
                  <line x1="200" y1="200" x2={x} y2={y} stroke="#1A1008" strokeWidth="1" opacity="0.2" />
                  <circle cx={x} cy={y} r="30" fill="#EDE4CB" stroke="#1A1008" strokeWidth="1" opacity="0.8" />
                  <text x={x} y={y + 4} textAnchor="middle" fill="#1A1008" fontSize="9" fontWeight="500">{n.label}</text>
                </g>
              );
            })}
          </svg>
        </div>
        <p className="text-fyn-ink/60 text-base mt-8 max-w-lg mx-auto">
          Every module feeds Nidhi. Nidhi connects everything. You get one coherent answer — not 6 separate dashboards.
        </p>
      </div>
    </section>

    {/* Solution deep dives */}
    {[
      { bg: "bg-fyn-beige", text: "text-fyn-ink", sub: "text-fyn-ink/70", title: "Never run out of cash again", problem: "The #1 cause of SME failure is cash flow management — not profitability. Most business owners only know their bank balance, not their runway.", solution: "Nidhi computes your exact runway every morning from live bank data via RBI's Account Aggregator. She models your next 90 days using invoice due dates, vendor payment schedules, and payroll commitments.", modules: ["Financial Health Score", "Cash Flow Projection", "Burn Acceleration", "Liquidity Alerts"] },
      { bg: "bg-fyn-ink", text: "text-white", sub: "text-white/70", title: "Stop losing money to customers who aren't paying", problem: "The average Indian SME has 42 days of receivables sitting unpaid — working capital locked in invoices, not in your bank.", solution: "Nidhi scores every customer on payment reliability. She automatically drafts WhatsApp payment reminders and enforces your Section 43B(h) rights.", modules: ["Receivables AI", "Default Prediction", "Customer Risk Score", "Collections Automation"] },
      { bg: "bg-fyn-beige", text: "text-fyn-ink", sub: "text-fyn-ink/70", title: "Stop fearing GST notices", problem: "Indian SMEs collectively lose thousands of crores in unclaimed ITC every year because their vendors don't file on time.", solution: "On the 14th of every month, Nidhi automatically pulls your ITC data and matches it against every purchase invoice. Mismatches are flagged instantly.", modules: ["ITC Reconciliation", "Notice Risk Scorer", "Smart Filing Calendar", "Vendor GST Health"] },
    ].map((s) => (
      <section key={s.title} className={`${s.bg} fyn-section`}>
        <div className="fyn-container max-w-3xl">
          <h2 className={`text-3xl ${s.text} mb-4`}>{s.title}</h2>
          <p className={`${s.sub} mb-6 leading-relaxed`}>{s.problem}</p>
          <p className={`${s.sub} mb-6 leading-relaxed`}>{s.solution}</p>
          <div className="flex flex-wrap gap-2">
            {s.modules.map((m) => (
              <span key={m} className={`text-xs px-3 py-1.5 rounded border ${s.bg === "bg-fyn-ink" ? "border-white/20 text-white/60" : "border-fyn-ink-10 text-fyn-ink/60"}`}>{m}</span>
            ))}
          </div>
        </div>
      </section>
    ))}
  </Layout>
);

export default SolutionsPage;
