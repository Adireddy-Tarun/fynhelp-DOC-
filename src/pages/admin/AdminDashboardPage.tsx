import { useEffect, useState } from "react";
import {
  Users, CreditCard, TrendingDown, IndianRupee, ArrowUp, ArrowDown, ArrowRight,
  MessageCircle, Clock, CheckCircle2, AlertTriangle, AlertCircle, TrendingUp,
  UserPlus, Send, Bot, Flag, UserMinus,
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar, PieChart, Pie, Cell, Legend, LineChart, Line,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";

const fmtINR = (n: number) =>
  n >= 10000000 ? `₹${(n / 10000000).toFixed(1)}Cr`
  : n >= 100000 ? `₹${(n / 100000).toFixed(1)}L`
  : n >= 1000 ? `₹${(n / 1000).toFixed(1)}K`
  : `₹${n}`;

const metrics = {
  totalUsers: 1247, totalUsersTrend: 23,
  activeBusinesses: 856, activeBusinessesTrend: 18,
  mrr: 1250000, mrrTrend: 22.5,
  churnRate: 2.8, churnRateTrend: -0.5,
};

const userGrowthData = [
  { month: "Dec", users: 950 }, { month: "Jan", users: 1020 },
  { month: "Feb", users: 1085 }, { month: "Mar", users: 1145 },
  { month: "Apr", users: 1224 }, { month: "May", users: 1247 },
];

const recentSignups = [
  { name: "TechCorp Pvt Ltd", plan: "Pro", date: "2 hours ago" },
  { name: "Design Studio", plan: "Starter", date: "5 hours ago" },
  { name: "Growth Labs", plan: "Pro", date: "1 day ago" },
  { name: "E-Commerce Co", plan: "Enterprise", date: "2 days ago" },
];

const topPerformers = [
  { name: "Enterprise Client A", mrr: 45000 },
  { name: "SaaS Solutions", mrr: 22500 },
  { name: "Tech Startup B", mrr: 15000 },
];

const revenueByPlan = [
  { plan: "Starter", revenue: 342000 },
  { plan: "Pro", revenue: 690000 },
  { plan: "Enterprise", revenue: 218000 },
];

const subscriptionDist = [
  { name: "Free Trial", value: 124, color: "#94A3B8" },
  { name: "Starter", value: 342, color: "#3B82F6" },
  { name: "Pro", value: 345, color: "#10B981" },
  { name: "Enterprise", value: 45, color: "#8B4513" },
];

const supportMetrics = [
  { icon: MessageCircle, label: "Open Tickets", value: "23", trend: "-5 vs last week", positive: true },
  { icon: Clock, label: "Avg Response Time", value: "2.4h", trend: "-0.3h improvement", positive: true },
  { icon: CheckCircle2, label: "Resolved Today", value: "12", trend: "+3 vs yesterday", positive: true },
  { icon: AlertTriangle, label: "Escalated", value: "3", trend: "Same as last week", positive: false },
];

const systemServices = [
  { service: "API Server", status: "operational", uptime: 99.8, responseTime: 145 },
  { service: "Database", status: "operational", uptime: 99.9, responseTime: 23 },
  { service: "Claude API", status: "operational", uptime: 99.5, responseTime: 1840 },
  { service: "Payment Gateway", status: "operational", uptime: 99.7, responseTime: 320 },
];

const featureAdoption = [
  { feature: "CFO Fynny", adoption: 89 },
  { feature: "Liquidity Intelligence", adoption: 78 },
  { feature: "GST Intelligence", adoption: 67 },
  { feature: "Revenue Intelligence", adoption: 54 },
];

const alertsList = [
  { priority: "high", text: "23 users at risk of churn (no activity in 14 days)", icon: AlertTriangle },
  { priority: "medium", text: "Server costs up 15% this month — optimize cloud resources", icon: AlertCircle },
  { priority: "positive", text: "Pro plan conversion rate improved to 18% (+3%)", icon: TrendingUp },
  { priority: "info", text: "API usage increased 22% — consider rate limit adjustments", icon: Bot },
];

const PRIORITY_COLOR: Record<string, string> = {
  high: "#C41E1E", medium: "#B45309", positive: "#0F7B4F", info: "#1D4ED8",
};

const apiDailyData = Array.from({ length: 30 }, (_, i) => ({
  day: `D${i + 1}`, queries: Math.floor(Math.random() * 500) + 400,
}));

const recentActivity = [
  { icon: UserPlus, text: "New user signup: TechCorp Pvt Ltd (Pro plan)", time: "2 hours ago" },
  { icon: IndianRupee, text: "Payment received: ₹7,500 from Growth Labs", time: "3 hours ago" },
  { icon: AlertTriangle, text: "Support ticket escalated: #TKT-001234", time: "5 hours ago" },
  { icon: Flag, text: "Feature flag updated: Decision Simulator enabled", time: "8 hours ago" },
  { icon: Bot, text: "AI query spike detected: 245 queries in 1 hour", time: "1 day ago" },
  { icon: UserMinus, text: "User churned: Design Studio (Starter plan)", time: "1 day ago" },
];

const PLAN_BADGE: Record<string, { bg: string; fg: string }> = {
  "Free Trial": { bg: "rgba(148,163,184,0.18)", fg: "#475569" },
  Starter: { bg: "rgba(59,130,246,0.15)", fg: "#1D4ED8" },
  Pro: { bg: "rgba(16,185,129,0.15)", fg: "#0F7B4F" },
  Enterprise: { bg: "rgba(139,69,19,0.18)", fg: "#7C3D11" },
};

export default function AdminDashboardPage() {
  const [live, setLive] = useState<{
    totalUsers: number | null;
    activeSubs: number | null;
    monthlyRevenue: number | null;
    openTickets: number | null;
    loading: boolean;
  }>({ totalUsers: null, activeSubs: null, monthlyRevenue: null, openTickets: null, loading: true });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [usersRes, subsCountRes, subsRevRes, ticketsRes] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("subscriptions").select("*", { count: "exact", head: true }).eq("status", "active"),
        supabase.from("subscriptions").select("mrr").eq("status", "active"),
        supabase.from("support_tickets").select("*", { count: "exact", head: true }).in("status", ["open", "in_progress"]),
      ]);
      if (cancelled) return;
      const revenue = subsRevRes.error
        ? null
        : (subsRevRes.data ?? []).reduce((sum, r: { mrr: number | string | null }) => sum + Number(r.mrr ?? 0), 0);
      setLive({
        totalUsers: usersRes.error ? null : usersRes.count ?? 0,
        activeSubs: subsCountRes.error ? null : subsCountRes.count ?? 0,
        monthlyRevenue: revenue,
        openTickets: ticketsRes.error ? null : ticketsRes.count ?? 0,
        loading: false,
      });
    })();
    return () => { cancelled = true; };
  }, []);

  const liveValue = (n: number | null, fmt: (v: number) => string) =>
    live.loading ? "…" : n === null ? "—" : fmt(n);

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Overview of FYNHelp platform" />

      {/* Top metrics */}
      <div className="grid gap-6" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
        <MetricCard icon={<Users size={22} color="#8B6914" />} label="Total Users"
          value={liveValue(live.totalUsers, (v) => v.toLocaleString("en-IN"))} trend={metrics.totalUsersTrend}
          trendLabel={`+${metrics.totalUsersTrend} this month`} />
        <MetricCard icon={<CreditCard size={22} color="#8B6914" />} label="Active Subscriptions"
          value={liveValue(live.activeSubs, (v) => v.toLocaleString("en-IN"))} trend={metrics.activeBusinessesTrend}
          trendLabel={`+${metrics.activeBusinessesTrend} this month`} />
        <MetricCard icon={<IndianRupee size={22} color="#8B6914" />} label="Monthly Recurring Revenue"
          value={liveValue(live.monthlyRevenue, fmtINR)} trend={metrics.mrrTrend}
          trendLabel={`+${metrics.mrrTrend}% growth`} />
        <MetricCard icon={<MessageCircle size={22} color="#8B6914" />} label="Open Support Tickets"
          value={liveValue(live.openTickets, (v) => v.toLocaleString("en-IN"))} trend={0} positiveTrend
          trendLabel="Open + In Progress" />
      </div>

      {/* User growth + signups */}
      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2" style={{ minHeight: 380 }}>
          <h3 style={cardTitle}>User Growth (6 months)</h3>
          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer>
              <AreaChart data={userGrowthData} margin={{ top: 16, right: 16, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="adminUserGrowth" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#C41E1E" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#8B6914" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(26,16,8,0.06)" vertical={false} />
                <XAxis dataKey="month" stroke="rgba(26,16,8,0.5)" tickLine={false} axisLine={false} style={{ fontSize: 12 }} />
                <YAxis stroke="rgba(26,16,8,0.5)" tickLine={false} axisLine={false} style={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ background: "#1A1008", border: "none", borderRadius: 8, color: "#fff", fontSize: 13 }} />
                <Area type="monotone" dataKey="users" stroke="#C41E1E" strokeWidth={2} fill="url(#adminUserGrowth)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card style={{ minHeight: 380 }}>
          <h3 style={cardTitle}>Recent Signups (7d)</h3>
          <div className="space-y-3">
            {recentSignups.map((s) => {
              const b = PLAN_BADGE[s.plan];
              return (
                <div key={s.name} className="flex items-center justify-between gap-2 py-2"
                  style={{ borderBottom: "1px solid rgba(26,16,8,0.06)" }}>
                  <div className="min-w-0">
                    <div style={{ fontFamily: "Roboto, sans-serif", fontWeight: 500, fontSize: 13, color: "hsl(var(--fyn-ink))", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {s.name}
                    </div>
                    <div style={{ fontFamily: "Roboto, sans-serif", fontSize: 11, color: "hsl(var(--fyn-ink) / 0.55)" }}>
                      {s.date}
                    </div>
                  </div>
                  <span style={{ background: b.bg, color: b.fg, padding: "3px 10px", borderRadius: 6, fontFamily: "DM Sans, sans-serif", fontWeight: 700, fontSize: 11 }}>
                    {s.plan}
                  </span>
                </div>
              );
            })}
          </div>

          <h4 className="mt-5 mb-2" style={{ fontFamily: "Raleway, sans-serif", fontWeight: 600, fontSize: 14, color: "hsl(var(--fyn-ink))" }}>
            Top Revenue Contributors
          </h4>
          <div className="space-y-2">
            {topPerformers.map((t) => (
              <div key={t.name} className="flex items-center justify-between"
                style={{ fontFamily: "Roboto, sans-serif", fontSize: 13 }}>
                <span style={{ color: "hsl(var(--fyn-ink) / 0.85)" }}>{t.name}</span>
                <strong style={{ fontFamily: "Oswald, sans-serif", color: "#0F7B4F" }}>{fmtINR(t.mrr)}</strong>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Revenue + Pie */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card style={{ minHeight: 360 }}>
          <h3 style={cardTitle}>Revenue Breakdown by Plan</h3>
          <div style={{ width: "100%", height: 280 }}>
            <ResponsiveContainer>
              <BarChart data={revenueByPlan}>
                <CartesianGrid stroke="rgba(26,16,8,0.06)" vertical={false} />
                <XAxis dataKey="plan" stroke="rgba(26,16,8,0.5)" tickLine={false} axisLine={false} style={{ fontSize: 12 }} />
                <YAxis tickFormatter={(v) => fmtINR(v)} stroke="rgba(26,16,8,0.5)" tickLine={false} axisLine={false} style={{ fontSize: 12 }} />
                <Tooltip formatter={(v: number) => fmtINR(v)} contentStyle={{ background: "#1A1008", border: "none", borderRadius: 8, color: "#fff", fontSize: 13 }} />
                <Bar dataKey="revenue" fill="#8B6914" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card style={{ minHeight: 360 }}>
          <h3 style={cardTitle}>Subscription Distribution</h3>
          <div style={{ width: "100%", height: 280 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={subscriptionDist} dataKey="value" nameKey="name" cx="50%" cy="50%"
                  innerRadius={60} outerRadius={95} paddingAngle={2}
                  label={(e: any) => `${e.name}: ${e.value}`}>
                  {subscriptionDist.map((d) => <Cell key={d.name} fill={d.color} />)}
                </Pie>
                <Legend wrapperStyle={{ fontSize: 12, fontFamily: "Roboto, sans-serif" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Support metrics */}
      <h3 className="mt-10 mb-4" style={sectionTitle}>Support Overview</h3>
      <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
        {supportMetrics.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label} style={{ minHeight: 130 }}>
              <div className="flex items-center justify-between mb-2">
                <Icon size={20} color="#8B6914" />
              </div>
              <div style={{ fontFamily: "Oswald, sans-serif", fontWeight: 700, fontSize: 28, color: "hsl(var(--fyn-ink))" }}>{s.value}</div>
              <div style={{ fontFamily: "Roboto, sans-serif", fontSize: 12, color: "hsl(var(--fyn-ink) / 0.6)", marginTop: 4 }}>{s.label}</div>
              <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11, color: s.positive ? "#0F7B4F" : "hsl(var(--fyn-ink) / 0.5)", marginTop: 6, fontWeight: 600 }}>
                {s.trend}
              </div>
            </Card>
          );
        })}
      </div>

      {/* System Health + Engagement */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <h3 style={cardTitle}>System Health Status</h3>
          <div className="space-y-3">
            {systemServices.map((s) => (
              <div key={s.service} className="flex items-center justify-between py-2"
                style={{ borderBottom: "1px solid rgba(26,16,8,0.06)" }}>
                <div className="flex items-center gap-3">
                  <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#10B981", boxShadow: "0 0 0 3px rgba(16,185,129,0.18)" }} />
                  <span style={{ fontFamily: "Roboto, sans-serif", fontSize: 14, color: "hsl(var(--fyn-ink))", fontWeight: 500 }}>{s.service}</span>
                </div>
                <div className="flex items-center gap-4" style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12 }}>
                  <span style={{ color: "hsl(var(--fyn-ink) / 0.65)" }}>{s.uptime}% uptime</span>
                  <span style={{ color: "hsl(var(--fyn-ink) / 0.85)", fontWeight: 600 }}>{s.responseTime}ms</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 style={cardTitle}>User Engagement</h3>
          <div className="grid grid-cols-3 gap-3 mb-5">
            <EngagementStat value="542" label="Daily Active" />
            <EngagementStat value="856" label="Monthly Active" />
            <EngagementStat value="63%" label="DAU/MAU" />
          </div>
          <h4 style={{ fontFamily: "Raleway, sans-serif", fontWeight: 600, fontSize: 14, color: "hsl(var(--fyn-ink))", marginBottom: 10 }}>
            Feature Adoption
          </h4>
          <div className="space-y-3">
            {featureAdoption.map((f) => (
              <div key={f.feature}>
                <div className="flex justify-between mb-1.5" style={{ fontFamily: "Roboto, sans-serif", fontSize: 12 }}>
                  <span style={{ color: "hsl(var(--fyn-ink))" }}>{f.feature}</span>
                  <span style={{ color: "hsl(var(--fyn-ink) / 0.65)", fontWeight: 600 }}>{f.adoption}%</span>
                </div>
                <div style={{ height: 6, background: "rgba(26,16,8,0.08)", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ width: `${f.adoption}%`, height: "100%", background: "linear-gradient(90deg,#C41E1E,#8B6914)" }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Alerts + API Usage */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <h3 style={cardTitle}>Alerts & Recommendations</h3>
          <div className="space-y-3">
            {alertsList.map((a, i) => {
              const Icon = a.icon;
              const c = PRIORITY_COLOR[a.priority];
              return (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg"
                  style={{ background: "rgba(26,16,8,0.03)", borderLeft: `3px solid ${c}` }}>
                  <Icon size={18} color={c} style={{ marginTop: 1, flexShrink: 0 }} />
                  <span style={{ fontFamily: "Roboto, sans-serif", fontSize: 13, color: "hsl(var(--fyn-ink))", lineHeight: 1.5 }}>
                    {a.text}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>

        <Card>
          <h3 style={cardTitle}>API Usage (Claude)</h3>
          <div className="grid grid-cols-3 gap-3 mb-4">
            <EngagementStat value="12.8K" label="Queries (30d)" />
            <EngagementStat value="$487" label="API Cost (30d)" />
            <EngagementStat value="3.2s" label="Avg Response" />
          </div>
          <div style={{ width: "100%", height: 160 }}>
            <ResponsiveContainer>
              <LineChart data={apiDailyData}>
                <XAxis dataKey="day" hide />
                <YAxis hide />
                <Tooltip contentStyle={{ background: "#1A1008", border: "none", borderRadius: 8, color: "#fff", fontSize: 12 }} />
                <Line type="monotone" dataKey="queries" stroke="#8B6914" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Recent activity */}
      <h3 className="mt-10 mb-4" style={sectionTitle}>Recent Activity</h3>
      <Card style={{ padding: 0, maxHeight: 500, overflowY: "auto" }}>
        {recentActivity.map((a, i) => {
          const Icon = a.icon;
          return (
            <div key={i} className="flex items-start gap-4 px-5 py-4"
              style={{ borderBottom: i < recentActivity.length - 1 ? "1px solid rgba(26,16,8,0.05)" : "none" }}>
              <span className="grid place-items-center rounded-full text-white shrink-0"
                style={{ width: 32, height: 32, background: "linear-gradient(135deg,#C41E1E,#8B6914)" }}>
                <Icon size={14} />
              </span>
              <div className="flex-1 min-w-0">
                <div style={{ fontFamily: "Roboto, sans-serif", fontWeight: 500, fontSize: 14, color: "hsl(var(--fyn-ink))" }}>
                  {a.text}
                </div>
              </div>
              <span style={{ fontFamily: "Roboto, sans-serif", fontSize: 12, color: "hsl(var(--fyn-ink) / 0.5)", whiteSpace: "nowrap" }}>
                {a.time}
              </span>
            </div>
          );
        })}
      </Card>
    </div>
  );
}

const cardTitle: React.CSSProperties = {
  fontFamily: "Raleway, sans-serif", fontWeight: 600, fontSize: 18, color: "hsl(var(--fyn-ink))", marginBottom: 12,
};
const sectionTitle: React.CSSProperties = {
  fontFamily: "Raleway, sans-serif", fontWeight: 600, fontSize: 20, color: "hsl(var(--fyn-ink))",
};

export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-8">
      <h1 style={{ fontFamily: "Oswald, sans-serif", fontWeight: 700, fontSize: 36, color: "hsl(var(--fyn-ink))", lineHeight: 1.1 }}>
        {title}
      </h1>
      {subtitle && (
        <p className="mt-2" style={{ fontFamily: "Raleway, sans-serif", fontSize: 16, color: "hsl(var(--fyn-ink) / 0.6)" }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

export function Card({ children, style, className }: { children: React.ReactNode; style?: React.CSSProperties; className?: string }) {
  return (
    <div className={className}
      style={{
        background: "rgba(255,255,255,0.95)", backdropFilter: "blur(20px) saturate(110%)",
        borderRadius: 20, border: "1px solid rgba(139,105,20,0.15)",
        boxShadow: "0 8px 32px rgba(26,16,8,0.08)", padding: 24, ...style,
      }}>{children}</div>
  );
}

function EngagementStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center p-3 rounded-lg" style={{ background: "rgba(139,105,20,0.06)" }}>
      <div style={{ fontFamily: "Oswald, sans-serif", fontWeight: 700, fontSize: 22, color: "hsl(var(--fyn-ink))" }}>{value}</div>
      <div style={{ fontFamily: "Roboto, sans-serif", fontSize: 11, color: "hsl(var(--fyn-ink) / 0.6)", marginTop: 2 }}>{label}</div>
    </div>
  );
}

function MetricCard({ icon, label, value, trend, trendLabel, positiveTrend }: {
  icon: React.ReactNode; label: string; value: string;
  trend?: number; trendLabel?: string; positiveTrend?: boolean;
}) {
  return (
    <Card style={{ minHeight: 140, position: "relative" }}>
      <div className="flex items-start justify-between">
        <span className="grid place-items-center rounded-full"
          style={{ width: 48, height: 48, background: "linear-gradient(135deg, rgba(196,30,30,0.1), rgba(139,105,20,0.1))" }}>
          {icon}
        </span>
        {typeof trend === "number" && <TrendBadge value={trend} positive={positiveTrend} />}
      </div>
      <div className="mt-4" style={{ fontFamily: "Oswald, sans-serif", fontWeight: 700, fontSize: 38, color: "hsl(var(--fyn-ink))", lineHeight: 1 }}>
        {value}
      </div>
      <div className="mt-2" style={{ fontFamily: "Raleway, sans-serif", fontSize: 14, color: "hsl(var(--fyn-ink) / 0.6)" }}>
        {label}
      </div>
      {trendLabel && (
        <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11, color: "#0F7B4F", marginTop: 6, fontWeight: 600 }}>
          {trendLabel}
        </div>
      )}
    </Card>
  );
}

function TrendBadge({ value, positive }: { value: number; positive?: boolean }) {
  const isPos = positive ?? value > 0;
  const color = isPos ? "#10B981" : value < 0 ? "#DC2626" : "rgba(26,16,8,0.5)";
  const Icon = isPos ? ArrowUp : value < 0 ? ArrowDown : ArrowRight;
  return (
    <span className="flex items-center gap-1" style={{ color, fontFamily: "DM Sans, sans-serif", fontWeight: 600, fontSize: 13 }}>
      <Icon size={14} /> {isPos && value > 0 ? "+" : ""}{value}%
    </span>
  );
}
