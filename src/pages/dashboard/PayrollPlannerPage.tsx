import DashboardLayout from "@/components/DashboardLayout";
import GlobalBackBar from "@/components/GlobalBackBar";
import {
  ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ResponsiveContainer,
} from "recharts";
import { useState } from "react";

// BACKEND: GET /api/payroll/current-month
// SELECT * FROM payroll_records WHERE business_id ORDER BY period_month DESC LIMIT 1
const cashTimeline = [
  { date: "Apr 17", balance: 12.4 },
  { date: "Apr 22", balance: 11.1 },
  { date: "Apr 27", balance: 9.8 },
  { date: "May 1", balance: 4.0, payroll: 8.4 },
  { date: "May 10", balance: 5.2 },
  { date: "May 20", balance: 6.8 },
  { date: "Jun 1", balance: 1.8, payroll: 8.6 },
  { date: "Jun 15", balance: 4.5 },
  { date: "Jul 1", balance: 0.9, payroll: 8.6 },
];

// BACKEND: payroll_records breakdown columns
const breakdown = [
  { label: "Basic Salary", amount: "₹5.1L", pct: "61%" },
  { label: "HRA", amount: "₹1.2L", pct: "14%" },
  { label: "Other Allowances", amount: "₹0.58L", pct: "7%" },
  { label: "PF Employer", amount: "₹0.61L", pct: "7%" },
  { label: "ESIC Employer", amount: "₹0.27L", pct: "3%" },
  { label: "Bonus Provision", amount: "₹0.70L", pct: "8%" },
];

// BACKEND: compliance_events WHERE event_type IN ('pf','esic','tds_salary','professional_tax')
const compliance = [
  { name: "PF ECR", sub: "Apr 15 · Employer + Employee", amount: "₹1.01L", status: "due" },
  { name: "ESIC Deposit", sub: "Apr 15 · Employer + Employee", amount: "₹27K", status: "due" },
  { name: "TDS on Salary", sub: "Apr 30 · Form 24Q", amount: "₹86K", status: "scheduled" },
  { name: "Professional Tax", sub: "Maharashtra · Monthly", amount: "₹2.4K", status: "scheduled" },
];

// BACKEND: SELECT * FROM payroll_records WHERE business_id ORDER BY period_month DESC LIMIT 6
const history = [
  { month: "Mar 2026", hc: 14, gross: "₹8.2L", pf: "₹0.99L", esic: "₹0.26L", tds: "₹0.82L", net: "₹6.13L", status: "Disbursed" },
  { month: "Feb 2026", hc: 14, gross: "₹8.1L", pf: "₹0.97L", esic: "₹0.26L", tds: "₹0.80L", net: "₹6.07L", status: "Disbursed" },
  { month: "Jan 2026", hc: 13, gross: "₹7.6L", pf: "₹0.91L", esic: "₹0.24L", tds: "₹0.74L", net: "₹5.71L", status: "Disbursed" },
  { month: "Dec 2025", hc: 13, gross: "₹7.6L", pf: "₹0.91L", esic: "₹0.24L", tds: "₹0.74L", net: "₹5.71L", status: "Disbursed" },
  { month: "Nov 2025", hc: 13, gross: "₹7.5L", pf: "₹0.90L", esic: "₹0.24L", tds: "₹0.72L", net: "₹5.64L", status: "Disbursed" },
  { month: "Oct 2025", hc: 12, gross: "₹7.0L", pf: "₹0.84L", esic: "₹0.22L", tds: "₹0.68L", net: "₹5.26L", status: "Disbursed" },
];

const DarkMetric = ({ label, value, valueColor = "#FFFFFF", sub, subColor }: { label: string; value: string; valueColor?: string; sub: string; subColor?: string }) => (
  <div className="rounded-lg p-5" style={{ background: "#1A1008" }}>
    <p className="text-xs font-sans" style={{ color: "rgba(255,255,255,0.45)", letterSpacing: "0.08em", fontWeight: 500 }}>{label}</p>
    <p className="mt-2" style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: 36, color: valueColor, lineHeight: 1.1 }}>{value}</p>
    <p className="mt-2 text-xs font-sans" style={{ color: subColor || "rgba(255,255,255,0.60)" }}>{sub}</p>
  </div>
);

const SectionCard = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-lg p-6" style={{ background: "#FFFFFF", border: "1px solid #D4C9A8" }}>{children}</div>
);

export default function PayrollPlannerPage() {
  const [ctc, setCtc] = useState(800000);
  const [hires, setHires] = useState(1);
  const monthly = Math.round((ctc * 1.18) / 12); // CTC + ~18% statutory
  const runwayHit = Math.round((monthly * hires) / 50000); // crude est days

  return (
    <DashboardLayout>
      <GlobalBackBar />
      <div className="max-w-[1280px] mx-auto px-6 py-8 space-y-6 font-sans">
        <div>
          <h1 style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: 28, color: "#1A1008" }}>Payroll Planner</h1>
          <p className="mt-1.5" style={{ fontFamily: "Inter, sans-serif", fontWeight: 400, fontSize: 15, color: "rgba(26,16,8,0.60)" }}>
            Plan every payroll cycle with cash visibility. Know your obligations before the date arrives.
          </p>
        </div>

        {/* Top metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <DarkMetric label="NEXT PAYROLL AMOUNT" value="₹8.4L" sub="May 1, 2026 · 18 days away" subColor="#4ADE80" />
          <DarkMetric label="CASH AFTER PAYROLL" value="₹4.0L" valueColor="#FCD34D" sub="Projected balance on May 1" />
          <DarkMetric label="TOTAL EMPLOYER COST" value="₹9.8L" sub="CTC + PF + ESIC + bonus provision" />
          <DarkMetric label="COMPLIANCE DUE" value="Apr 15" valueColor="#FCD34D" sub="PF + ESIC deposit" />
        </div>

        {/* Cash timeline */}
        <SectionCard>
          <h2 style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: 15, color: "#1A1008", marginBottom: 16 }}>
            Cash vs Payroll — Next 3 Months
          </h2>
          <ResponsiveContainer width="100%" height={240}>
            <ComposedChart data={cashTimeline} margin={{ top: 24, right: 24, bottom: 8, left: 0 }}>
              <defs>
                <linearGradient id="cashFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1A4A8B" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#1A4A8B" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#F0EBD8" strokeDasharray="3 3" />
              <XAxis dataKey="date" stroke="rgba(26,16,8,0.45)" fontSize={11} />
              <YAxis stroke="rgba(26,16,8,0.45)" fontSize={11} tickFormatter={(v) => `₹${v}L`} />
              <Tooltip
                contentStyle={{ background: "#1A1008", border: "none", borderRadius: 6, fontFamily: "Inter", fontSize: 12, color: "#FFF" }}
                formatter={(v: number, name: string) => [`₹${v}L`, name === "balance" ? "Balance" : "Payroll"]}
              />
              <ReferenceLine y={3} stroke="#C41E1E" strokeDasharray="4 4" label={{ value: "Danger ₹3L", fill: "#C41E1E", fontSize: 11, position: "right" }} />
              {cashTimeline.filter((d) => d.payroll).map((d) => (
                <ReferenceLine key={d.date} x={d.date} stroke="#C41E1E" strokeDasharray="3 3" label={{ value: `Payroll ₹${d.payroll}L`, fill: "#C41E1E", fontSize: 10, position: "top" }} />
              ))}
              <Area type="monotone" dataKey="balance" stroke="#1A4A8B" strokeWidth={2} fill="url(#cashFill)" />
            </ComposedChart>
          </ResponsiveContainer>
          {/* BACKEND: if any projected_balance < 3L → show warning */}
          <div className="rounded-lg p-4 mt-4" style={{ background: "#FEF2F2", border: "1px solid #FCA5A5" }}>
            <p style={{ fontFamily: "Inter", fontWeight: 400, fontSize: 14, color: "#991B1B" }}>
              Payroll risk detected: Cash may drop to ₹1.8L after June payroll. Collect ₹4L from receivables or arrange ₹3L bridge to stay safe.
            </p>
            <div className="flex gap-3 mt-3">
              <a href="/dashboard/receivables" className="px-3 py-1.5 rounded text-white text-xs font-medium" style={{ background: "#C41E1E" }}>Chase receivables →</a>
              <a href="/dashboard/banking" className="px-3 py-1.5 rounded text-xs font-medium" style={{ background: "#FFFFFF", border: "1px solid #D4C9A8", color: "#1A1008" }}>Explore financing →</a>
            </div>
          </div>
        </SectionCard>

        {/* Breakdown + Compliance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SectionCard>
            <h2 style={{ fontFamily: "Inter", fontWeight: 600, fontSize: 15, color: "#1A1008", marginBottom: 16 }}>April 2026 Payroll Breakdown</h2>
            <div className="space-y-2">
              {breakdown.map((b) => (
                <div key={b.label} className="flex items-center justify-between py-1.5">
                  <span style={{ fontFamily: "Inter", fontSize: 14, color: "#1A1008" }}>{b.label}</span>
                  <div className="flex items-center gap-4">
                    <span style={{ fontFamily: "Inter", fontWeight: 600, fontSize: 14, color: "#1A1008" }}>{b.amount}</span>
                    <span className="w-10 text-right" style={{ fontFamily: "Inter", fontSize: 13, color: "rgba(26,16,8,0.45)" }}>{b.pct}</span>
                  </div>
                </div>
              ))}
              <div className="flex items-center justify-between pt-3 mt-2" style={{ borderTop: "1px solid #D4C9A8" }}>
                <span style={{ fontFamily: "Inter", fontWeight: 700, fontSize: 15, color: "#1A1008" }}>GROSS TOTAL</span>
                <div className="flex items-center gap-4">
                  <span style={{ fontFamily: "Inter", fontWeight: 700, fontSize: 15, color: "#1A1008" }}>₹8.4L</span>
                  <span className="w-10 text-right" style={{ fontFamily: "Inter", fontWeight: 600, fontSize: 13, color: "rgba(26,16,8,0.60)" }}>100%</span>
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard>
            <h2 style={{ fontFamily: "Inter", fontWeight: 600, fontSize: 15, color: "#1A1008", marginBottom: 16 }}>Statutory Payments — April</h2>
            <div className="space-y-0">
              {compliance.map((c, i) => (
                <div key={c.name} className="flex items-center justify-between py-3.5" style={{ borderBottom: i < compliance.length - 1 ? "1px solid #F0EBD8" : "none" }}>
                  <div>
                    <p style={{ fontFamily: "Inter", fontWeight: 600, fontSize: 14, color: "#1A1008" }}>{c.name}</p>
                    <p className="mt-0.5" style={{ fontFamily: "Inter", fontSize: 12, color: "rgba(26,16,8,0.50)" }}>{c.sub}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span style={{ fontFamily: "Inter", fontWeight: 700, fontSize: 14, color: "#1A1008" }}>{c.amount}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase" style={{
                      background: c.status === "due" ? "#FEF3C7" : "#EFF6FF",
                      color: c.status === "due" ? "#92400E" : "#1E40AF",
                    }}>{c.status}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between mt-4 pt-3" style={{ borderTop: "1px solid #D4C9A8" }}>
              <span style={{ fontFamily: "Inter", fontWeight: 700, fontSize: 15, color: "#1A1008" }}>Total statutory</span>
              <span style={{ fontFamily: "Inter", fontWeight: 700, fontSize: 15, color: "#1A1008" }}>₹1.16L</span>
            </div>
            <button className="w-full mt-4 py-2.5 rounded text-white text-sm font-semibold" style={{ background: "#C41E1E" }}>Pay all →</button>
          </SectionCard>
        </div>

        {/* History */}
        <SectionCard>
          <div className="flex items-center justify-between mb-4">
            <h2 style={{ fontFamily: "Inter", fontWeight: 600, fontSize: 15, color: "#1A1008" }}>Last 6 months</h2>
            {/* BACKEND: GET /api/payroll/export → CSV */}
            <button className="text-xs font-medium" style={{ color: "#C41E1E" }}>Export payroll history →</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full" style={{ fontFamily: "Inter", fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #D4C9A8" }}>
                  {["Month", "Headcount", "Gross", "PF", "ESIC", "TDS", "Net", "Status"].map((h) => (
                    <th key={h} className="text-left py-2.5 font-medium" style={{ color: "rgba(26,16,8,0.55)", fontSize: 12 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {history.map((r) => (
                  <tr key={r.month} style={{ borderBottom: "1px solid #F0EBD8" }}>
                    <td className="py-2.5" style={{ color: "#1A1008", fontWeight: 500 }}>{r.month}</td>
                    <td className="py-2.5" style={{ color: "rgba(26,16,8,0.70)" }}>{r.hc}</td>
                    <td className="py-2.5" style={{ color: "#1A1008", fontWeight: 600 }}>{r.gross}</td>
                    <td className="py-2.5" style={{ color: "rgba(26,16,8,0.70)" }}>{r.pf}</td>
                    <td className="py-2.5" style={{ color: "rgba(26,16,8,0.70)" }}>{r.esic}</td>
                    <td className="py-2.5" style={{ color: "rgba(26,16,8,0.70)" }}>{r.tds}</td>
                    <td className="py-2.5" style={{ color: "#1A1008", fontWeight: 600 }}>{r.net}</td>
                    <td className="py-2.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ background: "#F0FDF4", color: "#166534" }}>{r.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>

        {/* Hiring impact */}
        <div className="rounded-lg p-6" style={{ background: "#E8DEC4", border: "1px solid #D4C9A8" }}>
          <h2 style={{ fontFamily: "Inter", fontWeight: 600, fontSize: 15, color: "#1A1008" }}>What does a new hire actually cost?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "#1A1008" }}>Annual CTC (₹)</label>
              <input type="number" value={ctc} onChange={(e) => setCtc(Number(e.target.value))}
                className="w-full px-3 rounded outline-none" style={{ height: 42, background: "#FFFFFF", border: "1px solid #D4C9A8", fontFamily: "Inter", fontSize: 14 }} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "#1A1008" }}>Number of hires</label>
              <input type="number" min={1} value={hires} onChange={(e) => setHires(Number(e.target.value))}
                className="w-full px-3 rounded outline-none" style={{ height: 42, background: "#FFFFFF", border: "1px solid #D4C9A8", fontFamily: "Inter", fontSize: 14 }} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "#1A1008" }}>Start month</label>
              <input type="month" defaultValue="2026-05"
                className="w-full px-3 rounded outline-none" style={{ height: 42, background: "#FFFFFF", border: "1px solid #D4C9A8", fontFamily: "Inter", fontSize: 14 }} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="rounded p-3" style={{ background: "#FFFFFF" }}>
              <p className="text-xs" style={{ color: "rgba(26,16,8,0.55)" }}>True monthly cost</p>
              <p style={{ fontFamily: "Inter", fontWeight: 700, fontSize: 22, color: "#C41E1E" }}>₹{(monthly * hires).toLocaleString("en-IN")}</p>
            </div>
            <div className="rounded p-3" style={{ background: "#FFFFFF" }}>
              <p className="text-xs" style={{ color: "rgba(26,16,8,0.55)" }}>Runway impact</p>
              <p style={{ fontFamily: "Inter", fontWeight: 700, fontSize: 22, color: "#8B5A00" }}>-{runwayHit} days</p>
            </div>
            <div className="rounded p-3" style={{ background: "#FFFFFF" }}>
              <p className="text-xs" style={{ color: "rgba(26,16,8,0.55)" }}>Break-even revenue/mo/hire</p>
              <p style={{ fontFamily: "Inter", fontWeight: 700, fontSize: 22, color: "#1A1008" }}>₹{Math.round(monthly * 1.4).toLocaleString("en-IN")}</p>
            </div>
          </div>
          <a href={`/dashboard/simulator?scenario=hiring&ctc=${ctc}&hires=${hires}`}
            className="inline-block mt-4 px-4 py-2 rounded text-white text-sm font-semibold" style={{ background: "#C41E1E" }}>
            Run full simulation →
          </a>
        </div>
      </div>
    </DashboardLayout>
  );
}
