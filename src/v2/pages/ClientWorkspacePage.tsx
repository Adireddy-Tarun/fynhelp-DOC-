import { useState } from "react";
import { toast } from "sonner";
import { Link, useParams } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { Badge, Card, EmptyState, PageHeader, Stat, Tabs, V, formatDate, formatINR } from "../ui";
import { useV2 } from "../store";

export default function ClientWorkspacePage() {
  const { clientId } = useParams({ from: "/v2/clients/$clientId" });
  const { clients, docs, exceptions, reports, chases } = useV2();
  const client = clients.find((c) => c.id === clientId);
  const [tab, setTab] = useState("documents");
  const [running, setRunning] = useState(false);

  if (!client) {
    return (
      <EmptyState
        title="Client not found"
        description="This client may have been removed. Go back to the client list to pick another one."
        action={<Link className="v2-btn v2-btn-primary" to="/v2/clients">Back to clients</Link>}
      />
    );
  }

  const cDocs = docs.filter((d) => d.clientId === client.id);
  const cEx = exceptions.filter((e) => e.clientId === client.id && e.status === "open");
  const cReports = reports.filter((r) => r.clientId === client.id);
  const cChases = chases.filter((c) => c.clientId === client.id);
  const bankRows = cDocs.flatMap((d) => d.rows);
  const matched = Math.max(0, bankRows.length - cEx.length);

  return (
    <>
      <Link to="/v2/clients" style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12.5, color: V.body, textDecoration: "none", marginBottom: 12 }}>
        <ChevronLeft size={14} /> Clients
      </Link>
      <PageHeader title={client.name} subtitle={`${client.entityType}${client.gstin ? ` · ${client.gstin}` : ""}`} />

      <Tabs
        value={tab}
        onChange={setTab}
        items={[
          { value: "documents", label: "Documents", count: cDocs.length },
          { value: "recon", label: "Recon" },
          { value: "mis", label: "MIS", count: cReports.length },
          { value: "chaser", label: "Chaser", count: cChases.length },
        ]}
      />

      {tab === "documents" && (
        cDocs.length === 0 ? (
          <EmptyState title="No documents for this client" description="Upload a statement or bills from the Documents page and they will show up here." action={<Link className="v2-btn v2-btn-primary" to="/v2/documents">Go to Documents</Link>} />
        ) : (
          <Card style={{ padding: 0 }} className="v2-scroll">
            <table className="v2-table">
              <thead><tr><th>File</th><th>Source</th><th>Status</th><th>Date</th></tr></thead>
              <tbody>
                {cDocs.map((d) => (
                  <tr key={d.id}>
                    <td style={{ fontWeight: 600 }}>{d.name}</td>
                    <td style={{ color: V.body }}>{d.source}</td>
                    <td><Badge tone={d.status === "Parsed" ? "good" : d.status === "Failed" ? "bad" : "info"}>{d.status}</Badge></td>
                    <td className="num" style={{ color: V.body }}>{formatDate(d.date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )
      )}

      {tab === "recon" && (
        <>
          <div className="v2-grid-cards" style={{ marginBottom: 18 }}>
            <Stat label="Bank transactions" value={bankRows.length} />
            <Stat label="Book transactions" value={Math.max(0, bankRows.length - 1)} />
            <Stat label="Matched" value={matched} />
            <Stat label="Unmatched" value={cEx.length} tone={cEx.length ? "bad" : "neutral"} />
          </div>
          <div style={{ display: "flex", gap: 10, marginBottom: 18, flexWrap: "wrap" }}>
            <button
              className="v2-btn v2-btn-primary"
              disabled={running}
              onClick={() => { setRunning(true); setTimeout(() => { setRunning(false); toast.success("Reconciliation complete"); }, 1400); }}
            >
              {running ? "Running recon" : "Run recon"}
            </button>
            <Link className="v2-btn v2-btn-ghost" to="/v2/exceptions">View exception queue</Link>
          </div>
          <Card style={{ padding: 0 }} className="v2-scroll">
            <table className="v2-table">
              <thead><tr><th>Date</th><th>Particulars</th><th>Amount</th><th>Status</th></tr></thead>
              <tbody>
                {bankRows.length === 0 && <tr><td colSpan={4} style={{ color: V.muted, textAlign: "center", padding: 28 }}>No transactions to reconcile yet.</td></tr>}
                {bankRows.map((r, i) => (
                  <tr key={i}>
                    <td className="num">{formatDate(r.date)}</td>
                    <td>{r.particulars}</td>
                    <td className="num" style={{ color: r.amount < 0 ? V.maroon : V.green }}>{formatINR(r.amount)}</td>
                    <td><Badge tone={i < matched ? "good" : "warn"}>{i < matched ? "Matched" : "Unmatched"}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </>
      )}

      {tab === "mis" && (
        cReports.length === 0 ? (
          <EmptyState title="No MIS yet" description="Generate a report for this client from the reports section." action={<Link className="v2-btn v2-btn-primary" to="/v2/reports">Go to Reports</Link>} />
        ) : (
          <Card style={{ padding: 0 }} className="v2-scroll">
            <table className="v2-table">
              <thead><tr><th>Period</th><th>Revenue</th><th>Expenses</th><th>Generated</th></tr></thead>
              <tbody>
                {cReports.map((r) => (
                  <tr key={r.id}>
                    <td style={{ fontWeight: 600 }}>{r.period}</td>
                    <td className="num" style={{ color: V.green }}>{formatINR(r.revenue)}</td>
                    <td className="num" style={{ color: V.maroon }}>{formatINR(r.expenses)}</td>
                    <td className="num" style={{ color: V.body }}>{formatDate(r.generated)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )
      )}

      {tab === "chaser" && (
        cChases.length === 0 ? (
          <EmptyState title="Nothing pending from this client" description="When something is outstanding, create a chase item and track it to closure." action={<Link className="v2-btn v2-btn-primary" to="/v2/chaser">Go to Chaser</Link>} />
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {cChases.map((c) => (
              <Card key={c.id}>
                <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) auto", gap: 12, alignItems: "center" }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{c.type}</div>
                    <div style={{ fontSize: 12.5, color: V.body, marginTop: 3 }}>{c.contact} · due {formatDate(c.due)}</div>
                  </div>
                  <Badge tone={c.status === "Escalated" ? "bad" : c.status === "Resolved" ? "good" : "warn"}>{c.status}</Badge>
                </div>
              </Card>
            ))}
          </div>
        )
      )}
    </>
  );
}
