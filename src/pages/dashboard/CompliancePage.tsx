import DashboardLayout from "@/components/DashboardLayout";

const complianceMatrix = [
  { section: "GST", items: [
    { obligation: "GSTR-1", regulator: "GSTN", freq: "Monthly", lastFiled: "Apr 11", nextDue: "May 11", daysLeft: 26, status: "Filed" },
    { obligation: "GSTR-3B", regulator: "GSTN", freq: "Monthly", lastFiled: "—", nextDue: "Apr 20", daysLeft: 5, status: "Pending" },
    { obligation: "GSTR-9", regulator: "GSTN", freq: "Annual", lastFiled: "Dec 31", nextDue: "Dec 31", daysLeft: 261, status: "Future" },
  ]},
  { section: "Income Tax", items: [
    { obligation: "Advance Tax Q1", regulator: "IT Dept", freq: "Quarterly", lastFiled: "—", nextDue: "Jun 15", daysLeft: 61, status: "Future" },
    { obligation: "TDS Return Q4", regulator: "IT Dept", freq: "Quarterly", lastFiled: "—", nextDue: "May 31", daysLeft: 46, status: "Pending" },
    { obligation: "ITR Filing", regulator: "IT Dept", freq: "Annual", lastFiled: "—", nextDue: "Jul 31", daysLeft: 107, status: "Future" },
  ]},
  { section: "Corporate", items: [
    { obligation: "MGT-7 (Annual Return)", regulator: "MCA", freq: "Annual", lastFiled: "Sep 30", nextDue: "Sep 30", daysLeft: 168, status: "Future" },
    { obligation: "AOC-4 (Financial Stmt)", regulator: "MCA", freq: "Annual", lastFiled: "Oct 31", nextDue: "Oct 31", daysLeft: 198, status: "Future" },
    { obligation: "DIR-3 KYC", regulator: "MCA", freq: "Annual", lastFiled: "Sep 30", nextDue: "Sep 30", daysLeft: 168, status: "Future" },
  ]},
  { section: "Labour", items: [
    { obligation: "PF ECR", regulator: "EPFO", freq: "Monthly", lastFiled: "—", nextDue: "Apr 15", daysLeft: 0, status: "DUE TODAY" },
    { obligation: "ESIC Return", regulator: "ESIC", freq: "Monthly", lastFiled: "—", nextDue: "Apr 15", daysLeft: 0, status: "DUE TODAY" },
    { obligation: "Professional Tax", regulator: "State", freq: "Monthly", lastFiled: "—", nextDue: "Apr 30", daysLeft: 15, status: "Pending" },
  ]},
];

const statusStyles: Record<string, string> = {
  Filed: "bg-[#1A6B3C]/10 text-[#1A6B3C]",
  Pending: "bg-amber-100 text-[#8B5A00]",
  "DUE TODAY": "bg-[#C41E1E]/10 text-[#C41E1E] font-semibold",
  Future: "bg-gray-100 text-gray-500",
  Overdue: "bg-[#C41E1E] text-white",
};

const sectionColors: Record<string, string> = {
  GST: "text-[#C41E1E]",
  "Income Tax": "text-[#1A4A8B]",
  Corporate: "text-[#6B21A8]",
  Labour: "text-[#1A6B3C]",
};

const CompliancePage = () => (
  <DashboardLayout>
    {/* OVERALL SCORE */}
    <div className="bg-fyn-ink rounded-xl p-8 mb-6 text-center">
      <p className="text-white/40 text-xs fyn-label mb-2">OVERALL COMPLIANCE SCORE</p>
      <p className="text-[#8B5A00] text-[72px] font-serif font-bold leading-none">72</p>
      <p className="text-white/40 text-base">/100 — Good but 3 issues</p>
      <div className="grid grid-cols-4 gap-4 max-w-xl mx-auto mt-6">
        {[
          { label: "GST", score: 68, color: "#8B5A00" },
          { label: "Tax", score: 81, color: "#1A6B3C" },
          { label: "Corporate", score: 72, color: "#8B5A00" },
          { label: "Labour", score: 71, color: "#8B5A00" },
        ].map((c) => (
          <div key={c.label}>
            <p className="text-white/60 text-sm mb-1">{c.label}</p>
            <div className="h-2 bg-white/10 rounded-full"><div className="h-2 rounded-full" style={{ width: `${c.score}%`, background: c.color }} /></div>
            <p className="text-white/40 text-xs mt-1 fyn-metric">{c.score}/100</p>
          </div>
        ))}
      </div>
    </div>

    {/* COMPLIANCE MATRIX */}
    <div className="bg-fyn-beige-dark border border-fyn-ink-10 rounded-lg p-5">
      <h3 className="text-fyn-ink font-serif text-lg mb-4">Compliance Matrix — All Obligations</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-fyn-ink/40 text-xs fyn-label border-b border-fyn-ink-10">
              <th className="text-left py-2">Obligation</th>
              <th className="text-left py-2">Regulator</th>
              <th className="text-center py-2">Frequency</th>
              <th className="text-left py-2">Last Filed</th>
              <th className="text-left py-2">Next Due</th>
              <th className="text-right py-2">Days Left</th>
              <th className="text-center py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {complianceMatrix.map((section) => (
              <>
                <tr key={section.section} className="bg-fyn-beige">
                  <td colSpan={7} className={`py-2 px-2 font-semibold text-xs fyn-label ${sectionColors[section.section]}`}>
                    {section.section.toUpperCase()}
                  </td>
                </tr>
                {section.items.map((item) => {
                  const isOverdue = item.daysLeft < 0;
                  const isDueToday = item.daysLeft === 0;
                  const isUrgent = item.daysLeft > 0 && item.daysLeft <= 7;
                  return (
                    <tr
                      key={item.obligation}
                      className={`border-b border-fyn-ink-10 hover:bg-fyn-beige-deep transition-colors ${
                        isOverdue ? "bg-[#FDEAEA]" : isDueToday ? "bg-[#FEF3E2]" : ""
                      }`}
                    >
                      <td className="py-3 text-fyn-ink font-medium">{item.obligation}</td>
                      <td className="py-3 text-fyn-ink/60 text-xs">{item.regulator}</td>
                      <td className="py-3 text-center text-fyn-ink/50 text-xs">{item.freq}</td>
                      <td className="py-3 text-fyn-ink/60 text-xs">{item.lastFiled}</td>
                      <td className="py-3 text-fyn-ink text-xs font-medium">{item.nextDue}</td>
                      <td className={`py-3 text-right fyn-metric text-xs ${isOverdue || isDueToday ? "text-[#C41E1E] font-bold" : isUrgent ? "text-[#8B5A00] font-semibold" : "text-fyn-ink/40"}`}>
                        {isDueToday ? "TODAY" : item.daysLeft < 0 ? `${Math.abs(item.daysLeft)}d overdue` : `${item.daysLeft}d`}
                      </td>
                      <td className="py-3 text-center">
                        <span className={`text-[11px] px-2 py-0.5 rounded ${statusStyles[item.status] || "bg-gray-100 text-gray-500"}`}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </DashboardLayout>
);

export default CompliancePage;
