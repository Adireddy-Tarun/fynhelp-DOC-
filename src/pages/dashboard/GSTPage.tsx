import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { formatINR } from "@/lib/indian-format";

const tabs = ["Overview", "ITC Reconciliation", "Filing Calendar", "Notice Risk", "Vendor Health"];

const GSTPage = () => {
  const [activeTab, setActiveTab] = useState("Overview");

  return (
    <DashboardLayout>
      <div className="flex gap-1 mb-6 border-b border-fyn-ink-10">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
              activeTab === t ? "border-fyn-red text-fyn-ink" : "border-transparent text-fyn-ink/40 hover:text-fyn-ink/60"
            }`}
          >{t}</button>
        ))}
      </div>

      {activeTab === "Overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { label: "ITC Safe", value: formatINR(360000), color: "text-fyn-success" },
              { label: "ITC at Risk", value: formatINR(320000), color: "text-fyn-red" },
              { label: "Mismatch Count", value: "4", color: "text-fyn-red" },
              { label: "Notice Risk Score", value: "34/100", color: "text-fyn-warning" },
              { label: "Next Filing", value: "GSTR-3B · Apr 20", color: "text-fyn-ink" },
              { label: "Last 2B Pull", value: "Apr 14", color: "text-fyn-success" },
            ].map((m) => (
              <div key={m.label} className="bg-fyn-beige-dark border border-fyn-ink-10 rounded-lg p-4">
                <p className="text-fyn-ink/50 text-xs fyn-label">{m.label}</p>
                <p className={`text-xl fyn-metric font-bold mt-1 ${m.color}`}>{m.value}</p>
              </div>
            ))}
          </div>

          <div className="bg-fyn-beige-dark border border-fyn-ink-10 rounded-lg p-5">
            <h3 className="text-fyn-ink font-serif text-lg mb-3">Notice Risk Breakdown</h3>
            <div className="space-y-3">
              {[
                { factor: "ITC Mismatch %", score: 8, max: 20, desc: "4 vendors with mismatches" },
                { factor: "Turnover vs Returns Delta", score: 4, max: 15, desc: "Within tolerance" },
                { factor: "Late Filing History", score: 6, max: 15, desc: "1 late filing in last 12 months" },
                { factor: "E-Way Bill Gaps", score: 2, max: 15, desc: "No gaps detected" },
                { factor: "Cash vs Digital Ratio", score: 10, max: 20, desc: "34% cash — above industry avg" },
                { factor: "Vendor Compliance Avg", score: 4, max: 15, desc: "82% compliance score" },
              ].map((f) => (
                <div key={f.factor}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-fyn-ink">{f.factor}</span>
                    <span className="text-fyn-ink/40 fyn-metric">{f.score}/{f.max}</span>
                  </div>
                  <div className="h-1.5 bg-fyn-ink/5 rounded-full">
                    <div className={`h-1.5 rounded-full ${f.score / f.max > 0.5 ? "bg-fyn-red" : f.score / f.max > 0.3 ? "bg-amber-500" : "bg-fyn-success"}`} style={{ width: `${(f.score / f.max) * 100}%` }} />
                  </div>
                  <p className="text-fyn-ink/40 text-xs mt-0.5">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "ITC Reconciliation" && (
        <div className="bg-fyn-beige-dark border border-fyn-ink-10 rounded-lg p-5">
          <h3 className="text-fyn-ink font-serif text-lg mb-4">ITC Reconciliation — April 2025</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-fyn-ink/40 text-xs fyn-label border-b border-fyn-ink-10">
                  <th className="text-left py-2">Vendor</th>
                  <th className="text-left py-2">GSTIN</th>
                  <th className="text-right py-2">Your Books</th>
                  <th className="text-right py-2">GSTR-2B</th>
                  <th className="text-right py-2">Mismatch</th>
                  <th className="text-right py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { vendor: "Raj Textiles", gstin: "27AABCR****", books: 180000, gst2b: 180000, match: true },
                  { vendor: "Mumbai Mills", gstin: "27AABCM****", books: 95000, gst2b: 0, match: false },
                  { vendor: "Gujarat Fibers", gstin: "24AABCG****", books: 120000, gst2b: 110000, match: false },
                  { vendor: "Delhi Dyes", gstin: "07AABCD****", books: 45000, gst2b: 45000, match: true },
                  { vendor: "Ludhiana Looms", gstin: "03AABCL****", books: 78000, gst2b: 0, match: false },
                ].map((v) => (
                  <tr key={v.vendor} className="border-b border-fyn-ink-10 last:border-0">
                    <td className="py-3 text-fyn-ink font-medium">{v.vendor}</td>
                    <td className="py-3 text-fyn-ink/50 fyn-mono text-xs">{v.gstin}</td>
                    <td className="py-3 text-right fyn-metric">{formatINR(v.books)}</td>
                    <td className="py-3 text-right fyn-metric">{formatINR(v.gst2b)}</td>
                    <td className={`py-3 text-right fyn-metric ${v.match ? "text-fyn-success" : "text-fyn-red"}`}>
                      {v.match ? "✓ Match" : formatINR(v.books - v.gst2b)}
                    </td>
                    <td className="py-3 text-right">
                      {v.match ? (
                        <span className="text-fyn-success text-xs">Safe</span>
                      ) : (
                        <button className="text-fyn-red text-xs font-medium hover:underline">Chase Vendor</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "Vendor Health" && (
        <div className="bg-fyn-beige-dark border border-fyn-ink-10 rounded-lg p-5">
          <h3 className="text-fyn-ink font-serif text-lg mb-4">Vendor GST Compliance</h3>
          <div className="space-y-3">
            {[
              { name: "Raj Textiles", gstin: "27AABCR****", score: 95, lastFiled: "Mar 2025" },
              { name: "Mumbai Mills", gstin: "27AABCM****", score: 32, lastFiled: "Jan 2025" },
              { name: "Gujarat Fibers", gstin: "24AABCG****", score: 68, lastFiled: "Feb 2025" },
              { name: "Delhi Dyes", gstin: "07AABCD****", score: 88, lastFiled: "Mar 2025" },
              { name: "Ludhiana Looms", gstin: "03AABCL****", score: 15, lastFiled: "Oct 2024" },
            ].map((v) => (
              <div key={v.name} className="flex items-center gap-4 p-3 bg-fyn-beige rounded-lg">
                <div className="flex-1">
                  <p className="text-fyn-ink font-medium text-sm">{v.name}</p>
                  <p className="text-fyn-ink/40 text-xs fyn-mono">{v.gstin}</p>
                </div>
                <div className="text-right">
                  <p className={`fyn-metric text-sm font-bold ${v.score > 70 ? "text-fyn-success" : v.score > 40 ? "text-fyn-warning" : "text-fyn-red"}`}>{v.score}/100</p>
                  <p className="text-fyn-ink/40 text-xs">Last: {v.lastFiled}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {(activeTab === "Filing Calendar" || activeTab === "Notice Risk") && (
        <div className="bg-fyn-beige-dark border border-fyn-ink-10 rounded-lg p-8 text-center">
          <p className="text-fyn-ink/40 text-sm">See the dedicated Filing Calendar or Notice Risk pages for detailed views.</p>
        </div>
      )}
    </DashboardLayout>
  );
};

export default GSTPage;
