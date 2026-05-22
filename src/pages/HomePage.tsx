import { useEffect, useRef, useState } from "react";

/* ============================================================
   FYNHelp Landing — exact spec rebuild with scroll animations
   ============================================================ */

const COLORS = {
  beige: "#EFE8D8",
  red: "#A93838",
  ink: "#1A1008",
  gray: "#6B6B6B",
  card: "#F7F4EF",
  green: "#10B981",
};

/* ---------- Global styles ---------- */
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

    .fyn-page, .fyn-page * { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; box-sizing: border-box; }
    .fyn-page { background: ${COLORS.beige}; color: ${COLORS.ink}; transition: background-color 0.4s ease; overflow-x: hidden; }

    /* Reveal base */
    .reveal { opacity: 0; transform: translateY(40px); transition: opacity 0.8s cubic-bezier(0.25,0.46,0.45,0.94), transform 0.8s cubic-bezier(0.25,0.46,0.45,0.94); will-change: transform, opacity; }
    .reveal.in { opacity: 1; transform: translateY(0); }

    .reveal-left { opacity: 0; transform: translateX(-40px); transition: opacity 0.8s cubic-bezier(0.25,0.46,0.45,0.94), transform 0.8s cubic-bezier(0.25,0.46,0.45,0.94); will-change: transform, opacity; }
    .reveal-left.in { opacity: 1; transform: translateX(0); }

    .reveal-right { opacity: 0; transform: translateX(40px) scale(0.95); transition: opacity 0.8s cubic-bezier(0.25,0.46,0.45,0.94), transform 0.8s cubic-bezier(0.25,0.46,0.45,0.94); will-change: transform, opacity; }
    .reveal-right.in { opacity: 1; transform: translateX(0) scale(1); }

    .reveal-scale { opacity: 0; transform: translateY(40px) scale(0.95); transition: opacity 0.8s cubic-bezier(0.25,0.46,0.45,0.94), transform 0.8s cubic-bezier(0.25,0.46,0.45,0.94); will-change: transform, opacity; }
    .reveal-scale.in { opacity: 1; transform: translateY(0) scale(1); }

    .reveal-fade { opacity: 0; transition: opacity 0.6s cubic-bezier(0.25,0.46,0.45,0.94); }
    .reveal-fade.in { opacity: 1; }

    @media (max-width: 767px) {
      .reveal { transform: translateY(20px); transition-duration: 0.6s; }
      .reveal-left { transform: translateX(-20px); transition-duration: 0.6s; }
      .reveal-right { transform: translateX(20px) scale(0.95); transition-duration: 0.6s; }
      .reveal-scale { transform: translateY(20px) scale(0.95); transition-duration: 0.6s; }
    }

    /* Marquee */
    @keyframes fyn-marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
    .fyn-ticker-track { display: inline-flex; white-space: nowrap; animation: fyn-marquee 40s linear infinite; }

    /* Float for hero widget */
    @keyframes fyn-float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
    .fyn-float { animation: fyn-float 4s ease-in-out infinite; }

    /* Typing caret */
    @keyframes fyn-caret { 0%,49% { opacity: 1; } 50%,100% { opacity: 0; } }
    .fyn-caret { display: inline-block; width: 4px; background: ${COLORS.red}; margin-left: 4px; animation: fyn-caret 0.8s steps(1) infinite; }

    /* Highlight bg */
    .fyn-hl { position: relative; display: inline-block; color: ${COLORS.red}; }
    .fyn-hl::before { content: ''; position: absolute; left: 0; bottom: 0; top: 0; width: 0; background: rgba(169,56,56,0.2); z-index: -1; transition: width 0.6s cubic-bezier(0.25,0.46,0.45,0.94) 0.3s; }
    .fyn-hl.in::before { width: 100%; }

    /* Buttons */
    .fyn-btn { transition: all 0.3s cubic-bezier(0.25,0.46,0.45,0.94); cursor: pointer; border: none; font-weight: 600; }
    .fyn-btn-primary { background: ${COLORS.red}; color: #fff; padding: 14px 28px; border-radius: 10px; font-size: 15px; }
    .fyn-btn-primary:hover { transform: translateY(-2px) scale(1.02); box-shadow: 0 8px 24px rgba(169,56,56,0.3); }
    .fyn-btn-ghost { background: transparent; color: ${COLORS.ink}; padding: 14px 28px; border-radius: 10px; font-size: 15px; border: 1.5px solid rgba(26,16,8,0.2); }
    .fyn-btn-ghost:hover { transform: translateY(-2px) scale(1.02); box-shadow: 0 8px 24px rgba(26,16,8,0.08); background: rgba(26,16,8,0.04); }

    /* Cards hover */
    .fyn-tcard { transition: all 0.3s cubic-bezier(0.25,0.46,0.45,0.94); }
    .fyn-tcard:hover { transform: translateY(-4px) scale(1.02); box-shadow: 0 12px 40px rgba(26,16,8,0.12); }
    .fyn-icard { transition: all 0.3s cubic-bezier(0.25,0.46,0.45,0.94); }
    .fyn-icard:hover { transform: translateY(-2px); box-shadow: 0 4px 16px rgba(26,16,8,0.08); }

    /* Navbar */
    .fyn-nav { position: fixed; top: 16px; left: 50%; transform: translateX(-50%); z-index: 100; padding: 10px 24px; border-radius: 999px; background: rgba(239,232,216,0.6); backdrop-filter: blur(0); transition: all 0.3s cubic-bezier(0.25,0.46,0.45,0.94); display: flex; align-items: center; gap: 28px; }
    .fyn-nav.scrolled { background: rgba(239,232,216,0.95); backdrop-filter: blur(12px); box-shadow: 0 2px 20px rgba(26,16,8,0.06); }
    .fyn-nav a { color: ${COLORS.ink}; font-size: 14px; font-weight: 500; text-decoration: none; transition: opacity 0.2s; }
    .fyn-nav a:hover { opacity: 0.7; }

    /* Stagger delays via inline style or nth-child */
    .stagger > .reveal:nth-child(1), .stagger > .reveal-scale:nth-child(1) { transition-delay: 0s; }
    .stagger > .reveal:nth-child(2), .stagger > .reveal-scale:nth-child(2) { transition-delay: 0.1s; }
    .stagger > .reveal:nth-child(3), .stagger > .reveal-scale:nth-child(3) { transition-delay: 0.2s; }
    .stagger > .reveal:nth-child(4), .stagger > .reveal-scale:nth-child(4) { transition-delay: 0.3s; }
    @media (max-width: 767px) {
      .stagger > .reveal:nth-child(2) { transition-delay: 0.05s; }
      .stagger > .reveal:nth-child(3) { transition-delay: 0.1s; }
      .stagger > .reveal:nth-child(4) { transition-delay: 0.15s; }
    }
  `}</style>
);

/* ---------- Hooks ---------- */
function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>(".reveal, .reveal-left, .reveal-right, .reveal-scale, .reveal-fade");
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            obs.unobserve(e.target);
          }
        });
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.2 }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}

function useNavScroll() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return scrolled;
}

function useBgTransition() {
  // Switch body bg via section observers
  useEffect(() => {
    const map: Record<string, string> = {
      "sec-hero": COLORS.beige,
      "sec-int": COLORS.beige,
      "sec-problem": COLORS.card,
      "sec-test": COLORS.beige,
      "sec-cta": COLORS.beige,
      "sec-footer": COLORS.card,
    };
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && map[e.target.id]) {
            const root = document.querySelector<HTMLElement>(".fyn-page");
            if (root) root.style.backgroundColor = map[e.target.id];
          }
        });
      },
      { threshold: 0.4 }
    );
    Object.keys(map).forEach((id) => {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);
}

/* ---------- Components ---------- */

function Nav() {
  const scrolled = useNavScroll();
  return (
    <nav className={`fyn-nav ${scrolled ? "scrolled" : ""}`}>
      <span style={{ fontWeight: 800, fontSize: 16, color: COLORS.ink }}>FYN<span style={{ color: COLORS.red }}>Help</span></span>
      <a href="#features">Features</a>
      <a href="#integrations">Integrations</a>
      <a href="#pricing">Pricing</a>
      <a href="#about">About</a>
      <a href="/waitlist" className="fyn-btn fyn-btn-primary" style={{ padding: "8px 18px", fontSize: 13, color: "#fff" }}>Join Waitlist</a>
    </nav>
  );
}

function TypingHeadline() {
  const text = "Integrate it.";
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (count >= text.length) return;
    const speed = window.innerWidth < 768 ? 80 : 100;
    const t = setTimeout(() => setCount((c) => c + 1), speed);
    return () => clearTimeout(t);
  }, [count]);
  return (
    <span style={{ color: COLORS.red, whiteSpace: "nowrap" }}>
      {text.slice(0, count)}
      {count < text.length && <span className="fyn-caret">&nbsp;</span>}
    </span>
  );
}

function HeroSection() {
  const widgetRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (window.innerWidth < 768) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        if (widgetRef.current) {
          const y = window.scrollY * 0.1;
          widgetRef.current.style.setProperty("--parallax", `${-y}px`);
        }
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); cancelAnimationFrame(raf); };
  }, []);

  const badges = [
    { t: "DPDP Act", s: "Compliant" },
    { t: "ISO 27001", s: "Certified" },
    { t: "SOC 2", s: "Type II" },
    { t: "Bank Grade", s: "256-bit AES" },
  ];

  return (
    <section id="sec-hero" style={{ minHeight: "100vh", padding: "140px 24px 80px", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div className="reveal" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 14px", borderRadius: 999, background: "rgba(169,56,56,0.08)", border: `1px solid ${COLORS.red}30`, fontSize: 12, fontWeight: 600, color: COLORS.red, letterSpacing: "0.08em", textTransform: "uppercase" }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: COLORS.green }} />
        India's Virtual CFO Platform
      </div>

      <h1 style={{ fontSize: "clamp(40px, 6vw, 72px)", fontWeight: 900, lineHeight: 1.05, textAlign: "center", maxWidth: 980, marginTop: 32, color: COLORS.ink, letterSpacing: "-0.02em" }}>
        <span className="reveal">Don't just track your data.</span>
        <br />
        <TypingHeadline />
      </h1>

      <p className="reveal" style={{ transitionDelay: "0.3s", fontSize: "clamp(17px, 1.5vw, 20px)", color: COLORS.gray, maxWidth: 720, textAlign: "center", marginTop: 28, lineHeight: 1.55 }}>
        Meet CFO Fynny — stop running your business on gut feeling. Start running it on intelligence. Predictive 'What-If' scenarios and instant financial clarity.
      </p>

      <div className="reveal" style={{ transitionDelay: "0.5s", display: "flex", gap: 12, marginTop: 32, flexWrap: "wrap", justifyContent: "center" }}>
        <a href="/waitlist" className="fyn-btn fyn-btn-primary">Join the Waitlist →</a>
        <a href="#demo" className="fyn-btn fyn-btn-ghost">Watch Demo</a>
      </div>

      {/* Chat widget */}
      <div ref={widgetRef} className="reveal-scale fyn-float" style={{ transitionDelay: "0.4s", marginTop: 56, width: "100%", maxWidth: 620, transform: "translateY(var(--parallax,0))" }}>
        <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 20px 60px rgba(26,16,8,0.15)", overflow: "hidden", border: "1px solid rgba(26,16,8,0.06)" }}>
          <div style={{ background: "#F3F4F6", padding: "14px 18px", borderBottom: "1px solid #E5E7EB", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: COLORS.red, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800 }}>F</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: COLORS.ink }}>CFO Fynny</div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: COLORS.gray }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: COLORS.green }} /> Online
              </div>
            </div>
          </div>
          <div style={{ padding: 20 }}>
            <div style={{ fontSize: 13, color: COLORS.gray, marginBottom: 10 }}>💡 Try asking:</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {["What's my current runway?", "When is my next GST deadline?", "Can I afford to hire?", "Should I extend credit?"].map((q) => (
                <button key={q} className="fyn-btn" style={{ background: "#F3F4F6", padding: "8px 14px", borderRadius: 999, fontSize: 13, color: COLORS.ink, fontWeight: 500 }}>{q}</button>
              ))}
            </div>
            <div style={{ marginTop: 16, background: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: 12, padding: "10px 14px", display: "flex", alignItems: "center", gap: 10 }}>
              <input placeholder="Ask Fynny anything about your business..." style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontSize: 14, color: COLORS.ink }} />
              <button className="fyn-btn" style={{ background: COLORS.red, color: "#fff", width: 34, height: 34, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>→</button>
            </div>
          </div>
        </div>
      </div>

      {/* Trust badges */}
      <div className="stagger" style={{ marginTop: 56, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14, width: "100%", maxWidth: 800 }}>
        {badges.map((b, i) => (
          <div key={b.t} className="reveal" style={{ transitionDelay: `${0.7 + i * 0.1}s`, background: COLORS.card, border: "1px solid rgba(26,16,8,0.08)", borderRadius: 12, padding: "14px 16px", textAlign: "center" }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: COLORS.ink }}>{b.t}</div>
            <div style={{ fontSize: 12, color: COLORS.gray, marginTop: 2 }}>{b.s}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Ticker({ items, dark }: { items: string[]; dark?: boolean }) {
  const content = (
    <div className="fyn-ticker-track">
      {[...items, ...items].map((t, i) => (
        <span key={i} style={{ display: "inline-flex", alignItems: "center", padding: "0 24px", fontSize: 14, fontWeight: 600, color: dark ? "#fff" : COLORS.ink, letterSpacing: "0.05em", textTransform: "uppercase" }}>
          {t}
          <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: COLORS.red, marginLeft: 24 }} />
        </span>
      ))}
    </div>
  );
  return (
    <div style={{ background: dark ? COLORS.ink : COLORS.card, padding: "18px 0", overflow: "hidden", borderTop: `1px solid ${dark ? "rgba(255,255,255,0.08)" : "rgba(26,16,8,0.08)"}`, borderBottom: `1px solid ${dark ? "rgba(255,255,255,0.08)" : "rgba(26,16,8,0.08)"}` }}>
      {content}
    </div>
  );
}

function IntegrationsSection() {
  const integrations = [
    "Tally", "Zoho Books", "QuickBooks", "Razorpay", "ICICI Bank", "HDFC Bank",
    "GST Portal", "ClearTax", "Stripe", "PayU", "SBI", "Axis Bank",
  ];
  return (
    <section id="sec-int" style={{ padding: "100px 24px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", textAlign: "center" }}>
        <div className="reveal" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 999, background: "rgba(26,16,8,0.06)", fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", color: COLORS.ink }}>
          ⚙️ 12+ LIVE INTEGRATIONS
        </div>
        <h2 className="reveal" style={{ transitionDelay: "0.1s", fontSize: "clamp(32px, 4vw, 52px)", fontWeight: 900, marginTop: 20, color: COLORS.ink, letterSpacing: "-0.02em" }}>
          Connect your entire financial stack.
        </h2>
        <p className="reveal" style={{ transitionDelay: "0.2s", fontSize: 18, color: COLORS.gray, marginTop: 14, maxWidth: 640, marginInline: "auto" }}>
          All systems connected. Real-time sync. Zero manual entry.
        </p>

        <div style={{ marginTop: 48, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14 }}>
          {integrations.map((name, i) => (
            <div key={name} className="reveal fyn-icard" style={{ transitionDelay: `${0.3 + i * 0.08}s`, background: COLORS.card, border: "1px solid rgba(26,16,8,0.08)", borderRadius: 12, padding: "20px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontWeight: 600, fontSize: 14, color: COLORS.ink }}>{name}</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: COLORS.green, display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: COLORS.green }} /> Connected
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProblemSection() {
  const pills = ["No real-time data", "Excel chaos", "Stale reports", "Gut decisions", "Missed GST", "Cash surprises"];
  return (
    <section id="sec-problem" style={{ padding: "100px 24px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div className="reveal" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 999, background: "rgba(169,56,56,0.1)", fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", color: COLORS.red }}>
          🔴 THE PROBLEM
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 48, marginTop: 32, alignItems: "center" }}>
          <div>
            <h2 style={{ fontSize: "clamp(32px, 4vw, 52px)", fontWeight: 900, lineHeight: 1.1, color: COLORS.ink, letterSpacing: "-0.02em" }}>
              <span className="reveal-left" style={{ transitionDelay: "0.1s", display: "block" }}>India's SMEs make ₹Crore decisions with</span>
              <span className="reveal-left fyn-hl" style={{ transitionDelay: "0.3s", marginTop: 8 }}>no financial intelligence.</span>
            </h2>
            <p className="reveal-left" style={{ transitionDelay: "0.7s", fontSize: 17, color: COLORS.gray, marginTop: 24, lineHeight: 1.6, maxWidth: 520 }}>
              Manufacturers in Ludhiana, traders in Surat, distributors in Pune — running ₹10Cr+ businesses on Excel sheets and last month's books. Decisions made in the dark cost crores every year.
            </p>
          </div>

          <div className="reveal-right" style={{ transitionDelay: "0.1s", background: COLORS.red, color: "#fff", borderRadius: 20, padding: "40px 32px", boxShadow: "0 20px 60px rgba(169,56,56,0.3)" }}>
            <div style={{ fontSize: 96, fontWeight: 900, lineHeight: 1, letterSpacing: "-0.04em" }}>98%</div>
            <p style={{ fontSize: 17, marginTop: 12, opacity: 0.95, lineHeight: 1.5 }}>of Indian SMEs operate without real financial visibility.</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 24 }}>
              {pills.map((p, i) => (
                <span key={p} className="reveal" style={{ transitionDelay: `${0.5 + i * 0.05}s`, transitionDuration: "0.6s", padding: "6px 12px", borderRadius: 999, background: "rgba(255,255,255,0.15)", fontSize: 12, fontWeight: 600, border: "1px solid rgba(255,255,255,0.2)" }}>
                  {p}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  const cards = [
    { bg: COLORS.card, q: "Fynny told me I'd run out of cash in 34 days — 5 weeks before my CA noticed. Saved my business.", n: "Rajesh Mehta", c: "Mehta Textile Traders, Surat", tag: "₹24L collected · Runway +22 days" },
    { bg: "#FCE8EA", q: "Recovered ₹4.2L in ITC we didn't know we were missing. Notice risk dropped from 74 to 18.", n: "Priya Sharma", c: "Sharma & Sons, Pune", tag: "₹4.2L ITC recovered" },
    { bg: COLORS.card, q: "Morning brief is 3 sentences. In Hindi. I know everything in 30 seconds. Game changer.", n: "Karthik Sundaram", c: "KS Engineering, Chennai", tag: "12 hrs/month saved" },
    { bg: "#fff", q: "The hiring simulator saved us from a ₹15L mistake. Best decision tool we've ever used.", n: "Vandana Kapoor", c: "Kapoor Pharma, Ahmedabad", tag: "₹15L burn avoided" },
  ];
  return (
    <section id="sec-test" style={{ padding: "100px 24px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <h2 className="reveal" style={{ fontSize: "clamp(32px, 4vw, 52px)", fontWeight: 900, color: COLORS.ink, textAlign: "center", letterSpacing: "-0.02em" }}>
          The numbers speak. So do our customers.
        </h2>
        <div style={{ marginTop: 56, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20 }}>
          {cards.map((c, i) => (
            <div key={i} className="reveal-scale fyn-tcard" style={{ transitionDelay: `${i * 0.15}s`, background: c.bg, borderRadius: 20, padding: 32, border: "1px solid rgba(26,16,8,0.06)" }}>
              <p style={{ fontSize: 17, lineHeight: 1.55, color: COLORS.ink, fontWeight: 500 }}>"{c.q}"</p>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 24 }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: COLORS.ink, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14 }}>{c.n.split(" ").map((s) => s[0]).join("")}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: COLORS.ink }}>{c.n}</div>
                  <div style={{ fontSize: 12, color: COLORS.gray }}>{c.c}</div>
                </div>
              </div>
              <div className="reveal-fade" style={{ transitionDelay: `${i * 0.15 + 0.3}s`, marginTop: 20, display: "inline-block", padding: "6px 12px", borderRadius: 6, background: "rgba(169,56,56,0.1)", color: COLORS.red, fontSize: 12, fontWeight: 600 }}>
                {c.tag}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCTASection() {
  return (
    <section id="sec-cta" style={{ padding: "100px 24px" }}>
      <div className="reveal-scale" style={{ maxWidth: 980, margin: "0 auto", background: COLORS.ink, borderRadius: 28, padding: "72px 40px", textAlign: "center", color: "#fff", boxShadow: "0 30px 80px rgba(26,16,8,0.25)" }}>
        <h2 className="reveal" style={{ transitionDelay: "0.2s", fontSize: "clamp(32px, 4.5vw, 56px)", fontWeight: 900, lineHeight: 1.1, letterSpacing: "-0.02em" }}>
          Stop guessing. Start knowing.
        </h2>
        <p className="reveal" style={{ transitionDelay: "0.25s", fontSize: 18, opacity: 0.8, marginTop: 16, maxWidth: 520, marginInline: "auto" }}>
          Join the waitlist. First 100 businesses get 6 months FREE.
        </p>
        <a href="/waitlist" className="reveal fyn-btn fyn-btn-primary" style={{ transitionDelay: "0.3s", display: "inline-block", marginTop: 32, padding: "16px 36px", fontSize: 16 }}>
          Join the Waitlist →
        </a>
        <p className="reveal-fade" style={{ transitionDelay: "0.4s", fontSize: 13, opacity: 0.6, marginTop: 16 }}>
          No credit card required · Launch May 2026
        </p>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer id="sec-footer" style={{ background: COLORS.card, padding: "48px 24px", borderTop: "1px solid rgba(26,16,8,0.08)" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 24, alignItems: "center" }}>
        <span style={{ fontWeight: 800, fontSize: 16, color: COLORS.ink }}>FYN<span style={{ color: COLORS.red }}>Help</span></span>
        <span style={{ fontSize: 13, color: COLORS.gray }}>© 2026 FYNHelp. India's Virtual CFO Platform.</span>
      </div>
    </footer>
  );
}

/* ---------- Page ---------- */
export default function HomePage() {
  useReveal();
  useBgTransition();

  return (
    <div className="fyn-page">
      <GlobalStyles />
      <Nav />
      <HeroSection />
      <Ticker dark items={["Real-time GST tracking", "AI-powered runway forecasts", "Instant ITC reconciliation", "What-if scenario modeling", "Bank-grade security"]} />
      <IntegrationsSection />
      <Ticker items={["10,000+ businesses", "₹2,400 Cr monitored", "₹180 Cr ITC recovered", "98.7% accuracy", "4.8★ rated"]} dark />
      <ProblemSection />
      <TestimonialsSection />
      <FinalCTASection />
      <Footer />
    </div>
  );
}
