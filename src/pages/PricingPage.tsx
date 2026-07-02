import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion, useInView, useMotionValue, useTransform, animate } from "framer-motion";
import { Check, ChevronDown, Users, Bot, Coins } from "lucide-react";
import Layout from "@/components/Layout";
import FYNIcon from "@/components/FYNIcon";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/* ================================================================
   FYNHelp Pricing Page, brand palette only
   Ink #1A1008 | Red #C41E1E | Beige #F4EDDA | Gold #8B6914
   Fonts: Oswald, Raleway, Roboto, DM Sans
================================================================ */

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
    badge: "POPULAR",
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
    a: "First 100 waitlist founders get 30 days free. After that, we may offer 14-day trials.",
  },
];

/* ----------------------- Small primitives ----------------------- */

function Sparkles() {
  // 18 deterministic gold particles
  const dots = Array.from({ length: 18 }, (_, i) => {
    const left = (i * 53) % 100;
    const top = (i * 37) % 100;
    const size = 4 + (i % 3) * 2;
    const dur = 12 + (i % 7) * 1.2;
    const delay = (i % 8) * 1.1;
    return { left, top, size, dur, delay, i };
  });
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {dots.map((d) => (
        <span
          key={d.i}
          className="fyn-sparkle"
          style={{
            left: `${d.left}%`,
            top: `${d.top}%`,
            width: d.size,
            height: d.size,
            animationDuration: `${d.dur}s`,
            animationDelay: `-${d.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

function Counter({ to, prefix = "", suffix = "" }: { to: number; prefix?: string; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const mv = useMotionValue(0);
  const rounded = useTransform(mv, (v) => `${prefix}${Math.round(v).toLocaleString("en-IN")}${suffix}`);
  const [text, setText] = useState(`${prefix}0${suffix}`);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(mv, to, { duration: 1.6, ease: [0.22, 1, 0.36, 1] });
    const unsub = rounded.on("change", (v) => setText(v));
    return () => {
      controls.stop();
      unsub();
    };
  }, [inView, to, mv, rounded]);

  return <span ref={ref}>{text}</span>;
}

/* ============================ Page ============================ */

export default function PricingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [email, setEmail] = useState("");
  const [isAnnual, setIsAnnual] = useState(false);
  const [clientCount, setClientCount] = useState(35);

  const baseMonthly = isAnnual ? 3999 : 4999;
  const extraClients = Math.max(0, clientCount - 20);
  const extraCost = extraClients * 99;
  const totalMonthly = baseMonthly + extraCost;
  const perClientCost = Math.round(totalMonthly / clientCount);


  return (
    <Layout>
      {/* Local styles, sparkles, gradient bg, accents */}
      <style>{`
        .fyn-bg-anim {
          background: linear-gradient(145deg, #F4EDDA 0%, #E8DCC4 30%, #F4EDDA 60%, #D4C4A8 100%);
          background-size: 200% 200%;
          animation: fynBgShift 22s ease-in-out infinite alternate;
        }
        @keyframes fynBgShift {
          0% { background-position: 0% 0%; }
          100% { background-position: 100% 100%; }
        }
        .fyn-sparkle {
          position: absolute;
          border-radius: 9999px;
          background: radial-gradient(circle, rgba(139,105,20,0.55) 0%, rgba(139,105,20,0) 70%);
          opacity: 0.55;
          animation-name: fynFloat;
          animation-iteration-count: infinite;
          animation-timing-function: ease-in-out;
        }
        @keyframes fynFloat {
          0% { transform: translate(0,0) scale(1); opacity: 0.15; }
          50% { opacity: 0.55; }
          100% { transform: translate(40px,-120px) scale(1.2); opacity: 0; }
        }
        .fyn-blob {
          position: absolute;
          border-radius: 9999px;
          filter: blur(50px);
          animation: fynBlob 14s ease-in-out infinite;
        }
        @keyframes fynBlob {
          0%, 100% { transform: translate(0,0) scale(1); }
          50% { transform: translate(20px,-15px) scale(1.15); }
        }
        .fyn-pulse-soft {
          animation: fynPulseSoft 2.4s ease-in-out infinite;
        }
        @keyframes fynPulseSoft {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.06); }
        }
        .fyn-underline-gold {
          background-image: linear-gradient(90deg, #8B6914 0%, #A67C1A 100%);
          background-repeat: no-repeat;
          background-size: 100% 2px;
          background-position: 0 100%;
          padding-bottom: 2px;
        }
        .fyn-glass {
          background: rgba(255,255,255,0.72);
          backdrop-filter: blur(20px) saturate(110%);
          -webkit-backdrop-filter: blur(20px) saturate(110%);
        }
        @media (prefers-reduced-motion: reduce) {
          .fyn-bg-anim, .fyn-sparkle, .fyn-blob, .fyn-pulse-soft { animation: none !important; }
        }
      `}</style>

      {/* ========================= HERO + CARDS ========================= */}
      <section className="fyn-bg-anim relative overflow-hidden pt-20 pb-24 px-6">
        <Sparkles />

        <div className="relative z-10 max-w-[900px] mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="font-display font-bold text-[32px] md:text-[38px] lg:text-[52px] leading-[1.2] text-fyn-ink mb-5"
            style={{ letterSpacing: "-0.5px", color: "#1A1008" }}
          >
            Simple pricing. Powerful insights.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-subheading text-base md:text-[18px] lg:text-[20px] mx-auto"
            style={{
              color: "#8B6914",
              lineHeight: 1.6,
              letterSpacing: "0.3px",
              maxWidth: "900px",
              marginBottom: "60px",
            }}
          >
            All plans include enterprise-grade security and the financial insights you need to make better decisions.
          </motion.p>
        </div>

        <EngagementPopup />

        <div className="relative z-10 max-w-6xl mx-auto mt-14 grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((p, idx) => {
            const isPro = p.highlight;
            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.55, delay: idx * 0.08, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -10, scale: 1.015 }}
                className={`fyn-glass relative flex flex-col p-10 rounded-[32px] transition-shadow duration-300 ${
                  isPro
                    ? "border-2 border-fyn-red shadow-[0_30px_80px_rgba(196,30,30,0.18)]"
                    : "border border-fyn-gold/20 shadow-[0_20px_60px_rgba(26,16,8,0.06)] hover:shadow-[0_30px_80px_rgba(26,16,8,0.12)]"
                }`}
              >
                {p.badge && (
                  <span
                    className="absolute -top-4 left-1/2 -translate-x-1/2 font-button font-bold text-[12px] uppercase tracking-[1px] text-white px-6 py-2 rounded-full shadow-[0_4px_16px_rgba(196,30,30,0.35)]"
                    style={{ background: "linear-gradient(135deg,#C41E1E 0%,#8B6914 100%)" }}
                  >
                    {p.badge}
                  </span>
                )}

                <div className="font-subheading font-semibold text-sm uppercase tracking-[1px] text-fyn-gold mb-3">
                  {p.name}
                </div>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="font-display font-bold text-[52px] leading-none text-fyn-ink">
                    {p.price}
                  </span>
                  {p.priceSuffix && (
                    <span className="font-body text-sm text-fyn-ink/60">{p.priceSuffix}</span>
                  )}
                </div>
                <p className="font-body text-sm text-fyn-ink/70 mb-6">{p.subline}</p>

                <ul className="space-y-4 mb-10 flex-1">
                  {p.features.map((f, i) => (
                    <motion.li
                      key={f}
                      initial={{ opacity: 0, x: -8 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.35, delay: 0.1 + i * 0.04 }}
                      className="flex items-start gap-3"
                    >
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-fyn-gold text-white">
                        <Check className="h-3 w-3" strokeWidth={3} />
                      </span>
                      <span
                        className={`font-body text-[15px] leading-relaxed ${
                          f.endsWith(":") ? "font-semibold text-fyn-ink" : "text-fyn-ink/85"
                        }`}
                      >
                        {f}
                      </span>
                    </motion.li>
                  ))}
                </ul>

                <CTAButton plan={p} />
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ========================= CA FIRM PLAN ========================= */}
      <section className="fyn-bg-anim relative overflow-hidden px-6 py-24">
        <Sparkles />
        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="font-subheading font-semibold text-xs uppercase tracking-[2px] text-fyn-gold mb-4">
              For Chartered Accountants
            </div>
            <h2
              className="font-display font-bold text-[32px] md:text-[42px] lg:text-[52px] leading-[1.2] text-fyn-ink mb-4"
              style={{ letterSpacing: "-0.5px" }}
            >
              One plan. Every CA firm.
            </h2>
            <p className="font-body text-base md:text-lg text-fyn-ink/70 max-w-2xl mx-auto">
              20 client seats included. Add more as you grow.
            </p>

            {/* Billing toggle */}
            <div className="mt-8 inline-flex items-center gap-4 fyn-glass rounded-full px-2 py-2 border border-fyn-gold/20">
              <button
                type="button"
                onClick={() => setIsAnnual(false)}
                className={`font-button font-semibold text-sm px-5 py-2 rounded-full transition-all ${
                  !isAnnual ? "bg-fyn-ink text-fyn-beige" : "text-fyn-ink/60 hover:text-fyn-ink"
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setIsAnnual(true)}
                className={`font-button font-semibold text-sm px-5 py-2 rounded-full transition-all inline-flex items-center gap-2 ${
                  isAnnual ? "bg-fyn-ink text-fyn-beige" : "text-fyn-ink/60 hover:text-fyn-ink"
                }`}
              >
                Annual
                <span
                  className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full"
                  style={{ background: "#10B981", color: "#FFFFFF" }}
                >
                  Save 20%
                </span>
              </button>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="fyn-glass relative rounded-[32px] p-10 border-2 border-fyn-gold shadow-[0_30px_80px_rgba(139,105,20,0.18)]"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* Left column: price + CTAs */}
              <div className="flex flex-col">
                <div className="font-subheading font-semibold text-sm uppercase tracking-[1px] text-fyn-gold mb-3">
                  CA Partner Plan
                </div>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="font-display font-bold text-[52px] leading-none text-fyn-ink">
                    ₹{isAnnual ? "3,999" : "4,999"}
                  </span>
                  <span className="font-body text-sm text-fyn-ink/60">
                    {isAnnual ? "/month, billed annually" : "/month"}
                  </span>
                </div>
                {isAnnual && (
                  <p className="font-body text-sm text-fyn-gold mb-2">
                    ₹47,988/year — save ₹11,988
                  </p>
                )}
                <div className="mt-4 mb-3">
                  <span
                    className="inline-block font-button font-semibold text-sm px-4 py-2 rounded-full"
                    style={{ background: "rgba(139,105,20,0.15)", color: "#8B6914" }}
                  >
                    Includes 20 client seats free
                  </span>
                </div>
                <p className="font-body text-sm text-fyn-ink/60 mb-8">
                  ₹99 per additional client per month
                </p>

                <div className="mt-auto space-y-3">
                  <Link
                    to="/waitlist"
                    className="block text-center w-full font-button font-bold text-base uppercase tracking-[0.5px] py-4 rounded-[16px] text-white shadow-[0_8px_24px_rgba(196,30,30,0.35)] hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(196,30,30,0.45)] transition-all"
                    style={{ background: "linear-gradient(135deg,#C41E1E 0%,#8B6914 100%)" }}
                  >
                    Join CA Waitlist
                  </Link>
                  <Link
                    to="/ca/register"
                    className="block text-center w-full font-button font-bold text-base uppercase tracking-[0.5px] py-4 rounded-[16px] border-2 border-fyn-ink text-fyn-ink hover:bg-fyn-ink hover:text-fyn-beige hover:-translate-y-0.5 transition-all"
                  >
                    Register as CA Partner →
                  </Link>
                  <p className="font-body text-xs text-fyn-ink/60 text-center pt-2">
                    Early access CA firms: 3 months free on sign-up. No credit card required.
                  </p>
                </div>
              </div>

              {/* Right column: features + calculator */}
              <div className="flex flex-col">
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 mb-8">
                  {[
                    "Client portfolio dashboard",
                    "White-label reports",
                    "GST filing calendar",
                    "Portfolio health AI",
                    "ITC reconciliation",
                    "Compliance risk alerts",
                    "Bulk GST filing",
                    "TDS tracker",
                    "5 CA team seats",
                    "Priority support",
                  ].map((f) => (
                    <li key={f} className="flex items-start gap-2.5">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-fyn-gold text-white">
                        <Check className="h-3 w-3" strokeWidth={3} />
                      </span>
                      <span className="font-body text-[14px] leading-relaxed text-fyn-ink/85">
                        {f}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="pt-6 border-t border-fyn-gold/20">
                  <div className="font-subheading font-semibold text-sm text-fyn-ink mb-4">
                    Estimate your cost
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="font-body text-sm text-fyn-ink/70">Number of clients</label>
                    <span className="font-button font-bold text-lg text-fyn-ink tabular-nums">
                      {clientCount}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={200}
                    step={1}
                    value={clientCount}
                    onChange={(e) => setClientCount(Number(e.target.value))}
                    className="w-full accent-fyn-gold"
                  />

                  <div
                    className="mt-5 rounded-2xl p-5 space-y-3"
                    style={{ background: "rgba(232,220,196,0.5)" }}
                  >
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-body text-fyn-ink/75">
                        Base plan (20 clients included)
                      </span>
                      <span className="font-button font-semibold text-fyn-ink tabular-nums">
                        ₹{baseMonthly.toLocaleString("en-IN")}/mo
                      </span>
                    </div>
                    {extraClients > 0 ? (
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-body text-fyn-ink/75">
                          {extraClients} additional clients × ₹99
                        </span>
                        <span className="font-button font-semibold text-fyn-ink tabular-nums">
                          ₹{extraCost.toLocaleString("en-IN")}/mo
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-body text-fyn-ink/75">
                          {20 - clientCount} free seats still available
                        </span>
                        <span
                          className="font-button font-semibold tabular-nums"
                          style={{ color: "#10B981" }}
                        >
                          ₹0
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between pt-3 border-t border-fyn-ink/10">
                      <span className="font-subheading font-bold text-fyn-ink">Total per month</span>
                      <span className="font-button font-bold text-fyn-ink tabular-nums">
                        ₹{totalMonthly.toLocaleString("en-IN")}/mo · ₹{perClientCost}/client
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>


      {/* ========================= WAITLIST WIDGET ========================= */}
      <section
        className="relative overflow-hidden px-6 py-28 md:py-32"
        style={{
          background:
            "linear-gradient(145deg, #1A1008 0%, rgba(26,16,8,0.92) 40%, rgba(139,105,20,0.25) 70%, rgba(196,30,30,0.20) 100%)",
        }}
      >
        {/* floating gradient blobs */}
        <span
          className="fyn-blob"
          style={{ width: 280, height: 280, left: "8%", top: "15%", background: "rgba(196,30,30,0.35)" }}
        />
        <span
          className="fyn-blob"
          style={{
            width: 220,
            height: 220,
            right: "10%",
            top: "20%",
            background: "rgba(139,105,20,0.45)",
            animationDelay: "-4s",
          }}
        />
        <span
          className="fyn-blob"
          style={{
            width: 180,
            height: 180,
            left: "20%",
            bottom: "10%",
            background: "rgba(244,237,218,0.18)",
            animationDelay: "-7s",
          }}
        />

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="font-display font-bold text-[32px] md:text-[38px] lg:text-[52px] mx-auto"
            style={{
              color: "#FFFFFF",
              lineHeight: 1.25,
              letterSpacing: "-0.5px",
              textShadow: "0 3px 12px rgba(0,0,0,0.3)",
              maxWidth: 1100,
              marginBottom: 28,
            }}
          >
            Ready for financial insights that work around the clock?
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-subheading mx-auto"
            style={{
              fontWeight: 400,
              fontSize: "clamp(16px, 1.5vw, 20px)",
              color: "rgba(244,237,218,0.95)",
              lineHeight: 1.65,
              letterSpacing: "0.3px",
              maxWidth: 900,
              marginBottom: 24,
            }}
          >
            Built for Indian startups, SMEs, and CA firms who want real financial intelligence — not just accounting software.
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="font-button font-semibold text-base md:text-lg mb-10 text-primary-foreground"
            style={{
              fontSize: "clamp(16px, 1.4vw, 18px)",
            }}
          >
            Start your{" "}
            <span
              style={{
                color: "#8B6914",
                textDecoration: "underline",
                textDecorationColor: "#8B6914",
                textDecorationThickness: "2px",
                textUnderlineOffset: "4px",
              }}
            >
              30 days free
            </span>{" "}
            today, no credit card required.
          </motion.p>

          <motion.form
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.25 }}
            onSubmit={(e) => {
              e.preventDefault();
              const url = `/waitlist${email ? `?email=${encodeURIComponent(email)}` : ""}`;
              window.location.href = url;
            }}
            className="relative z-10 mx-auto flex flex-col sm:flex-row items-stretch gap-3 sm:gap-0 max-w-2xl"
          >
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className="flex-1 outline-none font-body"
              style={{
                background: "rgba(244,237,218,0.12)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                border: "2px solid rgba(244,237,218,0.25)",
                borderRadius: 24,
                padding: "20px 28px",
                fontFamily: "'Roboto', sans-serif",
                fontWeight: 400,
                fontSize: 16,
                color: "#F4EDDA",
              }}
            />
            <motion.button
              whileHover={{ y: -2, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="font-button"
              style={{
                background: "linear-gradient(135deg,#C41E1E 0%,#8B6914 100%)",
                color: "#FFFFFF",
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 700,
                fontSize: 16,
                textTransform: "uppercase",
                letterSpacing: "1.2px",
                padding: "20px 48px",
                borderRadius: 24,
                border: "none",
                boxShadow: "0 8px 24px rgba(196,30,30,0.4)",
                cursor: "pointer",
              }}
            >
              Join Waitlist
            </motion.button>
          </motion.form>
        </div>
      </section>

      {/* ========================= COST COMPARISON ========================= */}
      <section className="fyn-bg-anim relative overflow-hidden px-6 py-28">
        <div className="relative z-10 max-w-6xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="font-display font-bold text-[36px] md:text-[48px] text-fyn-ink text-center mb-4 tracking-tight"
          >
            FYNHelp AI vs. Hiring a Team
          </motion.h2>
          <p className="font-subheading text-lg text-fyn-ink/70 text-center max-w-2xl mx-auto mb-16">
            See how much you save by choosing AI-powered financial intelligence over traditional hiring.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Human team column */}
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="fyn-glass rounded-[32px] overflow-hidden shadow-[0_20px_60px_rgba(26,16,8,0.08)]"
            >
              <div
                className="px-8 py-8 flex items-center justify-center gap-3 text-fyn-beige"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(26,16,8,0.92) 0%, rgba(26,16,8,1) 100%)",
                }}
              >
                <Users className="h-7 w-7" />
                <span className="font-subheading font-semibold text-2xl">Human Team</span>
              </div>
              <ul>
                {roles.map((r) => (
                  <li
                    key={r.role}
                    className="px-8 py-6 border-b border-fyn-ink/10 transition-colors hover:bg-fyn-gold/5"
                  >
                    <div className="font-subheading font-semibold text-fyn-ink text-lg mb-1">
                      {r.role}
                    </div>
                    <div className="font-button font-medium text-fyn-red text-base">{r.human}</div>
                  </li>
                ))}
                <li className="px-8 py-8 bg-fyn-beige/60">
                  <div className="font-subheading text-sm text-fyn-ink/70 mb-1">
                    Total Annual Cost
                  </div>
                  <div className="font-display font-bold text-[32px] text-fyn-red leading-none">
                    ₹57–92L<span className="text-base font-body text-fyn-ink/60">/year</span>
                  </div>
                </li>
              </ul>
            </motion.div>

            {/* FYNHelp column */}
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="fyn-glass relative rounded-[32px] overflow-hidden shadow-[0_20px_60px_rgba(196,30,30,0.15)]"
            >
              <div
                className="relative px-8 py-8 flex items-center justify-center gap-3 text-white"
                style={{ background: "linear-gradient(135deg,#C41E1E 0%,#8B6914 100%)" }}
              >
                <Bot className="h-7 w-7" />
                <span className="font-subheading font-semibold text-2xl">FYNHelp AI</span>
                <span className="fyn-pulse-soft absolute top-4 right-4 font-button font-bold text-xs uppercase tracking-wide bg-fyn-gold text-white px-3 py-1.5 rounded-xl">
                  Save 92%
                </span>
              </div>
              <ul>
                {roles.map((r) => (
                  <li
                    key={r.role}
                    className="px-8 py-6 border-b border-fyn-ink/10 transition-colors hover:bg-fyn-gold/5"
                  >
                    <div className="font-subheading font-semibold text-fyn-ink text-lg mb-1">
                      {r.role}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-button font-semibold text-fyn-gold text-base">
                        Included
                      </span>
                      <Check className="h-4 w-4 text-fyn-gold" strokeWidth={3} />
                    </div>
                    <div className="font-body text-[13px] text-fyn-ink/60 mt-0.5">{r.fyn}</div>
                  </li>
                ))}
                <li className="px-8 py-8 bg-fyn-beige/60">
                  <div className="font-subheading text-sm text-fyn-ink/70 mb-1">
                    FYNHelp Pro Plan
                  </div>
                  <div className="font-display font-bold text-[32px] text-fyn-gold leading-none">
                    ₹<Counter to={90000} />
                    <span className="text-base font-body text-fyn-ink/60">/year</span>
                  </div>
                </li>
              </ul>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-12 mx-auto flex items-center justify-center gap-3 flex-wrap"
            style={{
              width: "100%",
              maxWidth: 1200,
              padding: "28px 48px",
              borderRadius: 24,
              background: "linear-gradient(135deg, #8B6914 0%, rgba(139,105,20,0.85) 100%)",
              boxShadow: "0 12px 40px rgba(139,105,20,0.35)",
              border: "1px solid rgba(255,255,255,0.15)",
              textAlign: "center",
            }}
          >
            <Coins className="h-7 w-7 shrink-0" style={{ color: "#FFFFFF" }} />
            <span
              className="font-semibold text-lg font-sans md:text-4xl"
              style={{
                color: "#FFFFFF",
                lineHeight: 1.4,
                letterSpacing: "0.3px",
                textShadow: "0 2px 8px rgba(26,16,8,0.2)",
              }}
            >
              Save{" "}
              <span
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 700,
                  fontSize: "clamp(18px, 1.9vw, 26px)",
                  color: "#FFFFFF",
                }}
              >
                ₹56–91L
              </span>{" "}
              annually by choosing FYNHelp over hiring a full team
            </span>
          </motion.div>
        </div>
      </section>


      {/* ========================= FAQ ========================= */}
      <section className="fyn-bg-anim relative overflow-hidden px-6 pt-12 pb-28">
        <div className="relative z-10 max-w-3xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="font-display font-bold text-[36px] md:text-[42px] text-fyn-ink text-center mb-14 tracking-tight"
          >
            Frequently Asked Questions
          </motion.h2>

          <div className="space-y-5">
            {faqs.map((f, i) => {
              const open = openFaq === i;
              return (
                <motion.div
                  key={f.q}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  className="fyn-glass rounded-[20px] border border-fyn-gold/15 px-7 py-6 cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(26,16,8,0.08)]"
                  onClick={() => setOpenFaq(open ? null : i)}
                >
                  <button
                    type="button"
                    aria-expanded={open}
                    className="w-full flex items-center justify-between gap-4 text-left"
                  >
                    <span className="font-subheading font-semibold text-base md:text-lg text-fyn-ink">
                      {f.q}
                    </span>
                    <ChevronDown
                      className={`h-6 w-6 text-fyn-gold shrink-0 transition-transform duration-300 ${
                        open ? "rotate-180" : "rotate-0"
                      }`}
                    />
                  </button>
                  <motion.div
                    initial={false}
                    animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="overflow-hidden"
                  >
                    <p className="font-body text-fyn-ink/80 leading-relaxed pt-5 mt-5 border-t border-fyn-gold/15 text-[15px]">
                      {f.a}
                    </p>
                  </motion.div>
                </motion.div>
              );
            })}
          </div>

          <div className="text-center mt-14">
            <Link
              to="/waitlist"
              className="inline-block font-button font-bold uppercase tracking-wide text-white px-14 py-5 rounded-[18px] shadow-[0_8px_24px_rgba(196,30,30,0.4)] hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(196,30,30,0.5)] transition-all"
              style={{ background: "linear-gradient(135deg,#C41E1E 0%,#8B6914 100%)" }}
            >
              Join the Waitlist →
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}

/* ----------------------- helpers ----------------------- */

function CTAButton({ plan }: { plan: Plan }) {
  const base =
    "block text-center w-full font-button font-bold text-base uppercase tracking-[0.5px] py-4 rounded-[16px] transition-all duration-300";
  if (plan.ctaStyle === "gradient") {
    return plan.cta.external ? (
      <a
        href={plan.cta.href}
        className={`${base} text-white shadow-[0_8px_24px_rgba(196,30,30,0.35)] hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(196,30,30,0.45)]`}
        style={{ background: "linear-gradient(135deg,#C41E1E 0%,#8B6914 100%)" }}
      >
        {plan.cta.label}
      </a>
    ) : (
      <Link
        to={plan.cta.href}
        className={`${base} text-white shadow-[0_8px_24px_rgba(196,30,30,0.35)] hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(196,30,30,0.45)]`}
        style={{ background: "linear-gradient(135deg,#C41E1E 0%,#8B6914 100%)" }}
      >
        {plan.cta.label}
      </Link>
    );
  }
  if (plan.ctaStyle === "outline-ink") {
    return plan.cta.external ? (
      <a
        href={plan.cta.href}
        className={`${base} border-2 border-fyn-ink text-fyn-ink hover:bg-fyn-ink hover:text-fyn-beige hover:-translate-y-0.5`}
      >
        {plan.cta.label}
      </a>
    ) : (
      <Link
        to={plan.cta.href}
        className={`${base} border-2 border-fyn-ink text-fyn-ink hover:bg-fyn-ink hover:text-fyn-beige hover:-translate-y-0.5`}
      >
        {plan.cta.label}
      </Link>
    );
  }
  // outline-red
  return (
    <Link
      to={plan.cta.href}
      className={`${base} border-2 border-fyn-red text-fyn-red hover:bg-fyn-red hover:text-white hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(196,30,30,0.3)]`}
    >
      {plan.cta.label}
    </Link>
  );
}

/* ====================== Engagement Popup ====================== */

function EngagementPopup() {
  const [open, setOpen] = useState(false);
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const phoneInputRef = useRef<HTMLInputElement>(null);

  // 3-minute trigger, once per session, skip if very small screens
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

  // ESC + body scroll lock + focus
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    closeBtnRef.current?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Auto-close 3s after success
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
      <style>{`
        @keyframes fynPopupBackdrop { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fynPopupIn {
          from { opacity: 0; transform: translate(-50%, calc(-50% + 24px)); }
          to   { opacity: 1; transform: translate(-50%, -50%); }
        }
        .fyn-popup-backdrop {
          position: fixed; inset: 0; z-index: 9999;
          background: rgba(26,16,8,0.7);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          animation: fynPopupBackdrop 300ms ease-out;
        }
        .fyn-popup {
          position: fixed; top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          width: min(900px, 95vw);
          max-height: 92vh;
          overflow-y: auto;
          background:
            linear-gradient(135deg,
              #1A1008 0%,
              rgba(26,16,8,0.95) 40%,
              rgba(196,30,30,0.30) 70%,
              rgba(139,105,20,0.30) 100%);
          border-radius: 28px;
          box-shadow: 0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(244,237,218,0.08);
          animation: fynPopupIn 400ms cubic-bezier(0.34, 1.56, 0.64, 1);
          z-index: 10000;
        }
        .fyn-popup-close {
          position: absolute; top: 20px; right: 20px;
          width: 44px; height: 44px;
          background: rgba(255,255,255,0.10);
          border: 1px solid rgba(244,237,218,0.18);
          border-radius: 50%;
          color: #FFFFFF;
          font-size: 22px; line-height: 1;
          cursor: pointer; z-index: 10;
          display: inline-flex; align-items: center; justify-content: center;
          transition: background 0.25s ease, transform 0.3s ease;
        }
        .fyn-popup-close:hover {
          background: rgba(196,30,30,0.85);
          transform: rotate(90deg);
        }
        .fyn-popup-grid {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 40px;
          padding: 48px 56px;
        }
        .fyn-popup-input {
          flex: 1 1 240px;
          min-width: 0;
          height: 54px;
          background: rgba(255,255,255,0.12);
          border: 1px solid rgba(244,237,218,0.30);
          border-radius: 12px;
          padding: 0 20px;
          font-family: 'Roboto', sans-serif;
          font-size: 16px;
          color: #FFFFFF;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
        }
        .fyn-popup-input::placeholder { color: rgba(244,237,218,0.5); }
        .fyn-popup-input:focus {
          border: 2px solid #8B6914;
          background: rgba(255,255,255,0.16);
          box-shadow: 0 0 0 4px rgba(139,105,20,0.15);
          padding: 0 19px;
        }
        .fyn-popup-cta {
          height: 54px;
          padding: 0 36px;
          background: linear-gradient(135deg, #C41E1E 0%, #8B6914 100%);
          color: #FFFFFF;
          font-family: 'DM Sans', sans-serif;
          font-weight: 700;
          font-size: 16px;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          box-shadow: 0 8px 24px rgba(196,30,30,0.4);
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          white-space: nowrap;
        }
        .fyn-popup-cta:hover:not(:disabled) {
          background: linear-gradient(135deg, #991B1B 0%, #6B4E10 100%);
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(196,30,30,0.55);
        }
        .fyn-popup-cta:disabled { opacity: 0.7; cursor: not-allowed; }
        .fyn-stat-card {
          background: rgba(255,255,255,0.10);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(244,237,218,0.12);
          border-radius: 16px;
          padding: 14px 18px;
          display: flex; align-items: center; gap: 14px;
        }
        .fyn-stat-icon {
          width: 40px; height: 40px;
          border-radius: 12px;
          background: linear-gradient(135deg, rgba(139,105,20,0.35), rgba(196,30,30,0.25));
          display: inline-flex; align-items: center; justify-content: center;
          color: #F4EDDA;
          flex-shrink: 0;
        }
        @media (max-width: 768px) {
          .fyn-popup-grid {
            grid-template-columns: 1fr;
            gap: 28px;
            padding: 36px 28px;
          }
          .fyn-popup-headline { font-size: 32px !important; }
          .fyn-popup-form { flex-direction: column !important; }
          .fyn-popup-cta, .fyn-popup-input { width: 100% !important; }
          .fyn-popup-right { order: 2; }
        }
      `}</style>

      <div
        className="fyn-popup-backdrop"
        onClick={() => setOpen(false)}
        aria-hidden
      />
      <div
        className="fyn-popup"
        role="dialog"
        aria-modal="true"
        aria-labelledby="fyn-popup-title"
        aria-describedby="fyn-popup-desc"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          ref={closeBtnRef}
          type="button"
          className="fyn-popup-close"
          aria-label="Close"
          onClick={() => setOpen(false)}
        >
          ✕
        </button>

        <div className="fyn-popup-grid">
          {/* LEFT, text + form */}
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <h2
              id="fyn-popup-title"
              className="fyn-popup-headline"
              style={{
                fontFamily: "'Oswald', sans-serif",
                fontWeight: 700,
                fontSize: 42,
                lineHeight: 1.15,
                letterSpacing: "-0.5px",
                color: "#FFFFFF",
                marginBottom: 16,
                textShadow: "0 2px 12px rgba(0,0,0,0.3)",
              }}
            >
              Need help choosing the right plan?
            </h2>
            <p
              id="fyn-popup-desc"
              style={{
                fontFamily: "'Raleway', sans-serif",
                fontWeight: 400,
                fontSize: 18,
                lineHeight: 1.6,
                color: "rgba(244,237,218,0.95)",
                marginBottom: 12,
              }}
            >
              Quick 15-minute call with <strong style={{ color: "#FFFFFF", fontWeight: 600 }}>Tarun or Fynny</strong>, real founders, not sales reps. Honest advice on what'll work for your business.
            </p>
            <p
              style={{
                fontFamily: "'Roboto', sans-serif",
                fontWeight: 500,
                fontSize: 15,
                color: "#D6A93B",
                marginBottom: 28,
                display: "flex", alignItems: "center", gap: 8,
              }}
            >
              <span
                aria-hidden
                style={{
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  width: 22, height: 22, borderRadius: "50%",
                  background: "rgba(139,105,20,0.25)", color: "#F4EDDA",
                  fontSize: 13, fontWeight: 700,
                }}
              >✓</span>
              Talk to our founders before you commit.
            </p>

            {done ? (
              <div
                role="status"
                style={{
                  background: "rgba(244,237,218,0.10)",
                  border: "1px solid rgba(139,105,20,0.5)",
                  borderRadius: 14,
                  padding: "20px 22px",
                  color: "#F4EDDA",
                  fontFamily: "'Raleway', sans-serif",
                  fontSize: 16,
                  lineHeight: 1.5,
                  animation: "fade-in 300ms ease-out",
                }}
              >
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, marginBottom: 6, color: "#FFFFFF" }}>
                  ✓ Got it!
                </div>
                We'll call you at <strong>{done}</strong> within 2 hours.
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="fyn-popup-form"
                style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "stretch" }}
              >
                <input
                  ref={phoneInputRef}
                  className="fyn-popup-input"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  required
                  maxLength={15}
                  placeholder="Your phone number"
                  aria-label="Phone number"
                  value={phone}
                  onChange={(e) => { setPhone(e.target.value); if (error) setError(null); }}
                  style={{ width: 240 }}
                />
                <button
                  type="submit"
                  className="fyn-popup-cta"
                  disabled={submitting}
                >
                  {submitting ? "Scheduling…" : "Call me back"}
                </button>
              </form>
            )}

            {error && !done && (
              <p
                role="alert"
                style={{
                  marginTop: 12,
                  fontFamily: "'Roboto', sans-serif",
                  fontSize: 14,
                  color: "#FCA5A5",
                }}
              >
                {error}
              </p>
            )}

            {!done && (
              <p
                style={{
                  marginTop: 16,
                  fontFamily: "'Roboto', sans-serif",
                  fontSize: 13,
                  color: "rgba(244,237,218,0.7)",
                  lineHeight: 1.5,
                }}
              >
                We'll call you within 2 hours during business hours (9 AM – 7 PM IST).
              </p>
            )}
          </div>

          {/* RIGHT, stats panel */}
          <div
            className="fyn-popup-right"
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              gap: 12,
            }}
          >
            {/* Trust stats: only kept honest ones */}

            <div className="fyn-stat-card">
              <span className="fyn-stat-icon" aria-hidden>
                {/* Mini India outline */}
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round">
                  <path d="M7 3 L17 4 L19 9 L17 12 L19 15 L15 18 L13 22 L11 18 L9 17 L6 14 L8 11 L5 8 Z" />
                </svg>
              </span>
              <div>
                <div style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 700, fontSize: 24, color: "#FFFFFF", lineHeight: 1.1 }}>
                  100%
                </div>
                <div style={{ fontFamily: "'Roboto', sans-serif", fontSize: 13, color: "rgba(244,237,218,0.75)", marginTop: 2 }}>
                  India-based founders, not a call centre
                </div>
              </div>
            </div>

            {/* Subtle FYN callback icon as bottom anchor */}
            <div style={{ display: "flex", justifyContent: "center", marginTop: 8, opacity: 0.85 }}>
              <FYNIcon name="callback" size={56} animated={false} title="Callback" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

