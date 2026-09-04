import { useEffect, useState } from "react";
import { Link, useParams } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import { Card, Drawer, EmptyState, PageHeader, V, formatDate, formatINR } from "../ui";
import { AgentStatusBadge, AnimatedCounter, FadeIn, RowSkeleton } from "../agents";
import { Txn, useV2 } from "../store";

export default function ReportDetailPage() {
  const { reportId } = useParams({ from: "/v2/reports/$reportId" });
  const { reports, clientName } = useV2();
  const report = reports.find((r) => r.id === reportId);
  const [source, setSource] = useState<{ label: string; rows: Txn[] } | null>(null);
  const [insightsReady, setInsightsReady] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setInsightsReady(true), 900);
    return () => clearTimeout(t);
  }, [reportId]);

  if (!report) {
    return <EmptyState title="Report not found" description="This report may have been removed. Go back to the reports list to pick another one." action={<Link className="v2-btn v2-btn-primary" to="/v2/reports">Back to reports</Link>} />;
  }

  const net = report.revenue - report.expenses;
  const allRows = [...report.sources.revenue, ...report.sources.expenses];

  const metrics = [
    { label: "Revenue", value: report.revenue, tone: V.green, rows: report.sources.revenue },
    { label: "Expenses", value: report.expenses, tone: V.maroon, rows: report.sources.expenses },
    { label: "Net", value: net, tone: net >= 0 ? V.green : V.maroon, rows: allRows },
  ];

  return (
    <>
      <Link to="/v2/reports" style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12.5, color: V.body, textDecoration: "none", marginBottom: 12 }}>
        <ChevronLeft size={14} /> Reports
      </Link>
      <PageHeader
        title={`${clientName(report.clientId)} — ${report.period}`}
        subtitle={`Generated ${formatDate(report.generated)} from ${allRows.length} matched transactions`}
        action={<AgentStatusBadge agent="narrate" label="Narrate" />}
      />

      <div className="v2-grid-cards" style={{ marginBottom: 20 }}>
        {metrics.map((m, i) => (
          <motion.div key={m.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: i * 0.07 }}>
            <Card hover onClick={() => setSource({ label: m.label, rows: m.rows })} style={{ cursor: "pointer" }}>
              <div style={{ fontSize: 11, letterSpacing: ".09em", textTransform: "uppercase", color: V.muted, fontWeight: 600 }}>{m.label}</div>
              <div style={{ fontSize: 32, fontWeight: 600, marginTop: 10, color: m.tone, letterSpacing: "-0.03em" }}>
                <AnimatedCounter value={m.value} format={(n) => formatINR(n)} />
              </div>
              <div style={{ fontSize: 12, color: V.muted, marginTop: 6 }}>{m.rows.length} source transactions. Click to open.</div>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <h3 style={{ fontSize: 15.5 }}>Insights</h3>
          <AgentStatusBadge agent="narrate" active={!insightsReady} label={insightsReady ? "Written" : "Writing insights"} />
        </div>
        {!insightsReady ? (
          <RowSkeleton rows={2} height={62} />
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {report.insights.map((i, idx) => (
              <FadeIn key={idx} delay={idx * 0.12}>
                <div style={{ background: V.gray, borderRadius: 14, padding: 14 }}>
                  <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.6 }}>{i.text}</p>
                  <button
                    className="v2-btn v2-btn-quiet"
                    style={{ marginTop: 10 }}
                    onClick={() => setSource({ label: i.source, rows: allRows })}
                  >
                    {i.source}
                  </button>
                </div>
              </FadeIn>
            ))}
          </div>
        )}
      </Card>

      <Drawer open={!!source} onClose={() => setSource(null)} title={`Source transactions — ${source?.label ?? ""}`}>
        {!source || source.rows.length === 0 ? (
          <p style={{ fontSize: 13.5, color: V.body }}>No matched transactions are linked to this figure yet.</p>
        ) : (
          <table className="v2-table">
            <thead><tr><th>Date</th><th>Particulars</th><th style={{ textAlign: "right" }}>Amount</th></tr></thead>
            <tbody>
              {source.rows.map((r, i) => (
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
