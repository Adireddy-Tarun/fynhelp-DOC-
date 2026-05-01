import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Layout from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import NeuralNetwork from "@/components/solutions/NeuralNetwork";

const solutions = [
  {
    bg: "bg-fyn-beige", text: "text-fyn-ink", sub: "text-fyn-ink/70",
    title: "Never run out of cash again",
    slug: "cash-liquidity",
    problem: "The #1 cause of SME failure is cash flow management — not profitability. Most business owners only know their bank balance, not their runway.",
    solution: "AI CFO Nidhi computes your exact runway every morning from live bank data via RBI's Account Aggregator. She models your next 90 days using invoice due dates, vendor payment schedules, and payroll commitments.",
    modules: ["Financial Health Score", "Cash Flow Projection", "Burn Acceleration", "Liquidity Alerts"],
    before: "Average time to detect cash crisis: 14 days after it begins",
    after: "Average time to detect cash crisis: 62 days before it begins",
    dashSlug: "/dashboard/cash-flow",
  },
  {
    bg: "bg-fyn-ink", text: "text-white", sub: "text-white/70",
    title: "Stop losing money to customers who aren't paying",
    slug: "collections-revenue",
    problem: "The average Indian SME has 42 days of receivables sitting unpaid — working capital locked in invoices, not in your bank.",
    solution: "AI CFO Nidhi scores every customer on payment reliability. She automatically drafts WhatsApp payment reminders and enforces your Section 43B(h) rights.",
    modules: ["Receivables AI", "Default Prediction", "Customer Risk Score", "Collections Automation"],
    before: "Average DSO for Indian SMEs: 42 days",
    after: "FynHelp customers average DSO: 28 days",
    dashSlug: "/dashboard/receivables",
  },
  {
    bg: "bg-fyn-beige", text: "text-fyn-ink", sub: "text-fyn-ink/70",
    title: "Stop fearing GST notices",
    slug: "gst-compliance",
    problem: "Indian SMEs collectively lose thousands of crores in unclaimed ITC every year because their vendors don't file on time.",
    solution: "On the 14th of every month, AI CFO Nidhi automatically pulls your ITC data and matches it against every purchase invoice. Mismatches are flagged instantly.",
    modules: ["ITC Reconciliation", "Notice Risk Scorer", "Smart Filing Calendar", "Vendor GST Health"],
    before: "₹3.2L average annual ITC loss per SME",
    after: "74% of ITC losses prevented with vendor monitoring",
    dashSlug: "/dashboard/gst",
  },
];

const SolutionsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Smooth-scroll to anchored section when arriving via /solutions#slug
  useEffect(() => {
    if (!location.hash) return;
    const id = location.hash.slice(1);
    // Defer to next tick so the section is mounted
    const t = window.setTimeout(() => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
    return () => window.clearTimeout(t);
  }, [location.hash, location.key]);

  const handleLearnMore = (dashSlug: string) => {
    if (!user) {
      navigate(`/waitlist?return=${dashSlug}`);
    } else {
      navigate(dashSlug);
    }
  };

  return (
    <Layout>
      <section className="bg-fyn-ink py-16">
        <div className="fyn-container text-center">
          <span className="fyn-label block mb-4 font-sans text-[#8e7343] text-base">HOW FYNHELP WORKS</span>
          <h1 className="text-3xl leading-tight text-white max-w-[900px] mx-auto mb-4 font-serif md:text-7xl font-bold">
            One platform. Every financial problem an Indian SME faces. Solved.
          </h1>
          <p className="text-white/60 text-lg max-w-[700px] mx-auto">
            FynHelp's intelligence suites are deeply interconnected — when AI CFO Nidhi spots a cash crunch, she simultaneously checks your receivables for quick wins, your GST for refunds due, your payables for deferral options, and your working capital marketplace for financing.
          </p>
        </div>
      </section>

      {/* Interactive Ecosystem Map */}
      <section style={{ background: "#F9F7F4", paddingTop: 80, paddingBottom: 80 }}>
        <div className="fyn-container text-center">
          <h2
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontWeight: 700,
              fontSize: 32,
              color: "#2A2A2A",
              marginBottom: 16,
            }}
          >
            How the product ecosystem works together
          </h2>
          <p style={{ fontSize: 16, color: "#2A2A2A", opacity: 0.7, marginBottom: 40 }}>
            Hover over any node to learn more. Click to explore the module.
          </p>
          <EcosystemMap />
          <p
            style={{
              fontSize: 16,
              lineHeight: 1.6,
              color: "#2A2A2A",
              opacity: 0.8,
              marginTop: 40,
              maxWidth: 640,
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            Every module feeds AI CFO Nidhi. AI CFO Nidhi connects everything. You get one coherent answer — not 6 separate dashboards.
          </p>
        </div>
      </section>

      {/* Solution deep dives */}
      {solutions.map((s) => (
        <section key={s.title} id={s.slug} className={`${s.bg} fyn-section scroll-mt-24`}>
          <div className="fyn-container max-w-3xl font-bold">
            <h2 className={`text-3xl ${s.text} mb-4`}>{s.title}</h2>
            <p className={`${s.sub} mb-6 leading-relaxed`}>{s.problem}</p>
            <p className={`${s.sub} mb-6 leading-relaxed`}>{s.solution}</p>

            {/* Before / After */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className={`rounded-lg p-4 ${s.bg === "bg-fyn-ink" ? "bg-white/5" : "bg-fyn-danger-bg"}`}>
                <p className="fyn-caption text-fyn-red text-[10px] mb-1">Before FynHelp</p>
                <p className={`text-sm ${s.bg === "bg-fyn-ink" ? "text-white/80" : "text-fyn-ink/80"}`}>{s.before}</p>
              </div>
              <div className={`rounded-lg p-4 ${s.bg === "bg-fyn-ink" ? "bg-white/5" : "bg-fyn-success-bg"}`}>
                <p className="fyn-caption text-fyn-success text-[10px] mb-1">After FynHelp</p>
                <p className={`text-sm ${s.bg === "bg-fyn-ink" ? "text-white/80" : "text-fyn-ink/80"}`}>{s.after}</p>
              </div>
            </div>

            {/* Module chips — clickable */}
            <div className="flex flex-wrap gap-2 mb-6">
              {s.modules.map((m) => (
                <button key={m}
                  onClick={() => handleLearnMore(s.dashSlug)}
                  className={`text-xs px-3 py-1.5 rounded border cursor-pointer ${
                    s.bg === "bg-fyn-ink"
                      ? "border-white/20 text-white/60 hover:border-fyn-red hover:text-fyn-red"
                      : "border-fyn-ink-10 text-fyn-ink/60 hover:border-fyn-red hover:text-fyn-red hover:bg-fyn-red-light"
                  }`}
                  style={{ transition: "all 200ms" }}
                >
                  {m}
                </button>
              ))}
            </div>

            {/* Learn more */}
            <button
              onClick={() => handleLearnMore(s.dashSlug)}
              className="text-fyn-red text-sm font-medium inline-flex items-center gap-1 group"
              style={{ background: "transparent", border: "none", cursor: "pointer" }}
            >
              Learn more
              <span className="inline-block transition-transform group-hover:translate-x-1" style={{ transition: "transform 200ms" }}>→</span>
            </button>
          </div>
        </section>
      ))}
    </Layout>
  );
};

export default SolutionsPage;
