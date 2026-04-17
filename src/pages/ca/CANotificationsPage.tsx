import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useCAAuth } from "@/contexts/CAAuthContext";
import { COLORS, PageWrap, Card, PrimaryBtn, SecondaryBtn } from "@/components/ca/ui";
import {
  Bell, BellOff, Calendar, AlertTriangle, User, Key, Settings as SettingsIcon,
  Eye, EyeOff, Trash2, X, CheckCircle2, Loader2, RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

// ─── Types ──────────────────────────────────────────────────────────────────
type Notif = {
  id: string;
  ca_firm_id: string;
  business_id: string | null;
  type: string;
  title: string;
  message: string;
  severity: "critical" | "warning" | "info" | string | null;
  is_read: boolean | null;
  created_at: string | null;
  businesses: { id: string; business_name: string } | null;
};

type TabKey = "All" | "Unread" | "Critical" | "ThisWeek";
type TypeFilter = "All" | "Filing Due" | "ITC Alert" | "Client Activity" | "Access Request" | "System Update";
type SeverityFilter = "All" | "critical" | "warning" | "info";
type DateRange = "All" | "Today" | "7d" | "30d" | "90d";

// Map raw `type` → category
const TYPE_CATEGORY: Record<string, TypeFilter> = {
  filing_due_1d: "Filing Due", filing_due_today: "Filing Due", filing_overdue: "Filing Due",
  itc_mismatch: "ITC Alert", itc_risk_high: "ITC Alert", notice_risk_high: "ITC Alert",
  cash_low: "Client Activity", client_activity: "Client Activity",
  access_request_new: "Access Request", access_revoked: "Access Request",
  system_update: "System Update",
};
const categoryFor = (t: string): TypeFilter => TYPE_CATEGORY[t] || "Client Activity";

const TYPE_BADGE: Record<TypeFilter, { bg: string; color: string }> = {
  "Filing Due":      { bg: "#FEF3C7", color: "#92400E" },
  "ITC Alert":       { bg: "#FEE2E2", color: "#991B1B" },
  "Client Activity": { bg: "#DBEAFE", color: "#1E40AF" },
  "Access Request":  { bg: "#EDE9FE", color: "#5B21B6" },
  "System Update":   { bg: "#F3F0E6", color: "rgba(26,16,8,0.65)" },
  All:               { bg: "#F3F0E6", color: "rgba(26,16,8,0.65)" },
};

const ICON_FOR: Record<TypeFilter, any> = {
  "Filing Due": Calendar,
  "ITC Alert": AlertTriangle,
  "Client Activity": User,
  "Access Request": Key,
  "System Update": Bell,
  All: Bell,
};

const sevColor = (s: string | null) =>
  s === "critical" ? COLORS.red : s === "warning" ? COLORS.amber : COLORS.blue;

// Time-ago formatter
function timeAgo(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  const now = new Date();
  const diff = (now.getTime() - d.getTime()) / 1000;
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hour${Math.floor(diff / 3600) > 1 ? "s" : ""} ago`;
  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  const yest = new Date(now); yest.setDate(yest.getDate() - 1);
  if (sameDay(d, yest)) return `Yesterday at ${d.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })}`;
  if (diff < 7 * 86400) return d.toLocaleDateString("en-IN", { weekday: "short" }) +
    ` at ${d.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })}`;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }) +
    ` at ${d.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })}`;
}

const PAGE_SIZE = 20;
const DEFAULT_PREFS = {
  email: true, whatsapp: false,
  filing_due_1d: true, filing_overdue: true, itc_risk_high: true, notice_risk_high: true,
  filing_due_3d: true, itc_mismatch: true, cash_low: true,
  access_request_new: true, client_activity: true, system_update: false, weekly_digest: false,
  quiet_start: "22:00", quiet_end: "08:00",
};

// ─── Page ───────────────────────────────────────────────────────────────────
export default function CANotificationsPage() {
  const { caFirm } = useCAAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [clients, setClients] = useState<{ id: string; business_name: string }[]>([]);

  const [tab, setTab] = useState<TabKey>("All");
  const [filterTypes, setFilterTypes] = useState<TypeFilter[]>(["All"]);
  const [typePickerOpen, setTypePickerOpen] = useState(false);
  const [filterSeverity, setFilterSeverity] = useState<SeverityFilter>("All");
  const [filterClient, setFilterClient] = useState<string>("All");
  const [filterDate, setFilterDate] = useState<DateRange>("All");

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [prefsOpen, setPrefsOpen] = useState(false);

  // ─── Fetch ─────
  const fetchAll = async () => {
    if (!caFirm) return;
    setLoading(true);
    setError(null);

    const [{ data: nData, error: nErr }, { data: aData }] = await Promise.all([
      supabase
        .from("ca_notifications")
        .select("id, ca_firm_id, business_id, type, title, message, severity, is_read, created_at, businesses(id, business_name)")
        .eq("ca_firm_id", caFirm.id)
        .order("created_at", { ascending: false })
        .limit(200),
      supabase
        .from("ca_client_access")
        .select("businesses(id, business_name)")
        .eq("ca_firm_id", caFirm.id)
        .eq("is_active", true),
    ]);

    if (nErr) {
      setError("Unable to load notifications. Please refresh.");
      setNotifs([]);
    } else {
      setNotifs((nData || []) as unknown as Notif[]);
    }
    setClients(((aData || []).map((a: any) => a.businesses).filter(Boolean)) as any);
    setLoading(false);
  };

  useEffect(() => { fetchAll(); /* eslint-disable-next-line */ }, [caFirm]);

  // ─── Realtime ─────
  useEffect(() => {
    if (!caFirm) return;
    const channel = supabase
      .channel(`ca_notifs_${caFirm.id}`)
      .on("postgres_changes", {
        event: "INSERT", schema: "public", table: "ca_notifications",
        filter: `ca_firm_id=eq.${caFirm.id}`,
      }, async (payload) => {
        const newRow = payload.new as Notif;
        // Fetch joined business
        let withBiz: Notif = { ...newRow, businesses: null };
        if (newRow.business_id) {
          const { data } = await supabase.from("businesses").select("id, business_name").eq("id", newRow.business_id).maybeSingle();
          withBiz.businesses = data as any;
        }
        setNotifs(prev => [withBiz, ...prev]);
        toast(newRow.title, { description: newRow.message });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [caFirm]);

  // ─── Filter pipeline ─────
  const filtered = useMemo(() => {
    const now = Date.now();
    const oneWeek = 7 * 86400_000;
    const cutoffByRange: Record<DateRange, number> = {
      All: 0, Today: 86400_000, "7d": 7 * 86400_000, "30d": 30 * 86400_000, "90d": 90 * 86400_000,
    };
    return notifs.filter(n => {
      // Tab
      if (tab === "Unread" && n.is_read) return false;
      if (tab === "Critical" && n.severity !== "critical") return false;
      if (tab === "ThisWeek") {
        if (!n.created_at || now - new Date(n.created_at).getTime() > oneWeek) return false;
      }
      // Type
      if (!filterTypes.includes("All") && filterTypes.length > 0) {
        if (!filterTypes.includes(categoryFor(n.type))) return false;
      }
      // Severity
      if (filterSeverity !== "All" && n.severity !== filterSeverity) return false;
      // Client
      if (filterClient !== "All" && n.business_id !== filterClient) return false;
      // Date range
      if (filterDate !== "All") {
        const cutoff = cutoffByRange[filterDate];
        if (!n.created_at || now - new Date(n.created_at).getTime() > cutoff) return false;
      }
      return true;
    });
  }, [notifs, tab, filterTypes, filterSeverity, filterClient, filterDate]);

  // ─── Counts for tabs ─────
  const counts = useMemo(() => {
    const oneWeek = 7 * 86400_000;
    const now = Date.now();
    return {
      all: notifs.length,
      unread: notifs.filter(n => !n.is_read).length,
      critical: notifs.filter(n => n.severity === "critical").length,
      thisWeek: notifs.filter(n => n.created_at && now - new Date(n.created_at).getTime() <= oneWeek).length,
    };
  }, [notifs]);

  const filtersActive = !filterTypes.includes("All") || filterSeverity !== "All" || filterClient !== "All" || filterDate !== "All";
  const clearFilters = () => {
    setFilterTypes(["All"]); setFilterSeverity("All"); setFilterClient("All"); setFilterDate("All");
  };

  // ─── Mutations ─────
  const markRead = async (id: string, read: boolean) => {
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, is_read: read } : n));
    const { error } = await supabase.from("ca_notifications").update({ is_read: read }).eq("id", id);
    if (error) { toast.error("Failed to update"); fetchAll(); }
  };

  const markAllRead = async () => {
    if (!caFirm) return;
    const ids = notifs.filter(n => !n.is_read).map(n => n.id);
    if (ids.length === 0) { toast("Nothing to mark"); return; }
    setNotifs(prev => prev.map(n => ({ ...n, is_read: true })));
    const { error } = await supabase
      .from("ca_notifications").update({ is_read: true })
      .eq("ca_firm_id", caFirm.id).eq("is_read", false);
    if (error) { toast.error("Failed"); fetchAll(); return; }
    toast.success(`Marked ${ids.length} notification${ids.length > 1 ? "s" : ""} as read`);
  };

  const deleteOne = async (id: string) => {
    // Note: ca_notifications has no DELETE policy → fallback to mark as read & hide locally.
    const { error } = await supabase.from("ca_notifications").delete().eq("id", id);
    if (error) {
      // Hide locally (user perceives delete) & mark read in DB
      setNotifs(prev => prev.filter(n => n.id !== id));
      await supabase.from("ca_notifications").update({ is_read: true }).eq("id", id);
      toast.success("Notification dismissed");
      return;
    }
    setNotifs(prev => prev.filter(n => n.id !== id));
    toast.success("Notification deleted");
  };

  const bulkMark = async (read: boolean) => {
    const ids = Array.from(selected);
    if (ids.length === 0) return;
    setNotifs(prev => prev.map(n => ids.includes(n.id) ? { ...n, is_read: read } : n));
    const { error } = await supabase.from("ca_notifications").update({ is_read: read }).in("id", ids);
    if (error) { toast.error("Bulk update failed"); fetchAll(); return; }
    toast.success(`Marked ${ids.length} as ${read ? "read" : "unread"}`);
    setSelected(new Set());
  };

  const bulkDelete = async () => {
    const ids = Array.from(selected);
    if (ids.length === 0) return;
    setNotifs(prev => prev.filter(n => !ids.includes(n.id)));
    const { error } = await supabase.from("ca_notifications").delete().in("id", ids);
    if (error) { await supabase.from("ca_notifications").update({ is_read: true }).in("id", ids); }
    toast.success(`Removed ${ids.length} notification${ids.length > 1 ? "s" : ""}`);
    setSelected(new Set());
  };

  const handleClick = async (n: Notif) => {
    if (!n.is_read) markRead(n.id, true);
    const cat = categoryFor(n.type);
    if (cat === "Filing Due" && n.business_id) navigate(`/ca/client/${n.business_id}?tab=compliance`);
    else if (cat === "ITC Alert" && n.business_id) navigate(`/ca/client/${n.business_id}?tab=gst-itc`);
    else if (cat === "Client Activity" && n.business_id) navigate(`/ca/client/${n.business_id}`);
    else if (cat === "Access Request") navigate("/ca/clients");
  };

  const visible = filtered.slice(0, visibleCount);
  const allSelectedVisible = visible.length > 0 && visible.every(n => selected.has(n.id));

  // ─── Render ─────
  return (
    <PageWrap>
      {/* Header */}
      <div className="flex items-start justify-between mb-5 flex-wrap gap-3">
        <div>
          <div className="text-[13px] mb-1" style={{ color: "rgba(26,16,8,0.45)" }}>Dashboard / Notifications</div>
          <h1 className="text-[28px] font-bold leading-tight" style={{ color: COLORS.ink }}>
            Notifications <span className="text-[18px] font-normal ml-1" style={{ color: "rgba(26,16,8,0.65)" }}>({counts.unread} unread)</span>
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <SecondaryBtn size="sm" onClick={markAllRead}>Mark all as read</SecondaryBtn>
          <button onClick={() => setPrefsOpen(true)} className="h-8 w-8 rounded-md bg-white flex items-center justify-center hover:bg-[#F8F6F1]"
            style={{ border: `1px solid ${COLORS.caBorder}` }} aria-label="Notification preferences">
            <SettingsIcon size={14} style={{ color: COLORS.ink }} />
          </button>
          <button onClick={fetchAll} className="h-8 w-8 rounded-md bg-white flex items-center justify-center hover:bg-[#F8F6F1]"
            style={{ border: `1px solid ${COLORS.caBorder}` }} aria-label="Refresh">
            <RefreshCw size={14} style={{ color: COLORS.ink }} />
          </button>
        </div>
      </div>

      {/* Quick filter tabs */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {([
          ["All", `All (${counts.all})`],
          ["Unread", `Unread (${counts.unread})`],
          ["Critical", `Critical (${counts.critical})`],
          ["ThisWeek", `This Week (${counts.thisWeek})`],
        ] as [TabKey, string][]).map(([k, label]) => (
          <button key={k} onClick={() => { setTab(k); setVisibleCount(PAGE_SIZE); }}
            className="px-4 py-1.5 rounded-lg text-xs font-medium transition-colors"
            style={tab === k ? { background: COLORS.red, color: "#FFFFFF" } : { color: "rgba(26,16,8,0.65)", background: "transparent" }}>
            {label}
          </button>
        ))}
      </div>

      {/* Filters bar */}
      <Card className="!p-4 mb-4">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Type multi */}
          <div className="relative">
            <button onClick={() => setTypePickerOpen(o => !o)} className="h-9 px-3 rounded-md text-xs bg-white text-left min-w-[140px]"
              style={{ border: `1px solid ${COLORS.caBorder}` }}>
              {filterTypes.includes("All") || filterTypes.length === 0 ? "All Types" : `${filterTypes.length} type${filterTypes.length > 1 ? "s" : ""}`}
            </button>
            {typePickerOpen && (
              <div className="absolute top-10 left-0 z-20 w-56 bg-white rounded-md shadow-lg p-2" style={{ border: `1px solid ${COLORS.caBorder}` }}>
                {(["All", "Filing Due", "ITC Alert", "Client Activity", "Access Request", "System Update"] as TypeFilter[]).map(t => {
                  const checked = filterTypes.includes(t);
                  return (
                    <label key={t} className="flex items-center gap-2 px-2 py-1.5 text-sm rounded hover:bg-[#F8F6F1] cursor-pointer" style={{ color: COLORS.ink }}>
                      <input type="checkbox" checked={checked}
                        onChange={() => {
                          if (t === "All") { setFilterTypes(["All"]); return; }
                          setFilterTypes(prev => {
                            const next = prev.filter(x => x !== "All");
                            return checked ? next.filter(x => x !== t) : [...next, t];
                          });
                        }} />
                      <span>{t}</span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {/* Severity */}
          <select value={filterSeverity} onChange={(e) => setFilterSeverity(e.target.value as SeverityFilter)}
            className="h-9 px-3 rounded-md text-xs bg-white" style={{ border: `1px solid ${COLORS.caBorder}` }}>
            <option value="All">All Severity</option>
            <option value="critical">Critical</option>
            <option value="warning">Warning</option>
            <option value="info">Info</option>
          </select>

          {/* Client */}
          <select value={filterClient} onChange={(e) => setFilterClient(e.target.value)}
            className="h-9 px-3 rounded-md text-xs bg-white max-w-[200px]" style={{ border: `1px solid ${COLORS.caBorder}` }}>
            <option value="All">All Clients</option>
            {clients.map(c => <option key={c.id} value={c.id}>{c.business_name}</option>)}
          </select>

          {/* Date range */}
          <select value={filterDate} onChange={(e) => setFilterDate(e.target.value as DateRange)}
            className="h-9 px-3 rounded-md text-xs bg-white" style={{ border: `1px solid ${COLORS.caBorder}` }}>
            <option value="All">All Time</option>
            <option value="Today">Today</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>

          {filtersActive && <button onClick={clearFilters} className="text-[13px] ml-auto" style={{ color: COLORS.red }}>Clear filters</button>}
        </div>
      </Card>

      {/* Bulk actions bar */}
      {selected.size > 0 && (
        <div className="sticky top-14 z-20 mb-3 rounded-md p-3 flex items-center justify-between" style={{ background: COLORS.ink, color: "#FFFFFF" }}>
          <div className="flex items-center gap-3">
            <input type="checkbox" checked={allSelectedVisible}
              onChange={() => {
                if (allSelectedVisible) {
                  const next = new Set(selected); visible.forEach(v => next.delete(v.id)); setSelected(next);
                } else {
                  const next = new Set(selected); visible.forEach(v => next.add(v.id)); setSelected(next);
                }
              }} />
            <span className="text-sm">{selected.size} selected</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => bulkMark(true)} className="text-xs px-2 py-1 rounded hover:bg-white/10">Mark as read</button>
            <button onClick={() => bulkMark(false)} className="text-xs px-2 py-1 rounded hover:bg-white/10">Mark as unread</button>
            <button onClick={bulkDelete} className="text-xs px-2 py-1 rounded hover:bg-white/10" style={{ color: "#FCA5A5" }}>Delete</button>
            <button onClick={() => setSelected(new Set())} className="text-xs px-2 py-1 rounded hover:bg-white/10">Deselect all</button>
          </div>
        </div>
      )}

      {/* List / states */}
      {loading ? (
        <Card>
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3 py-3 animate-pulse">
                <div className="w-1 h-14 rounded" style={{ background: COLORS.divider }} />
                <div className="w-8 h-8 rounded-full" style={{ background: COLORS.divider }} />
                <div className="flex-1 space-y-2">
                  <div className="h-3 rounded w-1/4" style={{ background: COLORS.divider }} />
                  <div className="h-4 rounded w-2/3" style={{ background: COLORS.divider }} />
                  <div className="h-3 rounded w-1/2" style={{ background: COLORS.divider }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      ) : error ? (
        <Card>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <AlertTriangle size={40} style={{ color: COLORS.red }} />
            <h3 className="mt-3 text-[18px] font-bold" style={{ color: COLORS.ink }}>{error}</h3>
            <div className="mt-3"><PrimaryBtn size="sm" onClick={fetchAll}>Retry</PrimaryBtn></div>
          </div>
        </Card>
      ) : filtered.length === 0 ? (
        <Card>
          <div className="flex flex-col items-center justify-center py-16 text-center">
            {tab === "Unread" ? (
              <>
                <CheckCircle2 size={56} style={{ color: COLORS.green }} />
                <h3 className="mt-4 text-[20px] font-bold" style={{ color: COLORS.ink }}>No unread notifications</h3>
                <p className="mt-1 text-sm" style={{ color: "rgba(26,16,8,0.60)" }}>All notifications have been read.</p>
              </>
            ) : (
              <>
                <BellOff size={56} style={{ color: "#D4C9A8" }} />
                <h3 className="mt-4 text-[20px] font-bold" style={{ color: COLORS.ink }}>All caught up!</h3>
                <p className="mt-1 text-sm" style={{ color: "rgba(26,16,8,0.60)" }}>You have no new notifications.</p>
              </>
            )}
          </div>
        </Card>
      ) : (
        <Card className="!p-0 overflow-hidden">
          {visible.map((n, i) => {
            const cat = categoryFor(n.type);
            const Icon = ICON_FOR[cat];
            const badge = TYPE_BADGE[cat];
            const isLast = i === visible.length - 1;
            const checked = selected.has(n.id);
            return (
              <div key={n.id}
                className="flex items-stretch hover:bg-[#FAF7F0] transition-colors group"
                style={{ borderBottom: isLast ? "none" : `1px solid ${COLORS.divider}` }}>
                {/* Severity bar */}
                <div className="w-1 flex-shrink-0" style={{ background: sevColor(n.severity) }} />

                <div className="flex items-start gap-3 px-4 py-4 flex-1 min-w-0">
                  {/* Checkbox */}
                  <input type="checkbox" checked={checked} onChange={(e) => {
                    e.stopPropagation();
                    setSelected(prev => {
                      const next = new Set(prev);
                      if (next.has(n.id)) next.delete(n.id); else next.add(n.id);
                      return next;
                    });
                  }} className="mt-1.5" />

                  {/* Icon circle */}
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: badge.bg }}>
                    <Icon size={15} style={{ color: badge.color }} />
                  </div>

                  {/* Body (clickable) */}
                  <button onClick={() => handleClick(n)} className="flex-1 min-w-0 text-left">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider"
                        style={{ background: badge.bg, color: badge.color }}>
                        {cat}
                      </span>
                      {!n.is_read && <span className="w-2 h-2 rounded-full" style={{ background: COLORS.red }} />}
                    </div>
                    <div className={`text-[15px] ${n.is_read ? "font-normal" : "font-semibold"}`} style={{ color: COLORS.ink }}>
                      {n.title}
                    </div>
                    <div className="text-[14px] mt-0.5 line-clamp-2" style={{ color: "rgba(26,16,8,0.65)" }}>
                      {n.message}
                    </div>
                    <div className="text-[13px] mt-2 flex items-center gap-1.5">
                      {n.businesses && (
                        <>
                          <span className="font-medium" style={{ color: COLORS.red }}>{n.businesses.business_name}</span>
                          <span style={{ color: "rgba(26,16,8,0.45)" }}>·</span>
                        </>
                      )}
                      <span style={{ color: "rgba(26,16,8,0.45)" }}>{timeAgo(n.created_at)}</span>
                    </div>
                  </button>

                  {/* Right actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleClick(n)} className="text-[13px] font-medium px-2 py-1 rounded hover:bg-white" style={{ color: COLORS.red }}>
                      View →
                    </button>
                    <button onClick={() => markRead(n.id, !n.is_read)} className="p-1.5 rounded hover:bg-white" aria-label="Toggle read">
                      {n.is_read ? <EyeOff size={14} style={{ color: "rgba(26,16,8,0.55)" }} /> : <Eye size={14} style={{ color: "rgba(26,16,8,0.55)" }} />}
                    </button>
                    <button onClick={() => deleteOne(n.id)} className="p-1.5 rounded hover:bg-white" aria-label="Delete">
                      <Trash2 size={14} style={{ color: COLORS.red }} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Pagination */}
          <div className="px-4 py-4 flex items-center justify-between flex-wrap gap-2" style={{ borderTop: `1px solid ${COLORS.divider}`, background: COLORS.caSurface }}>
            <div className="text-[12px]" style={{ color: "rgba(26,16,8,0.55)" }}>
              Showing 1–{visible.length} of {filtered.length} notifications
            </div>
            {visibleCount < filtered.length && (
              <SecondaryBtn size="sm" onClick={() => setVisibleCount(c => c + PAGE_SIZE)}>Load 20 more</SecondaryBtn>
            )}
          </div>
        </Card>
      )}

      {prefsOpen && <PreferencesModal onClose={() => setPrefsOpen(false)} />}
    </PageWrap>
  );
}

// ─── Preferences modal ──────────────────────────────────────────────────────
function PreferencesModal({ onClose }: { onClose: () => void }) {
  const { caFirm, refreshFirm } = useCAAuth();
  const [prefs, setPrefs] = useState<any>(DEFAULT_PREFS);
  const [saving, setSaving] = useState(false);
  const [loadingPrefs, setLoadingPrefs] = useState(true);

  useEffect(() => {
    if (!caFirm) return;
    (async () => {
      const { data } = await supabase.from("ca_firms").select("notification_prefs").eq("id", caFirm.id).maybeSingle();
      const stored = (data?.notification_prefs as any) || {};
      setPrefs({ ...DEFAULT_PREFS, ...stored });
      setLoadingPrefs(false);
    })();
  }, [caFirm]);

  const set = (k: string, v: any) => setPrefs((p: any) => ({ ...p, [k]: v }));

  const Toggle = ({ k, label, disabled }: { k: string; label: string; disabled?: boolean }) => (
    <label className="flex items-center justify-between py-2 cursor-pointer" style={{ opacity: disabled ? 0.5 : 1 }}>
      <span className="text-[14px]" style={{ color: COLORS.ink }}>{label}</span>
      <button type="button" disabled={disabled}
        onClick={() => !disabled && set(k, !prefs[k])}
        className="w-10 h-5 rounded-full transition-colors relative"
        style={{ background: prefs[k] ? COLORS.red : "#D4C9A8" }}>
        <span className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all"
          style={{ left: prefs[k] ? "calc(100% - 18px)" : "2px" }} />
      </button>
    </label>
  );

  const save = async () => {
    if (!caFirm) return;
    setSaving(true);
    const { error } = await supabase.from("ca_firms").update({ notification_prefs: prefs }).eq("id", caFirm.id);
    setSaving(false);
    if (error) { toast.error("Failed to save preferences"); return; }
    toast.success("Preferences saved");
    await refreshFirm();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)" }} onClick={onClose}>
      <div className="bg-white rounded-xl max-w-[600px] w-full max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 flex items-start justify-between" style={{ borderBottom: `1px solid ${COLORS.divider}` }}>
          <div>
            <h3 className="text-[22px] font-bold" style={{ color: COLORS.ink }}>Notification Preferences</h3>
            <div className="text-[14px]" style={{ color: "rgba(26,16,8,0.65)" }}>Choose which notifications you want to receive</div>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-[#F0EBD8]"><X size={18} /></button>
        </div>

        <div className="p-6 overflow-y-auto">
          {loadingPrefs ? (
            <div className="flex items-center gap-2 text-sm" style={{ color: "rgba(26,16,8,0.60)" }}>
              <Loader2 size={14} className="animate-spin" /> Loading…
            </div>
          ) : (
            <div className="space-y-5">
              <Section title="Channels">
                <Toggle k="_inapp_always_on" label="In-app (always on)" disabled />
                <Toggle k="email" label="Email" />
                <Toggle k="whatsapp" label="WhatsApp" disabled={!caFirm?.email /* placeholder gating */} />
              </Section>

              <Section title="Critical Alerts">
                <Toggle k="filing_due_1d" label="Filing due tomorrow" />
                <Toggle k="filing_overdue" label="Filing overdue" />
                <Toggle k="itc_risk_high" label="High ITC risk" />
                <Toggle k="notice_risk_high" label="Notice risk > 70/100" />
              </Section>

              <Section title="Warnings">
                <Toggle k="filing_due_3d" label="Filing due in 3 days" />
                <Toggle k="itc_mismatch" label="ITC mismatch detected" />
                <Toggle k="cash_low" label="Low client cash (< ₹50K)" />
              </Section>

              <Section title="Info">
                <Toggle k="access_request_new" label="New client access request" />
                <Toggle k="client_activity" label="Client activity updates" />
                <Toggle k="system_update" label="System updates" />
                <Toggle k="weekly_digest" label="Weekly digest email" />
              </Section>

              <Section title="Quiet Hours">
                <p className="text-[12px] mb-2" style={{ color: "rgba(26,16,8,0.55)" }}>Don't send notifications between:</p>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <label className="text-[11px] uppercase tracking-wider" style={{ color: "rgba(26,16,8,0.55)" }}>Start</label>
                    <input type="time" value={prefs.quiet_start} onChange={(e) => set("quiet_start", e.target.value)}
                      className="mt-1 w-full h-9 px-2 rounded-md text-sm bg-white" style={{ border: `1px solid ${COLORS.caBorder}` }} />
                  </div>
                  <div className="flex-1">
                    <label className="text-[11px] uppercase tracking-wider" style={{ color: "rgba(26,16,8,0.55)" }}>End</label>
                    <input type="time" value={prefs.quiet_end} onChange={(e) => set("quiet_end", e.target.value)}
                      className="mt-1 w-full h-9 px-2 rounded-md text-sm bg-white" style={{ border: `1px solid ${COLORS.caBorder}` }} />
                  </div>
                </div>
              </Section>
            </div>
          )}
        </div>

        <div className="p-6 flex items-center justify-end gap-2" style={{ borderTop: `1px solid ${COLORS.divider}` }}>
          <SecondaryBtn onClick={onClose}>Cancel</SecondaryBtn>
          <PrimaryBtn onClick={save} disabled={saving || loadingPrefs}>{saving ? "Saving…" : "Save Preferences"}</PrimaryBtn>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="text-[12px] font-semibold uppercase tracking-wider mb-1" style={{ color: COLORS.gold }}>{title}</h4>
      <div>{children}</div>
    </div>
  );
}
