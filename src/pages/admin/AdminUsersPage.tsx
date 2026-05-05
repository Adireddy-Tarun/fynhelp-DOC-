import { useState, CSSProperties } from "react";
import { useNavigate } from "react-router-dom";
import { MoreVertical } from "lucide-react";
import { toast } from "sonner";
import { Card, PageHeader } from "./AdminDashboardPage";

const fmtINR = (n: number) =>
  n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : n >= 1000 ? `₹${(n / 1000).toFixed(1)}K` : `₹${n}`;

const STATUS_STYLE: Record<string, { bg: string; fg: string; label: string }> = {
  active: { bg: "rgba(16,185,129,0.12)", fg: "#0F7B4F", label: "Active" },
  suspended: { bg: "rgba(196,30,30,0.12)", fg: "#C41E1E", label: "Suspended" },
  churned: { bg: "rgba(26,16,8,0.08)", fg: "hsl(var(--fyn-ink) / 0.7)", label: "Churned" },
};

const PLAN_STYLE: Record<string, { bg: string; fg: string; label: string }> = {
  free_trial: { bg: "rgba(139,105,20,0.12)", fg: "#8B6914", label: "Free Trial" },
  starter: { bg: "rgba(59,130,246,0.12)", fg: "#3B82F6", label: "Starter" },
  pro: { bg: "rgba(16,185,129,0.12)", fg: "#0F7B4F", label: "Pro" },
  enterprise: { bg: "rgba(120,53,15,0.12)", fg: "#78350F", label: "Enterprise" },
};

type Row = {
  user_id: string;
  name: string;
  email: string;
  mobile: string;
  company: string;
  plan: keyof typeof PLAN_STYLE;
  status: keyof typeof STATUS_STYLE;
  mrr: number;
  last_active: string;
};

const SAMPLE_ROWS: Row[] = [
  { user_id: "u1", name: "Rajesh Kumar", email: "rajesh@techcorp.in", mobile: "+91 98765 43210", company: "TechCorp Pvt Ltd", plan: "pro", status: "active", mrr: 7500, last_active: "2 hours ago" },
  { user_id: "u2", name: "Priya Sharma", email: "priya@growthlabs.in", mobile: "+91 98765 43211", company: "Growth Labs", plan: "starter", status: "active", mrr: 2500, last_active: "5 hours ago" },
  { user_id: "u3", name: "Amit Patel", email: "amit@designstudio.in", mobile: "+91 98765 43212", company: "Design Studio", plan: "pro", status: "active", mrr: 7500, last_active: "1 day ago" },
  { user_id: "u4", name: "Sneha Reddy", email: "sneha@ecommerce.in", mobile: "+91 98765 43213", company: "E-Commerce Co", plan: "enterprise", status: "active", mrr: 15000, last_active: "3 hours ago" },
  { user_id: "u5", name: "Vikram Singh", email: "vikram@startup.in", mobile: "+91 98765 43214", company: "Startup Inc", plan: "free_trial", status: "active", mrr: 0, last_active: "30 mins ago" },
  { user_id: "u6", name: "Anjali Gupta", email: "anjali@consulting.in", mobile: "+91 98765 43215", company: "Consulting Firm", plan: "starter", status: "suspended", mrr: 0, last_active: "2 weeks ago" },
  { user_id: "u7", name: "Karthik Menon", email: "karthik@saas.in", mobile: "+91 98765 43216", company: "SaaS Solutions", plan: "pro", status: "churned", mrr: 0, last_active: "1 month ago" },
  { user_id: "u8", name: "Divya Iyer", email: "divya@agency.in", mobile: "+91 98765 43217", company: "Creative Agency", plan: "starter", status: "active", mrr: 2500, last_active: "1 hour ago" },
];

const COLUMNS = ["Select", "Name", "Email", "Mobile", "Company", "Plan", "Status", "MRR", "Last Active", "Actions"];

const secondaryBtn: CSSProperties = {
  height: 36,
  padding: "0 14px",
  borderRadius: 8,
  background: "transparent",
  border: "1px solid rgba(26,16,8,0.15)",
  color: "hsl(var(--fyn-ink))",
  fontFamily: "Raleway, sans-serif",
  fontWeight: 600,
  fontSize: 12,
  cursor: "pointer",
};

const inputStyle: CSSProperties = {
  border: "1px solid rgba(26,16,8,0.15)",
  fontFamily: "Roboto, sans-serif",
  fontSize: 14,
  color: "hsl(var(--fyn-ink))",
  background: "#fff",
};

export default function AdminUsersPage() {
  const navigate = useNavigate();
  const [rows] = useState<Row[]>(SAMPLE_ROWS);
  const [q, setQ] = useState("");
  const [planFilter, setPlanFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState<string[]>([]);

  const visible = rows.filter((r) => {
    if (q && !r.name.toLowerCase().includes(q.toLowerCase()) && !r.company.toLowerCase().includes(q.toLowerCase())) return false;
    if (planFilter !== "all" && r.plan !== planFilter) return false;
    if (statusFilter !== "all" && r.status !== statusFilter) return false;
    return true;
  });

  const allSelected = visible.length > 0 && visible.every((r) => selected.includes(r.user_id));

  return (
    <div>
      <PageHeader title="User Management" subtitle="Manage all FYNHelp users and businesses" />

      {/* Filters */}
      <Card style={{ marginBottom: 16 }}>
        <div className="flex flex-wrap items-center gap-3">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search users..."
            className="flex-1 min-w-[200px] rounded-lg px-4 py-2.5"
            style={inputStyle}
          />
          <select value={planFilter} onChange={(e) => setPlanFilter(e.target.value)} className="rounded-lg px-3 py-2.5" style={{ ...inputStyle, fontSize: 13, minWidth: 140 }}>
            <option value="all">All Plans</option>
            <option value="free_trial">Free Trial</option>
            <option value="starter">Starter</option>
            <option value="pro">Pro</option>
            <option value="enterprise">Enterprise</option>
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-lg px-3 py-2.5" style={{ ...inputStyle, fontSize: 13, minWidth: 140 }}>
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="churned">Churned</option>
          </select>
          <button
            onClick={() => toast.info("Date range filter coming in Part 4")}
            className="rounded-lg px-4 py-2.5"
            style={{ ...inputStyle, fontFamily: "Raleway, sans-serif", fontWeight: 600, fontSize: 13, cursor: "pointer" }}
          >
            Date Range
          </button>
        </div>
      </Card>

      {/* Bulk Actions */}
      {selected.length > 0 && (
        <Card style={{ marginBottom: 16, background: "rgba(139,105,20,0.06)", border: "1px solid rgba(139,105,20,0.25)" }}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span style={{ fontFamily: "Raleway, sans-serif", fontWeight: 600, fontSize: 14, color: "hsl(var(--fyn-ink))" }}>
              {selected.length} user{selected.length > 1 ? "s" : ""} selected
            </span>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => toast.info("Export coming in Part 4")} style={secondaryBtn}>Export</button>
              <button onClick={() => toast.info("Send email coming in Part 4")} style={secondaryBtn}>Send Email</button>
              <button onClick={() => toast.info("Suspend users coming in Part 4")} style={{ ...secondaryBtn, color: "#C41E1E", borderColor: "rgba(196,30,30,0.3)" }}>Suspend</button>
              <button onClick={() => setSelected([])} style={secondaryBtn}>Clear</button>
            </div>
          </div>
        </Card>
      )}

      {/* Table */}
      <Card style={{ padding: 0, overflow: "hidden" }}>
        <div className="overflow-x-auto">
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "rgba(26,16,8,0.04)", borderBottom: "2px solid rgba(139,105,20,0.2)" }}>
                {COLUMNS.map((c) => (
                  <th key={c} style={{ padding: "16px", textAlign: "left", fontFamily: "Raleway, sans-serif", fontWeight: 600, fontSize: 13, color: "hsl(var(--fyn-ink))", whiteSpace: "nowrap" }}>
                    {c === "Select" ? (
                      <input
                        type="checkbox"
                        checked={allSelected}
                        onChange={(e) => setSelected(e.target.checked ? visible.map((r) => r.user_id) : [])}
                        style={{ cursor: "pointer" }}
                      />
                    ) : c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visible.length === 0 && (
                <tr><td colSpan={COLUMNS.length} style={{ padding: 32, textAlign: "center", fontFamily: "Roboto, sans-serif", color: "hsl(var(--fyn-ink) / 0.5)" }}>No users match these filters.</td></tr>
              )}
              {visible.map((r, i) => {
                const isSel = selected.includes(r.user_id);
                const baseBg = i % 2 ? "rgba(244,237,218,0.3)" : "#fff";
                const go = () => navigate(`/admin/users/${r.user_id}`);
                return (
                  <tr
                    key={r.user_id}
                    style={{ background: isSel ? "rgba(139,105,20,0.06)" : baseBg, borderBottom: "1px solid rgba(26,16,8,0.06)", cursor: "pointer", transition: "background 0.15s" }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(139,105,20,0.08)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = isSel ? "rgba(139,105,20,0.06)" : baseBg; }}
                  >
                    <td style={cell} onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isSel}
                        onChange={(e) => setSelected(e.target.checked ? [...selected, r.user_id] : selected.filter((id) => id !== r.user_id))}
                        style={{ cursor: "pointer" }}
                      />
                    </td>
                    <td style={cell} onClick={go}><span style={{ fontWeight: 500, color: "hsl(var(--fyn-ink))" }}>{r.name}</span></td>
                    <td style={cell} onClick={go}><span style={{ color: "hsl(var(--fyn-ink) / 0.7)" }}>{r.email}</span></td>
                    <td style={cell} onClick={go}><span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13, color: "hsl(var(--fyn-ink) / 0.7)" }}>{r.mobile}</span></td>
                    <td style={cell} onClick={go}><span style={{ color: "hsl(var(--fyn-ink) / 0.85)" }}>{r.company}</span></td>
                    <td style={cell} onClick={go}><Badge {...PLAN_STYLE[r.plan]} /></td>
                    <td style={cell} onClick={go}><Badge {...STATUS_STYLE[r.status]} /></td>
                    <td style={cell} onClick={go}>
                      <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13, fontWeight: 600, color: r.mrr > 0 ? "#8B6914" : "hsl(var(--fyn-ink) / 0.4)" }}>
                        {r.mrr > 0 ? fmtINR(r.mrr) : "—"}
                      </span>
                    </td>
                    <td style={cell} onClick={go}><span style={{ fontSize: 13, color: "hsl(var(--fyn-ink) / 0.6)" }}>{r.last_active}</span></td>
                    <td style={cell} onClick={(e) => e.stopPropagation()}><ActionsMenu userId={r.user_id} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

const cell: CSSProperties = {
  padding: "14px 16px",
  fontFamily: "Roboto, sans-serif",
  fontSize: 14,
  color: "hsl(var(--fyn-ink) / 0.85)",
  verticalAlign: "middle",
  whiteSpace: "nowrap",
};

function Badge({ bg, fg, label }: { bg: string; fg: string; label: string }) {
  return (
    <span style={{ display: "inline-block", padding: "4px 10px", borderRadius: 6, background: bg, color: fg, fontFamily: "DM Sans, sans-serif", fontWeight: 600, fontSize: 12 }}>
      {label}
    </span>
  );
}

function ActionsMenu({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const items = [
    { label: "View Profile", fn: () => navigate(`/admin/users/${userId}`) },
    { label: "Edit User", fn: () => toast.info("Edit user coming in Part 4") },
    { label: "View as User", fn: () => toast.info("View as user coming in Part 4") },
    { label: "Reset Password", fn: () => toast.info("Reset password coming in Part 4") },
    { label: "View Audit Log", fn: () => navigate(`/admin/audit-logs?user=${userId}`) },
    { label: "Delete User", fn: () => toast.error("Delete user coming in Part 4"), danger: true },
  ];

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Open actions menu"
        style={{ background: "transparent", border: "none", cursor: "pointer", padding: 6, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 6 }}
      >
        <MoreVertical size={16} color="hsl(var(--fyn-ink) / 0.6)" />
      </button>
      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 40 }} />
          <div
            style={{
              position: "absolute",
              right: 0,
              top: "100%",
              marginTop: 4,
              minWidth: 180,
              background: "#fff",
              border: "1px solid rgba(26,16,8,0.12)",
              borderRadius: 10,
              boxShadow: "0 8px 24px rgba(26,16,8,0.12)",
              zIndex: 50,
              overflow: "hidden",
              padding: "4px 0",
            }}
          >
            {items.map((item) => (
              <button
                key={item.label}
                onClick={() => { setOpen(false); item.fn(); }}
                className="w-full text-left px-4 py-2.5 hover:bg-[hsl(var(--fyn-ink)/0.04)] transition-colors"
                style={{ fontFamily: "Roboto, sans-serif", fontSize: 13, color: item.danger ? "#C41E1E" : "hsl(var(--fyn-ink))", border: "none", background: "transparent", cursor: "pointer", display: "block" }}
              >
                {item.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
