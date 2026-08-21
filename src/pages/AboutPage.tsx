import { useEffect, useRef, useState } from "react";
import { Link } from "@/lib/router-compat";
import { Helmet } from "react-helmet-async";
import {
  Check, XCircle, CheckCircle2, ArrowRight, Sparkles, AlertTriangle,
  TimerOff, Lightbulb, Linkedin, Clock, Shield,
} from "lucide-react";
import Layout from "@/components/Layout";
import ProblemSection from "@/components/home/ProblemSection";

/* ================================================================
   FynHelp — About (restyled to match HomePage design system)
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

const STYLES = `
  .ab-page { background: ${C.bg}; color: ${C.ink}; font-family: 'Satoshi', system-ui, sans-serif; min-height: 100vh; }
  .ab-page * { box-sizing: border-box; }
  .ab-page :where(h1,h2,h3,h4,h5,h6) { font-family: 'Clash Display', sans-serif; font-weight: 600; letter-spacing: -0.035em; line-height: 1.06; color: ${C.ink}; margin: 0; }
  .ab-container { max-width: 1180px; margin: 0 auto; padding: 0 24px; }
  .num { font-variant-numeric: tabular-nums; }

  /* Hero */
  .ab-hero { padding: 96px 0 64px; text-align: center; }
  .ab-hero h1 { font-size: clamp(44px, 8vw, 96px); }
  .ab-hero h1 .word { display: inline-block; opacity: 0; filter: blur(10px); transform: translateY(.4em);
    animation: ab-word 1s cubic-bezier(.16,1,.3,1) forwards; }
  @keyframes ab-word { to { opacity: 1; filter: blur(0); transform: translateY(0); } }
  .ab-hero .sub { max-width: 720px; margin: 28px auto 0; font-size: 20px; line-height: 1.55; color: ${C.body}; opacity: 0; animation: ab-fade 1s cubic-bezier(.16,1,.3,1) 0.9s forwards; }
  @keyframes ab-fade { to { opacity: 1; } }
  .ab-hero .badges { margin-top: 36px; display: inline-flex; flex-wrap: wrap; gap: 22px; justify-content: center; opacity: 0; animation: ab-fade 1s cubic-bezier(.16,1,.3,1) 1.15s forwards; }
  .ab-hero .badges .b { display: inline-flex; align-items: center; gap: 8px; font-size: 13.5px; color: ${C.muted}; font-weight: 600; }

  .ab-section { padding: 96px 0; overflow-x: clip; }
  .ab-section h2 { font-size: clamp(34px, 5vw, 60px); text-align: center; }
  .ab-section .lead { text-align: center; color: ${C.muted}; font-size: 17px; margin: 16px auto 0; max-width: 660px; line-height: 1.55; }

  /* Comparison */
  .ab-cmp { display: grid; gap: 20px; grid-template-columns: 1fr; margin-top: 48px; }
  @media (min-width: 900px) { .ab-cmp { grid-template-columns: 1fr 1fr; } }
  .ab-cmp .col { background: ${C.card}; border: 1px solid ${C.border}; border-radius: 20px; padding: 32px; }
  .ab-cmp .col.dark { background: ${C.black}; color: #fff; border-color: ${C.black}; }
  .ab-cmp .col .lbl { font-family: 'Satoshi',sans-serif; font-size: 11.5px; font-weight: 800; letter-spacing: 0.16em; text-transform: uppercase; color: ${C.muted}; text-align: center; }
  .ab-cmp .col.dark .lbl { color: rgba(255,255,255,0.55); }
  .ab-cmp ul { list-style: none; padding: 0; margin: 24px 0 0; display: flex; flex-direction: column; gap: 12px; }
  .ab-cmp li { display: flex; gap: 12px; padding: 14px 16px; background: ${C.panel}; border: 1px solid ${C.panelBorder}; border-radius: 12px; font-size: 15px; color: ${C.body}; align-items: flex-start; line-height: 1.5; }
  .ab-cmp .col.dark li { background: rgba(255,255,255,0.04); border-color: rgba(255,255,255,0.08); color: rgba(255,255,255,0.9); }
  .ab-cmp li svg { flex-shrink: 0; margin-top: 2px; }

  /* Vision cards */
  .ab-vision { display: grid; grid-template-columns: 1fr; gap: 16px; margin-top: 40px; max-width: 900px; margin-left: auto; margin-right: auto; }
  @media (min-width: 780px) { .ab-vision { grid-template-columns: 1fr 60px 1fr; align-items: stretch; } }
  .ab-vision-card { background: ${C.card}; border: 1px solid ${C.border}; border-radius: 20px; padding: 28px; text-align: center; }
  .ab-vision-card.center { background: ${C.red}; color: #fff; border-color: ${C.red}; }
  .ab-vision-card .ico { width: 56px; height: 56px; border-radius: 50%; background: ${C.panel}; margin: 0 auto 14px; display: flex; align-items: center; justify-content: center; }
  .ab-vision-card.center .ico { background: rgba(255,255,255,0.15); }
  .ab-vision-card p { font-family: 'Clash Display',sans-serif; font-weight: 600; font-size: 16px; letter-spacing: -0.02em; white-space: pre-line; line-height: 1.3; margin: 0; }
  .ab-vision-arrow { display: none; align-items: center; justify-content: center; color: ${C.red}; }
  @media (min-width: 780px) { .ab-vision-arrow { display: flex; } }

  /* Dark story band */
  .ab-story-band { background: ${C.black}; color: #fff; padding: 120px 0; position: relative; overflow: hidden; }
  .ab-story-band h2, .ab-story-band .lead { color: #fff; }
  .ab-story-band .lead { color: rgba(255,255,255,0.65); }

  /* Timeline */
  .ab-timeline { position: relative; max-width: 780px; margin: 56px auto 0; padding-left: 56px; }
  .ab-timeline-track { position: absolute; left: 19px; top: 0; bottom: 0; width: 2px; background: rgba(255,255,255,0.08); border-radius: 2px; }
  .ab-timeline-track > i { display: block; position: absolute; left: 0; right: 0; top: 0; background: ${C.red}; height: 0; will-change: height, top; box-shadow: 0 0 12px ${C.red}; border-radius: 2px; }
  .ab-tl-item { position: relative; padding: 22px 0 22px 8px; }
  .ab-tl-item + .ab-tl-item { border-top: 1px solid rgba(255,255,255,0.06); }
  .ab-tl-dot { position: absolute; left: -44px; top: 26px; width: 16px; height: 16px; border-radius: 50%; background: rgba(255,255,255,0.15); border: 2px solid rgba(255,255,255,0.25); transition: background .3s, border-color .3s, box-shadow .3s; }
  .ab-tl-item.on .ab-tl-dot { background: ${C.red}; border-color: ${C.red}; box-shadow: 0 0 0 6px rgba(184,51,58,0.18); }
  .ab-tl-year { display: inline-block; font-family: 'JetBrains Mono', monospace; font-size: 11.5px; font-weight: 700; letter-spacing: 0.14em; color: ${C.red}; padding: 4px 10px; border-radius: 100px; background: rgba(184,51,58,0.14); margin-bottom: 10px; font-variant-numeric: tabular-nums; }
  .ab-tl-title { font-family: 'Clash Display', sans-serif; font-size: 22px; font-weight: 600; letter-spacing: -0.02em; margin: 0 0 8px; color: #fff; }
  .ab-tl-desc { font-size: 15px; color: rgba(255,255,255,0.72); line-height: 1.6; margin: 0; }

  .ab-story-quote { max-width: 720px; margin: 48px auto 0; background: rgba(184,51,58,0.10); border-left: 3px solid ${C.red}; border-radius: 12px; padding: 24px 28px; }
  .ab-story-quote p { font-family: 'Clash Display', sans-serif; font-size: 20px; font-weight: 500; letter-spacing: -0.02em; line-height: 1.4; color: #fff; font-style: italic; margin: 0; }
  .ab-story-quote .sig { font-family: 'Satoshi',sans-serif; font-weight: 700; color: ${C.red}; font-size: 14px; margin-top: 12px; letter-spacing: 0.04em; }

  /* Team */
  .ab-team { display: grid; gap: 24px; grid-template-columns: 1fr; margin-top: 48px; }
  @media (min-width: 780px) { .ab-team { grid-template-columns: 1fr 1fr; } }
  .ab-founder { background: ${C.card}; border: 1px solid ${C.border}; border-radius: 20px; padding: 32px; display: flex; gap: 20px; align-items: flex-start; transition: transform .3s cubic-bezier(.16,1,.3,1), box-shadow .3s; }
  .ab-founder:hover { transform: translateY(-6px); box-shadow: 0 26px 60px -20px rgba(0,0,0,0.15); }
  .ab-founder .av { width: 76px; height: 76px; border-radius: 16px; background: ${C.red}; color: #fff; display: flex; align-items: center; justify-content: center; font-family: 'Clash Display',sans-serif; font-weight: 700; font-size: 36px; letter-spacing: -0.03em; flex-shrink: 0; }
  .ab-founder h3 { font-size: 22px; }
  .ab-founder .title { font-family: 'Satoshi',sans-serif; font-weight: 700; font-size: 11.5px; letter-spacing: 0.16em; color: ${C.red}; text-transform: uppercase; margin: 6px 0 12px; }
  .ab-founder .bio { font-size: 14.5px; color: ${C.body}; line-height: 1.6; }
  .ab-founder .li { display: inline-flex; align-items: center; gap: 6px; margin-top: 14px; color: ${C.muted}; font-size: 13.5px; font-weight: 600; text-decoration: none; }
  .ab-founder .li:hover { color: ${C.red}; }

  /* Partners */
  .ab-partners-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-top: 40px; }
  @media (min-width: 700px) { .ab-partners-grid { grid-template-columns: repeat(4, 1fr); } }
  .ab-partner { background: ${C.card}; border: 1px solid ${C.border}; border-radius: 14px; padding: 22px 16px; text-align: center; font-family: 'Clash Display',sans-serif; font-weight: 600; font-size: 17px; letter-spacing: -0.02em; color: ${C.ink}; transition: transform .3s cubic-bezier(.16,1,.3,1), box-shadow .3s; }
  .ab-partner:hover { transform: translateY(-4px); box-shadow: 0 18px 40px -15px rgba(0,0,0,0.15); }

  /* CTA card */
  .ab-cta { margin-top: 48px; background: ${C.card}; border: 1px solid ${C.border}; border-radius: 24px; padding: 56px 32px; text-align: center; max-width: 800px; margin-left: auto; margin-right: auto; }
  .ab-cta h2 { font-size: clamp(30px, 4.5vw, 48px); }
  .ab-cta p { color: ${C.body}; font-size: 16px; margin-top: 14px; line-height: 1.55; }
  .ab-cta .btn { display: inline-flex; align-items: center; gap: 10px; margin-top: 28px; padding: 16px 30px; border-radius: 100px; background: ${C.red}; color: #fff; text-decoration: none; font-weight: 700; font-size: 15px; transition: background .2s, transform .2s; }
  .ab-cta .btn:hover { background: ${C.redDark}; transform: translateY(-2px); }
  .ab-cta .row { display: flex; flex-wrap: wrap; gap: 20px; justify-content: center; margin-top: 24px; }
  .ab-cta .row .item { display: inline-flex; align-items: center; gap: 6px; font-size: 13.5px; color: ${C.muted}; font-weight: 600; }

  /* Reveal */
  .reveal { opacity: 0; transform: translateY(40px) scale(.94); transition: opacity .7s cubic-bezier(.16,1,.3,1), transform .8s cubic-bezier(.34,1.56,.64,1); }
  .reveal.in { opacity: 1; transform: none; }
  @media (prefers-reduced-motion: reduce) {
    .reveal { opacity: 1 !important; transform: none !important; transition: none !important; }
    .ab-hero h1 .word, .ab-hero .sub, .ab-hero .badges { opacity: 1 !important; animation: none !important; filter: none !important; transform: none !important; }
    .ab-timeline-track > i { height: 100% !important; }
    .ab-tl-item { opacity: 1 !important; }
  }

  html, body, #root { max-width: 100%; overflow-x: hidden; }
`;

/* --------------------------- Data --------------------------- */

const withoutFyn = [
  "Discover cash crisis 14 days too late",
  "Pay CA ₹30-50L per year for basic compliance",
  "React to GST notices after they arrive",
  "Make hiring/spending decisions blindly",
];
const withFyn = [
  "Prevent crises 60 days ahead with proactive alerts",
  "Pay ₹30-90K per year for AI CFO intelligence",
  "Avoid GST notices before they're issued",
  "Make data-driven decisions with real-time insights",
];

const timelineEvents = [
  { year: "2023", icon: Sparkles, title: "Started Dark Capital", desc: "Launched a luxury sugar-free chocolate brand with big dreams and optimism. Revenue growing, customers loving the product." },
  { year: "2024", icon: AlertTriangle, title: "Hidden Payables Discovered", desc: "Realized we had zero visibility into our true cash position. Hidden vendor payables, delayed payments, no real-time tracking." },
  { year: "2024", icon: TimerOff, title: "14 Days from Bankruptcy", desc: "Discovered we were 14 days away from running out of cash, not 60 days out when we could have acted. No CFO. No warning system. Just sudden crisis." },
  { year: "2025", icon: XCircle, title: "Shut Down Dark Capital", desc: "Made the painful decision to close the business. The product was great. The execution was solid. But we flew blind financially." },
  { year: "2025", icon: Lightbulb, title: "Built FynHelp", desc: "We decided to build what we wish we'd had. An AI CFO that gives every Indian SME the financial intelligence to prevent what happened to us." },
];

const founders = [
  {
    letter: "T",
    name: "Adireddy Tarun",
    title: "CEO & Co-Founder",
    bio: "B.Tech in Computer Science with 6 years of industry experience spanning technical development and management. Led engineering teams and product strategy at scale before founding FynHelp to solve the financial intelligence gap for Indian SMEs.",
    linkedin: "https://www.linkedin.com/in/tarun-adireddy/",
  },
  {
    letter: "N",
    name: "Nidhi Siddhapura",
    title: "CMO & Co-Founder",
    bio: "MBA in Data Analytics with 3 years of experience in marketing and management. Built brand strategies for multiple startups and maintains a growing presence as a micro-influencer in the business and finance space. Leads all go-to-market and community-building efforts at FynHelp.",
    linkedin: "https://www.linkedin.com/in/nidhi-siddhapura/",
  },
];

const partners = ["Razorpay", "Zoho Books", "AWS", "Supabase", "Resend", "PostHog", "Sentry", "Stripe"];

/* --------------------------- Page --------------------------- */

export default function AboutPage() {
  const pageRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const trackFillRef = useRef<HTMLElement>(null);
  const [activeTimelineIndex, setActiveTimelineIndex] = useState(-1);

  // Bidirectional reveal
  useEffect(() => {
    const root = pageRef.current;
    if (!root) return;
    const sel = ".ab-section h2, .ab-section .lead, .ab-cmp .col, .ab-vision-card, .ab-founder, .ab-partner, .ab-cta, .ab-story-quote";
    const targets = Array.from(root.querySelectorAll<HTMLElement>(sel));
    targets.forEach((el, i) => {
      el.classList.add("reveal");
      const idx = Array.from(el.parentElement?.children || []).indexOf(el);
      el.style.transitionDelay = `${Math.min(idx, 8) * 70}ms`;
    });
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.target.classList.toggle("in", e.isIntersecting)),
      { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }
    );
    targets.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  // Timeline draw + dot activation based on scroll progress
  useEffect(() => {
    const container = timelineRef.current;
    const fill = trackFillRef.current;
    if (!container || !fill) return;
    const items = Array.from(container.querySelectorAll<HTMLElement>(".ab-tl-item"));
    if (!items.length) return;

    let rafId = 0;
    const compute = () => {
      const rect = container.getBoundingClientRect();
      const vh = window.innerHeight;
      // Anchor progress to the viewport line at 55% down — feels like a natural
      // "read line". Fill begins when the container's top crosses that line and
      // completes when the LAST dot crosses it.
      const anchorY = vh * 0.55;
      // Dot center = item.top + 26(dot top offset) + 8(half of 16px dot)
      const dotOffset = 34;
      const firstDotY = items[0].getBoundingClientRect().top + dotOffset - rect.top;
      const lastDotY = items[items.length - 1].getBoundingClientRect().top + dotOffset - rect.top;
      const span = Math.max(1, lastDotY - firstDotY);
      const traveled = anchorY - (rect.top + firstDotY);
      const progress = Math.max(0, Math.min(1, traveled / span));
      // Draw the line from the first dot down to the last dot (not full container).
      const trackTopPct = (firstDotY / rect.height) * 100;
      const trackSpanPct = (span / rect.height) * 100;
      fill.style.top = `${trackTopPct}%`;
      fill.style.height = `${trackSpanPct * progress}%`;

      // Activate a dot once it has passed the read-line anchor.
      let lastActive = -1;
      items.forEach((el, i) => {
        const dotY = el.getBoundingClientRect().top + dotOffset;
        if (dotY <= anchorY + 6) {
          el.classList.add("on");
          lastActive = i;
        } else {
          el.classList.remove("on");
        }
      });
      setActiveTimelineIndex(lastActive);
    };
    const onScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(compute);
    };
    compute();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <Layout>
      <Helmet>
        <title>About FynHelp — Built by Founders, for Founders</title>
        <meta name="description" content="FynHelp was born from the failure of Dark Capital. Two founders who lost a business to financial blindness are now building India's AI CFO platform." />
        <link rel="canonical" href="https://fynhelp.com/about" />
        <meta property="og:title" content="About FynHelp — Built by Founders, for Founders" />
        <meta property="og:description" content="FynHelp was born from the failure of Dark Capital. Two founders building India's AI CFO platform." />
        <meta property="og:url" content="https://fynhelp.com/about" />
      </Helmet>
      <div ref={pageRef} className="ab-page">
        <style>{STYLES}</style>

        {/* HERO — word-by-word blur rise */}
        <section className="ab-hero">
          <div className="ab-container">
            <h1>
              {"We're Building Financial Intelligence for 63 Million Indian Businesses"
                .split(" ")
                .map((w, i) => (
                  <span key={i} className="word" style={{ animationDelay: `${0.05 + i * 0.06}s` }}>
                    {w}
                    {i < 10 ? "\u00A0" : ""}
                  </span>
                ))}
            </h1>
            <p className="sub">Every SME deserves CFO-level clarity, without CFO-level cost.</p>
            <div className="badges">
              <span className="b"><Shield size={14} color={C.red} /> Bank-Grade Security</span>
              <span className="b"><CheckCircle2 size={14} color={C.green} /> Indian Data Residency</span>
              <span className="b"><Check size={14} color={C.red} /> SOC 2 In Progress</span>
            </div>
          </div>
        </section>

        {/* Problem section (unchanged internals) */}
        <ProblemSection />

        {/* Comparison */}
        <section className="ab-section">
          <div className="ab-container">
            <h2>What makes us different</h2>
            <div className="ab-cmp">
              <div className="col">
                <div className="lbl">Without FynHelp</div>
                <ul>
                  {withoutFyn.map((t) => (
                    <li key={t}>
                      <XCircle size={18} color={C.red} />
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="col dark">
                <div className="lbl">With FynHelp</div>
                <ul>
                  {withFyn.map((t) => (
                    <li key={t}>
                      <CheckCircle2 size={18} color={C.green} />
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Vision */}
        <section className="ab-section" style={{ paddingTop: 0 }}>
          <div className="ab-container">
            <h2>Preventing crises before they happen</h2>
            <p className="lead">
              We are building toward a future where no Indian SME owner discovers a cash crisis too late to fix it.
              Where GST notices are prevented, not received. Where every decision to hire, borrow, or extend credit is
              made with full knowledge of the consequences.
            </p>
            <div className="ab-vision">
              <div className="ab-vision-card">
                <div className="ico"><AlertTriangle size={24} color={C.red} /></div>
                <p>Crisis Discovered{"\n"}14 Days Late</p>
              </div>
              <div className="ab-vision-arrow"><ArrowRight size={28} /></div>
              <div className="ab-vision-card center">
                <div className="ico"><Sparkles size={24} color="#fff" /></div>
                <p>FynHelp{"\n"}Intelligence Layer</p>
              </div>
              <div className="ab-vision-arrow" style={{ gridColumn: "unset" }}><ArrowRight size={28} /></div>
              <div className="ab-vision-card">
                <div className="ico"><CheckCircle2 size={24} color={C.green} /></div>
                <p>Prevented{"\n"}60 Days Ahead</p>
              </div>
            </div>
          </div>
        </section>

        {/* DARK STORY BAND — the only dark section on this page */}
        <section className="ab-story-band">
          <div className="ab-container">
            <h2>Born from personal pain</h2>
            <p className="lead">Our founder story — from Dark Capital to FynHelp.</p>

            <div className="ab-timeline" ref={timelineRef}>
              <div className="ab-timeline-track"><i ref={trackFillRef as any} /></div>
              {timelineEvents.map((e, i) => (
                <div key={i} className="ab-tl-item">
                  <span className="ab-tl-dot" />
                  <span className="ab-tl-year num">{e.year}</span>
                  <h3 className="ab-tl-title">{e.title}</h3>
                  <p className="ab-tl-desc">{e.desc}</p>
                </div>
              ))}
            </div>

            <div className="ab-story-quote">
              <p>"We're building what we wish we'd had. No founder should discover their crisis 14 days too late."</p>
              <div className="sig">— TARUN &amp; NIDHI, CO-FOUNDERS</div>
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="ab-section">
          <div className="ab-container">
            <h2>The minds behind FynHelp</h2>
            <p className="lead">Two founders, one mission — bring CFO-level clarity to 63M Indian businesses.</p>
            <div className="ab-team">
              {founders.map((f) => (
                <div key={f.name} className="ab-founder">
                  <div className="av">{f.letter}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3>{f.name}</h3>
                    <div className="title">{f.title}</div>
                    <p className="bio">{f.bio}</p>
                    <a href={f.linkedin} target="_blank" rel="noopener noreferrer" className="li">
                      <Linkedin size={14} /> Connect on LinkedIn
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Partners */}
        <section className="ab-section" style={{ paddingTop: 0 }}>
          <div className="ab-container">
            <h2>Powered by enterprise infrastructure</h2>
            <p className="lead">Built on the same platforms Fortune 500 companies trust.</p>
            <div className="ab-partners-grid">
              {partners.map((p) => (
                <div key={p} className="ab-partner">{p}</div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="ab-section" style={{ paddingTop: 0 }}>
          <div className="ab-container">
            <div className="ab-cta">
              <h2>Ready to experience financial intelligence?</h2>
              <p>Join our founding member waitlist and get 30 days free on launch.</p>
              <Link to="/waitlist" className="btn">
                Start your free trial <ArrowRight size={18} />
              </Link>
              <div className="row">
                <span className="item"><Check size={14} color={C.green} /> No credit card required</span>
                <span className="item"><Clock size={14} color={C.red} /> 30 days free for beta users</span>
                <span className="item"><Shield size={14} color={C.ink} /> Cancel anytime</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
