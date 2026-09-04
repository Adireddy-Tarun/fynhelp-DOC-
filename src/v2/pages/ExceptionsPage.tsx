import { useState } from "react";
import { toast } from "sonner";
import { ShieldCheck } from "lucide-react";
import { Badge, Card, EmptyState, PageHeader, V, formatDate, formatINR } from "../ui";
import { useV2 } from "../store";

const REASONS = ["Amount mismatch", "Date gap", "No candidate", "Duplicate"] as const;

export default function ExceptionsPage() {
  const { exceptions, clients, clientName, setExceptionStatus } = useV2();
  const [client, setClient] = useState("all");
  const [reason, setReason] = useState("all");

  const list = exceptions.filter(
    (e) => e.status === "open" && (client === "all" || e.clientId === client) && (reason === "all" || e.reason === reason),
  );

  return (
    <>
      <PageHeader title="Exception Queue" subtitle="Bank lines the recon agent could not settle on its own." />

      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <select className="v2-input" style={{ width: "auto", minWidth: 200 }} value={client} onChange={(e) => setClient(e.target.value)}>
          <option value="all">All clients</option>
          {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select className="v2-input" style={{ width: "auto", minWidth: 200 }} value={reason} onChange={(e) => setReason(e.target.value)}>
          <option value="all">All reason codes</option>
          {REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      {list.length === 0 ? (
        <EmptyState
          icon={<ShieldCheck size={22} />}
          title="No open exceptions"
          description="Every bank line has a match. Anything the recon agent cannot settle will appear here with a reason code."
        />
      ) : (
        <Card style={{ padding: 0 }} className="v2-scroll">
          <table className="v2-table">
            <thead><tr><th>Client</th><th>Reason</th><th>Narration</th><th>Amount</th><th>Date</th><th>Suggested match</th><th /></tr></thead>
            <tbody>
              {list.map((e) => (
                <tr key={e.id}>
                  <td style={{ fontWeight: 600 }}>{clientName(e.clientId)}</td>
                  <td><Badge tone="warn">{e.reason}</Badge></td>
                  <td style={{ color: V.body }}>{e.narration}</td>
                  <td className="num" style={{ color: e.amount < 0 ? V.maroon : V.green }}>{formatINR(e.amount)}</td>
                  <td className="num" style={{ color: V.body }}>{formatDate(e.date)}</td>
                  <td style={{ color: V.body, fontSize: 12.5 }}>{e.candidates[0] ?? "No candidate found"}</td>
                  <td>
                    <div style={{ display: "flex", gap: 7, justifyContent: "flex-end" }}>
                      <button className="v2-btn v2-btn-quiet" onClick={() => { setExceptionStatus(e.id, "resolved"); toast.success("Matched manually"); }}>Match</button>
                      <button className="v2-btn v2-btn-quiet" onClick={() => { setExceptionStatus(e.id, "ignored"); toast.success("Exception ignored"); }}>Ignore</button>
                      <button className="v2-btn v2-btn-quiet" onClick={() => { setExceptionStatus(e.id, "resolved"); toast.success("Exception resolved"); }}>Resolve</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </>
  );
}
