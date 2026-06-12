import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Layout from "@/components/Layout";

const blogs = [
  { slug: "the-52-day-rule", title: "The 52-Day Rule: How to Read Your Business's Most Important Number", category: "CASH FLOW", time: "8 min read", date: "April 2025", author: "Adireddy Tarun, Founder & CEO", featured: true, excerpt: "Introduction about runway as the most important metric. Runway = cash / daily burn. Why 90 days is safe, 60 days is the warning zone, 30 days is critical. The 3 levers: collect faster, pay slower, burn less." },
  { slug: "itc-mismatch-silent-loss", title: "ITC Mismatch: The Silent ₹3.2L Annual Loss Most Indian SMEs Don't Know About", category: "GST", time: "10 min read", date: "March 2025", author: "FynHelp Research Team", featured: false, excerpt: "What ITC mismatch is. Why it happens. The GSTR-2B matching process explained in plain language. Real numbers: average mismatch per SME per year." },
  { slug: "bank-balance-lying", title: "Why Your Bank Balance is Lying to You", category: "FINANCIAL LITERACY", time: "6 min read", date: "March 2025", author: "Fynny Siddhpura, Co-Founder & Director", featured: false, excerpt: "The difference between bank balance and true cash position. Three numbers that matter more: available cash, runway days, net working capital." },
  { slug: "hidden-cost-of-hiring", title: "The Hidden Cost of Every Hire: Why That ₹6L CTC Actually Costs ₹8.5L", category: "HR & WORKFORCE", time: "7 min read", date: "February 2025", author: "FynHelp Research Team", featured: false, excerpt: "Complete breakdown of true hiring cost including PF, ESIC, gratuity, bonus, recruitment cost, and seat cost." },
  { slug: "gst-notices-explained", title: "GST Notices in India: What Triggers Them", category: "COMPLIANCE", time: "12 min read", date: "January 2025", author: "FynHelp Compliance Team", featured: false, excerpt: "Types of GST notices. What triggers each. How to read a notice. The 30-day response window." },
  { slug: "account-aggregator-revolution", title: "India's Account Aggregator Revolution", category: "FINTECH", time: "8 min read", date: "January 2025", author: "Adireddy Tarun, Founder & CEO", featured: false, excerpt: "What RBI's Account Aggregator framework is. How consent works. Which banks are on the AA network." },
  { slug: "section-43bh-msme-rights", title: "Section 43B(h): The Law That Gives Indian MSMEs the Right to Collect Faster", category: "LEGAL & RIGHTS", time: "9 min read", date: "December 2024", author: "FynHelp Legal Team", featured: false, excerpt: "Full explanation of Section 43B(h) of the Income Tax Act and how MSMEs can use it as leverage." },
  { slug: "gut-feel-to-data-driven", title: "From Gut Feel to Data-Driven: How 10 Indian SME Owners Changed", category: "SUCCESS STORIES", time: "11 min read", date: "November 2024", author: "FynHelp Customer Success Team", featured: false, excerpt: "10 anonymised real-world stories of Indian SMEs transforming their financial decision-making." },
];

const BlogPage = () => (
  <Layout>
    <Helmet>
      <title>FynHelp Blog — Financial Intelligence for Indian SMEs</title>
      <meta name="description" content="Tips, guides, and insights on cash flow management, GST compliance, and financial intelligence for Indian startups and SMEs." />
      <link rel="canonical" href="https://fynhelp.com/blog" />
      <meta property="og:title" content="FynHelp Blog — Financial Intelligence for Indian SMEs" />
      <meta property="og:description" content="Insights on cash flow, GST compliance, and finance for Indian SMEs." />
      <meta property="og:url" content="https://fynhelp.com/blog" />
    </Helmet>
    <section className="bg-fyn-ink py-16">
      <div className="fyn-container text-center">
        <h1 className="text-3xl md:text-[48px] leading-tight text-white mb-4">The FynHelp Journal</h1>
        <p className="text-white/60 text-lg">Insights, guides, and analysis for the Indian SME owner who wants to master their numbers.</p>
      </div>
    </section>

    <section className="bg-fyn-beige fyn-section">
      <div className="fyn-container">
        {/* Featured */}
        <Link to={`/blog/${blogs[0].slug}`} className="block bg-fyn-beige-dark border border-fyn-ink-10 rounded-xl p-8 mb-12 hover:shadow-md transition-shadow group">
          <span className="fyn-label text-fyn-red text-[11px]">{blogs[0].category}</span>
          <span className="text-fyn-ink/40 text-sm ml-3">{blogs[0].time} · {blogs[0].date}</span>
          <h2 className="text-fyn-ink font-serif text-3xl mt-3 mb-4 group-hover:text-fyn-red transition-colors">{blogs[0].title}</h2>
          <p className="text-fyn-ink/60 text-base leading-relaxed mb-4">{blogs[0].excerpt}</p>
          <p className="text-fyn-gold text-sm">By {blogs[0].author}</p>
        </Link>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogs.slice(1).map((b) => (
            <Link key={b.slug} to={`/blog/${b.slug}`} className="bg-fyn-beige-dark border border-fyn-ink-10 rounded-lg p-6 hover:shadow-md transition-shadow group">
              <span className="fyn-label text-fyn-red text-[11px]">{b.category}</span>
              <span className="text-fyn-ink/40 text-sm ml-2">{b.time}</span>
              <h3 className="text-fyn-ink font-serif text-lg mt-2 mb-3 group-hover:text-fyn-red transition-colors">{b.title}</h3>
              <p className="text-fyn-ink/60 text-sm leading-relaxed mb-3">{b.excerpt}</p>
              <p className="text-fyn-gold text-xs">{b.author} · {b.date}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  </Layout>
);

export default BlogPage;
