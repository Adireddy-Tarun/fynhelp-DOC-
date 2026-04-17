import { useState } from "react";
import { COLORS, PageWrap, PageHeader, Card, PrimaryBtn, GhostLink } from "@/components/ca/ui";
import { toast } from "sonner";
import { FileText } from "lucide-react";

const REPORT_TYPES = [
  { v: "monthly_cfo", t: "Monthly CFO Report" },
  { v: "gst_itc", t: "GST & ITC Summary" },
  { v: "compliance", t: "Compliance Status Report" },
  { v: "receivables", t: "Receivables Aging Report" },
  { v: "annual", t: "Annual Financial Summary" },
  { v: "custom", t: "Custom (select sections)" },
];

const CLIENTS = ["Mehta Textiles", "Sharma & Sons", "Patel Manufacturing", "Delhi Distributors", "Anand Trading", "Surat Fabrics"];

export default function CAReportsPage() {
  const [selected, setSelected] = useState<string[]>([]);
  const [reportType, setReportType] = useState("monthly_cfo");
  const [emailToClient, setEmailToClient] = useState(false);
  const [generated, setGenerated] = useState(false);

  const toggle = (c: string) => setSelected((s) => s.includes(c) ? s.filter(x => x !== c) : [...s, c]);

  const generate = () => {
    if (selected.length === 0) { toast.error("Select at least one client"); return; }
    // BACKEND: POST /api/ca/reports/generate
    setGenerated(true);
    toast.success(`${selected.length} report(s) generated`);
  };

  return (
    <PageWrap>
      <PageHeader title="Reports Generator" sub="Generate and send reports for any client." />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <Card className="lg:col-span-5">
          <h3 className="text-[15px] font-semibold mb-4">Step 1 · Select clients</h3>
          <div className="border rounded p-3 max-h-48 overflow-y-auto space-y-1.5" style={{ borderColor: COLORS.caBorder }}>
            {CLIENTS.map((c) => (
              <label key={c} className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={selected.includes(c)} onChange={() => toggle(c)} />
                {c}
              </label>
            ))}
          </div>
          <div className="text-xs mt-2" style={{ color: "rgba(26,16,8,0.60)" }}>{selected.length} clients selected</div>

          <h3 className="text-[15px] font-semibold mt-6 mb-3">Step 2 · Report type</h3>
          <div className="space-y-1.5">
            {REPORT_TYPES.map((r) => (
              <label key={r.v} className="flex items-center gap-2 p-2 rounded text-sm cursor-pointer"
                style={{ border: `1px solid ${reportType === r.v ? COLORS.red : COLORS.caBorder}`, background: reportType === r.v ? "#FEF2F2" : "#FFFFFF" }}>
                <input type="radio" checked={reportType === r.v} onChange={() => setReportType(r.v)} />
                {r.t}
              </label>
            ))}
          </div>

          <h3 className="text-[15px] font-semibold mt-6 mb-3">Step 3 · Period</h3>
          <input type="month" defaultValue="2026-04" className="h-10 px-3 rounded text-sm w-full" style={{ border: `1px solid ${COLORS.caBorder}` }} />

          <h3 className="text-[15px] font-semibold mt-6 mb-3">Step 4 · Delivery</h3>
          <label className="flex items-center gap-2 text-sm mb-2">
            <input type="checkbox" checked={emailToClient} onChange={(e) => setEmailToClient(e.target.checked)} />
            Email to client
          </label>

          <div className="mt-6">
            <PrimaryBtn full size="lg" onClick={generate}>Generate {selected.length > 0 ? `${selected.length} ` : ""}report{selected.length !== 1 ? "s" : ""} →</PrimaryBtn>
          </div>
        </Card>

        <Card className="lg:col-span-7">
          <h3 className="text-[15px] font-semibold mb-4">Preview</h3>
          {!generated ? (
            <div className="h-64 flex items-center justify-center text-sm" style={{ color: "rgba(26,16,8,0.40)" }}>
              Report preview will appear here
            </div>
          ) : (
            <div className="border rounded p-6" style={{ borderColor: COLORS.caBorder, background: COLORS.caSurface }}>
              <FileText size={32} style={{ color: COLORS.red }} className="mb-3" />
              <div className="text-sm font-semibold mb-1">{REPORT_TYPES.find(r => r.v === reportType)?.t}</div>
              <div className="text-xs mb-4" style={{ color: "rgba(26,16,8,0.60)" }}>{selected.length} clients · April 2026</div>
              <div className="flex gap-2">
                <PrimaryBtn size="sm" onClick={() => toast.success("PDF download started")}>Download PDF</PrimaryBtn>
                {emailToClient && <GhostLink onClick={() => toast.success("Sent to clients")}>Send to client</GhostLink>}
              </div>
            </div>
          )}

          <h4 className="text-[13px] font-semibold mt-8 mb-3 uppercase tracking-wider" style={{ color: "rgba(26,16,8,0.50)" }}>Recently generated</h4>
          <table className="w-full text-sm">
            <thead><tr className="text-left text-[11px] uppercase" style={{ color: "rgba(26,16,8,0.50)" }}>
              <th className="py-2">Type</th><th className="py-2">Client</th><th className="py-2">Period</th><th className="py-2">Date</th><th className="py-2"></th>
            </tr></thead>
            <tbody>
              {[
                ["CFO Report", "Mehta Textiles", "Mar 2026", "Apr 12"],
                ["GST Summary", "Sharma & Sons", "Mar 2026", "Apr 10"],
                ["Compliance", "All clients", "Mar 2026", "Apr 5"],
              ].map((r, i) => (
                <tr key={i} style={{ borderTop: `1px solid ${COLORS.divider}` }}>
                  {r.map((c, j) => <td key={j} className="py-3 text-[13px]">{c}</td>)}
                  <td className="py-3 text-right"><GhostLink>Download</GhostLink></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </PageWrap>
  );
}
