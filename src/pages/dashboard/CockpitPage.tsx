import { useState, useMemo, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { formatINR, getDaysOverdueColor } from "@/lib/indian-format";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  FynCard,
  FynButton,
  FynBadge,
  FynTable,
  FynTH,
  FynTR,
  FynTD,
  FynLabel,
  FynInput,
  FynSearchInput,
  FynSelect,
} from "@/components/dashboard/ui";

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
  <p className="text-fyn-ink/45 text-fyn-small italic">{text}</p>
);

type ReceivablesFilter = "all" | "overdue" | "current";

const CockpitPage = () => {
  const { businessId } = useAuth();
  const queryClient = useQueryClient();
  const [nidhiInput, setNidhiInput] = useState("");
  const [recSearch, setRecSearch] = useState("");
  const [recFilter, setRecFilter] = useState<ReceivablesFilter>("all");

  // Live updates: subscribe to row changes for this business and invalidate
  // the matching React Query caches so the cockpit refreshes instantly when
  // invoices, payments, alerts, or bank balances change.
  useEffect(() => {
    if (!businessId) return;

    const filter = `business_id=eq.${businessId}`;
    const subs: { table: string; queryKey: string }[] = [
      { table: "receivables", queryKey: "receivables-top" },
      { table: "payables", queryKey: "payables" },
      { table: "alerts", queryKey: "alerts" },
      { table: "bank_accounts", queryKey: "bank-accounts" },
      { table: "transactions", queryKey: "transactions-180" },
      { table: "compliance_events", queryKey: "compliance-upcoming" },
    ];

    const channelName = `cockpit-live-${businessId}`;
    const channel = supabase.channel(channelName);
    subs.forEach(({ table, queryKey }) => {
      channel.on(
        "postgres_changes" as never,
        { event: "*", schema: "public", table, filter },
        (payload: any) => {
          // Audit first (fire-and-forget), then refresh caches.
          void logRealtimeEvent({
            channel_name: channelName,
            table_name: table,
            event_type: (payload?.eventType ?? "*") as
              | "INSERT" | "UPDATE" | "DELETE" | "*",
            business_id: businessId,
            row_id:
              (payload?.new as any)?.id ?? (payload?.old as any)?.id ?? null,
            context: { queryKey },
            handler_status: "invalidated",
          });
          queryClient.invalidateQueries({ queryKey: [queryKey, businessId] });
        }
      );
    });
    channel.subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [businessId, queryClient]);


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

  // Receivables (outstanding, top 5 — filtered/searched client-side below)
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

  const daysOverdue = (dueDate: string) => {
    const d = Math.floor((Date.now() - new Date(dueDate).getTime()) / 86400000);
    return d > 0 ? d : 0;
  };
  const getDaysLeft = (dateStr: string) =>
    Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000);

  // Filtered + searched receivables for the table
  const visibleReceivables = useMemo(() => {
    const q = recSearch.trim().toLowerCase();
    return receivables.filter((r: any) => {
      const days = daysOverdue(r.due_date || "");
      if (recFilter === "overdue" && days <= 0) return false;
      if (recFilter === "current" && days > 0) return false;
      if (!q) return true;
      const hay = `${r.customer_name || ""} ${r.invoice_number || ""}`.toLowerCase();
      return hay.includes(q);
    });
  }, [receivables, recSearch, recFilter]);

  const hasAnyData =
    bankAccounts.length > 0 ||
    transactions.length > 0 ||
    receivables.length > 0 ||
    payables.length > 0 ||
    alerts.length > 0;

  // Alert severity → FynBadge tone
  const alertTone = (sev: string): "danger" | "warning" | "neutral" =>
    sev === "critical" ? "danger" : sev === "warning" ? "warning" : "neutral";
  const alertAccent: Record<string, { bg: string; border: string; titleColor: string; ctaColor: string }> = {
    critical: { bg: "#FDEAEA", border: "#C41E1E", titleColor: "#C41E1E", ctaColor: "#C41E1E" },
    warning: { bg: "#FEF3E2", border: "#8B5A00", titleColor: "#8B5A00", ctaColor: "#8B5A00" },
    info: { bg: "#EAF0FB", border: "#1A4A8B", titleColor: "#1A4A8B", ctaColor: "#1A4A8B" },
  };

  return (
    <DashboardLayout>
      {/* AI CFO Nidhi header — intentional dark hero (out of FynCard scope) */}
      <div className="rounded-xl p-5 mb-fyn-md flex items-center justify-between bg-fyn-ink">
        <div className="flex items-center gap-fyn-sm">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold bg-fyn-red">N</div>
          <div>
            <p className="text-white font-serif text-lg">Good morning. Here's your business today.</p>
            <p className="text-fyn-tiny" style={{ color: "#8B6914" }}>
              {brief ? `Last brief: ${new Date(brief.created_at).toLocaleString("en-IN")}` : "No brief yet"}
            </p>
          </div>
        </div>
        <Link
          to="/dashboard/nidhi"
          className="inline-flex items-center gap-2 px-4 py-2 text-fyn-body font-medium rounded-md bg-fyn-red text-white hover:bg-fyn-red-dark transition-colors"
        >
          Ask AI CFO Nidhi →
        </Link>
      </div>

      {bankError && (
        <FynCard className="mb-fyn-md border-l-4 border-l-fyn-red bg-[#FDEAEA] text-[#C41E1E] text-fyn-small">
          Unable to load data. Please refresh.
        </FynCard>
      )}

      {!hasAnyData && !bankLoading && !txLoading && !recLoading && (
        <FynCard className="mb-fyn-md text-center border-dashed">
          <p className="text-fyn-ink text-base font-semibold mb-1.5">No data yet</p>
          <p className="text-fyn-ink/60 text-fyn-small mb-fyn-md">
            Connect a bank account or import transactions to see your cockpit come alive.
          </p>
          <Link
            to="/dashboard/banking"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-fyn-body font-medium rounded-md bg-fyn-red text-white hover:bg-fyn-red-dark transition-colors"
          >
            Connect Bank →
          </Link>
        </FynCard>
      )}

      {/* Alert strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-fyn-md mb-fyn-md">
        {alerts.length === 0 && (
          <FynCard className="md:col-span-3">
            <EmptyHint text="No active alerts." />
          </FynCard>
        )}
        {alerts.map((a: any) => {
          const s = alertAccent[a.severity] || alertAccent.info;
          return (
            <div
              key={a.id}
              className="rounded-lg transition-all duration-250 hover:-translate-y-0.5 hover:shadow-lg cursor-pointer"
              style={{ background: s.bg, borderLeft: `4px solid ${s.border}`, padding: "16px 20px", minHeight: 72 }}
            >
              <div className="flex items-start justify-between mb-fyn-xs">
                <p className="text-fyn-small font-semibold" style={{ color: s.titleColor }}>{a.title}</p>
                <FynBadge tone={alertTone(a.severity)}>{a.severity}</FynBadge>
              </div>
              <p className="text-fyn-ink text-fyn-small opacity-80 mb-fyn-sm">{a.body}</p>
              {a.action_url && (
                <Link to={a.action_url} className="text-fyn-small font-medium underline" style={{ color: s.ctaColor }}>
                  {a.severity === "critical" ? "Fix Now →" : a.severity === "warning" ? "Review →" : "View →"}
                </Link>
              )}
            </div>
          );
        })}
      </div>

      {/* Quick shortcut: Data Import — Bloomberg/data-dense (intentional bespoke) */}
      <Link
        to="/dashboard/data-import"
        className="group block mb-fyn-md outline-none
                   border border-l-[3px]
                   border-[hsl(var(--fyn-ink-10))] border-l-[hsl(var(--fyn-red))]
                   bg-[hsl(var(--fyn-beige-card))]
                   transition-[transform,box-shadow,background-color,border-color] duration-200 ease-out
                   hover:-translate-y-px
                   hover:bg-[hsl(var(--fyn-beige-deep))]
                   hover:border-[hsl(var(--fyn-ink-20))]
                   hover:border-l-[hsl(var(--fyn-red-dark))]
                   hover:shadow-[0_4px_0_-2px_hsl(var(--fyn-red)/0.18),0_8px_20px_-12px_hsl(var(--fyn-ink)/0.25)]
                   focus-visible:ring-2 focus-visible:ring-[hsl(var(--fyn-red))]
                   focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--fyn-beige))]
                   active:translate-y-0 active:shadow-none active:bg-[hsl(var(--fyn-beige-dark))]"
      >
        <div className="flex items-stretch">
          <div className="hidden sm:flex items-center px-3 fyn-label bg-[hsl(var(--fyn-ink))] text-[hsl(var(--fyn-beige))]">
            Data · Import
          </div>
          <div className="flex-1 flex items-center justify-between px-4 py-3 gap-4 md:gap-6">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="w-9 h-9 flex items-center justify-center flex-shrink-0
                           bg-[hsl(var(--fyn-beige))]
                           border border-[hsl(var(--fyn-ink))]
                           shadow-[inset_0_-2px_0_0_hsl(var(--fyn-red))]
                           text-[hsl(var(--fyn-red))]"
                aria-hidden
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter" shapeRendering="crispEdges">
                  <path d="M12 3v11" />
                  <path d="M7 9l5 5 5-5" />
                  <path d="M4 18v2h16v-2" />
                </svg>
              </div>
              <div className="min-w-0">
                <h3 className="font-serif font-bold truncate text-[18px] leading-[1.2] text-[hsl(var(--fyn-ink))]">
                  Import Data
                </h3>
                <p className="truncate mt-1 text-[14px] leading-[1.5] text-[hsl(var(--fyn-ink)/0.60)]">
                  Bank statements, invoices, and expenses — CSV or XLSX
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 md:gap-6 flex-shrink-0">
              <div className="hidden md:block text-right">
                <p className="fyn-label text-[hsl(var(--fyn-ink)/0.40)]">Formats</p>
                <p className="fyn-mono mt-1 font-semibold text-[hsl(var(--fyn-ink))]">.csv · .xlsx</p>
              </div>
              <span aria-hidden className="hidden md:inline-block w-px h-8 bg-[hsl(var(--fyn-ink-10))]" />
              <div
                className="flex items-center gap-1.5 md:gap-2 px-2 py-1 md:px-3 md:py-1.5
                           fyn-label
                           bg-[hsl(var(--fyn-red)/0.08)] text-[hsl(var(--fyn-red))]
                           border border-[hsl(var(--fyn-red))]
                           transition-colors"
                aria-label="Open Data Import"
              >
                <span className="hidden sm:inline">Open</span>
                <span className="transition-transform group-hover:translate-x-0.5">→</span>
              </div>
            </div>
          </div>
        </div>
      </Link>

      {/* Key metrics row — 4 dark KPI tiles (intentional Bloomberg variant; FynCard is light-surface only) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-fyn-md mb-fyn-md">
        {/* Cash in Bank */}
        <div className="rounded-lg bg-fyn-ink px-6 py-5">
          <p className="text-white/50 text-[11px] font-medium tracking-[0.10em] uppercase">CASH IN BANK</p>
          <p className="text-white text-[36px] font-bold mt-1">{bankLoading ? "…" : formatINR(cashBalance)}</p>
          <p className="text-white/60 text-fyn-tiny mt-1">{bankAccounts.length} account{bankAccounts.length === 1 ? "" : "s"}</p>
        </div>

        {/* Runway */}
        <div className="rounded-lg bg-fyn-ink px-6 py-5">
          <p className="text-white/50 text-[11px] font-medium tracking-[0.10em] uppercase">RUNWAY</p>
          <p className="text-[36px] font-bold mt-1" style={{ color: runwayColor }}>
            {dailyBurn > 0 ? `${runwayDays.toFixed(0)} days` : "—"}
          </p>
          <p className="text-white/60 text-fyn-tiny mt-1">
            At {dailyBurn > 0 ? formatINR(Math.round(dailyBurn)) : "₹0"} daily burn
          </p>
          <div className="mt-2 h-1 bg-white/10 rounded-sm">
            <div className="h-1 rounded-sm" style={{ background: runwayColor, width: `${Math.min(100, (runwayDays / 180) * 100)}%` }} />
          </div>
        </div>

        {/* Receivables Overdue */}
        <div className="rounded-lg bg-fyn-ink px-6 py-5">
          <p className="text-white/50 text-[11px] font-medium tracking-[0.10em] uppercase">RECEIVABLES OVERDUE</p>
          <p className="text-[36px] font-bold mt-1" style={{ color: receivablesOverdue > 0 ? "#F87171" : "#FFFFFF" }}>{formatINR(receivablesOverdue)}</p>
          <p className="text-white/60 text-fyn-tiny mt-1">
            {receivables.filter((r: any) => r.due_date && new Date(r.due_date).getTime() < Date.now()).length} customers
          </p>
        </div>

        {/* Due This Week */}
        <div className="rounded-lg bg-fyn-ink px-6 py-5">
          <p className="text-white/50 text-[11px] font-medium tracking-[0.10em] uppercase">PAYABLES DUE / 7D</p>
          <p className="text-white text-[36px] font-bold mt-1">{formatINR(dueThisWeek)}</p>
          <p className="text-white/60 text-fyn-tiny mt-1">Total payables: {formatINR(totalPayables)}</p>
        </div>
      </div>

      {/* Two columns */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-fyn-lg">
        {/* Left - 60% */}
        <div className="lg:col-span-3 space-y-fyn-lg">
          {/* Cash flow chart */}
          <FynCard>
            <div className="flex items-center justify-between mb-fyn-md">
              <h3 className="text-fyn-ink font-serif text-fyn-h3">Cash Flow — Last 180 Days</h3>
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
            <div className="flex gap-fyn-lg mt-fyn-sm text-fyn-small">
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-3 h-3 rounded-sm" style={{ background: "#16A34A" }} /> Money In
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-3 h-3 rounded-sm" style={{ background: "#DC2626" }} /> Money Out
              </span>
            </div>
          </FynCard>

          {/* Receivables table */}
          <FynCard>
            <div className="flex items-center justify-between mb-fyn-md gap-fyn-sm flex-wrap">
              <h3 className="text-fyn-ink font-serif text-fyn-h3">Top Outstanding Receivables</h3>
              <div className="flex items-center gap-fyn-sm">
                <div className="w-56">
                  <FynSearchInput
                    value={recSearch}
                    onChange={(e) => setRecSearch(e.target.value)}
                    placeholder="Search customer or invoice…"
                  />
                </div>
                <FynSelect
                  value={recFilter}
                  onChange={(e) => setRecFilter(e.target.value as ReceivablesFilter)}
                  className="w-40"
                  aria-label="Filter receivables"
                >
                  <option value="all">All</option>
                  <option value="overdue">Overdue only</option>
                  <option value="current">Current only</option>
                </FynSelect>
              </div>
            </div>
            {receivables.length === 0 ? (
              <EmptyHint text="No outstanding receivables." />
            ) : visibleReceivables.length === 0 ? (
              <EmptyHint text="No receivables match your filter." />
            ) : (
              <FynTable>
                <thead>
                  <FynTR className="hover:bg-transparent">
                    <FynTH>Customer</FynTH>
                    <FynTH>Invoice</FynTH>
                    <FynTH align="right">Amount</FynTH>
                    <FynTH align="right">Days Overdue</FynTH>
                  </FynTR>
                </thead>
                <tbody>
                  {visibleReceivables.map((r: any) => {
                    const days = daysOverdue(r.due_date || "");
                    return (
                      <FynTR key={r.id}>
                        <FynTD className="text-fyn-ink font-semibold">{r.customer_name}</FynTD>
                        <FynTD>{r.invoice_number || "—"}</FynTD>
                        <FynTD align="right" mono>{formatINR(r.outstanding || r.amount)}</FynTD>
                        <FynTD align="right" mono className={cn("text-fyn-small", getDaysOverdueColor(days))}>
                          {days > 0 ? `${days}d` : "Current"}
                        </FynTD>
                      </FynTR>
                    );
                  })}
                </tbody>
              </FynTable>
            )}
            <Link to="/dashboard/receivables" className="text-fyn-red text-fyn-small font-medium hover:underline mt-fyn-sm inline-block">
              View all receivables →
            </Link>
          </FynCard>
        </div>

        {/* Right - 40% */}
        <div className="lg:col-span-2 space-y-fyn-lg">
          {/* Runway gauge */}
          <FynCard className="text-center">
            <h3 className="text-fyn-ink font-serif mb-fyn-md text-fyn-h3">Cash Runway</h3>
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
            <p className="text-[56px] font-bold leading-none" style={{ color: runwayColor }}>
              {dailyBurn > 0 ? runwayDays.toFixed(0) : "—"}
            </p>
            <p className="text-fyn-ink/50 text-fyn-small mt-1">days of runway</p>
            <p className="text-fyn-tiny mt-0.5" style={{ color: "#8B6914" }}>
              Monthly burn: {monthlyBurn > 0 ? formatINR(Math.round(monthlyBurn)) : "—"}
            </p>
          </FynCard>

          {/* Nidhi insight — intentional dark surface (out of FynCard scope) */}
          <div className="rounded-[10px] bg-fyn-ink px-6 py-5">
            <div className="flex items-center gap-fyn-sm">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold bg-fyn-red text-base">N</div>
              <p className="text-white text-fyn-small font-semibold">AI CFO Nidhi's read on today</p>
            </div>
            <p className="text-white/85 text-fyn-small leading-[1.75] mt-fyn-sm">
              {brief?.content || "No brief generated yet. Ask Nidhi a question to get started."}
            </p>
            <div className="flex gap-2 mt-3.5">
              <FynInput
                value={nidhiInput}
                onChange={(e) => setNidhiInput(e.target.value)}
                placeholder="Ask AI CFO Nidhi a follow-up..."
                aria-label="Ask AI CFO Nidhi a follow-up"
                className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/40 text-fyn-small"
              />
              <FynButton
                aria-label="Send to AI CFO Nidhi"
                className="w-10 h-10 px-0 py-0 justify-center"
              >
                <ArrowRight className="h-4 w-4" />
              </FynButton>
            </div>
          </div>

          {/* Filing Calendar */}
          <FynCard>
            <h3 className="text-fyn-ink font-serif mb-fyn-sm text-fyn-h3">Filing Calendar (Next 30 days)</h3>
            {compliance.length === 0 ? (
              <EmptyHint text="No upcoming filings in the next 30 days." />
            ) : (
              <div className="space-y-1">
                {compliance.map((c: any) => {
                  const daysLeft = getDaysLeft(c.due_date);
                  const dotColor = daysLeft <= 3 ? "#DC2626" : daysLeft <= 7 ? "#F59E0B" : daysLeft <= 14 ? "#8B6914" : "rgba(26,16,8,0.30)";
                  const tone: "danger" | "warning" | "neutral" =
                    daysLeft <= 3 ? "danger" : daysLeft <= 7 ? "warning" : "neutral";
                  return (
                    <div key={c.id} className="flex items-center gap-fyn-sm rounded-lg px-2.5 py-2 h-9">
                      <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${daysLeft <= 3 ? "pulse-ring" : ""}`} style={{ background: dotColor }} />
                      <span className="flex-1 text-fyn-ink text-fyn-small font-medium">{c.filing_name}</span>
                      <span className="text-fyn-tiny text-fyn-ink/60">{c.due_date}</span>
                      <FynBadge tone={tone}>{daysLeft > 0 ? `${daysLeft}d` : "Due"}</FynBadge>
                    </div>
                  );
                })}
              </div>
            )}
            <Link to="/dashboard/filing-calendar" className="text-fyn-red text-fyn-small font-medium hover:underline mt-fyn-sm inline-block">
              View full calendar →
            </Link>
          </FynCard>

          {/* GST Health */}
          <FynCard>
            <h3 className="text-fyn-ink font-serif mb-fyn-sm text-fyn-h3">GST Health</h3>
            <div className="grid grid-cols-3 gap-fyn-sm">
              <div className="text-center rounded-lg p-3" style={{ background: "#DCFCE7" }}>
                <p className="font-mono text-xl font-bold" style={{ color: "#16A34A" }}>{formatINR(Number(itcRow?.itc_safe || 0))}</p>
                <p className="text-fyn-tiny font-medium uppercase tracking-[0.06em] mt-1" style={{ color: "#16A34A" }}>ITC SAFE</p>
              </div>
              <div className="text-center rounded-lg p-3" style={{ background: "#FDEAEA", border: "1px solid #C41E1E" }}>
                <p className="font-mono text-xl font-bold" style={{ color: "#C41E1E" }}>{formatINR(Number(itcRow?.itc_at_risk || 0))}</p>
                <p className="text-fyn-tiny font-medium uppercase tracking-[0.06em] mt-1" style={{ color: "#C41E1E" }}>ITC AT RISK</p>
              </div>
              <div className="text-center rounded-lg p-3" style={{ background: "#FEF3E2" }}>
                <p className="font-mono text-xl font-bold" style={{ color: "#F59E0B" }}>{noticeRisk?.score ?? "—"}{noticeRisk ? "/100" : ""}</p>
                <FynLabel className="mt-1">NOTICE RISK</FynLabel>
              </div>
            </div>
            <Link to="/dashboard/gst" className="text-fyn-red text-fyn-small font-medium hover:underline mt-fyn-sm inline-block">
              View GST Intelligence →
            </Link>
          </FynCard>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CockpitPage;
