import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Eye } from "lucide-react";
import { Card, PageHeader } from "./AdminDashboardPage";

type Ticket = {
  id: string;
  number: string;
  subject: string;
  user: string;
  category: "billing" | "technical" | "feature_request" | "bug" | "other";
  priority: "low" | "medium" | "high" | "urgent";
  status: "open" | "in_progress" | "waiting_customer" | "resolved" | "closed";
  assigned: string | null;
  created: string;
  updated: string;
};

const SAMPLE: Ticket[] = [
  { id: "1", number: "TKT-001234", subject: "Payment failed after upgrade", user: "Rajesh Kumar", category: "billing", priority: "high", status: "open", assigned: null, created: "2h ago", updated: "2h ago" },
  { id: "2", number: "TKT-001233", subject: "CSV upload showing errors", user: "Priya Sharma", category: "technical", priority: "medium", status: "in_progress", assigned: "Tarun", created: "5h ago", updated: "1h ago" },
  { id: "3", number: "TKT-001232", subject: "Request: Multi-currency support", user: "Amit Patel", category: "feature_request", priority: "low", status: "waiting_customer", assigned: "Nidhi", created: "1d ago", updated: "6h ago" },
  { id: "4", number: "TKT-001231", subject: "GST report download broken", user: "Sneha Reddy", category: "bug", priority: "urgent", status: "open", assigned: null, created: "30m ago", updated: "30m ago" },
  { id: "5", number: "TKT-001230", subject: "How to invite my CA?", user: "Vikram Singh", category: "other", priority: "low", status: "resolved", assigned: "Tarun", created: "3d ago", updated: "2d ago" },
  { id: "6", number: "TKT-001229", subject: "Subscription renewal date wrong", user: "Anita Joshi", category: "billing", priority: "medium", status: "closed", assigned: "Nidhi", created: "5d ago", updated: "4d ago" },
  { id: "7", number: "TKT-001228", subject: "Cash flow chart not loading", user: "Rohit Mehta", category: "technical", priority: "high", status: "in_progress", assigned: "Tarun", created: "6h ago", updated: "2h ago" },
  { id: "8", number: "TKT-001227", subject: "Feature: Dark mode", user: "Kavya Nair", category: "feature_request", priority: "low", status: "open", assigned: null, created: "2d ago", updated: "2d ago" },
];

const CATEGORY_LABEL: Record<Ticket["category"], string> = {
  billing: "Billing", technical: "Technical", feature_request: "Feature", bug: "Bug", other: "Other",
};
const PRIORITY_STYLE: Record<Ticket["priority"], { bg: string; color: string; label: string; pulse?: boolean }> = {
  low:    { bg: "rgba(26,16,8,0.08)",   color: "hsl(var(--fyn-ink) / 0.7)", label: "Low" },
  medium: { bg: "rgba(24,119,242,0.12)", color: "#0F4FB0", label: "Medium" },
  high:   { bg: "rgba(245,158,11,0.15)", color: "#B45309", label: "High" },
  urgent: { bg: "rgba(196,30,30,0.15)",  color: "#C41E1E", label: "Urgent", pulse: true },
};
const STATUS_STYLE: Record<Ticket["status"], { bg: string; color: string; label: string }> = {
  open:              { bg: "rgba(24,119,242,0.12)", color: "#0F4FB0", label: "Open" },
  in_progress:       { bg: "rgba(245,158,11,0.15)", color: "#B45309", label: "In Progress" },
  waiting_customer:  { bg: "rgba(139,105,20,0.15)", color: "#8B6914", label: "Waiting Customer" },
  resolved:          { bg: "rgba(16,185,129,0.12)", color: "#0F7B4F", label: "Resolved" },
  closed:            { bg: "rgba(26,16,8,0.08)",    color: "hsl(var(--fyn-ink) / 0.6)", label: "Closed" },
};

export default function AdminSupportPage() {
  const [q, setQ] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [priority, setPriority] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");

  const rows = useMemo(() => SAMPLE.filter((t) => {
    if (category !== "all" && t.category !== category) return false;
    if (priority !== "all" && t.priority !== priority) return false;
    if (status !== "all" && t.status !== status) return false;
    if (q) {
      const s = q.toLowerCase();
      if (!t.number.toLowerCase().includes(s) && !t.user.toLowerCase().includes(s) && !t.subject.toLowerCase().includes(s)) return false;
    }
    return true;
  }), [q, category, priority, status]);

  return (
    <div>
      <PageHeader title="Support Tickets" subtitle="Manage customer support requests" />

      <Card className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="md:col-span-1 relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" color="hsl(var(--fyn-ink) / 0.4)" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search ticket #, user, subject…"
              className="w-full pl-9 pr-3 py-2.5 rounded-lg"
              style={{ border: "1px solid rgba(26,16,8,0.15)", fontFamily: "Roboto, sans-serif", fontSize: 13 }} />
          </div>
          <FilterSelect value={category} onChange={setCategory} label="Category"
            options={[["all","All"],["billing","Billing"],["technical","Technical"],["feature_request","Feature"],["bug","Bug"],["other","Other"]]} />
          <FilterSelect value={priority} onChange={setPriority} label="Priority"
            options={[["all","All"],["low","Low"],["medium","Medium"],["high","High"],["urgent","Urgent"]]} />
          <FilterSelect value={status} onChange={setStatus} label="Status"
            options={[["all","All"],["open","Open"],["in_progress","In Progress"],["waiting_customer","Waiting"],["resolved","Resolved"],["closed","Closed"]]} />
        </div>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full" style={{ fontFamily: "Roboto, sans-serif", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(26,16,8,0.08)" }}>
                {["Ticket #","Subject","User","Category","Priority","Status","Assigned","Created","Updated",""].map((h) => (
                  <th key={h} className="text-left py-2.5 px-2"
                    style={{ fontFamily: "Raleway, sans-serif", fontWeight: 600, fontSize: 12, color: "hsl(var(--fyn-ink) / 0.6)", textTransform: "uppercase", letterSpacing: 0.5 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((t) => {
                const p = PRIORITY_STYLE[t.priority];
                const s = STATUS_STYLE[t.status];
                return (
                  <tr key={t.id} className="hover:bg-[hsl(var(--fyn-ink)/0.03)]" style={{ borderBottom: "1px solid rgba(26,16,8,0.05)" }}>
                    <td className="py-3 px-2 font-mono whitespace-nowrap" style={{ color: "hsl(var(--fyn-ink) / 0.8)" }}>{t.number}</td>
                    <td className="py-3 px-2" style={{ color: "hsl(var(--fyn-ink))" }}>{t.subject}</td>
                    <td className="py-3 px-2 whitespace-nowrap" style={{ color: "hsl(var(--fyn-ink) / 0.8)" }}>{t.user}</td>
                    <td className="py-3 px-2 whitespace-nowrap" style={{ color: "hsl(var(--fyn-ink) / 0.7)" }}>{CATEGORY_LABEL[t.category]}</td>
                    <td className="py-3 px-2">
                      <span style={{
                        padding: "3px 9px", borderRadius: 6, fontWeight: 600, fontSize: 11,
                        background: p.bg, color: p.color,
                      }} className={p.pulse ? "animate-pulse" : ""}>{p.label}</span>
                    </td>
                    <td className="py-3 px-2">
                      <span style={{ padding: "3px 9px", borderRadius: 6, fontWeight: 600, fontSize: 11, background: s.bg, color: s.color }}>{s.label}</span>
                    </td>
                    <td className="py-3 px-2 whitespace-nowrap" style={{ color: t.assigned ? "hsl(var(--fyn-ink))" : "hsl(var(--fyn-ink) / 0.5)" }}>
                      {t.assigned ?? "Unassigned"}
                    </td>
                    <td className="py-3 px-2 whitespace-nowrap" style={{ color: "hsl(var(--fyn-ink) / 0.6)" }}>{t.created}</td>
                    <td className="py-3 px-2 whitespace-nowrap" style={{ color: "hsl(var(--fyn-ink) / 0.6)" }}>{t.updated}</td>
                    <td className="py-3 px-2">
                      <Link to={`/admin/support/${t.id}`} className="p-1.5 inline-flex rounded-lg hover:bg-[hsl(var(--fyn-ink)/0.06)]" aria-label="View">
                        <Eye size={15} color="hsl(var(--fyn-ink) / 0.6)" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {rows.length === 0 && (
                <tr><td colSpan={10} className="py-12 text-center" style={{ color: "hsl(var(--fyn-ink) / 0.5)" }}>No tickets match these filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function FilterSelect({ value, onChange, label, options }: { value: string; onChange: (v: string) => void; label: string; options: [string, string][] }) {
  return (
    <div>
      <label className="block mb-1" style={{ fontFamily: "Raleway, sans-serif", fontSize: 11, fontWeight: 600, color: "hsl(var(--fyn-ink) / 0.6)", textTransform: "uppercase", letterSpacing: 0.5 }}>
        {label}
      </label>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        aria-label={label}
        className="w-full rounded-lg px-3 py-2.5"
        style={{ border: "1px solid rgba(26,16,8,0.15)", fontFamily: "Roboto, sans-serif", fontSize: 13, color: "hsl(var(--fyn-ink))" }}>
        {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    </div>
  );
}
