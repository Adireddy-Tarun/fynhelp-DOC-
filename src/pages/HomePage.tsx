import { useEffect } from "react";
import { Link } from "react-router-dom";
import { TrendingUp, ShieldCheck, Wallet, Sparkles, ArrowRight } from "lucide-react";

const FEATURES = [
  {
    Icon: TrendingUp,
    title: "Real-time Cash Flow Intelligence",
    body: "Live runway, burn, and inflow forecasts powered by your bank and books.",
  },
  {
    Icon: ShieldCheck,
    title: "GST & Tax Compliance Tracking",
    body: "Never miss a return. Automated GSTR, TDS, and filing calendar alerts.",
  },
  {
    Icon: Wallet,
    title: "Receivables & Payables Management",
    body: "Chase invoices, schedule payouts, and protect working capital.",
  },
  {
    Icon: Sparkles,
    title: "AI CFO Assistant (Nidhi)",
    body: "Ask anything about your finances. Nidhi reads your books and answers in plain English.",
  },
];

const HomePage = () => {
  useEffect(() => {
    document.title = "FYNHelp - AI Financial Intelligence for Indian SMEs";
    const meta = document.querySelector('meta[name="description"]');
    const desc = "Get the financial clarity of a CFO without hiring one. Track cash, receivables, and compliance for your Indian SME.";
    if (meta) meta.setAttribute("content", desc);
    else {
      const m = document.createElement("meta");
      m.name = "description";
      m.content = desc;
      document.head.appendChild(m);
    }
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="bg-fyn-ink text-white py-24 md:py-32">
        <div className="fyn-container text-center max-w-4xl">
          <span className="inline-block text-xs uppercase tracking-widest text-fyn-gold font-semibold mb-6">
            Pre-launch · Early access opening soon
          </span>
          <h1 className="font-serif text-4xl md:text-6xl leading-tight mb-6">
            AI-Powered Financial Intelligence for Indian SMEs
          </h1>
          <p className="text-white/70 text-lg md:text-xl mb-10 max-w-2xl mx-auto">
            Get the financial clarity of a CFO without hiring one. Track cash, receivables, compliance, and more.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/early-access"
              className="bg-fyn-red text-white px-8 py-4 rounded-lg font-semibold text-base inline-flex items-center gap-2 hover:opacity-90 transition-opacity"
            >
              Join Waitlist <ArrowRight size={18} />
            </Link>
            <Link
              to="/pricing"
              className="text-white/80 hover:text-white px-6 py-4 font-medium underline-offset-4 hover:underline"
            >
              See Pricing →
            </Link>
          </div>
          <p className="text-white/50 text-sm mt-8">
            Join 1,000+ founders on the waitlist
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="bg-fyn-beige py-20">
        <div className="fyn-container">
          <div className="text-center mb-14">
            <h2 className="font-serif text-3xl md:text-4xl text-fyn-ink mb-3">
              Everything an Indian SME needs to run on autopilot
            </h2>
            <p className="text-fyn-ink/65 max-w-2xl mx-auto">
              Five intelligence modules, one unified workspace.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {FEATURES.map(({ Icon, title, body }) => (
              <div key={title} className="bg-white border border-fyn-ink/10 rounded-xl p-7 hover:shadow-lg transition-shadow">
                <div className="w-11 h-11 rounded-lg bg-fyn-red/10 flex items-center justify-center text-fyn-red mb-4">
                  <Icon size={22} />
                </div>
                <h3 className="font-serif text-xl text-fyn-ink mb-2">{title}</h3>
                <p className="text-fyn-ink/65 text-sm leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-white py-20">
        <div className="fyn-container text-center max-w-2xl">
          <h2 className="font-serif text-3xl md:text-4xl text-fyn-ink mb-4">
            Be first in line when we launch
          </h2>
          <p className="text-fyn-ink/65 mb-8">
            First 1,000 users get FYNHelp free for 6 months.
          </p>
          <Link
            to="/early-access"
            className="bg-fyn-red text-white px-8 py-4 rounded-lg font-semibold inline-flex items-center gap-2 hover:opacity-90 transition-opacity"
          >
            Join Waitlist <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
