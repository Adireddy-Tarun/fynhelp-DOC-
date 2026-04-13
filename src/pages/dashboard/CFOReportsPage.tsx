import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";

const reportTypes = [
  "Monthly CFO Report",
  "Quarterly Summary",
  "Compliance Status",
  "Investor Brief",
  "CA Handover Pack",
];

const pastReports = [
  { name: "Monthly CFO Report — March 2025", date: "Apr 1, 2025", format: "PDF" },
  { name: "Quarterly Summary — Q4 FY25", date: "Apr 1, 2025", format: "PDF" },
  { name: "Monthly CFO Report — February 2025", date: "Mar 1, 2025", format: "PDF" },
  { name: "Compliance Status — March 2025", date: "Mar 15, 2025", format: "PDF" },
  { name: "Monthly CFO Report — January 2025", date: "Feb 1, 2025", format: "PDF" },
  { name: "CA Handover Pack — Q3 FY25", date: "Jan 5, 2025", format: "Excel" },
];

const CFOReportsPage = () => {
  const [selectedType, setSelectedType] = useState(reportTypes[0]);
  const [format, setFormat] = useState("PDF");

  return (
    <DashboardLayout>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Generate panel */}
        <div className="bg-fyn-beige-dark border border-fyn-ink-10 rounded-xl p-6">
          <h3 className="text-fyn-ink font-serif text-xl mb-6">Generate Report</h3>

          <div className="space-y-4">
            <div>
              <label className="text-fyn-ink/60 text-xs fyn-label block mb-2">Report type</label>
              <div className="space-y-2">
                {reportTypes.map((t) => (
                  <label key={t} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="reportType" checked={selectedType === t} onChange={() => setSelectedType(t)} className="accent-[#C41E1E]" />
                    <span className="text-fyn-ink text-sm">{t}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="text-fyn-ink/60 text-xs fyn-label block mb-2">Date range</label>
              <div className="flex gap-2">
                <input type="date" className="h-[42px] px-3 bg-fyn-beige border border-fyn-ink-10 rounded text-sm text-fyn-ink focus:outline-none focus:ring-2 focus:ring-fyn-red" defaultValue="2025-03-01" aria-label="Start date" />
                <input type="date" className="h-[42px] px-3 bg-fyn-beige border border-fyn-ink-10 rounded text-sm text-fyn-ink focus:outline-none focus:ring-2 focus:ring-fyn-red" defaultValue="2025-03-31" aria-label="End date" />
              </div>
            </div>

            <div>
              <label className="text-fyn-ink/60 text-xs fyn-label block mb-2">Include sections</label>
              <div className="space-y-1">
                {["P&L narrative", "Cash flow analysis", "GST compliance status", "Receivables aging", "Workforce metrics", "Nidhi recommendations"].map((s) => (
                  <label key={s} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" defaultChecked className="accent-[#C41E1E]" />
                    <span className="text-fyn-ink/70 text-sm">{s}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="text-fyn-ink/60 text-xs fyn-label block mb-2">Format</label>
              <div className="flex gap-2">
                {["PDF", "Excel", "Word"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFormat(f)}
                    className={`px-4 py-2 rounded text-sm ${format === f ? "bg-fyn-ink text-white" : "bg-fyn-beige border border-fyn-ink-10 text-fyn-ink/60"}`}
                  >{f}</button>
                ))}
              </div>
            </div>

            <button className="w-full bg-fyn-red text-white py-3 rounded-lg font-medium hover:opacity-90 transition-opacity mt-4">
              Generate Report
            </button>
          </div>
        </div>

        {/* Past reports + automation */}
        <div className="space-y-6">
          <div className="bg-fyn-beige-dark border border-fyn-ink-10 rounded-xl p-6">
            <h3 className="text-fyn-ink font-serif text-xl mb-4">Past Reports</h3>
            <div className="space-y-2">
              {pastReports.map((r) => (
                <div key={r.name} className="flex items-center gap-3 p-3 bg-fyn-beige rounded-lg">
                  <div className="flex-1">
                    <p className="text-fyn-ink text-sm font-medium">{r.name}</p>
                    <p className="text-fyn-ink/40 text-xs">{r.date} · {r.format}</p>
                  </div>
                  <button className="text-fyn-red text-xs font-medium hover:underline">Download</button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-fyn-beige-dark border border-fyn-ink-10 rounded-xl p-6">
            <h3 className="text-fyn-ink font-serif text-xl mb-3">Auto-generate & Email</h3>
            <p className="text-fyn-ink/60 text-sm mb-4">Auto-generate and email your CFO report to your CA on the 1st of every month.</p>
            <div className="flex gap-3 items-center">
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-9 h-5 bg-fyn-ink/10 peer-focus:ring-2 peer-focus:ring-fyn-red rounded-full peer peer-checked:bg-fyn-red after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full" />
              </label>
              <input placeholder="ca@example.com" className="flex-1 h-[38px] px-3 bg-fyn-beige border border-fyn-ink-10 rounded text-sm text-fyn-ink focus:outline-none focus:ring-2 focus:ring-fyn-red" aria-label="CA email address" />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CFOReportsPage;
