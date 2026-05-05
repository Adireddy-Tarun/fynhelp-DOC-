import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  Search,
  LogOut,
  Settings,
  User,
  ChevronDown,
  TrendingUp,
  Upload,
  FileText,
  DollarSign,
  BarChart3,
  Download,
  MessageCircle,
  Shield,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  Line,
  Bar,
  BarChart,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
  ComposedChart,
} from "recharts";

const INK = "#1A1008";
const RED = "#C41E1E";
const BEIGE = "#F4EDDA";
const GOLD = "#8B6914";

const fmtINR = (n: number) =>
  n >= 10000000
    ? `₹${(n / 10000000).toFixed(1)}Cr`
    : n >= 100000
      ? `₹${(n / 100000).toFixed(1)}L`
      : n >= 1000
        ? `₹${(n / 1000).toFixed(0)}K`
        : `₹${n}`;

function Card({ children, span }: { children: React.ReactNode; span?: number }) {
  return (
    <div
      className={span ? `lg:col-span-${span}` : ""}
      style={{
        background: "#fff",
        border: "1px solid rgba(26,16,8,0.08)",
        borderRadius: 16,
        padding: 24,
        boxShadow: "0 1px 3px rgba(26,16,8,0.04)",
      }}
    >
      {children}
    </div>
  );
}

function QuickStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11, color: "rgba(244,237,218,0.7)", textTransform: "uppercase", letterSpacing: 0.5 }}>
        {label}
      </div>
      <div style={{ fontFamily: "Playfair Display, serif", fontSize: 22, color: BEIGE, marginTop: 4 }}>
        {value}
      </div>
    </div>
  );
}

function MetricSmall({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div>
      <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11, color: "hsl(var(--fyn-ink) / 0.55)", textTransform: "uppercase", letterSpacing: 0.5 }}>
        {label}
      </div>
      <div style={{ fontFamily: "Playfair Display, serif", fontSize: 18, color: accent || INK, marginTop: 4 }}>
        {value}
      </div>
    </div>
  );
}

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: 20, color: INK, margin: 0 }}>{children}</h2>
);

export default function DashboardPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [modulesOpen, setModulesOpen] = useState(false);

  const userName = user?.email?.split("@")[0] || "Founder";
  const companyName = "Your Business";
  const hour = new Date().getHours();
  const timeOfDay = hour < 12 ? "morning" : hour < 18 ? "afternoon" : "evening";

  const quickStats = { cash: 420000, runway: 4.2, mrr: 85000, burn: 100000 };
  const healthScore = { overall: 78, liquidity: 85, revenue: 72, costs: 80, compliance: 75 };

  const cashFlowData = Array.from({ length: 30 }, (_, i) => {
    const cashIn = Math.round(Math.random() * 50000 + 30000);
    const cashOut = Math.round(Math.random() * 40000 + 25000);
    return { day: `D${i + 1}`, cashIn, cashOut, net: cashIn - cashOut };
  });

  const mrrData = [
    { month: "Jun", mrr: 45000 }, { month: "Jul", mrr: 52000 }, { month: "Aug", mrr: 58000 },
    { month: "Sep", mrr: 63000 }, { month: "Oct", mrr: 68000 }, { month: "Nov", mrr: 72000 },
    { month: "Dec", mrr: 76000 }, { month: "Jan", mrr: 78000 }, { month: "Feb", mrr: 80000 },
    { month: "Mar", mrr: 82000 }, { month: "Apr", mrr: 84000 }, { month: "May", mrr: 85000 },
  ];

  const costData = [
    { name: "Salaries", value: 45000, color: RED },
    { name: "Cloud/Tech", value: 20000, color: GOLD },
    { name: "Marketing", value: 15000, color: "#3B82F6" },
    { name: "Office", value: 10000, color: "#10B981" },
    { name: "Other", value: 10000, color: "#94A3B8" },
  ];

  const deadlines = [
    { task: "GSTR-3B", date: "May 20, 2026", days: 15, status: "ready" as const },
    { task: "TDS Return", date: "May 31, 2026", days: 26, status: "progress" as const },
    { task: "Income Tax", date: "Jul 31, 2026", days: 87, status: "pending" as const },
  ];

  const recommendations = [
    { icon: "🚨", priority: "high", text: "Low runway (4.2 months) — reduce burn or raise capital" },
    { icon: "💡", priority: "medium", text: "Switch to annual billing, save ₹12K/year" },
    { icon: "📊", priority: "medium", text: "Customer churn increased 3% — review retention" },
    { icon: "✅", priority: "positive", text: "MRR up 12% — keep current growth strategy" },
    { icon: "📅", priority: "reminder", text: "GSTR-3B due in 15 days — review draft" },
  ];

  const priorityBg: Record<string, string> = {
    high: "rgba(196,30,30,0.06)",
    medium: "rgba(139,105,20,0.06)",
    positive: "rgba(16,185,129,0.06)",
    reminder: "rgba(59,130,246,0.06)",
  };
  const priorityBorder: Record<string, string> = {
    high: RED, medium: GOLD, positive: "#10B981", reminder: "#3B82F6",
  };

  const activities = [
    { icon: "💰", text: "₹45K revenue entry added", time: "2 hours ago" },
    { icon: "🏦", text: "HDFC Bank statement processed", time: "5 hours ago" },
    { icon: "💬", text: 'Nidhi answered: "What\'s my runway?"', time: "1 day ago" },
    { icon: "👤", text: "New customer: TechCorp Pvt Ltd", time: "1 day ago" },
    { icon: "📄", text: "GSTR-3B draft updated", time: "2 days ago" },
    { icon: "⚠️", text: "Cost alert: Cloud spend increased 15%", time: "3 days ago" },
  ];

  const scoreColor = (s: number) => (s >= 80 ? "#10B981" : s >= 60 ? "#F59E0B" : "#DC2626");

  const modules = [
    "Liquidity Intelligence", "Revenue Intelligence", "Cost Intelligence", "GST & Tax Intelligence",
    "Governance Intelligence", "HR & Workforce Intelligence", "Decision Simulator",
    "Market & Growth Intelligence", "Banking & Fintech Intelligence", "CA & Partner Ecosystem",
  ];

  const quickActions = [
    { icon: <Upload size={20} />, label: "Upload Statement" },
    { icon: <FileText size={20} />, label: "Record Expense" },
    { icon: <DollarSign size={20} />, label: "Add Revenue" },
    { icon: <BarChart3 size={20} />, label: "Run Forecast" },
    { icon: <Download size={20} />, label: "Export Reports" },
    { icon: <MessageCircle size={20} />, label: "Ask Nidhi" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: BEIGE, fontFamily: "Roboto, sans-serif" }}>
      {/* Top Nav */}
      <header style={{ background: INK, color: BEIGE, position: "sticky", top: 0, zIndex: 50, borderBottom: `1px solid rgba(244,237,218,0.1)` }}>
        <div style={{ maxWidth: 1440, margin: "0 auto", padding: "0 24px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
            <button onClick={() => navigate("/dashboard")} style={{ background: "transparent", border: "none", cursor: "pointer", color: BEIGE, fontFamily: "Playfair Display, serif", fontSize: 22, fontWeight: 700 }}>
              FYNHelp
            </button>

            <div style={{ position: "relative" }}>
              <button
                onClick={() => setModulesOpen(!modulesOpen)}
                className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[rgba(244,237,218,0.1)]"
                style={{ border: "none", background: "transparent", cursor: "pointer", color: BEIGE, fontSize: 14 }}
              >
                Intelligence Modules <ChevronDown size={16} />
              </button>

              {modulesOpen && (
                <>
                  <div onClick={() => setModulesOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 40 }} />
                  <div style={{ position: "absolute", top: 48, left: 0, width: 280, background: "#fff", borderRadius: 12, boxShadow: "0 12px 40px rgba(0,0,0,0.18)", zIndex: 50, overflow: "hidden", color: INK }}>
                    {modules.map((m) => (
                      <button
                        key={m}
                        onClick={() => { setModulesOpen(false); toast.info(`${m} coming soon`); }}
                        className="w-full text-left px-4 py-3 hover:bg-[hsl(var(--fyn-ink)/0.04)]"
                        style={{ border: "none", background: "transparent", cursor: "pointer", fontSize: 14 }}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button onClick={() => toast.info("Global search coming soon")} className="p-2 rounded-lg hover:bg-[rgba(244,237,218,0.1)]" style={{ background: "transparent", border: "none", cursor: "pointer", color: BEIGE }}>
              <Search size={20} />
            </button>
            <button onClick={() => toast.info("Notifications coming soon")} className="relative p-2 rounded-lg hover:bg-[rgba(244,237,218,0.1)]" style={{ background: "transparent", border: "none", cursor: "pointer", color: BEIGE }}>
              <Bell size={20} />
              <span style={{ position: "absolute", top: 6, right: 6, width: 8, height: 8, borderRadius: "50%", background: RED }} />
            </button>

            <div style={{ position: "relative" }}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-[rgba(244,237,218,0.1)]"
                style={{ border: "none", background: "transparent", cursor: "pointer", color: BEIGE }}
              >
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: GOLD, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>
                  {userName.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:inline" style={{ fontSize: 14 }}>{userName}</span>
                <ChevronDown size={14} />
              </button>

              {menuOpen && (
                <>
                  <div onClick={() => setMenuOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 40 }} />
                  <div style={{ position: "absolute", top: 48, right: 0, width: 220, background: "#fff", borderRadius: 12, boxShadow: "0 12px 40px rgba(0,0,0,0.18)", zIndex: 50, overflow: "hidden", color: INK }}>
                    <button onClick={() => { setMenuOpen(false); toast.info("Profile coming soon"); }} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[hsl(var(--fyn-ink)/0.04)] text-left" style={{ border: "none", background: "transparent", cursor: "pointer" }}>
                      <User size={16} /> Profile
                    </button>
                    <button onClick={() => { setMenuOpen(false); toast.info("Settings coming soon"); }} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[hsl(var(--fyn-ink)/0.04)] text-left" style={{ border: "none", background: "transparent", cursor: "pointer" }}>
                      <Settings size={16} /> Settings
                    </button>
                    <button onClick={() => { setMenuOpen(false); navigate("/admin/dashboard"); toast.info("Switched to Admin Portal"); }} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[hsl(var(--fyn-ink)/0.04)] text-left" style={{ border: "none", background: "transparent", cursor: "pointer" }}>
                      <Shield size={16} /> Switch to Admin
                    </button>
                    <div style={{ height: 1, background: "rgba(26,16,8,0.08)" }} />
                    <button onClick={async () => { await signOut(); navigate("/"); }} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[hsl(var(--fyn-ink)/0.04)] text-left" style={{ border: "none", background: "transparent", cursor: "pointer", color: RED }}>
                      <LogOut size={16} /> Sign out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main style={{ maxWidth: 1440, margin: "0 auto", padding: 24 }}>
        {/* Welcome Banner */}
        <div style={{ background: `linear-gradient(135deg, ${INK} 0%, #2A1A0E 100%)`, color: BEIGE, borderRadius: 16, padding: 28, marginBottom: 24 }}>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <h1 style={{ fontFamily: "Playfair Display, serif", fontSize: 28, margin: 0 }}>
                Good {timeOfDay}, {userName}
              </h1>
              <div style={{ marginTop: 6, fontSize: 14, color: "rgba(244,237,218,0.75)" }}>
                {companyName} · {new Date().toLocaleDateString("en-IN", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <QuickStat label="Cash" value={fmtINR(quickStats.cash)} />
              <QuickStat label="Runway" value={`${quickStats.runway}mo`} />
              <QuickStat label="MRR" value={fmtINR(quickStats.mrr)} />
              <QuickStat label="Burn" value={fmtINR(quickStats.burn)} />
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* AI CFO Nidhi */}
          <div className="md:col-span-2 lg:col-span-2">
            <Card>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <div style={{ width: 48, height: 48, borderRadius: "50%", background: `linear-gradient(135deg, ${RED} 0%, ${GOLD} 100%)`, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Playfair Display, serif", fontSize: 22, fontWeight: 700 }}>
                  N
                </div>
                <div>
                  <SectionTitle>Ask Nidhi, Your AI CFO</SectionTitle>
                  <div style={{ fontSize: 12, color: "hsl(var(--fyn-ink) / 0.6)", display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#10B981" }} /> Online
                  </div>
                </div>
              </div>

              <input
                placeholder="Ask anything about your business…"
                onKeyDown={(e) => { if (e.key === "Enter") toast.info("AI CFO conversation coming soon"); }}
                style={{ width: "100%", padding: "14px 16px", borderRadius: 12, border: "1px solid rgba(26,16,8,0.12)", fontSize: 14, fontFamily: "Roboto, sans-serif", outline: "none" }}
              />

              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
                {["What's my runway?", "Show cash flow forecast", "When should I hire?", "Can I afford new equipment?"].map((q) => (
                  <button
                    key={q}
                    onClick={() => toast.info(`"${q}" — AI response coming soon`)}
                    style={{ border: "1px solid rgba(26,16,8,0.12)", background: "#fff", padding: "6px 12px", borderRadius: 8, fontSize: 12, color: "hsl(var(--fyn-ink) / 0.7)", cursor: "pointer" }}
                  >
                    {q}
                  </button>
                ))}
              </div>

              <div style={{ marginTop: 20 }}>
                <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11, color: "hsl(var(--fyn-ink) / 0.55)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>
                  Recent Conversations
                </div>
                <button
                  onClick={() => toast.info("Full conversation coming soon")}
                  className="w-full text-left"
                  style={{ border: "1px solid rgba(26,16,8,0.08)", background: "rgba(255,255,255,0.5)", padding: 12, borderRadius: 12, cursor: "pointer" }}
                >
                  <div style={{ fontSize: 13, fontWeight: 600, color: INK }}>You asked: What's my runway?</div>
                  <div style={{ fontSize: 12, color: "hsl(var(--fyn-ink) / 0.7)", marginTop: 4 }}>
                    Nidhi said: Based on current burn rate of ₹1.0L/month and cash balance of ₹4.2L, you have 4.2 months…
                  </div>
                  <div style={{ fontSize: 11, color: "hsl(var(--fyn-ink) / 0.5)", marginTop: 4 }}>2 hours ago</div>
                </button>
              </div>

              <button
                onClick={() => toast.info("New conversation coming soon")}
                style={{ width: "100%", marginTop: 16, padding: "12px 16px", borderRadius: 12, color: "#fff", background: `linear-gradient(135deg, ${RED} 0%, ${GOLD} 100%)`, border: "none", fontFamily: "Raleway, sans-serif", fontWeight: 700, fontSize: 15, cursor: "pointer" }}
              >
                Start New Conversation
              </button>
            </Card>
          </div>

          {/* Financial Health Score */}
          <Card>
            <SectionTitle>Financial Health Score</SectionTitle>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 16 }}>
              <div style={{ position: "relative", width: 140, height: 140 }}>
                <svg width="140" height="140" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(26,16,8,0.08)" strokeWidth="10" />
                  <circle
                    cx="50" cy="50" r="45" fill="none"
                    stroke={scoreColor(healthScore.overall)}
                    strokeWidth="10"
                    strokeDasharray={`${(healthScore.overall / 100) * 283} 283`}
                    strokeLinecap="round"
                    transform="rotate(-90 50 50)"
                  />
                </svg>
                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ fontFamily: "Playfair Display, serif", fontSize: 32, color: INK }}>{healthScore.overall}</div>
                  <div style={{ fontSize: 11, color: "hsl(var(--fyn-ink) / 0.55)" }}>/ 100</div>
                </div>
              </div>

              <div style={{ width: "100%", marginTop: 20, display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  { label: "Liquidity", score: healthScore.liquidity },
                  { label: "Revenue Health", score: healthScore.revenue },
                  { label: "Cost Efficiency", score: healthScore.costs },
                  { label: "Compliance", score: healthScore.compliance },
                ].map((item) => (
                  <div key={item.label}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                      <span style={{ color: "hsl(var(--fyn-ink) / 0.7)" }}>{item.label}</span>
                      <span style={{ color: scoreColor(item.score), fontWeight: 600 }}>{item.score}/100</span>
                    </div>
                    <div style={{ height: 6, borderRadius: 3, background: "rgba(26,16,8,0.08)", overflow: "hidden" }}>
                      <div style={{ width: `${item.score}%`, height: "100%", background: scoreColor(item.score), borderRadius: 3 }} />
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => toast.info("Detailed report coming soon")}
                style={{ width: "100%", marginTop: 20, padding: "10px", borderRadius: 8, border: `2px solid ${GOLD}`, background: "transparent", color: GOLD, fontFamily: "Raleway, sans-serif", fontWeight: 600, fontSize: 13, cursor: "pointer" }}
              >
                View Detailed Report
              </button>
            </div>
          </Card>

          {/* Recommendations */}
          <Card>
            <SectionTitle>Nidhi's Recommendations</SectionTitle>
            <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 10 }}>
              {recommendations.map((r, i) => (
                <div key={i} style={{ background: priorityBg[r.priority], borderLeft: `3px solid ${priorityBorder[r.priority]}`, padding: 12, borderRadius: 8 }}>
                  <div style={{ display: "flex", gap: 10 }}>
                    <span style={{ fontSize: 18 }}>{r.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, color: INK, lineHeight: 1.4 }}>{r.text}</div>
                      <button onClick={() => toast.info("Details coming soon")} style={{ marginTop: 4, color: GOLD, fontFamily: "DM Sans, sans-serif", fontSize: 11, fontWeight: 600, background: "transparent", border: "none", cursor: "pointer", padding: 0 }}>
                        View Details →
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Liquidity */}
          <div className="md:col-span-2 lg:col-span-2">
            <Card>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <SectionTitle>Liquidity & Cash Flow</SectionTitle>
                <button onClick={() => toast.info("Full report coming soon")} style={{ color: GOLD, fontFamily: "Raleway, sans-serif", fontSize: 13, fontWeight: 600, background: "transparent", border: "none", cursor: "pointer" }}>
                  View Full Report →
                </button>
              </div>
              <div style={{ fontFamily: "Playfair Display, serif", fontSize: 32, color: INK, marginBottom: 12 }}>{fmtINR(quickStats.cash)}</div>

              <div style={{ height: 200 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={cashFlowData}>
                    <defs>
                      <linearGradient id="gIn" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10B981" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gOut" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={RED} stopOpacity={0.4} />
                        <stop offset="100%" stopColor={RED} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(26,16,8,0.06)" />
                    <XAxis dataKey="day" hide />
                    <YAxis tickFormatter={(v) => fmtINR(v as number)} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v: number) => fmtINR(v)} />
                    <Legend />
                    <Area type="monotone" dataKey="cashIn" name="Cash In" stroke="#10B981" fill="url(#gIn)" />
                    <Area type="monotone" dataKey="cashOut" name="Cash Out" stroke={RED} fill="url(#gOut)" />
                    <Area type="monotone" dataKey="net" name="Net" stroke={GOLD} fill="none" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-3 gap-4" style={{ marginTop: 16 }}>
                <MetricSmall label="Cash In (30d)" value="₹12.5L" accent="#10B981" />
                <MetricSmall label="Cash Out (30d)" value="₹11.2L" accent={RED} />
                <MetricSmall label="Net Flow" value="+₹1.3L" accent="#10B981" />
              </div>

              <div style={{ marginTop: 12, padding: 12, borderRadius: 8, background: "rgba(196,30,30,0.06)", borderLeft: `3px solid ${RED}`, fontSize: 13, color: INK }}>
                ⚠️ Low balance alert: Projected to hit ₹1L in 2 weeks
              </div>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <SectionTitle>Quick Actions</SectionTitle>
            <div className="grid grid-cols-2 gap-3" style={{ marginTop: 16 }}>
              {quickActions.map((item) => (
                <button
                  key={item.label}
                  onClick={() => toast.info(`${item.label} coming soon`)}
                  style={{ padding: 16, borderRadius: 12, border: "1px solid rgba(26,16,8,0.1)", background: "#fff", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, transition: "transform 0.15s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.03)")}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                >
                  <span style={{ color: GOLD }}>{item.icon}</span>
                  <span style={{ fontSize: 12, color: INK, fontWeight: 500, textAlign: "center" }}>{item.label}</span>
                </button>
              ))}
            </div>
          </Card>

          {/* Revenue */}
          <Card>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <SectionTitle>Revenue Overview</SectionTitle>
              <button onClick={() => toast.info("Revenue details coming soon")} style={{ color: GOLD, fontSize: 13, fontWeight: 600, background: "transparent", border: "none", cursor: "pointer" }}>
                View Details →
              </button>
            </div>
            <div style={{ fontFamily: "Playfair Display, serif", fontSize: 32, color: INK, marginTop: 12 }}>{fmtINR(quickStats.mrr)}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13, color: "#10B981", marginTop: 4 }}>
              <TrendingUp size={14} /> +12% vs last month
            </div>

            <div style={{ height: 180, marginTop: 12 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mrrData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(26,16,8,0.06)" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tickFormatter={(v) => fmtINR(v as number)} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => fmtINR(v)} />
                  <Bar dataKey="mrr" fill={GOLD} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 gap-4" style={{ marginTop: 12 }}>
              <MetricSmall label="ARR" value="₹10.2L" />
              <MetricSmall label="Customers" value="23" />
              <MetricSmall label="ARPU" value="₹3.7K" />
              <MetricSmall label="Churn" value="3.2%" accent={RED} />
            </div>
          </Card>

          {/* Cost */}
          <div className="md:col-span-2 lg:col-span-2">
            <Card>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <SectionTitle>Cost Breakdown</SectionTitle>
                <button onClick={() => toast.info("Cost optimization coming soon")} style={{ color: GOLD, fontSize: 13, fontWeight: 600, background: "transparent", border: "none", cursor: "pointer" }}>
                  Optimize Costs →
                </button>
              </div>
              <div style={{ fontFamily: "Playfair Display, serif", fontSize: 32, color: INK, marginTop: 12 }}>{fmtINR(quickStats.burn)}</div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4" style={{ marginTop: 12 }}>
                <div style={{ height: 220 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={costData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={85} paddingAngle={2}>
                        {costData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v: number) => fmtINR(v)} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, justifyContent: "center" }}>
                  {costData.map((item) => (
                    <div key={item.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 13 }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ width: 10, height: 10, borderRadius: 2, background: item.color }} />
                        {item.name}
                      </span>
                      <span style={{ fontWeight: 600, color: INK }}>{fmtINR(item.value)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4" style={{ marginTop: 16 }}>
                <MetricSmall label="Avg Monthly Spend" value="₹98K" />
                <MetricSmall label="Largest Expense" value="Salaries" />
                <MetricSmall label="Cost / Customer" value="₹4,348" />
              </div>

              <div style={{ marginTop: 12, padding: 12, borderRadius: 8, background: "rgba(139,105,20,0.08)", borderLeft: `3px solid ${GOLD}`, fontSize: 13, color: INK }}>
                💡 Savings opportunity: Switch cloud provider, save ₹5K/month
              </div>
            </Card>
          </div>

          {/* GST & Tax */}
          <div className="md:col-span-2 lg:col-span-3">
            <Card>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <SectionTitle>GST & Tax Status</SectionTitle>
                  <span style={{ padding: "4px 10px", borderRadius: 999, background: "rgba(16,185,129,0.12)", color: "#10B981", fontSize: 12, fontWeight: 600 }}>
                    ✓ All Compliant
                  </span>
                </div>
                <button onClick={() => toast.info("Full compliance calendar coming soon")} style={{ color: GOLD, fontSize: 13, fontWeight: 600, background: "transparent", border: "none", cursor: "pointer" }}>
                  View Full Calendar →
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4" style={{ marginTop: 16 }}>
                {deadlines.map((d) => {
                  const color = d.status === "ready" ? "#10B981" : d.status === "progress" ? "#F59E0B" : "#94A3B8";
                  const label = d.status === "ready" ? "Ready to File" : d.status === "progress" ? "In Progress" : "Not Started";
                  return (
                    <div key={d.task} style={{ padding: 16, borderRadius: 12, border: `1px solid rgba(26,16,8,0.08)`, borderTop: `3px solid ${color}` }}>
                      <div style={{ fontFamily: "Playfair Display, serif", fontSize: 18, color: INK }}>{d.task}</div>
                      <div style={{ fontSize: 12, color: "hsl(var(--fyn-ink) / 0.65)", marginTop: 4 }}>
                        Due: {d.date} ({d.days} days)
                      </div>
                      <span style={{ display: "inline-block", marginTop: 10, padding: "4px 10px", borderRadius: 999, background: `${color}1A`, color, fontSize: 11, fontWeight: 600 }}>
                        {label}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="grid grid-cols-2 gap-4" style={{ marginTop: 16 }}>
                <MetricSmall label="GST Collected (Q1)" value="₹1.2L" />
                <MetricSmall label="TDS Deducted (Q1)" value="₹45K" />
              </div>
            </Card>
          </div>

          {/* Recent Activity */}
          <div className="md:col-span-2 lg:col-span-3">
            <Card>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <SectionTitle>Recent Activity</SectionTitle>
                <button onClick={() => toast.info("Full activity log coming soon")} style={{ color: GOLD, fontSize: 13, fontWeight: 600, background: "transparent", border: "none", cursor: "pointer" }}>
                  View All →
                </button>
              </div>
              <div style={{ marginTop: 16, display: "flex", flexDirection: "column" }}>
                {activities.map((a, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: i < activities.length - 1 ? "1px solid rgba(26,16,8,0.06)" : "none" }}>
                    <span style={{ fontSize: 18 }}>{a.icon}</span>
                    <div style={{ flex: 1, fontSize: 13, color: INK }}>{a.text}</div>
                    <div style={{ fontSize: 12, color: "hsl(var(--fyn-ink) / 0.55)" }}>{a.time}</div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
