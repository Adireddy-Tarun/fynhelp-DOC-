import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCAAuth } from "@/contexts/CAAuthContext";
import { COLORS, PageWrap, Card, MetricCard, Chip, SecondaryBtn, GhostLink, HealthScoreBadge } from "@/components/ca/ui";
import { useCAClients } from "@/hooks/useCAClients";

const PRIORITY_ACTIONS = [
  { client: "Mehta Textiles", desc: "ITC at risk ₹3.2L. 4 vendor mismatches. GSTR-3B due Apr 20.", time: "12 min ago", severity: "critical", action: "Review ITC →", path: "/ca/itc-recon" },
  { client: "Sharma & Sons", desc: "Cash runway 18 days. Critical: payroll due Apr 30.", time: "1 hour ago", severity: "critical", action: "View →", path: "/ca/clients" },
  { client: "Delhi Distributors", desc: "GSTR-3B due in 2 days. Data not yet reviewed.", time: "3 hours ago", severity: "warning", action: "Start filing →", path: "/ca/filing-calendar" },
  { client: "Anand Trading Co.", desc: "Receivable ₹4.5L overdue 60+ days. Suggest chase.", time: "5 hours ago", severity: "warning", action: "Chase →", path: "/ca/clients" },
  { client: "Patel Manufacturing", desc: "TDS deposit due Apr 30 — ₹86K", time: "Yesterday", severity: "info", action: "File →", path: "/ca/tds-tracker" },
];

const FILINGS = {
  "TODAY — April 17": [
    { client: "Mehta Textiles", type: "GSTR-1", status: "pending" },
    { client: "Sharma & Sons", type: "GSTR-3B", status: "pending" },
    { client: "Anand Trading Co.", type: "TDS", status: "filed" },
  ],
  "TOMORROW — April 18": [
    { client: "Patel Manufacturing", type: "GSTR-1", status: "pending" },
    { client: "Delhi Distributors", type: "GSTR-3B", status: "pending" },
  ],
  "THIS WEEK": [
    { client: "Surat Fabrics", type: "PF", status: "pending" },
    { client: "Nair Healthcare", type: "TDS", status: "pending" },
    { client: "Iyer Consulting", type: "GSTR-3B", status: "pending" },
    { client: "Mumbai Mills", type: "ESIC", status: "pending" },
  ],
};

export default function CADashboardPage() {
  const { caFirm } = useCAAuth();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<string>("All");
  const { clients, loading } = useCAClients();

  const stats = useMemo(() => {
    const total = clients.length;
    const attention = clients.filter((c) => c.health < 50 || c.cash === "Critical").length;
    const filings = clients.filter((c) => c.filing < 7).length;
    return { total, attention, filings };
  }, [clients]);

  return (
    <>
      {/* Greeting bar */}
      <div className="px-8 py-4 flex items-center justify-between" style={{ background: COLORS.ink }}>
        <div>
          <div className="text-white text-[18px] font-semibold">Good morning, {caFirm?.firm_name || "Partner"}.</div>
          <div className="text-[14px]" style={{ color: "rgba(255,255,255,0.65)" }}>
            You have <span style={{ color: COLORS.redSoft }} className="font-semibold">8 clients</span> needing attention today and <span style={{ color: COLORS.amberSoft }} className="font-semibold">12 filings</span> due this week.
          </div>
        </div>
        <button
          onClick={() => navigate("/ca/bulk-actions")}
          className="h-10 px-4 rounded-md bg-white text-sm font-medium font-sans hover:opacity-90"
          style={{ color: COLORS.ink }}
        >
          Run bulk actions →
        </button>
      </div>

      <PageWrap>
        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <MetricCard label="Total Clients" value="47" sub="3 added this month" subColor={COLORS.greenSoft} />
          <MetricCard label="Needs Attention" value="8" valueColor={COLORS.redSoft} sub="ITC risk, overdue, compliance" onClick={() => navigate("/ca/clients")} />
          <MetricCard label="Filings This Week" value="12" valueColor={COLORS.amberSoft} sub="3 due tomorrow — priority" onClick={() => navigate("/ca/filing-calendar")} />
          <MetricCard label="ITC At Risk" value="₹68.4L" valueColor={COLORS.redSoft} sub="14 clients have mismatches" onClick={() => navigate("/ca/itc-recon")} />
        </div>

        {/* Priority + Filing ticker */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-8">
          <Card className="lg:col-span-7">
            <div className="flex items-start justify-between mb-1">
              <div>
                <h3 className="text-[15px] font-semibold">Needs your attention</h3>
                <p className="text-xs" style={{ color: "rgba(26,16,8,0.50)" }}>Sorted by urgency + impact</p>
              </div>
            </div>
            <div className="flex gap-2 mt-4 mb-4 flex-wrap">
              {["All", "Critical", "ITC", "Compliance", "Receivables"].map((p) => (
                <button key={p} onClick={() => setFilter(p)}
                  className="px-3 py-1 rounded-full text-xs font-medium transition-colors"
                  style={filter === p ? { background: COLORS.ink, color: "#FFFFFF" } : { background: "#F3F0E6", color: "rgba(26,16,8,0.70)" }}>
                  {p}
                </button>
              ))}
            </div>
            <div className="-mx-2">
              {PRIORITY_ACTIONS.map((a, i) => (
                <div key={i} className="flex items-center gap-3 px-2 py-3" style={{ borderBottom: `1px solid ${COLORS.divider}` }}>
                  <span
                    className={`w-2 h-2 rounded-full flex-shrink-0 ${a.severity === "critical" ? "animate-pulse" : ""}`}
                    style={{ background: a.severity === "critical" ? COLORS.red : a.severity === "warning" ? COLORS.amber : COLORS.blue }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate">{a.client}</div>
                    <div className="text-[13px] truncate" style={{ color: "rgba(26,16,8,0.65)" }}>{a.desc}</div>
                    <div className="text-[11px] mt-0.5" style={{ color: "rgba(26,16,8,0.35)" }}>{a.time}</div>
                  </div>
                  <button onClick={() => navigate(a.path)}
                    className="h-8 px-3 rounded text-xs font-medium hover:bg-[#C41E1E] hover:text-white transition-colors"
                    style={{ background: "#FDF2F1", color: COLORS.red, border: "1px solid rgba(196,30,30,0.20)" }}>
                    {a.action}
                  </button>
                </div>
              ))}
            </div>
          </Card>

          <Card className="lg:col-span-5">
            <h3 className="text-[15px] font-semibold mb-4">Filing deadlines this week</h3>
            <div className="space-y-5">
              {Object.entries(FILINGS).map(([date, items]) => (
                <div key={date}>
                  <div className="text-[13px] font-semibold mb-2" style={{ color: date.startsWith("TODAY") ? COLORS.red : date.startsWith("TOMORROW") ? COLORS.amber : "rgba(26,16,8,0.60)" }}>{date}</div>
                  <div className="space-y-1.5">
                    {items.map((f, i) => (
                      <div key={i} className="flex items-center gap-2 text-[13px]">
                        <span className="w-1 h-1 rounded-full" style={{ background: "rgba(26,16,8,0.30)" }} />
                        <span className="flex-1 truncate"><span className="font-medium">{f.client}</span> — {f.type}</span>
                        <Chip tone={f.status === "pending" ? "amber" : f.status === "filed" ? "green" : "red"}>
                          {f.status}
                        </Chip>
                        {f.status === "pending" && <button className="text-[11px] font-medium" style={{ color: COLORS.red }}>File →</button>}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Client portfolio */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[15px] font-semibold">All clients</h3>
            <div className="flex items-center gap-3">
              <GhostLink>Export portfolio</GhostLink>
              <SecondaryBtn size="sm" onClick={() => navigate("/ca/clients/add")}>+ Add client</SecondaryBtn>
            </div>
          </div>

          <div className="overflow-x-auto -mx-2">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wider" style={{ color: "rgba(26,16,8,0.50)" }}>
                  <th className="px-2 py-2 w-8"><input type="checkbox" /></th>
                  <th className="px-2 py-2">Client</th>
                  <th className="px-2 py-2">Industry</th>
                  <th className="px-2 py-2">Turnover</th>
                  <th className="px-2 py-2">Health</th>
                  <th className="px-2 py-2">Cash</th>
                  <th className="px-2 py-2">Next Filing</th>
                  <th className="px-2 py-2">ITC Risk</th>
                  <th className="px-2 py-2">Last Report</th>
                  <th className="px-2 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {CLIENTS.map((c) => (
                  <tr key={c.id} className="cursor-pointer hover:bg-[#F8F6F1]" style={{ borderTop: `1px solid ${COLORS.divider}` }} onClick={() => navigate(`/ca/client/${c.id}`)}>
                    <td className="px-2 py-3" onClick={(e) => e.stopPropagation()}><input type="checkbox" /></td>
                    <td className="px-2 py-3 font-medium">{c.name}</td>
                    <td className="px-2 py-3 text-[13px]" style={{ color: "rgba(26,16,8,0.65)" }}>{c.industry}</td>
                    <td className="px-2 py-3 text-[13px]">{c.turnover}</td>
                    <td className="px-2 py-3"><HealthScoreBadge score={c.health} /></td>
                    <td className="px-2 py-3"><Chip tone={c.cash === "Safe" ? "green" : c.cash === "Watch" ? "amber" : "red"}>{c.cash}</Chip></td>
                    <td className="px-2 py-3 text-[13px] font-medium" style={{ color: c.filing < 3 ? COLORS.red : c.filing < 7 ? COLORS.amber : "rgba(26,16,8,0.60)" }}>{c.filing}d</td>
                    <td className="px-2 py-3 text-[13px] font-semibold" style={{ color: c.itc.replace(/[^\d.]/g, "") > "1" ? COLORS.red : "rgba(26,16,8,0.65)" }}>{c.itc}</td>
                    <td className="px-2 py-3 text-[13px]" style={{ color: c.report === "Never" ? COLORS.red : "rgba(26,16,8,0.60)" }}>{c.report}</td>
                    <td className="px-2 py-3 text-right">
                      <span className="text-[12px] font-medium" style={{ color: COLORS.red }}>Open →</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </PageWrap>
    </>
  );
}
