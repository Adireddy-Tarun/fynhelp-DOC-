import { useState } from "react";
import { COLORS, PageWrap, PageHeader, Card, PrimaryBtn } from "@/components/ca/ui";
import { toast } from "sonner";
import { FileText, MessageSquare, CheckCircle2, Download, FileCheck } from "lucide-react";

const CLIENTS = ["Mehta Textiles", "Sharma & Sons", "Patel Manufacturing", "Delhi Distributors", "Anand Trading", "Surat Fabrics", "Nair Healthcare", "Iyer Consulting"];

const PANELS = [
  { id: "reports", icon: FileText, title: "Generate reports", desc: "Generate monthly reports for selected clients" },
  { id: "reminders", icon: MessageSquare, title: "Send filing reminders", desc: "WhatsApp + email reminders" },
  { id: "itc", icon: CheckCircle2, title: "Run ITC reconciliation", desc: "Reconcile 2B vs books" },
  { id: "export", icon: Download, title: "Export data", desc: "Excel / CSV / JSON" },
  { id: "filings", icon: FileCheck, title: "Mark filings as filed", desc: "Bulk update compliance status" },
];

export default function CABulkActionsPage() {
  const [selected, setSelected] = useState<string[]>([]);
  const toggle = (c: string) => setSelected((s) => s.includes(c) ? s.filter(x => x !== c) : [...s, c]);

  const run = (id: string) => {
    if (selected.length === 0) { toast.error("Select clients first"); return; }
    toast.success(`${id} action queued for ${selected.length} clients`);
  };

  return (
    <PageWrap>
      <PageHeader title="Bulk Actions" sub="Act across your entire portfolio at once." />

      <Card className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[15px] font-semibold">Select clients</h3>
          <div className="flex gap-2 text-xs">
            <button onClick={() => setSelected(CLIENTS)} className="px-3 py-1 rounded" style={{ background: "#F3F0E6" }}>Select all</button>
            <button onClick={() => setSelected(CLIENTS.slice(0, 2))} className="px-3 py-1 rounded" style={{ background: "#F3F0E6" }}>Critical only</button>
            <button onClick={() => setSelected([])} className="px-3 py-1 rounded" style={{ background: "#F3F0E6" }}>Clear</button>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {CLIENTS.map((c) => (
            <button key={c} onClick={() => toggle(c)}
              className="px-3 py-2 rounded text-xs font-medium text-left transition-colors"
              style={selected.includes(c) ? { background: COLORS.red, color: "#FFFFFF" } : { background: "#FFFFFF", border: `1px solid ${COLORS.caBorder}`, color: COLORS.ink }}>
              {c}
            </button>
          ))}
        </div>
        <div className="mt-3 text-xs font-semibold">{selected.length} clients selected</div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {PANELS.map((p) => {
          const Icon = p.icon;
          return (
            <Card key={p.id}>
              <Icon size={22} style={{ color: COLORS.red }} className="mb-3" />
              <h4 className="text-sm font-semibold mb-1">{p.title}</h4>
              <p className="text-[13px] mb-4" style={{ color: "rgba(23,18,8,0.60)" }}>{p.desc}</p>
              <PrimaryBtn size="sm" onClick={() => run(p.id)}>Run for {selected.length || 0} clients →</PrimaryBtn>
            </Card>
          );
        })}
      </div>
    </PageWrap>
  );
}
