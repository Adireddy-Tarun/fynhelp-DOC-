import DashboardLayout from "@/components/DashboardLayout";
import GlobalBackBar from "@/components/GlobalBackBar";

// BACKEND: benchmark_data WHERE industry + turnover_slab match
const benchmarks = [
  { metric: "Gross Margin", you: "34%", avg: "31%", status: "↑ Better", color: "#166534" },
  { metric: "DSO", you: "42d", avg: "30d", status: "↑ Slower", color: "#C41E1E" },
  { metric: "Revenue Growth", you: "8%", avg: "12%", status: "↓ Below", color: "#8B5A00" },
  { metric: "Cost/Revenue", you: "66%", avg: "69%", status: "↑ Better", color: "#166534" },
];

// BACKEND: compute credit factors from businesses + compliance + receivables
const creditFactors = [
  { sign: "↑", text: "Revenue consistency: helping score", color: "#166534" },
  { sign: "↓", text: "High DSO: hurting score (-8 pts)", color: "#C41E1E" },
  { sign: "↓", text: "2 late GST filings: hurting score (-5 pts)", color: "#C41E1E" },
];

const fundraiseChecks = [
  { ok: true, text: "12 months financial data available" },
  { ok: true, text: "GST filings regular (2 late — caution)" },
  { ok: true, text: "Revenue growing month-on-month" },
  { ok: false, text: "Working capital cycle > 45 days" },
  { ok: false, text: "No audited financials on file" },
];

const signals = [
  { title: "Cotton prices up 8% in Maharashtra", cat: "Raw Materials", source: "CBIC data", impact: "Affects your COGS", iColor: "#8B5A00", iBg: "#FFFBEB" },
  { title: "GST ITC claims scrutiny increased", cat: "Compliance", source: "CBIC circular", impact: "Review your ITC position", iColor: "#991B1B", iBg: "#FEF2F2" },
  { title: "MSME lending rates eased by RBI", cat: "Financing", source: "RBI", impact: "Check your loan eligibility", iColor: "#166534", iBg: "#F0FDF4" },
];

const Card = ({ children, className = "" }: any) => (
  <div className={`rounded-lg p-6 ${className}`} style={{ background: "#FFFFFF", border: "1px solid #D4C9A8" }}>{children}</div>
);

export default function MarketGrowthPage() {
  // BACKEND: if subscription_status = 'early_access' show full page (no gate)
  return (
    <DashboardLayout>
      <GlobalBackBar />
      <div className="max-w-[1280px] mx-auto px-6 py-8 space-y-6 font-sans">
        <div>
          <h1 style={{ fontFamily: "Inter", fontWeight: 700, fontSize: 28, color: "#1A1008" }}>Market & Growth Intelligence</h1>
          <p className="mt-1.5" style={{ fontFamily: "Inter", fontSize: 15, color: "rgba(26,16,8,0.60)" }}>
            See where you stand in your industry. Know what you qualify for. Plan your next move.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card 1: Benchmarking */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 style={{ fontFamily: "Inter", fontWeight: 600, fontSize: 15, color: "#1A1008" }}>Industry Benchmarking</h2>
              <div className="flex gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase" style={{ background: "#C41E1E", color: "#FFF" }}>Pro+</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase" style={{ background: "#F4EDDA", color: "rgba(26,16,8,0.65)" }}>Monthly</span>
              </div>
            </div>
            <table className="w-full" style={{ fontFamily: "Inter", fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #F0EBD8" }}>
                  {["Metric", "You", "Industry Avg", "Status"].map((h) => (
                    <th key={h} className="text-left py-2 font-medium" style={{ color: "rgba(26,16,8,0.55)", fontSize: 11 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {benchmarks.map((b) => (
                  <tr key={b.metric} style={{ borderBottom: "1px solid #F0EBD8" }}>
                    <td className="py-2.5" style={{ color: "#1A1008" }}>{b.metric}</td>
                    <td className="py-2.5" style={{ color: "#1A1008", fontWeight: 600 }}>{b.you}</td>
                    <td className="py-2.5" style={{ color: "rgba(26,16,8,0.60)" }}>{b.avg}</td>
                    <td className="py-2.5" style={{ color: b.color, fontWeight: 600 }}>{b.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-3 text-xs" style={{ color: "rgba(26,16,8,0.45)" }}>Based on 500+ anonymised businesses in Textile & Trading, ₹5-25Cr segment.</p>
          </Card>

          {/* Card 2: Credit Rating */}
          <Card>
            <h2 style={{ fontFamily: "Inter", fontWeight: 600, fontSize: 15, color: "#1A1008", marginBottom: 16 }}>Credit Rating Simulator</h2>
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs" style={{ color: "rgba(26,16,8,0.55)" }}>0</span>
                <span style={{ fontFamily: "Inter", fontWeight: 700, fontSize: 18, color: "#8B5A00" }}>68/100 · Good</span>
                <span className="text-xs" style={{ color: "rgba(26,16,8,0.55)" }}>100</span>
              </div>
              <div className="w-full h-3 rounded-full relative" style={{ background: "#F0EBD8" }}>
                <div className="h-full rounded-full" style={{ width: "68%", background: "linear-gradient(90deg, #DC2626, #F59E0B, #16A34A)" }} />
                <div className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2" style={{ left: "calc(68% - 8px)", background: "#FFF", borderColor: "#1A1008" }} />
              </div>
            </div>
            <div className="space-y-1.5 mb-3">
              {creditFactors.map((f, i) => (
                <p key={i} className="text-xs" style={{ color: "rgba(26,16,8,0.70)" }}>
                  <span style={{ color: f.color, fontWeight: 700 }}>{f.sign}</span> {f.text}
                </p>
              ))}
            </div>
            <p className="text-xs mb-3 p-2 rounded" style={{ background: "#F0FDF4", color: "#166534" }}>If you collect all overdues: score → 74</p>
            <p className="text-xs font-semibold mb-1" style={{ color: "#1A1008" }}>Loan eligibility at current score:</p>
            <ul className="text-xs space-y-0.5" style={{ color: "rgba(26,16,8,0.70)" }}>
              <li>Working capital: up to ₹18L</li>
              <li>Term loan: up to ₹45L</li>
              <li>CGTMSE: eligible</li>
            </ul>
            <button className="mt-3 px-3 py-1.5 rounded text-xs font-medium" style={{ background: "#FFFFFF", border: "1px solid #D4C9A8", color: "#1A1008" }}>Improve score →</button>
          </Card>

          {/* Card 3: Fundraise Readiness */}
          <Card>
            <h2 style={{ fontFamily: "Inter", fontWeight: 600, fontSize: 15, color: "#1A1008", marginBottom: 16 }}>Fundraise Readiness</h2>
            <p style={{ fontFamily: "Inter", fontWeight: 700, fontSize: 28, color: "#8B5A00" }}>61<span className="text-base" style={{ color: "rgba(26,16,8,0.45)" }}>/100</span></p>
            <div className="w-full h-2 rounded-full mt-2 mb-4" style={{ background: "#F0EBD8" }}>
              <div className="h-full rounded-full" style={{ width: "61%", background: "#FCD34D" }} />
            </div>
            <div className="space-y-2">
              {fundraiseChecks.map((c, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <span style={{ color: c.ok ? "#166534" : "#C41E1E", fontWeight: 700, fontSize: 14 }}>{c.ok ? "✓" : "✗"}</span>
                  <span style={{ color: "rgba(26,16,8,0.70)" }}>{c.text}</span>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs font-medium" style={{ color: "#1A1008" }}>3 of 5 investor requirements met</p>
            <button className="mt-2 text-xs font-medium" style={{ color: "#C41E1E" }}>What investors check →</button>
          </Card>

          {/* Card 4: Export */}
          <Card>
            <h2 style={{ fontFamily: "Inter", fontWeight: 600, fontSize: 15, color: "#1A1008", marginBottom: 16 }}>Export Opportunities</h2>
            <p className="text-xs mb-3" style={{ color: "rgba(26,16,8,0.65)" }}>Based on your GSTIN and industry, you may qualify for these export incentives:</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between py-2" style={{ borderBottom: "1px solid #F0EBD8" }}>
                <span className="text-xs font-medium" style={{ color: "#1A1008" }}>MEIS / RoDTEP</span>
                <button className="text-xs font-medium" style={{ color: "#C41E1E" }}>Check eligibility →</button>
              </div>
              <div className="flex items-center justify-between py-2" style={{ borderBottom: "1px solid #F0EBD8" }}>
                <span className="text-xs font-medium" style={{ color: "#1A1008" }}>GST Refund on Exports</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ background: "#F0FDF4", color: "#166534" }}>You qualify</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-xs font-medium" style={{ color: "#1A1008" }}>ECGC Credit Insurance</span>
                <button className="text-xs font-medium" style={{ color: "#C41E1E" }}>Learn more →</button>
              </div>
            </div>
            <p className="mt-3 text-xs" style={{ color: "rgba(26,16,8,0.50)" }}>Export GST refund: you had ₹0 export transactions in last 6 months.</p>
          </Card>
        </div>

        {/* Competitor signals */}
        <Card>
          <h2 style={{ fontFamily: "Inter", fontWeight: 600, fontSize: 15, color: "#1A1008", marginBottom: 16 }}>Industry signals this month</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {signals.map((s) => (
              <div key={s.title} className="rounded-lg p-4" style={{ border: "1px solid #E0D9C8" }}>
                <p style={{ fontFamily: "Inter", fontWeight: 600, fontSize: 13, color: "#1A1008", lineHeight: 1.4 }}>{s.title}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-medium" style={{ background: "#F4EDDA", color: "rgba(26,16,8,0.65)" }}>{s.cat}</span>
                  <span className="text-[10px]" style={{ color: "rgba(26,16,8,0.45)" }}>{s.source}</span>
                </div>
                <span className="inline-block mt-2 px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ background: s.iBg, color: s.iColor }}>{s.impact}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
