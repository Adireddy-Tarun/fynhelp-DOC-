import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Droplet, TrendingUp, TrendingDown, CheckCircle,
  RefreshCw, Link2, MessageCircle, ArrowRight, Activity, Wallet, Flame, Heart,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// ---------- Brand tokens ----------
const FYN = {
  ink: "#1A1008",
  red: "#C41E1E",
  redBright: "#E53E3E",
  beige: "#F4EDDA",
  gold: "#8B6914",
  white: "#FFFFFF",
  green: "#1A6B3C",
  greenBright: "#10B981",
  amber: "#B45309",
  amberBright: "#F59E0B",
  muted: "rgba(26,16,8,0.55)",
  border: "rgba(26,16,8,0.10)",
};

// ---------- Helpers ----------
const formatCurrency = (amount: number) => {
  const abs = Math.abs(amount);
  const sign = amount < 0 ? "-" : "";
  if (abs >= 100000) return `${sign}₹${(abs / 100000).toFixed(1)}L`;
  if (abs >= 1000) return `${sign}₹${(abs / 1000).toFixed(0)}K`;
  return `${sign}₹${abs}`;
};

const formatTimestamp = (date: Date) => {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  return date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
};

// ---------- Reusable bits ----------
function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div
      style={{
        background: FYN.white,
        border: `1px solid ${FYN.border}`,
        borderRadius: 12,
        padding: 20,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function SectionHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
      <h2 style={{ fontFamily: "Georgia, 'Playfair Display', serif", color: FYN.ink, fontSize: 20, fontWeight: 700 }}>{title}</h2>
      {sub && <span style={{ fontSize: 12, color: FYN.muted, fontWeight: 500 }}>{sub}</span>}
    </div>
  );
}

function KPICard({
  icon: Icon, iconColor, title, value, comparison, comparisonColor, trend, details, badge,
}: {
  icon: React.ComponentType<any>;
  iconColor: string;
  title: string;
  value: React.ReactNode;
  comparison?: string;
  comparisonColor?: string;
  trend?: "up" | "down" | "neutral";
  details?: string;
  badge?: { text: string; color: string };
}) {
  return (
    <Card>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: `${iconColor}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon size={20} color={iconColor} />
        </div>
        {badge && (
          <span style={{ fontSize: 10, fontWeight: 700, padding: "4px 8px", borderRadius: 6, background: `${badge.color}15`, color: badge.color, letterSpacing: "0.05em", textTransform: "uppercase" }}>
            {badge.text}
          </span>
        )}
      </div>
      <p style={{ fontSize: 11, color: FYN.muted, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>{title}</p>
      <p style={{ fontFamily: "'JetBrains Mono', monospace", color: FYN.ink, fontSize: 28, fontWeight: 700, marginTop: 4, lineHeight: 1.1 }}>{value}</p>
      {comparison && (
        <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 8 }}>
          {trend === "up" && <TrendingUp size={14} color={comparisonColor} />}
          {trend === "down" && <TrendingDown size={14} color={comparisonColor} />}
          <span style={{ fontSize: 12, color: comparisonColor, fontWeight: 600 }}>{comparison}</span>
        </div>
      )}
      {details && <p style={{ fontSize: 11, color: FYN.muted, marginTop: 6 }}>{details}</p>}
    </Card>
  );
}

// ---------- Sub-sections ----------
function CashFlowChart({ data }: { data: any[] }) {
  const totalIn = data.reduce((s, d) => s + (d.moneyIn || 0), 0);
  const totalOut = data.reduce((s, d) => s + (d.moneyOut || 0), 0);
  const net = totalIn - totalOut;
  return (
    <Card>
      <SectionHeader title="📈 Cash Flow Trend" sub="Last 6 months" />
      <div style={{ height: 260 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: -10 }}>
            <defs>
              <linearGradient id="moneyInGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={FYN.green} stopOpacity={0.35} />
                <stop offset="100%" stopColor={FYN.green} stopOpacity={0.04} />
              </linearGradient>
              <linearGradient id="moneyOutGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={FYN.red} stopOpacity={0.35} />
                <stop offset="100%" stopColor={FYN.red} stopOpacity={0.04} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#F3F4F6" strokeDasharray="4 4" />
            <XAxis dataKey="month" stroke={FYN.muted} fontSize={12} />
            <YAxis stroke={FYN.muted} fontSize={12} tickFormatter={(v) => `₹${(v / 100000).toFixed(1)}L`} />
            <Tooltip
              contentStyle={{ background: FYN.ink, border: "none", borderRadius: 8, color: FYN.white, fontSize: 13 }}
              formatter={(v: number) => formatCurrency(v)}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Area type="monotone" dataKey="moneyIn" name="Money In" stroke={FYN.green} strokeWidth={2.5} fill="url(#moneyInGrad)" />
            <Area type="monotone" dataKey="moneyOut" name="Money Out" stroke={FYN.red} strokeWidth={2.5} fill="url(#moneyOutGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginTop: 16 }}>
        {[
          { label: "💵 Money In", value: formatCurrency(totalIn), color: FYN.green },
          { label: "💸 Money Out", value: formatCurrency(totalOut), color: FYN.red },
          { label: "📉 Net", value: formatCurrency(net), color: net >= 0 ? FYN.green : FYN.red },
        ].map((s) => (
          <div key={s.label} style={{ background: FYN.beige, padding: 12, borderRadius: 8 }}>
            <p style={{ fontSize: 11, color: FYN.muted, fontWeight: 600 }}>{s.label}</p>
            <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 18, fontWeight: 700, color: s.color, marginTop: 2 }}>{s.value}</p>
            <p style={{ fontSize: 10, color: FYN.muted, marginTop: 2 }}>last 6 mo</p>
          </div>
        ))}
      </div>
    </Card>
  );
}

function BankBalances({ accounts, total, navigate }: { accounts: any[]; total: number; navigate: (p: string) => void }) {
  return (
    <Card>
      <SectionHeader title="💰 Bank Balances" sub={accounts.length && accounts.every((b) => b.connected) ? "Real-time sync: ✅ ON" : "⚠️ Some accounts offline"} />
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
        {accounts.length === 0 && (
          <p style={{ fontSize: 13, color: FYN.muted }}>No bank accounts connected yet.</p>
        )}
        {accounts.map((bank) => (
          <div key={bank.name} style={{ border: `1px solid ${FYN.border}`, borderRadius: 8, padding: 12 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ fontSize: 22 }}>🏦</div>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: FYN.ink }}>{bank.name}</p>
                  <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: FYN.muted }}>
                    {formatCurrency(bank.balance)} ({bank.percentage}%)
                  </p>
                </div>
              </div>
              <span style={{ fontSize: 10, fontWeight: 700, color: bank.connected ? FYN.green : FYN.red }}>
                {bank.connected ? "✅ LINKED" : "❌ DISCONNECTED"}
              </span>
            </div>
            <div style={{ height: 6, background: "#F3F4F6", borderRadius: 3, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${bank.percentage}%`, background: `linear-gradient(135deg, ${FYN.red}, ${FYN.gold})` }} />
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderTop: `1px solid ${FYN.border}`, borderBottom: `1px solid ${FYN.border}`, marginBottom: 16 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: FYN.muted }}>Total Balance</span>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 18, fontWeight: 700, color: FYN.ink }}>{formatCurrency(total)}</span>
      </div>
      <button
        onClick={() => navigate("/dashboard/settings/integrations")}
        style={{
          width: "100%", padding: "12px 16px", borderRadius: 8, border: "none", cursor: "pointer",
          background: `linear-gradient(135deg, ${FYN.red} 0%, ${FYN.gold} 100%)`, color: FYN.white,
          fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          boxShadow: "0 4px 12px rgba(139,105,20,0.3)",
        }}
      >
        <Link2 size={16} /> Connect More Banks
      </button>
    </Card>
  );
}

function RunwayCalculator({ data }: { data: any }) {
  const pct = Math.min((data.runway.months / data.runway.target) * 100, 100);
  return (
    <Card>
      <SectionHeader title="🎯 Runway Calculator" sub="🔄 Recalculated: Just now" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginBottom: 20 }}>
        {[
          { label: "Cash Available", value: formatCurrency(data.cashPosition.current), color: FYN.ink },
          { label: "Monthly Burn", value: formatCurrency(data.burnRate.current), color: FYN.red },
          { label: "Runway", value: `${data.runway.months} mo`, sub: `(${data.runway.days} days)`, color: FYN.amber },
          { label: "Zero Date ⚠️", value: data.runway.zeroDate, color: FYN.red, smaller: true },
        ].map((m: any) => (
          <div key={m.label} style={{ background: FYN.beige, padding: 12, borderRadius: 8 }}>
            <p style={{ fontSize: 11, color: FYN.muted, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>{m.label}</p>
            <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: m.smaller ? 14 : 20, fontWeight: 700, color: m.color, marginTop: 4 }}>{m.value}</p>
            {m.sub && <p style={{ fontSize: 11, color: FYN.muted, marginTop: 2 }}>{m.sub}</p>}
          </div>
        ))}
      </div>
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: FYN.muted }}>Progress to safe zone (6 months)</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: FYN.ink }}>{Math.round(pct)}%</span>
        </div>
        <div style={{ height: 10, background: "#F3F4F6", borderRadius: 5, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${pct}%`, background: `linear-gradient(135deg, ${FYN.amberBright}, ${FYN.red})`, transition: "width 0.6s ease" }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, fontSize: 10, color: FYN.muted }}>
          <span>0 mo</span><span>↑ Current ({data.runway.months}mo)</span><span>Target ({data.runway.target}mo)</span><span>12 mo</span>
        </div>
      </div>
      <h4 style={{ fontSize: 13, fontWeight: 700, color: FYN.ink, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 12 }}>What-If Scenarios</h4>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12 }}>
        {data.scenarios.map((s: any) => (
          <div key={s.title} style={{ border: `1px solid ${FYN.border}`, borderLeft: `4px solid ${s.color}`, borderRadius: 8, padding: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 10 }}>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: FYN.ink }}>{s.title}</p>
                <p style={{ fontSize: 11, color: FYN.muted, marginTop: 2 }}>{s.description}</p>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 16, fontWeight: 700, color: s.color }}>+{s.improvement.toFixed(1)} mo</p>
                <p style={{ fontSize: 10, color: FYN.muted }}>improvement</p>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: FYN.muted, marginBottom: 8 }}>
              <span>New Burn: <strong style={{ color: FYN.ink }}>{formatCurrency(s.newBurn)}/mo</strong></span>
              <span>New Runway: <strong style={{ color: FYN.ink }}>{s.newRunway.toFixed(1)} mo</strong></span>
            </div>
            {s.newRunway >= data.runway.target && (
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8, padding: "6px 10px", background: `${FYN.green}15`, borderRadius: 6 }}>
                <CheckCircle size={14} color={FYN.green} />
                <span style={{ fontSize: 11, color: FYN.green, fontWeight: 700 }}>Reaches safe zone!</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}

function AlertsSection({ alerts }: { alerts: any[] }) {
  const colorFor = (sev: string) =>
    sev === "critical" ? FYN.red : sev === "warning" ? FYN.amberBright : FYN.green;
  const iconFor = (sev: string) => (sev === "critical" ? "🔴" : sev === "warning" ? "🟡" : "🟢");
  const counts = {
    critical: alerts.filter((a) => a.severity === "critical").length,
    warning: alerts.filter((a) => a.severity === "warning").length,
    good: alerts.filter((a) => a.severity === "good").length,
  };
  return (
    <Card>
      <SectionHeader title="⚠️ Alerts & Warnings" sub={`${alerts.length} active`} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 16 }}>
        {[
          { label: "Critical", count: counts.critical, color: FYN.red },
          { label: "Warnings", count: counts.warning, color: FYN.amberBright },
          { label: "Good News", count: counts.good, color: FYN.green },
        ].map((s) => (
          <div key={s.label} style={{ background: `${s.color}10`, padding: 12, borderRadius: 8, textAlign: "center" }}>
            <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 24, fontWeight: 700, color: s.color }}>{s.count}</p>
            <p style={{ fontSize: 11, color: FYN.muted, fontWeight: 600 }}>{s.label}</p>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {alerts.length === 0 && (
          <p style={{ fontSize: 13, color: FYN.muted, textAlign: "center", padding: "12px 0" }}>No active alerts. 🎉</p>
        )}
        {alerts.map((a, i) => (
          <div key={i} style={{ borderLeft: `3px solid ${colorFor(a.severity)}`, padding: "10px 12px", background: `${colorFor(a.severity)}08`, borderRadius: 6 }}>
            <div style={{ display: "flex", gap: 10 }}>
              <span style={{ fontSize: 14 }}>{iconFor(a.severity)}</span>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: FYN.ink }}>{a.title}</p>
                {a.details && <p style={{ fontSize: 11, color: FYN.muted, marginTop: 2 }}>{a.details}</p>}
                {a.impact && <p style={{ fontSize: 11, color: FYN.muted, marginTop: 2 }}>Impact: {a.impact}</p>}
                {a.action && <p style={{ fontSize: 11, color: colorFor(a.severity), fontWeight: 600, marginTop: 4 }}>→ Action: {a.action}</p>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function NidhiInsightCard({ insight }: { insight: any }) {
  return (
    <Card style={{ background: `linear-gradient(135deg, ${FYN.beige} 0%, #FFF8E7 100%)`, border: `1px solid ${FYN.gold}40` }}>
      <SectionHeader title="💬 Nidhi's Insight" sub={`Generated: ${Math.max(0, Math.floor((Date.now() - insight.generatedAt.getTime()) / 60000))} min ago`} />
      <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 20, background: `linear-gradient(135deg, ${FYN.red}, ${FYN.gold})`,
          color: FYN.white, display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "Georgia, serif", fontWeight: 700, fontSize: 18, flexShrink: 0,
        }}>N</div>
        <p style={{ fontSize: 13, color: FYN.ink, lineHeight: 1.6, whiteSpace: "pre-line" }}>{insight.message}</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
        <div style={{ padding: 10, background: FYN.white, borderRadius: 8 }}>
          <p style={{ fontSize: 11, color: FYN.muted, fontWeight: 600 }}>Confidence Score</p>
          <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 18, fontWeight: 700, color: FYN.green, marginTop: 4 }}>{insight.confidence}%</p>
        </div>
        <div style={{ padding: 10, background: FYN.white, borderRadius: 8 }}>
          <p style={{ fontSize: 11, color: FYN.muted, fontWeight: 600 }}>Data Quality</p>
          <p style={{ fontSize: 14, fontWeight: 700, color: FYN.ink, marginTop: 4, textTransform: "capitalize" }}>{insight.dataQuality}</p>
        </div>
      </div>
      <button
        style={{
          width: "100%", padding: "12px 16px", borderRadius: 8, border: "none", cursor: "pointer",
          background: FYN.ink, color: FYN.white, fontSize: 14, fontWeight: 700,
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        }}
      >
        <MessageCircle size={16} /> Ask Nidhi More <ArrowRight size={14} />
      </button>
    </Card>
  );
}

function RecentTransactionsTable({ transactions }: { transactions: any[] }) {
  return (
    <Card>
      <SectionHeader title="📊 Recent Transactions" sub={`${transactions.length} shown`} />
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: `2px solid ${FYN.border}` }}>
              {["Date", "Category", "Description", "Amount", "Balance"].map((h, i) => (
                <th key={h} style={{
                  textAlign: i >= 3 ? "right" : "left", padding: "10px 8px",
                  fontSize: 11, color: FYN.muted, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase",
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {transactions.length === 0 && (
              <tr><td colSpan={5} style={{ padding: 16, textAlign: "center", color: FYN.muted }}>No recent transactions.</td></tr>
            )}
            {transactions.map((t, i) => (
              <tr key={i} style={{ borderBottom: `1px solid ${FYN.border}` }}>
                <td style={{ padding: "12px 8px" }}>
                  <div style={{ fontWeight: 600, color: FYN.ink }}>{t.date}</div>
                  <div style={{ fontSize: 11, color: FYN.muted }}>{t.time}</div>
                </td>
                <td style={{ padding: "12px 8px" }}>
                  <span style={{ marginRight: 6 }}>{t.icon}</span>
                  <span style={{ color: FYN.ink, fontWeight: 500 }}>{t.category}</span>
                </td>
                <td style={{ padding: "12px 8px", color: FYN.ink }}>{t.description}</td>
                <td style={{
                  padding: "12px 8px", textAlign: "right",
                  fontFamily: "'JetBrains Mono', monospace", fontWeight: 700,
                  color: t.amount > 0 ? FYN.green : FYN.red,
                }}>
                  {t.amount > 0 ? "+" : ""}{formatCurrency(t.amount)}
                </td>
                <td style={{
                  padding: "12px 8px", textAlign: "right",
                  fontFamily: "'JetBrains Mono', monospace", color: FYN.ink,
                }}>
                  {formatCurrency(t.balance)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

// ---------- Main Page ----------
export default function LiquidityIntelligencePage() {
  const navigate = useNavigate();
  const { user, businessId } = useAuth();

  const [loading, setLoading] = useState(true);
  const [liquidityData, setLiquidityData] = useState<any>(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [autoRefresh] = useState(true);
  const [, setTick] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 15000);
    return () => clearInterval(t);
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      if (!user) {
        toast.error("Not authenticated");
        return;
      }
      if (!businessId) {
        setLiquidityData(null);
        return;
      }

      const [
        { data: metrics },
        { data: banks },
        { data: transactions },
        { data: cashFlow },
        { data: alerts },
        { data: insights },
      ] = await Promise.all([
        supabase.from("liquidity_metrics").select("*").eq("business_id", businessId).order("recorded_at", { ascending: false }).limit(1).maybeSingle(),
        supabase.from("bank_accounts").select("*").eq("business_id", businessId),
        supabase.from("transactions").select("*").eq("business_id", businessId).order("transaction_date", { ascending: false }).limit(5),
        supabase.from("cash_flow_trends").select("*").eq("business_id", businessId).eq("period_type", "month").order("period_start", { ascending: false }).limit(6),
        supabase.from("alerts").select("*").eq("business_id", businessId).eq("resolved", false).order("created_at", { ascending: false }),
        supabase.from("ai_insights").select("*").eq("business_id", businessId).eq("module", "liquidity").order("generated_at", { ascending: false }).limit(1).maybeSingle(),
      ]);

      const hasAnyData =
        !!metrics ||
        (banks && banks.length > 0) ||
        (transactions && transactions.length > 0) ||
        (cashFlow && cashFlow.length > 0) ||
        (alerts && alerts.length > 0) ||
        !!insights;

      if (!hasAnyData) {
        setLiquidityData(null);
        return;
      }

      const totalBalance = (banks || []).reduce((sum: number, b: any) => sum + (Number(b.balance) || 0), 0);
      const cash = Number(metrics?.cash_position) || totalBalance || 0;
      const burn = Number(metrics?.burn_rate_current) || 0;
      const runwayMonths = Number(metrics?.runway_months) || 0;

      const transformed = {
        cashPosition: { current: cash, previous: cash, change: 0, trend: "neutral" as const },
        runway: {
          months: runwayMonths,
          days: Number(metrics?.runway_days) || 0,
          zeroDate: "Not calculated",
          status: metrics?.health_status || "unknown",
          target: 6,
        },
        burnRate: { current: burn, previous: burn, change: 0, trend: "neutral" as const },
        healthScore: { score: Number(metrics?.health_score) || 0, status: metrics?.health_status || "unknown", target: 80 },
        cashFlowTrend: (cashFlow || []).slice().reverse().map((cf: any) => ({
          month: cf.period_label,
          moneyIn: Number(cf.money_in) || 0,
          moneyOut: Math.abs(Number(cf.money_out) || 0),
          net: Number(cf.net_cash) || 0,
        })),
        bankAccounts: (banks || []).map((bank: any) => ({
          name: bank.bank_name,
          balance: Number(bank.balance) || 0,
          percentage: totalBalance > 0 ? Math.round(((Number(bank.balance) || 0) / totalBalance) * 100) : 0,
          connected: bank.connected ?? true,
        })),
        scenarios: [
          {
            title: "Reduce costs by 20%",
            description: "₹220K savings per month",
            newBurn: burn * 0.8,
            newRunway: burn > 0 ? cash / (burn * 0.8) : 0,
            improvement: burn > 0 ? cash / (burn * 0.8) - runwayMonths : 0,
            color: FYN.greenBright,
          },
          {
            title: "Increase revenue by 30%",
            description: "+₹330K per month",
            newBurn: burn * 0.7,
            newRunway: burn > 0 ? cash / (burn * 0.7) : 0,
            improvement: burn > 0 ? cash / (burn * 0.7) - runwayMonths : 0,
            color: "#14B8A6",
          },
          {
            title: "Both: Cut costs + Grow revenue",
            description: "Combined impact",
            newBurn: burn * 0.5,
            newRunway: burn > 0 ? cash / (burn * 0.5) : 0,
            improvement: burn > 0 ? cash / (burn * 0.5) - runwayMonths : 0,
            color: FYN.gold,
          },
        ],
        alerts: (alerts || []).map((alert: any) => ({
          severity: alert.severity,
          title: alert.title,
          details: alert.details || alert.body,
          impact: alert.impact,
          action: alert.suggested_action,
        })),
        aiInsight: {
          message: insights?.message || "Connect your accounts to receive AI insights.",
          confidence: Number(insights?.confidence_score) || 0,
          dataQuality: insights?.data_quality || "unknown",
          generatedAt: insights?.generated_at ? new Date(insights.generated_at) : new Date(),
        },
        recentTransactions: (transactions || []).map((txn: any) => {
          const dateStr = txn.transaction_date || txn.date;
          const amt = Number(txn.amount) || 0;
          const signedAmount = txn.direction === "out" ? -Math.abs(amt) : amt;
          return {
            date: dateStr ? new Date(dateStr).toLocaleDateString("en-IN", { month: "short", day: "numeric" }) : "",
            time: txn.transaction_time?.toString().substring(0, 5) || "",
            category: txn.category || "Other",
            icon: signedAmount > 0 ? "💰" : txn.category === "Payroll" ? "👥" : txn.category === "Software" ? "💳" : "💸",
            description: txn.description || "",
            amount: signedAmount,
            balance: Number(txn.balance_after) || 0,
          };
        }),
      };

      setLiquidityData(transformed);
    } catch (error) {
      console.error("Load error:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
      setLastUpdated(new Date());
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, businessId]);

  useEffect(() => {
    if (!autoRefresh) return;
    const i = setInterval(() => { loadData(); }, 60000);
    return () => clearInterval(i);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoRefresh, businessId]);

  const data = liquidityData;
  const totalBalance = useMemo(
    () => (data ? data.bankAccounts.reduce((s: number, b: any) => s + b.balance, 0) : 0),
    [data]
  );

  if (loading) {
    return (
      <DashboardLayout>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 400, gap: 16 }}>
          <RefreshCw size={32} color={FYN.gold} className="animate-spin" />
          <p style={{ color: FYN.muted, fontSize: 14 }}>Loading liquidity data...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!data) {
    return (
      <DashboardLayout>
        <div style={{ minHeight: 400, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{
            textAlign: "center", padding: 32, borderRadius: 16, maxWidth: 420,
            background: "rgba(255,255,255,0.9)", backdropFilter: "blur(10px)",
            border: `1px solid ${FYN.gold}30`,
          }}>
            <Droplet size={64} color="#06B6D4" style={{ margin: "0 auto 16px" }} />
            <h2 style={{ fontFamily: "Inter", fontSize: 24, fontWeight: 800, color: FYN.ink, marginBottom: 8 }}>
              No Data Yet
            </h2>
            <p style={{ fontFamily: "Inter", fontSize: 14, color: "rgba(26,16,8,0.7)", marginBottom: 24 }}>
              Connect your bank account or upload transactions to see your liquidity intelligence.
            </p>
            <button
              onClick={() => navigate("/dashboard/settings/integrations")}
              style={{
                background: `linear-gradient(135deg, ${FYN.red} 0%, ${FYN.gold} 100%)`,
                color: FYN.white, border: "none", padding: "12px 24px", borderRadius: 12,
                fontFamily: "Inter", fontSize: 14, fontWeight: 700, cursor: "pointer",
              }}
            >
              Connect Bank Account
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Header */}
      <div style={{
        background: `linear-gradient(135deg, ${FYN.ink} 0%, #2A1810 100%)`,
        borderRadius: 12, padding: "24px 28px", marginBottom: 24, color: FYN.white,
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{
              width: 56, height: 56, borderRadius: 14,
              background: `linear-gradient(135deg, ${FYN.red}, ${FYN.gold})`,
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 8px 24px rgba(196,30,30,0.4)",
            }}>
              <Droplet size={28} color={FYN.white} />
            </div>
            <div>
              <h1 style={{ fontFamily: "Georgia, 'Playfair Display', serif", fontSize: 26, fontWeight: 700, lineHeight: 1.2 }}>
                Liquidity Intelligence
              </h1>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", marginTop: 4 }}>
                Real-time cash position tracking & runway forecasting
              </p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: "rgba(255,255,255,0.08)", borderRadius: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: 4, background: FYN.greenBright, boxShadow: `0 0 8px ${FYN.greenBright}` }} />
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.9)" }}>Updated {formatTimestamp(lastUpdated)}</span>
              <button onClick={loadData} style={{ background: "transparent", border: "none", color: FYN.white, cursor: "pointer", padding: 0, marginLeft: 4 }}>
                <RefreshCw size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {/* Snapshot KPIs */}
        <div>
          <SectionHeader
            title="💧 Your Liquidity Snapshot"
            sub={`📅 As of ${new Date().toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}`}
          />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
            <KPICard
              icon={Wallet}
              iconColor={FYN.green}
              title="Cash Position"
              value={formatCurrency(data.cashPosition.current)}
              details={`Total across ${data.bankAccounts.length} account${data.bankAccounts.length === 1 ? "" : "s"}`}
            />
            <KPICard
              icon={Activity}
              iconColor={FYN.amberBright}
              title="Runway"
              value={`${data.runway.months} mo`}
              details={`${data.runway.days} days · Zero: ${data.runway.zeroDate}`}
              badge={{ text: data.runway.status, color: FYN.red }}
            />
            <KPICard
              icon={Flame}
              iconColor={FYN.red}
              title="Burn Rate"
              value={`${formatCurrency(data.burnRate.current)}/mo`}
              details="Latest snapshot"
            />
            <KPICard
              icon={Heart}
              iconColor={FYN.gold}
              title="Health Score"
              value={`${data.healthScore.score}/100`}
              details={`Target: ${data.healthScore.target}+ for healthy`}
              badge={{ text: data.healthScore.status, color: FYN.amberBright }}
            />
          </div>
        </div>

        {/* Charts row */}
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1fr)", gap: 16 }} className="lq-grid">
          <CashFlowChart data={data.cashFlowTrend} />
          <BankBalances accounts={data.bankAccounts} total={totalBalance} navigate={navigate} />
        </div>

        {/* Runway calculator */}
        <RunwayCalculator data={data} />

        {/* Alerts + Nidhi */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16 }}>
          <AlertsSection alerts={data.alerts} />
          <NidhiInsightCard insight={data.aiInsight} />
        </div>

        {/* Transactions */}
        <RecentTransactionsTable transactions={data.recentTransactions} />
      </div>

      {/* Responsive override */}
      <style>{`
        @media (max-width: 900px) {
          .lq-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </DashboardLayout>
  );
}
