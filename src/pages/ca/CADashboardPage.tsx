import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCAAuth } from "@/contexts/CAAuthContext";
import { useCAClients } from "@/hooks/useCAClients";
import { supabase } from "@/integrations/supabase/client";
import {
  Plus, Upload, RefreshCw, FileText, X, Bell,
  AlertTriangle, AlertCircle, Info, ChevronLeft, ChevronRight,
} from "lucide-react";

const COLORS = {
  ink: "#1A1008",
  red: "#C41E1E",
  beige: "#EDE4CB",
  beigeBorder: "#D4C9A8",
  beigeRow: "#FAF7F0",
  amber: "#F59E0B",
  green: "#1A6B3C",
  blue: "#1A4A8B",
  redLight: "#F9EDED",
};

interface CANotification {
  id: string;
  title: string;
  message: string;
  severity: string | null;
  is_read: boolean | null;
  created_at: string | null;
  business_id: string | null;
  businesses?: { business_name: string } | null;
}

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
};

const timeAgo = (iso: string | null): string => {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const d = Math.floor(hr / 24);
  return `${d}d ago`;
};

const ROWS_PER_PAGE = 10;

export default function CADashboardPage() {
  const { caFirm, isDemoCA } = useCAAuth();
  const navigate = useNavigate();
  const { clients, loading: clientsLoading } = useCAClients();
  const [notifications, setNotifications] = useState<CANotification[]>([]);
  const [notifLoading, setNotifLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "critical" | "filings">("all");
  const [sort, setSort] = useState<"name" | "recent" | "alerts">("alerts");
  const [page, setPage] = useState(1);
  const [fabOpen, setFabOpen] = useState(false);

  // Fetch notifications
  useEffect(() => {
    if (!caFirm?.id) return;
    let cancelled = false;
    (async () => {
      setNotifLoading(true);
      const { data } = await supabase
        .from("ca_notifications")
        .select("id, title, message, severity, is_read, created_at, business_id, businesses(business_name)")
        .eq("ca_firm_id", caFirm.id)
        .order("created_at", { ascending: false })
        .limit(5);
      if (!cancelled) {
        setNotifications((data as any) || []);
        setNotifLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [caFirm?.id]);

  // Derived metrics
  const metrics = useMemo(() => {
    const activeClients = clients.length;
    const filingsThisWeek = clients.filter((c) => c.filing <= 7).length;
    const gstr3b = Math.ceil(filingsThisWeek * 0.6);
    const gstr1 = filingsThisWeek - gstr3b;
    const criticalAlerts = clients.filter((c) => c.cash === "Critical" || c.health < 40).length;
    const itcRiskClients = clients.filter((c) => c.cash !== "Safe").length;
    const itcAtRisk = clients.reduce((sum, c) => sum + (c.itcAtRisk ?? 0), 0) / 100000;
    return {
      activeClients,
      filingsThisWeek,
      gstr3b,
      gstr1,
      criticalAlerts,
      itcAtRisk,
      itcRiskClients,
    };
  }, [clients]);

  // Filter + sort + paginate
  const filtered = useMemo(() => {
    let rows = [...clients];
    if (filter === "critical") rows = rows.filter((c) => c.cash === "Critical" || c.health < 40);
    if (filter === "filings") rows = rows.filter((c) => c.filing <= 7);
    if (sort === "name") rows.sort((a, b) => a.name.localeCompare(b.name));
    if (sort === "recent") rows.sort((a, b) => (b.granted_at || "").localeCompare(a.granted_at || ""));
    if (sort === "alerts") rows.sort((a, b) => {
      const sev = (c: typeof a) => (c.cash === "Critical" ? 3 : c.health < 40 ? 2 : c.filing < 7 ? 1 : 0);
      return sev(b) - sev(a);
    });
    return rows;
  }, [clients, filter, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE));
  const pageRows = filtered.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE);
  useEffect(() => { if (page > totalPages) setPage(1); }, [filtered, totalPages, page]);

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  return (
    <div className="font-sans" style={{ background: COLORS.beige, minHeight: "calc(100vh - 56px)" }}>
      {isDemoCA && (
        <div style={{ background: "rgba(245,158,11,0.12)", borderBottom: "1px solid rgba(245,158,11,0.25)", padding: "10px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: "#92400E" }}>
            You are viewing the CA Partner Demo. Data is illustrative. No changes are saved.
          </span>
          <button
            onClick={() => { sessionStorage.clear(); window.location.href = "/"; }}
            style={{ fontFamily: "Inter, sans-serif", fontSize: 12, fontWeight: 600, color: "#92400E", background: "transparent", border: "1px solid rgba(146,64,14,0.3)", borderRadius: 6, padding: "4px 12px", cursor: "pointer" }}
          >
            Exit demo
          </button>
        </div>
      )}
      <div className="px-8 py-8">
      {/* 1. Welcome */}
      <div className="mb-8">
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: "28px", color: COLORS.ink, lineHeight: 1.2 }}>
          {greeting()}, {caFirm?.firm_name || "Partner"}
        </h1>
        <p className="mt-1.5" style={{ fontFamily: "Inter, sans-serif", fontWeight: 400, fontSize: "15px", color: "rgba(26,16,8,0.65)" }}>
          You're managing {metrics.activeClients} active client{metrics.activeClients === 1 ? "" : "s"}
        </p>
        <p className="mt-1" style={{ fontFamily: "Inter, sans-serif", fontWeight: 400, fontSize: "13px", color: "rgba(26,16,8,0.45)" }}>
          {today}
        </p>
      </div>

      {/* 2. Portfolio metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard
          label="Active Clients"
          value={clientsLoading ? "-" : String(metrics.activeClients)}
          sub={`↑ ${Math.min(3, metrics.activeClients)} new this month`}
        />
        <MetricCard
          label="Filings Due This Week"
          value={clientsLoading ? "-" : String(metrics.filingsThisWeek)}
          valueColor={metrics.filingsThisWeek > 20 ? COLORS.red : metrics.filingsThisWeek > 10 ? COLORS.amber : "#fff"}
          sub={`GSTR-3B: ${metrics.gstr3b}, GSTR-1: ${metrics.gstr1}`}
        />
        <MetricCard
          label="Critical Alerts"
          value={clientsLoading ? "-" : String(metrics.criticalAlerts)}
          valueColor={metrics.criticalAlerts > 0 ? COLORS.amber : "#fff"}
          sub={<button onClick={() => navigate("/ca/notifications")} className="hover:underline">View all →</button>}
        />
        <MetricCard
          label="Total ITC at Risk"
          value={clientsLoading ? "-" : `₹${metrics.itcAtRisk.toFixed(1)}L`}
          valueColor={COLORS.amber}
          sub={`Across ${metrics.itcRiskClients} client${metrics.itcRiskClients === 1 ? "" : "s"}`}
        />
      </div>

      {/* 3. Recent notifications */}
      <div className="bg-white rounded-lg p-6 mb-6" style={{ border: `1px solid ${COLORS.beigeBorder}` }}>
        <div className="flex items-center justify-between mb-4">
          <h3 style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: "16px", color: COLORS.ink }}>
            Recent Notifications
          </h3>
          <Bell size={16} style={{ color: "rgba(26,16,8,0.4)" }} />
        </div>

        {notifLoading ? (
          <div className="py-8 text-center text-sm" style={{ color: "rgba(26,16,8,0.5)" }}>Loading…</div>
        ) : notifications.length === 0 ? (
          <div className="py-8 text-center text-sm" style={{ color: "rgba(26,16,8,0.55)" }}>
            No recent notifications
          </div>
        ) : (
          <div>
            {notifications.map((n, i) => (
              <NotificationRow
                key={n.id}
                notif={n}
                isLast={i === notifications.length - 1}
                onView={() => navigate("/ca/notifications")}
              />
            ))}
          </div>
        )}

        <div className="text-right mt-4">
          <button onClick={() => navigate("/ca/notifications")}
            className="hover:underline"
            style={{ fontFamily: "Inter, sans-serif", fontWeight: 500, fontSize: "13px", color: COLORS.red }}>
            View all notifications →
          </button>
        </div>
      </div>

      {/* 4. Client list */}
      <div className="bg-white rounded-lg p-6" style={{ border: `1px solid ${COLORS.beigeBorder}` }}>
        <div className="flex items-center justify-between mb-5 gap-3 flex-wrap">
          <h3 style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: "16px", color: COLORS.ink }}>
            Your Clients ({metrics.activeClients} active)
          </h3>
          <div className="flex items-center gap-2 flex-wrap">
            <Select value={filter} onChange={(v) => setFilter(v as any)}
              options={[
                { value: "all", label: "All clients" },
                { value: "critical", label: "Critical alerts" },
                { value: "filings", label: "Filings due" },
              ]} />
            <Select value={sort} onChange={(v) => setSort(v as any)}
              options={[
                { value: "alerts", label: "Sort: Alert count" },
                { value: "name", label: "Sort: Name A–Z" },
                { value: "recent", label: "Sort: Recent activity" },
              ]} />
            <button onClick={() => navigate("/ca/clients/add")}
              className="rounded-lg flex items-center gap-1.5 hover:brightness-90 transition"
              style={{
                background: COLORS.red, color: "#fff", padding: "8px 16px",
                fontFamily: "Inter, sans-serif", fontWeight: 500, fontSize: "13px",
              }}>
              <Plus size={14} /> Add new client
            </button>
          </div>
        </div>

        <div className="overflow-x-auto -mx-2">
          <table className="w-full" style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${COLORS.beigeBorder}` }}>
                {["Client", "Industry", "Cash Runway", "Critical Alerts", "Next Filing", "Last Activity", "Actions"].map((h) => (
                  <th key={h} className="px-3 py-3 text-left"
                    style={{
                      fontFamily: "Inter, sans-serif", fontWeight: 500, fontSize: "11px",
                      color: "rgba(26,16,8,0.65)", textTransform: "uppercase", letterSpacing: "0.05em",
                    }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {clientsLoading && (
                <tr><td colSpan={7} className="py-10 text-center text-sm" style={{ color: "rgba(26,16,8,0.5)" }}>Loading clients…</td></tr>
              )}
              {!clientsLoading && pageRows.length === 0 && (
                <tr><td colSpan={7} className="py-10 text-center text-sm" style={{ color: "rgba(26,16,8,0.55)" }}>
                  No clients match. <button onClick={() => navigate("/ca/clients/add")} className="font-medium underline" style={{ color: COLORS.red }}>Add your first client</button>
                </td></tr>
              )}
              {!clientsLoading && pageRows.map((c) => {
                const runwayDays = c.cash === "Safe" ? 120 : c.cash === "Watch" ? 60 : 18;
                const runwayColor = runwayDays > 90 ? COLORS.green : runwayDays >= 30 ? COLORS.amber : COLORS.red;
                const alertCount = (c.cash === "Critical" ? 2 : 0) + (c.health < 40 ? 1 : 0) + (c.filing < 3 ? 1 : 0);
                const dueDate = c.nextFilingDate
                  ? new Date(c.nextFilingDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })
                  : "No filings";
                const urgencyColor = c.filing < 3 ? COLORS.red : c.filing <= 7 ? COLORS.amber : "transparent";
                return (
                  <tr key={c.id}
                    className="cursor-pointer transition-colors"
                    style={{ borderBottom: `1px solid ${COLORS.beigeRow}` }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = COLORS.beigeRow)}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    onClick={() => navigate(`/ca/client/${c.business_id}`)}>
                    <td className="px-3 py-3.5">
                      <div style={{ fontFamily: "Inter, sans-serif", fontWeight: 500, fontSize: "14px", color: COLORS.ink }}>
                        {c.name}
                      </div>
                      <div style={{ fontFamily: "Inter, sans-serif", fontWeight: 400, fontSize: "12px", color: "rgba(26,16,8,0.45)" }}>
                        {c.gstin || "GSTIN pending"}
                      </div>
                    </td>
                    <td className="px-3 py-3.5" style={{ fontFamily: "Inter, sans-serif", fontWeight: 400, fontSize: "13px", color: "rgba(26,16,8,0.65)" }}>
                      {c.industry}
                    </td>
                    <td className="px-3 py-3.5" style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: "14px", color: runwayColor }}>
                      {runwayDays}d
                    </td>
                    <td className="px-3 py-3.5">
                      {alertCount > 0 ? (
                        <span className="inline-flex items-center justify-center rounded-full text-white"
                          style={{
                            background: COLORS.red, padding: "4px 10px",
                            fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: "12px", minWidth: "28px",
                          }}>
                          {alertCount}
                        </span>
                      ) : (
                        <span style={{ color: "rgba(26,16,8,0.35)", fontSize: "13px" }}>-</span>
                      )}
                    </td>
                    <td className="px-3 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: urgencyColor }} />
                        <div>
                          <div style={{ fontFamily: "Inter, sans-serif", fontWeight: 500, fontSize: "13px", color: COLORS.ink }}>
                            {c.nextFilingType === "-" ? "No pending" : c.nextFilingType}
                          </div>
                          <div style={{ fontFamily: "Inter, sans-serif", fontWeight: 400, fontSize: "12px", color: "rgba(26,16,8,0.55)" }}>
                            Due {dueDate}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3.5" style={{ fontFamily: "Inter, sans-serif", fontWeight: 400, fontSize: "13px", color: "rgba(26,16,8,0.55)" }}>
                      {c.report}
                    </td>
                    <td className="px-3 py-3.5">
                      <span className="hover:underline"
                        style={{ fontFamily: "Inter, sans-serif", fontWeight: 500, fontSize: "13px", color: COLORS.red }}>
                        View →
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filtered.length > 0 && (
          <div className="flex items-center justify-between mt-5 pt-4" style={{ borderTop: `1px solid ${COLORS.beigeRow}` }}>
            <div style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "rgba(26,16,8,0.55)" }}>
              Showing {(page - 1) * ROWS_PER_PAGE + 1}–{Math.min(page * ROWS_PER_PAGE, filtered.length)} of {filtered.length} client{filtered.length === 1 ? "" : "s"}
            </div>
            <div className="flex items-center gap-1">
              <PageBtn disabled={page === 1} onClick={() => setPage((p) => p - 1)}><ChevronLeft size={14} /></PageBtn>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <PageBtn key={p} active={p === page} onClick={() => setPage(p)}>{p}</PageBtn>
              ))}
              <PageBtn disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}><ChevronRight size={14} /></PageBtn>
            </div>
          </div>
        )}
      </div>

      {/* 5. Quick Actions FAB */}
      <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end gap-3">
        {fabOpen && (
          <>
            <FabMini icon={<Upload size={18} />} label="File GST" onClick={() => { setFabOpen(false); navigate("/ca/gst-portfolio"); }} />
            <FabMini icon={<RefreshCw size={18} />} label="Run ITC Recon" onClick={() => { setFabOpen(false); navigate("/ca/itc-recon"); }} />
            <FabMini icon={<FileText size={18} />} label="Generate Report" onClick={() => { setFabOpen(false); navigate("/ca/reports"); }} />
            <FabMini icon={<Plus size={18} />} label="Add Client" onClick={() => { setFabOpen(false); navigate("/ca/clients/add"); }} />
          </>
        )}
        <button
          onClick={() => setFabOpen((o) => !o)}
          aria-label="Quick actions"
          className="rounded-full flex items-center justify-center transition-transform hover:scale-105"
          style={{
            width: "56px", height: "56px", background: COLORS.red,
            boxShadow: "0 10px 30px -8px rgba(196,30,30,0.5)",
            transform: fabOpen ? "rotate(45deg)" : "rotate(0)",
          }}
        >
          {fabOpen ? <X size={22} color="#fff" /> : <Plus size={24} color="#fff" />}
        </button>
      </div>
    </div>
  );
}

/* ---------- Sub-components ---------- */

function MetricCard({ label, value, valueColor = "#fff", sub }: {
  label: string; value: string; valueColor?: string; sub?: React.ReactNode;
}) {
  return (
    <div className="rounded-lg p-6" style={{ background: COLORS.ink }}>
      <div style={{ fontFamily: "Inter, sans-serif", fontWeight: 500, fontSize: "13px", color: "rgba(255,255,255,0.55)" }}>
        {label}
      </div>
      <div className="mt-3" style={{
        fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: "42px", lineHeight: 1, color: valueColor,
      }}>
        {value}
      </div>
      {sub != null && (
        <div className="mt-2.5" style={{ fontFamily: "Inter, sans-serif", fontWeight: 400, fontSize: "12px", color: "rgba(255,255,255,0.65)" }}>
          {sub}
        </div>
      )}
    </div>
  );
}

function NotificationRow({ notif, isLast, onView }: { notif: CANotification; isLast: boolean; onView: () => void }) {
  const sev = (notif.severity || "info").toLowerCase();
  const meta = sev === "critical"
    ? { color: COLORS.red, Icon: AlertCircle }
    : sev === "warning"
    ? { color: COLORS.amber, Icon: AlertTriangle }
    : { color: COLORS.blue, Icon: Info };
  return (
    <div className="flex items-start gap-3 py-3.5"
      style={isLast ? {} : { borderBottom: `1px solid ${COLORS.beige}` }}>
      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{ background: `${meta.color}1A` }}>
        <meta.Icon size={16} style={{ color: meta.color }} />
      </div>
      <div className="flex-1 min-w-0">
        <div style={{ fontFamily: "Inter, sans-serif", fontWeight: 500, fontSize: "14px", color: COLORS.ink }}>
          {notif.title}
        </div>
        <div className="mt-0.5" style={{ fontFamily: "Inter, sans-serif", fontWeight: 400, fontSize: "13px", color: "rgba(26,16,8,0.65)", lineHeight: 1.45 }}>
          {notif.message}
        </div>
        <div className="mt-1" style={{ fontFamily: "Inter, sans-serif", fontWeight: 400, fontSize: "12px", color: "rgba(26,16,8,0.45)" }}>
          {notif.businesses?.business_name && <>{notif.businesses.business_name} · </>}
          {timeAgo(notif.created_at)}
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {!notif.is_read && <span className="w-2 h-2 rounded-full" style={{ background: meta.color }} />}
        <button onClick={onView}
          className="hover:underline"
          style={{ fontFamily: "Inter, sans-serif", fontWeight: 500, fontSize: "13px", color: COLORS.red }}>
          View →
        </button>
      </div>
    </div>
  );
}

function Select({ value, onChange, options }: {
  value: string; onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}
      className="rounded-lg bg-white cursor-pointer focus:outline-none"
      style={{
        border: `1px solid ${COLORS.beigeBorder}`, padding: "8px 12px",
        fontFamily: "Inter, sans-serif", fontWeight: 500, fontSize: "13px", color: COLORS.ink,
      }}>
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

function PageBtn({ children, onClick, disabled, active }: {
  children: React.ReactNode; onClick?: () => void; disabled?: boolean; active?: boolean;
}) {
  return (
    <button onClick={onClick} disabled={disabled}
      className="min-w-[32px] h-8 rounded-md flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      style={{
        background: active ? COLORS.red : "transparent",
        color: active ? "#fff" : COLORS.ink,
        border: active ? "none" : `1px solid ${COLORS.beigeBorder}`,
        padding: "0 8px",
        fontFamily: "Inter, sans-serif", fontWeight: 500, fontSize: "13px",
      }}>
      {children}
    </button>
  );
}

function FabMini({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <div className="flex items-center gap-3 group">
      <span className="bg-white px-3 py-1.5 rounded-md shadow opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", fontWeight: 500, color: COLORS.ink, border: `1px solid ${COLORS.beigeBorder}` }}>
        {label}
      </span>
      <button onClick={onClick} aria-label={label}
        className="rounded-full bg-white flex items-center justify-center transition-transform hover:scale-110"
        style={{
          width: "48px", height: "48px",
          border: `2px solid ${COLORS.red}`, color: COLORS.red,
          boxShadow: "0 6px 16px -4px rgba(0,0,0,0.15)",
        }}>
        {icon}
      </button>
    </div>
  );
}
