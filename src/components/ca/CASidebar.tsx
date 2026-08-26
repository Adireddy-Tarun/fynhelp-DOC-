import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "@/lib/router-compat";
import {
  LayoutGrid, Users, UserPlus, Bell, Settings, LogOut, Inbox, ClipboardList, CheckCheck,
  Archive, Scale, AlertTriangle, CalendarCheck, FileStack, ListTodo, BellRing, Briefcase, ShieldCheck,
  BarChart3, Receipt, FileText, UserCog, MonitorSmartphone, Plug, BookOpen, Gauge, Boxes, Network,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCAPortal } from "@/hooks/useCAPortal";
import { CA } from "./portalUi";

const GROUPS: { group: string; links: { label: string; path: string; icon: typeof LayoutGrid }[] }[] = [
  {
    group: "Practice",
    links: [
      { label: "Portfolio", path: "/ca/dashboard", icon: LayoutGrid },
      { label: "Clients", path: "/ca/clients", icon: Users },
      { label: "Add Client", path: "/ca/clients/add", icon: UserPlus },
      { label: "Entity groups", path: "/ca/groups", icon: Network },
      { label: "Engagements", path: "/ca/engagements", icon: Briefcase },

      { label: "Billing", path: "/ca/billing", icon: Receipt },
    ],
  },
  {
    group: "Collect",
    links: [
      { label: "Intake inbox", path: "/ca/intake/inbox", icon: Inbox },
      { label: "Requests", path: "/ca/intake/requests", icon: ClipboardList },
      { label: "Review queue", path: "/ca/intake/review", icon: CheckCheck },
      { label: "Evidence vault", path: "/ca/vault", icon: Archive },
    ],
  },
  {
    group: "Data",
    links: [
      { label: "Integrations", path: "/ca/integrations", icon: Plug },
      { label: "Ledgers & CoA", path: "/ca/ledgers", icon: BookOpen },
      { label: "Data quality", path: "/ca/data-quality", icon: Gauge },
      { label: "Master data", path: "/ca/masters", icon: Boxes },
    ],
  },
  {
    group: "Process",
    links: [
      { label: "Reconciliation", path: "/ca/reconciliation", icon: Scale },
      { label: "Exceptions", path: "/ca/exceptions", icon: AlertTriangle },
      { label: "Month-end close", path: "/ca/close", icon: CalendarCheck },
      { label: "Working papers", path: "/ca/working-papers", icon: FileStack },
    ],
  },
  {
    group: "Compliance",
    links: [
      { label: "Compliance", path: "/ca/compliance", icon: ShieldCheck },
      { label: "GST portfolio", path: "/ca/gst-portfolio", icon: Receipt },
      { label: "ITC recon", path: "/ca/itc-recon", icon: Scale },
      { label: "TDS tracker", path: "/ca/tds-tracker", icon: FileText },
      { label: "Filing calendar", path: "/ca/filing-calendar", icon: CalendarCheck },
    ],
  },
  {
    group: "Deliver",
    links: [
      { label: "Reports", path: "/ca/reports", icon: FileText },
      { label: "Tasks", path: "/ca/tasks", icon: ListTodo },
      { label: "Chaser queue", path: "/ca/chaser", icon: BellRing },
      { label: "Client portal", path: "/ca/client-portal", icon: MonitorSmartphone },
      { label: "Practice analytics", path: "/ca/practice-analytics", icon: BarChart3 },
    ],
  },
  {
    group: "Firm",
    links: [
      { label: "Users & Roles", path: "/ca/users", icon: UserCog },
      { label: "Audit trail", path: "/ca/audit-trail", icon: ShieldCheck },
      { label: "Alert Monitor", path: "/ca/notifications", icon: Bell },
      { label: "Settings", path: "/ca/settings", icon: Settings },
      { label: "Communications", path: "/ca/settings/communications", icon: BellRing },
    ],
  },
];


export default function CASidebar({
  open = false,
  onNavigate,
  drawer = false,
}: {
  /** Drawer visibility on compact screens. */
  open?: boolean;
  /** Called after a nav link is tapped, so the drawer can close. */
  onNavigate?: () => void;
  /** Render as an off-canvas drawer instead of a fixed desktop rail. */
  drawer?: boolean;
}) {
  const { firmId, firmName, caName } = useCAPortal();
  const navigate = useNavigate();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!firmId) return;
    let cancelled = false;
    (async () => {
      const { count } = await supabase
        .from("ca_notifications")
        .select("id", { count: "exact", head: true })
        .eq("ca_firm_id", firmId)
        .eq("is_read", false);
      if (!cancelled) setUnread(count ?? 0);
    })();
    return () => { cancelled = true; };
  }, [firmId]);

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate("/ca/login", { replace: true });
  };

  return (
    <aside
      className="fixed inset-y-0 left-0 flex flex-col z-50"
      style={{
        width: 236,
        maxWidth: "84vw",
        background: "#FFFFFF",
        borderRight: `0.5px solid ${CA.line}`,
        transform: drawer && !open ? "translateX(-100%)" : "translateX(0)",
        transition: drawer ? "transform 200ms ease" : undefined,
        boxShadow: drawer && open ? "0 0 40px rgba(0,0,0,0.18)" : undefined,
      }}
    >
      <div style={{ padding: "22px 20px 16px" }}>
        <div style={{ fontFamily: CA.serif, fontSize: 20, fontWeight: 700, color: CA.ink }}>
          Fyn<span style={{ color: CA.teal }}>Help</span>
        </div>
        <div style={{ fontFamily: CA.sans, fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: CA.teal, marginTop: 3 }}>
          CA Portal
        </div>
        <div style={{ fontFamily: CA.sans, fontSize: 12.5, color: CA.muted, marginTop: 12 }}>
          {firmName ?? "—"}
        </div>
        {caName && <div style={{ fontFamily: CA.sans, fontSize: 11.5, color: CA.faint }}>{caName}</div>}
      </div>

      <nav style={{ padding: "6px 12px", flex: 1, overflowY: "auto" }}>
        {GROUPS.map(({ group, links }) => (
          <div key={group} style={{ marginBottom: 14 }}>
            <div
              style={{
                fontFamily: CA.sans,
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: CA.faint,
                padding: "6px 12px 4px",
              }}
            >
              {group}
            </div>
            {links.map(({ label, path, icon: Icon }) => (
              <NavLink
                key={path}
                to={path}
                className="ca-nav-link"
                end={path === "/ca/clients"}
                onClick={onNavigate}
                style={({ isActive }) => ({
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "8px 12px",
                  borderRadius: 9,
                  marginBottom: 1,
                  fontFamily: CA.sans,
                  fontSize: 13,
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? CA.teal : CA.ink,
                  background: isActive ? CA.tealSoft : "transparent",
                  textDecoration: "none",
                })}
              >
                <Icon size={15} />
                <span style={{ flex: 1 }}>{label}</span>
                {path === "/ca/notifications" && unread > 0 && (
                  <span
                    style={{
                      fontFamily: CA.mono, fontSize: 10.5, fontWeight: 700, color: "#fff",
                      background: CA.teal, borderRadius: 999, padding: "1px 7px",
                    }}
                  >
                    {unread}
                  </span>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>


      <button
        onClick={signOut}
        style={{
          display: "flex", alignItems: "center", gap: 10, margin: "0 12px 18px",
          padding: "9px 12px", borderRadius: 9, background: "transparent", border: "none",
          fontFamily: CA.sans, fontSize: 13, color: CA.muted, cursor: "pointer",
        }}
      >
        <LogOut size={15} /> Sign out
      </button>
    </aside>
  );
}
