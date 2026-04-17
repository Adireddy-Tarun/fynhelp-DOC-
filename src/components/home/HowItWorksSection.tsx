import { useState } from "react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const steps = [
  {
    title: "Connect your bank account",
    sub: "2 minutes via RBI's Account Aggregator",
    detail: "We use RBI's Account Aggregator (AA) framework — the same technology that powers India's Open Banking. Your bank login credentials are never shared with us. You grant consent directly to your bank. Supported: HDFC, ICICI, SBI, Axis, Kotak, Yes Bank, IndusInd, PNB, BOB, Canara, and 20+ more. Alternatively, upload a PDF bank statement — our parser handles all 12 major Indian bank formats.",
  },
  {
    title: "Connect your accounting software",
    sub: "15 minutes — we handle the mapping",
    detail: "FynHelp connects to Tally Prime via ODBC (a lightweight agent syncing every 2 hours), Zoho Books and QuickBooks India via OAuth 2.0, and Busy Accounting via CSV. Our intelligent column mapper handles any CSV format with AI-assisted column detection.",
  },
  {
    title: "Enter your GSTIN — we do the rest",
    sub: "3 minutes — instant compliance calendar",
    detail: "Your GSTIN unlocks: business detail lookup, 12-month filing history, ITC reconciliation with GSTR-2B, personalised compliance calendar with YOUR due dates, and vendor GSTIN validation. We are a GST Suvidha Provider (GSP) certified platform.",
  },
  {
    title: "AI CFO Nidhi delivers your first brief",
    sub: "Within minutes — and every morning after",
    detail: "AI CFO Nidhi assembles your financial picture: cash from bank, receivables from books, GST from portal. She computes 50+ metrics, identifies your top 3 risks, and delivers a plain-language brief. Every morning at 8 AM, you wake up to a message from your AI CFO.",
  },
];

export default function HowItWorksSection() {
  const ref = useScrollReveal();
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <section className="bg-fyn-ink py-24" ref={ref}>
      <div className="fyn-container">
        <span className="fyn-caption text-fyn-gold block mb-4 text-center reveal-up">Getting Started</span>
        <h2 className="text-3xl md:text-4xl lg:text-[44px] leading-[1.2] text-white text-center mb-16 reveal-up">
          From zero to financial intelligence in 10 minutes.
        </h2>

        <div className="relative">
          {/* Connector line — desktop */}
          <div className="hidden md:block absolute top-[36px] left-[12%] right-[12%] h-0.5 bg-fyn-red/20">
            <div className="h-full bg-fyn-red rounded-full progress-fill-animate" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 stagger-children">
            {steps.map((s, i) => (
              <div
                key={s.title}
                className="relative cursor-pointer"
                onClick={() => setExpanded(expanded === i ? null : i)}
              >
                {/* Step number */}
                <div className="w-[72px] h-[72px] rounded-full bg-fyn-red flex items-center justify-center mx-auto mb-5 relative z-10 transition-transform duration-300 hover:scale-110"
                  style={{ transitionTimingFunction: "var(--ease-spring)" }}>
                  <span className="text-white font-display text-2xl font-bold">{i + 1}</span>
                </div>

                <div className="bg-white/5 border border-white/8 rounded-lg p-5 hover-card">
                  <h3 className="text-white font-semibold text-base mb-1">{s.title}</h3>
                  <p className="text-white/40 text-sm mb-3">{s.sub}</p>

                  <div className={`overflow-hidden transition-all duration-500 ${
                    expanded === i ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0"
                  }`} style={{ transitionTimingFunction: "var(--ease-spring)" }}>
                    <p className="text-white/55 text-sm leading-relaxed pt-3 border-t border-white/10">{s.detail}</p>
                  </div>

                  <button className="text-fyn-red text-xs font-medium mt-2">
                    {expanded === i ? "Show less" : "Learn more →"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
