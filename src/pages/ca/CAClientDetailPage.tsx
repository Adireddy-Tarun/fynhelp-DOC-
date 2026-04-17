import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { COLORS, MetricCard, Card, Chip, PrimaryBtn, SecondaryBtn, GhostLink, HealthScoreBadge } from "@/components/ca/ui";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";

const TABS = ["Overview", "Cash & Liquidity", "GST & ITC", "Compliance", "Receivables", "Payables", "HR & Payroll", "Documents", "Activity Log"];

const CLIENT = { name: "Mehta Textiles", gstin: "29ABCDE1234F1Z5", industry: "Textile", turnover: "₹12Cr", health: 38 };

const CASH_DATA = Array.from({ length: 30 }, (_, i) => ({ d: `D${i + 1}`, balance: 1000000 + Math.sin(i / 4) * 200000 - i * 8000 }));
const ITC_MISMATCHES = [
  { vendor: "Raj Textiles", gstin: "29AABCR1234X1Z2", inBooks: "₹1.2L", in2B: "₹0", risk: "₹1.2L", reviewed: false, note: "" },
  { vendor: "Mumbai Mills", gstin: "27AABCM5678Y1Z3", inBooks: "₹85K", in2B: "₹85K", risk: "₹0", reviewed: true, note: "" },
  { vendor: "Surat Fabrics", gstin: "24AABCS9012Z1Z1", inBooks: "₹2.0L", in2B: "₹0", risk: "₹2.0L", reviewed: false, note: "Vendor not filing GSTR-1" },
];

export default function CAClientDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [search, setSearch] = useSearchParams();
  const tab = search.get("tab") || "Overview";
  const setTab = (t: string) => setSearch({ tab: t });
  const [note, setNote] = useState("");

  return (
    <div className="font-sans" style={{ color: COLORS.ink }}>
      {/* Context bar */}
      <div className="px-8 h-14 flex items-center gap-4" style={{ background: COLORS.ink }}>
        <button onClick={() => navigate("/ca/dashboard")} className="text-white text-sm flex items-center gap-1.5 hover:text-[#FCD34D]">
          <ArrowLeft size={14} /> Portfolio
        </button>
        <span className="text-white font-bold text-[18px]">{CLIENT.name}</span>
        <span className="text-[12px] px-2 py-0.5 rounded font-mono" style={{ background: "rgba(255,255,255,0.10)", color: "rgba(255,255,255,0.65)" }}>{CLIENT.gstin}</span>
        <span className="text-[11px] font-medium px-2 py-0.5 rounded" style={{ background: "rgba(139,105,20,0.20)", color: "#FCD34D" }}>{CLIENT.industry}</span>
        <span className="text-[11px] font-medium px-2 py-0.5 rounded" style={{ background: "rgba(139,105,20,0.20)", color: "#FCD34D" }}>{CLIENT.turnover}</span>
        <div className="flex items-center gap-2 ml-auto">
          <HealthScoreBadge score={CLIENT.health} size={32} />
          <span className="text-white text-[13px]">Health</span>
          <button className="ml-4 h-9 px-4 rounded-md text-white text-sm font-medium" style={{ background: COLORS.red }}>Generate report →</button>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-8 bg-white sticky top-14 z-20 flex items-center gap-6 overflow-x-auto" style={{ borderBottom: `1px solid ${COLORS.caBorder}` }}>
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className="h-12 text-[13px] font-medium whitespace-nowrap transition-colors"
            style={tab === t ? { color: COLORS.red, borderBottom: `2px solid ${COLORS.red}` } : { color: "rgba(26,16,8,0.45)" }}>
            {t}
          </button>
        ))}
      </div>

      <div className="px-8 py-8 space-y-6">
        {tab === "Overview" && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              <MetricCard label="Cash Balance" value="₹4.8L" sub="Across 1 account" />
              <MetricCard label="Runway" value="18 days" valueColor={COLORS.redSoft} sub="Below 30 days — critical" />
              <MetricCard label="Revenue MTD" value="₹6.2L" sub="-12% vs last month" subColor={COLORS.amberSoft} />
              <MetricCard label="Overdue" value="₹4.5L" valueColor={COLORS.amberSoft} sub="3 invoices > 30 days" />
              <MetricCard label="ITC At Risk" value="₹3.2L" valueColor={COLORS.redSoft} sub="4 vendor mismatches" />
              <MetricCard label="Notice Risk" value="68/100" valueColor={COLORS.amberSoft} sub="Elevated" />
            </div>

            <Card dark>
              <div className="text-[10px] font-medium uppercase tracking-[0.12em] mb-2" style={{ color: COLORS.gold }}>Nidhi's latest brief</div>
              <div className="text-[14px] mb-3" style={{ color: "rgba(255,255,255,0.85)" }}>
                Mehta Textiles is in a tight spot this month. Cash will only last 18 days at current burn. Three customer payments overdue 30+ days — chasing those would extend runway by 12 days. ITC mismatches with Raj Textiles and Surat Fabrics need immediate vendor follow-up.
              </div>
              <div className="text-[11px]" style={{ color: "rgba(255,255,255,0.45)" }}>Generated April 17, 2026</div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { sev: "critical", title: "Payroll risk", body: "May payroll may exhaust cash to ₹0.4L." },
                { sev: "warning", title: "Customer chase", body: "₹4.5L overdue 30+ days from 3 customers." },
                { sev: "warning", title: "Vendor non-compliance", body: "Raj Textiles hasn't filed GSTR-1 in 3 months." },
              ].map((a, i) => (
                <Card key={i}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-2 h-2 rounded-full" style={{ background: a.sev === "critical" ? COLORS.red : COLORS.amber }} />
                    <span className="text-[11px] uppercase font-medium" style={{ color: a.sev === "critical" ? COLORS.red : COLORS.amber }}>{a.sev}</span>
                  </div>
                  <div className="text-sm font-semibold mb-1">{a.title}</div>
                  <div className="text-[13px]" style={{ color: "rgba(26,16,8,0.65)" }}>{a.body}</div>
                </Card>
              ))}
            </div>
          </>
        )}

        {tab === "Cash & Liquidity" && (
          <>
            <Card>
              <h3 className="text-[15px] font-semibold mb-4">30-day cash projection</h3>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={CASH_DATA}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F0EBD8" />
                  <XAxis dataKey="d" tick={{ fontSize: 11, fill: "rgba(26,16,8,0.50)" }} />
                  <YAxis tick={{ fontSize: 11, fill: "rgba(26,16,8,0.50)" }} tickFormatter={(v) => `₹${(v / 100000).toFixed(1)}L`} />
                  <Tooltip />
                  <Area type="monotone" dataKey="balance" stroke={COLORS.blue} fill={COLORS.blue} fillOpacity={0.15} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </Card>

            <Card>
              <h3 className="text-[15px] font-semibold mb-3">CA Notes</h3>
              <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add private note about this client's cash situation..."
                className="w-full min-h-[100px] p-3 rounded text-sm font-sans focus:outline-none"
                style={{ border: `1px solid ${COLORS.caBorder}` }} />
              <div className="flex justify-end mt-3"><PrimaryBtn size="sm">Save note</PrimaryBtn></div>
            </Card>
          </>
        )}

        {tab === "GST & ITC" && (
          <>
            <div className="grid grid-cols-3 gap-4">
              <Card><div className="text-[11px] uppercase mb-1" style={{ color: "rgba(26,16,8,0.50)" }}>Safe ITC</div><div className="text-[28px] font-bold" style={{ color: COLORS.green }}>₹4.2L</div></Card>
              <Card><div className="text-[11px] uppercase mb-1" style={{ color: "rgba(26,16,8,0.50)" }}>At Risk</div><div className="text-[28px] font-bold" style={{ color: COLORS.red }}>₹3.2L</div></Card>
              <Card><div className="text-[11px] uppercase mb-1" style={{ color: "rgba(26,16,8,0.50)" }}>Mismatches</div><div className="text-[28px] font-bold">4</div></Card>
            </div>

            <Card>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[15px] font-semibold">ITC Reconciliation — April 2026</h3>
                <PrimaryBtn size="sm">Export ITC report →</PrimaryBtn>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-[11px] uppercase tracking-wider" style={{ color: "rgba(26,16,8,0.50)" }}>
                      <th className="py-2">Vendor</th><th className="py-2">GSTIN</th><th className="py-2">In Books</th><th className="py-2">In 2B</th><th className="py-2">At Risk</th><th className="py-2">Reviewed</th><th className="py-2">CA Note</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ITC_MISMATCHES.map((m, i) => (
                      <tr key={i} style={{ borderTop: `1px solid ${COLORS.divider}` }}>
                        <td className="py-3 font-medium">{m.vendor}</td>
                        <td className="py-3 text-[12px] font-mono" style={{ color: "rgba(26,16,8,0.60)" }}>{m.gstin}</td>
                        <td className="py-3">{m.inBooks}</td>
                        <td className="py-3">{m.in2B}</td>
                        <td className="py-3 font-semibold" style={{ color: m.risk !== "₹0" ? COLORS.red : "rgba(26,16,8,0.40)" }}>{m.risk}</td>
                        <td className="py-3"><input type="checkbox" defaultChecked={m.reviewed} /></td>
                        <td className="py-3 text-[12px]" style={{ color: "rgba(26,16,8,0.60)" }}>{m.note || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </>
        )}

        {tab === "Compliance" && (
          <Card>
            <h3 className="text-[15px] font-semibold mb-4">Compliance Matrix</h3>
            <table className="w-full text-sm">
              <thead><tr className="text-left text-[11px] uppercase" style={{ color: "rgba(26,16,8,0.50)" }}>
                <th className="py-2">Framework</th><th className="py-2">Filing</th><th className="py-2">Due</th><th className="py-2">Responsible</th><th className="py-2">Status</th>
              </tr></thead>
              <tbody>
                {[
                  ["GST", "GSTR-1", "Apr 11", "CA", "Filed"],
                  ["GST", "GSTR-3B", "Apr 20", "CA", "Pending"],
                  ["TDS", "TDS Q4", "May 31", "CA", "Pending"],
                  ["PF/ESIC", "PF Apr", "May 15", "Client", "Pending"],
                  ["ROC", "DPT-3", "Jun 30", "CA", "Pending"],
                ].map((r, i) => (
                  <tr key={i} style={{ borderTop: `1px solid ${COLORS.divider}` }}>
                    <td className="py-3 font-medium">{r[0]}</td><td className="py-3">{r[1]}</td><td className="py-3 text-[13px]">{r[2]}</td>
                    <td className="py-3"><Chip tone={r[3] === "CA" ? "blue" : "gold"}>{r[3]}</Chip></td>
                    <td className="py-3"><Chip tone={r[4] === "Filed" ? "green" : "amber"}>{r[4]}</Chip></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-6">
              <h4 className="text-[15px] font-semibold mb-2">Client to-do</h4>
              <ul className="text-sm space-y-1.5" style={{ color: "rgba(26,16,8,0.70)" }}>
                <li>• Provide April purchase invoices</li>
                <li>• Approve PF challan for April</li>
                <li>• Sign updated authorisation letter</li>
              </ul>
            </div>
          </Card>
        )}

        {(tab === "Receivables" || tab === "Payables" || tab === "HR & Payroll") && (
          <Card>
            <h3 className="text-[15px] font-semibold mb-1">{tab}</h3>
            <p className="text-[13px] mb-4" style={{ color: "rgba(26,16,8,0.60)" }}>
              {tab === "Receivables" && "Preview only — client must send chase messages."}
              {tab === "Payables" && "Mark items as paid; flag TDS-applicable rows."}
              {tab === "HR & Payroll" && "View payroll history and statutory obligations."}
            </p>
            <table className="w-full text-sm">
              <thead><tr className="text-left text-[11px] uppercase" style={{ color: "rgba(26,16,8,0.50)" }}>
                <th className="py-2">{tab === "Receivables" ? "Customer" : tab === "Payables" ? "Vendor" : "Month"}</th>
                <th className="py-2">{tab === "HR & Payroll" ? "Headcount" : "Invoice"}</th>
                <th className="py-2">Amount</th><th className="py-2">{tab === "HR & Payroll" ? "PF/ESIC" : "Due"}</th><th className="py-2">Status</th>
              </tr></thead>
              <tbody>
                {[1, 2, 3, 4].map((i) => (
                  <tr key={i} style={{ borderTop: `1px solid ${COLORS.divider}` }}>
                    <td className="py-3 font-medium">{tab === "Receivables" ? `Customer ${i}` : tab === "Payables" ? `Vendor ${i}` : `Mar ${2026 - i + 1}`}</td>
                    <td className="py-3">{tab === "HR & Payroll" ? `${10 + i}` : `INV-${1000 + i}`}</td>
                    <td className="py-3">₹{(i * 80).toLocaleString("en-IN")}K</td>
                    <td className="py-3 text-[13px]">{tab === "HR & Payroll" ? "₹98K" : `Apr ${10 + i}`}</td>
                    <td className="py-3"><Chip tone={i % 2 === 0 ? "green" : "amber"}>{i % 2 === 0 ? "Paid" : "Pending"}</Chip></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}

        {tab === "Documents" && (
          <Card>
            <div className="flex gap-3 mb-4 flex-wrap">
              {["GST", "IT", "Corporate", "HR", "Bank"].map((c, i) => (
                <button key={c} className="px-3 py-1.5 rounded text-xs font-medium" style={{ background: i === 0 ? COLORS.ink : "#F3F0E6", color: i === 0 ? "#FFFFFF" : "rgba(26,16,8,0.70)" }}>{c}</button>
              ))}
            </div>
            <div className="border-2 border-dashed rounded p-8 text-center mb-4" style={{ borderColor: COLORS.caBorder }}>
              <div className="text-sm font-medium mb-1">Upload documents for this client</div>
              <div className="text-xs" style={{ color: "rgba(26,16,8,0.50)" }}>PDF, Excel, Word, JPEG, PNG · Max 50MB</div>
            </div>
            <table className="w-full text-sm">
              <thead><tr className="text-left text-[11px] uppercase" style={{ color: "rgba(26,16,8,0.50)" }}>
                <th className="py-2">File</th><th className="py-2">Uploaded</th><th className="py-2">Size</th><th className="py-2"></th>
              </tr></thead>
              <tbody>
                {[
                  ["GSTR-3B March.pdf", "Apr 12", "245 KB"],
                  ["Bank statement Q4.xlsx", "Apr 10", "1.2 MB"],
                ].map(([f, d, s], i) => (
                  <tr key={i} style={{ borderTop: `1px solid ${COLORS.divider}` }}>
                    <td className="py-3 font-medium">{f}</td><td className="py-3 text-[13px]">{d}</td><td className="py-3 text-[13px]">{s}</td>
                    <td className="py-3 text-right"><GhostLink>Download</GhostLink></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}

        {tab === "Activity Log" && (
          <Card>
            <h3 className="text-[15px] font-semibold mb-4">Activity on this client's account</h3>
            <table className="w-full text-sm">
              <thead><tr className="text-left text-[11px] uppercase" style={{ color: "rgba(26,16,8,0.50)" }}>
                <th className="py-2">Date</th><th className="py-2">User</th><th className="py-2">Action</th><th className="py-2">Details</th>
              </tr></thead>
              <tbody>
                {[
                  ["Apr 17 09:42", "Partner", "Opened client", "Viewed Overview tab"],
                  ["Apr 16 18:10", "Partner", "Generated report", "Monthly CFO Report — March 2026"],
                  ["Apr 16 14:25", "Partner", "Marked filed", "GSTR-1 March 2026"],
                  ["Apr 15 11:00", "Partner", "Added note", "ITC reconciliation note on Raj Textiles"],
                ].map((r, i) => (
                  <tr key={i} style={{ borderTop: `1px solid ${COLORS.divider}` }}>
                    {r.map((c, j) => <td key={j} className="py-3 text-[13px]" style={{ color: j === 0 ? "rgba(26,16,8,0.60)" : COLORS.ink }}>{c}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}
      </div>
    </div>
  );
}
