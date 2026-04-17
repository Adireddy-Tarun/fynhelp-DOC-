import DashboardLayout from "@/components/DashboardLayout";
import GlobalBackBar from "@/components/GlobalBackBar";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer } from "recharts";

// BACKEND: compute_dso() + compute_dpo() + monthly aggregates
const dsoTrend = [
  { m: "May", dso: 38 }, { m: "Jun", dso: 40 }, { m: "Jul", dso: 39 }, { m: "Aug", dso: 41 },
  { m: "Sep", dso: 43 }, { m: "Oct", dso: 42 }, { m: "Nov", dso: 44 }, { m: "Dec", dso: 41 },
  { m: "Jan", dso: 42 }, { m: "Feb", dso: 43 }, { m: "Mar", dso: 41 }, { m: "Apr", dso: 42 },
];
const dpoTrend = [
  { m: "May", dpo: 32 }, { m: "Jun", dpo: 31 }, { m: "Jul", dpo: 30 }, { m: "Aug", dpo: 30 },
  { m: "Sep", dpo: 29 }, { m: "Oct", dpo: 29 }, { m: "Nov", dpo: 28 }, { m: "Dec", dpo: 28 },
  { m: "Jan", dpo: 28 }, { m: "Feb", dpo: 27 }, { m: "Mar", dpo: 28 }, { m: "Apr", dpo: 28 },
];

// BACKEND: payables JOIN vendors, compute avg_days_to_pay vs payment_terms_days
const vendors = [
  { name: "Raj Textiles", terms: 30, payIn: 22, gap: 8, opp: "₹60K" },
  { name: "Mumbai Mills", terms: 45, payIn: 28, gap: 17, opp: "₹1.1L" },
  { name: "Surat Fabrics", terms: 30, payIn: 31, gap: 0, opp: "—" },
  { name: "Ahmedabad Yarn", terms: 30, payIn: 24, gap: 6, opp: "₹40K" },
  { name: "Coimbatore Dyes", terms: 60, payIn: 35, gap: 25, opp: "₹0.8L" },
];

const DarkMetric = ({ label, value, valueColor = "#FFFFFF", sub, subColor, bg = "#1A1008" }: any) => (
  <div className="rounded-lg p-5" style={{ background: bg }}>
    <p className="text-xs font-sans" style={{ color: "rgba(255,255,255,0.45)", letterSpacing: "0.08em", fontWeight: 500 }}>{label}</p>
    <p className="mt-2" style={{ fontFamily: "Inter", fontWeight: 700, fontSize: 36, color: valueColor, lineHeight: 1.1 }}>{value}</p>
    <p className="mt-2 text-xs font-sans" style={{ color: subColor || "rgba(255,255,255,0.60)" }}>{sub}</p>
  </div>
);

const Card = ({ children, className = "" }: any) => (
  <div className={`rounded-lg p-6 ${className}`} style={{ background: "#FFFFFF", border: "1px solid #D4C9A8" }}>{children}</div>
);

export default function WorkingCapitalPage() {
  return (
    <DashboardLayout>
      <GlobalBackBar />
      <div className="max-w-[1280px] mx-auto px-6 py-8 space-y-6 font-sans">
        <div>
          <h1 style={{ fontFamily: "Inter", fontWeight: 700, fontSize: 28, color: "#1A1008" }}>Working Capital Optimizer</h1>
          <p className="mt-1.5" style={{ fontFamily: "Inter", fontSize: 15, color: "rgba(26,16,8,0.60)" }}>
            See exactly how much cash is locked in your business cycle and how to free it up.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <DarkMetric label="DSO" value="42 days" sub="Industry avg: 30 · 12d above benchmark" subColor="#F87171" />
          <DarkMetric label="DPO" value="28 days" sub="Industry avg: 35 · paying 7d too fast" subColor="#FCD34D" />
          <DarkMetric label="WORKING CAPITAL CYCLE" value="14 days" sub="Days your cash is tied up" />
          <DarkMetric label="CASH UNLOCKABLE" value="₹4.2L" valueColor="#4ADE80" sub="If you hit benchmarks" bg="#166534" />
        </div>

        {/* Cycle diagram */}
        <Card>
          <h2 style={{ fontFamily: "Inter", fontWeight: 600, fontSize: 15, color: "#1A1008", marginBottom: 20 }}>Your cash conversion cycle</h2>
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {[
              { label: "PURCHASE", days: "" },
              { label: "INVENTORY", days: "10 days" },
              { label: "INVOICE", days: "4 days" },
              { label: "COLLECT", days: "42 days", red: true },
            ].map((s, i) => (
              <div key={s.label} className="flex items-center gap-2 flex-shrink-0">
                <div className="rounded-lg px-4 py-3 text-center min-w-[120px]" style={{ background: "#F4EDDA", border: "1px solid #D4C9A8" }}>
                  <p style={{ fontFamily: "Inter", fontWeight: 700, fontSize: 11, letterSpacing: "0.08em", color: "#1A1008" }}>{s.label}</p>
                  {s.days && <p className="mt-1" style={{ fontFamily: "Inter", fontSize: 12, color: s.red ? "#C41E1E" : "rgba(26,16,8,0.60)", fontWeight: s.red ? 600 : 400 }}>{s.days}</p>}
                </div>
                {i < 3 && <span style={{ color: "rgba(26,16,8,0.30)", fontSize: 18 }}>→</span>}
              </div>
            ))}
          </div>
          <p className="mt-4" style={{ fontFamily: "Inter", fontWeight: 600, fontSize: 14, color: "#1A1008" }}>Total cycle: 56 days</p>
          <div className="mt-4 space-y-2">
            <div>
              <div className="flex items-center justify-between text-xs mb-1"><span style={{ color: "rgba(26,16,8,0.55)" }}>Industry avg</span><span style={{ color: "#1A1008", fontWeight: 600 }}>38 days</span></div>
              <div className="w-full h-2 rounded-full" style={{ background: "#F0EBD8" }}><div className="h-full rounded-full" style={{ width: "68%", background: "rgba(26,16,8,0.40)" }} /></div>
            </div>
            <div>
              <div className="flex items-center justify-between text-xs mb-1"><span style={{ color: "#C41E1E", fontWeight: 600 }}>Your cycle</span><span style={{ color: "#C41E1E", fontWeight: 600 }}>56 days</span></div>
              <div className="w-full h-2 rounded-full" style={{ background: "#F0EBD8" }}><div className="h-full rounded-full" style={{ width: "100%", background: "#C41E1E" }} /></div>
            </div>
          </div>
          <p className="mt-3 text-xs" style={{ color: "#C41E1E", fontWeight: 500 }}>18 extra days = ₹4.2L locked</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-6">
            <div className="rounded-lg p-4" style={{ background: "#F0FDF4", border: "1px solid #A7F3D0" }}>
              <p style={{ fontFamily: "Inter", fontWeight: 600, fontSize: 13, color: "#166534" }}>Collect Faster</p>
              <p className="mt-1 text-xs" style={{ color: "rgba(26,16,8,0.65)" }}>Reduce DSO from 42d → 30d</p>
              <p className="mt-2 text-sm font-semibold" style={{ color: "#166534" }}>+₹2.4L freed, +8 days runway</p>
              <a href="/dashboard/receivables" className="inline-block mt-2 text-xs font-medium" style={{ color: "#C41E1E" }}>Chase overdue invoices →</a>
            </div>
            <div className="rounded-lg p-4" style={{ background: "#FFFBEB", border: "1px solid #FCD34D" }}>
              <p style={{ fontFamily: "Inter", fontWeight: 600, fontSize: 13, color: "#8B5A00" }}>Pay Slower</p>
              <p className="mt-1 text-xs" style={{ color: "rgba(26,16,8,0.65)" }}>Extend DPO from 28d → 35d</p>
              <p className="mt-2 text-sm font-semibold" style={{ color: "#8B5A00" }}>+₹1.8L preserved, +5 days runway</p>
              <a href="/dashboard/payables" className="inline-block mt-2 text-xs font-medium" style={{ color: "#C41E1E" }}>Review payment schedule →</a>
            </div>
            <div className="rounded-lg p-4" style={{ background: "#EFF6FF", border: "1px solid #BFDBFE" }}>
              <p style={{ fontFamily: "Inter", fontWeight: 600, fontSize: 13, color: "#1E40AF" }}>Invoice Faster</p>
              <p className="mt-1 text-xs" style={{ color: "rgba(26,16,8,0.65)" }}>Invoice on delivery, not month-end</p>
              <p className="mt-2 text-sm font-semibold" style={{ color: "#1E40AF" }}>+₹0.8L cycle improvement</p>
              <a href="/dashboard/receivables" className="inline-block mt-2 text-xs font-medium" style={{ color: "#C41E1E" }}>Review invoicing pattern →</a>
            </div>
          </div>
        </Card>

        {/* DSO + DPO trends */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <h3 style={{ fontFamily: "Inter", fontWeight: 600, fontSize: 14, color: "#1A1008", marginBottom: 12 }}>DSO Trend (12 months)</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={dsoTrend}>
                <CartesianGrid stroke="#F0EBD8" strokeDasharray="3 3" />
                <XAxis dataKey="m" stroke="rgba(26,16,8,0.45)" fontSize={11} />
                <YAxis stroke="rgba(26,16,8,0.45)" fontSize={11} />
                <Tooltip contentStyle={{ background: "#1A1008", border: "none", borderRadius: 6, color: "#FFF", fontSize: 12 }} />
                <ReferenceLine y={30} stroke="#16A34A" strokeDasharray="4 4" label={{ value: "Industry 30d", fill: "#16A34A", fontSize: 10, position: "right" }} />
                <Line type="monotone" dataKey="dso" stroke="#C41E1E" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
          <Card>
            <h3 style={{ fontFamily: "Inter", fontWeight: 600, fontSize: 14, color: "#1A1008", marginBottom: 12 }}>DPO Trend (12 months)</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={dpoTrend}>
                <CartesianGrid stroke="#F0EBD8" strokeDasharray="3 3" />
                <XAxis dataKey="m" stroke="rgba(26,16,8,0.45)" fontSize={11} />
                <YAxis stroke="rgba(26,16,8,0.45)" fontSize={11} />
                <Tooltip contentStyle={{ background: "#1A1008", border: "none", borderRadius: 6, color: "#FFF", fontSize: 12 }} />
                <ReferenceLine y={35} stroke="#16A34A" strokeDasharray="4 4" label={{ value: "Industry 35d", fill: "#16A34A", fontSize: 10, position: "right" }} />
                <Line type="monotone" dataKey="dpo" stroke="#8B5A00" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Vendor analysis */}
        <Card>
          <h2 style={{ fontFamily: "Inter", fontWeight: 600, fontSize: 15, color: "#1A1008", marginBottom: 16 }}>Are you paying vendors too fast?</h2>
          <div className="overflow-x-auto">
            <table className="w-full" style={{ fontFamily: "Inter", fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #D4C9A8" }}>
                  {["Vendor", "Their Terms", "You Pay In", "Gap", "Opportunity"].map((h) => (
                    <th key={h} className="text-left py-2.5 font-medium" style={{ color: "rgba(26,16,8,0.55)", fontSize: 12 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {vendors.map((v) => (
                  <tr key={v.name} style={{ borderBottom: "1px solid #F0EBD8" }}>
                    <td className="py-2.5" style={{ color: "#1A1008", fontWeight: 500 }}>{v.name}</td>
                    <td className="py-2.5" style={{ color: "rgba(26,16,8,0.70)" }}>{v.terms} days</td>
                    <td className="py-2.5" style={{ color: "rgba(26,16,8,0.70)" }}>{v.payIn} days</td>
                    <td className="py-2.5" style={{ color: v.gap > 0 ? "#C41E1E" : "#166534", fontWeight: 600 }}>{v.gap > 0 ? `${v.gap}d early` : "On time"}</td>
                    <td className="py-2.5" style={{ color: "#1A1008", fontWeight: 600 }}>{v.opp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="rounded-lg p-4 mt-4" style={{ background: "#FFFBEB", border: "1px solid #FCD34D" }}>
            <p style={{ fontFamily: "Inter", fontSize: 14, color: "#8B5A00" }}>
              Extending all vendor payments to full terms would free <strong>₹1.8L</strong> in working capital.
            </p>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
