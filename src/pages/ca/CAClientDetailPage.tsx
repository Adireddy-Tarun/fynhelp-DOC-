import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, AlertTriangle, FileText, Upload, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { COLORS, MetricCard, Card, Chip, PrimaryBtn, SecondaryBtn, GhostLink, HealthScoreBadge } from "@/components/ca/ui";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useCAAuth } from "@/contexts/CAAuthContext";
import { formatIndianCurrency, formatIndianDate } from "@/utils/formatters";

const TABS = [
  "Overview",
  "Cash & Liquidity",
  "GST & ITC",
  "Compliance",
  "Receivables",
  "Payables",
  "HR & Payroll",
  "Documents",
  "Activity Log",
];

type Business = {
  id: string;
  business_name: string;
  gstin: string | null;
  industry: string | null;
  state: string | null;
  turnover_range: string | null;
};

type Tx = { id: string; date: string; amount: number; direction: string; counterparty: string | null; category: string | null };
type ItcLine = { id: string; period: string; vendor_gstin: string | null; itc_safe: number | null; itc_at_risk: number | null; mismatch_count: number | null; status: string | null };
type Compliance = { id: string; filing_name: string; filing_type: string; due_date: string; status: string | null; urgency: string | null };
type Receivable = { id: string; customer_name: string; invoice_number: string | null; amount: number; outstanding: number | null; due_date: string | null; risk_score: number | null; status: string | null };
type Payable = { id: string; vendor_name: string; invoice_number: string | null; amount: number; outstanding: number | null; due_date: string | null; status: string | null };
type Payroll = { id: string; month: string; headcount: number | null; total_payroll: number | null; pf_due: number | null; esic_due: number | null; next_payroll_date: string | null };
type Activity = { id: string; action_type: string; description: string | null; created_at: string };
type Risk = { score: number; factors: any; computed_at: string };

export default function CAClientDetailPage() {
  const { id: businessId } = useParams();
  const navigate = useNavigate();
  const { caFirm, user } = useCAAuth();
  const [search, setSearch] = useSearchParams();
  const tab = search.get("tab") || "Overview";
  const setTab = (t: string) => setSearch({ tab: t });

  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [business, setBusiness] = useState<Business | null>(null);
  const [txs, setTxs] = useState<Tx[]>([]);
  const [itcLines, setItcLines] = useState<ItcLine[]>([]);
  const [risk, setRisk] = useState<Risk | null>(null);
  const [compliance, setCompliance] = useState<Compliance[]>([]);
  const [receivables, setReceivables] = useState<Receivable[]>([]);
  const [payables, setPayables] = useState<Payable[]>([]);
  const [payroll, setPayroll] = useState<Payroll[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [bankBalance, setBankBalance] = useState<number>(0);
  const [bankCount, setBankCount] = useState<number>(0);
  const [note, setNote] = useState("");

  // Load all data + access check
  useEffect(() => {
    if (!businessId || !caFirm) return;
    let cancelled = false;

    (async () => {
      setLoading(true);

      // Access guard
      const { data: access } = await supabase
        .from("ca_client_access")
        .select("id")
        .eq("ca_firm_id", caFirm.id)
        .eq("business_id", businessId)
        .eq("is_active", true)
        .maybeSingle();

      if (cancelled) return;
      if (!access) {
        setAccessDenied(true);
        setLoading(false);
        return;
      }

      const [
        biz,
        bankRows,
        txRows,
        itcRows,
        riskRow,
        compRows,
        recvRows,
        payRows,
        prRows,
        actRows,
      ] = await Promise.all([
        supabase.from("businesses").select("id,business_name,gstin,industry,state,turnover_range").eq("id", businessId).maybeSingle(),
        supabase.from("bank_accounts").select("balance").eq("business_id", businessId),
        supabase.from("transactions").select("id,date,amount,direction,counterparty,category").eq("business_id", businessId).order("date", { ascending: false }).limit(200),
        supabase.from("gst_itc_lines").select("id,period,vendor_gstin,itc_safe,itc_at_risk,mismatch_count,status").eq("business_id", businessId).order("period", { ascending: false }).limit(50),
        supabase.from("gst_notice_risk_scores").select("score,factors,computed_at").eq("business_id", businessId).order("computed_at", { ascending: false }).limit(1).maybeSingle(),
        supabase.from("compliance_events").select("id,filing_name,filing_type,due_date,status,urgency").eq("business_id", businessId).order("due_date").limit(30),
        supabase.from("receivables").select("id,customer_name,invoice_number,amount,outstanding,due_date,risk_score,status").eq("business_id", businessId).order("due_date").limit(50),
        supabase.from("payables").select("id,vendor_name,invoice_number,amount,outstanding,due_date,status").eq("business_id", businessId).order("due_date").limit(50),
        supabase.from("payroll_records").select("id,month,headcount,total_payroll,pf_due,esic_due,next_payroll_date").eq("business_id", businessId).order("month", { ascending: false }).limit(12),
        supabase.from("ca_activity_log").select("id,action_type,description,created_at").eq("business_id", businessId).eq("ca_firm_id", caFirm.id).order("created_at", { ascending: false }).limit(50),
      ]);

      if (cancelled) return;

      setBusiness(biz.data as Business | null);
      const banks = bankRows.data || [];
      setBankCount(banks.length);
      setBankBalance(banks.reduce((s, b: any) => s + Number(b.balance || 0), 0));
      setTxs((txRows.data as Tx[]) || []);
      setItcLines((itcRows.data as ItcLine[]) || []);
      setRisk((riskRow.data as Risk | null) ?? null);
      setCompliance((compRows.data as Compliance[]) || []);
      setReceivables((recvRows.data as Receivable[]) || []);
      setPayables((payRows.data as Payable[]) || []);
      setPayroll((prRows.data as Payroll[]) || []);
      setActivities((actRows.data as Activity[]) || []);
      setLoading(false);

      // Log activity (fire-and-forget)
      supabase.from("ca_activity_log").insert({
        ca_firm_id: caFirm.id,
        business_id: businessId,
        action_type: "client_view",
        description: `Viewed ${biz.data?.business_name || "client"}, ${tab} tab`,
      });
    })();

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [businessId, caFirm?.id]);

  // Derived metrics
  const burnRate = useMemo(() => {
    const out = txs.filter(t => t.direction === "out").reduce((s, t) => s + Number(t.amount), 0);
    const days = Math.max(1, txs.length ? Math.min(90, txs.length) : 30);
    return out / days;
  }, [txs]);

  const runwayDays = useMemo(() => {
    if (!burnRate || burnRate <= 0) return 999;
    return Math.floor(bankBalance / burnRate);
  }, [bankBalance, burnRate]);

  const runwayColor = runwayDays > 90 ? COLORS.greenSoft : runwayDays >= 30 ? COLORS.amberSoft : COLORS.redSoft;

  const itcSafe = itcLines.reduce((s, l) => s + Number(l.itc_safe || 0), 0);
  const itcAtRisk = itcLines.reduce((s, l) => s + Number(l.itc_at_risk || 0), 0);
  const mismatchCount = itcLines.reduce((s, l) => s + Number(l.mismatch_count || 0), 0);

  const totalReceivables = receivables.reduce((s, r) => s + Number(r.outstanding || r.amount), 0);
  const overdueReceivables = receivables.filter(r => r.due_date && new Date(r.due_date) < new Date())
    .reduce((s, r) => s + Number(r.outstanding || r.amount), 0);

  const totalPayables = payables.reduce((s, p) => s + Number(p.outstanding || p.amount), 0);
  const dueThisWeekPayables = payables.filter(p => {
    if (!p.due_date) return false;
    const d = new Date(p.due_date).getTime() - Date.now();
    return d >= 0 && d <= 7 * 86400000;
  }).reduce((s, p) => s + Number(p.outstanding || p.amount), 0);

  const latestPayroll = payroll[0];

  const cashSeries = useMemo(() => {
    // Build daily net cash for last 30 days
    const byDay: Record<string, number> = {};
    txs.forEach(t => {
      const d = t.date.slice(0, 10);
      const amt = Number(t.amount) * (t.direction === "in" ? 1 : -1);
      byDay[d] = (byDay[d] || 0) + amt;
    });
    return Object.entries(byDay).slice(0, 30).reverse().map(([d, v]) => ({ d: d.slice(5), net: v }));
  }, [txs]);

  const upcomingFilings = compliance.filter(c => c.status !== "filed").slice(0, 5);
  const nextFiling = upcomingFilings[0];

  const filingsDue7d = upcomingFilings.filter(c => {
    const d = new Date(c.due_date).getTime() - Date.now();
    return d >= 0 && d <= 7 * 86400000;
  }).length;

  // Render
  if (!businessId) return null;

  if (accessDenied) {
    return (
      <div className="px-8 py-16 text-center font-sans">
        <AlertTriangle size={48} className="mx-auto mb-4" style={{ color: COLORS.red }} />
        <h2 className="text-2xl font-bold mb-2" style={{ color: COLORS.ink }}>Access denied</h2>
        <p className="mb-6 text-sm" style={{ color: "rgba(26,16,8,0.65)" }}>
          You don't have access to this client. Request access from the client or your firm admin.
        </p>
        <PrimaryBtn onClick={() => navigate("/ca/clients")}>Back to clients</PrimaryBtn>
      </div>
    );
  }

  if (loading) {
    return <div className="px-8 py-16 text-sm font-sans" style={{ color: COLORS.ink }}>Loading client…</div>;
  }

  if (!business) {
    return (
      <div className="px-8 py-16 text-center font-sans">
        <h2 className="text-xl font-semibold mb-2">Client not found</h2>
        <PrimaryBtn onClick={() => navigate("/ca/clients")}>Back to clients</PrimaryBtn>
      </div>
    );
  }

  const healthScore = risk?.score ? Math.max(0, 100 - Number(risk.score)) : 50;

  return (
    <div className="font-sans" style={{ color: COLORS.ink }}>
      {/* Context bar */}
      <div className="px-8 py-4" style={{ background: COLORS.ink }}>
        <div className="flex items-center gap-3 mb-2">
          <button onClick={() => navigate("/ca/clients")} className="text-white text-[13px] flex items-center gap-1.5 hover:opacity-80">
            <ArrowLeft size={14} /> Back to Clients
          </button>
          <span className="text-[12px]" style={{ color: "rgba(255,255,255,0.45)" }}>
            Dashboard / Clients / {business.business_name}
          </span>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-white font-bold text-[26px]" style={{ fontFamily: "'Playfair Display', serif" }}>
            {business.business_name}
          </span>
          {business.gstin && (
            <span className="text-[12px] px-2 py-0.5 rounded font-mono" style={{ background: "rgba(255,255,255,0.10)", color: "rgba(255,255,255,0.75)" }}>
              {business.gstin}
            </span>
          )}
          {business.industry && (
            <span className="text-[11px] font-medium px-2 py-0.5 rounded" style={{ background: "rgba(139,105,20,0.20)", color: "#FCD34D" }}>
              {business.industry}
            </span>
          )}
          <div className="flex items-center gap-2 ml-auto">
            <HealthScoreBadge score={healthScore} size={36} />
            <SecondaryBtn size="sm" onClick={() => navigate(`/ca/reports?client=${businessId}`)}>Generate Report</SecondaryBtn>
            <PrimaryBtn size="sm" onClick={() => navigate(`/ca/gst-portfolio?client=${businessId}`)}>File GST Returns</PrimaryBtn>
          </div>
        </div>

        {/* Quick metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          <QuickMetric label="Cash Balance" value={formatIndianCurrency(bankBalance)} sub={`${bankCount} account${bankCount === 1 ? "" : "s"}`} />
          <QuickMetric label="Runway" value={`${runwayDays > 365 ? "-" : runwayDays} days`} valueColor={runwayColor} />
          <QuickMetric label="Critical Alerts" value={String(mismatchCount + filingsDue7d)} valueColor={(mismatchCount + filingsDue7d) > 0 ? COLORS.redSoft : "#FFFFFF"} />
          <QuickMetric label="Next Filing" value={nextFiling?.filing_name || "-"} sub={nextFiling ? formatIndianDate(nextFiling.due_date) : ""} />
        </div>
      </div>

      {/* Tabs */}
      <div className="px-8 bg-white sticky top-14 z-20 flex items-center gap-1 overflow-x-auto" style={{ borderBottom: `2px solid ${COLORS.divider}` }}>
        {TABS.map((t) => {
          const active = tab === t;
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="px-5 py-4 text-[13px] font-medium whitespace-nowrap transition-colors"
              style={active
                ? { color: COLORS.red, borderBottom: `3px solid ${COLORS.red}`, marginBottom: "-2px" }
                : { color: "rgba(26,16,8,0.65)" }}
            >
              {t}
            </button>
          );
        })}
      </div>

      <div className="px-8 py-6 space-y-4">
        {tab === "Overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-3 space-y-4">
              <Card>
                <h3 className="text-[15px] font-semibold mb-4">Financial Summary</h3>
                <div className="grid grid-cols-3 gap-4">
                  <Stat label="Cash Balance" value={formatIndianCurrency(bankBalance)} />
                  <Stat label="Runway" value={`${runwayDays > 365 ? "-" : runwayDays} d`} color={runwayDays > 90 ? COLORS.green : runwayDays >= 30 ? COLORS.amber : COLORS.red} />
                  <Stat label="Daily Burn" value={formatIndianCurrency(burnRate)} />
                </div>
              </Card>

              <Card>
                <h3 className="text-[15px] font-semibold mb-3">Cash Flow, last 30 days</h3>
                {cashSeries.length === 0 ? (
                  <EmptyHint text="No transactions yet for this client." />
                ) : (
                  <ResponsiveContainer width="100%" height={240}>
                    <AreaChart data={cashSeries}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F0EBD8" />
                      <XAxis dataKey="d" tick={{ fontSize: 11, fill: "rgba(26,16,8,0.50)" }} />
                      <YAxis tick={{ fontSize: 11, fill: "rgba(26,16,8,0.50)" }} tickFormatter={(v) => formatIndianCurrency(Number(v))} />
                      <Tooltip formatter={(v: any) => formatIndianCurrency(Number(v))} />
                      <Area type="monotone" dataKey="net" stroke={COLORS.blue} fill={COLORS.blue} fillOpacity={0.15} strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </Card>

              <Card>
                <h3 className="text-[15px] font-semibold mb-3">Top issues requiring attention</h3>
                <ul className="space-y-3">
                  {buildTopIssues({ runwayDays, itcAtRisk, overdueReceivables, mismatchCount, nextFiling }).map((it, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ background: it.color }} />
                      <div className="flex-1">
                        <div className="text-sm font-medium">{it.title}</div>
                        <div className="text-[13px]" style={{ color: "rgba(26,16,8,0.65)" }}>{it.body}</div>
                      </div>
                      <GhostLink onClick={() => setTab(it.tab)}>View →</GhostLink>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>

            <div className="lg:col-span-2 space-y-4">
              <Card>
                <h3 className="text-[15px] font-semibold mb-3">Upcoming filings</h3>
                {upcomingFilings.length === 0 ? <EmptyHint text="All clear." /> : (
                  <ul className="space-y-2.5">
                    {upcomingFilings.map(f => {
                      const days = Math.ceil((new Date(f.due_date).getTime() - Date.now()) / 86400000);
                      const dot = days < 3 ? COLORS.red : days < 7 ? COLORS.amber : COLORS.gold;
                      return (
                        <li key={f.id} className="flex items-center gap-2.5 text-sm">
                          <span className="w-2 h-2 rounded-full" style={{ background: dot }} />
                          <div className="flex-1">
                            <div className="font-medium">{f.filing_name}</div>
                            <div className="text-[12px]" style={{ color: "rgba(26,16,8,0.55)" }}>{formatIndianDate(f.due_date)} · {days}d</div>
                          </div>
                          <GhostLink onClick={() => setTab("Compliance")}>File →</GhostLink>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </Card>

              <Card>
                <h3 className="text-[15px] font-semibold mb-3">ITC Health</h3>
                <div className="space-y-2 text-sm">
                  <ItcRow label="ITC Safe" value={formatIndianCurrency(itcSafe)} bg="#DCFCE7" color="#166534" />
                  <ItcRow label="ITC At Risk" value={formatIndianCurrency(itcAtRisk)} bg="#FEE2E2" color="#991B1B" />
                  <ItcRow label="Notice Risk Score" value={`${risk?.score ?? "-"}/100`} bg="#FEF3C7" color="#92400E" />
                </div>
              </Card>

              <Card>
                <h3 className="text-[15px] font-semibold mb-3">Recent CA activity</h3>
                {activities.length === 0 ? <EmptyHint text="No activity yet." /> : (
                  <ul className="space-y-2 text-[13px]">
                    {activities.slice(0, 5).map(a => (
                      <li key={a.id}>
                        <div style={{ color: "rgba(26,16,8,0.45)" }} className="text-[11px]">{timeAgo(a.created_at)}</div>
                        <div style={{ color: "rgba(26,16,8,0.75)" }}>{a.description || a.action_type}</div>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            </div>
          </div>
        )}

        {tab === "Cash & Liquidity" && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <MetricCard label="Cash Balance" value={formatIndianCurrency(bankBalance)} sub={`${bankCount} accounts`} />
              <MetricCard label="Runway" value={`${runwayDays > 365 ? "-" : runwayDays}d`} valueColor={runwayColor} sub={runwayDays < 30 ? "Critical" : runwayDays < 90 ? "Watch" : "Healthy"} />
              <MetricCard label="Daily Burn" value={formatIndianCurrency(burnRate)} sub="Avg last 30d" />
              <MetricCard label="Tx (90d)" value={String(txs.length)} sub="Bank transactions" />
            </div>
            <Card>
              <h3 className="text-[15px] font-semibold mb-3">Cash movement</h3>
              {cashSeries.length === 0 ? <EmptyHint text="No transactions." /> : (
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={cashSeries}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F0EBD8" />
                    <XAxis dataKey="d" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => formatIndianCurrency(Number(v))} />
                    <Tooltip formatter={(v: any) => formatIndianCurrency(Number(v))} />
                    <Area type="monotone" dataKey="net" stroke={COLORS.blue} fill={COLORS.blue} fillOpacity={0.18} strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </Card>
            <Card>
              <h3 className="text-[15px] font-semibold mb-3">Recent transactions</h3>
              <SimpleTable
                headers={["Date", "Counterparty", "Category", "Direction", "Amount"]}
                rows={txs.slice(0, 20).map(t => [
                  formatIndianDate(t.date),
                  t.counterparty || "-",
                  t.category || "-",
                  <Chip key="dir" tone={t.direction === "in" ? "green" : "red"}>{t.direction}</Chip>,
                  formatIndianCurrency(Number(t.amount)),
                ])}
                empty="No transactions."
              />
            </Card>
          </>
        )}

        {tab === "GST & ITC" && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <MetricCard label="ITC Safe" value={formatIndianCurrency(itcSafe)} valueColor={COLORS.greenSoft} />
              <MetricCard label="ITC At Risk" value={formatIndianCurrency(itcAtRisk)} valueColor={COLORS.redSoft} />
              <MetricCard label="Notice Risk" value={`${risk?.score ?? "-"}/100`} valueColor={COLORS.amberSoft} />
              <MetricCard label="Pending Filings" value={String(upcomingFilings.filter(f => f.filing_type?.toLowerCase().includes("gst")).length)} />
            </div>
            <Card>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[15px] font-semibold">ITC Reconciliation lines</h3>
                <div className="flex gap-2">
                  <SecondaryBtn size="sm">Download GSTR-2A</SecondaryBtn>
                  <SecondaryBtn size="sm">Export Mismatches</SecondaryBtn>
                  <PrimaryBtn size="sm">Run ITC Reconciliation</PrimaryBtn>
                </div>
              </div>
              <SimpleTable
                headers={["Period", "Vendor GSTIN", "Safe", "At Risk", "Mismatches", "Status"]}
                rows={itcLines.map(l => [
                  l.period,
                  <span key="g" className="font-mono text-[12px]">{l.vendor_gstin || "-"}</span>,
                  formatIndianCurrency(Number(l.itc_safe || 0)),
                  <span key="r" style={{ color: Number(l.itc_at_risk) > 0 ? COLORS.red : "inherit", fontWeight: Number(l.itc_at_risk) > 0 ? 600 : 400 }}>
                    {formatIndianCurrency(Number(l.itc_at_risk || 0))}
                  </span>,
                  l.mismatch_count || 0,
                  <Chip key="s" tone={l.status === "reconciled" ? "green" : "amber"}>{l.status || "pending"}</Chip>,
                ])}
                empty="No ITC lines yet. Run reconciliation to populate."
              />
            </Card>
          </>
        )}

        {tab === "Compliance" && (
          <>
            <Card>
              <div className="flex items-baseline justify-between mb-4">
                <h3 className="text-[15px] font-semibold">Compliance matrix</h3>
                <div className="text-[28px] font-bold" style={{ fontFamily: "'Playfair Display', serif", color: healthScore >= 70 ? COLORS.green : healthScore >= 40 ? COLORS.amber : COLORS.red }}>
                  {healthScore}/100
                </div>
              </div>
              <SimpleTable
                headers={["Filing", "Type", "Due Date", "Days Left", "Status"]}
                rows={compliance.map(c => {
                  const days = Math.ceil((new Date(c.due_date).getTime() - Date.now()) / 86400000);
                  return [
                    c.filing_name,
                    c.filing_type,
                    formatIndianDate(c.due_date),
                    <span key="d" style={{ color: days < 0 ? COLORS.red : days < 7 ? COLORS.amber : COLORS.green, fontWeight: 600 }}>
                      {days < 0 ? `${Math.abs(days)}d overdue` : `${days}d`}
                    </span>,
                    <Chip key="s" tone={c.status === "filed" ? "green" : days < 0 ? "red" : "amber"}>{c.status || "pending"}</Chip>,
                  ];
                })}
                empty="No compliance events scheduled."
              />
            </Card>
          </>
        )}

        {tab === "Receivables" && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <MetricCard label="Total Outstanding" value={formatIndianCurrency(totalReceivables)} />
              <MetricCard label="Overdue" value={formatIndianCurrency(overdueReceivables)} valueColor={overdueReceivables > 0 ? COLORS.redSoft : "#FFFFFF"} />
              <MetricCard label="Open Invoices" value={String(receivables.length)} />
            </div>
            <Card>
              <h3 className="text-[15px] font-semibold mb-3">All receivables</h3>
              <SimpleTable
                headers={["Customer", "Invoice", "Due", "Amount", "Outstanding", "Risk", "Actions"]}
                rows={receivables.map(r => {
                  const overdue = r.due_date && new Date(r.due_date) < new Date();
                  return [
                    r.customer_name,
                    r.invoice_number || "-",
                    <span key="d" style={{ color: overdue ? COLORS.red : "inherit" }}>{r.due_date ? formatIndianDate(r.due_date) : "-"}</span>,
                    formatIndianCurrency(Number(r.amount)),
                    formatIndianCurrency(Number(r.outstanding || r.amount)),
                    <Chip key="r" tone={Number(r.risk_score) > 70 ? "red" : Number(r.risk_score) > 40 ? "amber" : "green"}>{r.risk_score ?? "-"}</Chip>,
                    <GhostLink key="a">Chase →</GhostLink>,
                  ];
                })}
                empty="No receivables."
              />
            </Card>
          </>
        )}

        {tab === "Payables" && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <MetricCard label="Total Payables" value={formatIndianCurrency(totalPayables)} />
              <MetricCard label="Due This Week" value={formatIndianCurrency(dueThisWeekPayables)} valueColor={dueThisWeekPayables > 0 ? COLORS.amberSoft : "#FFFFFF"} />
              <MetricCard label="Open Bills" value={String(payables.length)} />
            </div>
            <Card>
              <h3 className="text-[15px] font-semibold mb-3">All payables</h3>
              <SimpleTable
                headers={["Vendor", "Bill", "Due", "Amount", "Outstanding", "Status", "Actions"]}
                rows={payables.map(p => [
                  p.vendor_name,
                  p.invoice_number || "-",
                  p.due_date ? formatIndianDate(p.due_date) : "-",
                  formatIndianCurrency(Number(p.amount)),
                  formatIndianCurrency(Number(p.outstanding || p.amount)),
                  <Chip key="s" tone={p.status === "paid" ? "green" : "amber"}>{p.status || "pending"}</Chip>,
                  <GhostLink key="a">Pay →</GhostLink>,
                ])}
                empty="No payables."
              />
            </Card>
          </>
        )}

        {tab === "HR & Payroll" && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <MetricCard label="Headcount" value={String(latestPayroll?.headcount ?? "-")} />
              <MetricCard label="Monthly Payroll" value={latestPayroll ? formatIndianCurrency(Number(latestPayroll.total_payroll || 0)) : "-"} />
              <MetricCard label="PF Due" value={latestPayroll ? formatIndianCurrency(Number(latestPayroll.pf_due || 0)) : "-"} />
              <MetricCard label="Next Payroll" value={latestPayroll?.next_payroll_date ? formatIndianDate(latestPayroll.next_payroll_date) : "-"} />
            </div>
            <Card>
              <h3 className="text-[15px] font-semibold mb-3">Payroll history</h3>
              <SimpleTable
                headers={["Month", "Headcount", "Total Payroll", "PF Due", "ESIC Due"]}
                rows={payroll.map(p => [
                  formatIndianDate(p.month),
                  p.headcount ?? "-",
                  formatIndianCurrency(Number(p.total_payroll || 0)),
                  formatIndianCurrency(Number(p.pf_due || 0)),
                  formatIndianCurrency(Number(p.esic_due || 0)),
                ])}
                empty="No payroll records."
              />
            </Card>
          </>
        )}

        {tab === "Documents" && (
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[15px] font-semibold">Documents</h3>
              <PrimaryBtn size="sm"><span className="inline-flex items-center gap-1.5"><Upload size={14} /> Upload Document</span></PrimaryBtn>
            </div>
            <div className="border-2 border-dashed rounded p-12 text-center" style={{ borderColor: COLORS.caBorder }}>
              <FileText size={32} className="mx-auto mb-3" style={{ color: COLORS.caBorder }} />
              <div className="text-sm font-medium mb-1">Document storage coming soon</div>
              <div className="text-[12px]" style={{ color: "rgba(26,16,8,0.50)" }}>
                A document manager (PDF, Excel, Word, JPG, PNG · max 50MB) will appear here once enabled for your firm.
              </div>
            </div>
          </Card>
        )}

        {tab === "Activity Log" && (
          <Card>
            <h3 className="text-[15px] font-semibold mb-3">Activity on this client</h3>
            <SimpleTable
              headers={["Timestamp", "Action", "Details"]}
              rows={activities.map(a => [
                <span key="t" className="text-[12px] font-mono" style={{ color: "rgba(26,16,8,0.60)" }}>{new Date(a.created_at).toLocaleString("en-IN")}</span>,
                <Chip key="a" tone={actionTone(a.action_type)}>{a.action_type}</Chip>,
                a.description || "-",
              ])}
              empty="No activity yet."
            />
          </Card>
        )}
      </div>
    </div>
  );
}

// --- Sub-components ---

function QuickMetric({ label, value, sub, valueColor = "#FFFFFF" }: { label: string; value: string; sub?: string; valueColor?: string }) {
  return (
    <div className="rounded-md p-3" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)" }}>
      <div className="text-[10px] uppercase tracking-wider mb-1" style={{ color: "rgba(255,255,255,0.50)" }}>{label}</div>
      <div className="text-[18px] font-bold leading-tight" style={{ color: valueColor, fontVariantNumeric: "tabular-nums" }}>{value}</div>
      {sub && <div className="text-[11px] mt-0.5" style={{ color: "rgba(255,255,255,0.45)" }}>{sub}</div>}
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wider mb-1" style={{ color: "rgba(26,16,8,0.55)" }}>{label}</div>
      <div className="text-[26px] font-bold" style={{ color: color || COLORS.ink, fontFamily: "'Playfair Display', serif", fontVariantNumeric: "tabular-nums" }}>{value}</div>
    </div>
  );
}

function ItcRow({ label, value, bg, color }: { label: string; value: string; bg: string; color: string }) {
  return (
    <div className="flex items-center justify-between rounded px-3 py-2" style={{ background: bg }}>
      <span className="text-[13px] font-medium" style={{ color }}>{label}</span>
      <span className="text-[14px] font-bold" style={{ color, fontVariantNumeric: "tabular-nums" }}>{value}</span>
    </div>
  );
}

function SimpleTable({ headers, rows, empty }: { headers: string[]; rows: any[][]; empty: string }) {
  if (!rows.length) return <EmptyHint text={empty} />;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-[11px] uppercase tracking-wider" style={{ color: "rgba(26,16,8,0.55)" }}>
            {headers.map(h => <th key={h} className="py-2 pr-4">{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} style={{ borderTop: `1px solid ${COLORS.divider}` }}>
              {r.map((c, j) => <td key={j} className="py-3 pr-4 align-middle">{c}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function EmptyHint({ text }: { text: string }) {
  return <div className="text-[13px] py-6 text-center" style={{ color: "rgba(26,16,8,0.45)" }}>{text}</div>;
}

function buildTopIssues({ runwayDays, itcAtRisk, overdueReceivables, mismatchCount, nextFiling }: any) {
  const issues: { title: string; body: string; color: string; tab: string }[] = [];
  if (runwayDays < 30) issues.push({ title: "Critical runway", body: `Cash will last only ${runwayDays} days at current burn.`, color: COLORS.red, tab: "Cash & Liquidity" });
  if (itcAtRisk > 0) issues.push({ title: "ITC at risk", body: `${formatIndianCurrency(itcAtRisk)} of ITC flagged across ${mismatchCount} mismatches.`, color: COLORS.red, tab: "GST & ITC" });
  if (overdueReceivables > 0) issues.push({ title: "Overdue receivables", body: `${formatIndianCurrency(overdueReceivables)} past due, chase customers.`, color: COLORS.amber, tab: "Receivables" });
  if (nextFiling) {
    const days = Math.ceil((new Date(nextFiling.due_date).getTime() - Date.now()) / 86400000);
    if (days <= 7) issues.push({ title: `${nextFiling.filing_name} due soon`, body: `Due in ${days} days (${formatIndianDate(nextFiling.due_date)}).`, color: days < 3 ? COLORS.red : COLORS.amber, tab: "Compliance" });
  }
  if (!issues.length) issues.push({ title: "All clear", body: "No critical issues detected for this client.", color: COLORS.green, tab: "Overview" });
  return issues.slice(0, 5);
}

function actionTone(t: string): "green" | "amber" | "red" | "blue" | "gold" | "gray" {
  if (t.includes("file") || t.includes("upload")) return "green";
  if (t.includes("delete")) return "red";
  if (t.includes("modif") || t.includes("edit")) return "amber";
  if (t.includes("view")) return "blue";
  return "gray";
}

function timeAgo(iso: string): string {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}
