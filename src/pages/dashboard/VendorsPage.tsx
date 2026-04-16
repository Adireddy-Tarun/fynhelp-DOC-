import DashboardLayout from "@/components/DashboardLayout";
import { formatINR } from "@/lib/indian-format";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const topVendors = [
  { name: "Raj Textiles", spend: 680000, gst: 95, color: "#1A6B3C" },
  { name: "Mumbai Mills", spend: 420000, gst: 32, color: "#C41E1E" },
  { name: "Gujarat Fibers", spend: 340000, gst: 68, color: "#8B5A00" },
  { name: "Delhi Dyes", spend: 280000, gst: 88, color: "#1A6B3C" },
  { name: "Ludhiana Looms", spend: 220000, gst: 15, color: "#C41E1E" },
  { name: "Chennai Chemicals", spend: 180000, gst: 91, color: "#1A6B3C" },
  { name: "Bangalore Buttons", spend: 150000, gst: 78, color: "#8B5A00" },
];

const vendors = [
  { name: "Raj Textiles", cat: "Raw Materials", spend3m: 680000, outstanding: 340000, gstScore: 95, terms: "30 days", avgDays: 22, rel: "Strategic" },
  { name: "Mumbai Mills", cat: "Raw Materials", spend3m: 420000, outstanding: 180000, gstScore: 32, terms: "45 days", avgDays: 38, rel: "At Risk" },
  { name: "Gujarat Fibers", cat: "Raw Materials", spend3m: 340000, outstanding: 120000, gstScore: 68, terms: "30 days", avgDays: 28, rel: "Regular" },
  { name: "Delhi Dyes", cat: "Chemicals", spend3m: 280000, outstanding: 95000, gstScore: 88, terms: "15 days", avgDays: 12, rel: "Regular" },
  { name: "Ludhiana Looms", cat: "Raw Materials", spend3m: 220000, outstanding: 78000, gstScore: 15, terms: "60 days", avgDays: 55, rel: "At Risk" },
  { name: "Office Landlord", cat: "Overhead", spend3m: 135000, outstanding: 45000, gstScore: 90, terms: "Advance", avgDays: 0, rel: "Strategic" },
];

const relStyles: Record<string, string> = {
  Strategic: "bg-[#1A4A8B]/10 text-[#1A4A8B]",
  Regular: "bg-[#1A6B3C]/10 text-[#1A6B3C]",
  Occasional: "bg-gray-100 text-gray-500",
  "At Risk": "bg-[#C41E1E]/10 text-[#C41E1E]",
};

const VendorsPage = () => (
  <DashboardLayout>
    {/* TOP KPIs */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div className="bg-fyn-ink rounded-lg p-5 hover:-translate-y-0.5 hover:shadow-lg transition-all">
        <p className="text-white/40 text-[13px] fyn-label font-sans">TOTAL VENDORS</p>
        <p className="text-white text-[28px] font-bold mt-1 font-sans">24</p>
        <p className="text-white/40 font-sans text-sm">active</p>
      </div>
      <div className="bg-fyn-ink rounded-lg p-5 hover:-translate-y-0.5 hover:shadow-lg transition-all">
        <p className="text-white/40 text-[13px] fyn-label font-sans">TOTAL PAYABLES</p>
        <p className="text-white text-[28px] font-bold mt-1 font-sans">₹8.7L</p>
      </div>
      <div className="bg-fyn-ink rounded-lg p-5 hover:-translate-y-0.5 hover:shadow-lg transition-all">
        <p className="text-white/40 text-[13px] fyn-label font-sans">AVG DPO</p>
        <p className="text-white text-[28px] font-bold mt-1 font-sans">28 days</p>
        <p className="text-[#1A6B3C] mt-1 text-sm">Industry avg 35 — you pay fast</p>
      </div>
      <div className="bg-fyn-ink rounded-lg p-5 hover:-translate-y-0.5 hover:shadow-lg transition-all">
        <p className="text-white/40 text-[13px] fyn-label font-sans">AT-RISK VENDORS</p>
        <p className="text-[#8B5A00] text-[28px] font-bold mt-1 font-sans">3</p>
        <p className="text-[#8B5A00] mt-1 text-sm">GST non-compliant</p>
      </div>
    </div>

    {/* VENDOR SPEND CHART */}
    <div className="bg-fyn-beige-dark border border-fyn-ink-10 rounded-lg p-5 mb-6">
      <h3 className="text-fyn-ink text-lg mb-4 font-sans">Top Vendors by Spend (3 months)</h3>
      <ResponsiveContainer width="100%" height={250} className="font-sans text-sm">
        <BarChart data={topVendors} layout="vertical" margin={{ left: 100 }}>
          <XAxis type="number" tickFormatter={(v) => formatINR(v)} tick={{ fontSize: 10 }} />
          <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={90} />
          <Tooltip contentStyle={{ background: "#1A1008", border: "none", borderRadius: 8, color: "#fff" }} formatter={(v: number) => [formatINR(v), "Spend"]} />
          <Bar dataKey="spend" radius={[0, 4, 4, 0]} barSize={20}>
            {topVendors.map((v) => <Cell key={v.name} fill={v.color} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="bg-fyn-warning-bg border border-[#8B5A00]/20 rounded-lg p-3 mt-4">
        <p className="text-[#8B5A00] text-sm">⚠ Top 3 vendors = 68% of your total purchases. High supplier concentration — negotiate backup suppliers.</p>
      </div>
    </div>

    {/* VENDOR TABLE */}
    <div className="bg-fyn-beige-dark border border-fyn-ink-10 rounded-lg p-5">
      <h3 className="text-fyn-ink font-serif text-lg mb-4">All Vendors</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-fyn-ink/40 text-xs fyn-label border-b border-fyn-ink-10">
              <th className="text-left py-2">Vendor</th>
              <th className="text-left py-2">Category</th>
              <th className="text-right py-2">Spend (3m)</th>
              <th className="text-right py-2">Outstanding</th>
              <th className="text-center py-2">GST Score</th>
              <th className="text-center py-2">Terms</th>
              <th className="text-center py-2">Avg Days</th>
              <th className="text-center py-2">Relationship</th>
            </tr>
          </thead>
          <tbody>
            {vendors.map((v, i) => (
              <tr key={v.name} className={`border-b border-fyn-ink-10 last:border-0 hover:bg-fyn-beige-deep transition-colors cursor-pointer ${i % 2 === 0 ? "bg-[#FAF7F0]" : "bg-white"}`}>
                <td className="py-3 text-fyn-ink font-semibold">{v.name}</td>
                <td className="py-3 text-fyn-ink/60">{v.cat}</td>
                <td className="py-3 text-right fyn-metric">{formatINR(v.spend3m)}</td>
                <td className="py-3 text-right fyn-metric font-semibold">{formatINR(v.outstanding)}</td>
                <td className="py-3 text-center">
                  <span className={`text-xs px-2 py-0.5 rounded ${v.gstScore > 70 ? "bg-[#1A6B3C]/10 text-[#1A6B3C]" : v.gstScore > 40 ? "bg-amber-100 text-[#8B5A00]" : "bg-[#C41E1E]/10 text-[#C41E1E]"}`}>
                    {v.gstScore}/100
                  </span>
                </td>
                <td className="py-3 text-center text-xs text-fyn-ink/60">{v.terms}</td>
                <td className="py-3 text-center text-xs fyn-metric">{v.avgDays}d</td>
                <td className="py-3 text-center">
                  <span className={`text-[11px] px-2 py-0.5 rounded ${relStyles[v.rel]}`}>{v.rel}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </DashboardLayout>
);

export default VendorsPage;
