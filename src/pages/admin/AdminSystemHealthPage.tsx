import { useEffect, useState } from "react";
import { Database, CreditCard, FileText, Bot, Mail, BarChart, CheckCircle2, AlertTriangle, XCircle, RefreshCw } from "lucide-react";
import { Card, PageHeader } from "./AdminDashboardPage";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

type ServiceStatus = "operational" | "degraded" | "down";
type Service = {
  key: string; name: string; icon: typeof Database; status: ServiceStatus;
  responseMs: number; uptime: string; lastIncident: string;
};

const SERVICES: Service[] = [
  { key: "supabase", name: "Lovable Cloud Database", icon: Database,   status: "operational", responseMs: 45, uptime: "99.98% (30d)", lastIncident: "None in last 30 days" },
  { key: "razorpay", name: "Razorpay Payments",      icon: CreditCard, status: "operational", responseMs: 220, uptime: "99.94% (30d)", lastIncident: "Apr 22 (8 mins)" },
  { key: "zoho",     name: "Zoho Books API",          icon: FileText,   status: "degraded",    responseMs: 1800, uptime: "98.21% (30d)", lastIncident: "Today, 13:20" },
  { key: "claude",   name: "Lovable AI Gateway",     icon: Bot,        status: "operational", responseMs: 880, uptime: "99.92% (30d)", lastIncident: "May 3, 18:42" },
  { key: "resend",   name: "Resend Email",           icon: Mail,       status: "operational", responseMs: 110, uptime: "99.99% (30d)", lastIncident: "None in last 30 days" },
  { key: "posthog",  name: "PostHog Analytics",      icon: BarChart,   status: "operational", responseMs: 95,  uptime: "100.00% (30d)", lastIncident: "None in last 30 days" },
];

const ERRORS = [
  { time: "May 5, 14:35", service: "Lovable AI Gateway", type: "Timeout",   message: "Request timed out after 30s", count: 12 },
  { time: "May 5, 12:20", service: "Razorpay",           type: "Rate Limit", message: "Too many requests",            count: 3 },
  { time: "May 4, 18:42", service: "Lovable Cloud DB",  type: "Connection", message: "Connection pool exhausted",     count: 1 },
  { time: "May 3, 09:11", service: "Zoho Books",        type: "Auth",       message: "OAuth token expired",            count: 5 },
];

function genResponseSeries() {
  const out: Record<string, number>[] = [];
  for (let i = 0; i < 12; i++) {
    out.push({
      hour: i * 2,
      Supabase: 35 + Math.round(Math.random() * 25),
      Razorpay: 180 + Math.round(Math.random() * 80),
      Zoho:     900 + Math.round(Math.random() * 1200),
      Claude:   700 + Math.round(Math.random() * 400),
    });
  }
  return out;
}

const STATUS_META: Record<ServiceStatus, { color: string; bg: string; label: string; icon: typeof CheckCircle2 }> = {
  operational: { color: "#0F7B4F", bg: "rgba(16,185,129,0.12)",  label: "Operational", icon: CheckCircle2 },
  degraded:    { color: "#B45309", bg: "rgba(245,158,11,0.15)",  label: "Degraded",    icon: AlertTriangle },
  down:        { color: "#C41E1E", bg: "rgba(196,30,30,0.15)",   label: "Down",        icon: XCircle },
};

export default function AdminSystemHealthPage() {
  const [series, setSeries] = useState(genResponseSeries());
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => { setTick((t) => t + 1); setSeries(genResponseSeries()); }, 60_000);
    return () => clearInterval(id);
  }, []);

  const degradedCount = SERVICES.filter((s) => s.status !== "operational").length;
  const overall: ServiceStatus = degradedCount === 0 ? "operational" : SERVICES.some((s) => s.status === "down") ? "down" : "degraded";
  const Banner = STATUS_META[overall].icon;

  return (
    <div>
      <div className="flex items-start justify-between gap-4 mb-6">
        <PageHeader title="System Health" subtitle="Monitor API status, uptime, and errors" />
        <button onClick={() => setSeries(genResponseSeries())} className="flex items-center gap-2 px-4 py-2 rounded-lg"
          style={{ border: "1px solid rgba(26,16,8,0.15)", fontFamily: "Raleway, sans-serif", fontWeight: 600, fontSize: 13, color: "hsl(var(--fyn-ink))" }}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      <div className="rounded-2xl p-5 mb-6 flex items-center gap-4"
        style={{ background: STATUS_META[overall].bg, border: `1px solid ${STATUS_META[overall].color}33` }}>
        <Banner size={32} color={STATUS_META[overall].color} />
        <div className="flex-1">
          <div style={{ fontFamily: "Oswald, sans-serif", fontWeight: 700, fontSize: 22, color: STATUS_META[overall].color }}>
            {overall === "operational" ? "All Systems Operational" : `${degradedCount} Service${degradedCount > 1 ? "s" : ""} Degraded`}
          </div>
          <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12, color: "hsl(var(--fyn-ink) / 0.6)" }}>
            Updated {tick === 0 ? "just now" : `${tick} min ago`} · auto-refresh every 60s
          </div>
        </div>
      </div>

      {/* Service status grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {SERVICES.map((s) => {
          const Icon = s.icon;
          const meta = STATUS_META[s.status];
          return (
            <Card key={s.key}>
              <div className="flex items-start justify-between mb-3">
                <span className="grid place-items-center rounded-2xl" style={{ width: 48, height: 48, background: "rgba(139,105,20,0.1)" }}>
                  <Icon size={24} color="#8B6914" />
                </span>
                <span style={{ padding: "3px 9px", borderRadius: 6, fontWeight: 600, fontSize: 11, background: meta.bg, color: meta.color }}>
                  {meta.label}
                </span>
              </div>
              <div style={{ fontFamily: "Raleway, sans-serif", fontWeight: 700, fontSize: 16, color: "hsl(var(--fyn-ink))" }}>{s.name}</div>
              <div className="mt-2 grid grid-cols-2 gap-3" style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12 }}>
                <div>
                  <div style={{ color: "hsl(var(--fyn-ink) / 0.5)" }}>Avg response</div>
                  <div style={{ color: "hsl(var(--fyn-ink))", fontWeight: 600, fontFamily: "JetBrains Mono, monospace" }}>{s.responseMs}ms</div>
                </div>
                <div>
                  <div style={{ color: "hsl(var(--fyn-ink) / 0.5)" }}>Uptime</div>
                  <div style={{ color: "hsl(var(--fyn-ink))", fontWeight: 600, fontFamily: "JetBrains Mono, monospace" }}>{s.uptime}</div>
                </div>
              </div>
              <div className="mt-2" style={{ fontFamily: "Roboto, sans-serif", fontSize: 11, color: "hsl(var(--fyn-ink) / 0.55)" }}>
                Last incident: {s.lastIncident}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Response time chart */}
      <Card className="mb-6">
        <h2 className="mb-4" style={{ fontFamily: "Oswald, sans-serif", fontWeight: 600, fontSize: 20, color: "hsl(var(--fyn-ink))" }}>
          API Response Times (Last 24 hours)
        </h2>
        <div style={{ height: 280 }}>
          <ResponsiveContainer>
            <LineChart data={series}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(26,16,8,0.06)" vertical={false} />
              <XAxis dataKey="hour" stroke="hsl(var(--fyn-ink) / 0.5)" fontSize={11} tickFormatter={(v) => `${v}h`} />
              <YAxis stroke="hsl(var(--fyn-ink) / 0.5)" fontSize={11} unit="ms" />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="Supabase" stroke="#1877F2" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="Razorpay" stroke="#0F7B4F" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="Zoho"     stroke="#B45309" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="Claude"   stroke="#C41E1E" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Error log */}
      <Card className="mb-6">
        <h2 className="mb-4" style={{ fontFamily: "Oswald, sans-serif", fontWeight: 600, fontSize: 20, color: "hsl(var(--fyn-ink))" }}>
          Recent Errors (Last 7 days)
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full" style={{ fontFamily: "Roboto, sans-serif", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(26,16,8,0.08)" }}>
                {["Timestamp","Service","Error Type","Message","Count"].map((h) => (
                  <th key={h} className="text-left py-2.5 px-2"
                    style={{ fontFamily: "Raleway, sans-serif", fontWeight: 600, fontSize: 12, color: "hsl(var(--fyn-ink) / 0.6)", textTransform: "uppercase", letterSpacing: 0.5 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ERRORS.map((e, i) => (
                <tr key={i} style={{ borderBottom: "1px solid rgba(26,16,8,0.05)" }}>
                  <td className="py-3 px-2 whitespace-nowrap" style={{ color: "hsl(var(--fyn-ink) / 0.7)" }}>{e.time}</td>
                  <td className="py-3 px-2" style={{ color: "hsl(var(--fyn-ink))" }}>{e.service}</td>
                  <td className="py-3 px-2">
                    <span style={{ padding: "3px 9px", borderRadius: 6, fontWeight: 600, fontSize: 11, background: "rgba(196,30,30,0.12)", color: "#C41E1E" }}>{e.type}</span>
                  </td>
                  <td className="py-3 px-2" style={{ color: "hsl(var(--fyn-ink) / 0.8)" }}>{e.message}</td>
                  <td className="py-3 px-2" style={{ fontFamily: "JetBrains Mono, monospace", color: "hsl(var(--fyn-ink))" }}>{e.count}×</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* 30-day uptime calendar */}
      <Card>
        <h2 className="mb-4" style={{ fontFamily: "Oswald, sans-serif", fontWeight: 600, fontSize: 20, color: "hsl(var(--fyn-ink))" }}>
          30-Day Uptime
        </h2>
        <div className="space-y-3">
          {SERVICES.map((s) => (
            <div key={s.key} className="flex items-center gap-3">
              <div style={{ width: 180, fontFamily: "Raleway, sans-serif", fontWeight: 600, fontSize: 13, color: "hsl(var(--fyn-ink))" }}>
                {s.name}
              </div>
              <div className="flex-1 grid gap-0.5" style={{ gridTemplateColumns: "repeat(30, minmax(0, 1fr))" }}>
                {Array.from({ length: 30 }).map((_, i) => {
                  const r = Math.random();
                  const c = r > 0.97 ? "#C41E1E" : r > 0.92 ? "#F59E0B" : "#10B981";
                  return <div key={i} title={`Day ${i + 1}`} className="h-6 rounded-sm" style={{ background: c, opacity: 0.85 }} />;
                })}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
