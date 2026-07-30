import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { supabaseExternal } from "@/integrations/supabase/external";
import { useCAPortal } from "@/hooks/useCAPortal";
import { toast } from "sonner";
import {
  CA, CACard, CAHeading, CABadge, CAButton, CAField, caInputStyle, statusTone, healthTone,
  inr, dateIN, caTh, caTd, caNum, CAEmpty,
} from "@/components/ca/portalUi";

interface Client {
  id: string;
  business_id: string | null;
  client_name: string;
  client_email: string | null;
  client_phone: string | null;
  gstin: string | null;
  pan: string | null;
  client_status: string | null;
  onboarded_at: string | null;
}

const TABS = ["Overview", "GST & ITC", "TDS", "Compliance", "Bank", "Reports"] as const;
type Tab = typeof TABS[number];

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <CACard style={{ padding: "14px 16px" }}>
      <div style={{ fontFamily: CA.sans, fontSize: 11, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: CA.faint }}>{label}</div>
      <div style={{ fontFamily: CA.mono, fontSize: 19, fontWeight: 600, marginTop: 6, fontVariantNumeric: "tabular-nums" }}>{value}</div>
    </CACard>
  );
}

export default function CAClientDetailPage() {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const { firmId, userId } = useCAPortal();
  const [client, setClient] = useState<Client | null>(null);
  const [tab, setTab] = useState<Tab>("Overview");
  const [loading, setLoading] = useState(true);

  // Tab data
  const [liquidity, setLiquidity] = useState<any>(null);
  const [revenue, setRevenue] = useState<any>(null);
  const [itc, setItc] = useState<any[]>([]);
  const [tds, setTds] = useState<any[]>([]);
  const [compliance, setCompliance] = useState<any[]>([]);
  const [txns, setTxns] = useState<any[]>([]);
  const [txnPage, setTxnPage] = useState(0);
  const [reports, setReports] = useState<any[]>([]);
  const [showTdsForm, setShowTdsForm] = useState(false);
  const [showComplianceForm, setShowComplianceForm] = useState(false);

  const businessId = client?.business_id ?? null;

  useEffect(() => {
    if (!clientId || !firmId) return;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("ca_clients")
        .select("id, business_id, client_name, client_email, client_phone, gstin, pan, client_status, onboarded_at")
        .eq("id", clientId)
        .maybeSingle();
      if (error) toast.error(error.message);
      setClient((data as Client) ?? null);
      setLoading(false);
      console.log("[fyn:ca] client detail mount", { clientId, business_id: (data as Client)?.business_id ?? null });
    })();
  }, [clientId, firmId]);

  // Overview (external)
  useEffect(() => {
    if (!businessId) return;
    (async () => {
      try {
        const { data } = await supabaseExternal
          .from("liquidity_metrics").select("*").eq("business_id", businessId)
          .order("recorded_at", { ascending: false }).limit(1).maybeSingle();
        setLiquidity(data ?? null);
        console.log("[fyn:ca] overview.liquidity_metrics", businessId, data);
      } catch (e) { console.warn("[fyn:ca] liquidity_metrics", e); }
      try {
        const { data } = await supabaseExternal
          .from("revenue_metrics").select("*").eq("org_id", businessId)
          .order("created_at", { ascending: false }).limit(1).maybeSingle();
        setRevenue(data ?? null);
        console.log("[fyn:ca] overview.revenue_metrics", businessId, data);
      } catch (e) { console.warn("[fyn:ca] revenue_metrics", e); }
    })();
  }, [businessId]);

  const loadItc = useCallback(async () => {
    if (!businessId || !firmId) return;
    const { data, error } = await supabase
      .from("ca_itc_records").select("*")
      .eq("business_id", businessId).eq("ca_firm_id", firmId).eq("is_demo", false)
      .order("invoice_date", { ascending: false });
    if (error) console.warn("[fyn:ca] ca_itc_records", error);
    setItc(data ?? []);
    console.log("[fyn:ca] tab.itc", businessId, data?.length ?? 0);
  }, [businessId, firmId]);

  const loadTds = useCallback(async () => {
    if (!businessId || !firmId) return;
    const { data, error } = await supabase
      .from("ca_tds_records").select("*")
      .eq("business_id", businessId).eq("ca_firm_id", firmId).eq("is_demo", false)
      .order("payment_date", { ascending: false });
    if (error) console.warn("[fyn:ca] ca_tds_records", error);
    setTds(data ?? []);
    console.log("[fyn:ca] tab.tds", businessId, data?.length ?? 0);
  }, [businessId, firmId]);

  const loadCompliance = useCallback(async () => {
    if (!businessId || !firmId) return;
    const { data, error } = await supabase
      .from("ca_compliance_events").select("*")
      .eq("business_id", businessId).eq("ca_firm_id", firmId).eq("is_demo", false)
      .order("due_date", { ascending: true });
    if (error) console.warn("[fyn:ca] ca_compliance_events", error);
    setCompliance(data ?? []);
    console.log("[fyn:ca] tab.compliance", businessId, data?.length ?? 0);
  }, [businessId, firmId]);

  const loadTxns = useCallback(async (page: number) => {
    if (!businessId) return;
    try {
      const { data, error } = await supabaseExternal
        .from("bank_transactions")
        .select("id, date, description, category, amount, balance, type")
        .eq("business_id", businessId)
        .order("date", { ascending: false })
        .range(page * 100, page * 100 + 99);
      if (error) throw error;
      setTxns((prev) => (page === 0 ? data ?? [] : [...prev, ...(data ?? [])]));
      console.log("[fyn:ca] tab.bank_transactions", businessId, data?.length ?? 0);
    } catch (e) { console.warn("[fyn:ca] bank_transactions", e); }
  }, [businessId]);

  const loadReports = useCallback(async () => {
    if (!businessId || !firmId) return;
    const { data, error } = await supabase
      .from("ca_reports_log").select("*")
      .eq("ca_firm_id", firmId).eq("business_id", businessId)
      .order("created_at", { ascending: false });
    if (error) console.warn("[fyn:ca] ca_reports_log", error);
    setReports(data ?? []);
    console.log("[fyn:ca] tab.reports", businessId, data?.length ?? 0);
  }, [businessId, firmId]);

  useEffect(() => {
    if (!businessId) return;
    loadItc(); loadTds(); loadCompliance(); loadReports(); loadTxns(0);
  }, [businessId, loadItc, loadTds, loadCompliance, loadReports, loadTxns]);

  // ---- Actions ----
  const uploadGstr2b = async (file: File) => {
    if (!businessId || !firmId || !userId) return;
    toast.info(`Processing ${file.name}…`);
    const now = new Date();
    const { error } = await supabase.from("ca_gstr2b_uploads").insert({
      ca_firm_id: firmId,
      business_id: businessId,
      file_name: file.name,
      file_size_bytes: file.size,
      filing_period: now.toLocaleDateString("en-IN", { month: "short", year: "numeric" }),
      processing_status: "pending",
      uploaded_by: userId,
    });
    if (error) toast.error(`Upload not recorded: ${error.message}`);
    else toast.success("GSTR-2B upload recorded. Matching runs in the background.");
  };


  const generateReport = async () => {
    if (!businessId || !firmId) return;
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const period_start = start.toISOString().slice(0, 10);
    const period_end = now.toISOString().slice(0, 10);

    setGenerating(true);
    const { data, error } = await supabase.functions.invoke("generate-mis-report", {
      body: {
        ca_firm_id: firmId,
        business_id: businessId,
        period_start,
        period_end,
        generated_by_user_id: userId,
      },
    });
    setGenerating(false);

    if (error) return toast.error(`Report generation failed: ${error.message}`);
    if (!data?.success) return toast.error(data?.error ?? "Report generation failed");

    await loadReports();
    toast.success("MIS report generated successfully. Click to download.", {
      action: data.file_url
        ? { label: "Download", onClick: () => window.open(data.file_url, "_blank", "noopener") }
        : undefined,
    });
  };



  const itcTotals = useMemo(() => {
    const sum = (f: (r: any) => number) => itc.reduce((s, r) => s + (Number(f(r)) || 0), 0);
    return {
      claimed: sum((r) => r.total_itc),
      matched: sum((r) => (r.match_status === "matched" ? r.total_itc : 0)),
      mismatched: sum((r) => (r.match_status === "mismatched" ? r.total_itc : 0)),
      pending: sum((r) => (r.match_status !== "matched" && r.match_status !== "mismatched" ? r.total_itc : 0)),
    };
  }, [itc]);

  const tdsTotals = useMemo(() => {
    const deducted = tds.reduce((s, r) => s + (Number(r.tds_amount) || 0), 0);
    const deposited = tds.reduce((s, r) => s + (Number(r.deposited_amount) || 0), 0);
    return { deducted, deposited, outstanding: deducted - deposited };
  }, [tds]);

  const groupedCompliance = useMemo(() => {
    const now = new Date();
    const isOverdue = (e: any) => e.status !== "filed" && e.due_date && new Date(e.due_date) < now;
    return [
      ...compliance.filter(isOverdue),
      ...compliance.filter((e) => e.status !== "filed" && !isOverdue(e)),
      ...compliance.filter((e) => e.status === "filed"),
    ];
  }, [compliance]);

  if (loading) return <CAEmpty title="Loading client…" />;
  if (!client) return <CAEmpty title="Client not found" hint="This client may have been removed." />;

  return (
    <div>
      <button onClick={() => navigate("/ca/clients")} style={{ fontFamily: CA.sans, fontSize: 12.5, color: CA.teal, background: "none", border: "none", cursor: "pointer", padding: 0 }}>
        ← All clients
      </button>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginTop: 10, gap: 16 }}>
        <div>
          <CAHeading>{client.client_name}</CAHeading>
          <div style={{ fontFamily: CA.sans, fontSize: 13, color: CA.muted, marginTop: 6, display: "flex", gap: 14, flexWrap: "wrap" }}>
            <span>GSTIN <b style={{ fontFamily: CA.mono }}>{client.gstin ?? "—"}</b></span>
            <span>PAN <b style={{ fontFamily: CA.mono }}>{client.pan ?? "—"}</b></span>
            <span>{client.client_email ?? "—"}</span>
            <span>{client.client_phone ?? "—"}</span>
            <span>Onboarded {dateIN(client.onboarded_at)}</span>
          </div>
        </div>
        <CABadge tone={statusTone(client.client_status)}>{client.client_status ?? "—"}</CABadge>
      </div>

      <div style={{ display: "flex", gap: 6, marginTop: 20, borderBottom: `0.5px solid ${CA.line}` }}>
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              fontFamily: CA.sans, fontSize: 13, fontWeight: tab === t ? 700 : 500,
              color: tab === t ? CA.teal : CA.muted, background: "none", border: "none",
              padding: "10px 14px", cursor: "pointer",
              borderBottom: tab === t ? `2px solid ${CA.teal}` : "2px solid transparent",
            }}
          >
            {t}
          </button>
        ))}
      </div>

      <div style={{ marginTop: 20 }}>
        {!businessId && tab !== "Reports" && (
          <CACard style={{ marginBottom: 16 }}>
            <CAEmpty title="Client has not linked their business yet" hint="Financial data appears once the client accepts the access invitation." />
          </CACard>
        )}

        {tab === "Overview" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
            <Metric label="Cash position" value={inr(liquidity?.cash_position)} />
            <Metric label="Runway (months)" value={liquidity?.runway_months != null ? String(liquidity.runway_months) : "—"} />
            <Metric label="Monthly burn" value={inr(liquidity?.burn_rate_current)} />
            <CACard style={{ padding: "14px 16px" }}>
              <div style={{ fontFamily: CA.sans, fontSize: 11, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: CA.faint }}>Health</div>
              <div style={{ marginTop: 8 }}><CABadge tone={healthTone(liquidity?.health_status)}>{liquidity?.health_status ?? "no data"}</CABadge></div>
            </CACard>
            <Metric label="MRR" value={inr(revenue?.mrr)} />
            <Metric label="ARR" value={inr(revenue?.arr)} />
            <Metric label="Customers" value={revenue?.customer_count != null ? String(revenue.customer_count) : "—"} />
            <Metric label="Churn rate" value={revenue?.churn_rate != null ? `${revenue.churn_rate}%` : "—"} />
          </div>
        )}

        {tab === "GST & ITC" && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
              <Metric label="Total ITC claimed" value={inr(itcTotals.claimed)} />
              <Metric label="Matched" value={inr(itcTotals.matched)} />
              <Metric label="Mismatched" value={inr(itcTotals.mismatched)} />
              <Metric label="Pending" value={inr(itcTotals.pending)} />
            </div>
            <div style={{ marginTop: 16 }}>
              <label>
                <input type="file" accept=".json,.zip,.xlsx,.csv" style={{ display: "none" }}
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadGstr2b(f); e.currentTarget.value = ""; }} />
                <span style={{
                  display: "inline-block", fontFamily: CA.sans, fontSize: 13, fontWeight: 600,
                  background: CA.teal, color: "#fff", padding: "9px 16px", borderRadius: 9, cursor: "pointer",
                }}>
                  Upload GSTR-2B
                </span>
              </label>
            </div>
            <CACard style={{ marginTop: 16, overflow: "hidden" }}>
              {itc.length === 0 ? <CAEmpty title="No ITC records" /> : (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead><tr>
                    <th style={caTh}>Period</th><th style={caTh}>Supplier</th><th style={caTh}>Invoice</th>
                    <th style={{ ...caTh, textAlign: "right" }}>Total ITC</th><th style={caTh}>Match</th>
                    <th style={{ ...caTh, textAlign: "right" }}>Mismatch</th>
                  </tr></thead>
                  <tbody>
                    {itc.map((r) => (
                      <tr key={r.id}>
                        <td style={caTd}>{r.filing_period ?? "—"}</td>
                        <td style={caTd}>{r.supplier_name ?? "—"}</td>
                        <td style={{ ...caTd, fontFamily: CA.mono }}>{r.invoice_number ?? "—"}</td>
                        <td style={caNum}>{inr(r.total_itc)}</td>
                        <td style={caTd}><CABadge tone={statusTone(r.match_status)}>{r.match_status ?? "pending"}</CABadge></td>
                        <td style={caNum}>{inr(r.mismatch_amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CACard>
          </>
        )}

        {tab === "TDS" && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
              <Metric label="TDS deducted" value={inr(tdsTotals.deducted)} />
              <Metric label="Deposited" value={inr(tdsTotals.deposited)} />
              <Metric label="Outstanding" value={inr(tdsTotals.outstanding)} />
            </div>
            <div style={{ marginTop: 16 }}>
              <CAButton onClick={() => setShowTdsForm((s) => !s)}>{showTdsForm ? "Close form" : "New TDS record"}</CAButton>
            </div>
            {showTdsForm && businessId && firmId && (
              <TdsForm
                businessId={businessId}
                firmId={firmId}
                onSaved={() => { setShowTdsForm(false); loadTds(); }}
              />
            )}
            <CACard style={{ marginTop: 16, overflow: "hidden" }}>
              {tds.length === 0 ? <CAEmpty title="No TDS records" /> : (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead><tr>
                    <th style={caTh}>Qtr</th><th style={caTh}>FY</th><th style={caTh}>Section</th><th style={caTh}>Deductee</th>
                    <th style={{ ...caTh, textAlign: "right" }}>Payment</th><th style={{ ...caTh, textAlign: "right" }}>TDS</th>
                    <th style={{ ...caTh, textAlign: "right" }}>Deposited</th><th style={caTh}>Status</th><th style={caTh}>Return</th>
                  </tr></thead>
                  <tbody>
                    {tds.map((r) => (
                      <tr key={r.id}>
                        <td style={caTd}>{r.quarter ?? "—"}</td>
                        <td style={caTd}>{r.financial_year ?? "—"}</td>
                        <td style={{ ...caTd, fontFamily: CA.mono }}>{r.section_code ?? "—"}</td>
                        <td style={caTd}>{r.deductee_name ?? "—"}</td>
                        <td style={caNum}>{inr(r.payment_amount)}</td>
                        <td style={caNum}>{inr(r.tds_amount)}</td>
                        <td style={caNum}>{inr(r.deposited_amount)}</td>
                        <td style={caTd}><CABadge tone={statusTone(r.status)}>{r.status ?? "—"}</CABadge></td>
                        <td style={caTd}><CABadge tone={r.return_filed ? "green" : "amber"}>{r.return_filed ? "filed" : "not filed"}</CABadge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CACard>
          </>
        )}

        {tab === "Compliance" && (
          <>
            <CAButton onClick={() => setShowComplianceForm((s) => !s)}>
              {showComplianceForm ? "Close form" : "New compliance event"}
            </CAButton>
            {showComplianceForm && businessId && firmId && (
              <ComplianceForm
                businessId={businessId}
                firmId={firmId}
                onSaved={() => { setShowComplianceForm(false); loadCompliance(); }}
              />
            )}
            <CACard style={{ marginTop: 16, overflow: "hidden" }}>
              {groupedCompliance.length === 0 ? <CAEmpty title="No compliance events" /> : (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead><tr>
                    <th style={caTh}>Event</th><th style={caTh}>Period</th><th style={caTh}>Due</th>
                    <th style={caTh}>Status</th><th style={{ ...caTh, textAlign: "right" }}>Penalty</th>
                  </tr></thead>
                  <tbody>
                    {groupedCompliance.map((e) => {
                      const overdue = e.status !== "filed" && e.due_date && new Date(e.due_date) < new Date();
                      return (
                        <tr key={e.id}>
                          <td style={caTd}>{e.event_type ?? "—"}</td>
                          <td style={caTd}>{e.filing_period ?? "—"}</td>
                          <td style={caTd}>{dateIN(e.due_date)}</td>
                          <td style={caTd}>
                            <CABadge tone={e.status === "filed" ? "green" : overdue ? "red" : "amber"}>
                              {e.status === "filed" ? "filed" : overdue ? "overdue" : e.status ?? "pending"}
                            </CABadge>
                          </td>
                          <td style={caNum}>{inr(e.penalty_amount)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </CACard>
          </>
        )}

        {tab === "Bank" && (
          <CACard style={{ overflow: "hidden" }}>
            {txns.length === 0 ? <CAEmpty title="No bank transactions" /> : (
              <>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead><tr>
                    <th style={caTh}>Date</th><th style={caTh}>Description</th><th style={caTh}>Category</th>
                    <th style={{ ...caTh, textAlign: "right" }}>Amount</th><th style={{ ...caTh, textAlign: "right" }}>Balance</th>
                  </tr></thead>
                  <tbody>
                    {txns.map((t) => {
                      const signed = t.type === "debit" ? -Math.abs(Number(t.amount)) : Number(t.amount);
                      return (
                        <tr key={t.id}>
                          <td style={caTd}>{dateIN(t.date)}</td>
                          <td style={caTd}>{t.description ?? "—"}</td>
                          <td style={caTd}>{t.category ?? "—"}</td>
                          <td style={{ ...caNum, color: signed < 0 ? CA.red : CA.green }}>{inr(signed)}</td>
                          <td style={caNum}>{inr(t.balance)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                <div style={{ padding: 14 }}>
                  <CAButton variant="ghost" onClick={() => { const p = txnPage + 1; setTxnPage(p); loadTxns(p); }}>
                    Show more
                  </CAButton>
                </div>
              </>
            )}
          </CACard>
        )}

        {tab === "Reports" && (
          <>
            <CAButton onClick={generateReport} disabled={!businessId}>Generate MIS report</CAButton>
            <CACard style={{ marginTop: 16, overflow: "hidden" }}>
              {reports.length === 0 ? <CAEmpty title="No reports yet" /> : (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead><tr>
                    <th style={caTh}>Type</th><th style={caTh}>Period</th><th style={caTh}>Status</th>
                    <th style={caTh}>Created</th><th style={caTh} />
                  </tr></thead>
                  <tbody>
                    {reports.map((r) => (
                      <tr key={r.id}>
                        <td style={caTd}>{r.report_type ?? "—"}</td>
                        <td style={caTd}>{r.period ?? "—"}</td>
                        <td style={caTd}><CABadge tone={statusTone(r.status)}>{r.status ?? "—"}</CABadge></td>
                        <td style={caTd}>{dateIN(r.created_at)}</td>
                        <td style={{ ...caTd, textAlign: "right" }}>
                          {r.file_url ? (
                            <a href={r.file_url} target="_blank" rel="noreferrer" style={{ color: CA.teal, fontWeight: 600, fontSize: 12.5 }}>Download</a>
                          ) : (
                            <span style={{ color: CA.faint, fontSize: 12.5 }}>Not ready</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CACard>
          </>
        )}
      </div>
    </div>
  );
}

function TdsForm({ businessId, firmId, onSaved }: { businessId: string; firmId: string; onSaved: () => void }) {
  const [f, setF] = useState({
    financial_year: "", quarter: "Q1", section_code: "", deductee_name: "", deductee_pan: "",
    payment_date: "", payment_amount: "", tds_rate: "", tds_amount: "", deposited_amount: "",
    challan_number: "", status: "pending", return_filed: false,
  });
  const [saving, setSaving] = useState(false);
  const set = (k: string) => (e: any) => setF((s) => ({ ...s, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.from("ca_tds_records").insert({
      business_id: businessId,
      ca_firm_id: firmId,
      financial_year: f.financial_year || null,
      quarter: f.quarter,
      section_code: f.section_code || null,
      deductee_name: f.deductee_name || null,
      deductee_pan: f.deductee_pan ? f.deductee_pan.toUpperCase() : null,
      payment_date: f.payment_date || null,
      payment_amount: f.payment_amount ? Number(f.payment_amount) : null,
      tds_rate: f.tds_rate ? Number(f.tds_rate) : null,
      tds_amount: f.tds_amount ? Number(f.tds_amount) : null,
      deposited_amount: f.deposited_amount ? Number(f.deposited_amount) : 0,
      challan_number: f.challan_number || null,
      status: f.status,
      return_filed: f.return_filed,
      is_demo: false,
    });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("TDS record saved");
    onSaved();
  };

  return (
    <CACard style={{ padding: 20, marginTop: 16 }}>
      <form onSubmit={save} style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
        <CAField label="Financial year"><input style={caInputStyle} value={f.financial_year} onChange={set("financial_year")} placeholder="2025-26" /></CAField>
        <CAField label="Quarter">
          <select style={caInputStyle as any} value={f.quarter} onChange={set("quarter")}>
            {["Q1", "Q2", "Q3", "Q4"].map((q) => <option key={q} value={q}>{q}</option>)}
          </select>
        </CAField>
        <CAField label="Section code"><input style={caInputStyle} value={f.section_code} onChange={set("section_code")} placeholder="194C" /></CAField>
        <CAField label="Deductee name"><input style={caInputStyle} value={f.deductee_name} onChange={set("deductee_name")} /></CAField>
        <CAField label="Deductee PAN"><input style={caInputStyle} value={f.deductee_pan} onChange={set("deductee_pan")} placeholder="ABCDE1234F" /></CAField>
        <CAField label="Payment date"><input style={caInputStyle} type="date" value={f.payment_date} onChange={set("payment_date")} /></CAField>
        <CAField label="Payment amount"><input style={caInputStyle} type="number" value={f.payment_amount} onChange={set("payment_amount")} /></CAField>
        <CAField label="TDS rate (%)"><input style={caInputStyle} type="number" step="0.01" value={f.tds_rate} onChange={set("tds_rate")} /></CAField>
        <CAField label="TDS amount"><input style={caInputStyle} type="number" value={f.tds_amount} onChange={set("tds_amount")} /></CAField>
        <CAField label="Deposited amount"><input style={caInputStyle} type="number" value={f.deposited_amount} onChange={set("deposited_amount")} /></CAField>
        <CAField label="Challan number"><input style={caInputStyle} value={f.challan_number} onChange={set("challan_number")} /></CAField>
        <CAField label="Status">
          <select style={caInputStyle as any} value={f.status} onChange={set("status")}>
            <option value="pending">Pending</option>
            <option value="deposited">Deposited</option>
            <option value="overdue">Overdue</option>
          </select>
        </CAField>
        <label style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: CA.sans, fontSize: 13 }}>
          <input type="checkbox" checked={f.return_filed} onChange={set("return_filed")} /> Return filed
        </label>
        <div style={{ gridColumn: "1 / -1" }}>
          <CAButton type="submit" disabled={saving}>{saving ? "Saving…" : "Save TDS record"}</CAButton>
        </div>
      </form>
    </CACard>
  );
}

function ComplianceForm({ businessId, firmId, onSaved }: { businessId: string; firmId: string; onSaved: () => void }) {
  const [f, setF] = useState({
    event_type: "GSTR-3B", filing_period: "", due_date: "", filing_date: "",
    status: "pending", penalty_amount: "", late_fee_amount: "", notes: "",
  });
  const [saving, setSaving] = useState(false);
  const set = (k: string) => (e: any) => setF((s) => ({ ...s, [k]: e.target.value }));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.from("ca_compliance_events").insert({
      business_id: businessId,
      ca_firm_id: firmId,
      event_type: f.event_type,
      filing_period: f.filing_period || null,
      due_date: f.due_date || null,
      filing_date: f.filing_date || null,
      status: f.status,
      penalty_amount: f.penalty_amount ? Number(f.penalty_amount) : 0,
      late_fee_amount: f.late_fee_amount ? Number(f.late_fee_amount) : 0,
      notes: f.notes || null,
      is_demo: false,
    });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Compliance event saved");
    onSaved();
  };

  return (
    <CACard style={{ padding: 20, marginTop: 16 }}>
      <form onSubmit={save} style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
        <CAField label="Event type">
          <select style={caInputStyle as any} value={f.event_type} onChange={set("event_type")}>
            {["GSTR-1", "GSTR-3B", "GSTR-9", "TDS Return", "ITR", "ROC Filing", "Advance Tax"].map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </CAField>
        <CAField label="Filing period"><input style={caInputStyle} value={f.filing_period} onChange={set("filing_period")} placeholder="Jul 2026" /></CAField>
        <CAField label="Due date"><input style={caInputStyle} type="date" value={f.due_date} onChange={set("due_date")} /></CAField>
        <CAField label="Filing date"><input style={caInputStyle} type="date" value={f.filing_date} onChange={set("filing_date")} /></CAField>
        <CAField label="Status">
          <select style={caInputStyle as any} value={f.status} onChange={set("status")}>
            <option value="pending">Pending</option>
            <option value="filed">Filed</option>
          </select>
        </CAField>
        <CAField label="Penalty amount"><input style={caInputStyle} type="number" value={f.penalty_amount} onChange={set("penalty_amount")} /></CAField>
        <CAField label="Late fee"><input style={caInputStyle} type="number" value={f.late_fee_amount} onChange={set("late_fee_amount")} /></CAField>
        <CAField label="Notes"><input style={caInputStyle} value={f.notes} onChange={set("notes")} /></CAField>
        <div style={{ gridColumn: "1 / -1" }}>
          <CAButton type="submit" disabled={saving}>{saving ? "Saving…" : "Save event"}</CAButton>
        </div>
      </form>
    </CACard>
  );
}
