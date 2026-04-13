import Layout from "@/components/Layout";

const AboutPage = () => (
  <Layout>
    {/* Mission */}
    <section className="bg-fyn-ink fyn-section">
      <div className="fyn-container max-w-3xl">
        <h1 className="text-3xl md:text-[48px] leading-tight text-white mb-8">
          We're building the financial intelligence layer every Indian SME deserves — but couldn't afford.
        </h1>
        <div className="space-y-6 text-white/70 text-base leading-relaxed">
          <p>India has 63 million small and medium businesses. Together, they employ 110 million people and contribute nearly 30% of our GDP. Yet the vast majority operate without even basic financial intelligence — no cash flow visibility, no proactive compliance, no way to model decisions before making them. A CFO costs ₹30–50 lakh a year. Most SMEs can't afford one.</p>
          <p>FynHelp was founded on a simple belief: every business that generates revenue deserves the same quality of financial intelligence that large corporations take for granted. We built Nidhi — an AI CFO who speaks your language, knows your business, monitors your numbers every day, and tells you exactly what to do — for ₹1,999 a month.</p>
          <p>We are building toward a future where no Indian SME owner discovers a cash crisis too late to fix it. Where GST notices are prevented, not received. Where the decision to hire, borrow, or extend credit is made with full knowledge of the consequences.</p>
        </div>
      </div>
    </section>

    {/* Founders */}
    <section className="bg-fyn-beige fyn-section">
      <div className="fyn-container">
        <span className="fyn-label text-fyn-gold text-[13px] block mb-4">LEADERSHIP</span>
        <h2 className="text-3xl text-fyn-ink mb-12">The people building India's financial intelligence platform</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[
            {
              initials: "AT", color: "bg-fyn-red", name: "Adireddy Tarun", title: "Founder & CEO",
              bio: "Tarun founded FynHelp after observing that the financial tools available to Indian SMEs were either too basic or too complex — with nothing intelligent in between. He spent 3 years interviewing 500+ business owners across Bengaluru, Surat, Ludhiana, and Chennai, discovering that the single most common request was: 'I just want someone to tell me if my business is healthy or not, without me having to figure it out myself.' Nidhi was built to answer that request. Tarun leads product vision, AI strategy, and the company's overall direction.",
            },
            {
              initials: "NS", color: "bg-fyn-gold", name: "Nidhi Siddhpura", title: "Co-Founder & Director",
              note: "The real Nidhi. Our AI CFO is named after her.",
              bio: "Nidhi leads FynHelp's product design, customer success, and CA partnerships. She designed FynHelp's core user experience principle: every insight Nidhi delivers must be immediately actionable, not just interesting. A dashboard that shows you the problem without telling you what to do is not intelligence — it's anxiety. Under Nidhi's leadership, FynHelp's customer satisfaction score has consistently exceeded 92%. She also leads FynHelp's CA partner program.",
            },
          ].map((f) => (
            <div key={f.name} className="bg-fyn-beige-dark border border-fyn-ink-10 rounded-xl p-8">
              <div className="flex items-center gap-4 mb-4">
                <div className={`w-16 h-16 rounded-full ${f.color} flex items-center justify-center text-white text-xl font-bold`}>{f.initials}</div>
                <div>
                  <h3 className="text-fyn-ink font-serif text-2xl">{f.name}</h3>
                  <p className="text-fyn-gold fyn-label text-xs">{f.title}</p>
                </div>
              </div>
              {f.note && <p className="text-fyn-red text-sm italic mb-3">{f.note}</p>}
              <p className="text-fyn-ink/70 text-sm leading-relaxed">{f.bio}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Timeline */}
    <section className="bg-fyn-ink fyn-section">
      <div className="fyn-container max-w-3xl">
        <h2 className="text-3xl text-white mb-12 text-center">Our Journey</h2>
        <div className="space-y-6">
          {[
            { year: "2023", text: "Founded in Bengaluru. First 10 beta users from Whitefield SMEs." },
            { year: "2024", text: "Launched GST Intelligence + ITC Reconciliation. 500 customers." },
            { year: "2024", text: "Nidhi AI launched. First Hindi-language CFO brief delivered." },
            { year: "2025", text: "10,000 customers. Launched HR Intelligence and Decision Simulator." },
            { year: "2025", text: "CA Partner Program: 500 CA firms onboarded." },
            { year: "2026", text: "Working Capital Marketplace launched. Series A in progress." },
          ].map((e, i) => (
            <div key={i} className="flex gap-6 items-start">
              <span className="text-fyn-red fyn-metric font-bold text-lg shrink-0 w-12">{e.year}</span>
              <div className="flex-1 border-l-2 border-fyn-red/30 pl-6 pb-4">
                <p className="text-white/70 text-base">{e.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Values */}
    <section className="bg-fyn-beige fyn-section">
      <div className="fyn-container">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { title: "Accuracy above all", desc: "We'd rather say 'I don't know' than give a wrong number. Every metric Nidhi speaks is traceable to its source." },
            { title: "Plain language always", desc: "If a business owner can't understand it, we haven't done our job. No jargon. No complexity for its own sake." },
            { title: "Indian by design", desc: "We built for Tally, for GST, for Diwali seasonality, for Gujarati traders and Tamil manufacturers." },
            { title: "Action, not information", desc: "A good insight has a recommendation attached. We don't build dashboards. We build advisors." },
          ].map((v) => (
            <div key={v.title} className="bg-fyn-beige-dark border border-fyn-ink-10 rounded-lg p-6">
              <h3 className="text-fyn-ink font-serif text-lg mb-3">{v.title}</h3>
              <p className="text-fyn-ink/60 text-sm leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Contact */}
    <section className="bg-fyn-beige-dark fyn-section">
      <div className="fyn-container">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            { title: "General", email: "support@fynhelp.com", desc: "Response within 4 business hours" },
            { title: "Press & Media", email: "press@fynhelp.com", desc: "For media enquiries and interviews" },
            { title: "CA Partnerships", email: "partners@fynhelp.com", desc: "For CA firms interested in the white-label partner program" },
          ].map((c) => (
            <div key={c.title} className="bg-fyn-beige border border-fyn-ink-10 rounded-lg p-6">
              <h3 className="text-fyn-ink font-serif text-lg mb-2">{c.title}</h3>
              <p className="text-fyn-red text-sm mb-1">{c.email}</p>
              <p className="text-fyn-ink/50 text-sm">{c.desc}</p>
            </div>
          ))}
        </div>
        <p className="text-fyn-ink/50 text-sm text-center">
          FynHelp Technologies Pvt Ltd, Bengaluru, Karnataka, India · CIN: UXXXXX · GSTIN: XXXXXXXXXXXX
        </p>
      </div>
    </section>
  </Layout>
);

export default AboutPage;
