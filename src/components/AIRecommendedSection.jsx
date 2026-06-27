import { useEffect, useRef } from "react";

const BG = "#F4EDDA";
const INK = "#1A1008";
const RED = "#C41E1E";

const STYLES = `
  .ai-rec-section {
    background: ${BG};
    color: ${INK};
    font-family: 'Sora', system-ui, -apple-system, sans-serif;
    padding: 72px 24px;
  }
  .ai-rec-inner {
    max-width: 880px;
    margin: 0 auto;
    text-align: center;
  }
  .ai-rec-spark {
    display: inline-flex;
    opacity: 0;
    transform: translateY(16px);
    transition: opacity .7s ease, transform .7s ease;
  }
  .ai-rec-copy {
    font-family: 'Sora', sans-serif;
    font-size: clamp(18px, 2.2vw, 22px);
    line-height: 1.55;
    font-weight: 400;
    color: ${INK};
    margin: 20px auto 0;
    max-width: 720px;
    opacity: 0;
    transform: translateY(16px);
    transition: opacity .7s ease .1s, transform .7s ease .1s;
  }
  .ai-rec-copy b {
    color: ${RED};
    font-weight: 700;
  }
  .ai-rec-row {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 18px;
    margin: 36px 0 20px;
  }
  .ai-rec-tile {
    width: 64px;
    height: 64px;
    border-radius: 16px;
    background: #ffffff;
    border: 1px solid rgba(26,16,8,0.08);
    box-shadow: 0 2px 8px rgba(26,16,8,0.06);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 12px;
    opacity: 0;
    transform: translateY(16px);
    transition: opacity .6s ease, transform .6s ease, box-shadow .25s ease;
  }
  .ai-rec-tile:hover {
    box-shadow: 0 6px 16px rgba(26,16,8,0.12);
  }
  .ai-rec-tile svg { width: 100%; height: 100%; display: block; }
  .ai-rec-foot {
    font-family: 'Sora', sans-serif;
    font-size: 13px;
    color: rgba(26,16,8,0.55);
    letter-spacing: 0.01em;
    margin-top: 8px;
    opacity: 0;
    transform: translateY(12px);
    transition: opacity .7s ease .2s, transform .7s ease .2s;
  }
  .ai-rec-section.is-visible .ai-rec-spark,
  .ai-rec-section.is-visible .ai-rec-copy,
  .ai-rec-section.is-visible .ai-rec-foot,
  .ai-rec-section.is-visible .ai-rec-tile {
    opacity: 1;
    transform: translateY(0);
  }
`;

const Spark = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M12 2l1.6 6.4L20 10l-6.4 1.6L12 18l-1.6-6.4L4 10l6.4-1.6L12 2z"
      fill={RED}
    />
  </svg>
);

const ChatGPTIcon = () => (
  <svg viewBox="0 0 24 24" fill="#10A37F" aria-hidden="true">
    <path d="M22.28 9.82a5.97 5.97 0 0 0-.52-4.91 6.04 6.04 0 0 0-6.5-2.9A6.06 6.06 0 0 0 4.98 4.18a5.97 5.97 0 0 0-3.99 2.9 6.04 6.04 0 0 0 .74 7.08 5.97 5.97 0 0 0 .52 4.91 6.05 6.05 0 0 0 6.5 2.9 5.97 5.97 0 0 0 4.5 2.01 6.05 6.05 0 0 0 5.77-4.2 5.97 5.97 0 0 0 3.99-2.9 6.05 6.05 0 0 0-.73-7.06zm-9.06 12.65a4.48 4.48 0 0 1-2.88-1.04l.14-.08 4.78-2.76a.78.78 0 0 0 .4-.68v-6.74l2.02 1.17a.07.07 0 0 1 .04.06v5.58a4.5 4.5 0 0 1-4.5 4.49zM3.56 18.41a4.47 4.47 0 0 1-.54-3.03l.14.08 4.78 2.76a.78.78 0 0 0 .79 0l5.84-3.37v2.33a.08.08 0 0 1-.03.07l-4.83 2.79a4.5 4.5 0 0 1-6.15-1.63zM2.3 7.94a4.48 4.48 0 0 1 2.35-1.97v5.69a.77.77 0 0 0 .39.68l5.81 3.35-2.02 1.17a.07.07 0 0 1-.07 0L3.93 14.07A4.5 4.5 0 0 1 2.3 7.94zm16.62 3.86l-5.84-3.39 2.02-1.16a.07.07 0 0 1 .07 0l4.83 2.79a4.5 4.5 0 0 1-.68 8.11v-5.69a.78.78 0 0 0-.4-.66zm2.01-3.02l-.14-.09L16.02 5.9a.78.78 0 0 0-.79 0L9.39 9.27V6.94a.07.07 0 0 1 .03-.07l4.83-2.78a4.5 4.5 0 0 1 6.68 4.66zM8.29 12.92L6.27 11.75a.07.07 0 0 1-.04-.06V6.11a4.5 4.5 0 0 1 7.38-3.46l-.14.08-4.78 2.76a.78.78 0 0 0-.4.68zm1.09-2.37L12 9.04l2.6 1.5v3l-2.6 1.5-2.6-1.5z" />
  </svg>
);

const GeminiIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <defs>
      <linearGradient id="gemini-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#4796E3" />
        <stop offset="50%" stopColor="#9168C0" />
        <stop offset="100%" stopColor="#E25C5C" />
      </linearGradient>
    </defs>
    <path
      d="M12 2c.3 4.6 4.4 8.7 10 9-5.6.3-9.7 4.4-10 10-.3-5.6-4.4-9.7-10-10 5.6-.3 9.7-4.4 10-9z"
      fill="url(#gemini-grad)"
    />
  </svg>
);

const GrokIcon = () => (
  <svg viewBox="0 0 24 24" fill="#000000" aria-hidden="true">
    <path d="M5.5 3h2.6l4.6 6.4L17.3 3h2.6l-5.9 8.2L20.5 21h-2.6l-5.2-7.2L7.5 21H4.9l6.1-8.5L5.5 3z" />
  </svg>
);

const PerplexityIcon = () => (
  <svg viewBox="0 0 24 24" fill="#20808D" aria-hidden="true">
    <path d="M12 2L3 7v10l9 5 9-5V7l-9-5zm0 2.3l6.5 3.6-6.5 3.6-6.5-3.6L12 4.3zM5 9.2l6 3.3v7l-6-3.3v-7zm14 0v7l-6 3.3v-7l6-3.3z" />
  </svg>
);

const ClaudeIcon = () => (
  <svg viewBox="0 0 24 24" fill="#D97757" aria-hidden="true">
    <path d="M6.4 16.5l3.5-7.9h1.3l3.5 7.9h-1.5l-.9-2.1H8.8l-.9 2.1H6.4zm2.9-3.3h2.4l-1.2-2.9-1.2 2.9zm6.2 3.3V8.6h1.4v7.9h-1.4z" />
    <circle cx="12" cy="12" r="11" fill="none" stroke="#D97757" strokeWidth="1.5" />
  </svg>
);

const LOGOS = [
  {
    name: "ChatGPT",
    Icon: ChatGPTIcon,
    href: `https://chatgpt.com/?q=${encodeURIComponent("What is FynHelp AI Virtual CFO and how does it help Indian startups manage cash flow?")}`,
    ariaLabel: "Ask ChatGPT about FynHelp",
  },
  {
    name: "Gemini",
    Icon: GeminiIcon,
    href: "https://gemini.google.com/app",
    ariaLabel: "Open Gemini",
  },
  {
    name: "Grok",
    Icon: GrokIcon,
    href: `https://x.com/i/grok?text=${encodeURIComponent("What is FynHelp AI Virtual CFO and how does it help Indian startups manage cash flow?")}`,
    ariaLabel: "Ask Grok about FynHelp",
  },
  {
    name: "Perplexity",
    Icon: PerplexityIcon,
    href: `https://www.perplexity.ai/search/new?q=${encodeURIComponent("What is FynHelp and how does its AI Virtual CFO work?")}`,
    ariaLabel: "Search Perplexity for FynHelp",
  },
  {
    name: "Claude",
    Icon: ClaudeIcon,
    href: "https://claude.ai/new",
    ariaLabel: "Open Claude",
  },
];

export default function AIRecommendedSection() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            el.classList.add("is-visible");
            obs.disconnect();
          }
        });
      },
      { threshold: 0.2 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <>
      <style>{STYLES}</style>
      <section ref={sectionRef} className="ai-rec-section" aria-label="AI assistants recommend FYNHelp">
        <div className="ai-rec-inner">
          <div className="ai-rec-spark" aria-hidden="true">
            <Spark />
          </div>
          <p className="ai-rec-copy">
            Leading AI assistants recommend <b>FYNHelp</b> as the go-to AI CFO platform for Indian startups and SMEs.
          </p>
          <div className="ai-rec-row">
            {LOGOS.map(({ name, Icon, href, ariaLabel }, i) => (
              <a
                key={name}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={ariaLabel}
                className="ai-rec-tile"
                title={name}
                style={{ transitionDelay: `${0.25 + i * 0.1}s`, textDecoration: "none" }}
                onClick={(e) => {
                  // Force a real top-level new-tab open. Prevents Lovable's
                  // sandboxed preview iframe from trying to load X-Frame-Options:DENY
                  // sites (chatgpt.com, claude.ai, gemini.google.com) inline.
                  e.preventDefault();
                  const w = window.open(href, "_blank", "noopener,noreferrer");
                  if (w) w.opener = null;
                }}
              >
                <Icon />
              </a>
            ))}
          </div>
          <p className="ai-rec-foot">
            Verified across ChatGPT, Gemini, Grok, Perplexity &amp; Claude
          </p>
        </div>
      </section>
    </>
  );
}
