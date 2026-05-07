import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Droplet, TrendingUp, TrendingDown, AlertTriangle, CheckCircle2,
  Calendar, Clock, ArrowUpRight, ArrowDownRight, RefreshCw, Download,
  ChevronRight, Info, Zap, Activity, BarChart3, Target, MessageCircle,
  ArrowLeft, Wallet, Flame, Heart,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from "recharts";
import DashboardLayout from "@/components/DashboardLayout";

// ===== Design tokens =====
const C = {
  bg: "#0A0B0D",
  bg2: "#111214",
  card: "rgba(255,255,255,0.03)",
  cardHover: "rgba(255,255,255,0.05)",
  border: "rgba(255,255,255,0.08)",
  borderStrong: "rgba(255,255,255,0.14)",
  text: "#E5E7EB",
  textDim: "rgba(229,231,235,0.6)",
  textMuted: "rgba(229,231,235,0.4)",
  critical: "#EF4444",
  warning: "#F59E0B",
  success: "#10B981",
  info: "#3B82F6",
  ai: "#C41E1E",
  liquidity: "#3B82F6",
};

const formatCurrency = (amount: number) => {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)}Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(0)}K`;
  return `₹${amount}`;
};

const demoData = {
  cashBalance: 420000,
  runway: 52,
  burnRate: 110000,
  liquidityRatio: 1.8,
  workingCapital: 580000,
  cashFlowTrend: [
    { month: "Dec", inflow: 850000, outflow: 920000, net: -70000, balance: 560000 },
    { month: "Jan", inflow: 780000, outflow: 890000, net: -110000, balance: 510000 },
    { month: "Feb", inflow: 820000, outflow: 950000, net: -130000, balance: 480000 },
    { month: "Mar", inflow: 900000, outflow: 980000, net: -80000, balance: 450000 },
    { month: "Apr", inflow: 840000, outflow: 1020000, net: -180000, balance: 430000 },
    { month: "May", inflow: 880000, outflow: 1100000, net: -220000, balance: 420000 },
  ],
  inflows: [
    { category: "Customer Payments", amount: 680000, percentage: 77 },
    { category: "Other Income", amount: 120000, percentage: 14 },
    { category: "Investments", amount: 80000, percentage: 9 },
  ],
  outflows: [
    { category: "Personnel Costs", amount: 640000, percentage: 58 },
    { category: "Vendor Payments", amount: 240000, percentage: 22 },
    { category: "Software & Tech", amount: 130000, percentage: 12 },
    { category: "Marketing", amount: 90000, percentage: 8 },
  ],
  alerts: [
    {
      severity: "critical", title: "Cash Runway Critical",
      message: "Working capital below safety threshold",
      metric: "52 days remaining (Target: 90 days)",
      recommendation: "Accelerate collections or reduce operating expenses by 15%",
      impact: "₹180K monthly savings needed",
    },
    {
      severity: "warning", title: "Burn Rate Increasing",
      message: "Monthly operating expenses up 8%",
      metric: "₹1.02L → ₹1.1L monthly average",
      recommendation: "Review vendor contracts and discretionary spending",
      impact: "Current trajectory exhausts cash by July 18",
    },
    {
      severity: "warning", title: "Liquidity Ratio Below Target",
      message: "Current ratio: 1.8:1 (Industry: 2.5:1)",
      metric: "Gap: -0.7 points",
      recommendation: "Improve working capital position",
      impact: "Need ₹400K additional liquid assets",
    },
  ],
};

export default function LiquidityIntelligencePage() {
  const navigate = useNavigate();
  const [refreshing, setRefreshing] = useState(false);
  const [data] = useState(demoData);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 900);
  };

  return (
    <DashboardLayout>
      <style>{`
        .liq-scroll::-webkit-scrollbar { width: 10px; }
        .liq-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 5px; }
        .liq-btn:hover { background: rgba(255,255,255,0.08) !important; }
      `}</style>
      <div style={{
        background: C.bg, color: C.text, minHeight: "calc(100vh - 64px)",
        fontFamily: "Inter, sans-serif",
      }}>
        {/* Header */}
        <div style={{
          position: "sticky", top: 0, zIndex: 10,
          padding: "16px clamp(16px, 3vw, 24px)",
          background: C.bg2, borderBottom: `1px solid ${C.border}`,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          gap: 16, flexWrap: "wrap",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
            <button onClick={() => navigate("/dashboard")} className="liq-btn" style={{
              padding: 8, borderRadius: 8, background: C.card,
              border: `1px solid ${C.border}`, color: C.text, cursor: "pointer",
              display: "flex", alignItems: "center",
            }}>
              <ArrowLeft size={18} />
            </button>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: `${C.liquidity}1A`, border: `1px solid ${C.liquidity}55`,
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              <Droplet size={22} color={C.liquidity} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: C.text }}>Liquidity Intelligence</div>
              <div style={{ fontSize: 13, color: C.textDim }}>Cash flow, runway & working capital analysis</div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <HeaderButton icon={RefreshCw} label="Refresh" onClick={handleRefresh} spinning={refreshing} />
            <HeaderButton icon={Download} label="Export" />
            <button onClick={() => navigate("/dashboard/nidhi")} style={{
              padding: "10px 16px", borderRadius: 8, border: "none",
              background: `linear-gradient(135deg, ${C.ai} 0%, #8B1515 100%)`,
              color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer",
              display: "flex", alignItems: "center", gap: 8,
              boxShadow: `0 4px 16px ${C.ai}66`,
            }}>
              <MessageCircle size={16} />
              Ask Nidhi
            </button>
          </div>
        </div>

        {/* Body */}
        <div style={{
          padding: "24px clamp(16px, 3vw, 32px)",
          display: "flex", flexDirection: "column", gap: 24,
          maxWidth: 1440, margin: "0 auto",
        }}>
          <AIInsightCard data={data} />

          {/* Metrics grid */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 16,
          }}>
            <MetricCard
              icon={Wallet} label="Cash Balance" value={formatCurrency(data.cashBalance)}
              change={-12} trend="down" color={C.liquidity} subtitle="Current liquid assets"
            />
            <MetricCard
              icon={Clock} label="Runway" value={`${data.runway} days`}
              change={-3} trend="down"
              color={data.runway < 60 ? C.critical : data.runway < 90 ? C.warning : C.success}
              subtitle="At current burn rate" alert
            />
            <MetricCard
              icon={Flame} label="Monthly Burn" value={formatCurrency(data.burnRate)}
              change={8} trend="up" color={C.warning} subtitle="Operating expenses/mo"
            />
            <MetricCard
              icon={Heart} label="Liquidity Ratio" value={`${data.liquidityRatio}:1`}
              change={-5} trend="down" color={C.warning} subtitle="Industry target: 2.5:1"
            />
          </div>

          <CashFlowChart data={data.cashFlowTrend} />

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: 16,
          }}>
            <FlowBreakdownCard
              title="Cash Inflows" subtitle="Current month breakdown"
              icon={ArrowUpRight} color={C.success} data={data.inflows} kind="inflow"
            />
            <FlowBreakdownCard
              title="Cash Outflows" subtitle="Current month breakdown"
              icon={ArrowDownRight} color={C.critical} data={data.outflows} kind="outflow"
            />
          </div>

          <AlertsSection alerts={data.alerts} />
        </div>
      </div>
    </DashboardLayout>
  );
}

// ============ Sub-components ============

function HeaderButton({ icon: Icon, label, onClick, spinning }: any) {
  return (
    <button onClick={onClick} className="liq-btn" style={{
      padding: "10px 14px", borderRadius: 8,
      background: C.card, border: `1px solid ${C.border}`,
      color: C.text, fontSize: 14, fontWeight: 500, cursor: "pointer",
      display: "flex", alignItems: "center", gap: 8,
    }}>
      <Icon size={15} style={spinning ? { animation: "spin 1s linear infinite" } : {}} />
      {label}
    </button>
  );
}

function AIInsightCard({ data }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      style={{
        position: "relative", borderRadius: 16, overflow: "hidden",
        background: `linear-gradient(135deg, rgba(196,30,30,0.08) 0%, rgba(17,18,20,0.6) 100%)`,
        border: `1px solid ${C.ai}44`,
        padding: 24,
      }}
    >
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 2,
        background: `linear-gradient(90deg, transparent, ${C.ai}, transparent)`,
      }} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap", marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <div style={{
            width: 44, height: 44, borderRadius: "50%",
            background: `linear-gradient(135deg, ${C.ai}, #8B0000)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontSize: 18, fontWeight: 800,
            boxShadow: `0 0 20px ${C.ai}66`,
          }}>N</div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 600, color: C.text }}>AI CFO Analysis</div>
            <div style={{ fontSize: 12, color: C.textDim }}>Live monitoring · Updated 2m ago</div>
          </div>
        </div>
        <div style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: "6px 12px", borderRadius: 999,
          background: `${C.critical}1A`, border: `1px solid ${C.critical}55`,
          color: C.critical, fontSize: 12, fontWeight: 600,
        }}>
          <AlertTriangle size={13} />
          CRITICAL ATTENTION
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <p style={{ fontSize: 16, lineHeight: 1.6, color: C.text, margin: 0 }}>
          Cash runway critical at <strong style={{ color: C.critical }}>{data.runway} days</strong>. At current burn rate of <strong>{formatCurrency(data.burnRate)}/month</strong>, liquid assets will be exhausted by July 18, 2026.
        </p>
        <div style={{ fontSize: 14, fontWeight: 600, color: C.text, marginTop: 4 }}>Immediate actions required:</div>
        <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
          {[
            `Accelerate collections on ${formatCurrency(210000)} overdue receivables (60+ days)`,
            `Freeze discretionary marketing spend — potential savings: ${formatCurrency(90000)}/month`,
            "Negotiate 15-day payment term extension with top 3 vendors",
            "Review personnel costs (58% of expenses) for optimization opportunities",
          ].map((line, i) => (
            <li key={i} style={{ display: "flex", gap: 10, fontSize: 14, color: C.textDim, lineHeight: 1.55 }}>
              <CheckCircle2 size={15} color={C.success} style={{ flexShrink: 0, marginTop: 2 }} />
              <span>{line}</span>
            </li>
          ))}
        </ul>
        <div style={{
          marginTop: 8, padding: 12, borderRadius: 8,
          background: `${C.success}10`, border: `1px solid ${C.success}33`,
          fontSize: 13, color: C.text, lineHeight: 1.55,
        }}>
          <strong style={{ color: C.success }}>Net effect:</strong> These actions would extend runway to approximately 90 days and improve liquidity ratio to industry standard 2.5:1.
        </div>
      </div>
    </motion.div>
  );
}

function MetricCard({ icon: Icon, label, value, change, trend, color, subtitle, alert }: any) {
  return (
    <div style={{
      position: "relative", padding: 20, borderRadius: 14,
      background: C.card, border: `1px solid ${C.border}`,
      display: "flex", flexDirection: "column", gap: 10,
      overflow: "hidden",
    }}>
      {alert && (
        <div style={{
          position: "absolute", top: 12, right: 12,
          width: 8, height: 8, borderRadius: "50%",
          background: C.critical,
          boxShadow: `0 0 0 4px ${C.critical}33`,
          animation: "pulse 2s ease-in-out infinite",
        }} />
      )}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: `${color}1A`, border: `1px solid ${color}33`,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Icon size={20} color={color} />
        </div>
        {change !== 0 && (
          <div style={{
            display: "flex", alignItems: "center", gap: 3,
            fontSize: 12, fontWeight: 600,
            color: trend === "up" ? C.critical : C.success,
            padding: "3px 8px", borderRadius: 999,
            background: trend === "up" ? `${C.critical}14` : `${C.success}14`,
          }}>
            {trend === "up" ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {Math.abs(change)}%
          </div>
        )}
      </div>
      <div style={{ fontSize: 12, color: C.textDim, textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 700, color: C.text, fontFamily: "'JetBrains Mono', monospace", wordBreak: "break-word" }}>
        {value}
      </div>
      <div style={{ fontSize: 12, color: C.textMuted }}>{subtitle}</div>
      <style>{`
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

function CashFlowChart({ data }: any) {
  return (
    <div style={{
      padding: 24, borderRadius: 14,
      background: C.card, border: `1px solid ${C.border}`,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <Activity size={20} color={C.liquidity} />
          <div>
            <div style={{ fontSize: 18, fontWeight: 600, color: C.text }}>Cash Flow Analysis</div>
            <div style={{ fontSize: 13, color: C.textDim }}>6-month trend with projections</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", fontSize: 12, color: C.textDim }}>
          <Legend dot={C.success} label="Inflows" />
          <Legend dot={C.critical} label="Outflows" />
          <Legend dot={C.liquidity} label="Net Balance" />
        </div>
      </div>

      <div style={{ width: "100%", height: 320 }}>
        <ResponsiveContainer>
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="gIn" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={C.success} stopOpacity={0.4} />
                <stop offset="100%" stopColor={C.success} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gOut" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={C.critical} stopOpacity={0.4} />
                <stop offset="100%" stopColor={C.critical} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gNet" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={C.liquidity} stopOpacity={0.4} />
                <stop offset="100%" stopColor={C.liquidity} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey="month" stroke={C.textMuted} fontSize={12} />
            <YAxis stroke={C.textMuted} fontSize={12} tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`} />
            <Tooltip
              contentStyle={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text }}
              formatter={(v: any) => [`₹${(v / 100000).toFixed(1)}L`, ""]}
            />
            <ReferenceLine y={0} stroke={C.textMuted} />
            <Area type="monotone" dataKey="inflow" stroke={C.success} strokeWidth={2} fill="url(#gIn)" />
            <Area type="monotone" dataKey="outflow" stroke={C.critical} strokeWidth={2} fill="url(#gOut)" />
            <Area type="monotone" dataKey="balance" stroke={C.liquidity} strokeWidth={2.5} fill="url(#gNet)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div style={{
        marginTop: 16, padding: 14, borderRadius: 8,
        background: `${C.warning}10`, border: `1px solid ${C.warning}33`,
        fontSize: 13, color: C.textDim, lineHeight: 1.55,
      }}>
        <strong style={{ color: C.warning }}>Trend Analysis:</strong> Net cash outflow accelerating over 6 months. Current trajectory shows cash exhaustion in 52 days without intervention. Immediate action required on collections and expense management.
      </div>
    </div>
  );
}

function Legend({ dot, label }: { dot: string; label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <span style={{ width: 10, height: 10, borderRadius: 2, background: dot, display: "inline-block" }} />
      {label}
    </div>
  );
}

function FlowBreakdownCard({ title, subtitle, icon: Icon, color, data, kind }: any) {
  const total = data.reduce((s: number, i: any) => s + i.amount, 0);
  return (
    <div style={{
      padding: 24, borderRadius: 14,
      background: C.card, border: `1px solid ${C.border}`,
      display: "flex", flexDirection: "column", gap: 16,
    }}>
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: `${color}1A`, border: `1px solid ${color}33`,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Icon size={20} color={color} />
        </div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 600, color: C.text }}>{title}</div>
          <div style={{ fontSize: 12, color: C.textDim }}>{subtitle}</div>
        </div>
      </div>

      <div style={{ fontSize: 32, fontWeight: 700, color, fontFamily: "'JetBrains Mono', monospace" }}>
        {formatCurrency(total)}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {data.map((item: any, idx: number) => (
          <div key={idx}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 14 }}>
              <span style={{ color: C.textDim }}>{item.category}</span>
              <span style={{ color: C.text, fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>
                {formatCurrency(item.amount)}
              </span>
            </div>
            <div style={{ height: 6, borderRadius: 3, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${item.percentage}%` }}
                transition={{ duration: 0.8, delay: idx * 0.1 }}
                style={{ height: "100%", background: color, borderRadius: 3 }}
              />
            </div>
            <div style={{ fontSize: 11, color: C.textMuted, marginTop: 4 }}>
              {item.percentage}% of total {kind}s
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AlertsSection({ alerts }: any) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <Target size={20} color={C.warning} />
        <div>
          <div style={{ fontSize: 18, fontWeight: 600, color: C.text }}>Priority Actions Required</div>
          <div style={{ fontSize: 13, color: C.textDim }}>AI-recommended interventions</div>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {alerts.map((a: any, i: number) => <AlertCard key={i} alert={a} delay={i * 0.05} />)}
      </div>
    </div>
  );
}

function AlertCard({ alert, delay }: any) {
  const color = alert.severity === "critical" ? C.critical : alert.severity === "warning" ? C.warning : C.info;
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      style={{
        padding: 20, borderRadius: 12,
        background: C.card, border: `1px solid ${color}44`,
        borderLeft: `4px solid ${color}`,
        display: "flex", gap: 16,
      }}
    >
      <div style={{
        width: 40, height: 40, borderRadius: 10, flexShrink: 0,
        background: `${color}1A`, border: `1px solid ${color}33`,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <AlertTriangle size={20} color={color} />
      </div>
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ fontSize: 16, fontWeight: 600, color: C.text }}>{alert.title}</div>
        <div style={{ fontSize: 14, color: C.textDim, lineHeight: 1.5 }}>{alert.message}</div>
        <div style={{
          fontSize: 13, color, fontWeight: 600, fontFamily: "'JetBrains Mono', monospace",
          padding: "6px 10px", borderRadius: 6, alignSelf: "flex-start",
          background: `${color}14`, border: `1px solid ${color}33`,
        }}>
          {alert.metric}
        </div>
        <div style={{ marginTop: 4 }}>
          <div style={{ fontSize: 11, color: C.textMuted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>
            Recommended Action
          </div>
          <div style={{ fontSize: 14, color: C.text, lineHeight: 1.5 }}>{alert.recommendation}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: C.textDim, marginTop: 4 }}>
          <Zap size={14} color={C.warning} />
          <span><strong style={{ color: C.text }}>Impact:</strong> {alert.impact}</span>
        </div>
      </div>
      <ChevronRight size={20} color={C.textMuted} style={{ flexShrink: 0, alignSelf: "center" }} />
    </motion.div>
  );
}
