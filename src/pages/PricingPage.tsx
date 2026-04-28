import { useEffect } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { Check, ArrowRight } from "lucide-react";

const TIERS = [
  {
    name: "Free Beta",
    price: "₹0",
    period: "for 6 months",
    blurb: "First 1,000 users — free for 6 months.",
    cta: "Join Waitlist →",
    highlighted: true,
    features: ["All 5 intelligence modules", "Up to 2 bank accounts", "GSTR & TDS calendar", "AI CFO Nidhi (basic)", "Email support"],
  },
  {
    name: "Starter",
    price: "₹2,999",
    period: "/month",
    blurb: "Coming soon.",
    cta: "Join Waitlist →",
    highlighted: false,
    features: ["Everything in Free Beta", "Up to 5 bank accounts", "Receivables auto-chase", "Nidhi unlimited queries", "Priority email support"],
  },
  {
    name: "Professional",
    price: "₹9,999",
    period: "/month",
    blurb: "Coming soon.",
    cta: "Join Waitlist →",
    highlighted: false,
    features: ["Everything in Starter", "Unlimited banks", "CA partner access", "Custom CFO reports", "WhatsApp + phone support"],
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    blurb: "For larger teams & multi-entity.",
    cta: "Request Access →",
    highlighted: false,
    features: ["Everything in Professional", "Multi-entity consolidation", "SSO & audit trails", "Dedicated success manager", "SLA-backed support"],
  },
];

const FAQS = [
  { q: "When does FYNHelp launch?", a: "We're opening early access in waves. Join the waitlist and we'll email you the moment your slot is ready." },
  { q: "Is it really free for the first 1,000 users?", a: "Yes — the first 1,000 founders get every paid feature free for 6 months in exchange for feedback." },
  { q: "How does FYNHelp connect to my bank?", a: "Through RBI's Account Aggregator framework — you never share credentials, and access is revocable any time." },
  { q: "Do I need a CA?", a: "No. FYNHelp works standalone, but if you have a CA, they can join via our partner portal." },
];

const PricingPage = () => {
  useEffect(() => {
    document.title = "Pricing - Affordable AI CFO for Startups | FYNHelp";
  }, []);

  return (
    <Layout>
      <section className="bg-fyn-ink text-white py-20">
        <div className="fyn-container text-center max-w-3xl">
          <h1 className="font-serif text-4xl md:text-5xl mb-4">Simple, founder-friendly pricing</h1>
          <p className="text-white/70 text-lg">Free for the first 1,000 users. Paid plans unlock as we scale.</p>
        </div>
      </section>

      <section className="bg-fyn-beige py-20">
        <div className="fyn-container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {TIERS.map((t) => (
              <div
                key={t.name}
                className={`bg-white rounded-xl p-7 flex flex-col border ${
                  t.highlighted ? "border-fyn-red shadow-lg" : "border-fyn-ink/10"
                }`}
              >
                {t.highlighted && (
                  <span className="inline-block bg-fyn-red text-white text-[10px] uppercase tracking-wider font-semibold px-2 py-1 rounded mb-3 self-start">
                    Best for early users
                  </span>
                )}
                <h3 className="font-serif text-2xl text-fyn-ink mb-1">{t.name}</h3>
                <p className="text-fyn-ink/60 text-xs mb-4">{t.blurb}</p>
                <div className="mb-5">
                  <span className="font-serif text-3xl text-fyn-ink">{t.price}</span>
                  {t.period && <span className="text-fyn-ink/60 text-sm ml-1">{t.period}</span>}
                </div>
                <ul className="space-y-2 mb-6 flex-1">
                  {t.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-fyn-ink/80">
                      <Check size={15} className="text-fyn-red mt-0.5 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  to="/early-access"
                  className={`text-center py-3 rounded-lg font-semibold text-sm transition-opacity hover:opacity-90 ${
                    t.highlighted ? "bg-fyn-red text-white" : "bg-fyn-ink text-white"
                  }`}
                >
                  {t.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="fyn-container max-w-3xl">
          <h2 className="font-serif text-3xl text-fyn-ink mb-8 text-center">Frequently asked</h2>
          <div className="space-y-4">
            {FAQS.map((f) => (
              <details key={f.q} className="bg-fyn-beige border border-fyn-ink/10 rounded-lg p-5 group">
                <summary className="font-medium text-fyn-ink cursor-pointer list-none flex items-center justify-between">
                  {f.q}
                  <span className="text-fyn-red text-xl group-open:rotate-45 transition-transform">+</span>
                </summary>
                <p className="text-fyn-ink/70 text-sm mt-3 leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link
              to="/early-access"
              className="bg-fyn-red text-white px-8 py-4 rounded-lg font-semibold inline-flex items-center gap-2 hover:opacity-90 transition-opacity"
            >
              Join Waitlist <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
