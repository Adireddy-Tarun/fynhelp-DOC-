import { useState } from "react";
import { MessageCircle, Send } from "lucide-react";
import { toast } from "sonner";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { PageHeader, Card } from "./AdminDashboardPage";

const fmtINR = (n: number) =>
  n >= 10000000 ? `₹${(n / 10000000).toFixed(1)}Cr`
  : n >= 100000 ? `₹${(n / 100000).toFixed(1)}L`
  : n >= 1000 ? `₹${(n / 1000).toFixed(1)}K`
  : `₹${n}`;

type Status = "excellent" | "good" | "neutral" | "warning";
const statusColors: Record<Status, { bg: string; border: string; text: string }> = {
  excellent: { bg: "rgba(16,185,129,0.12)", border: "rgba(16,185,129,0.3)", text: "#0F7B4F" },
  good:      { bg: "rgba(139,105,20,0.12)", border: "rgba(139,105,20,0.3)", text: "#8B6914" },
  neutral:   { bg: "rgba(59,130,246,0.12)", border: "rgba(59,130,246,0.3)", text: "#3B82F6" },
  warning:   { bg: "rgba(251,191,36,0.12)", border: "rgba(251,191,36,0.3)", text: "#B45309" },
};

const strategic = [
  { label: "Runway", value: "18.5 mo", status: "excellent" as Status },
  { label: "Burn Rate", value: "₹4.5L/mo", status: "good" as Status },
  { label: "Lifetime Value", value: "₹1.56L", status: "excellent" as Status },
  { label: "CAC", value: "₹12K", status: "neutral" as Status },
  { label: "LTV : CAC", value: "13×", status: "excellent" as Status },
  { label: "Gross Margin", value: "87%", status: "excellent" as Status },
];

const targetsData = [
  { metric: "New Users", target: 150, actual: 145, status: "on-track" },
  { metric: "MRR Growth", target: 200000, actual: 225000, status: "exceeds" },
  { metric: "Churn Rate %", target: 3.5, actual: 2.8, status: "exceeds" },
  { metric: "Support SLA %", target: 95, actual: 92, status: "at-risk" },
];

const cashFlowData = [
  { month: "Jun", cash: 8200000 },
  { month: "Jul", cash: 7900000 },
  { month: "Aug", cash: 7700000 },
  { month: "Sep", cash: 7600000 },
  { month: "Oct", cash: 7600000 },
  { month: "Nov", cash: 7700000 },
];

type Query = {
  id: number; user: string; type: "complaint" | "query" | "feedback";
  priority: "urgent" | "high" | "medium" | "low";
  subject: string; message: string; timestamp: string; status: string;
};

const customerQueries: Query[] = [
  { id: 1, user: "Rajesh Kumar (TechCorp)", type: "complaint", priority: "high",
    subject: "CSV upload failing repeatedly",
    message: "I've tried uploading my bank statement 5 times but it keeps showing 'Processing failed'. This is blocking my month-end close.",
    timestamp: "2 hours ago", status: "open" },
  { id: 2, user: "Priya Sharma (Growth Labs)", type: "query", priority: "medium",
    subject: "How to integrate Zoho Books?",
    message: "I want to connect my Zoho Books account but can't find the integration option in settings.",
    timestamp: "5 hours ago", status: "open" },
  { id: 3, user: "Amit Patel (Design Studio)", type: "feedback", priority: "low",
    subject: "Love the AI CFO feature!",
    message: "Nidhi has been incredibly helpful. Saved me 2 hours today. Would love more forecasting features.",
    timestamp: "1 day ago", status: "acknowledged" },
  { id: 4, user: "Sneha Reddy (E-Commerce Co)", type: "complaint", priority: "urgent",
    subject: "Wrong GST calculation in report",
    message: "The GSTR-3B draft shows incorrect ITC amount. Filing deadline is in 3 days.",
    timestamp: "1 day ago", status: "open" },
];

const PRIORITY_STYLE: Record<Query["priority"], { bg: string; fg: string }> = {
  urgent: { bg: "rgba(196,30,30,0.15)", fg: "#C41E1E" },
  high:   { bg: "rgba(251,191,36,0.18)", fg: "#B45309" },
  medium: { bg: "rgba(59,130,246,0.15)", fg: "#1D4ED8" },
  low:    { bg: "rgba(26,16,8,0.08)",   fg: "rgba(26,16,8,0.6)" },
};

export default function AdminCeoViewPage() {
  const [selectedQuery, setSelectedQuery] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");

  const handleSend = (id: number) => {
    if (!replyText.trim()) return;
    toast.success(`Reply sent to query #${id}`);
    setReplyText("");
    setSelectedQuery(null);
  };

  return (
    <div>
      <div className="flex items-start justify-between gap-4 flex-wrap mb-2">
        <PageHeader title="CEO Strategic View" subtitle="High-level platform intelligence & customer pulse" />
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full"
          style={{
            background: "linear-gradient(135deg, rgba(196,30,30,0.12), rgba(139,105,20,0.12))",
            border: "1px solid rgba(139,105,20,0.35)",
            fontFamily: "DM Sans, sans-serif", fontWeight: 700, fontSize: 11,
            color: "#8B6914", letterSpacing: 0.6, marginTop: 8,
          }}>
          <Lock size={12} /> SUPER ADMIN ONLY
        </span>
      </div>

      {/* Strategic metrics */}
      <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))" }}>
        {strategic.map((s) => {
          const c = statusColors[s.status];
          return (
            <div key={s.label} className="p-4 rounded-xl"
              style={{ background: c.bg, border: `1px solid ${c.border}` }}>
              <div style={{ fontFamily: "Roboto, sans-serif", fontSize: 11, color: "hsl(var(--fyn-ink) / 0.65)", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>
                {s.label}
              </div>
              <div style={{ fontFamily: "Oswald, sans-serif", fontSize: 24, fontWeight: 700, color: c.text }}>
                {s.value}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <h3 style={cardTitle}>Monthly Targets vs Actuals</h3>
          <div className="space-y-4">
            {targetsData.map((t) => {
              const pct = Math.min(150, Math.round((t.actual / t.target) * 100));
              const barColor = t.status === "exceeds" ? "#10B981" : t.status === "on-track" ? "#8B6914" : "#C41E1E";
              return (
                <div key={t.metric}>
                  <div className="flex justify-between mb-2" style={{ fontFamily: "Roboto, sans-serif", fontSize: 13 }}>
                    <span style={{ color: "hsl(var(--fyn-ink))", fontWeight: 600 }}>{t.metric}</span>
                    <span style={{ color: "hsl(var(--fyn-ink) / 0.6)" }}>
                      {typeof t.actual === "number" && t.actual >= 1000 ? fmtINR(t.actual) : t.actual}
                      {" / "}
                      {typeof t.target === "number" && t.target >= 1000 ? fmtINR(t.target) : t.target}
                    </span>
                  </div>
                  <div style={{ height: 8, background: "rgba(26,16,8,0.08)", borderRadius: 4, overflow: "hidden" }}>
                    <div style={{ width: `${Math.min(100, pct)}%`, height: "100%", background: barColor, transition: "width 0.4s ease" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card>
          <h3 style={cardTitle}>6-Month Cash Flow Projection</h3>
          <div style={{ width: "100%", height: 240 }}>
            <ResponsiveContainer>
              <AreaChart data={cashFlowData}>
                <defs>
                  <linearGradient id="ceoCash" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#8B6914" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#C41E1E" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(26,16,8,0.06)" vertical={false} />
                <XAxis dataKey="month" stroke="rgba(26,16,8,0.5)" tickLine={false} axisLine={false} style={{ fontSize: 12 }} />
                <YAxis tickFormatter={(v) => fmtINR(v)} stroke="rgba(26,16,8,0.5)" tickLine={false} axisLine={false} style={{ fontSize: 12 }} />
                <Tooltip formatter={(v: number) => fmtINR(v)} contentStyle={{ background: "#1A1008", border: "none", borderRadius: 8, color: "#fff", fontSize: 13 }} />
                <Area type="monotone" dataKey="cash" stroke="#8B6914" strokeWidth={2} fill="url(#ceoCash)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <h3 className="mt-10 mb-4" style={{ fontFamily: "Raleway, sans-serif", fontWeight: 600, fontSize: 20, color: "hsl(var(--fyn-ink))" }}>
        Customer Support Feed
      </h3>
      <Card style={{ padding: 0 }}>
        <div className="grid lg:grid-cols-3" style={{ minHeight: 480 }}>
          {/* Query list */}
          <div className="lg:col-span-2 p-5 space-y-3" style={{ borderRight: "1px solid rgba(26,16,8,0.08)" }}>
            {customerQueries.map((q) => {
              const isSel = selectedQuery === q.id;
              const ps = PRIORITY_STYLE[q.priority];
              return (
                <div key={q.id} onClick={() => setSelectedQuery(q.id)}
                  className="p-4 rounded-xl cursor-pointer transition-all"
                  style={{
                    background: isSel ? "rgba(139,105,20,0.1)" : "rgba(255,255,255,0.6)",
                    border: `1px solid ${isSel ? "rgba(139,105,20,0.35)" : "rgba(26,16,8,0.1)"}`,
                  }}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span style={{ background: ps.bg, color: ps.fg, padding: "2px 8px", borderRadius: 4, fontFamily: "DM Sans, sans-serif", fontWeight: 700, fontSize: 10, letterSpacing: 0.4 }}>
                        {q.priority.toUpperCase()}
                      </span>
                      <span style={{ background: "rgba(26,16,8,0.06)", color: "hsl(var(--fyn-ink) / 0.7)", padding: "2px 8px", borderRadius: 4, fontFamily: "Roboto, sans-serif", fontSize: 11, textTransform: "capitalize" }}>
                        {q.type}
                      </span>
                    </div>
                    <span style={{ fontFamily: "Roboto, sans-serif", fontSize: 11, color: "hsl(var(--fyn-ink) / 0.5)" }}>{q.timestamp}</span>
                  </div>
                  <div style={{ fontFamily: "Raleway, sans-serif", fontWeight: 600, fontSize: 15, color: "hsl(var(--fyn-ink))", marginBottom: 4 }}>
                    {q.subject}
                  </div>
                  <div style={{ fontFamily: "Roboto, sans-serif", fontSize: 12, color: "hsl(var(--fyn-gold))", marginBottom: 6, fontWeight: 500 }}>
                    {q.user}
                  </div>
                  <div style={{ fontFamily: "Roboto, sans-serif", fontSize: 13, color: "hsl(var(--fyn-ink) / 0.7)", lineHeight: 1.5 }}>
                    {q.message}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Reply */}
          <div className="p-5">
            {selectedQuery ? (
              <div>
                <h4 style={{ fontFamily: "Raleway, sans-serif", fontWeight: 600, fontSize: 15, color: "hsl(var(--fyn-ink))", marginBottom: 12 }}>
                  Quick Reply
                </h4>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your response..."
                  rows={8}
                  className="w-full rounded-lg px-3 py-2.5 mb-3 resize-none"
                  style={{ border: "1px solid rgba(26,16,8,0.15)", fontFamily: "Roboto, sans-serif", fontSize: 13, lineHeight: 1.5, background: "#fff" }}
                />
                <button
                  onClick={() => handleSend(selectedQuery)}
                  disabled={!replyText.trim()}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg"
                  style={{
                    background: replyText.trim() ? "linear-gradient(135deg,#C41E1E 0%,#8B6914 100%)" : "rgba(26,16,8,0.1)",
                    color: replyText.trim() ? "#fff" : "rgba(26,16,8,0.4)",
                    border: "none", cursor: replyText.trim() ? "pointer" : "not-allowed",
                    fontFamily: "Raleway, sans-serif", fontWeight: 600, fontSize: 14,
                  }}
                >
                  <Send size={16} /> Send Reply
                </button>
                <div className="mt-4 pt-4" style={{ borderTop: "1px solid rgba(26,16,8,0.1)" }}>
                  <button
                    onClick={() => toast.info("Escalated to support team")}
                    className="w-full py-2 rounded-lg"
                    style={{
                      background: "transparent", border: "1px solid rgba(196,30,30,0.3)",
                      color: "#C41E1E", fontFamily: "Raleway, sans-serif", fontWeight: 600, fontSize: 13, cursor: "pointer",
                    }}
                  >
                    Escalate to Team
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-8 rounded-xl text-center" style={{ background: "rgba(26,16,8,0.03)", border: "1px solid rgba(26,16,8,0.08)" }}>
                <MessageCircle size={48} color="hsl(var(--fyn-ink) / 0.3)" style={{ margin: "0 auto 16px" }} />
                <p style={{ fontFamily: "Roboto, sans-serif", fontSize: 13, color: "hsl(var(--fyn-ink) / 0.5)" }}>
                  Select a query to reply
                </p>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}

const cardTitle: React.CSSProperties = {
  fontFamily: "Raleway, sans-serif", fontWeight: 600, fontSize: 18, color: "hsl(var(--fyn-ink))", marginBottom: 16,
};
