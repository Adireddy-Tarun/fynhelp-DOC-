import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { Check, X } from "lucide-react";

type Plan = {
  id: "starter" | "pro" | "enterprise";
  name: string;
  badge: string;
  highlight?: boolean;
  priceTop: React.ReactNode;
  priceSub?: React.ReactNode;
  features: string[];
  cta: { label: string; href: string; external?: boolean };
};

const plans: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    badge: "For First 100 Waitlisters",
    priceTop: (
      <>
        <span className="text-4xl md:text-5xl font-bold text-fyn-ink">FREE</span>
        <span className="text-fyn-ink/60 ml-2 text-sm">for 6 months</span>
      </>
    ),
    priceSub: (
      <>
        <p className="text-sm text-fyn-ink/60 mt-2">
          Then <span className="font-semibold text-fyn-ink">₹30,000/year</span> or ₹3,000/month
        </p>
        <span className="inline-block mt-2 text-[11px] font-semibold tracking-wide uppercase bg-fyn-red/10 text-fyn-red px-2 py-1 rounded">
          Waitlist Only
        </span>
      </>
    ),
    features: [
      "8 AI CFO queries per month",
      "Real-time cash flow tracking",
      "Receivables & payables management",
      "GST & TDS compliance tracking",
      "Basic HR intelligence",
      "Email support",
      "1 user account",
    ],
    cta: { label: "Join Waitlist", href: "/waitlist" },
  },
  {
    id: "pro",
    name: "Pro",
    badge: "Most Popular",
    highlight: true,
    priceTop: (
      <>
        <span className="text-4xl md:text-5xl font-bold text-fyn-ink">₹90,000</span>
        <span className="text-fyn-ink/60 ml-1 text-sm">/year</span>
      </>
    ),
    priceSub: (
      <>
        <p className="text-sm text-fyn-success font-medium mt-2">Save ₹18K vs monthly (₹9,000/mo)</p>
        <p className="text-sm text-fyn-ink/70 mt-2">
          Waitlisters: <span className="font-semibold text-fyn-red">₹45,000/year</span>{" "}
          <span className="line-through text-fyn-ink/40">₹90,000</span>{" "}
          <span className="text-xs text-fyn-success">(50% off)</span>
        </p>
      </>
    ),
    features: [
      "Everything in Starter, plus:",
      "Unlimited AI CFO queries",
      "Advanced cost intelligence",
      "Market & growth analytics",
      "Decision simulator",
      "Priority email & chat support",
      "Up to 5 user accounts",
      "Custom reporting",
      "API access",
    ],
    cta: { label: "Join Waitlist", href: "/waitlist" },
  },
  {
    id: "enterprise",
    name: "Enterprise",
    badge: "For Teams",
    priceTop: (
      <span className="text-4xl md:text-5xl font-bold text-fyn-ink">Custom</span>
    ),
    priceSub: <p className="text-sm text-fyn-ink/60 mt-2">Tailored to your team</p>,
    features: [
      "Everything in Pro, plus:",
      "Unlimited users",
      "Dedicated account manager",
      "Custom integrations",
      "Multi-entity support",
      "Advanced security & compliance",
      "SLA guarantees",
      "Onboarding & training",
      "Quarterly business reviews",
    ],
    cta: { label: "Contact Sales", href: "mailto:hello@fynhelp.com", external: true },
  },
];

const comparisonRows: Array<{
  label: string;
  starter: string | boolean;
  pro: string | boolean;
  enterprise: string | boolean;
}> = [
  { label: "AI CFO queries / month", starter: "8", pro: "Unlimited", enterprise: "Unlimited" },
  { label: "Real-time cash flow", starter: true, pro: true, enterprise: true },
  { label: "Receivables & payables", starter: true, pro: true, enterprise: true },
  { label: "GST & TDS tracking", starter: true, pro: true, enterprise: true },
  { label: "HR intelligence", starter: "Basic", pro: "Advanced", enterprise: "Advanced" },
  { label: "Cost intelligence", starter: false, pro: true, enterprise: true },
  { label: "Market & growth analytics", starter: false, pro: true, enterprise: true },
  { label: "Decision simulator", starter: false, pro: true, enterprise: true },
  { label: "Custom reporting", starter: false, pro: true, enterprise: true },
  { label: "API access", starter: false, pro: true, enterprise: true },
  { label: "User accounts", starter: "1", pro: "Up to 5", enterprise: "Unlimited" },
  { label: "Multi-entity support", starter: false, pro: false, enterprise: true },
  { label: "Dedicated manager", starter: false, pro: false, enterprise: true },
  { label: "SLA guarantees", starter: false, pro: false, enterprise: true },
  { label: "Support", starter: "Email", pro: "Priority email & chat", enterprise: "Dedicated" },
];

const faqs = [
  {
    q: 'What counts as a "use case"?',
    a: 'Each AI query to Nidhi (your AI CFO) counts as one use case. Examples: "What\'s my burn rate?", "Show overdue invoices", "Generate cash flow report".',
  },
  {
    q: "Can I upgrade anytime?",
    a: "Yes! Waitlisters get 50% off Pro plan if upgraded within first 6 months.",
  },
  {
    q: "What happens after 6 months free?",
    a: "Waitlisters can continue on Starter (₹30K/year) or upgrade to Pro at 50% off (₹45K instead of ₹90K/year).",
  },
  {
    q: "Is there a free trial?",
    a: "First 100 waitlist founders get 6 months free. After that, we may offer 14-day trials.",
  },
];

function Cell({ value }: { value: string | boolean }) {
  if (typeof value === "boolean") {
    return value ? (
      <Check className="w-5 h-5 text-fyn-success mx-auto" />
    ) : (
      <X className="w-4 h-4 text-fyn-ink/25 mx-auto" />
    );
  }
  return <span className="text-sm text-fyn-ink/80">{value}</span>;
}

export default function PricingPage() {
  return (
    <Layout>
      {/* Hero */}
      <section className="bg-fyn-beige py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="font-serif font-bold text-4xl md:text-5xl text-fyn-ink mb-4">
            Simple, transparent pricing
          </h1>
          <p className="text-lg text-fyn-ink/70">
            Start free for 6 months. Upgrade when ready.
          </p>
        </div>
      </section>

      {/* Pricing cards */}
      <section className="bg-fyn-beige-dark py-16 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((p) => (
            <div
              key={p.id}
              className={`relative bg-white rounded-2xl p-8 flex flex-col ${
                p.highlight
                  ? "border-2 border-fyn-red shadow-lg shadow-fyn-red/10 md:-translate-y-2"
                  : "border border-fyn-ink/10 shadow-sm"
              }`}
            >
              <span
                className={`absolute -top-3 left-8 text-xs font-medium px-3 py-1 rounded-full ${
                  p.highlight ? "bg-fyn-red text-white" : "bg-fyn-ink text-white"
                }`}
              >
                {p.badge}
              </span>
              <h3 className="font-serif font-bold text-2xl text-fyn-ink mb-4 mt-2">{p.name}</h3>
              <div className="mb-6 min-h-[120px]">
                <div className="flex items-baseline flex-wrap">{p.priceTop}</div>
                {p.priceSub}
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {p.features.map((f) => (
                  <li key={f} className="flex gap-3 text-sm text-fyn-ink/80">
                    <Check className="w-5 h-5 text-fyn-success shrink-0 mt-0.5" />
                    <span className={f.endsWith(":") ? "font-semibold text-fyn-ink" : ""}>{f}</span>
                  </li>
                ))}
              </ul>
              {p.cta.external ? (
                <a
                  href={p.cta.href}
                  className={`block text-center w-full font-semibold py-3 rounded-lg transition-colors ${
                    p.highlight
                      ? "bg-fyn-red text-white hover:bg-fyn-red/90"
                      : "border-[1.5px] border-fyn-ink text-fyn-ink hover:bg-fyn-ink hover:text-white"
                  }`}
                >
                  {p.cta.label}
                </a>
              ) : (
                <Link
                  to={p.cta.href}
                  className={`block text-center w-full font-semibold py-3 rounded-lg transition-colors ${
                    p.highlight
                      ? "bg-fyn-red text-white hover:bg-fyn-red/90"
                      : "bg-fyn-red text-white hover:bg-fyn-red/90"
                  }`}
                >
                  {p.cta.label}
                </Link>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Comparison */}
      <section className="bg-fyn-beige py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-serif font-bold text-3xl text-fyn-ink mb-8 text-center">
            Compare plans
          </h2>
          <div className="bg-white rounded-2xl border border-fyn-ink/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-fyn-ink text-white">
                    <th className="text-left px-6 py-4 font-semibold">Feature</th>
                    <th className="px-6 py-4 font-semibold">Starter</th>
                    <th className="px-6 py-4 font-semibold bg-fyn-red">Pro</th>
                    <th className="px-6 py-4 font-semibold">Enterprise</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows.map((r, i) => (
                    <tr
                      key={r.label}
                      className={i % 2 === 0 ? "bg-white" : "bg-fyn-beige/40"}
                    >
                      <td className="px-6 py-3 text-fyn-ink/90">{r.label}</td>
                      <td className="px-6 py-3 text-center">
                        <Cell value={r.starter} />
                      </td>
                      <td className="px-6 py-3 text-center bg-fyn-red/5">
                        <Cell value={r.pro} />
                      </td>
                      <td className="px-6 py-3 text-center">
                        <Cell value={r.enterprise} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-fyn-beige-dark py-16 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-serif font-bold text-3xl text-fyn-ink mb-8 text-center">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {faqs.map((f) => (
              <div key={f.q} className="bg-white rounded-lg border border-fyn-ink/10 p-6">
                <h3 className="font-semibold text-fyn-ink mb-2">{f.q}</h3>
                <p className="text-fyn-ink/70 text-sm leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              to="/waitlist"
              className="inline-block bg-fyn-red text-white font-semibold px-8 py-3.5 rounded-lg hover:bg-fyn-red/90 transition-colors"
            >
              Join the Waitlist →
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
