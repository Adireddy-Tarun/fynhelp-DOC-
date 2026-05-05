import { useEffect, useMemo, useState } from "react";
import { Search, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, PageHeader } from "./AdminDashboardPage";

type Row = {
  user_id: string;
  full_name: string | null;
  business_id: string | null;
  business_name: string | null;
  plan: string | null;
  created_at: string;
  state: string | null;
};

const PAGE = 20;

export default function AdminUsersPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [plan, setPlan] = useState<string>("all");
  const [page, setPage] = useState(1);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name, business_id, created_at")
        .order("created_at", { ascending: false })
        .limit(500);

      const businessIds = (profiles ?? []).map((p) => p.business_id).filter(Boolean) as string[];
      let bizMap: Record<string, { name: string; plan: string | null; state: string | null }> = {};
      if (businessIds.length) {
        const { data: bs } = await supabase
          .from("businesses")
          .select("id, business_name, plan, state")
          .in("id", businessIds);
        bizMap = Object.fromEntries((bs ?? []).map((b) => [b.id, {
          name: b.business_name, plan: b.plan, state: b.state,
        }]));
      }

      setRows((profiles ?? []).map((p) => ({
        user_id: p.user_id,
        full_name: p.full_name,
        business_id: p.business_id,
        business_name: p.business_id ? bizMap[p.business_id]?.name ?? null : null,
        plan: p.business_id ? bizMap[p.business_id]?.plan ?? null : null,
        state: p.business_id ? bizMap[p.business_id]?.state ?? null : null,
        created_at: p.created_at,
      })));
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return rows.filter((r) => {
      if (plan !== "all" && (r.plan ?? "") !== plan) return false;
      if (!s) return true;
      return (r.full_name ?? "").toLowerCase().includes(s)
        || (r.business_name ?? "").toLowerCase().includes(s)
        || r.user_id.toLowerCase().includes(s);
    });
  }, [rows, q, plan]);

  const total = filtered.length;
  const pages = Math.max(1, Math.ceil(total / PAGE));
  const start = (page - 1) * PAGE;
  const visible = filtered.slice(start, start + PAGE);

  const exportCsv = () => {
    const header = ["Name","User ID","Business","Plan","State","Joined"];
    const lines = [header.join(",")].concat(filtered.map((r) =>
      [r.full_name ?? "", r.user_id, r.business_name ?? "", r.plan ?? "", r.state ?? "", r.created_at]
        .map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")
    ));
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `fynhelp-users-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <PageHeader title="User Management" subtitle="Manage all FYNHelp users and businesses" />

      <Card style={{ marginBottom: 24 }}>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative" style={{ minWidth: 240, flex: "1 1 280px" }}>
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2"
              color="hsl(var(--fyn-ink) / 0.4)" />
            <input
              value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }}
              placeholder="Search by name, business, or ID…"
              style={{
                width: "100%", height: 48, padding: "0 14px 0 38px", borderRadius: 12,
                border: "1px solid rgba(26,16,8,0.15)", background: "#fff",
                fontFamily: "Roboto, sans-serif", fontSize: 15, color: "hsl(var(--fyn-ink))",
                outline: "none",
              }}
            />
          </div>
          <select
            value={plan} onChange={(e) => { setPlan(e.target.value); setPage(1); }}
            style={{
              height: 48, padding: "0 14px", borderRadius: 12,
              border: "1px solid rgba(26,16,8,0.15)", background: "#fff",
              fontFamily: "Roboto, sans-serif", fontSize: 14, color: "hsl(var(--fyn-ink))", minWidth: 160,
            }}
          >
            <option value="all">All plans</option>
            <option value="starter">Starter</option>
            <option value="pro">Pro</option>
            <option value="enterprise">Enterprise</option>
          </select>
          <div className="ml-auto flex gap-2">
            <button
              onClick={exportCsv}
              className="flex items-center gap-2"
              style={{
                height: 48, padding: "0 18px", borderRadius: 12, background: "transparent",
                border: "2px solid #8B6914", color: "#8B6914",
                fontFamily: "DM Sans, sans-serif", fontWeight: 600, fontSize: 14,
              }}
            ><Download size={16} /> Export CSV</button>
          </div>
        </div>
      </Card>

      <Card style={{ padding: 0, overflow: "hidden" }}>
        <div className="overflow-x-auto">
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "rgba(26,16,8,0.04)", borderBottom: "2px solid rgba(139,105,20,0.2)" }}>
                {["Name","Business","Plan","State","Joined"].map((h) => (
                  <th key={h} style={{
                    padding: "16px", textAlign: "left",
                    fontFamily: "Raleway, sans-serif", fontWeight: 600, fontSize: 14, color: "hsl(var(--fyn-ink))",
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={5} className="text-center"
                  style={{ padding: 32, fontFamily: "Roboto, sans-serif", color: "hsl(var(--fyn-ink) / 0.5)" }}>
                  Loading users…
                </td></tr>
              )}
              {!loading && visible.length === 0 && (
                <tr><td colSpan={5} className="text-center"
                  style={{ padding: 32, fontFamily: "Roboto, sans-serif", color: "hsl(var(--fyn-ink) / 0.5)" }}>
                  No users match these filters.
                </td></tr>
              )}
              {visible.map((r, i) => (
                <tr key={r.user_id}
                  style={{
                    background: i % 2 ? "rgba(244,237,218,0.3)" : "#fff",
                    borderBottom: "1px solid rgba(26,16,8,0.06)",
                  }}>
                  <td style={cell}>
                    <div className="flex items-center gap-3">
                      <span className="grid place-items-center rounded-full text-white"
                        style={{
                          width: 32, height: 32,
                          background: "linear-gradient(135deg,#C41E1E,#8B6914)",
                          fontFamily: "Raleway, sans-serif", fontWeight: 700, fontSize: 12,
                        }}>
                        {(r.full_name ?? "?").slice(0, 2).toUpperCase()}
                      </span>
                      <div>
                        <div style={{ fontWeight: 500, color: "hsl(var(--fyn-ink))" }}>{r.full_name || "(no name)"}</div>
                        <div style={{ fontSize: 12, color: "hsl(var(--fyn-ink) / 0.5)" }}>{r.user_id.slice(0, 8)}…</div>
                      </div>
                    </div>
                  </td>
                  <td style={cell}>{r.business_name ?? <span style={{ color: "hsl(var(--fyn-ink) / 0.4)" }}>—</span>}</td>
                  <td style={cell}><PlanBadge plan={r.plan} /></td>
                  <td style={cell}>{r.state ?? "—"}</td>
                  <td style={cell}>{new Date(r.created_at).toLocaleDateString("en-IN",
                    { day: "2-digit", month: "short", year: "numeric" })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-6 py-4"
          style={{ borderTop: "1px solid rgba(26,16,8,0.06)" }}>
          <span style={{ fontFamily: "Roboto, sans-serif", fontSize: 14, color: "hsl(var(--fyn-ink) / 0.7)" }}>
            Showing {total === 0 ? 0 : start + 1}–{Math.min(start + PAGE, total)} of {total}
          </span>
          <div className="flex items-center gap-2">
            <PageBtn disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Prev</PageBtn>
            <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 14, color: "hsl(var(--fyn-ink))" }}>
              {page} / {pages}
            </span>
            <PageBtn disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>Next</PageBtn>
          </div>
        </div>
      </Card>
    </div>
  );
}

const cell: React.CSSProperties = {
  padding: "14px 16px", fontFamily: "Roboto, sans-serif", fontSize: 14,
  color: "hsl(var(--fyn-ink) / 0.85)", verticalAlign: "middle",
};

function PageBtn({ children, disabled, onClick }: { children: React.ReactNode; disabled?: boolean; onClick?: () => void }) {
  return (
    <button
      disabled={disabled} onClick={onClick}
      style={{
        height: 36, padding: "0 14px", borderRadius: 8,
        background: disabled ? "rgba(26,16,8,0.04)" : "#fff",
        border: "1px solid rgba(26,16,8,0.12)", color: "hsl(var(--fyn-ink))",
        fontFamily: "DM Sans, sans-serif", fontSize: 13, fontWeight: 600,
        opacity: disabled ? 0.5 : 1, cursor: disabled ? "not-allowed" : "pointer",
      }}
    >{children}</button>
  );
}

function PlanBadge({ plan }: { plan: string | null }) {
  const map: Record<string, { bg: string; fg: string; label: string }> = {
    starter:    { bg: "rgba(59,130,246,0.1)",  fg: "#3B82F6", label: "Starter" },
    pro:        { bg: "rgba(10,185,129,0.1)",  fg: "#10B981", label: "Pro" },
    enterprise: { bg: "rgba(196,30,30,0.1)",   fg: "#C41E1E", label: "Enterprise" },
  };
  const v = (plan && map[plan]) || { bg: "rgba(139,105,20,0.1)", fg: "#8B6914", label: plan ?? "Free" };
  return (
    <span style={{
      display: "inline-block", padding: "6px 12px", borderRadius: 6,
      background: v.bg, color: v.fg,
      fontFamily: "DM Sans, sans-serif", fontWeight: 600, fontSize: 12,
    }}>{v.label}</span>
  );
}
