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
        <h2 className="text-3xl text-white mb-12 text-center">Our journey — just beginning</h2>
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-[23px] top-0 bottom-0 w-0.5 bg-fyn-red/30" />
          {/* Dashed future line */}
          <div className="absolute left-[23px] top-[80px] bottom-0 w-0.5 border-l-2 border-dashed border-fyn-red/20" style={{ background: "transparent" }} />

          {/* Single entry */}
          <div className="flex gap-6 items-start relative">
            <div className="w-12 h-12 rounded-full bg-fyn-red flex items-center justify-center text-white text-sm font-bold shrink-0 z-10">
              '26
            </div>
            <div className="pb-8">
              <p className="text-fyn-gold fyn-label text-[11px] mb-1">JANUARY 2026</p>
              <h3 className="text-white font-serif text-xl mb-3">FynHelp begins</h3>
              <p className="text-white/70 text-base leading-relaxed">
                FynHelp Technologies was founded in Bengaluru in January 2026. Adireddy Tarun and Nidhi Siddhpura started building India's Virtual CFO platform after spending time understanding the financial intelligence gap facing Indian SMEs. The product is currently in active development, with our first customers onboarding in early 2026.
              </p>
            </div>
          </div>

          {/* Future placeholder */}
          <div className="flex gap-6 items-start relative mt-4">
            <div className="w-12 h-12 rounded-full border-2 border-dashed border-fyn-red/30 flex items-center justify-center shrink-0 z-10">
              <span className="text-fyn-red/40 text-lg">…</span>
            </div>
            <p className="text-white/40 text-sm italic pt-3">More milestones being written. Watch this space.</p>
          </div>
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
          <div className="bg-fyn-beige border border-fyn-ink-10 rounded-lg p-6">
            <h3 className="text-fyn-ink font-serif text-lg mb-2">General Support</h3>
            <a href="mailto:support@fynhelp.com" className="text-fyn-red text-sm mb-2 block hover:underline">support@fynhelp.com</a>
            <p className="text-fyn-ink/60 text-sm mb-2">For product questions, account issues, and billing.</p>
            <p className="text-fyn-ink/40 text-xs mb-1">Response time: within 4 business hours on business days</p>
            <p className="text-fyn-ink/40 text-xs">Monday–Friday 9AM–7PM IST, Saturday 10AM–2PM IST</p>
          </div>
          <div className="bg-fyn-beige border border-fyn-ink-10 rounded-lg p-6">
            <h3 className="text-fyn-ink font-serif text-lg mb-2">Founders</h3>
            <a href="mailto:tarun@fynhelp.com" className="text-fyn-red text-sm mb-2 block hover:underline">tarun@fynhelp.com</a>
            <p className="text-fyn-ink/60 text-sm mb-2">For partnerships, press inquiries, and important business matters.</p>
            <p className="text-fyn-ink/40 text-xs">Adireddy Tarun, Founder & CEO</p>
          </div>
          <div className="bg-fyn-beige border border-fyn-ink-10 rounded-lg p-6">
            <h3 className="text-fyn-ink font-serif text-lg mb-2">CA Partnerships</h3>
            <a href="mailto:partners@fynhelp.com" className="text-fyn-red text-sm mb-2 block hover:underline">partners@fynhelp.com</a>
            <p className="text-fyn-ink/60 text-sm mb-2">For CA firms interested in the FynHelp Partner Program.</p>
            <p className="text-fyn-ink/40 text-xs">White-label dashboard for up to 200 clients per CA firm.</p>
          </div>
        </div>
        <p className="text-fyn-ink/50 text-sm text-center">
          FynHelp Technologies, Bengaluru, Karnataka, India
        </p>
      </div>
    </section>
  </Layout>
);

export default AboutPage;
