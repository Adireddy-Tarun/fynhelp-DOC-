import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";
import { Badge, Card, Drawer, EmptyState, PageHeader, Tone, V, formatDate, formatINR } from "../ui";
import { ReviewItem, useV2 } from "../store";

export default function ReviewPage() {
  const { review, clients, clientName, resolveReview } = useV2();
  const [client, setClient] = useState("all");
  const [open, setOpen] = useState<ReviewItem | null>(null);
  const [draft, setDraft] = useState({ date: "", particulars: "", amount: 0 });

  const list = review.filter((r) => r.status === "open" && (client === "all" || r.clientId === client));

  const openItem = (r: ReviewItem) => { setOpen(r); setDraft(r.suggestion); };

  const confirm = (edited: boolean) => {
    if (!open) return;
    resolveReview(open.id, "confirmed", edited ? draft : undefined);
    toast.success(edited ? "Edited and confirmed" : "Item confirmed");
    setOpen(null);
  };

  const tone = (c: number): Tone => (c >= 0.7 ? "warn" : "bad");

  return (
    <>
      <PageHeader title="Review Queue" subtitle="Only the rows the extract agent was unsure about." />

      <div style={{ marginBottom: 16 }}>
        <select className="v2-input" style={{ width: "auto", minWidth: 220 }} value={client} onChange={(e) => setClient(e.target.value)}>
          <option value="all">All clients</option>
          {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {list.length === 0 ? (
        <EmptyState
          icon={<CheckCircle2 size={22} />}
          title="All clear — nothing needs review"
          description="Every extracted row met the confidence threshold. New low confidence rows will show up here automatically."
        />
      ) : (
        <Card style={{ padding: 0 }} className="v2-scroll">
          <table className="v2-table">
            <thead><tr><th>Client</th><th>Document</th><th>Raw text</th><th>Suggestion</th><th>Confidence</th></tr></thead>
            <tbody>
              {list.map((r) => (
                <tr key={r.id} className="clickable" onClick={() => openItem(r)}>
                  <td style={{ fontWeight: 600 }}>{clientName(r.clientId)}</td>
                  <td style={{ color: V.body }}>{r.docName}</td>
                  <td style={{ color: V.muted, fontSize: 12.5, maxWidth: 240, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.rawText}</td>
                  <td>{r.suggestion.particulars}</td>
                  <td><Badge tone={tone(r.confidence)}>{Math.round(r.confidence * 100)} percent</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      <Drawer open={!!open} onClose={() => setOpen(null)} title="Review extraction">
        {open && (
          <div style={{ display: "grid", gap: 18 }}>
            <div>
              <label className="v2-label">Original raw text</label>
              <div className="num" style={{ background: V.gray, borderRadius: 12, padding: 14, fontSize: 13, lineHeight: 1.6 }}>{open.rawText}</div>
            </div>
            <div style={{ display: "grid", gap: 12 }}>
              <div>
                <label className="v2-label">Date</label>
                <input className="v2-input" type="date" value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })} />
              </div>
              <div>
                <label className="v2-label">Particulars</label>
                <input className="v2-input" value={draft.particulars} onChange={(e) => setDraft({ ...draft, particulars: e.target.value })} />
              </div>
              <div>
                <label className="v2-label">Amount</label>
                <input className="v2-input" type="number" value={draft.amount} onChange={(e) => setDraft({ ...draft, amount: Number(e.target.value) })} />
                <div style={{ fontSize: 12, color: V.muted, marginTop: 6 }}>{formatINR(draft.amount)} on {draft.date ? formatDate(draft.date) : "no date"}</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button className="v2-btn v2-btn-primary" onClick={() => confirm(false)}>Confirm</button>
              <button className="v2-btn v2-btn-ghost" onClick={() => confirm(true)}>Edit and confirm</button>
              <button
                className="v2-btn v2-btn-ghost"
                onClick={() => { resolveReview(open.id, "discarded"); toast.success("Item discarded"); setOpen(null); }}
              >
                Discard
              </button>
            </div>
          </div>
        )}
      </Drawer>
    </>
  );
}
