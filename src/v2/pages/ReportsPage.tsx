import { useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";
import { BarChart3, Plus } from "lucide-react";
import { Card, EmptyState, Modal, PageHeader, V, formatDate, formatINR } from "../ui";
import { useV2 } from "../store";

const PERIODS = ["August 2026", "July 2026", "June 2026", "Q1 FY 2026-27"];

export default function ReportsPage() {
  const { reports, clients, clientName, addReport } = useV2();
  const [open, setOpen] = useState(false);
  const [clientId, setClientId] = useState(clients[0]?.id ?? "");
  const [period, setPeriod] = useState(PERIODS[0]);
  const navigate = useNavigate();

  const generate = () => {
    if (!clientId) { toast.error("Add a client first"); return; }
    const r = addReport(clientId, period);
    setOpen(false);
    toast.success("MIS report generated");
    navigate({ to: "/v2/reports/$reportId", params: { reportId: r.id } });
  };

  return (
    <>
      <PageHeader
        title="MIS and Reports"
        subtitle="Narrate agent. Numbers with the transactions behind them."
        action={<button className="v2-btn v2-btn-primary" onClick={() => setOpen(true)}><Plus size={15} /> Generate MIS</button>}
      />

      {reports.length === 0 ? (
        <EmptyState
          icon={<BarChart3 size={22} />}
          title="No reports yet"
          description="Generate an MIS for a client and period. Every number stays linked to the transactions it came from."
          action={<button className="v2-btn v2-btn-primary" onClick={() => setOpen(true)}><Plus size={15} /> Generate MIS</button>}
        />
      ) : (
        <Card style={{ padding: 0 }} className="v2-scroll">
          <table className="v2-table">
            <thead><tr><th>Client</th><th>Period</th><th>Revenue</th><th>Expenses</th><th>Generated</th></tr></thead>
            <tbody>
              {reports.map((r) => (
                <tr key={r.id} className="clickable" onClick={() => navigate({ to: "/v2/reports/$reportId", params: { reportId: r.id } })}>
                  <td style={{ fontWeight: 600 }}>{clientName(r.clientId)}</td>
                  <td style={{ color: V.body }}>{r.period}</td>
                  <td className="num" style={{ color: V.green }}>{formatINR(r.revenue)}</td>
                  <td className="num" style={{ color: V.maroon }}>{formatINR(r.expenses)}</td>
                  <td className="num" style={{ color: V.body }}>{formatDate(r.generated)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Generate MIS">
        <div style={{ display: "grid", gap: 14 }}>
          <div>
            <label className="v2-label">Client</label>
            <select className="v2-input" value={clientId} onChange={(e) => setClientId(e.target.value)}>
              {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="v2-label">Period</label>
            <select className="v2-input" value={period} onChange={(e) => setPeriod(e.target.value)}>
              {PERIODS.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button className="v2-btn v2-btn-ghost" onClick={() => setOpen(false)}>Cancel</button>
            <button className="v2-btn v2-btn-primary" onClick={generate}>Generate</button>
          </div>
        </div>
      </Modal>
    </>
  );
}
