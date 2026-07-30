import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { supabaseExternal } from "@/integrations/supabase/external";
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
    const { data, error } = await supabase
      .from("ca_clients")
      .select("id, business_id, client_name, client_email, gstin, client_status, onboarded_at, last_activity_at")
      .eq("ca_firm_id", firmId)
      .eq("is_demo", false)
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setRows((data as ClientRow[]) ?? []);
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
    setBusy(true);
    const chosen = rows.filter((r) => selectedIds.includes(r.id));
    const enriched = await Promise.all(
      chosen.map(async (c) => {
        let health = "", cash = "";
        if (c.business_id) {
          try {
            const { data } = await supabaseExternal
              .from("liquidity_metrics")
              .select("cash_position, health_status")
              .eq("business_id", c.business_id)
              .order("recorded_at", { ascending: false })
              .limit(1)
              .maybeSingle();
            health = data?.health_status ?? "";
            cash = data?.cash_position != null ? String(data.cash_position) : "";
          } catch { /* empty state */ }
        }
        return [c.client_name, c.client_email ?? "", c.gstin ?? "", c.client_status ?? "", health, cash];
      }),
    );
    const header = ["Client name", "Email", "GSTIN", "Status", "Health status", "Cash position"];
    const csv = [header, ...enriched]
      .map((r) => r.map((v) => (/[",\n]/.test(String(v)) ? `"${String(v).replace(/"/g, '""')}"` : String(v))).join(","))
      .join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `ca-clients-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setBusy(false);
    toast.success("CSV exported");
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
