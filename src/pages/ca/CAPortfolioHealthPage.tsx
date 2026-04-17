import { COLORS, PageWrap, PageHeader, Card, MetricCard } from "@/components/ca/ui";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const HEALTH_DIST = [
  { band: "0-40", clients: 8, color: COLORS.red },
  { band: "41-60", clients: 11, color: COLORS.amber },
  { band: "61-80", clients: 18, color: COLORS.blueSoft },
  { band: "81-100", clients: 10, color: COLORS.green },
];

const TREND = Array.from({ length: 6 }, (_, i) => ({ m: ["Nov","Dec","Jan","Feb","Mar","Apr"][i], avg: 62 + i + Math.sin(i) * 2, critical: 12 - i }));

const INDUSTRY = [
  { name: "Trading", value: 14, color: COLORS.red },
  { name: "Textile", value: 12, color: COLORS.amber },
  { name: "Manufacturing", value: 8, color: COLORS.blueSoft },
  { name: "IT", value: 7, color: COLORS.green },
  { name: "Healthcare", value: 6, color: COLORS.gold },
];

export default function CAPortfolioHealthPage() {
  return (
    <PageWrap>
      <PageHeader title="Portfolio Health" sub="Analytics across your client portfolio." />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        <MetricCard label="Avg Health Score" value="68/100" sub="+4 from January" subColor={COLORS.greenSoft} />
        <MetricCard label="Improving" value="12" valueColor={COLORS.greenSoft} sub="MoM trend up" />
        <MetricCard label="Declining" value="5" valueColor={COLORS.redSoft} sub="Need intervention" />
        <MetricCard label="Portfolio Revenue" value="₹142Cr" sub="Combined annual" />
      </div>

      <Card className="mb-6">
        <h3 className="text-[15px] font-semibold mb-4">Health distribution</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={HEALTH_DIST} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#F0EBD8" />
            <XAxis type="number" tick={{ fontSize: 11, fill: "rgba(26,16,8,0.50)" }} />
            <YAxis type="category" dataKey="band" tick={{ fontSize: 11, fill: "rgba(26,16,8,0.50)" }} />
            <Tooltip />
            <Bar dataKey="clients" radius={[0, 4, 4, 0]}>
              {HEALTH_DIST.map((d, i) => <Cell key={i} fill={d.color} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card className="mb-6">
        <h3 className="text-[15px] font-semibold mb-4">Health trend (6 months)</h3>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={TREND}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F0EBD8" />
            <XAxis dataKey="m" tick={{ fontSize: 11 }} /><YAxis yAxisId="l" tick={{ fontSize: 11 }} /><YAxis yAxisId="r" orientation="right" tick={{ fontSize: 11 }} />
            <Tooltip /><Legend />
            <Line yAxisId="l" type="monotone" dataKey="avg" name="Avg score" stroke={COLORS.blue} strokeWidth={2} />
            <Line yAxisId="r" type="monotone" dataKey="critical" name="Critical clients" stroke={COLORS.red} strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
        <Card>
          <h3 className="text-[15px] font-semibold mb-4">Clients by industry</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={INDUSTRY} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={2}>
                {INDUSTRY.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Pie>
              <Tooltip /><Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <h3 className="text-[15px] font-semibold mb-4">Top 5 healthiest</h3>
          <div className="space-y-2.5">
            {[["Iyer Consulting", 92], ["Surat Fabrics", 88], ["Anand Trading", 85], ["Nair Healthcare", 82], ["Mumbai Mills", 80]].map(([n, s], i) => (
              <div key={i} className="flex items-center gap-3 text-sm">
                <span className="w-5 text-[12px]" style={{ color: "rgba(26,16,8,0.50)" }}>#{i + 1}</span>
                <span className="flex-1 font-medium">{n}</span>
                <span className="font-bold" style={{ color: COLORS.green }}>{s}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </PageWrap>
  );
}
