import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Droplet, TrendingUp, TrendingDown, AlertTriangle, CheckCircle,
  RefreshCw, Link2, MessageCircle, ArrowRight, Activity, Target, Zap, Wallet, Flame, Heart,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
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

// ---------- Demo data ----------
const DEMO_DATA = {
  cashPosition: { current: 420000, previous: 375000, change: 12, trend: "up" as const },
  runway: { months: 3.8, days: 114, zeroDate: "September 1, 2026", status: "critical", target: 6 },
  burnRate: { current: 110000, previous: 102000, change: 8, trend: "up" as const },
  healthScore: { score: 65, status: "fair", target: 80 },
  cashFlowTrend: [
    { month: "Dec", moneyIn: 280000, moneyOut: 320000, net: -40000 },
    { month: "Jan", moneyIn: 310000, moneyOut: 350000, net: -40000 },
    { month: "Feb", moneyIn: 250000, moneyOut: 380000, net: -130000 },
    { month: "Mar", moneyIn: 320000, moneyOut: 290000, net: 30000 },
    { month: "Apr", moneyIn: 270000, moneyOut: 410000, net: -140000 },
    { month: "May", moneyIn: 280000, moneyOut: 390000, net: -110000 },
  ],
  bankAccounts: [
    { name: "HDFC Bank", balance: 250000, percentage: 59, connected: true },
    { name: "ICICI Bank", balance: 170000, percentage: 41, connected: true },
  ],
  scenarios: [
    { title: "Reduce costs by 20%", description: "₹220K savings per month", newBurn: 88000, newRunway: 4.7, improvement: 0.9, color: FYN.green },
    { title: "Increase revenue by 30%", description: "+₹330K per month", newBurn: 77000, newRunway: 5.2, improvement: 1.4, color: "#0E766E" },
    { title: "Cut costs + Grow revenue", description: "Combined impact", newBurn: 55000, newRunway: 6.8, improvement: 3.0, color: FYN.gold },
  ],
  alerts: [
    { severity: "critical", title: "Runway < 4 months", impact: "High priority", action: "Review costs now" },
    { severity: "warning", title: "Burn rate up 8%", details: "₹1.02L → ₹1.1L", action: "Check vendors" },
    { severity: "warning", title: "HDFC balance low", details: "Balance: ₹2.5L (Threshold: ₹3L)", action: "Transfer funds" },
    { severity: "good", title: "Collections up 15%", details: "₹2.43L → ₹2.8L", action: null },
  ],
  aiInsight: {
    message:
      "Your burn rate increased 8% this month (₹1.02L → ₹1.1L).\n\nTop contributors:\n• Vendor X: +₹40K (50%)\n• Marketing: +₹25K (31%)\n• Software: +₹15K (19%)\n\n💡 Recommendation: Review Vendor X contract in Cost Intelligence module.",
    confidence: 87,
    dataQuality: "high",
    generatedAt: new Date(Date.now() - 5 * 60000),
  },
  recentTransactions: [
    { date: "May 6", time: "14:30", category: "Income", icon: "💰", description: "Client payment", amount: 50000, balance: 420000 },
    { date: "May 5", time: "09:15", category: "Vendor", icon: "💸", description: "AWS hosting", amount: -25000, balance: 370000 },
    { date: "May 4", time: "10:00", category: "Payroll", icon: "👥", description: "Salary May", amount: -180000, balance: 395000 },
    { date: "May 3", time: "16:45", category: "Software", icon: "💳", description: "Zoho subscription", amount: -15000, balance: 575000 },
    { date: "May 2", time: "11:20", category: "Income", icon: "💰", description: "Invoice #234", amount: 75000, balance: 590000 },
  ],
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
  trend?: "up" | "down";
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
function CashFlowChart({ data }: { data: typeof DEMO_DATA.cashFlowTrend }) {
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
          { label: "💵 Money In", value: "₹2.8L", color: FYN.green },
          { label: "💸 Money Out", value: "₹3.9L", color: FYN.red },
          { label: "📉 Net", value: "-₹1.1L", color: FYN.red },
        ].map((s) => (
          <div key={s.label} style={{ background: FYN.beige, padding: 12, borderRadius: 8 }}>
            <p style={{ fontSize: 11, color: FYN.muted, fontWeight: 600 }}>{s.label}</p>
            <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 18, fontWeight: 700, color: s.color, marginTop: 2 }}>{s.value}</p>
            <p style={{ fontSize: 10, color: FYN.muted, marginTop: 2 }}>this month</p>
          </div>
        ))}
      </div>
    </Card>
  );
}

function BankBalances({ accounts, total, navigate }: { accounts: typeof DEMO_DATA.bankAccounts; total: number; navigate: (p: string) => void }) {
  return (
    <Card>
      <SectionHeader title="💰 Bank Balances" sub={accounts.every((b) => b.connected) ? "Real-time sync: ✅ ON" : "⚠️ OFF"} />
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
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

function RunwayCalculator({ data }: { data: typeof DEMO_DATA }) {
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
        ].map((m) => (
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
        {data.scenarios.map((s) => (
          <div key={s.title} style={{ border: `1px solid ${FYN.border}`, borderLeft: `4px solid ${s.color}`, borderRadius: 8, padding: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 10 }}>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: FYN.ink }}>{s.title}</p>
                <p style={{ fontSize: 11, color: FYN.muted, marginTop: 2 }}>{s.description}</p>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 16, fontWeight: 700, color: s.color }}>+{s.improvement} mo</p>
                <p style={{ fontSize: 10, color: FYN.muted }}>improvement</p>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: FYN.muted, marginBottom: 8 }}>
              <span>New Burn: <strong style={{ color: FYN.ink }}>{formatCurrency(s.newBurn)}/mo</strong></span>
              <span>New Runway: <strong style={{ color: FYN.ink }}>{s.newRunway} mo</strong></span>
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

function AlertsSection({ alerts }: { alerts: typeof DEMO_DATA.alerts }) {
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
      <SectionHeader title="⚠️ Alerts & Warnings" sub="Updated: 2 min ago" />
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

function NidhiInsightCard({ insight }: { insight: typeof DEMO_DATA.aiInsight }) {
  return (
    <Card style={{ background: `linear-gradient(135deg, ${FYN.beige} 0%, #FFF8E7 100%)`, border: `1px solid ${FYN.gold}40` }}>
      <SectionHeader title="💬 Nidhi's Insight" sub={`Generated: ${Math.floor((Date.now() - insight.generatedAt.getTime()) / 60000)} min ago`} />
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
          <p style={{ fontSize: 14, fontWeight: 700, color: FYN.ink, marginTop: 4, textTransform: "capitalize" }}>{insight.dataQuality} ✅</p>
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

function RecentTransactionsTable({ transactions }: { transactions: typeof DEMO_DATA.recentTransactions }) {
  return (
    <Card>
      <SectionHeader title="📊 Recent Transactions" sub="Last synced: 1m ago" />
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
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [demoMode, setDemoMode] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [autoRefresh] = useState(true);
  const [, setTick] = useState(0);

  // Tick to keep "x ago" labels fresh
  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 15000);
    return () => clearInterval(t);
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Demo only for now; real wiring can replace this when tables ready
      await new Promise((r) => setTimeout(r, 200));
    } catch (e) {
      console.error(e);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
      setLastUpdated(new Date());
    }
  };

  useEffect(() => { loadData(); /* eslint-disable-next-line */ }, [user, demoMode]);

  // Auto refresh every 60s
  useEffect(() => {
    if (!autoRefresh) return;
    const i = setInterval(async () => {
      await loadData();
      toast.success("Data refreshed", { duration: 1500 });
    }, 60000);
    return () => clearInterval(i);
  }, [autoRefresh]);

  const data = DEMO_DATA;
  const totalBalance = useMemo(() => data.bankAccounts.reduce((s, b) => s + b.balance, 0), [data]);

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

            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", fontWeight: 600 }}>Demo</span>
              <button
                onClick={() => setDemoMode(!demoMode)}
                aria-label="Toggle demo mode"
                style={{
                  width: 44, height: 24, borderRadius: 12, border: "none", cursor: "pointer", position: "relative",
                  background: demoMode ? `linear-gradient(135deg, ${FYN.amberBright}, #D97706)` : "rgba(255,255,255,0.2)",
                  transition: "all 0.3s",
                }}
              >
                <span style={{
                  position: "absolute", top: 2, left: demoMode ? 22 : 2,
                  width: 20, height: 20, borderRadius: 10, background: FYN.white, transition: "left 0.3s",
                }} />
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
              comparison={`${data.cashPosition.change > 0 ? "+" : ""}${data.cashPosition.change}% vs last month`}
              comparisonColor={data.cashPosition.change > 0 ? FYN.green : FYN.red}
              trend={data.cashPosition.trend}
              details={`${formatCurrency(data.cashPosition.previous)} → ${formatCurrency(data.cashPosition.current)}`}
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
              comparison={`${data.burnRate.change > 0 ? "+" : ""}${data.burnRate.change}% vs last month`}
              comparisonColor={data.burnRate.change > 0 ? FYN.red : FYN.green}
              trend={data.burnRate.trend}
              details={`${formatCurrency(data.burnRate.previous)} → ${formatCurrency(data.burnRate.current)}`}
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
