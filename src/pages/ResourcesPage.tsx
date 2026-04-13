import Layout from "@/components/Layout";

const ResourcesPage = () => (
  <Layout>
    <section className="bg-fyn-ink py-16">
      <div className="fyn-container text-center">
        <h1 className="text-3xl md:text-[48px] leading-tight text-white mb-4">FynHelp Resource Centre</h1>
        <p className="text-white/60 text-lg">Everything you need to get maximum value from your AI CFO.</p>
      </div>
    </section>

    <section className="bg-fyn-beige fyn-section">
      <div className="fyn-container">
        <h2 className="text-3xl text-fyn-ink mb-8">Getting Started</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {[
            { step: "Day 1", title: "Connecting your bank account", time: "5 minutes" },
            { step: "Day 1", title: "Syncing Tally or your accounting software", time: "15 minutes" },
            { step: "Day 1", title: "Setting up your GSTIN and compliance calendar", time: "10 minutes" },
            { step: "Week 1", title: "Understanding your dashboard", time: "20 minutes" },
            { step: "Week 1", title: "Having your first conversation with Nidhi", time: "10 minutes" },
            { step: "Week 2", title: "Running your first simulation", time: "15 minutes" },
          ].map((c) => (
            <div key={c.title} className="bg-fyn-beige-dark border border-fyn-ink-10 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer">
              <span className="fyn-label text-fyn-red text-[11px] block mb-2">{c.step}</span>
              <h3 className="text-fyn-ink font-serif text-lg mb-2">{c.title}</h3>
              <p className="text-fyn-ink/40 text-sm">Estimated time: {c.time}</p>
            </div>
          ))}
        </div>

        <h2 className="text-3xl text-fyn-ink mb-8">Templates & Downloads</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          {[
            "GST Reconciliation Tracker (Excel)",
            "Cash Flow Projection Template (Excel)",
            "Receivables Aging Register (Excel)",
            "Vendor GST Compliance Checklist (PDF)",
            "MSME Rights Letter Template (Word)",
            "Advance Tax Calculation Workbook (Excel)",
            "Monthly CFO Report Template (Word)",
            "Board Meeting Financial Update (PPT)",
          ].map((t) => (
            <div key={t} className="bg-fyn-beige-dark border border-fyn-ink-10 rounded-lg p-4 flex items-center gap-3 cursor-pointer hover:shadow-md transition-shadow">
              <span className="text-fyn-red text-lg">📄</span>
              <span className="text-fyn-ink text-sm">{t}</span>
            </div>
          ))}
        </div>

        <h2 className="text-3xl text-fyn-ink mb-8">Video Tutorials</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { title: "How Nidhi's morning brief works", dur: "4 min" },
            { title: "ITC reconciliation walkthrough", dur: "8 min" },
            { title: "Running a hiring simulation", dur: "6 min" },
            { title: "Setting up compliance calendar", dur: "5 min" },
            { title: "Understanding the 360 Dashboard", dur: "10 min" },
            { title: "WhatsApp alerts setup", dur: "3 min" },
            { title: "Connecting Tally to FynHelp", dur: "7 min" },
            { title: "Working capital marketplace", dur: "6 min" },
            { title: "CA partner dashboard setup", dur: "9 min" },
            { title: "Exporting reports for your CA", dur: "4 min" },
          ].map((v) => (
            <div key={v.title} className="bg-fyn-ink rounded-lg p-4 cursor-pointer hover:opacity-90 transition-opacity">
              <div className="bg-white/5 rounded-lg h-20 flex items-center justify-center mb-3">
                <span className="text-fyn-red text-2xl">▶</span>
              </div>
              <p className="text-white text-sm font-medium">{v.title}</p>
              <p className="text-white/40 text-xs">{v.dur}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  </Layout>
);

export default ResourcesPage;
