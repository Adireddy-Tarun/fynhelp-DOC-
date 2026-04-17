import { useState } from "react";
import { COLORS, PageWrap, PageHeader, Card, Chip, GhostLink, SecondaryBtn } from "@/components/ca/ui";

const FILINGS = [
  { date: "Apr 17", weekday: "Wed", group: "TODAY", color: COLORS.red, items: [
    { client: "Mehta Textiles", type: "GSTR-1", amount: "₹1.2L", status: "Pending", who: "CA" },
    { client: "Sharma & Sons", type: "GSTR-3B", amount: "₹86K", status: "Pending", who: "CA" },
    { client: "Anand Trading", type: "TDS", amount: "₹42K", status: "Filed", who: "CA" },
  ]},
  { date: "Apr 18", weekday: "Thu", group: "TOMORROW", color: COLORS.amber, items: [
    { client: "Patel Manufacturing", type: "GSTR-1", amount: "₹2.4L", status: "Pending", who: "CA" },
    { client: "Delhi Distributors", type: "GSTR-3B", amount: "₹1.8L", status: "Pending", who: "Client" },
  ]},
  { date: "Apr 20", weekday: "Sat", group: "THIS WEEK", color: "rgba(26,16,8,0.60)", items: [
    { client: "Surat Fabrics", type: "PF", amount: "₹65K", status: "Pending", who: "Client" },
    { client: "Nair Healthcare", type: "TDS", amount: "₹38K", status: "Pending", who: "CA" },
  ]},
  { date: "Apr 22", weekday: "Mon", group: "THIS WEEK", color: "rgba(26,16,8,0.60)", items: [
    { client: "Iyer Consulting", type: "GSTR-3B", amount: "₹52K", status: "Pending", who: "CA" },
    { client: "Mumbai Mills", type: "ESIC", amount: "₹28K", status: "Pending", who: "Client" },
  ]},
];

const TYPE_COLORS: Record<string, "amber" | "blue" | "green" | "gold" | "red" | "gray"> = {
  "GSTR-1": "amber", "GSTR-3B": "amber", TDS: "blue", PF: "green", ESIC: "green", ROC: "gold", IT: "red",
};

export default function CAFilingCalendarPage() {
  const [view, setView] = useState<"List" | "Month" | "Week">("List");
  const [filterType, setFilterType] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");

  return (
    <PageWrap>
      <PageHeader
        title="Filing Calendar"
        sub="Portfolio-wide. All deadlines for every client, in one place."
        right={<SecondaryBtn size="sm">Export to Excel</SecondaryBtn>}
      />

      {/* View toggle + filters */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div className="flex bg-white rounded-md p-0.5" style={{ border: `1px solid ${COLORS.caBorder}` }}>
          {(["Month", "Week", "List"] as const).map((v) => (
            <button key={v} onClick={() => setView(v)}
              className="px-4 py-1.5 text-xs font-medium rounded transition-colors"
              style={view === v ? { background: COLORS.ink, color: "#FFFFFF" } : { color: "rgba(26,16,8,0.60)" }}>{v}</button>
          ))}
        </div>

        <div className="flex gap-2 flex-wrap">
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="h-8 px-3 rounded text-xs bg-white" style={{ border: `1px solid ${COLORS.caBorder}` }}>
            {["All", "GSTR-1", "GSTR-3B", "TDS", "ROC", "PF", "ESIC"].map(s => <option key={s}>{s}</option>)}
          </select>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="h-8 px-3 rounded text-xs bg-white" style={{ border: `1px solid ${COLORS.caBorder}` }}>
            {["All", "Pending", "Filed", "Late", "Due today"].map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Urgency badges */}
      <div className="flex gap-2 mb-5">
        <span className="px-3 py-1.5 rounded text-xs font-bold" style={{ background: "#FEE2E2", color: COLORS.red }}>3 filings due TODAY</span>
        <span className="px-3 py-1.5 rounded text-xs font-bold" style={{ background: "#FEF3C7", color: "#92400E" }}>9 filings due this week</span>
      </div>

      {view === "List" && (
        <Card>
          {FILINGS.map((day) => (
            <div key={day.date}>
              <div className="px-4 py-2 -mx-6 mb-3 text-[13px] font-semibold flex items-center gap-2" style={{ background: COLORS.caSurface, color: day.color }}>
                <span>{day.group}</span>
                <span style={{ color: "rgba(26,16,8,0.40)" }}>·</span>
                <span style={{ color: COLORS.ink }}>{day.weekday} · April {day.date.split(" ")[1]}</span>
              </div>
              <div className="space-y-2 mb-5">
                {day.items.map((it, i) => (
                  <div key={i} className="flex items-center gap-3 py-2.5 px-2 rounded hover:bg-[#F8F6F1]">
                    <div className="flex-1">
                      <div className="text-sm font-semibold">{it.client}</div>
                      <div className="text-[12px]" style={{ color: "rgba(26,16,8,0.50)" }}>Est. {it.amount}</div>
                    </div>
                    <Chip tone={TYPE_COLORS[it.type] || "gray"}>{it.type}</Chip>
                    <Chip tone={it.who === "CA" ? "blue" : "gold"}>{it.who}</Chip>
                    <Chip tone={it.status === "Filed" ? "green" : it.status === "Late" ? "red" : "amber"}>{it.status}</Chip>
                    <button className="text-xs font-medium" style={{ color: COLORS.red }}>{it.status === "Pending" ? "Mark filed" : "View"} →</button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </Card>
      )}

      {view === "Month" && (
        <Card>
          <div className="grid grid-cols-7 gap-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div key={d} className="text-[11px] font-semibold uppercase tracking-wider text-center pb-2" style={{ color: "rgba(26,16,8,0.50)" }}>{d}</div>
            ))}
            {Array.from({ length: 30 }, (_, i) => {
              const day = i + 1;
              const has = [11, 17, 18, 20, 22].includes(day);
              const isToday = day === 17;
              return (
                <div key={i} className="rounded p-2 min-h-[80px] text-xs" style={{ border: `1px solid ${isToday ? COLORS.red : COLORS.divider}`, background: isToday ? "#FEF2F2" : "#FFFFFF" }}>
                  <div className="font-semibold mb-1">{day}</div>
                  {has && (
                    <div className="space-y-1">
                      <div className="text-[10px] px-1 py-0.5 rounded truncate" style={{ background: "#FEF3C7", color: "#92400E" }}>GSTR · 2</div>
                      {day === 17 && <div className="text-[10px] px-1 py-0.5 rounded truncate" style={{ background: "#DBEAFE", color: "#1E40AF" }}>TDS · 1</div>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {view === "Week" && (
        <Card>
          <div className="text-sm" style={{ color: "rgba(26,16,8,0.60)" }}>Week view shows the same data as List view, scoped to current week.</div>
        </Card>
      )}
    </PageWrap>
  );
}
