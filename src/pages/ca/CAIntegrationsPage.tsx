import { useCallback, useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useNavigate } from "@/lib/router-compat";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useCAPortal } from "@/hooks/useCAPortal";
import { getFirmIntegrations, syncZohoBooks, syncRazorpay } from "@/lib/caSync.functions";
import { startGmailConnect, disconnectGmail } from "@/lib/caGmail.functions";
import {
  CA, CACard, CAHeading, CABadge, CAButton, dateIN, caTh, caTd, CAEmpty,
} from "@/components/ca/portalUi";

interface SyncJob {
  id: string;
  business_id: string;
  source_system: string;
  status: string;
  records_synced: number | null;
  completed_at: string | null;
  created_at: string;
  error_message: string | null;
}

interface CanonicalField {
  id: string;
  field_name: string;
  display_label: string;
  description: string | null;
  data_type: string;
  unit: string | null;
}

interface FieldMap {
  source_system: string;
  source_field: string;
  canonical_field_id: string | null;
}

interface GmailConnection {
  id: string;
  gmail_address: string;
  last_polled_at: string | null;
  is_active: boolean;
  error_message: string | null;
}

type SourceKey = "tally" | "zoho_books" | "razorpay" | "bank_csv";

const SOURCE_LABEL: Record<SourceKey, string> = {
  tally: "Tally (CSV import)",
  zoho_books: "Zoho Books",
  razorpay: "Razorpay",
  bank_csv: "Bank CSV",
};

export default function CAIntegrationsPage() {
  const { firmId } = useCAPortal();
  const navigate = useNavigate();
  const loadIntegrations = useServerFn(getFirmIntegrations);
  const runZoho = useServerFn(syncZohoBooks);
  const runRazorpay = useServerFn(syncRazorpay);

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<SourceKey | null>(null);
  const [zohoBusinesses, setZohoBusinesses] = useState<string[]>([]);
  const [razorpayBusinesses, setRazorpayBusinesses] = useState<string[]>([]);
  const [jobs, setJobs] = useState<SyncJob[]>([]);
  const [lastDocImport, setLastDocImport] = useState<string | null>(null);
  const [bankStats, setBankStats] = useState<{ count: number; last: string | null }>({ count: 0, last: null });
  const [fields, setFields] = useState<CanonicalField[]>([]);
  const [maps, setMaps] = useState<FieldMap[]>([]);
  const [gmailConnections, setGmailConnections] = useState<GmailConnection[]>([]);
  const [gmailConnecting, setGmailConnecting] = useState(false);
  const [gmailSetupNeeded, setGmailSetupNeeded] = useState(false);

  const beginGmailConnect = useServerFn(startGmailConnect);
  const endGmailConnection = useServerFn(disconnectGmail);

  const load = useCallback(async () => {
    if (!firmId) return;
    setLoading(true);
    try {
      const integrations = await loadIntegrations({ data: { firmId } }).catch(() => []);
      const active = integrations.filter((i) => (i.status ?? "active") === "active");
      setZohoBusinesses(active.filter((i) => i.provider === "zoho_books").map((i) => i.business_id));
      setRazorpayBusinesses(active.filter((i) => i.provider === "razorpay").map((i) => i.business_id));

      const [jobsRes, fieldsRes, mapsRes, docsRes, accessRes] = await Promise.all([
        supabase.from("ca_sync_jobs")
          .select("id, business_id, source_system, status, records_synced, completed_at, created_at, error_message")
          .eq("ca_firm_id", firmId).order("created_at", { ascending: false }).limit(200),
        supabase.from("ca_canonical_fields")
          .select("id, field_name, display_label, description, data_type, unit").order("field_name"),
        supabase.from("ca_source_field_map").select("source_system, source_field, canonical_field_id"),
        supabase.from("ca_document_extractions")
          .select("created_at").eq("ca_firm_id", firmId).order("created_at", { ascending: false }).limit(1),
        supabase.from("ca_client_access").select("business_id").eq("ca_firm_id", firmId).eq("is_active", true),
      ]);

      const { data: gmailData } = await supabase
        .from("ca_gmail_connections")
        .select("id, gmail_address, last_polled_at, is_active, error_message")
        .eq("ca_firm_id", firmId)
        .order("created_at", { ascending: false });
      setGmailConnections((gmailData as GmailConnection[]) ?? []);

      setJobs((jobsRes.data as SyncJob[]) ?? []);
      setFields((fieldsRes.data as CanonicalField[]) ?? []);
      setMaps((mapsRes.data as FieldMap[]) ?? []);
      setLastDocImport(docsRes.data?.[0]?.created_at ?? null);

      const ids = (accessRes.data ?? []).map((a) => a.business_id as string).filter(Boolean);
      if (ids.length) {
        const { count } = await supabase
          .from("bank_transactions")
          .select("id", { count: "exact", head: true })
          .in("business_id", ids);
        const { data: latest } = await supabase
          .from("bank_transactions")
          .select("created_at").in("business_id", ids)
          .order("created_at", { ascending: false }).limit(1);
        setBankStats({ count: count ?? 0, last: latest?.[0]?.created_at ?? null });
      } else {
        setBankStats({ count: 0, last: null });
      }
    } catch (e) {
      toast.error((e as Error).message ?? "Could not load integrations");
    } finally {
      setLoading(false);
    }
  }, [firmId, loadIntegrations]);

  useEffect(() => { load(); }, [load]);

  const jobsBySource = useMemo(() => {
    const out: Record<string, { last: SyncJob | null; records: number }> = {};
    for (const j of jobs) {
      const bucket = out[j.source_system] ?? { last: null, records: 0 };
      if (!bucket.last) bucket.last = j;
      if (j.status.startsWith("completed")) bucket.records += j.records_synced ?? 0;
      out[j.source_system] = bucket;
    }
    return out;
  }, [jobs]);

  const runAll = async (source: "zoho_books" | "razorpay") => {
    const targets = source === "zoho_books" ? zohoBusinesses : razorpayBusinesses;
    if (!firmId || targets.length === 0) return;
    setBusy(source);
    let total = 0;
    const failures: string[] = [];
    for (const businessId of targets) {
      try {
        const fn = source === "zoho_books" ? runZoho : runRazorpay;
        const res = await fn({ data: { businessId, firmId } });
        if (res.success) total += res.records_synced;
        else failures.push(res.errors[0] ?? "sync failed");
      } catch (e) {
        failures.push((e as Error).message);
      }
    }
    setBusy(null);
    if (failures.length) toast.warning(`${SOURCE_LABEL[source]}: ${total} record(s) synced, ${failures.length} client(s) failed — ${failures[0]}`);
    else toast.success(`${SOURCE_LABEL[source]}: ${total} new record(s) synced`);
    load();
  };

  const rows: {
    key: SourceKey;
    connected: boolean;
    detail: string;
    lastSynced: string | null;
    records: number | string;
    action: () => void;
    actionLabel: string;
    actionDisabled?: boolean;
  }[] = [
    {
      key: "tally",
      connected: !!lastDocImport,
      detail: lastDocImport ? "CSV / document imports" : "No imports yet",
      lastSynced: lastDocImport,
      records: jobsBySource["tally"]?.records ?? "—",
      action: () => navigate("/ca/intake/inbox"),
      actionLabel: lastDocImport ? "Import more" : "Set up import",
    },
    {
      key: "zoho_books",
      connected: zohoBusinesses.length > 0,
      detail: zohoBusinesses.length ? `${zohoBusinesses.length} client(s) connected` : "No client has connected Zoho Books",
      lastSynced: jobsBySource["zoho_books"]?.last?.completed_at ?? jobsBySource["zoho_books"]?.last?.created_at ?? null,
      records: jobsBySource["zoho_books"]?.records ?? 0,
      action: () => (zohoBusinesses.length ? runAll("zoho_books") : navigate("/ca/clients")),
      actionLabel: zohoBusinesses.length ? (busy === "zoho_books" ? "Syncing…" : "Sync now") : "Connect",
      actionDisabled: busy !== null,
    },
    {
      key: "razorpay",
      connected: razorpayBusinesses.length > 0,
      detail: razorpayBusinesses.length ? `${razorpayBusinesses.length} client(s) connected` : "No client has connected Razorpay",
      lastSynced: jobsBySource["razorpay"]?.last?.completed_at ?? jobsBySource["razorpay"]?.last?.created_at ?? null,
      records: jobsBySource["razorpay"]?.records ?? 0,
      action: () => (razorpayBusinesses.length ? runAll("razorpay") : navigate("/ca/clients")),
      actionLabel: razorpayBusinesses.length ? (busy === "razorpay" ? "Syncing…" : "Sync now") : "Connect",
      actionDisabled: busy !== null,
    },
    {
      key: "bank_csv",
      connected: bankStats.count > 0,
      detail: bankStats.count ? "Transactions in the ledger" : "No bank transactions yet",
      lastSynced: bankStats.last,
      records: bankStats.count,
      action: () => navigate("/ca/reconciliation"),
      actionLabel: bankStats.count ? "Reconcile" : "Upload statement",
    },
  ];

  const fieldById = useMemo(() => new Map(fields.map((f) => [f.id, f])), [fields]);
  const mapsByField = useMemo(() => {
    const out = new Map<string, FieldMap[]>();
    for (const m of maps) {
      if (!m.canonical_field_id) continue;
      out.set(m.canonical_field_id, [...(out.get(m.canonical_field_id) ?? []), m]);
    }
    return out;
  }, [maps]);

  return (
    <div>
      <CAHeading>Integrations</CAHeading>
      <p style={{ fontFamily: CA.sans, fontSize: 13.5, color: CA.muted, marginTop: 6 }}>
        Every data source feeding your clients' books, and when each last pulled.
      </p>
      <p style={{ fontFamily: CA.mono, fontSize: 11.5, color: CA.faint, marginTop: 4 }}>
        Syncs every 6 hours
      </p>


      <CACard style={{ marginTop: 20, overflow: "hidden" }}>
        {loading ? (
          <CAEmpty title="Loading integrations…" />
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr>
              <th style={caTh}>Source</th>
              <th style={caTh}>Status</th>
              <th style={caTh}>Last synced</th>
              <th style={{ ...caTh, textAlign: "right" }}>Records synced</th>
              <th style={{ ...caTh, textAlign: "right" }}>Actions</th>
            </tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.key}>
                  <td style={caTd}>
                    <div style={{ fontWeight: 600 }}>{SOURCE_LABEL[r.key]}</div>
                    <div style={{ fontSize: 12, color: CA.faint }}>{r.detail}</div>
                  </td>
                  <td style={caTd}>
                    <CABadge tone={r.connected ? "green" : "grey"}>{r.connected ? "connected" : "not connected"}</CABadge>
                  </td>
                  <td style={caTd}>{r.lastSynced ? dateIN(r.lastSynced) : "—"}</td>
                  <td style={{ ...caTd, textAlign: "right", fontFamily: CA.mono }}>{r.records}</td>
                  <td style={{ ...caTd, textAlign: "right" }}>
                    <CAButton
                      variant={r.connected ? "primary" : "ghost"}
                      onClick={r.action}
                      disabled={r.actionDisabled}
                      style={{ padding: "6px 12px", fontSize: 12 }}
                    >
                      {r.actionLabel}
                    </CAButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </CACard>

      <div style={{ marginTop: 30 }}>
        <CAHeading size={18}>Canonical field map</CAHeading>
        <p style={{ fontFamily: CA.sans, fontSize: 13, color: CA.muted, marginTop: 6 }}>
          How we unify your data — every source mapped to the same definition.
        </p>
        <CACard style={{ marginTop: 14, overflow: "hidden" }}>
          {fields.length === 0 ? (
            <CAEmpty title="No canonical fields defined" />
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr>
                <th style={caTh}>Canonical field</th>
                <th style={caTh}>Definition</th>
                <th style={caTh}>Type / unit</th>
                <th style={caTh}>Source fields</th>
              </tr></thead>
              <tbody>
                {fields.map((f) => {
                  const mapped = mapsByField.get(f.id) ?? [];
                  return (
                    <tr key={f.id}>
                      <td style={caTd}>
                        <div style={{ fontWeight: 600 }}>{f.display_label}</div>
                        <div style={{ fontFamily: CA.mono, fontSize: 11.5, color: CA.faint }}>{f.field_name}</div>
                      </td>
                      <td style={{ ...caTd, color: CA.muted, fontSize: 12.5 }}>{f.description ?? "—"}</td>
                      <td style={caTd}>{f.data_type}{f.unit ? ` · ${f.unit}` : ""}</td>
                      <td style={caTd}>
                        {mapped.length === 0 ? (
                          <span style={{ color: CA.faint }}>Not mapped yet</span>
                        ) : (
                          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                            {mapped.map((m) => (
                              <CABadge key={`${m.source_system}:${m.source_field}`} tone="teal">
                                {m.source_system} · {m.source_field}
                              </CABadge>
                            ))}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
          {fieldById.size === 0 ? null : null}
        </CACard>
      </div>
    </div>
  );
}
