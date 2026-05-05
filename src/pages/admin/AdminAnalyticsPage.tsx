import { useState } from "react";
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip,
  CartesianGrid, ReferenceLine, PieChart, Pie, Cell, Legend,
} from "recharts";
import { Download } from "lucide-react";
import { Card, PageHeader } from "./AdminDashboardPage";

export default function AdminAnalyticsPage() {
  const [range, setRange] = useState("30d");

  return (
    <div>
      <div className="flex items-start justify-between flex-wrap gap-4">
        <PageHeader title="Analytics" subtitle="Deep insights into revenue, churn, and usage" />
        <div>
          <select value={range} onChange={(e)=>setRange(e.target.value)}
            style={{ height:44, padding:"0 14px", borderRadius:12, border:"1px solid rgba(26,16,8,0.15)", background:"#fff",
              fontFamily:"Roboto, sans-serif", fontSize:14, color:"hsl(var(--fyn-ink))" }}>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="12m">Last 12 months</option>
            <option value="all">All time</option>
          </select>
          <div className="mt-2 text-right" style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12, color: "hsl(var(--fyn-ink) / 0.6)" }}>
            Showing: {range === "7d" ? "Last 7 days" : range === "30d" ? "Last 30 days" : range === "90d" ? "Last 90 days" : range === "12m" ? "Last 12 months" : "All time"}
          </div>
        </div>
      </div>

      <Section title="Revenue Metrics">
        <div className="grid gap-4" style={{ gridTemplateColumns:"repeat(auto-fit, minmax(180px, 1fr))" }}>
          <SmallMetric label="New MRR"         value="₹82K" trend={25} />
          <SmallMetric label="Expansion MRR"   value="₹45K" trend={12} />
          <SmallMetric label="Contraction MRR" value="₹18K" trend={-5} />
          <SmallMetric label="Churned MRR"     value="₹28K" trend={-8} />
          <SmallMetric label="Net New MRR"     value="₹81K" trend={20} />
        </div>

        <Card style={{ marginTop:16, height:350 }}>
          <h4 style={subTitle}>MRR Movement</h4>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={[
              { k:"Starting", v:340, fill:"#8B6914" },
              { k:"New",      v:82,  fill:"#10B981" },
              { k:"Expansion",v:45,  fill:"#10B981" },
              { k:"Contraction", v:-18, fill:"#C41E1E" },
              { k:"Churn",    v:-28, fill:"#C41E1E" },
              { k:"Ending",   v:421, fill:"#8B6914" },
            ]}>
              <CartesianGrid stroke="rgba(26,16,8,0.06)" vertical={false} />
              <XAxis dataKey="k" stroke="rgba(26,16,8,0.5)" tickLine={false} axisLine={false} style={{ fontFamily:"DM Sans, sans-serif", fontSize:12 }} />
              <YAxis stroke="rgba(26,16,8,0.5)" tickLine={false} axisLine={false} style={{ fontFamily:"DM Sans, sans-serif", fontSize:12 }} unit="K" />
              <Tooltip contentStyle={tipStyle} />
              <Bar dataKey="v" radius={[6,6,0,0]}>
                {/* @ts-ignore */}
                {[ "#8B6914","#10B981","#10B981","#C41E1E","#C41E1E","#8B6914" ].map((c,i)=>(<Cell key={i} fill={c} />))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </Section>

      <Section title="Churn Analysis">
        <div className="grid gap-4 lg:grid-cols-2">
          <Card style={{ height:340 }}>
            <h4 style={subTitle}>Churn Rate Trend</h4>
            <ResponsiveContainer width="100%" height={270}>
              <LineChart data={[
                { m:"Jun", v:5.2 },{ m:"Jul", v:5.0 },{ m:"Aug", v:4.8 },{ m:"Sep", v:5.4 },
                { m:"Oct", v:5.1 },{ m:"Nov", v:4.9 },{ m:"Dec", v:4.6 },{ m:"Jan", v:4.4 },
                { m:"Feb", v:4.5 },{ m:"Mar", v:4.3 },{ m:"Apr", v:4.2 },{ m:"May", v:4.2 },
              ]}>
                <CartesianGrid stroke="rgba(26,16,8,0.06)" vertical={false} />
                <XAxis dataKey="m" tickLine={false} axisLine={false} style={{ fontFamily:"DM Sans, sans-serif", fontSize:12 }} />
                <YAxis tickLine={false} axisLine={false} style={{ fontFamily:"DM Sans, sans-serif", fontSize:12 }} unit="%" />
                <Tooltip contentStyle={tipStyle} />
                <ReferenceLine y={5} stroke="#8B6914" strokeDasharray="4 4" label={{ value:"Target 5%", fill:"#8B6914", fontSize:11 }} />
                <Line type="monotone" dataKey="v" stroke="#10B981" strokeWidth={3} dot={{ r:4 }} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
          <Card style={{ height:340 }}>
            <h4 style={subTitle}>Churn Reasons</h4>
            <ResponsiveContainer width="100%" height={270}>
              <PieChart>
                <Pie dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100}
                  data={[
                    { name:"Price too high", value:35 },
                    { name:"Not using features", value:25 },
                    { name:"Found competitor", value:20 },
                    { name:"Business closed", value:15 },
                    { name:"Other", value:5 },
                  ]}>
                  {["#C41E1E","#D9433D","#E16965","#E89089","#F0B7B0"].map((c)=><Cell key={c} fill={c} />)}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </div>

        <Card style={{ marginTop:16, padding:0, overflow:"hidden" }}>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead>
              <tr style={{ background:"rgba(26,16,8,0.04)" }}>
                {["User","Business","Plan","MRR Lost","Churned","Reason"].map((h)=><th key={h} style={th}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {[
                ["Anita Rao","Rao Designs","Pro","₹7,500","Apr 28","Price too high"],
                ["Manish Verma","Verma Foods","Starter","₹2,500","Apr 24","Not using features"],
                ["Suresh Kumar","SK Logistics","Pro","₹7,500","Apr 18","Found competitor"],
                ["Pooja Joshi","Joshi Studio","Starter","₹2,500","Apr 12","Business closed"],
              ].map((r,i)=>(
                <tr key={i} style={{ borderTop:"1px solid rgba(26,16,8,0.06)", background:i%2?"rgba(244,237,218,0.3)":"#fff" }}>
                  {r.map((c,j)=><td key={j} style={td}>{c}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </Section>

      <Section title="Usage Metrics">
        <div className="grid gap-4" style={{ gridTemplateColumns:"repeat(auto-fit, minmax(180px, 1fr))" }}>
          <SmallMetric label="Daily Active Users"   value="124"  trend={8} />
          <SmallMetric label="Monthly Active Users" value="1,847" trend={12} />
          <SmallMetric label="Avg Session Time"     value="12m 34s" trend={5} />
          <SmallMetric label="Feature Adoption"     value="68%" trend={15} />
        </div>

        <Card style={{ marginTop:16, height:380 }}>
          <h4 style={subTitle}>Feature Usage</h4>
          <ResponsiveContainer width="100%" height={310}>
            <BarChart layout="vertical" data={[
              { f:"AI CFO Nidhi", v:89 },{ f:"Liquidity Intelligence", v:78 },
              { f:"GST Intelligence", v:67 },{ f:"Revenue Intelligence", v:54 },
              { f:"Cost Intelligence", v:52 },{ f:"Decision Simulator", v:34 },
              { f:"HR Intelligence", v:28 },{ f:"Governance Intelligence", v:23 },
            ]} margin={{ left:140 }}>
              <defs>
                <linearGradient id="featBar" x1="0" x2="1" y1="0" y2="0">
                  <stop offset="0%" stopColor="#C41E1E" /><stop offset="100%" stopColor="#8B6914" />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(26,16,8,0.06)" horizontal={false} />
              <XAxis type="number" unit="%" tickLine={false} axisLine={false} />
              <YAxis type="category" dataKey="f" tickLine={false} axisLine={false} style={{ fontFamily:"DM Sans, sans-serif", fontSize:12 }} width={130} />
              <Tooltip contentStyle={tipStyle} />
              <Bar dataKey="v" fill="url(#featBar)" radius={[0,6,6,0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </Section>

      <Section title="Cohort Retention">
        <Card style={{ padding:0, overflow:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", minWidth:760 }}>
            <thead>
              <tr style={{ background:"rgba(26,16,8,0.04)" }}>
                <th style={th}>Cohort</th>
                {["M0","M1","M2","M3","M4","M5","M6"].map((h)=><th key={h} style={{...th, textAlign:"center"}}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {[
                ["Jan 2026", 100, 85, 78, 72, 68, 65, 62],
                ["Feb 2026", 100, 88, 81, 75, 70, 67, null],
                ["Mar 2026", 100, 90, 83, 78, 74, null, null],
                ["Apr 2026", 100, 92, 86, 80, null, null, null],
                ["May 2026", 100, 94, 88, null, null, null, null],
              ].map((row,i)=>(
                <tr key={i} style={{ borderTop:"1px solid rgba(26,16,8,0.06)" }}>
                  <td style={{ ...td, fontWeight:600 }}>{row[0]}</td>
                  {(row.slice(1) as (number|null)[]).map((v,j)=>(
                    <td key={j} style={{ ...td, textAlign:"center", background: heat(v), color: v && v < 50 ? "#fff" : "hsl(var(--fyn-ink))", fontFamily:"DM Sans, sans-serif" }}>
                      {v == null ? "—" : `${v}%`}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </Section>

      <Section title="Customer Lifetime Value">
        <div className="grid gap-4" style={{ gridTemplateColumns:"repeat(auto-fit, minmax(220px, 1fr))" }}>
          <SmallMetric label="Average LTV" value="₹45,000" />
          <SmallMetric label="Customer Acquisition Cost" value="₹8,500" />
          <SmallMetric label="LTV : CAC" value="5.3 : 1" />
        </div>
        <Card style={{ marginTop:16, height:340 }}>
          <h4 style={subTitle}>LTV by Plan</h4>
          <ResponsiveContainer width="100%" height={270}>
            <BarChart data={[
              { p:"Free Trial", v:0 },{ p:"Starter", v:18000 },
              { p:"Pro", v:54000 },{ p:"Enterprise", v:180000 },
            ]}>
              <defs>
                <linearGradient id="ltvBar" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#8B6914" stopOpacity={0.95} />
                  <stop offset="100%" stopColor="#C9A961" stopOpacity={0.6} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(26,16,8,0.06)" vertical={false} />
              <XAxis dataKey="p" tickLine={false} axisLine={false} style={{ fontFamily:"DM Sans, sans-serif", fontSize:12 }} />
              <YAxis tickLine={false} axisLine={false} style={{ fontFamily:"DM Sans, sans-serif", fontSize:12 }}
                tickFormatter={(v)=>`₹${v/1000}K`} />
              <Tooltip contentStyle={tipStyle} formatter={(v: any)=>[`₹${Number(v).toLocaleString("en-IN")}`,"LTV"]} />
              <Bar dataKey="v" fill="url(#ltvBar)" radius={[6,6,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </Section>

      <div className="mt-8 flex flex-wrap gap-3">
        <button style={primaryBtn}><Download size={16} /> Export as PDF</button>
        <button style={secondaryBtn}><Download size={16} /> Export as CSV</button>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h3 style={{ fontFamily:"Raleway, sans-serif", fontWeight:600, fontSize:24, color:"hsl(var(--fyn-ink))", marginBottom:16 }}>{title}</h3>
      {children}
    </section>
  );
}
function SmallMetric({ label, value, trend }: { label: string; value: string; trend?: number }) {
  return (
    <Card style={{ minHeight:120 }}>
      <div style={{ fontFamily:"Raleway, sans-serif", fontSize:13, color:"hsl(var(--fyn-ink) / 0.6)" }}>{label}</div>
      <div className="mt-2" style={{ fontFamily:"Oswald, sans-serif", fontWeight:700, fontSize:30, color:"hsl(var(--fyn-ink))", lineHeight:1 }}>{value}</div>
      {typeof trend === "number" && (
        <div className="mt-2" style={{ color: trend>=0 ? "#10B981":"#DC2626", fontFamily:"DM Sans, sans-serif", fontWeight:600, fontSize:12 }}>
          {trend>0?"+":""}{trend}% vs prev
        </div>
      )}
    </Card>
  );
}

function heat(v: number | null): string {
  if (v == null) return "transparent";
  if (v >= 90) return "rgba(15,143,101,0.85)";
  if (v >= 70) return "rgba(16,185,129,0.45)";
  if (v >= 50) return "rgba(234,196,60,0.45)";
  if (v >= 30) return "rgba(234,140,30,0.55)";
  return "rgba(196,30,30,0.7)";
}

const subTitle: React.CSSProperties = { fontFamily:"Raleway, sans-serif", fontWeight:600, fontSize:16, color:"hsl(var(--fyn-ink))", marginBottom:8 };
const tipStyle: React.CSSProperties = { background:"#1A1008", border:"none", borderRadius:8, color:"#fff", fontFamily:"Roboto, sans-serif", fontSize:13 };
const th: React.CSSProperties = { padding:"14px 16px", textAlign:"left", fontFamily:"Raleway, sans-serif", fontWeight:600, fontSize:13, color:"hsl(var(--fyn-ink))" };
const td: React.CSSProperties = { padding:"12px 16px", fontFamily:"Roboto, sans-serif", fontSize:13.5, color:"hsl(var(--fyn-ink) / 0.85)" };
const primaryBtn: React.CSSProperties = { display:"inline-flex", alignItems:"center", gap:8, height:44, padding:"0 18px", borderRadius:12, background:"linear-gradient(135deg,#C41E1E,#8B6914)", color:"#fff", border:"none", cursor:"pointer", fontFamily:"DM Sans, sans-serif", fontWeight:600, fontSize:14 };
const secondaryBtn: React.CSSProperties = { display:"inline-flex", alignItems:"center", gap:8, height:44, padding:"0 18px", borderRadius:12, background:"transparent", border:"2px solid #8B6914", color:"#8B6914", cursor:"pointer", fontFamily:"DM Sans, sans-serif", fontWeight:600, fontSize:14 };
