import { useRef, useState, type KeyboardEvent } from "react";
import DashboardLayout from "@/components/DashboardLayout";

const areas = [
  { area: "GST Records", score: 72, max: 100, status: "amber" },
  { area: "Cash Documentation", score: 81, max: 100, status: "green" },
  { area: "Vendor Contracts", score: 54, max: 100, status: "red" },
  { area: "Invoice Compliance", score: 89, max: 100, status: "green" },
  { area: "TDS Records", score: 71, max: 100, status: "amber" },
  { area: "Labour Records", score: 61, max: 100, status: "amber" },
];

const checkSections = [
  {
    title: "GST Record Maintenance",
    what: "GSTR-2A vs 2B reconciliation, ITC reversal records, e-invoice compliance",
    yourStatus: "4 mismatches in last 12 months",
    priority: "HIGH",
    action: "Get reconciliation report →",
  },
  {
    title: "Cash and Bank Records",
    what: "Cash transactions >₹2L, loan repayments, capital introduced",
    yourStatus: "2 cash transactions >₹2L flagged",
    priority: "MEDIUM",
    action: "Review flagged transactions →",
  },
  {
    title: "Vendor Documentation",
    what: "Contract files, GSTIN verification, ITC protection clauses",
    yourStatus: "7 active vendors have no signed contract",
    priority: "HIGH",
    action: "View vendor checklist →",
  },
  {
    title: "Invoice Compliance",
    what: "E-invoice applicability, IRN numbers, HSN codes",
    yourStatus: "✓ All invoices compliant",
    priority: "LOW",
    action: null,
  },
  {
    title: "TDS Records",
    what: "26AS reconciliation, TDS certificates issued",
    yourStatus: "2 mismatches with TRACES 26AS",
    priority: "MEDIUM",
    action: "View TDS reconciliation →",
  },
  {
    title: "Director / Partner Compliance",
    what: "DIR-3 KYC status, DIN active status, disqualification check",
    yourStatus: "KYC due Sep 30, 2026",
    priority: "LOW",
    action: "Check director status →",
  },
];

const documents = [
  { name: "Last 3 years GSTR-1/3B filed confirmation", done: true },
  { name: "Bank statements last 12 months", done: true },
  { name: "Purchase register (reconciled with 2B)", done: false },
  { name: "Signed vendor agreements (top 10 vendors)", done: false },
  { name: "Fixed asset register with invoices", done: true },
  { name: "Director KYC documents", done: true },
  { name: "MSME Udyam certificate", done: true },
  { name: "PF/ESIC registration certificate", done: true },
];

const priorityColors: Record<string, string> = {
  HIGH: "bg-[#C41E1E]/10 text-[#C41E1E]",
  MEDIUM: "bg-amber-100 text-[#8B5A00]",
  LOW: "bg-[#1A6B3C]/10 text-[#1A6B3C]",
};

const barColors: Record<string, string> = {
  green: "#1A6B3C",
  amber: "#8B5A00",
  red: "#C41E1E",
};

const AuditReadinessPage = () => {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const doneCount = documents.filter((d) => d.done).length;
  const rowRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const toggleSection = (title: string) => {
    setExpandedSection(expandedSection === title ? null : title);
  };

  const handleRowKeyDown = (e: KeyboardEvent<HTMLButtonElement>, index: number, title: string) => {
    switch (e.key) {
      case "Enter":
      case " ":
        e.preventDefault();
        toggleSection(title);
        break;
      case "ArrowDown": {
        e.preventDefault();
        const next = (index + 1) % checkSections.length;
        rowRefs.current[next]?.focus();
        break;
      }
      case "ArrowUp": {
        e.preventDefault();
        const prev = (index - 1 + checkSections.length) % checkSections.length;
        rowRefs.current[prev]?.focus();
        break;
      }
      case "Home":
        e.preventDefault();
        rowRefs.current[0]?.focus();
        break;
      case "End":
        e.preventDefault();
        rowRefs.current[checkSections.length - 1]?.focus();
        break;
    }
  };

  return (
    <DashboardLayout>
      {/* READINESS SCORE */}
      <div className="bg-fyn-ink rounded-xl p-8 mb-6 text-center">
        <p className="text-white/40 text-xs fyn-label mb-2">AUDIT READINESS SCORE</p>
        <p className="text-[72px] font-bold leading-none text-accent font-sans">67</p>
        <p className="text-white/40 text-base">/100 — Moderate Risk</p>
        <p className="text-white/50 text-sm mt-2">If a GST officer walked in today, these are the 5 things you'd need to explain.</p>
        <button className="mt-4 text-fyn-red text-sm font-medium hover:underline">Improve your score →</button>
      </div>

      {/* READINESS BY AREA */}
      <div className="bg-fyn-beige-dark border border-fyn-ink-10 rounded-lg p-5 mb-6">
        <h3 className="text-fyn-ink text-lg mb-4 font-sans">Readiness by Area</h3>
        <div className="space-y-3">
          {areas.map((a) => (
            <div key={a.area} className="flex items-center gap-4">
              <span className="text-sm w-40 font-sans text-secondary-foreground">{a.area}</span>
              <div className="flex-1 h-3 bg-fyn-ink/5 rounded-full overflow-hidden">
                <div className="h-3 rounded-full transition-all" style={{ width: `${a.score}%`, background: barColors[a.status] }} />
              </div>
              <span className="text-fyn-ink/60 fyn-metric text-sm w-16 text-right">{a.score}/100</span>
            </div>
          ))}
        </div>
      </div>

      {/* WHAT AUDITORS CHECK */}
      <div className="bg-fyn-beige-dark border border-fyn-ink-10 rounded-lg p-5 mb-6">
        <h3 className="text-fyn-ink text-lg mb-4 font-sans">What Auditors Check</h3>
        <p className="sr-only">
          Use Enter or Space to expand a row. Use Up and Down arrow keys to move between rows. Home and End jump to the first or last row.
        </p>
        <div className="space-y-2" role="list">
          {checkSections.map((s, index) => {
            const panelId = `audit-row-panel-${index}`;
            const buttonId = `audit-row-button-${index}`;
            const isOpen = expandedSection === s.title;
            return (
              <div key={s.title} role="listitem" className="border border-fyn-ink-10 rounded-lg overflow-hidden">
                <button
                  ref={(el) => (rowRefs.current[index] = el)}
                  id={buttonId}
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => toggleSection(s.title)}
                  onKeyDown={(e) => handleRowKeyDown(e, index, s.title)}
                  className="w-full flex items-center justify-between p-4 hover:bg-fyn-beige focus:outline-none focus-visible:ring-2 focus-visible:ring-fyn-red focus-visible:ring-offset-2 focus-visible:ring-offset-fyn-beige-dark transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] px-2 py-0.5 rounded ${priorityColors[s.priority]}`}>{s.priority}</span>
                    <span className="text-fyn-ink font-medium text-sm font-sans">{s.title}</span>
                  </div>
                  <span aria-hidden="true" className="text-fyn-ink/30">{isOpen ? "▲" : "▼"}</span>
                </button>
                {isOpen && (
                  <div
                    id={panelId}
                    role="region"
                    aria-labelledby={buttonId}
                    className="px-4 pb-4 space-y-2 text-sm"
                  >
                    <p className="text-fyn-ink/60"><strong>What they check:</strong> {s.what}</p>
                    <p className="text-fyn-ink/60"><strong>Your status:</strong> {s.yourStatus}</p>
                    {s.action && (
                      <button className="text-fyn-red text-sm font-medium hover:underline mt-1">{s.action}</button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* DOCUMENT VAULT */}
      <div className="bg-fyn-beige-dark border border-fyn-ink-10 rounded-lg p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-fyn-ink text-lg font-sans">Documents AI CFO Nidhi Recommends You Keep Ready</h3>
          <span className="text-fyn-gold text-sm fyn-metric">{doneCount} of {documents.length} ready ({Math.round(doneCount / documents.length * 100)}%)</span>
        </div>
        <div className="space-y-2">
          {documents.map((d) => (
            <div key={d.name} className="flex items-center gap-3 p-3 bg-fyn-beige rounded-lg hover:bg-fyn-beige-deep transition-colors">
              <span className={`w-5 h-5 rounded border-2 flex items-center justify-center text-xs ${d.done ? "bg-[#1A6B3C] border-[#1A6B3C] text-white" : "border-fyn-ink/20"}`}>
                {d.done ? "✓" : ""}
              </span>
              <span className={`flex-1 text-sm font-sans ${d.done ? "text-fyn-ink" : "text-fyn-ink/60"}`}>{d.name}</span>
              {!d.done && <button className="text-fyn-red text-xs font-medium hover:underline">Upload</button>}
              {d.done && <span className="text-[#1A6B3C] text-xs">Uploaded</span>}
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AuditReadinessPage;