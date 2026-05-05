import { useEffect, useMemo, useState } from "react";
import { MessageCircle, Users, DollarSign, Clock } from "lucide-react";
import {
  ResponsiveContainer, ComposedChart, Line, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, CartesianGrid, Legend,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { Card, PageHeader } from "./AdminDashboardPage";

type Log = {
  id: string; user_id: string | null; business_id: string | null;
  prompt: string; model: string; cost_usd: number | null;
  response_time_ms: number | null; status: string; error_message: string | null;
  created_at: string;
};

const SAMPLE_DAILY = Array.from({ length: 30 }, (_, i) => ({
  d: `D${i+1}`, queries: 200 + Math.round(Math.sin(i/4) * 80) + i*4,
  cost: 6 + Math.sin(i/3) * 2 + i*0.15,
}));

export default function AdminAIMonitoringPage() {
  const [logs, setLogs] = useState<Log[]>([]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("ai_usage_logs")
        .select("id,user_id,business_id,prompt,model,cost_usd,response_time_ms,status,error_message,created_at")
        .order("created_at", { ascending: false }).limit(500);
      setLogs((data as Log[]) ?? []);
    })();
  }, []);

  const metrics = useMemo(() => {
    if (logs.length === 0) return { queries: 12847, users: 189, cost: 487.23, avgMs: 3200 };
    const users = new Set(logs.map((l) => l.user_id).filter(Boolean)).size;
    const cost = logs.reduce((a, l) => a + Number(l.cost_usd ?? 0), 0);
    const avgMs = logs.reduce((a, l) => a + Number(l.response_time_ms ?? 0), 0) / logs.length;
    return { queries: logs.length, users, cost, avgMs };
  }, [logs]);

  return (
    <div>
      <PageHeader title="AI System Monitoring" subtitle="Track Nidhi AI CFO usage, cost, and performance" />

      <div className="grid gap-6" style={{ gridTemplateColumns:"repeat(auto-fit, minmax(220px, 1fr))" }}>
        <Metric label="Total AI Queries" value={metrics.queries.toLocaleString("en-IN")} trend={145} icon={<MessageCircle size={22} color="#8B6914" />} />
        <Metric label="Active AI Users" value={String(metrics.users)} trend={28} icon={<Users size={22} color="#8B6914" />} />
        <Metric label="Total AI Cost (USD)" value={`$${metrics.cost.toFixed(2)}`} trend={132} icon={<DollarSign size={22} color="#8B6914" />} />
        <Metric label="Avg Response Time" value={`${(metrics.avgMs/1000).toFixed(1)}s`} trend={-8} icon={<Clock size={22} color="#8B6914" />} />
      </div>

      <Card style={{ marginTop:32, padding:32, height:400 }}>
        <h3 style={h3Style}>AI Usage (Last 30 days)</h3>
        <ResponsiveContainer width="100%" height={310}>
          <ComposedChart data={SAMPLE_DAILY}>
            <defs>
              <linearGradient id="aiCost" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#8B6914" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#8B6914" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(26,16,8,0.06)" vertical={false} />
            <XAxis dataKey="d" tickLine={false} axisLine={false} style={{ fontFamily:"DM Sans, sans-serif", fontSize:11 }} />
            <YAxis yAxisId="left"  tickLine={false} axisLine={false} style={{ fontFamily:"DM Sans, sans-serif", fontSize:11 }} />
            <YAxis yAxisId="right" orientation="right" tickLine={false} axisLine={false} style={{ fontFamily:"DM Sans, sans-serif", fontSize:11 }} unit="$" />
            <Tooltip contentStyle={tip} />
            <Legend />
            <Area yAxisId="right" type="monotone" dataKey="cost" name="Cost (USD)" stroke="#8B6914" strokeWidth={2} fill="url(#aiCost)" />
            <Line yAxisId="left"  type="monotone" dataKey="queries" name="Queries" stroke="#C41E1E" strokeWidth={3} dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </Card>

      <Section title="Top AI Users">
        <Card style={{ padding:0, overflow:"hidden" }}>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead>
              <tr style={{ background:"rgba(26,16,8,0.04)" }}>
                {["User","Business","Queries","Avg Time","Total Cost","Actions"].map((h)=><th key={h} style={th}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {[
                ["Rajesh Kumar","TechCorp","847","2.8s","$34.12"],
                ["Priya Sharma","Growth Labs","624","3.1s","$25.18"],
                ["Amit Patel","Patel Ent","512","3.5s","$20.65"],
                ["Neha Singh","Singh & Co","389","2.9s","$15.47"],
                ["Vikram Reddy","Reddy Ventures","318","3.4s","$12.91"],
              ].map((r,i)=>(
                <tr key={i} style={{ borderTop:"1px solid rgba(26,16,8,0.06)", background:i%2?"rgba(244,237,218,0.3)":"#fff" }}>
                  {r.map((c,j)=><td key={j} style={td}>{c}</td>)}
                  <td style={td}><a style={{ color:"#8B6914", fontWeight:600 }}>View</a></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </Section>

      <Section title="Performance Metrics">
        <div className="grid gap-4 lg:grid-cols-2">
          <Card style={{ height:340 }}>
            <h4 style={h4Style}>Response Time Distribution</h4>
            <ResponsiveContainer width="100%" height={270}>
              <BarChart data={[
                { b:"0-1s", v:6800, c:"#10B981" },
                { b:"1-2s", v:3200, c:"#10B981" },
                { b:"2-3s", v:1900, c:"#10B981" },
                { b:"3-5s", v:720,  c:"#EAC43C" },
                { b:"5-10s",v:180,  c:"#EAC43C" },
                { b:"10s+", v:47,   c:"#C41E1E" },
              ]}>
                <CartesianGrid stroke="rgba(26,16,8,0.06)" vertical={false} />
                <XAxis dataKey="b" tickLine={false} axisLine={false} style={{ fontFamily:"DM Sans, sans-serif", fontSize:12 }} />
                <YAxis tickLine={false} axisLine={false} style={{ fontFamily:"DM Sans, sans-serif", fontSize:12 }} />
                <Tooltip contentStyle={tip} />
                <Bar dataKey="v" radius={[6,6,0,0]}>
                  {/* @ts-ignore */}
                  {["#10B981","#10B981","#10B981","#EAC43C","#EAC43C","#C41E1E"].map((c,i)=>(<Cell key={i} fill={c} />))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
          <Card style={{ height:340, position:"relative" }}>
            <h4 style={h4Style}>Success vs Failure</h4>
            <ResponsiveContainer width="100%" height={270}>
              <PieChart>
                <Pie dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={70} outerRadius={105}
                  data={[
                    { name:"Success", value:98.7 },
                    { name:"Failed", value:1.1 },
                    { name:"Timeout", value:0.2 },
                  ]}>
                  {["#10B981","#C41E1E","#EAC43C"].map((c)=><Cell key={c} fill={c} />)}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%, -10%)", textAlign:"center", pointerEvents:"none" }}>
              <div style={{ fontFamily:"Oswald, sans-serif", fontWeight:700, fontSize:24, color:"hsl(var(--fyn-ink))" }}>98.7%</div>
              <div style={{ fontFamily:"Roboto, sans-serif", fontSize:12, color:"hsl(var(--fyn-ink) / 0.6)" }}>Success</div>
            </div>
          </Card>
        </div>
      </Section>

      <Section title="Recent Errors">
        <Card style={{ padding:0, overflow:"hidden" }}>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead>
              <tr style={{ background:"rgba(26,16,8,0.04)" }}>
                {["Timestamp","User","Error","Response Time","Actions"].map((h)=><th key={h} style={th}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {[
                ["May 5, 14:35","Rajesh","Timeout","15.2s"],
                ["May 5, 12:20","Priya","API Error","8.1s"],
                ["May 5, 09:11","Amit","Timeout","12.6s"],
                ["May 4, 18:42","Neha","Rate limit","2.0s"],
              ].map((r,i)=>(
                <tr key={i} style={{ borderTop:"1px solid rgba(26,16,8,0.06)", background:i%2?"rgba(244,237,218,0.3)":"#fff" }}>
                  {r.map((c,j)=><td key={j} style={td}>{c}</td>)}
                  <td style={td}><a style={{ color:"#8B6914", fontWeight:600 }}>View</a></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </Section>

      <Section title="Common Queries">
        <Card>
          <ol style={{ listStyle:"decimal", paddingLeft:24 }}>
            {[
              ["What's my current cash runway?", 1247],
              ["Show me expenses this month", 892],
              ["When is my next GST deadline?", 678],
              ["Calculate my burn rate", 543],
              ["Show revenue by product", 421],
              ["Top 5 vendors by spend", 318],
              ["Forecast next quarter cashflow", 277],
              ["Outstanding receivables this week", 244],
              ["Compare costs vs last month", 211],
              ["Suggested cost cuts", 188],
            ].map(([q, n]) => (
              <li key={String(q)} className="flex items-center justify-between py-2"
                style={{ borderBottom:"1px solid rgba(26,16,8,0.05)" }}>
                <span style={{ fontFamily:"Roboto, sans-serif", fontSize:14, color:"hsl(var(--fyn-ink))" }}>{q}</span>
                <span style={{ fontFamily:"JetBrains Mono, monospace", fontSize:13, color:"hsl(var(--fyn-ink) / 0.6)" }}>{n.toLocaleString("en-IN")}×</span>
              </li>
            ))}
          </ol>
        </Card>
      </Section>

      <Section title="Cost Analysis">
        <Card style={{ padding:0, overflow:"hidden" }}>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead>
              <tr style={{ background:"rgba(26,16,8,0.04)" }}>
                {["Plan","Avg Queries / User","Avg Cost / User","Total Cost"].map((h)=><th key={h} style={th}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {[
                ["Free Trial","12","$0.42","$24.18"],
                ["Starter","45","$1.84","$143.50"],
                ["Pro","124","$5.12","$281.55"],
                ["Enterprise","412","$15.87","$190.45"],
              ].map((r,i)=>(
                <tr key={i} style={{ borderTop:"1px solid rgba(26,16,8,0.06)", background:i%2?"rgba(244,237,218,0.3)":"#fff" }}>
                  {r.map((c,j)=><td key={j} style={td}>{c}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h3 style={h3Style}>{title}</h3>
      {children}
    </section>
  );
}
function Metric({ label, value, trend, icon }: { label: string; value: string; trend?: number; icon: React.ReactNode }) {
  return (
    <Card style={{ minHeight:140 }}>
      <div className="flex items-start justify-between">
        <span className="grid place-items-center rounded-full"
          style={{ width:48, height:48, background:"linear-gradient(135deg, rgba(196,30,30,0.1), rgba(139,105,20,0.1))" }}>{icon}</span>
        {typeof trend === "number" && (
          <span style={{ color: trend>=0 ? "#10B981":"#DC2626", fontFamily:"DM Sans, sans-serif", fontWeight:600, fontSize:13 }}>
            {trend>0?"+":""}{trend}%
          </span>
        )}
      </div>
      <div className="mt-4" style={{ fontFamily:"Oswald, sans-serif", fontWeight:700, fontSize:36, color:"hsl(var(--fyn-ink))", lineHeight:1 }}>{value}</div>
      <div className="mt-2" style={{ fontFamily:"Raleway, sans-serif", fontSize:14, color:"hsl(var(--fyn-ink) / 0.6)" }}>{label}</div>
    </Card>
  );
}

const h3Style: React.CSSProperties = { fontFamily:"Raleway, sans-serif", fontWeight:600, fontSize:20, color:"hsl(var(--fyn-ink))", marginBottom:16 };
const h4Style: React.CSSProperties = { fontFamily:"Raleway, sans-serif", fontWeight:600, fontSize:15, color:"hsl(var(--fyn-ink))", marginBottom:8 };
const tip: React.CSSProperties = { background:"#1A1008", border:"none", borderRadius:8, color:"#fff", fontFamily:"Roboto, sans-serif", fontSize:13 };
const th: React.CSSProperties = { padding:"14px 16px", textAlign:"left", fontFamily:"Raleway, sans-serif", fontWeight:600, fontSize:13, color:"hsl(var(--fyn-ink))" };
const td: React.CSSProperties = { padding:"12px 16px", fontFamily:"Roboto, sans-serif", fontSize:13.5, color:"hsl(var(--fyn-ink) / 0.85)" };
