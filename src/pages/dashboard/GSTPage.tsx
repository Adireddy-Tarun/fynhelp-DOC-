import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { formatINR } from "@/lib/indian-format";

const tabs = ["Overview", "ITC Reconciliation", "Filing Calendar", "Notice Risk", "Vendor Health"];

const GSTPage = () => {
  const [activeTab, setActiveTab] = useState("Overview");

  return (
    <DashboardLayout>
      {/* Tab bar */}
      <div className="flex items-end gap-1 mb-6" style={{ borderBottom: "1px solid #E0D9C8", padding: "0 0", height: 48 }}>
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className="transition-all"
            style={{
              padding: "12px 16px",
              fontSize: 13,
              fontWeight: 500,
              color: activeTab === t ? "#C41E1E" : "rgba(26,16,8,0.45)",
              borderBottom: activeTab === t ? "3px solid #C41E1E" : "3px solid transparent",
              cursor: "pointer",
              background: "transparent",
            }}
            onMouseEnter={e => { if (activeTab !== t) e.currentTarget.style.color = "#1A1008"; }}
            onMouseLeave={e => { if (activeTab !== t) e.currentTarget.style.color = "rgba(26,16,8,0.45)"; }}
          >{t}</button>
        ))}
      </div>

      {activeTab === "Overview" && (
        <div className="space-y-6">
          {/* Metric cards with differentiation */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {/* ITC Safe - green */}
            <div className="rounded-lg transition-all duration-250 hover:-translate-y-[3px] cursor-pointer" style={{ background: "#DCFCE7", border: "1px solid #16A34A", padding: "16px 20px" }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 8px 24px rgba(26,16,8,0.10)"; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; }}
            >
              <p style={{ fontSize: 12, color: "rgba(22,163,74,0.7)", fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase" }}>ITC SAFE</p>
              <p className="font-serif" style={{ fontSize: 28, fontWeight: 700, color: "#16A34A", marginTop: 4 }}>{formatINR(360000)}</p>
              <p style={{ fontSize: 13, color: "rgba(22,163,74,0.6)", marginTop: 4 }}>Confirmed in GSTR-2B</p>
            </div>

            {/* ITC at Risk - red */}
            <div className="rounded-lg transition-all duration-250 hover:-translate-y-[3px] cursor-pointer relative" style={{ background: "#FDEAEA", border: "1.5px solid #C41E1E", padding: "16px 20px" }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 8px 24px rgba(196,30,30,0.15)"; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; }}
            >
              <span className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full pulse-ring" style={{ background: "#C41E1E" }} />
              <p style={{ fontSize: 12, color: "#C41E1E", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>ITC AT RISK</p>
              <p className="font-serif" style={{ fontSize: 28, fontWeight: 700, color: "#C41E1E", marginTop: 4 }}>{formatINR(320000)}</p>
              <p style={{ fontSize: 13, color: "rgba(196,30,30,0.7)", marginTop: 4 }}>Not in 2B — vendors haven't filed</p>
            </div>

            {/* Mismatch Count */}
            <div className="rounded-lg transition-all duration-250 hover:-translate-y-[3px] cursor-pointer" style={{ background: "#FDEAEA", border: "1px solid #C41E1E", padding: "16px 20px" }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 8px 24px rgba(26,16,8,0.10)"; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; }}
            >
              <p style={{ fontSize: 12, color: "rgba(26,16,8,0.50)", fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase" }}>MISMATCH COUNT</p>
              <p className="font-serif" style={{ fontSize: 28, fontWeight: 700, color: "#C41E1E", marginTop: 4 }}>4</p>
              <p style={{ fontSize: 13, color: "#C41E1E", marginTop: 4 }}>↑ 1 from last period</p>
            </div>

            {/* Notice Risk Score - amber */}
            <div className="rounded-lg transition-all duration-250 hover:-translate-y-[3px] cursor-pointer" style={{ background: "#FEF3E2", border: "1px solid #8B5A00", padding: "16px 20px" }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 8px 24px rgba(26,16,8,0.10)"; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; }}
            >
              <p style={{ fontSize: 12, color: "rgba(26,16,8,0.50)", fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase" }}>NOTICE RISK</p>
              <p className="font-serif" style={{ fontSize: 28, fontWeight: 700, color: "#8B5A00", marginTop: 4 }}>34/100</p>
              <p style={{ fontSize: 13, color: "rgba(139,90,0,0.7)", marginTop: 4 }}>Medium risk · Updated Apr 14</p>
            </div>

            {/* Next Filing */}
            <div className="rounded-lg transition-all duration-250 hover:-translate-y-[3px] cursor-pointer" style={{ background: "#FFFFFF", border: "1px solid #E0D9C8", padding: "16px 20px" }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 8px 24px rgba(26,16,8,0.10)"; e.currentTarget.style.borderColor = "#C41E1E"; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = "#E0D9C8"; }}
            >
              <p style={{ fontSize: 12, color: "rgba(26,16,8,0.50)", fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase" }}>NEXT FILING</p>
              <p className="font-serif" style={{ fontSize: 28, fontWeight: 700, color: "#1A1008", marginTop: 4 }}>GSTR-3B</p>
              <p style={{ fontSize: 13, color: "#C41E1E", marginTop: 4 }}>Apr 20 · 5 days left</p>
            </div>

            {/* Last 2B Pull */}
            <div className="rounded-lg transition-all duration-250 hover:-translate-y-[3px] cursor-pointer" style={{ background: "#FFFFFF", border: "1px solid #E0D9C8", padding: "16px 20px" }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 8px 24px rgba(26,16,8,0.10)"; e.currentTarget.style.borderColor = "#C41E1E"; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = "#E0D9C8"; }}
            >
              <p style={{ fontSize: 12, color: "rgba(26,16,8,0.50)", fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase" }}>LAST 2B PULL</p>
              <p className="font-serif" style={{ fontSize: 28, fontWeight: 700, color: "#16A34A", marginTop: 4 }}>Apr 14</p>
              <p style={{ fontSize: 13, color: "#16A34A", marginTop: 4 }}>Auto-pulled · Fresh</p>
            </div>
          </div>

          {/* Notice Risk Breakdown */}
          <div className="rounded-lg p-5" style={{ background: "#FFFFFF", border: "1px solid rgba(26,16,8,0.10)" }}>
            <h3 className="font-serif text-fyn-ink mb-4" style={{ fontSize: 15 }}>Notice Risk Breakdown</h3>
            <div className="space-y-4">
              {[
                { factor: "ITC Mismatch %", score: 8, max: 20, desc: "4 vendors with mismatches", color: "#F59E0B" },
                { factor: "Turnover vs Returns Delta", score: 4, max: 15, desc: "Within tolerance", color: "#16A34A" },
                { factor: "Late Filing History", score: 6, max: 15, desc: "1 late filing in last 12 months", color: "#F59E0B" },
                { factor: "E-Way Bill Gaps", score: 2, max: 15, desc: "No gaps detected", color: "#16A34A" },
                { factor: "Cash vs Digital Ratio", score: 10, max: 20, desc: "34% cash — above industry avg", color: "#F59E0B" },
                { factor: "Vendor Compliance Avg", score: 4, max: 15, desc: "82% compliance score", color: "#16A34A" },
              ].map((f) => (
                <div key={f.factor}>
                  <div className="flex justify-between mb-1">
                    <span style={{ fontSize: 14, color: "#1A1008" }}>{f.factor}</span>
                    <span className="fyn-metric" style={{ fontSize: 13, color: f.color, fontWeight: 600 }}>{f.score}/{f.max}</span>
                  </div>
                  <div style={{ height: 8, background: "#E0D9C8", borderRadius: 4 }}>
                    <div className="progress-fill-animate" style={{ height: 8, borderRadius: 4, background: f.color, width: `${(f.score / f.max) * 100}%` }} />
                  </div>
                  <p style={{ fontSize: 13, color: "rgba(26,16,8,0.45)", marginTop: 2 }}>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Top 3 things to fix */}
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: "#1A1008", marginBottom: 12 }}>Top 3 things to fix</h3>
            <div className="space-y-3">
              <div className="rounded-lg" style={{ borderLeft: "4px solid #C41E1E", background: "#FFFFFF", border: "1px solid rgba(26,16,8,0.08)", borderLeftWidth: 4, borderLeftColor: "#C41E1E", padding: 14 }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: "#1A1008" }}>Fix ITC mismatches before Apr 20</p>
                <p style={{ fontSize: 13, color: "rgba(26,16,8,0.60)", marginTop: 4 }}>4 vendor invoices not in GSTR-2B — chase them today</p>
                <button className="mt-2 transition-all hover:brightness-90" style={{ color: "#FFFFFF", background: "#C41E1E", fontSize: 13, fontWeight: 500, padding: "6px 14px", borderRadius: 6 }}>Chase vendors →</button>
              </div>
              <div className="rounded-lg" style={{ borderLeft: "4px solid #8B5A00", background: "#FFFFFF", border: "1px solid rgba(26,16,8,0.08)", borderLeftWidth: 4, borderLeftColor: "#8B5A00", padding: 14 }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: "#1A1008" }}>3 vendors have compliance score below 60</p>
                <p style={{ fontSize: 13, color: "rgba(26,16,8,0.60)", marginTop: 4 }}>Your ITC of ₹1.8L from Raj Textiles is at risk</p>
                <button className="mt-2 transition-all hover:brightness-90" style={{ color: "#FFFFFF", background: "#8B5A00", fontSize: 13, fontWeight: 500, padding: "6px 14px", borderRadius: 6 }}>View vendor health →</button>
              </div>
              <div className="rounded-lg" style={{ borderLeft: "4px solid #1A4A8B", background: "#FFFFFF", border: "1px solid rgba(26,16,8,0.08)", borderLeftWidth: 4, borderLeftColor: "#1A4A8B", padding: 14 }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: "#1A1008" }}>GSTR-3B due in 5 days</p>
                <p style={{ fontSize: 13, color: "rgba(26,16,8,0.60)", marginTop: 4 }}>Prepare now — review your 2B and compute ITC</p>
                <button className="mt-2 transition-all hover:brightness-90" style={{ color: "#FFFFFF", background: "#1A4A8B", fontSize: 13, fontWeight: 500, padding: "6px 14px", borderRadius: 6 }}>Start GSTR-3B prep →</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "ITC Reconciliation" && (
        <div className="rounded-lg p-5" style={{ background: "#FFFFFF", border: "1px solid rgba(26,16,8,0.10)" }}>
          <h3 className="font-serif text-fyn-ink mb-4" style={{ fontSize: 15 }}>ITC Reconciliation — April 2026</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(26,16,8,0.10)" }}>
                  {["Vendor", "GSTIN", "Your Books", "GSTR-2B", "Mismatch", "Status"].map(h => (
                    <th key={h} className={`py-2 ${h === "Vendor" || h === "GSTIN" ? "text-left" : "text-right"}`} style={{ fontSize: 12, color: "rgba(26,16,8,0.45)", letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { vendor: "Raj Textiles", gstin: "27AABCR****", books: 180000, gst2b: 180000, match: true },
                  { vendor: "Mumbai Mills", gstin: "27AABCM****", books: 95000, gst2b: 0, match: false },
                  { vendor: "Gujarat Fibers", gstin: "24AABCG****", books: 120000, gst2b: 110000, match: false },
                  { vendor: "Delhi Dyes", gstin: "07AABCD****", books: 45000, gst2b: 45000, match: true },
                  { vendor: "Ludhiana Looms", gstin: "03AABCL****", books: 78000, gst2b: 0, match: false },
                ].map((v, i) => (
                  <tr
                    key={v.vendor}
                    className="transition-colors cursor-pointer"
                    style={{ borderBottom: "1px solid rgba(26,16,8,0.06)", background: i % 2 === 0 ? "#FFFFFF" : "#FAF7F0" }}
                    onMouseEnter={e => { e.currentTarget.style.background = "#F4EDDA"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = i % 2 === 0 ? "#FFFFFF" : "#FAF7F0"; }}
                  >
                    <td className="py-3" style={{ fontSize: 14, fontWeight: 600, color: "#1A1008" }}>{v.vendor}</td>
                    <td className="py-3 fyn-mono" style={{ fontSize: 13, color: "rgba(26,16,8,0.50)" }}>{v.gstin}</td>
                    <td className="py-3 text-right fyn-metric" style={{ fontSize: 14 }}>{formatINR(v.books)}</td>
                    <td className="py-3 text-right fyn-metric" style={{ fontSize: 14 }}>{formatINR(v.gst2b)}</td>
                    <td className="py-3 text-right fyn-metric" style={{ fontSize: 14, color: v.match ? "#16A34A" : "#C41E1E" }}>
                      {v.match ? "✓ Match" : formatINR(v.books - v.gst2b)}
                    </td>
                    <td className="py-3 text-right">
                      {v.match ? (
                        <span style={{ color: "#16A34A", fontSize: 13 }}>Safe</span>
                      ) : (
                        <button style={{ color: "#C41E1E", fontSize: 13, fontWeight: 500 }} className="hover:underline">Chase Vendor</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 p-3 rounded-lg" style={{ background: "#DCFCE7", fontSize: 13 }}>
            <strong style={{ color: "#16A34A" }}>ITC Safe to claim:</strong> ₹3.6L &nbsp;|&nbsp;
            <strong style={{ color: "#C41E1E" }}>ITC at Risk:</strong> ₹3.2L &nbsp;|&nbsp;
            <strong>Recommended this month:</strong> ₹3.6L
          </div>
        </div>
      )}

      {activeTab === "Vendor Health" && (
        <div className="rounded-lg p-5" style={{ background: "#FFFFFF", border: "1px solid rgba(26,16,8,0.10)" }}>
          <h3 className="font-serif text-fyn-ink mb-4" style={{ fontSize: 15 }}>Vendor GST Compliance</h3>
          <div className="space-y-3">
            {[
              { name: "Raj Textiles", gstin: "27AABCR****", score: 95, lastFiled: "Mar 2026" },
              { name: "Mumbai Mills", gstin: "27AABCM****", score: 32, lastFiled: "Jan 2026" },
              { name: "Gujarat Fibers", gstin: "24AABCG****", score: 68, lastFiled: "Feb 2026" },
              { name: "Delhi Dyes", gstin: "07AABCD****", score: 88, lastFiled: "Mar 2026" },
              { name: "Ludhiana Looms", gstin: "03AABCL****", score: 15, lastFiled: "Oct 2025" },
            ].map((v, i) => (
              <div
                key={v.name}
                className="flex items-center gap-4 p-3 rounded-lg transition-colors cursor-pointer"
                style={{ background: i % 2 === 0 ? "#FFFFFF" : "#FAF7F0" }}
                onMouseEnter={e => { e.currentTarget.style.background = "#F4EDDA"; }}
                onMouseLeave={e => { e.currentTarget.style.background = i % 2 === 0 ? "#FFFFFF" : "#FAF7F0"; }}
              >
                <div className="flex-1">
                  <p style={{ color: "#1A1008", fontWeight: 600, fontSize: 14 }}>{v.name}</p>
                  <p className="fyn-mono" style={{ color: "rgba(26,16,8,0.40)", fontSize: 13 }}>{v.gstin}</p>
                </div>
                <div className="text-right">
                  <p className="fyn-metric" style={{ fontSize: 14, fontWeight: 700, color: v.score > 70 ? "#16A34A" : v.score > 40 ? "#8B5A00" : "#C41E1E" }}>{v.score}/100</p>
                  <p style={{ color: "rgba(26,16,8,0.40)", fontSize: 13 }}>Last: {v.lastFiled}</p>
                </div>
                <span className="rounded-full" style={{
                  fontSize: 11,
                  fontWeight: 500,
                  padding: "3px 10px",
                  background: v.score > 70 ? "#DCFCE7" : v.score > 40 ? "#FEF3E2" : "#FDEAEA",
                  color: v.score > 70 ? "#16A34A" : v.score > 40 ? "#8B5A00" : "#C41E1E",
                }}>{v.score > 70 ? "Safe" : v.score > 40 ? "Monitor" : "At Risk"}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {(activeTab === "Filing Calendar" || activeTab === "Notice Risk") && (
        <div className="rounded-lg p-8 text-center" style={{ background: "#FFFFFF", border: "1px solid rgba(26,16,8,0.10)" }}>
          <p style={{ color: "rgba(26,16,8,0.40)", fontSize: 14 }}>See the dedicated Filing Calendar or Notice Risk pages for detailed views.</p>
        </div>
      )}
    </DashboardLayout>
  );
};

export default GSTPage;
