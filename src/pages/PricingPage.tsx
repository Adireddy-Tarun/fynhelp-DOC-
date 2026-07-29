import { useEffect, useRef, useState, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Check, Plus, X as XIcon } from "lucide-react";
import Layout from "@/components/Layout";
import FYNIcon from "@/components/FYNIcon";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/* ================================================================
   FynHelp — Pricing (restyled to match HomePage.tsx design system)
================================================================ */

const C = {
  bg: "#ECE6D2",
  card: "#FAF7EC",
  panel: "#F1F0EC",
  panelBorder: "#E3E1DA",
  ink: "#111111",
  body: "#3A3A3A",
  muted: "#6B6B6B",
  red: "#B8333A",
  redDark: "#9E2A30",
  green: "#10B981",
  black: "#0E0E0E",
  border: "rgba(0,0,0,0.08)",
};

/* --------------------------- Data --------------------------- */

type Plan = {
  id: "starter" | "pro" | "enterprise";
  name: string;
  badge?: string;
  highlight?: boolean;
  price: string;
  priceSuffix?: string;
  subline: string;
  features: string[];
  cta: { label: string; href: string; external?: boolean };
  ctaStyle: "outline-red" | "gradient" | "outline-ink";
};

const plans: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    price: "FREE",
    priceSuffix: "for 30 days",
    subline: "Then ₹30,000/year · Waitlist only",
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
    ctaStyle: "outline-red",
  },
  {
    id: "pro",
    name: "Pro",
    badge: "MOST POPULAR",
    highlight: true,
    price: "₹90,000",
    priceSuffix: "/year",
    subline: "Waitlisters: ₹45,000/year (50% off)",
    features: [
      "Everything in Starter, plus:",
      "Unlimited AI CFO queries",
      "Advanced cost intelligence",
      "Market & growth analytics",
      "Decision simulator",
      "Priority email & chat support",
      "Up to 5 user accounts",
      "Custom reporting & API access",
    ],
    cta: { label: "Join Waitlist", href: "/waitlist" },
    ctaStyle: "gradient",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "Custom",
    subline: "Tailored to your team",
    features: [
      "Everything in Pro, plus:",
      "Unlimited users",
      "Dedicated account manager",
      "Custom integrations",
      "Multi-entity support",
      "Advanced security & compliance",
      "SLA guarantees",
      "Onboarding & training",
    ],
    cta: { label: "Contact Sales", href: "mailto:hello@fynhelp.com", external: true },
    ctaStyle: "outline-ink",
  },
];

const roles = [
  { role: "CFO / Finance Head", human: "₹25–40L/yr", fyn: "CFO Fynny" },
  { role: "Financial Analyst", human: "₹8–12L/yr", fyn: "Revenue & Cost Intelligence" },
  { role: "Accountant / Bookkeeper", human: "₹5–8L/yr", fyn: "Liquidity Intelligence" },
  { role: "GST / Tax Consultant", human: "₹6–10L/yr", fyn: "GST & Tax Intelligence" },
  { role: "Compliance Manager", human: "₹7–12L/yr", fyn: "Governance Intelligence" },
  { role: "HR Analytics Specialist", human: "₹6–10L/yr", fyn: "HR & Workforce Intelligence" },
];

const faqs = [
  {
    q: 'What counts as a "use case"?',
    a: 'Each AI query to Fynny (your AI CFO) counts as one use case. Examples: "What\'s my burn rate?", "Show overdue invoices", "Generate cash flow report".',
  },
  {
    q: "Can I upgrade anytime?",
    a: "Yes. Waitlisters get 50% off Pro plan if upgraded within the first 30 days.",
  },
  {
    q: "What happens after the 30-day free trial?",
    a: "Waitlisters can continue on Starter (₹30K/year) or upgrade to Pro at 50% off (₹45K instead of ₹90K/year).",
  },
  {
    q: "Is there a free trial?",
    a: "First 100 waitlist founders get 30 days free. After that, standard plans start at their listed price.",
  },
];

/* --------------------------- Styles --------------------------- */

const STYLES = `
  .pr-page { background: ${C.bg}; color: ${C.ink}; font-family: 'Satoshi', system-ui, sans-serif; min-height: 100vh; }
  .pr-page * { box-sizing: border-box; }
  .pr-page :where(h1,h2,h3,h4,h5,h6) { font-family: 'Clash Display', sans-serif; font-weight: 600; letter-spacing: -0.035em; line-height: 1.04; color: ${C.ink}; margin: 0; }
  .pr-container { max-width: 1200px; margin: 0 auto; padding: 0 24px; }
  .num { font-variant-numeric: tabular-nums; }

  .pr-hero { padding: 88px 0 40px; text-align: center; }
  .pr-hero h1 { font-size: clamp(44px, 7vw, 88px); }
  .pr-hero p { max-width: 640px; margin: 24px auto 0; font-size: 18px; color: ${C.body}; line-height: 1.6; }

  /* Toggle */
  .pr-toggle { display: inline-flex; margin: 40px auto 0; background: ${C.card}; border: 1px solid ${C.border}; border-radius: 100px; padding: 4px; }
  .pr-toggle button { border: none; background: transparent; padding: 10px 22px; font-family: 'Satoshi', sans-serif; font-weight: 600; font-size: 14px; color: ${C.muted}; border-radius: 100px; cursor: pointer; transition: color .2s, background .2s; display: inline-flex; align-items: center; gap: 8px; }
  .pr-toggle button.active { background: ${C.ink}; color: ${C.bg}; }
  .pr-toggle .save { font-size: 10px; padding: 2px 8px; background: ${C.green}; color: #fff; border-radius: 100px; letter-spacing: 0.06em; font-weight: 700; }

  /* Plan cards */
  .pr-plans { display: grid; grid-template-columns: 1fr; gap: 20px; margin-top: 56px; }
  @media (min-width: 900px) { .pr-plans { grid-template-columns: repeat(3, 1fr); align-items: stretch; } }
  .pr-plan { position: relative; background: ${C.card}; border: 1px solid ${C.border}; border-radius: 20px; padding: 32px 28px; display: flex; flex-direction: column; transition: transform .3s cubic-bezier(.16,1,.3,1), box-shadow .3s; }
  .pr-plan:hover { transform: translateY(-4px); box-shadow: 0 24px 60px -20px rgba(0,0,0,0.15); }
  .pr-plan.pro { background: ${C.black}; color: #fff; border-color: ${C.black}; transform: translateY(-8px); box-shadow: 0 30px 70px -20px rgba(0,0,0,0.35); }
  .pr-plan.pro:hover { transform: translateY(-12px); }
  .pr-plan.pro :where(h3,.price,.suffix,.feat) { color: #fff; }
  .pr-plan.pro .subline { color: rgba(255,255,255,0.65); }
  .pr-plan.pro .feat.section { color: rgba(255,255,255,0.9); }
  .pr-plan .badge { position: absolute; top: -12px; left: 50%; transform: translateX(-50%); background: ${C.red}; color: #fff; padding: 6px 14px; border-radius: 100px; font-size: 10.5px; font-weight: 800; letter-spacing: 0.14em; font-family: 'Satoshi', sans-serif; }
  .pr-plan .name { font-family: 'Satoshi', sans-serif; font-size: 12px; font-weight: 700; letter-spacing: 0.14em; color: ${C.muted}; text-transform: uppercase; }
  .pr-plan.pro .name { color: rgba(255,255,255,0.55); }
  .pr-plan .price-wrap { margin-top: 12px; display: flex; align-items: baseline; gap: 8px; }
  .pr-plan .price { font-family: 'Clash Display', sans-serif; font-weight: 600; font-size: 52px; line-height: 1; letter-spacing: -0.04em; color: ${C.ink}; font-variant-numeric: tabular-nums; }
  .pr-plan .suffix { font-size: 14px; color: ${C.muted}; }
  .pr-plan .subline { margin-top: 12px; font-size: 14px; color: ${C.body}; }
  .pr-plan ul { list-style: none; padding: 0; margin: 24px 0 28px; display: flex; flex-direction: column; gap: 12px; flex: 1; }
  .pr-plan .feat { display: flex; align-items: flex-start; gap: 10px; font-size: 14.5px; color: ${C.body}; line-height: 1.45; }
  .pr-plan.pro .feat { color: rgba(255,255,255,0.85); }
  .pr-plan .feat.section { font-weight: 700; color: ${C.ink}; }
  .pr-plan .feat .ck { flex-shrink: 0; margin-top: 2px; width: 18px; height: 18px; border-radius: 50%; background: ${C.red}; color: #fff; display: inline-flex; align-items: center; justify-content: center; }
  .pr-plan.pro .feat .ck { background: ${C.green}; }
  .pr-plan .cta { display: inline-flex; align-items: center; justify-content: center; padding: 14px 20px; border-radius: 100px; font-family: 'Satoshi', sans-serif; font-weight: 700; font-size: 14.5px; text-decoration: none; cursor: pointer; transition: transform .2s, background .2s, color .2s; letter-spacing: 0.02em; }
  .pr-plan .cta.outline-red { background: transparent; border: 1.5px solid ${C.red}; color: ${C.red}; }
  .pr-plan .cta.outline-red:hover { background: ${C.red}; color: #fff; }
  .pr-plan .cta.gradient { background: ${C.red}; color: #fff; border: 1.5px solid ${C.red}; }
  .pr-plan .cta.gradient:hover { background: ${C.redDark}; border-color: ${C.redDark}; transform: translateY(-2px); }
  .pr-plan .cta.outline-ink { background: transparent; border: 1.5px solid ${C.ink}; color: ${C.ink}; }
  .pr-plan .cta.outline-ink:hover { background: ${C.ink}; color: ${C.bg}; }
  .pr-plan.pro .cta.outline-ink { border-color: rgba(255,255,255,0.4); color: #fff; }

  /* Section */
  .pr-section { padding: 80px 0; overflow-x: clip; }
  .pr-section h2 { font-size: clamp(34px, 5vw, 56px); text-align: center; }
  .pr-section .lead { text-align: center; color: ${C.muted}; font-size: 16px; margin: 14px auto 0; max-width: 620px; }

  /* Comparison table */
  .pr-table-wrap { margin-top: 48px; background: ${C.card}; border: 1px solid ${C.border}; border-radius: 20px; overflow: hidden; }
  .pr-table { width: 100%; border-collapse: collapse; font-family: 'Satoshi', sans-serif; }
  .pr-table th, .pr-table td { padding: 16px 20px; text-align: left; font-size: 14px; color: ${C.body}; border-bottom: 1px solid ${C.border}; }
  .pr-table th { font-family: 'Clash Display', sans-serif; font-weight: 600; color: ${C.ink}; background: ${C.panel}; font-size: 15px; letter-spacing: -0.02em; }
  .pr-table th:not(:first-child), .pr-table td:not(:first-child) { text-align: center; }
  .pr-table td:first-child { color: ${C.ink}; font-weight: 500; }
  .pr-table tr:last-child td { border-bottom: none; }
  .pr-table .yes { color: ${C.green}; }
  .pr-table .no { color: ${C.muted}; }
  .pr-table-row { opacity: 0; transform: translateX(-40px); transition: opacity .6s ease, transform .6s cubic-bezier(.16,1,.3,1); }
  .pr-table-row.in { opacity: 1; transform: none; }

  /* CA firm plan card */
  .pr-ca-card { margin-top: 40px; background: ${C.card}; border: 1px solid ${C.border}; border-radius: 24px; padding: 40px; }
  @media (min-width: 900px) { .pr-ca-card { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; } }
  .pr-ca-card .price-row { display: flex; align-items: baseline; gap: 8px; margin-top: 8px; }
  .pr-ca-card .price-big { font-family: 'Clash Display', sans-serif; font-weight: 600; font-size: 56px; letter-spacing: -0.04em; color: ${C.ink}; font-variant-numeric: tabular-nums; line-height: 1; }
  .pr-ca-card .price-sfx { font-size: 14px; color: ${C.muted}; }
  .pr-ca-card ul { list-style: none; padding: 0; margin: 0; display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .pr-ca-card ul li { display: flex; gap: 8px; font-size: 13.5px; color: ${C.body}; align-items: flex-start; }
  .pr-ca-card ul li svg { flex-shrink: 0; margin-top: 2px; color: ${C.red}; }

  /* Cost comparison */
  .pr-cost { display: grid; grid-template-columns: 1fr; gap: 20px; margin-top: 48px; }
  @media (min-width: 900px) { .pr-cost { grid-template-columns: 1fr 1fr; } }
  .pr-cost-col { background: ${C.card}; border: 1px solid ${C.border}; border-radius: 20px; overflow: hidden; }
  .pr-cost-col.fyn { background: ${C.black}; color: #fff; border-color: ${C.black}; }
  .pr-cost-col .head { padding: 24px 28px; font-family: 'Clash Display', sans-serif; font-weight: 600; font-size: 22px; letter-spacing: -0.02em; border-bottom: 1px solid ${C.border}; }
  .pr-cost-col.fyn .head { border-bottom-color: rgba(255,255,255,0.1); }
  .pr-cost-col .row { padding: 18px 28px; border-bottom: 1px solid ${C.border}; }
  .pr-cost-col.fyn .row { border-bottom-color: rgba(255,255,255,0.08); }
  .pr-cost-col .row:last-child { border-bottom: none; }
  .pr-cost-col .rl { font-size: 15px; font-weight: 600; }
  .pr-cost-col .rv { font-size: 13.5px; color: ${C.red}; font-weight: 600; margin-top: 3px; }
  .pr-cost-col.fyn .rv { color: ${C.green}; }
  .pr-cost-col .total { background: ${C.panel}; padding: 24px 28px; }
  .pr-cost-col.fyn .total { background: rgba(255,255,255,0.06); }
  .pr-cost-col .total .lbl { font-size: 12px; letter-spacing: 0.14em; text-transform: uppercase; color: ${C.muted}; }
  .pr-cost-col.fyn .total .lbl { color: rgba(255,255,255,0.55); }
  .pr-cost-col .total .val { font-family: 'Clash Display', sans-serif; font-weight: 600; font-size: 32px; letter-spacing: -0.03em; margin-top: 6px; color: ${C.red}; font-variant-numeric: tabular-nums; }
  .pr-cost-col.fyn .total .val { color: ${C.green}; }

  /* FAQ accordion */
  .pr-faq { max-width: 760px; margin: 48px auto 0; display: flex; flex-direction: column; gap: 12px; }
  .pr-faq-item { background: ${C.card}; border: 1px solid ${C.border}; border-radius: 14px; overflow: hidden; }
  .pr-faq-btn { width: 100%; display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 20px 24px; background: transparent; border: none; cursor: pointer; text-align: left; font-family: 'Satoshi', sans-serif; font-weight: 600; font-size: 16px; color: ${C.ink}; }
  .pr-faq-icon { flex-shrink: 0; width: 32px; height: 32px; border-radius: 50%; border: 1px solid ${C.border}; display: inline-flex; align-items: center; justify-content: center; color: ${C.red}; transition: transform .35s cubic-bezier(.16,1,.3,1); }
  .pr-faq-item.open .pr-faq-icon { transform: rotate(45deg); }
  .pr-faq-body { max-height: 0; overflow: hidden; transition: max-height .4s ease, padding .4s ease; padding: 0 24px; color: ${C.body}; font-size: 15px; line-height: 1.65; }
  .pr-faq-item.open .pr-faq-body { max-height: 500px; padding: 0 24px 20px; }

  /* Digit roll — vertical strip 0-9 */
  .digits { display: inline-flex; overflow: hidden; font-variant-numeric: tabular-nums; }
  .digit { display: inline-block; width: 0.6em; height: 1em; overflow: hidden; text-align: center; vertical-align: baseline; }
  .digit .strip { display: flex; flex-direction: column; transition: transform .6s cubic-bezier(.34,1.56,.64,1); }
  .digit .strip > span { display: block; height: 1em; line-height: 1; }
  .digit-static { display: inline-block; }

  /* CTA card */
  .pr-cta-card { margin: 60px auto 0; max-width: 820px; text-align: center; background: ${C.black}; color: #fff; border-radius: 24px; padding: 56px 32px; }
  .pr-cta-card h2 { color: #fff; font-size: clamp(30px, 4.5vw, 44px); }
  .pr-cta-card p { color: rgba(255,255,255,0.75); font-size: 16px; margin-top: 14px; }
  .pr-cta-card .btn { display: inline-flex; align-items: center; gap: 10px; margin-top: 28px; padding: 16px 30px; border-radius: 100px; background: ${C.red}; color: #fff; text-decoration: none; font-weight: 700; font-size: 15px; transition: background .2s, transform .2s; }
  .pr-cta-card .btn:hover { background: ${C.redDark}; transform: translateY(-2px); }

  /* Reveal (bidirectional) */
  .reveal { opacity: 0; transform: translateY(40px) scale(.94); transition: opacity .7s cubic-bezier(.16,1,.3,1), transform .8s cubic-bezier(.34,1.56,.64,1); }
  .reveal.in { opacity: 1; transform: none; }
  @media (prefers-reduced-motion: reduce) {
    .reveal, .pr-table-row { opacity: 1 !important; transform: none !important; transition: none !important; }
    .digit .strip { transition: none !important; }
  }

  html, body, #root { max-width: 100%; overflow-x: hidden; }
`;

/* --------------------------- Digit Roller --------------------------- */

function DigitRoll({ value }: { value: string }) {
  // Renders a string like "₹90,000" — digits animate, non-digits static
  return (
    <span className="digits">
      {Array.from(value).map((ch, i) => {
        if (/\d/.test(ch)) {
          const d = parseInt(ch, 10);
          return (
            <span className="digit" key={i}>
              <span className="strip" style={{ transform: `translateY(-${d}em)` }}>
                {Array.from({ length: 10 }).map((_, j) => (
                  <span key={j}>{j}</span>
                ))}
              </span>
            </span>
          );
        }
        return <span className="digit-static" key={i}>{ch}</span>;
      })}
    </span>
  );
}

/* --------------------------- Page --------------------------- */

export default function PricingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [email, setEmail] = useState("");
  const [isAnnual, setIsAnnual] = useState(true);
  const [clientCount, setClientCount] = useState(35);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "ca") {
      const el = document.getElementById("ca-firm-plan");
      if (el) setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
    }
  }, [searchParams]);

  // Bidirectional scroll reveal (matches HomePage pattern)
  const pageRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = pageRef.current;
    if (!root) return;
    const sel = ".pr-plan, .pr-section h2, .pr-section .lead, .pr-ca-card, .pr-cost-col, .pr-faq-item, .pr-cta-card, .pr-table-row";
    const targets = Array.from(root.querySelectorAll<HTMLElement>(sel));
    targets.forEach((el, i) => {
      if (el.classList.contains("pr-table-row")) return;
      el.classList.add("reveal");
      const idx = Array.from(el.parentElement?.children || []).indexOf(el);
      el.style.transitionDelay = `${Math.min(idx, 8) * 70}ms`;
    });
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.target.classList.toggle("in", e.isIntersecting)),
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );
    targets.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  // Price digit-roll display for pro plan (annual vs monthly variant)
  const proAnnual = "90,000";
  const proMonthly = "7,500";
  const proValue = isAnnual ? proAnnual : proMonthly;
  const proSuffix = isAnnual ? "/year" : "/month";

  const starterAnnual = "30,000";
  const starterMonthly = "2,500";
  const starterValue = isAnnual ? starterAnnual : starterMonthly;

  const baseMonthly = isAnnual ? 3999 : 4999;
  const extraClients = Math.max(0, clientCount - 20);
  const extraCost = extraClients * 99;
  const totalMonthly = baseMonthly + extraCost;
  const perClientCost = Math.round(totalMonthly / clientCount);

  // Comparison rows built from plan data
  const compareRows = useMemo(
    () => [
      ["AI CFO queries", "8 / month", "Unlimited", "Unlimited"],
      ["Cash flow tracking", "yes", "yes", "yes"],
      ["Receivables & payables", "yes", "yes", "yes"],
      ["GST & TDS compliance", "yes", "yes", "yes"],
      ["Cost & market intelligence", "no", "yes", "yes"],
      ["Decision simulator", "no", "yes", "yes"],
      ["User accounts", "1", "5", "Unlimited"],
      ["Custom integrations", "no", "no", "yes"],
      ["Dedicated success manager", "no", "no", "yes"],
      ["SLA guarantees", "no", "no", "yes"],
    ],
    []
  );

  return (
    <Layout>
      <div ref={pageRef} className="pr-page">
        <style>{STYLES}</style>

        {/* HERO */}
        <section className="pr-hero">
          <div className="pr-container">
            <h1>Simple pricing.<br />Powerful insights.</h1>
            <p>All plans include enterprise-grade security and the financial insights you need to make better decisions.</p>

            {/* Annual / Monthly toggle */}
            <div className="pr-toggle" role="tablist" aria-label="Billing cadence">
              <button
                type="button"
                className={!isAnnual ? "active" : ""}
                onClick={() => setIsAnnual(false)}
                aria-pressed={!isAnnual}
              >
                Monthly
              </button>
              <button
                type="button"
                className={isAnnual ? "active" : ""}
                onClick={() => setIsAnnual(true)}
                aria-pressed={isAnnual}
              >
                Annual <span className="save">SAVE 20%</span>
              </button>
            </div>
          </div>
        </section>

        {/* PLAN CARDS */}
        <section className="pr-section" style={{ paddingTop: 20 }}>
          <div className="pr-container">
            <EngagementPopup />
            <div className="pr-plans">
              {plans.map((p) => {
                const isPro = p.highlight;
                let displayPrice: React.ReactNode = p.price;
                let displaySuffix = p.priceSuffix;

                if (p.id === "pro") {
                  displayPrice = <><span>₹</span><DigitRoll value={proValue} /></>;
                  displaySuffix = proSuffix;
                } else if (p.id === "starter") {
                  // Starter's price stays "FREE" but show the post-trial line via subline
                  displayPrice = p.price;
                }

                return (
                  <div key={p.id} className={`pr-plan${isPro ? " pro" : ""}`}>
                    {p.badge && <span className="badge">{p.badge}</span>}
                    <div className="name">{p.name}</div>
                    <div className="price-wrap">
                      <span className="price num">{displayPrice}</span>
                      {displaySuffix && <span className="suffix">{displaySuffix}</span>}
                    </div>
                    <div className="subline">
                      {p.id === "starter"
                        ? isAnnual
                          ? `Then ₹${starterAnnual}/year · Waitlist only`
                          : `Then ₹${starterMonthly}/month · Waitlist only`
                        : p.subline}
                    </div>
                    <ul>
                      {p.features.map((f) => (
                        <li key={f} className={`feat${f.endsWith(":") ? " section" : ""}`}>
                          {!f.endsWith(":") && (
                            <span className="ck"><Check size={11} strokeWidth={3} /></span>
                          )}
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                    <PlanCTA plan={p} />
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* COMPARISON TABLE */}
        <section className="pr-section">
          <div className="pr-container">
            <h2>Compare features</h2>
            <p className="lead">Every plan, side by side.</p>
            <div className="pr-table-wrap">
              <table className="pr-table">
                <thead>
                  <tr>
                    <th>Feature</th>
                    <th>Starter</th>
                    <th>Pro</th>
                    <th>Enterprise</th>
                  </tr>
                </thead>
                <tbody>
                  {compareRows.map((row, i) => (
                    <TableRow key={i} row={row as string[]} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* CA FIRM PLAN */}
        <section id="ca-firm-plan" className="pr-section">
          <div className="pr-container">
            <h2>One plan. Every CA firm.</h2>
            <p className="lead">20 client seats included. Add more as you grow.</p>

            <div className="pr-ca-card">
              <div>
                <div className="name" style={{ fontFamily: "'Satoshi', sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: "0.14em", color: C.muted, textTransform: "uppercase" }}>
                  CA Partner Plan
                </div>
                <div className="price-row">
                  <span className="price-big num">
                    ₹<DigitRoll value={isAnnual ? "3,999" : "4,999"} />
                  </span>
                  <span className="price-sfx">{isAnnual ? "/month, billed annually" : "/month"}</span>
                </div>
                {isAnnual && (
                  <p style={{ color: C.red, fontSize: 14, marginTop: 8, fontWeight: 600 }}>
                    ₹47,988/year — save ₹11,988
                  </p>
                )}
                <p style={{ color: C.body, fontSize: 14, marginTop: 12 }}>
                  Includes 20 client seats free · ₹99/additional client/month
                </p>

                <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 12 }}>
                  <Link
                    to="/waitlist"
                    style={{
                      display: "inline-flex", alignItems: "center", justifyContent: "center",
                      padding: "14px 22px", borderRadius: 100, background: C.red, color: "#fff",
                      textDecoration: "none", fontWeight: 700, fontSize: 14.5, fontFamily: "'Satoshi', sans-serif",
                    }}
                  >
                    Join CA Waitlist
                  </Link>
                  <Link
                    to="/ca/register"
                    style={{
                      display: "inline-flex", alignItems: "center", justifyContent: "center",
                      padding: "14px 22px", borderRadius: 100, background: "transparent",
                      border: `1.5px solid ${C.ink}`, color: C.ink, textDecoration: "none",
                      fontWeight: 700, fontSize: 14.5, fontFamily: "'Satoshi', sans-serif",
                    }}
                  >
                    Register as CA Partner →
                  </Link>
                </div>
              </div>

              <div>
                <ul>
                  {["Client portfolio dashboard","White-label reports","GST filing calendar","Portfolio health AI","ITC reconciliation","Compliance risk alerts","Bulk GST filing","TDS tracker","5 CA team seats","Priority support"].map((f) => (
                    <li key={f}>
                      <Check size={16} strokeWidth={2.5} />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <div style={{ marginTop: 24, padding: 18, background: C.panel, border: `1px solid ${C.panelBorder}`, borderRadius: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <span style={{ fontSize: 13, color: C.body, fontWeight: 500 }}>Number of clients</span>
                    <span className="num" style={{ fontFamily: "'Clash Display', sans-serif", fontSize: 20, fontWeight: 600, color: C.ink }}>{clientCount}</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={200}
                    step={1}
                    value={clientCount}
                    onChange={(e) => setClientCount(Number(e.target.value))}
                    style={{ width: "100%", accentColor: C.red }}
                  />
                  <div style={{ marginTop: 12, display: "flex", justifyContent: "space-between", fontSize: 13, color: C.body }}>
                    <span>Base + {extraClients} extra × ₹99</span>
                    <span className="num" style={{ fontWeight: 700, color: C.ink }}>
                      ₹{totalMonthly.toLocaleString("en-IN")}/mo · ₹{perClientCost}/client
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* COST COMPARISON */}
        <section className="pr-section">
          <div className="pr-container">
            <h2>FynHelp vs. hiring a team</h2>
            <p className="lead">See how much you save by choosing AI-powered financial intelligence over traditional hiring.</p>

            <div className="pr-cost">
              <div className="pr-cost-col">
                <div className="head">Human Team</div>
                {roles.map((r) => (
                  <div key={r.role} className="row">
                    <div className="rl">{r.role}</div>
                    <div className="rv num">{r.human}</div>
                  </div>
                ))}
                <div className="total">
                  <div className="lbl">Total annual cost</div>
                  <div className="val num">₹57–92L<span style={{ fontSize: 14, color: C.muted, fontWeight: 400, fontFamily: "'Satoshi',sans-serif", marginLeft: 6 }}>/year</span></div>
                </div>
              </div>

              <div className="pr-cost-col fyn">
                <div className="head">FynHelp AI</div>
                {roles.map((r) => (
                  <div key={r.role} className="row">
                    <div className="rl">{r.role}</div>
                    <div className="rv num">Included · {r.fyn}</div>
                  </div>
                ))}
                <div className="total">
                  <div className="lbl">FynHelp Pro plan</div>
                  <div className="val num">₹90,000<span style={{ fontSize: 14, color: "rgba(255,255,255,0.55)", fontWeight: 400, fontFamily: "'Satoshi',sans-serif", marginLeft: 6 }}>/year</span></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ ACCORDION */}
        <section className="pr-section">
          <div className="pr-container">
            <h2>Frequently asked questions</h2>
            <div className="pr-faq">
              {faqs.map((f, i) => {
                const open = openFaq === i;
                return (
                  <div key={f.q} className={`pr-faq-item${open ? " open" : ""}`}>
                    <button
                      type="button"
                      className="pr-faq-btn"
                      aria-expanded={open}
                      onClick={() => setOpenFaq(open ? null : i)}
                    >
                      <span>{f.q}</span>
                      <span className="pr-faq-icon" aria-hidden>
                        {open ? <XIcon size={16} /> : <Plus size={16} />}
                      </span>
                    </button>
                    <div className="pr-faq-body">
                      <div style={{ paddingTop: 4 }}>{f.a}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* CTA card */}
            <div className="pr-cta-card">
              <h2>Ready for financial insights that work around the clock?</h2>
              <p>Built for Indian startups, SMEs, and CA firms who want real financial intelligence — not just accounting software.</p>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const url = `/waitlist${email ? `?email=${encodeURIComponent(email)}` : ""}`;
                  window.location.href = url;
                }}
                style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 480, margin: "24px auto 0" }}
              >
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  style={{
                    padding: "14px 20px", borderRadius: 100, border: "1px solid rgba(255,255,255,0.18)",
                    background: "rgba(255,255,255,0.06)", color: "#fff", fontFamily: "'Satoshi',sans-serif",
                    fontSize: 14.5, outline: "none",
                  }}
                />
                <button type="submit" className="btn" style={{ border: "none", cursor: "pointer" }}>
                  Join the waitlist →
                </button>
              </form>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}

/* --------------------------- helpers --------------------------- */

function TableRow({ row }: { row: string[] }) {
  const rowRef = useRef<HTMLTableRowElement>(null);
  useEffect(() => {
    const el = rowRef.current;
    if (!el) return;
    el.classList.add("pr-table-row");
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.target.classList.toggle("in", e.isIntersecting)),
      { threshold: 0.2 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const cell = (v: string) => {
    if (v === "yes") return <span className="yes" aria-label="Included">✓</span>;
    if (v === "no") return <span className="no" aria-label="Not included">—</span>;
    return v;
  };
  return (
    <tr ref={rowRef}>
      <td>{row[0]}</td>
      <td>{cell(row[1])}</td>
      <td>{cell(row[2])}</td>
      <td>{cell(row[3])}</td>
    </tr>
  );
}

function PlanCTA({ plan }: { plan: Plan }) {
  const cls = `cta ${plan.ctaStyle}`;
  if (plan.cta.external) {
    return <a href={plan.cta.href} className={cls}>{plan.cta.label}</a>;
  }
  return <Link to={plan.cta.href} className={cls}>{plan.cta.label}</Link>;
}

/* ====================== Engagement Popup (preserved logic) ====================== */

function EngagementPopup() {
  const [open, setOpen] = useState(false);
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const phoneInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem("pricing_popup_shown")) return;
    if (window.innerWidth < 500) return;
    const t = setTimeout(() => {
      setOpen(true);
      sessionStorage.setItem("pricing_popup_shown", "true");
    }, 180000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    closeBtnRef.current?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!done) return;
    const t = setTimeout(() => setOpen(false), 3000);
    return () => clearTimeout(t);
  }, [done]);

  const validatePhone = (raw: string) => {
    const digits = raw.replace(/\D/g, "");
    const local = digits.length === 12 && digits.startsWith("91") ? digits.slice(2) : digits;
    if (local.length !== 10 || !/^[6-9]/.test(local)) return null;
    return local;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const local = validatePhone(phone);
    if (!local) {
      setError("Please enter a valid 10-digit Indian mobile number.");
      phoneInputRef.current?.focus();
      return;
    }
    if (name.trim().length > 100) {
      setError("Name is too long.");
      return;
    }
    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const payload = {
        phone: local,
        name: name.trim() || null,
        source: "pricing_popup",
        ...(user?.id ? { user_id: user.id } : {}),
      };
      const { error: insertError } = await supabase
        .from("callback_requests")
        .insert(payload);
      if (insertError) throw insertError;
      toast.success("Callback scheduled ✓");
      setDone(`+91 ${local.slice(0, 5)} ${local.slice(5)}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Could not submit. Please try again.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <>
      <div
        onClick={() => setOpen(false)}
        aria-hidden
        style={{
          position: "fixed", inset: 0, zIndex: 9999,
          background: "rgba(14,14,14,0.7)",
          backdropFilter: "blur(8px)",
        }}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="fyn-popup-title"
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
          width: "min(760px, 95vw)", maxHeight: "92vh", overflowY: "auto",
          background: C.card, borderRadius: 24, border: `1px solid ${C.border}`,
          boxShadow: "0 40px 90px rgba(0,0,0,0.35)", zIndex: 10000, padding: 40,
          fontFamily: "'Satoshi', sans-serif", color: C.ink,
        }}
      >
        <button
          ref={closeBtnRef}
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close"
          style={{
            position: "absolute", top: 16, right: 16, width: 36, height: 36,
            borderRadius: "50%", border: `1px solid ${C.border}`, background: C.panel,
            color: C.ink, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <XIcon size={16} />
        </button>

        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 20 }}>
          <div>
            <h2 id="fyn-popup-title" style={{ fontFamily: "'Clash Display',sans-serif", fontSize: 32, fontWeight: 600, letterSpacing: "-0.035em", lineHeight: 1.1 }}>
              Need help choosing the right plan?
            </h2>
            <p style={{ marginTop: 12, fontSize: 15.5, color: C.body, lineHeight: 1.6 }}>
              Quick 15-minute call with <strong style={{ color: C.ink }}>Tarun or Fynny</strong>, real founders, not sales reps.
            </p>

            {done ? (
              <div role="status" style={{
                marginTop: 20, padding: "16px 20px", background: "rgba(16,185,129,0.1)",
                border: `1px solid ${C.green}`, borderRadius: 12, color: C.ink,
              }}>
                <div style={{ fontWeight: 700, marginBottom: 4 }}>✓ Got it!</div>
                We'll call you at <strong>{done}</strong> within 2 hours.
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 10 }}>
                <input
                  type="text"
                  placeholder="Your name (optional)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={100}
                  style={{
                    padding: "12px 18px", borderRadius: 100, border: `1px solid ${C.border}`,
                    background: "#fff", fontSize: 14.5, fontFamily: "'Satoshi',sans-serif", outline: "none", color: C.ink,
                  }}
                />
                <input
                  ref={phoneInputRef}
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  required
                  maxLength={15}
                  placeholder="Your phone number"
                  aria-label="Phone number"
                  value={phone}
                  onChange={(e) => { setPhone(e.target.value); if (error) setError(null); }}
                  style={{
                    padding: "12px 18px", borderRadius: 100, border: `1px solid ${C.border}`,
                    background: "#fff", fontSize: 14.5, fontFamily: "'Satoshi',sans-serif", outline: "none", color: C.ink,
                  }}
                />
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    marginTop: 4, padding: "14px 22px", borderRadius: 100, background: C.red, color: "#fff",
                    border: "none", cursor: submitting ? "not-allowed" : "pointer", opacity: submitting ? 0.7 : 1,
                    fontWeight: 700, fontSize: 14.5, fontFamily: "'Satoshi',sans-serif",
                  }}
                >
                  {submitting ? "Scheduling…" : "Call me back"}
                </button>
              </form>
            )}

            {error && !done && (
              <p role="alert" style={{ marginTop: 12, color: C.red, fontSize: 13.5 }}>{error}</p>
            )}
            {!done && (
              <p style={{ marginTop: 12, fontSize: 12.5, color: C.muted }}>
                We'll call you within 2 hours during business hours (9 AM – 7 PM IST).
              </p>
            )}

            <div style={{ marginTop: 16, display: "flex", alignItems: "center", justifyContent: "center", opacity: 0.85 }}>
              <FYNIcon name="callback" size={48} animated={false} title="Callback" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
