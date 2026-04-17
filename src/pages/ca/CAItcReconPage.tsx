import { useState } from "react";
import { COLORS, PageWrap, PageHeader, Card, MetricCard, Chip, PrimaryBtn, GhostLink } from "@/components/ca/ui";
import { toast } from "sonner";

export default function CAItcReconPage() {
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [period, setPeriod] = useState("April 2026");

  const run = () => {
    setRunning(true); setProgress(0);
    const i = setInterval(() => setProgress((p) => {
      if (p >= 47) { clearInterval(i); setRunning(false); toast.success("Reconciliation complete"); return 47; }
      return p + 3;
    }), 80);
  };

  const RESULTS = [
    { client: "Mehta Textiles", period: "Apr 2026", books: "₹7.4L", in2B: "₹4.2L", mismatches: 4, safe: "₹4.2L", risk: "₹3.2L", status: "Mismatches found" },
    { client: "Sharma & Sons", period: "Apr 2026", books: "₹3.9L", in2B: "₹2.1L", mismatches: 3, safe: "₹2.1L", risk: "₹1.8L", status: "Mismatches found" },
    { client: "Patel Manufacturing", period: "Apr 2026", books: "₹9.1L", in2B: "₹8.5L", mismatches: 1, safe: "₹8.5L", risk: "₹0.6L", status: "Mismatches found" },
    { client: "Anand Trading", period: "Apr 2026", books: "₹2.0L", in2B: "₹2.0L", mismatches: 0, safe: "₹2.0L", risk: "₹0", status: "Clean" },
  ];

  return (
    <PageWrap>
      <PageHeader title="ITC Reconciliation" sub="Run reconciliation across your entire portfolio." />

      <Card className="mb-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium">Period:</label>
            <select value={period} onChange={(e) => setPeriod(e.target.value)} className="h-9 px-3 rounded text-sm bg-white" style={{ border: `1px solid ${COLORS.caBorder}` }}>
              <option>April 2026</option><option>March 2026</option><option>February 2026</option>
            </select>
          </div>
          <PrimaryBtn onClick={run} disabled={running}>{running ? `${progress}/47 complete...` : "Run reconciliation for all clients"}</PrimaryBtn>
        </div>
        {running && (
          <div className="mt-4">
            <div className="h-2 rounded-full overflow-hidden" style={{ background: "#F0EBD8" }}>
              <div className="h-full transition-all duration-200" style={{ width: `${(progress / 47) * 100}%`, background: COLORS.red }} />
            </div>
          </div>
        )}
      </Card>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <MetricCard label="Clients" value="47" sub="In current period" />
        <MetricCard label="Clean" value="33" valueColor={COLORS.greenSoft} sub="No mismatches" />
        <MetricCard label="Mismatches" value="14" valueColor={COLORS.amberSoft} sub="Need attention" />
        <MetricCard label="Total at Risk" value="₹68.4L" valueColor={COLORS.redSoft} sub="Combined" />
      </div>

      <Card>
        <h3 className="text-[15px] font-semibold mb-4">Results</h3>
        <table className="w-full text-sm">
          <thead><tr className="text-left text-[11px] uppercase" style={{ color: "rgba(26,16,8,0.50)" }}>
            <th className="py-2">Client</th><th className="py-2">Period</th><th className="py-2">In Books</th><th className="py-2">In 2B</th>
            <th className="py-2">Mismatches</th><th className="py-2">Safe</th><th className="py-2">At Risk</th><th className="py-2">Status</th><th className="py-2"></th>
          </tr></thead>
          <tbody>
            {RESULTS.map((r, i) => (
              <tr key={i} style={{ borderTop: `1px solid ${COLORS.divider}` }}>
                <td className="py-3 font-medium">{r.client}</td>
                <td className="py-3 text-[13px]">{r.period}</td>
                <td className="py-3">{r.books}</td>
                <td className="py-3">{r.in2B}</td>
                <td className="py-3">{r.mismatches}</td>
                <td className="py-3" style={{ color: COLORS.green }}>{r.safe}</td>
                <td className="py-3 font-semibold" style={{ color: r.risk === "₹0" ? "rgba(26,16,8,0.40)" : COLORS.red }}>{r.risk}</td>
                <td className="py-3"><Chip tone={r.status === "Clean" ? "green" : "red"}>{r.status}</Chip></td>
                <td className="py-3 text-right"><GhostLink onClick={() => toast.info(`Opening ${r.client}…`)}>Review →</GhostLink></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </PageWrap>
  );
}
