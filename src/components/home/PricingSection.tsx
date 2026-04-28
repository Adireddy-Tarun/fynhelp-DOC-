import { useState } from "react";
import { Link } from "react-router-dom";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const plans = [
  {
    name: "Starter",
    price: { monthly: "₹1,999", annual: "₹19,999", save: "₹4,000" },
    target: "Businesses up to ₹5 Crore turnover",
    sub: "Perfect for getting started with financial intelligence",
    features: [
      "Liquidity Intelligence — all 6 modules",
      "Cash flow projection (30-day)",
      "GST filing calendar + deadline alerts",
      "Basic ITC reconciliation (100 invoices/month)",
      "AI CFO Nidhi morning brief in English",
      "1 bank account via Account Aggregator",
      "Bank statement PDF parser",
      "WhatsApp alerts for critical thresholds",
      "Email support (within 8 hours)",
      "1 user account",
    ],
    featured: false,
    cta: "Start 15-Day Free Trial",
  },
  {
    name: "Growth",
    price: { monthly: "₹4,999", annual: "₹49,999", save: "₹10,000" },
    target: "Businesses ₹5–50 Crore turnover",
    sub: "Complete financial intelligence for growing businesses",
    features: [
      "Everything in Starter, plus:",
      "Revenue Intelligence — all 8 modules",
      "Full ITC reconciliation (unlimited invoices)",
      "GST notice risk scorer + vendor compliance",
      "HR & Workforce Intelligence (all 10 modules)",
      "Decision Simulator — 4 scenarios",
      "AI CFO Nidhi in Hindi + Gujarati",
      "Up to 5 bank accounts via AA",
      "Tally Prime + Zoho Books + QuickBooks",
      "Working capital marketplace access",
      "Priority support (within 2 hours)",
      "3 user accounts + monthly CFO report",
    ],
    featured: true,
    cta: "Start 15-Day Free Trial",
    badge: "Most Popular",
  },
  {
    name: "Pro",
    price: { monthly: "₹12,999", annual: "₹1,29,999", save: "₹26,000" },
    target: "Businesses ₹50–200 Crore turnover",
    sub: "Institutional-grade intelligence for serious businesses",
    features: [
      "Everything in Growth, plus:",
      "Governance Intelligence — all 10 modules",
      "Full Decision Simulator — all 8 scenarios",
      "Market benchmarking + credit rating simulator",
      "All 5 Indian languages for AI CFO Nidhi",
      "Unlimited bank accounts",
      "All payroll integrations",
      "CA white-label workspace",
      "Dedicated relationship manager",
      "10 user accounts + role-based access",
      "SLA: 99.5% uptime guarantee",
    ],
    featured: false,
    cta: "Start 15-Day Free Trial",
  },
  {
    name: "Enterprise",
    price: { monthly: "Custom", annual: "Custom", save: "" },
    target: "Groups, CA firms managing 50+ clients, banks",
    sub: "White-label intelligence at institutional scale",
    features: [
      "Everything in Pro, plus:",
      "Bank API white-label deployment",
      "Custom vertical intelligence modules",
      "ISO 27001 + SOC 2 compliance",
      "On-site implementation support",
      "Custom integrations (HRMS, ERP)",
      "Unlimited users + API access",
      "Dedicated engineering support",
      "Custom SLA agreements",
    ],
    featured: false,
    cta: "Talk to Sales",
    isEnterprise: true,
  },
];

export default function PricingSection() {
  const ref = useScrollReveal();
  const [annual, setAnnual] = useState(false);

  return (
    <section className="bg-fyn-ink py-24" ref={ref}>
      <div className="fyn-container">
        <span className="fyn-caption text-fyn-gold block mb-4 text-center reveal-up text-base">Pricing</span>
        <h2 className="text-3xl lg:text-[44px] leading-[1.2] text-white text-center mb-4 reveal-up">
          A real CFO costs ₹30–50 lakh per year. AI CFO Nidhi costs ₹24,000.
        </h2>

        {/* Toggle */}
        <div className="flex justify-center mb-12 reveal-up" style={{ transitionDelay: "100ms" }}>
          <div className="bg-white/10 rounded-full p-1 flex">
            <button
              onClick={() => setAnnual(false)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                !annual ? "bg-white text-fyn-ink" : "text-white/60"
              }`}
            >Monthly</button>
            <button
              onClick={() => setAnnual(true)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                annual ? "bg-white text-fyn-ink" : "text-white/60"
              }`}
            >Annual <span className="text-fyn-red text-xs ml-1">Save 17%</span></button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 stagger-children">
          {plans.map((p) => (
            <div
              key={p.name}
              className={`rounded-xl p-6 relative transition-all duration-300 ${
                p.featured
                  ? "bg-white border-2 border-fyn-red scale-[1.02]"
                  : "bg-white/5 border border-white/10"
              }`}
            >
              {p.badge && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-fyn-red text-white text-[10px] px-3 py-1 rounded-full fyn-caption">
                  {p.badge}
                </span>
              )}

              <h3 className={`font-display text-xl mb-1 ${p.featured ? "text-fyn-ink" : "text-white"}`}>{p.name}</h3>
              <p className={`fyn-metric text-3xl font-bold mb-0.5 ${p.featured ? "text-fyn-red" : "text-white"}`}>
                {p.isEnterprise ? "Custom" : annual ? p.price.annual : p.price.monthly}
                {!p.isEnterprise && <span className={`text-sm font-normal font-serif ${p.featured ? "text-secondary-foreground" : "text-primary-foreground"}`}>
                  /{annual ? "year" : "month"}
                </span>}
              </p>
              {!p.isEnterprise && p.price.save && annual && (
                <p className={`text-xs mb-3 ${p.featured ? "text-fyn-success" : "text-fyn-success"}`}>Save {p.price.save}/year</p>
              )}
              <p className={`text-sm mb-1 ${p.featured ? "text-fyn-ink/70" : "text-white/60"}`}>{p.target}</p>
              <p className={`text-xs mb-5 ${p.featured ? "text-fyn-ink/50" : "text-white/40"}`}>{p.sub}</p>

              <ul className="space-y-2 mb-6">
                {p.features.map((f, i) => (
                  <li key={i} className={`flex gap-2 text-sm ${p.featured ? "text-fyn-ink/70" : "text-white/60"}`}>
                    {!f.endsWith(":") && <span className="text-fyn-success shrink-0">✓</span>}
                    <span className={f.endsWith(":") ? "font-semibold" : ""}>{f}</span>
                  </li>
                ))}
              </ul>

              {p.isEnterprise ? (
                <button className={`w-full py-3 rounded-lg font-semibold text-sm border-[1.5px] transition-all duration-200 ${
                  p.featured ? "border-fyn-ink text-fyn-ink hover:bg-fyn-ink hover:text-white" : "border-white/30 text-white hover:bg-white hover:text-fyn-ink"
                }`}>{p.cta}</button>
              ) : (
                <Link to="/early-access" className={`block text-center py-3 rounded-lg font-semibold text-sm transition-all duration-200 ${
                  p.featured ? "bg-fyn-red text-white hover-btn-primary" : "bg-fyn-red text-white hover-btn-primary"
                }`}>{p.cta}</Link>
              )}
            </div>
          ))}
        </div>

        <p className="text-center text-white/50 text-sm mt-8">
          All plans include a 15-day free trial. No credit card required. Cancel anytime.
        </p>
      </div>
    </section>
  );
}
