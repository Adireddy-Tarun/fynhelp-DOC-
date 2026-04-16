import { useState } from "react";
import { Link } from "react-router-dom";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const suites = [
  { name: "Liquidity Intelligence", dot: "#C41E1E", modules: 6, desc: "Real-time cash position, burn rate, runway forecast, and working capital — every morning before you ask.", preview: ["Financial Health Score", "Cash Flow Projection", "Burn Acceleration", "Liquidity Alerts", "Working Capital Optimizer", "Seasonal Cash Modeler"] },
  { name: "Revenue Intelligence", dot: "#1A4A8B", modules: 8, desc: "Know which customers will pay, who won't, and exactly what to do before a ₹10L receivable becomes a write-off.", preview: ["Receivables AI", "Default Prediction", "Customer Risk Score", "Collections Automation"] },
  { name: "Cost Intelligence", dot: "#1A6B3C", modules: 6, desc: "See where every rupee of your business expense goes, and where to cut without cutting what matters.", preview: ["Spend Control", "Vendor Signals", "Payables Optimizer"] },
  { name: "GST & Tax Intelligence", dot: "#8B5A00", modules: 10, desc: "Stop paying for your vendors' non-compliance. Protect your ITC, reduce notice risk, file with confidence.", preview: ["ITC Reconciliation Engine", "Notice Risk Scorer", "Smart Filing Calendar"] },
  { name: "Governance Intelligence", dot: "#8B6914", modules: 10, desc: "50+ annual compliance obligations. One intelligent calendar that tells you what to do and when.", preview: ["Compliance Health Dashboard", "Filing Alerts", "Audit Readiness Score"] },
  { name: "HR & Workforce", dot: "#0F766E", modules: 10, desc: "Know when you can afford to hire, who's at attrition risk, and what every team member truly costs.", preview: ["Hiring Forecast AI", "Workforce Cost Model", "Attrition Risk Predictor"] },
  { name: "Decision Simulator", dot: "#C41E1E", modules: 8, desc: "See the exact cash impact of every major decision before you make it. 8 scenarios. Your live data.", preview: ["Credit Term Simulator", "Hiring Impact Model", "Pricing Scenario Tool"] },
  { name: "Market & Growth", dot: "#DC6B19", modules: 6, desc: "Know where you stand in your industry, what you qualify for, and when you're ready to grow.", preview: ["Industry Benchmarking Engine", "Credit Rating Simulator", "Fundraise Readiness Index"] },
  { name: "Banking & Fintech", dot: "#1A4A8B", modules: 6, desc: "All your bank accounts, UPI transactions, and loan options — unified and intelligently analyzed.", preview: ["Multi-Bank Aggregation", "Account Aggregator Sync", "Loan Eligibility Scorer"] },
  { name: "CA Partner Ecosystem", dot: "#8B6914", modules: 4, desc: "For CA firms managing 50+ SME clients — a white-label intelligence platform that makes you indispensable.", preview: ["CA White-Label Dashboard", "Client Portfolio View", "Automated Client Reports"] },
];

export default function SuitesSection() {
  const ref = useScrollReveal();
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <section className="bg-fyn-beige py-24" ref={ref}>
      <div className="fyn-container">
        <span className="fyn-caption text-fyn-gold block mb-4 reveal-up">What FynHelp Does</span>
        <h2 className="text-3xl md:text-4xl lg:text-[44px] leading-[1.2] text-fyn-ink mb-3 reveal-up">
          10 intelligence suites. 50+ modules. One AI connecting everything.
        </h2>
        <p className="text-fyn-ink/60 text-lg mb-12 max-w-3xl reveal-up" style={{ transitionDelay: "100ms" }}>
          Most financial tools give you dashboards. FynHelp gives you a CFO who has read every dashboard and tells you what matters.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 stagger-children">
          {suites.map((s, i) => (
            <div
              key={s.name}
              className="bg-fyn-beige-card border border-fyn-ink/10 rounded-lg p-5 cursor-pointer transition-all duration-300 relative overflow-hidden group"
              style={{
                transform: hovered === i ? "translateY(-4px)" : "translateY(0)",
                boxShadow: hovered === i ? "0 12px 40px rgba(26,16,8,0.12)" : "none",
                borderColor: hovered === i ? "#C41E1E" : undefined,
              }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.dot }} />
                <span className="text-fyn-ink/50 text-[10px] fyn-caption">{s.modules} modules</span>
              </div>
              <h3 className="font-display text-lg text-fyn-ink mb-2">{s.name}</h3>
              <p className="text-fyn-ink/55 text-sm leading-relaxed mb-3">{s.desc}</p>
              <div className="border-t border-fyn-ink/8 pt-3">
                <Link to="/products" className="text-fyn-red text-sm font-medium hover:underline">Explore modules →</Link>
              </div>

              {/* Hover drawer */}
              <div className={`absolute inset-x-0 bottom-0 bg-fyn-ink rounded-b-lg px-4 py-3 transition-all duration-300 ${
                hovered === i ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
              }`}>
                <div className="flex flex-wrap gap-1.5">
                  {s.preview.slice(0, 3).map((m) => (
                    <span key={m} className="text-[10px] bg-white/10 text-white/70 px-2 py-0.5 rounded">{m}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
