import { useState, useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { formatINR, getDaysOverdueColor } from "@/lib/indian-format";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Link } from "react-router-dom";

const REFETCH_MS = 30000;

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const cashIn = payload.find((p: any) => p.dataKey === "cashIn")?.value || 0;
  const cashOut = payload.find((p: any) => p.dataKey === "cashOut")?.value || 0;
  const net = cashIn - cashOut;
  return (
    <div style={{ background: "#1A1008", borderRadius: 8, padding: "12px 16px", border: "none" }}>
      <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, marginBottom: 6 }}>{label}</p>
      <p style={{ color: "#4ADE80", fontSize: 14, fontWeight: 600 }}>In: ₹{cashIn.toLocaleString("en-IN")}</p>
      <p style={{ color: "#F87171", fontSize: 14, fontWeight: 600 }}>Out: ₹{cashOut.toLocaleString("en-IN")}</p>
      <p style={{ color: net >= 0 ? "#FFFFFF" : "#F87171", fontSize: 14, fontWeight: 600 }}>Net: ₹{net.toLocaleString("en-IN")}</p>
    </div>
  );
};

const EmptyHint = ({ text }: { text: string }) => (
  <p style={{ color: "rgba(26,16,8,0.45)", fontSize: 13, fontStyle: "italic" }}>{text}</p>
);

const CockpitPage = () => {
  const { businessId } = useAuth();
  const [nidhiInput, setNidhiInput] = useState("");

  // Bank balances
  const { data: bankAccounts = [], isLoading: bankLoading, error: bankError } = useQuery({
    queryKey: ["bank-accounts", businessId],
    queryFn: async () => {
      const { data, error } = await supabase.from("bank_accounts").select("balance").eq("business_id", businessId!);
      if (error) throw error;
      return data || [];
    },
    enabled: !!businessId,
    refetchInterval: REFETCH_MS,
  });

  // Transactions (last 180 days for chart, last 90 for burn)
  const { data: transactions = [], isLoading: txLoading } = useQuery({
    queryKey: ["transactions-180", businessId],
    queryFn: async () => {
      const since = new Date(Date.now() - 180 * 86400000).toISOString().slice(0, 10);
      const { data, error } = await supabase
        .from("transactions")
        .select("amount, direction, date")
        .eq("business_id", businessId!)
        .gte("date", since)
        .order("date", { ascending: true });
      if (error) throw error;
      return data || [];
    },
    enabled: !!businessId,
    refetchInterval: REFETCH_MS,
  });

  // Alerts
  const { data: alerts = [] } = useQuery({
    queryKey: ["alerts", businessId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("alerts")
        .select("*")
        .eq("business_id", businessId!)
        .eq("dismissed", false)
        .order("created_at", { ascending: false })
        .limit(3);
      if (error) throw error;
      return data || [];
    },
    enabled: !!businessId,
    refetchInterval: REFETCH_MS,
  });

  // Receivables (overdue, top 5)
  const { data: receivables = [], isLoading: recLoading } = useQuery({
    queryKey: ["receivables-top", businessId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("receivables")
        .select("*")
        .eq("business_id", businessId!)
        .eq("status", "outstanding")
        .order("due_date", { ascending: true })
        .limit(5);
      if (error) throw error;
      return data || [];
    },
    enabled: !!businessId,
    refetchInterval: REFETCH_MS,
  });

  // Compliance events (next 30 days)
  const { data: compliance = [] } = useQuery({
    queryKey: ["compliance-upcoming", businessId],
    queryFn: async () => {
      const today = new Date().toISOString().slice(0, 10);
      const in30 = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);
      const { data, error } = await supabase
        .from("compliance_events")
        .select("*")
        .eq("business_id", businessId!)
        .gte("due_date", today)
        .lte("due_date", in30)
        .order("due_date", { ascending: true })
        .limit(5);
      if (error) throw error;
      return data || [];
    },
    enabled: !!businessId,
    refetchInterval: REFETCH_MS,
  });

  // Payables (pending/overdue)
  const { data: payables = [] } = useQuery({
    queryKey: ["payables", businessId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payables")
        .select("*")
        .eq("business_id", businessId!)
        .in("status", ["pending", "overdue"]);
      if (error) throw error;
      return data || [];
    },
    enabled: !!businessId,
    refetchInterval: REFETCH_MS,
  });

  // GST ITC summary (latest period)
  const { data: itcRow } = useQuery({
    queryKey: ["itc-latest", businessId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("gst_itc_lines")
        .select("itc_safe, itc_at_risk, period")
        .eq("business_id", businessId!)
        .order("period", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!businessId,
  });

  // GST notice risk
  const { data: noticeRisk } = useQuery({
    queryKey: ["notice-risk", businessId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("gst_notice_risk_scores")
        .select("score")
        .eq("business_id", businessId!)
        .order("computed_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!businessId,
  });

  // Latest Nidhi brief
  const { data: brief } = useQuery({
    queryKey: ["nidhi-brief", businessId],
    queryFn: async () => {
      const { data } = await supabase
        .from("nidhi_briefs")
        .select("*")
        .eq("business_id", businessId!)
        .order("brief_date", { ascending: false })
        .limit(1)
        .maybeSingle();
      return data;
    },
    enabled: !!businessId,
  });

  // === Derived metrics ===
  const cashBalance = useMemo(
    () => bankAccounts.reduce((s, a: any) => s + Number(a.balance || 0), 0),
    [bankAccounts]
  );

  const { monthlyBurn, dailyBurn, runwayDays, cashFlowData } = useMemo(() => {
    const now = Date.now();
    const since90 = now - 90 * 86400000;
    let totalOut = 0;
    const buckets = new Map<string, { cashIn: number; cashOut: number }>();

    transactions.forEach((t: any) => {
      const ts = new Date(t.date).getTime();
      const amt = Number(t.amount) || 0;
      const isOut = t.direction === "debit" || t.direction === "out" || t.direction === "outflow";
      if (ts >= since90 && isOut) totalOut += amt;

      const key = new Date(t.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
      const b = buckets.get(key) || { cashIn: 0, cashOut: 0 };
      if (isOut) b.cashOut += amt;
      else b.cashIn += amt;
      buckets.set(key, b);
    });

    const monthly = totalOut / 3;
    const daily = totalOut / 90;
    const runway = daily > 0 ? cashBalance / daily : 0;
    const chart = Array.from(buckets.entries()).map(([date, v]) => ({ date, ...v }));
    return { monthlyBurn: monthly, dailyBurn: daily, runwayDays: runway, cashFlowData: chart };
  }, [transactions, cashBalance]);

  const totalPayables = useMemo(
    () => payables.reduce((s, p: any) => s + Number(p.outstanding || p.amount || 0), 0),
    [payables]
  );

  const dueThisWeek = useMemo(() => {
    const in7 = Date.now() + 7 * 86400000;
    return payables
      .filter((p: any) => p.due_date && new Date(p.due_date).getTime() <= in7)
      .reduce((s, p: any) => s + Number(p.outstanding || p.amount || 0), 0);
  }, [payables]);

  const receivablesOverdue = useMemo(() => {
    const now = Date.now();
    return receivables
      .filter((r: any) => r.due_date && new Date(r.due_date).getTime() < now)
      .reduce((s, r: any) => s + Number(r.outstanding || r.amount || 0), 0);
  }, [receivables]);

  const runwayColor = runwayDays >= 180 ? "#16A34A" : runwayDays >= 90 ? "#16A34A" : runwayDays >= 30 ? "#F59E0B" : "#DC2626";

  const alertStyles: Record<string, { bg: string; border: string; titleColor: string; ctaColor: string }> = {
    critical: { bg: "#FDEAEA", border: "#C41E1E", titleColor: "#C41E1E", ctaColor: "#C41E1E" },
    warning: { bg: "#FEF3E2", border: "#8B5A00", titleColor: "#8B5A00", ctaColor: "#8B5A00" },
    info: { bg: "#EAF0FB", border: "#1A4A8B", titleColor: "#1A4A8B", ctaColor: "#1A4A8B" },
  };

  const daysOverdue = (dueDate: string) => {
    const d = Math.floor((Date.now() - new Date(dueDate).getTime()) / 86400000);
    return d > 0 ? d : 0;
  };
  const getDaysLeft = (dateStr: string) =>
    Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000);

  const hasAnyData =
    bankAccounts.length > 0 ||
    transactions.length > 0 ||
    receivables.length > 0 ||
    payables.length > 0 ||
    alerts.length > 0;

  return (
    <DashboardLayout>
      {/* AI CFO Nidhi header */}
      <div className="rounded-xl p-5 mb-6 flex items-center justify-between" style={{ background: "#1A1008" }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" style={{ background: "#C41E1E" }}>N</div>
          <div>
            <p className="text-white font-serif text-lg">Good morning. Here's your business today.</p>
            <p style={{ color: "#8B6914", fontSize: 13 }}>{brief ? `Last brief: ${new Date(brief.created_at).toLocaleString("en-IN")}` : "No brief yet"}</p>
          </div>
        </div>
        <Link to="/dashboard/nidhi" className="text-white text-[14px] font-medium px-4 py-2 rounded-lg hover-btn-primary" style={{ background: "#C41E1E" }}>
          Ask AI CFO Nidhi →
        </Link>
      </div>

      {bankError && (
        <div className="rounded-lg mb-6 p-4" style={{ background: "#FDEAEA", border: "1px solid #C41E1E", color: "#C41E1E", fontSize: 14 }}>
          Unable to load data. Please refresh.
        </div>
      )}

      {!hasAnyData && !bankLoading && !txLoading && !recLoading && (
        <div className="rounded-lg mb-6 p-6 text-center" style={{ background: "#FFFFFF", border: "1px dashed rgba(26,16,8,0.2)" }}>
          <p style={{ color: "#1A1008", fontSize: 16, fontWeight: 600, marginBottom: 6 }}>No data yet</p>
          <p style={{ color: "rgba(26,16,8,0.6)", fontSize: 14, marginBottom: 14 }}>Connect a bank account or import transactions to see your cockpit come alive.</p>
          <Link to="/dashboard/banking" className="inline-block text-white px-4 py-2 rounded-lg" style={{ background: "#C41E1E", fontSize: 14, fontWeight: 500 }}>
            Connect Bank →
          </Link>
        </div>
      )}

      {/* Alert strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {alerts.length === 0 && (
          <div className="md:col-span-3 rounded-lg p-4" style={{ background: "#FFFFFF", border: "1px solid rgba(26,16,8,0.10)" }}>
            <EmptyHint text="No active alerts." />
          </div>
        )}
        {alerts.map((a: any) => {
          const s = alertStyles[a.severity] || alertStyles.info;
          return (
            <div
              key={a.id}
              className="rounded-lg transition-all duration-250 hover:-translate-y-0.5 hover:shadow-lg cursor-pointer"
              style={{ background: s.bg, borderLeft: `4px solid ${s.border}`, padding: "16px 20px", minHeight: 72 }}
            >
              <div className="flex items-start justify-between">
                <p style={{ color: s.titleColor, fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{a.title}</p>
                {a.severity === "critical" && <span className="w-2.5 h-2.5 rounded-full pulse-ring flex-shrink-0 mt-1" style={{ background: "#C41E1E" }} />}
              </div>
              <p style={{ color: "#1A1008", fontSize: 13, marginBottom: 8, opacity: 0.8 }}>{a.body}</p>
              {a.action_url && (
                <Link to={a.action_url} style={{ color: s.ctaColor, fontSize: 13, fontWeight: 500, textDecoration: "underline" }}>
                  {a.severity === "critical" ? "Fix Now →" : a.severity === "warning" ? "Review →" : "View →"}
                </Link>
              )}
            </div>
          );
        })}
      </div>

      {/* Quick shortcut: Data Import — Bloomberg/data-dense */}
      <Link
        to="/dashboard/data-import"
        className="group block mb-6 transition-all duration-150 hover:-translate-y-px"
        style={{
          background: "hsl(var(--fyn-beige-card))",
          border: "1px solid hsl(var(--fyn-ink-10))",
          borderLeft: "3px solid hsl(var(--fyn-red))",
        }}
      >
        <div className="flex items-stretch">
          {/* Mono label rail */}
          <div
            className="flex items-center px-3 font-mono"
            style={{
              background: "hsl(var(--fyn-ink))",
              color: "hsl(var(--fyn-beige))",
              fontSize: 10,
              letterSpacing: "0.18em",
            }}
          >
            DATA · IMPORT
          </div>

          {/* Body */}
          <div className="flex-1 flex items-center justify-between px-4 py-3 gap-6">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="w-9 h-9 flex items-center justify-center flex-shrink-0"
                style={{
                  background: "hsl(var(--fyn-red) / 0.08)",
                  border: "1px solid hsl(var(--fyn-red) / 0.25)",
                  color: "hsl(var(--fyn-red))",
                }}
                aria-hidden
              >
                {/* Brand import glyph: tray + arrow-in */}
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="square"
                  strokeLinejoin="miter"
                >
                  <path d="M12 3v11" />
                  <path d="M7 9l5 5 5-5" />
                  <path d="M4 17v3h16v-3" />
                </svg>
              </div>

              <div className="min-w-0">
                <h3
                  className="font-serif truncate"
                  style={{
                    color: "hsl(var(--fyn-ink))",
                    fontSize: 16,
                    fontWeight: 600,
                    lineHeight: 1.2,
                    letterSpacing: "-0.005em",
                  }}
                >
                  Import Data
                </h3>
                <p
                  className="font-mono truncate fyn-label"
                  style={{
                    color: "hsl(var(--fyn-ink) / 0.55)",
                    fontSize: 10,
                    letterSpacing: "0.18em",
                    marginTop: 4,
                    textTransform: "uppercase",
                  }}
                >
                  Bank · Invoices · Expenses &nbsp;·&nbsp; CSV / XLSX
                </p>
              </div>
            </div>

            {/* Right-side stats + CTA */}
            <div className="hidden md:flex items-center gap-6">
              <div className="text-right">
                <p
                  className="font-mono fyn-label"
                  style={{
                    color: "hsl(var(--fyn-ink) / 0.40)",
                    fontSize: 10,
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                  }}
                >
                  Formats
                </p>
                <p
                  className="font-mono"
                  style={{
                    color: "hsl(var(--fyn-ink))",
                    fontSize: 13,
                    fontWeight: 600,
                    marginTop: 2,
                    letterSpacing: "0.02em",
                  }}
                >
                  .csv · .xlsx
                </p>
              </div>

              <div
                className="flex items-center gap-2 px-3 py-1.5 font-mono fyn-label transition-colors"
                style={{
                  background: "hsl(var(--fyn-red) / 0.08)",
                  border: "1px solid hsl(var(--fyn-red))",
                  color: "hsl(var(--fyn-red))",
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                }}
              >
                Open <span className="transition-transform group-hover:translate-x-0.5">→</span>
              </div>
            </div>
          </div>
        </div>
      </Link>

      {/* Key metrics row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Cash in Bank */}
        <div className="rounded-lg" style={{ background: "#1A1008", padding: "20px 24px" }}>
          <p style={{ color: "rgba(255,255,255,0.50)", fontSize: 11, fontWeight: 500, letterSpacing: "0.10em", textTransform: "uppercase" }}>CASH IN BANK</p>
          <p style={{ color: "#FFFFFF", fontSize: 36, fontWeight: 700, marginTop: 4 }}>
            {bankLoading ? "…" : formatINR(cashBalance)}
          </p>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, marginTop: 4 }}>{bankAccounts.length} account{bankAccounts.length === 1 ? "" : "s"}</p>
        </div>

        {/* Runway */}
        <div className="rounded-lg" style={{ background: "#1A1008", padding: "20px 24px" }}>
          <p style={{ color: "rgba(255,255,255,0.50)", fontSize: 11, fontWeight: 500, letterSpacing: "0.10em", textTransform: "uppercase" }}>RUNWAY</p>
          <p style={{ color: runwayColor, fontSize: 36, fontWeight: 700, marginTop: 4 }}>
            {dailyBurn > 0 ? `${runwayDays.toFixed(0)} days` : "—"}
          </p>
          <p style={{ color: "rgba(255,255,255,0.60)", fontSize: 12, marginTop: 4 }}>
            At {dailyBurn > 0 ? formatINR(Math.round(dailyBurn)) : "₹0"} daily burn
          </p>
          <div style={{ marginTop: 8, height: 4, background: "rgba(255,255,255,0.10)", borderRadius: 2 }}>
            <div style={{ height: 4, background: runwayColor, borderRadius: 2, width: `${Math.min(100, (runwayDays / 180) * 100)}%` }} />
          </div>
        </div>

        {/* Receivables Overdue */}
        <div className="rounded-lg" style={{ background: "#1A1008", padding: "20px 24px" }}>
          <p style={{ color: "rgba(255,255,255,0.50)", fontSize: 11, fontWeight: 500, letterSpacing: "0.10em", textTransform: "uppercase" }}>RECEIVABLES OVERDUE</p>
          <p style={{ color: receivablesOverdue > 0 ? "#F87171" : "#FFFFFF", fontSize: 36, fontWeight: 700, marginTop: 4 }}>{formatINR(receivablesOverdue)}</p>
          <p style={{ color: "rgba(255,255,255,0.60)", fontSize: 12, marginTop: 4 }}>{receivables.filter((r: any) => r.due_date && new Date(r.due_date).getTime() < Date.now()).length} customers</p>
        </div>

        {/* Due This Week */}
        <div className="rounded-lg" style={{ background: "#1A1008", padding: "20px 24px" }}>
          <p style={{ color: "rgba(255,255,255,0.50)", fontSize: 11, fontWeight: 500, letterSpacing: "0.10em", textTransform: "uppercase" }}>PAYABLES DUE / 7D</p>
          <p style={{ color: "#FFFFFF", fontSize: 36, fontWeight: 700, marginTop: 4 }}>{formatINR(dueThisWeek)}</p>
          <p style={{ color: "rgba(255,255,255,0.60)", fontSize: 12, marginTop: 4 }}>Total payables: {formatINR(totalPayables)}</p>
        </div>
      </div>

      {/* Two columns */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left - 60% */}
        <div className="lg:col-span-3 space-y-6">
          {/* Cash flow chart */}
          <div className="rounded-lg p-5" style={{ background: "#FFFFFF", border: "1px solid rgba(26,16,8,0.10)" }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-fyn-ink font-serif text-2xl" style={{ fontSize: 15 }}>Cash Flow — Last 180 Days</h3>
            </div>
            {cashFlowData.length === 0 ? (
              <div style={{ height: 280 }} className="flex items-center justify-center">
                <EmptyHint text="No transactions yet. Cash flow chart will appear once data is imported." />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={cashFlowData}>
                  <defs>
                    <linearGradient id="ckGreen" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#16A34A" stopOpacity={0.15} />
                      <stop offset="100%" stopColor="#16A34A" stopOpacity={0.01} />
                    </linearGradient>
                    <linearGradient id="ckRed" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#DC2626" stopOpacity={0.12} />
                      <stop offset="100%" stopColor="#DC2626" stopOpacity={0.01} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: "rgba(26,16,8,0.45)" }} interval={Math.max(0, Math.floor(cashFlowData.length / 10))} />
                  <YAxis tick={{ fontSize: 11, fill: "rgba(26,16,8,0.45)" }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="cashIn" stroke="#16A34A" strokeWidth={2} fill="url(#ckGreen)" />
                  <Area type="monotone" dataKey="cashOut" stroke="#DC2626" strokeWidth={2} fill="url(#ckRed)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
            <div className="flex gap-6 mt-3">
              <span className="flex items-center gap-1.5" style={{ fontSize: 13 }}>
                <span className="inline-block w-3 h-3 rounded-sm" style={{ background: "#16A34A" }} /> Money In
              </span>
              <span className="flex items-center gap-1.5" style={{ fontSize: 13 }}>
                <span className="inline-block w-3 h-3 rounded-sm" style={{ background: "#DC2626" }} /> Money Out
              </span>
            </div>
          </div>

          {/* Receivables table */}
          <div className="rounded-lg p-5" style={{ background: "#FFFFFF", border: "1px solid rgba(26,16,8,0.10)" }}>
            <h3 className="text-fyn-ink font-serif mb-4" style={{ fontSize: 15 }}>Top Outstanding Receivables</h3>
            {receivables.length === 0 ? (
              <EmptyHint text="No outstanding receivables." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ borderBottom: "1px solid rgba(26,16,8,0.10)" }}>
                      <th className="text-left py-2" style={{ fontSize: 12, color: "rgba(26,16,8,0.45)", textTransform: "uppercase", fontWeight: 500 }}>Customer</th>
                      <th className="text-left py-2" style={{ fontSize: 12, color: "rgba(26,16,8,0.45)", textTransform: "uppercase", fontWeight: 500 }}>Invoice</th>
                      <th className="text-right py-2" style={{ fontSize: 12, color: "rgba(26,16,8,0.45)", textTransform: "uppercase", fontWeight: 500 }}>Amount</th>
                      <th className="text-right py-2" style={{ fontSize: 12, color: "rgba(26,16,8,0.45)", textTransform: "uppercase", fontWeight: 500 }}>Days Overdue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {receivables.map((r: any, i: number) => {
                      const days = daysOverdue(r.due_date || "");
                      return (
                        <tr key={r.id} style={{ borderBottom: "1px solid rgba(26,16,8,0.06)", background: i % 2 === 0 ? "#FFFFFF" : "#FAF7F0" }}>
                          <td className="py-3" style={{ fontSize: 14, fontWeight: 600, color: "#1A1008" }}>{r.customer_name}</td>
                          <td className="py-3" style={{ fontSize: 13, color: "rgba(26,16,8,0.50)" }}>{r.invoice_number || "—"}</td>
                          <td className="py-3 text-right fyn-metric" style={{ fontSize: 14 }}>{formatINR(r.outstanding || r.amount)}</td>
                          <td className={`py-3 text-right fyn-metric ${getDaysOverdueColor(days)}`} style={{ fontSize: 14 }}>{days > 0 ? `${days}d` : "Current"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            <Link to="/dashboard/receivables" style={{ color: "#C41E1E", fontSize: 14, fontWeight: 500 }} className="hover:underline mt-3 inline-block">View all receivables →</Link>
          </div>
        </div>

        {/* Right - 40% */}
        <div className="lg:col-span-2 space-y-6">
          {/* Runway gauge */}
          <div className="rounded-lg p-5 text-center" style={{ background: "#FFFFFF", border: "1px solid rgba(26,16,8,0.10)" }}>
            <h3 className="text-fyn-ink font-serif mb-4" style={{ fontSize: 15 }}>Cash Runway</h3>
            <div className="relative mx-auto" style={{ width: 280, height: 160 }}>
              <svg viewBox="0 0 280 160" className="w-full">
                <path d="M 20 145 A 120 120 0 0 1 53 35" fill="none" stroke="#DC2626" strokeWidth="20" strokeLinecap="round" />
                <path d="M 53 35 A 120 120 0 0 1 227 35" fill="none" stroke="#F59E0B" strokeWidth="20" strokeLinecap="round" />
                <path d="M 227 35 A 120 120 0 0 1 260 145" fill="none" stroke="#16A34A" strokeWidth="20" strokeLinecap="round" />
                {(() => {
                  const capped = Math.min(Math.max(runwayDays, 0), 180);
                  const angle = Math.PI * (1 - capped / 180);
                  const nx = 140 + 90 * Math.cos(angle);
                  const ny = 145 - 90 * Math.sin(angle);
                  return (
                    <>
                      <line x1="140" y1="145" x2={nx} y2={ny} stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
                      <circle cx="140" cy="145" r="6" fill="#1A1008" stroke="white" strokeWidth="2" />
                    </>
                  );
                })()}
              </svg>
            </div>
            <p style={{ color: runwayColor, fontSize: 56, fontWeight: 700, lineHeight: 1 }}>
              {dailyBurn > 0 ? runwayDays.toFixed(0) : "—"}
            </p>
            <p style={{ color: "rgba(26,16,8,0.50)", fontSize: 14, marginTop: 4 }}>days of runway</p>
            <p style={{ color: "#8B6914", fontSize: 12, marginTop: 2 }}>
              Monthly burn: {monthlyBurn > 0 ? formatINR(Math.round(monthlyBurn)) : "—"}
            </p>
          </div>

          {/* Nidhi insight */}
          <div className="rounded-[10px]" style={{ background: "#1A1008", padding: "20px 24px" }}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold" style={{ background: "#C41E1E", fontSize: 16 }}>N</div>
              <p className="text-white" style={{ fontSize: 14, fontWeight: 600 }}>AI CFO Nidhi's read on today</p>
            </div>
            <p style={{ color: "rgba(255,255,255,0.85)", fontSize: 14, lineHeight: 1.75, marginTop: 12 }}>
              {brief?.content || "No brief generated yet. Ask Nidhi a question to get started."}
            </p>
            <div className="flex gap-2 mt-[14px]">
              <input
                value={nidhiInput}
                onChange={e => setNidhiInput(e.target.value)}
                placeholder="Ask AI CFO Nidhi a follow-up..."
                className="flex-1 outline-none"
                style={{ height: 40, padding: "10px 14px", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.20)", borderRadius: 6, color: "#FFFFFF", fontSize: 13 }}
              />
              <button className="transition-all hover:brightness-90" style={{ width: 40, height: 40, background: "#C41E1E", borderRadius: 6, color: "#FFFFFF", fontSize: 16, fontWeight: 700 }}>→</button>
            </div>
          </div>

          {/* Filing Calendar */}
          <div className="rounded-lg p-5" style={{ background: "#FFFFFF", border: "1px solid rgba(26,16,8,0.10)" }}>
            <h3 className="text-fyn-ink font-serif mb-3" style={{ fontSize: 15 }}>Filing Calendar (Next 30 days)</h3>
            {compliance.length === 0 ? (
              <EmptyHint text="No upcoming filings in the next 30 days." />
            ) : (
              <div className="space-y-1">
                {compliance.map((c: any) => {
                  const daysLeft = getDaysLeft(c.due_date);
                  const dotColor = daysLeft <= 3 ? "#DC2626" : daysLeft <= 7 ? "#F59E0B" : daysLeft <= 14 ? "#8B6914" : "rgba(26,16,8,0.30)";
                  const badgeBg = daysLeft <= 3 ? "#FDEAEA" : daysLeft <= 7 ? "#FEF3E2" : "rgba(26,16,8,0.06)";
                  const badgeColor = daysLeft <= 3 ? "#C41E1E" : daysLeft <= 7 ? "#8B5A00" : "rgba(26,16,8,0.50)";
                  return (
                    <div key={c.id} className="flex items-center gap-3 rounded-lg" style={{ padding: "8px 10px", height: 36 }}>
                      <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${daysLeft <= 3 ? "pulse-ring" : ""}`} style={{ background: dotColor }} />
                      <span className="flex-1" style={{ color: "#1A1008", fontSize: 13, fontWeight: 500 }}>{c.filing_name}</span>
                      <span style={{ fontSize: 12, color: "rgba(26,16,8,0.60)" }}>{c.due_date}</span>
                      <span className="rounded-full fyn-metric" style={{ background: badgeBg, color: badgeColor, fontSize: 12, fontWeight: daysLeft <= 3 ? 700 : 500, padding: "2px 8px" }}>{daysLeft > 0 ? `${daysLeft}d` : "Due"}</span>
                    </div>
                  );
                })}
              </div>
            )}
            <Link to="/dashboard/filing-calendar" style={{ color: "#C41E1E", fontSize: 14, fontWeight: 500 }} className="hover:underline mt-3 inline-block">View full calendar →</Link>
          </div>

          {/* GST Health */}
          <div className="rounded-lg p-5" style={{ background: "#FFFFFF", border: "1px solid rgba(26,16,8,0.10)" }}>
            <h3 className="text-fyn-ink font-serif mb-3" style={{ fontSize: 15 }}>GST Health</h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center rounded-lg" style={{ background: "#DCFCE7", padding: "12px 8px" }}>
                <p className="fyn-metric" style={{ color: "#16A34A", fontSize: 20, fontWeight: 700 }}>{formatINR(Number(itcRow?.itc_safe || 0))}</p>
                <p style={{ color: "#16A34A", fontSize: 11, fontWeight: 500, textTransform: "uppercase", marginTop: 4 }}>ITC SAFE</p>
              </div>
              <div className="text-center rounded-lg" style={{ background: "#FDEAEA", border: "1px solid #C41E1E", padding: "12px 8px" }}>
                <p className="fyn-metric" style={{ color: "#C41E1E", fontSize: 20, fontWeight: 700 }}>{formatINR(Number(itcRow?.itc_at_risk || 0))}</p>
                <p style={{ color: "#C41E1E", fontSize: 11, fontWeight: 600, textTransform: "uppercase", marginTop: 4 }}>ITC AT RISK</p>
              </div>
              <div className="text-center rounded-lg" style={{ background: "#FEF3E2", padding: "12px 8px" }}>
                <p className="fyn-metric" style={{ color: "#F59E0B", fontSize: 20, fontWeight: 700 }}>{noticeRisk?.score ?? "—"}{noticeRisk ? "/100" : ""}</p>
                <p style={{ color: "rgba(26,16,8,0.50)", fontSize: 11, fontWeight: 500, textTransform: "uppercase", marginTop: 4 }}>NOTICE RISK</p>
              </div>
            </div>
            <Link to="/dashboard/gst" style={{ color: "#C41E1E", fontSize: 14, fontWeight: 500 }} className="hover:underline mt-3 inline-block">View GST Intelligence →</Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CockpitPage;
