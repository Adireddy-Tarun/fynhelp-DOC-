import { useState } from "react";
import { Link, useParams } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { Card, Drawer, EmptyState, PageHeader, V, formatDate, formatINR } from "../ui";
import { useV2 } from "../store";

export default function ReportDetailPage() {
  const { reportId } = useParams({ from: "/v2/reports/$reportId" });
  const { reports, clientName, docs } = useV2();
  const report = reports.find((r) => r.id === reportId);
  const [source, setSource] = useState<string | null>(null);

  if (!report) {
    return <EmptyState title="Report not found" description="This report may have been removed. Go back to the reports list to pick another one." action={<Link className="v2-btn v2-btn-primary" to="/v2/reports">Back to reports</Link>} />;
  }

  const rows = docs.filter((d) => d.clientId === report.clientId).flatMap((d) => d.rows);
  const net = report.revenue - report.expenses;

  return (
    <>
      <Link to="/v2/reports" style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12.5, color: V.body, textDecoration: "none", marginBottom: 12 }}>
        <ChevronLeft size={14} /> Reports
      </Link>
      <PageHeader title={`${clientName(report.clientId)} — ${report.period}`} subtitle={`Generated ${formatDate(report.generated)}`} />

      <div className="v2-grid-cards" style={{ marginBottom: 20 }}>
        {[
          { label: "Revenue", value: report.revenue, tone: V.green },
          { label: "Expenses", value: report.expenses, tone: V.maroon },
          { label: "Net", value: net, tone: net >= 0 ? V.green : V.maroon },
        ].map((m) => (
          <Card key={m.label} onClick={() => setSource(m.label)} style={{ cursor: "pointer" }}>
            <div style={{ fontSize: 11, letterSpacing: ".09em", textTransform: "uppercase", color: V.muted, fontWeight: 600 }}>{m.label}</div>
            <div className="num" style={{ fontSize: 32, fontWeight: 600, marginTop: 10, color: m.tone, letterSpacing: "-0.03em" }}>{formatINR(m.value)}</div>
            <div style={{ fontSize: 12, color: V.muted, marginTop: 6 }}>Click to see source transactions</div>
          </Card>
        ))}
      </div>

      <Card>
        <h3 style={{ fontSize: 15.5, marginBottom: 12 }}>Insights</h3>
        <div style={{ display: "grid", gap: 12 }}>
          {report.insights.map((i, idx) => (
            <div key={idx} style={{ background: V.gray, borderRadius: 14, padding: 14 }}>
              <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.6 }}>{i.text}</p>
              <button className="v2-btn v2-btn-quiet" style={{ marginTop: 10 }} onClick={() => setSource(i.source)}>{i.source}</button>
            </div>
          ))}
        </div>
      </Card>

      <Drawer open={!!source} onClose={() => setSource(null)} title={`Source transactions — ${source ?? ""}`}>
        {rows.length === 0 ? (
          <p style={{ fontSize: 13.5, color: V.body }}>No matched transactions are linked to this figure yet.</p>
        ) : (
          <table className="v2-table">
            <thead><tr><th>Date</th><th>Particulars</th><th style={{ textAlign: "right" }}>Amount</th></tr></thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i}>
                  <td className="num">{formatDate(r.date)}</td>
                  <td>{r.particulars}</td>
                  <td className="num" style={{ textAlign: "right", color: r.amount < 0 ? V.maroon : V.green }}>{formatINR(r.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Drawer>
    </>
  );
}
