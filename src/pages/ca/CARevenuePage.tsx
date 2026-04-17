import { COLORS, PageWrap, PageHeader, Card, MetricCard } from "@/components/ca/ui";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const DATA = Array.from({ length: 12 }, (_, i) => ({ m: ["May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar","Apr"][i], rev: 8 + i * 0.4 + Math.sin(i) }));

export default function CARevenuePage() {
  return (
    <PageWrap>
      <PageHeader title="Revenue Analytics" sub="Your CA firm's revenue from FynHelp clients." />
      <div className="grid grid-cols-4 gap-4 mb-6">
        <MetricCard label="Annual Revenue" value="₹14.2L" sub="From 47 clients" />
        <MetricCard label="Avg per client" value="₹30K" sub="Per year" />
        <MetricCard label="MoM Growth" value="+8%" valueColor={COLORS.greenSoft} sub="Trending up" />
        <MetricCard label="Pipeline" value="₹4.8L" valueColor={COLORS.amberSoft} sub="3 clients in onboarding" />
      </div>
      <Card>
        <h3 className="text-[15px] font-semibold mb-4">Monthly revenue trend</h3>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={DATA}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F0EBD8" />
            <XAxis dataKey="m" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${v.toFixed(1)}L`} />
            <Tooltip />
            <Line type="monotone" dataKey="rev" stroke={COLORS.red} strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </Card>
    </PageWrap>
  );
}
