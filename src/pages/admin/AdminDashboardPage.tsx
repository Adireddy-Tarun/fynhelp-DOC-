import { useEffect, useState } from "react";
import { Users, CreditCard, TrendingDown, IndianRupee, ArrowUp, ArrowDown, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";

type Metric = { label: string; value: string; trend?: number; icon: React.ReactNode };

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [activity, setActivity] = useState<any[]>([]);
  const [growth, setGrowth] = useState<{ month: string; users: number }[]>([]);

  useEffect(() => {
    (async () => {
      const since30 = new Date(Date.now() - 30 * 86400_000).toISOString();
      const since60 = new Date(Date.now() - 60 * 86400_000).toISOString();

      const [{ count: totalUsers }, { count: newUsers30 }, { count: newUsers60 }, { count: businessCount }] =
        await Promise.all([
          supabase.from("profiles").select("*", { count: "exact", head: true }),
          supabase.from("profiles").select("*", { count: "exact", head: true }).gte("created_at", since30),
          supabase.from("profiles").select("*", { count: "exact", head: true })
            .gte("created_at", since60).lt("created_at", since30),
          supabase.from("businesses").select("*", { count: "exact", head: true }),
        ]);

      const trendUsers = (newUsers60 ?? 0) > 0
        ? Math.round((((newUsers30 ?? 0) - (newUsers60 ?? 0)) / (newUsers60 ?? 1)) * 100)
        : null;

      setMetrics([
        { label: "Total Users", value: String(totalUsers ?? 0), trend: trendUsers ?? undefined,
          icon: <Users size={22} color="#8B6914" /> },
        { label: "Active Businesses", value: String(businessCount ?? 0),
          icon: <CreditCard size={22} color="#8B6914" /> },
        { label: "Monthly Recurring Revenue", value: "—",
          icon: <IndianRupee size={22} color="#8B6914" /> },
        { label: "Churn Rate (30 days)", value: "—",
          icon: <TrendingDown size={22} color="#8B6914" /> },
      ]);

      // Activity feed from audit logs
      const { data: logs } = await supabase
        .from("admin_audit_logs")
        .select("id, admin_user_id, action, target_type, target_id, created_at")
        .order("created_at", { ascending: false })
        .limit(20);
      setActivity(logs ?? []);

      // 6-month user growth
      const buckets: { month: string; users: number }[] = [];
      const now = new Date();
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const next = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
        const { count } = await supabase
          .from("profiles").select("*", { count: "exact", head: true })
          .lt("created_at", next.toISOString());
        buckets.push({
          month: d.toLocaleString("en-IN", { month: "short" }),
          users: count ?? 0,
        });
      }
      setGrowth(buckets);
    })();
  }, []);

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Overview of FYNHelp platform"
      />

      <div className="grid gap-6" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
        {metrics.map((m) => <MetricCard key={m.label} m={m} />)}
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2" style={{ minHeight: 380 }}>
          <h3 style={cardTitle}>User Growth (6 months)</h3>
          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer>
              <AreaChart data={growth} margin={{ top: 16, right: 16, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="adminUserGrowth" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#C41E1E" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#8B6914" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(26,16,8,0.06)" vertical={false} />
                <XAxis dataKey="month" stroke="rgba(26,16,8,0.5)" tickLine={false} axisLine={false}
                  style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12 }} />
                <YAxis stroke="rgba(26,16,8,0.5)" tickLine={false} axisLine={false}
                  style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    background: "#1A1008", border: "none", borderRadius: 8, color: "#fff",
                    fontFamily: "Roboto, sans-serif", fontSize: 13,
                  }}
                />
                <Area type="monotone" dataKey="users" stroke="#C41E1E" strokeWidth={2}
                  fill="url(#adminUserGrowth)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card style={{ minHeight: 380 }}>
          <h3 style={cardTitle}>Quick Stats</h3>
          <ul className="mt-4 space-y-3">
            {metrics.slice(0, 4).map((m) => (
              <li key={m.label} className="flex items-center justify-between"
                style={{ fontFamily: "Roboto, sans-serif", fontSize: 14, color: "hsl(var(--fyn-ink) / 0.85)" }}>
                <span>{m.label}</span>
                <strong style={{ fontFamily: "Oswald, sans-serif", fontWeight: 700, color: "hsl(var(--fyn-ink))" }}>
                  {m.value}
                </strong>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <h3 className="mt-10 mb-4" style={{ fontFamily: "Raleway, sans-serif", fontWeight: 600, fontSize: 20, color: "hsl(var(--fyn-ink))" }}>
        Recent Activity
      </h3>
      <Card style={{ padding: 0, maxHeight: 500, overflowY: "auto" }}>
        {activity.length === 0 && (
          <div className="p-6" style={{ fontFamily: "Roboto, sans-serif", fontSize: 14, color: "hsl(var(--fyn-ink) / 0.5)" }}>
            No admin activity yet. Actions will appear here as they happen.
          </div>
        )}
        {activity.map((a, i) => (
          <div key={a.id} className="flex items-start gap-4 px-5 py-4"
            style={{ borderBottom: i < activity.length - 1 ? "1px solid rgba(26,16,8,0.05)" : "none" }}>
            <span className="grid place-items-center rounded-full text-white shrink-0"
              style={{ width: 32, height: 32, background: "linear-gradient(135deg,#C41E1E,#8B6914)", fontSize: 12 }}>
              {a.action?.[0]?.toUpperCase() ?? "•"}
            </span>
            <div className="min-w-0 flex-1">
              <div style={{ fontFamily: "Roboto, sans-serif", fontWeight: 500, fontSize: 14, color: "hsl(var(--fyn-ink))" }}>
                {humanAction(a.action)}
              </div>
              <div className="mt-0.5" style={{ fontFamily: "Roboto, sans-serif", fontSize: 13, color: "hsl(var(--fyn-ink) / 0.6)" }}>
                {a.target_type ? `${a.target_type}${a.target_id ? ` · ${a.target_id.slice(0, 8)}…` : ""} | ` : ""}
                {timeAgo(a.created_at)}
              </div>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}

const cardTitle: React.CSSProperties = {
  fontFamily: "Raleway, sans-serif", fontWeight: 600, fontSize: 18, color: "hsl(var(--fyn-ink))",
  marginBottom: 12,
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
    <div
      className={className}
      style={{
        background: "rgba(255,255,255,0.95)",
        backdropFilter: "blur(20px) saturate(110%)",
        borderRadius: 20,
        border: "1px solid rgba(139,105,20,0.15)",
        boxShadow: "0 8px 32px rgba(26,16,8,0.08)",
        padding: 24,
        ...style,
      }}
    >{children}</div>
  );
}

function MetricCard({ m }: { m: Metric }) {
  return (
    <Card style={{ minHeight: 140, position: "relative" }}>
      <div className="flex items-start justify-between">
        <span
          className="grid place-items-center rounded-full"
          style={{
            width: 48, height: 48,
            background: "linear-gradient(135deg, rgba(196,30,30,0.1), rgba(139,105,20,0.1))",
          }}
        >{m.icon}</span>
        {typeof m.trend === "number" && <TrendBadge value={m.trend} />}
      </div>
      <div className="mt-4" style={{ fontFamily: "Oswald, sans-serif", fontWeight: 700, fontSize: 42, color: "hsl(var(--fyn-ink))", lineHeight: 1 }}>
        {m.value}
      </div>
      <div className="mt-2" style={{ fontFamily: "Raleway, sans-serif", fontSize: 14, color: "hsl(var(--fyn-ink) / 0.6)" }}>
        {m.label}
      </div>
    </Card>
  );
}

function TrendBadge({ value }: { value: number }) {
  const positive = value > 0, negative = value < 0;
  const color = positive ? "#10B981" : negative ? "#DC2626" : "rgba(26,16,8,0.5)";
  const Icon = positive ? ArrowUp : negative ? ArrowDown : ArrowRight;
  return (
    <span className="flex items-center gap-1" style={{
      color, fontFamily: "DM Sans, sans-serif", fontWeight: 600, fontSize: 13,
    }}>
      <Icon size={14} /> {value > 0 ? "+" : ""}{value}%
    </span>
  );
}

function humanAction(a: string) {
  return (a ?? "").replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
function timeAgo(iso: string) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}
