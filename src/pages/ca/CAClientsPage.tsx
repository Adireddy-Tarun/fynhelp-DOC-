import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "@/lib/router-compat";
import { supabase } from "@/integrations/supabase/client";
import { proxyExternalQuery } from "@/integrations/supabase/external";
import { useCAPortal } from "@/hooks/useCAPortal";
import { toast } from "sonner";
import {
  CA, CACard, CAHeading, CABadge, CAButton, statusTone, dateIN, caTh, caTd, caInputStyle, CAEmpty,
} from "@/components/ca/portalUi";

interface ClientRow {
  id: string;
  business_id: string | null;
  client_name: string;
  client_email: string | null;
  gstin: string | null;
  pan: string | null;
  entity_type: string | null;
  client_phone: string | null;
  client_status: string | null;
  onboarded_at: string | null;
  last_activity_at: string | null;
}

const PAGE_SIZE = 20;

export default function CAClientsPage() {
  const { firmId } = useCAPortal();
  const navigate = useNavigate();
  const [rows, setRows] = useState<ClientRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!firmId) return;
    setLoading(true);
    const [{ data, error }, { data: reminders }] = await Promise.all([
      supabase
        .from("ca_clients")
        .select("id, business_id, client_name, client_email, gstin, pan, entity_type, client_phone, client_status, onboarded_at, last_activity_at")
        .eq("ca_firm_id", firmId)
        .eq("is_demo", false)
        .order("created_at", { ascending: false }),
      supabase
        .from("ca_reminders")
        .select("business_id")
        .eq("ca_firm_id", firmId)
        .eq("is_done", false)
        .lt("remind_at", new Date().toISOString()),
    ]);
    if (error) toast.error(error.message);
    setRows((data as ClientRow[]) ?? []);
    const counts: Record<string, number> = {};
    for (const r of (reminders ?? []) as { business_id: string | null }[]) {
      if (r.business_id) counts[r.business_id] = (counts[r.business_id] ?? 0) + 1;
    }
    setDueReminders(counts);
    setLoading(false);
  }, [firmId]);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      const matchQ = !q || r.client_name.toLowerCase().includes(q) || (r.client_email ?? "").toLowerCase().includes(q);
      const matchS = status === "all" || (r.client_status ?? "").toLowerCase() === status;
      return matchQ && matchS;
    });
  }, [rows, search, status]);

  const pageRows = filtered.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const selectedIds = Object.keys(selected).filter((k) => selected[k]);

  const sendReminder = async () => {
    if (!firmId) return;
    setBusy(true);
    const chosen = rows.filter((r) => selectedIds.includes(r.id));
    const payload = chosen.map((c) => ({
      ca_firm_id: firmId,
      business_id: c.business_id,
      type: "reminder",
      title: "Action required",
      message: "Your CA firm has requested your attention",
      severity: "warning",
      is_read: false,
      is_demo: false,
    }));
    const { error } = await supabase.from("ca_notifications").insert(payload);
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success(`Reminder sent for ${payload.length} client${payload.length === 1 ? "" : "s"}`);
    setSelected({});
  };

  const markReviewed = async () => {
    setBusy(true);
    const { error } = await supabase
      .from("ca_clients")
      .update({ last_activity_at: new Date().toISOString() })
      .in("id", selectedIds);
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success(`Marked ${selectedIds.length} client(s) reviewed`);
    setSelected({});
    load();
  };

  const exportCsv = async () => {
    if (selectedIds.length === 0) {
      toast.warning("Select at least one client to export");
      return;
    }
    setBusy(true);
    const chosen = rows.filter((r) => selectedIds.includes(r.id));
    const loadingId = toast.loading(`Preparing export for ${chosen.length} client${chosen.length === 1 ? "" : "s"}...`);
    const fmtDate = (v: string | null | undefined) => {
      if (!v) return "";
      const d = new Date(v);
      if (Number.isNaN(d.getTime())) return "";
      return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
    };
    const num = (v: unknown) => (v === null || v === undefined || v === "" ? "" : String(Number(v)));

    try {
      const enriched = await Promise.all(
        chosen.map(async (c) => {
          let health = "", cash = "", runway = "", burn = "", gstDue = "", gstType = "";
          let itcTotal = "", itcMatched = "", itcMismatched = "", tdsTotal = "", overdue = "", eventsTotal = "";

          if (c.business_id) {
            const bid = c.business_id;
            const [liq, gst, itc, events, tds] = await Promise.all([
              proxyExternalQuery({
                table: "liquidity_metrics",
                business_id: bid,
                select: "cash_position, health_status, runway_months, burn_rate_current",
                order: { column: "recorded_at", ascending: false },
                limit: 1,
              }),
              proxyExternalQuery({
                table: "gst_filings",
                business_id: bid,
                select: "due_date, return_type, status",
                order: { column: "due_date", ascending: true },
                limit: 50,
              }),
              supabase
                .from("ca_itc_records")
                .select("total_itc, match_status")
                .eq("business_id", bid)
                .then((r) => r, () => ({ data: null })),
              supabase
                .from("ca_compliance_events")
                .select("due_date, status")
                .eq("business_id", bid)
                .then((r) => r, () => ({ data: null })),
              supabase
                .from("ca_tds_records")
                .select("tds_amount")
                .eq("business_id", bid)
                .then((r) => r, () => ({ data: null })),
            ]);

            const l = (liq.data?.[0] ?? null) as Record<string, unknown> | null;
            if (l) {
              health = (l.health_status as string) ?? "";
              cash = num(l.cash_position);
              runway = num(l.runway_months);
              burn = num(l.burn_rate_current);
            }
            const g = ((gst.data ?? []).find((r: any) => r.status !== "filed") ?? null) as Record<string, unknown> | null;
            if (g) {
              gstDue = fmtDate(g.due_date as string);
              gstType = (g.return_type as string) ?? "";
            }

            const itcRows = (itc as { data: { total_itc: number | null; match_status: string | null }[] | null }).data;
            if (itcRows) {
              itcTotal = String(itcRows.reduce((s, r) => s + Number(r.total_itc ?? 0), 0));
              itcMatched = String(itcRows.filter((r) => r.match_status === "matched").length);
              itcMismatched = String(itcRows.filter((r) => r.match_status && r.match_status !== "matched").length);
            }
            const evRows = (events as { data: { due_date: string | null; status: string | null }[] | null }).data;
            if (evRows) {
              const now = Date.now();
              eventsTotal = String(evRows.length);
              overdue = String(
                evRows.filter((r) => r.status !== "filed" && r.due_date && new Date(r.due_date).getTime() < now).length,
              );
            }
            const tdsRows = (tds as { data: { tds_amount: number | null }[] | null }).data;
            if (tdsRows) tdsTotal = String(tdsRows.reduce((s, r) => s + Number(r.tds_amount ?? 0), 0));
          }

          return [
            c.client_name ?? "",
            c.client_email ?? "",
            c.gstin ?? "",
            (c as ClientRow).pan ?? "",
            (c as ClientRow).client_phone ?? "",
            c.client_status ?? "",
            fmtDate(c.onboarded_at),
            health,
            cash,
            runway,
            burn,
            gstDue,
            gstType,
            itcTotal,
            itcMatched,
            itcMismatched,
            tdsTotal,
            overdue,
            eventsTotal,
            fmtDate(c.last_activity_at),
          ];
        }),
      );

      const header = [
        "Client Name", "Email", "GSTIN", "PAN", "Phone", "Status", "Onboarded Date", "Health Status",
        "Cash Position (INR)", "Runway (months)", "Burn Rate (INR/month)", "Next GST Due", "Next GST Return Type",
        "Total ITC Claimed (INR)", "ITC Matched", "ITC Mismatched", "Total TDS Deducted (INR)",
        "Overdue Compliance Events", "Total Compliance Events", "Last Activity",
      ];
      const csv = [header, ...enriched]
        .map((r) => r.map((v) => (/[",\n]/.test(String(v)) ? `"${String(v).replace(/"/g, '""')}"` : String(v))).join(","))
        .join("\n");

      const today = new Date();
      const stamp = `${String(today.getDate()).padStart(2, "0")}-${String(today.getMonth() + 1).padStart(2, "0")}-${today.getFullYear()}`;
      const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = `FynHelp_Clients_Export_${stamp}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.dismiss(loadingId);
      toast.success(`Export ready. ${chosen.length} client${chosen.length === 1 ? "" : "s"} exported.`);
    } catch {
      toast.dismiss(loadingId);
      toast.error("Export failed. Please try again.");
    } finally {
      setBusy(false);
    }
  };


  return (
    <div>
      <CAHeading>Clients</CAHeading>

      <div style={{ display: "flex", gap: 12, marginTop: 18, alignItems: "center" }}>
        <input
          style={{ ...caInputStyle, maxWidth: 300 }}
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          placeholder="Search by name or email"
        />
        <select
          style={{ ...caInputStyle, maxWidth: 180 } as any}
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(0); }}
        >
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="inactive">Inactive</option>
        </select>
        <span style={{ fontFamily: CA.sans, fontSize: 12.5, color: CA.muted }}>{filtered.length} client(s)</span>
      </div>

      {selectedIds.length > 0 && (
        <CACard style={{ marginTop: 14, padding: "12px 16px", display: "flex", gap: 10, alignItems: "center" }}>
          <span style={{ fontFamily: CA.sans, fontSize: 13, fontWeight: 600 }}>{selectedIds.length} selected</span>
          <CAButton onClick={sendReminder} disabled={busy} style={{ padding: "7px 13px", fontSize: 12.5 }}>Send reminder</CAButton>
          <CAButton variant="ghost" onClick={markReviewed} disabled={busy} style={{ padding: "7px 13px", fontSize: 12.5 }}>Mark reviewed</CAButton>
          <CAButton variant="ghost" onClick={exportCsv} disabled={busy} style={{ padding: "7px 13px", fontSize: 12.5 }}>Export CSV</CAButton>
        </CACard>
      )}

      <CACard style={{ marginTop: 16, overflow: "hidden" }}>
        {loading ? (
          <CAEmpty title="Loading clients…" />
        ) : pageRows.length === 0 ? (
          <CAEmpty title="No clients found" hint="Adjust your search or add a new client." />
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ ...caTh, width: 40 }} />
                <th style={caTh}>Client</th>
                <th style={caTh}>Entity type</th>
                <th style={caTh}>Email</th>
                <th style={caTh}>GSTIN</th>
                <th style={caTh}>Status</th>
                <th style={caTh}>Onboarded</th>
                <th style={caTh}>Last activity</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map((r) => (
                <tr key={r.id} className="hover:bg-black/[0.015]">
                  <td style={caTd}>
                    <input
                      type="checkbox"
                      checked={!!selected[r.id]}
                      onChange={(e) => setSelected((s) => ({ ...s, [r.id]: e.target.checked }))}
                    />
                  </td>
                  <td style={{ ...caTd, cursor: "pointer", fontWeight: 600 }} onClick={() => navigate(`/ca/clients/${r.id}`)}>{r.client_name}</td>
                  <td style={caTd}><CABadge tone="grey">{r.entity_type ?? "—"}</CABadge></td>
                  <td style={{ ...caTd, cursor: "pointer" }} onClick={() => navigate(`/ca/clients/${r.id}`)}>{r.client_email ?? "—"}</td>
                  <td style={{ ...caTd, fontFamily: CA.mono }}>{r.gstin ?? "—"}</td>
                  <td style={caTd}><CABadge tone={statusTone(r.client_status)}>{r.client_status ?? "—"}</CABadge></td>
                  <td style={caTd}>{dateIN(r.onboarded_at)}</td>
                  <td style={caTd}>{dateIN(r.last_activity_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </CACard>

      {pageCount > 1 && (
        <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 14 }}>
          <CAButton variant="ghost" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}>Previous</CAButton>
          <span style={{ fontFamily: CA.sans, fontSize: 12.5, color: CA.muted }}>Page {page + 1} of {pageCount}</span>
          <CAButton variant="ghost" onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))} disabled={page >= pageCount - 1}>Next</CAButton>
        </div>
      )}
    </div>
  );
}
