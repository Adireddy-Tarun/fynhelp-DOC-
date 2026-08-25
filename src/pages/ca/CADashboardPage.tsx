import { useEffect, useState } from "react";
import { useNavigate } from "@/lib/router-compat";
import { supabase } from "@/integrations/supabase/client";
import { proxyExternalQuery } from "@/integrations/supabase/external";
import { useCAPortal } from "@/hooks/useCAPortal";
import {
  CA, CACard, CAHeading, CABadge, healthTone, inr, dateIN, CAEmpty, caTh,
} from "@/components/ca/portalUi";
import { CATasksSummaryCard } from "@/components/ca/CATasksSummaryCard";

interface ClientRow {
  id: string;
  business_id: string | null;
  client_name: string;
  client_status: string | null;
}

interface Enriched extends ClientRow {
  cash_position: number | null;
  health_status: string | null;
  runway_months: number | null;
  burn_rate_current: number | null;
  next_gst_due: string | null;
  next_gst_type: string | null;
}

interface DueReminder {
  id: string;
  title: string;
  business_id: string | null;
  remind_at: string;
}

interface Notification {
  id: string;
  title: string | null;
  message: string | null;
  severity: string | null;
  is_read: boolean | null;
  created_at: string | null;
}

const sevTone = (s?: string | null) =>
  s === "critical" ? "red" : s === "warning" ? "amber" : s === "success" ? "green" : "teal";

export default function CADashboardPage() {
  const { firmId } = useCAPortal();
  const navigate = useNavigate();
  const [clients, setClients] = useState<Enriched[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [dueToday, setDueToday] = useState<DueReminder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firmId) return;
    let cancelled = false;

    (async () => {
      setLoading(true);
      const { data: rows, error } = await supabase
        .from("ca_clients")
        .select("id, business_id, client_name, client_status")
        .eq("ca_firm_id", firmId)
        .eq("is_demo", false)
        .order("created_at", { ascending: false });
      if (error) console.warn("[fyn:ca] ca_clients", error);

      const base = (rows as ClientRow[]) ?? [];
      const enriched: Enriched[] = await Promise.all(
        base.map(async (c) => {
          let metrics: any = null;
          let gst: any = null;
          if (c.business_id) {
            const liq = await proxyExternalQuery({
              table: "liquidity_metrics",
              business_id: c.business_id,
              select: "cash_position, health_status, runway_months, burn_rate_current",
              order: { column: "recorded_at", ascending: false },
              limit: 1,
            });
            if (liq.error) console.warn("[fyn:ca] liquidity_metrics", c.business_id, liq.error);
            metrics = liq.data?.[0] ?? null;

            const gstRes = await proxyExternalQuery({
              table: "gst_filings",
              business_id: c.business_id,
              select: "due_date, return_type, status",
              order: { column: "due_date", ascending: true },
              limit: 50,
            });
            if (gstRes.error) console.warn("[fyn:ca] gst_filings", c.business_id, gstRes.error);
            gst = (gstRes.data ?? []).find((g: any) => g.status !== "filed") ?? null;
          }

          return {
            ...c,
            cash_position: metrics?.cash_position ?? null,
            health_status: metrics?.health_status ?? null,
            runway_months: metrics?.runway_months ?? null,
            burn_rate_current: metrics?.burn_rate_current ?? null,
            next_gst_due: gst?.due_date ?? null,
            next_gst_type: gst?.return_type ?? null,
          };
        }),
      );

      const { data: notes } = await supabase
        .from("ca_notifications")
        .select("id, title, message, severity, is_read, created_at")
        .eq("ca_firm_id", firmId)
        .eq("is_demo", false)
        .order("created_at", { ascending: false })
        .limit(10);

      const startOfDay = new Date(); startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(); endOfDay.setHours(23, 59, 59, 999);
      const { data: reminders } = await supabase
        .from("ca_reminders")
        .select("id, title, business_id, remind_at")
        .eq("ca_firm_id", firmId)
        .eq("is_done", false)
        .gte("remind_at", startOfDay.toISOString())
        .lte("remind_at", endOfDay.toISOString())
        .order("remind_at", { ascending: true });

      if (cancelled) return;
      setClients(enriched);
      setNotifications((notes as Notification[]) ?? []);
      setDueToday((reminders as DueReminder[]) ?? []);
      setLoading(false);

      console.log("[fyn:ca] portfolio mount", {
        firmId,
        clientCount: enriched.length,
        clients: enriched.map((c) => ({
          name: c.client_name, business_id: c.business_id, health_status: c.health_status,
        })),
      });
    })();

    return () => { cancelled = true; };
  }, [firmId]);

  const total = clients.length;
  const active = clients.filter((c) => (c.client_status ?? "").toLowerCase() === "active").length;
  const pending = clients.filter((c) => (c.client_status ?? "").toLowerCase() === "pending").length;
  const portfolioCash = clients.reduce((s, c) => s + (c.cash_position ?? 0), 0);

  const markRead = async (id: string) => {
    setNotifications((n) => n.map((x) => (x.id === id ? { ...x, is_read: true } : x)));
    await supabase.from("ca_notifications").update({ is_read: true }).eq("id", id);
  };

  const summary = [
    { label: "Total clients", value: String(total) },
    { label: "Active", value: String(active) },
    { label: "Pending", value: String(pending) },
    { label: "Portfolio cash", value: inr(portfolioCash) },
  ];

  return (
    <div>
      <CAHeading>Portfolio</CAHeading>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginTop: 18 }}>
        {summary.map((s) => (
          <CACard key={s.label} style={{ padding: "16px 18px" }}>
            <div style={{ fontFamily: CA.sans, fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: CA.faint }}>
              {s.label}
            </div>
            <div style={{ fontFamily: CA.mono, fontSize: 22, fontWeight: 600, color: CA.ink, marginTop: 6, fontVariantNumeric: "tabular-nums" }}>
              {s.value}
            </div>
          </CACard>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 320px", gap: 20, marginTop: 22, alignItems: "start" }}>
        <div>
          <div style={{ ...caTh, padding: "0 0 10px", border: "none" }}>Clients</div>
          {loading ? (
            <CACard><CAEmpty title="Loading portfolio…" /></CACard>
          ) : clients.length === 0 ? (
            <CACard><CAEmpty title="No clients yet" hint="Add your first client to start tracking their financial health." /></CACard>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14 }}>
              {clients.map((c) => (
                <CACard
                  key={c.id}
                  style={{ padding: 18, cursor: "pointer" }}
                  className="hover:shadow-xs transition-shadow"
                >
                  <div onClick={() => navigate(`/ca/clients/${c.id}`)}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: 8 }}>
                      <div style={{ fontFamily: CA.serif, fontSize: 15.5, fontWeight: 700, color: CA.ink }}>{c.client_name}</div>
                      <CABadge tone={healthTone(c.health_status)}>{c.health_status ?? "no data"}</CABadge>
                    </div>
                    <div style={{ fontFamily: CA.mono, fontSize: 19, fontWeight: 600, color: CA.ink, marginTop: 12, fontVariantNumeric: "tabular-nums" }}>
                      {c.cash_position === null ? "—" : inr(c.cash_position)}
                    </div>
                    <div style={{ fontFamily: CA.sans, fontSize: 11.5, color: CA.faint }}>Cash position</div>
                    <div style={{ marginTop: 12, fontFamily: CA.sans, fontSize: 12.5, color: CA.muted }}>
                      Next GST due: {c.next_gst_due ? `${dateIN(c.next_gst_due)}${c.next_gst_type ? ` · ${c.next_gst_type}` : ""}` : "—"}
                    </div>
                  </div>
                </CACard>
              ))}
            </div>
          )}
        </div>

        <CACard style={{ overflow: "hidden" }}>
          <div style={{ padding: "14px 18px", borderBottom: `0.5px solid ${CA.line}`, fontFamily: CA.serif, fontSize: 15, fontWeight: 700 }}>
            Notifications
          </div>
          {notifications.length === 0 ? (
            <CAEmpty title="Nothing new" />
          ) : (
            notifications.map((n) => (
              <button
                key={n.id}
                onClick={() => markRead(n.id)}
                style={{
                  display: "block", width: "100%", textAlign: "left", padding: "12px 18px",
                  borderBottom: `0.5px solid ${CA.line}`, background: n.is_read ? "transparent" : CA.tealSoft,
                  border: "none", borderBottomWidth: "0.5px", borderBottomStyle: "solid", cursor: "pointer",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center" }}>
                  <span style={{ fontFamily: CA.sans, fontSize: 13, fontWeight: 600, color: CA.ink }}>{n.title ?? "Notification"}</span>
                  <CABadge tone={sevTone(n.severity) as any}>{n.severity ?? "info"}</CABadge>
                </div>
                <div style={{ fontFamily: CA.sans, fontSize: 12.5, color: CA.muted, marginTop: 4 }}>{n.message}</div>
                <div style={{ fontFamily: CA.sans, fontSize: 11, color: CA.faint, marginTop: 4 }}>{dateIN(n.created_at)}</div>
              </button>
            ))
          )}
        </CACard>
      </div>

      <CATasksSummaryCard />
    </div>
  );
}
