import Layout from "@/components/Layout";

const CommunityPage = () => (
  <Layout>
    <section className="bg-fyn-ink py-16">
      <div className="fyn-container text-center">
        <h1 className="text-3xl md:text-[48px] leading-tight text-white mb-4">The FynHelp Community</h1>
        <p className="text-white/60 text-lg">Indian business owners helping each other grow, stay compliant, and make better financial decisions.</p>
      </div>
    </section>

    {/* Community numbers */}
    <section className="bg-fyn-red py-8">
      <div className="fyn-container grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
        {[
          { v: "4,200+", l: "Members" },
          { v: "380+", l: "Threads" },
          { v: "12,000+", l: "Replies" },
          { v: "96%", l: "Questions Answered" },
        ].map((m) => (
          <div key={m.l}>
            <p className="text-white text-2xl fyn-metric font-bold">{m.v}</p>
            <p className="text-white/70 text-sm">{m.l}</p>
          </div>
        ))}
      </div>
    </section>

    <section className="bg-fyn-beige fyn-section">
      <div className="fyn-container">
        <h2 className="text-3xl text-fyn-ink mb-8">Discussion Categories</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          {[
            { name: "Cash Flow & Liquidity", threads: 42 },
            { name: "GST & Tax Questions", threads: 87 },
            { name: "Tally Integration Help", threads: 28 },
            { name: "Nidhi — Tips & Tricks", threads: 35 },
            { name: "Industry Discussions", threads: 19 },
            { name: "Success Stories", threads: 12 },
            { name: "Feature Requests", threads: 67 },
          ].map((c) => (
            <div key={c.name} className="bg-fyn-beige-dark border border-fyn-ink-10 rounded-lg p-5 flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer">
              <span className="text-fyn-ink font-medium">{c.name}</span>
              <span className="text-fyn-ink/40 text-sm">{c.threads} threads</span>
            </div>
          ))}
        </div>

        <h2 className="text-3xl text-fyn-ink mb-8">Featured Threads</h2>
        <div className="space-y-4 mb-12">
          {[
            { title: "How I reduced my GST notice risk from 74 to 19 in 3 months", replies: 28 },
            { title: "Best practice for chasing overdue payments without losing the customer", replies: 41 },
            { title: "Tally sync not showing last week's entries — solved!", replies: 15 },
          ].map((t) => (
            <div key={t.title} className="bg-fyn-beige-dark border border-fyn-ink-10 rounded-lg p-5 flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer">
              <span className="text-fyn-ink">{t.title}</span>
              <span className="text-fyn-ink/40 text-sm">{t.replies} replies</span>
            </div>
          ))}
        </div>

        <h2 className="text-3xl text-fyn-ink mb-6">Expert Office Hours</h2>
        <p className="text-fyn-ink/60 mb-4">Every Tuesday at 4PM IST — FynHelp CFOs answer your questions live.</p>
        <p className="text-fyn-ink/60 mb-8">Every Thursday at 11AM IST — GST and compliance Q&A with CA partners.</p>
      </div>
    </section>
  </Layout>
);

export default CommunityPage;
