import { useState } from "react";
import { COLORS, PageWrap, PageHeader, Card, Chip } from "@/components/ca/ui";
import { X } from "lucide-react";

const NOTIFS = [
  { client: "Mehta Textiles", title: "ITC mismatch detected", msg: "4 vendor invoices in books not in 2B. ₹3.2L at risk.", time: "12 min ago", sev: "critical", read: false },
  { client: "Sharma & Sons", title: "Cash runway critical", msg: "Only 18 days of runway. Payroll ₹8.4L due Apr 30.", time: "1 hour ago", sev: "critical", read: false },
  { client: "Delhi Distributors", title: "GSTR-3B due in 2 days", msg: "Filing pending. Data not yet reviewed.", time: "3 hours ago", sev: "warning", read: false },
  { client: "Anand Trading", title: "Receivable overdue", msg: "₹4.5L overdue 60+ days. Suggest chase.", time: "5 hours ago", sev: "warning", read: true },
  { client: "Patel Manufacturing", title: "TDS deposit due", msg: "₹86K due Apr 30.", time: "Yesterday", sev: "info", read: true },
];

export default function CANotificationsPage() {
  const [filter, setFilter] = useState("All");
  const [list, setList] = useState(NOTIFS);

  const filtered = list.filter((n) => {
    if (filter === "Unread") return !n.read;
    if (filter === "Critical") return n.sev === "critical";
    if (filter === "Warning") return n.sev === "warning";
    if (filter === "Info") return n.sev === "info";
    return true;
  });

  return (
    <PageWrap>
      <PageHeader title="Notifications" sub="Portfolio-wide alerts and signals." right={
        <button onClick={() => setList(list.map(n => ({ ...n, read: true })))} className="text-sm font-medium" style={{ color: COLORS.red }}>Mark all read</button>
      } />

      <div className="flex gap-2 mb-5 flex-wrap">
        {["All", "Unread", "Critical", "Warning", "Info"].map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className="px-3 py-1.5 rounded-full text-xs font-medium"
            style={filter === f ? { background: COLORS.ink, color: "#FFFFFF" } : { background: "#F3F0E6", color: "rgba(26,16,8,0.70)" }}>
            {f}
          </button>
        ))}
      </div>

      <Card>
        {filtered.map((n, i) => (
          <div key={i} className="flex items-start gap-3 px-2 py-4"
            style={{ borderBottom: i < filtered.length - 1 ? `1px solid ${COLORS.divider}` : "none", background: !n.read && n.sev === "critical" ? "#FEF2F2" : !n.read ? "#FFFBEB" : "transparent" }}>
            <span className={`w-2 h-2 mt-2 rounded-full flex-shrink-0 ${n.sev === "critical" && !n.read ? "animate-pulse" : ""}`}
              style={{ background: n.sev === "critical" ? COLORS.red : n.sev === "warning" ? COLORS.amber : COLORS.blue }} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Chip tone={n.sev === "critical" ? "red" : n.sev === "warning" ? "amber" : "blue"}>{n.client}</Chip>
              </div>
              <div className="text-sm font-semibold">{n.title}</div>
              <div className="text-[13px]" style={{ color: "rgba(26,16,8,0.65)" }}>{n.msg}</div>
              <div className="text-[11px] mt-1" style={{ color: "rgba(26,16,8,0.35)" }}>{n.time}</div>
            </div>
            <button onClick={() => setList(list.map((x, idx) => idx === i ? { ...x, read: true } : x))} aria-label="Mark read" style={{ color: "rgba(26,16,8,0.40)" }}>
              <X size={16} />
            </button>
          </div>
        ))}
      </Card>
    </PageWrap>
  );
}
