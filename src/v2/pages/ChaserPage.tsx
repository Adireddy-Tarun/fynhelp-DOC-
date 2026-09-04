import { useState } from "react";
import { toast } from "sonner";
import { Send, Plus, MessageCircle } from "lucide-react";
import { Badge, Card, Drawer, EmptyState, Modal, PageHeader, Tone, V, formatDate } from "../ui";
import { Chase, useV2 } from "../store";

const TONE: Record<Chase["status"], Tone> = { Open: "info", "Following Up": "warn", Escalated: "bad", Resolved: "good" };
const TYPES = ["Bank statement", "Missing purchase bills", "Sales invoices", "GST confirmation", "Other"];

export default function ChaserPage() {
  const { chases, clients, clientName, addChase, setChaseStatus } = useV2();
  const [creating, setCreating] = useState(false);
  const [open, setOpen] = useState<Chase | null>(null);
  const [form, setForm] = useState({ clientId: clients[0]?.id ?? "", type: TYPES[0], contact: "", phone: "", due: "", note: "" });

  const active = open ? chases.find((c) => c.id === open.id) ?? open : null;

  const create = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.clientId || !form.contact.trim()) return;
    addChase(form);
    setCreating(false);
    toast.success("Chase item created");
  };

  const waLink = (c: Chase) =>
    `https://wa.me/${c.phone.replace(/\D/g, "")}?text=${encodeURIComponent(
      `Hello ${c.contact}, a gentle reminder from your accounts team regarding ${c.type.toLowerCase()} for ${clientName(c.clientId)}. Whenever convenient, could you please share it. Thank you.`,
    )}`;

  return (
    <>
      <PageHeader
        title="Chaser"
        subtitle="Polite follow ups, tracked to closure."
        action={<button className="v2-btn v2-btn-primary" onClick={() => setCreating(true)}><Plus size={15} /> Create chase item</button>}
      />

      {chases.length === 0 ? (
        <EmptyState
          icon={<Send size={22} />}
          title="Nothing to chase"
          description="Create a chase item when a client still owes you a statement, a bill or a confirmation."
          action={<button className="v2-btn v2-btn-primary" onClick={() => setCreating(true)}><Plus size={15} /> Create chase item</button>}
        />
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {chases.map((c) => (
            <Card
              key={c.id}
              onClick={() => setOpen(c)}
              style={{ cursor: "pointer", borderColor: c.status === "Escalated" ? "rgba(169,56,56,.35)" : V.line }}
            >
              <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) auto", gap: 12, alignItems: "center" }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 14.5 }}>{c.type}</div>
                  <div style={{ fontSize: 12.5, color: V.body, marginTop: 4 }}>{clientName(c.clientId)} · {c.contact} · due {formatDate(c.due)}</div>
                </div>
                <Badge tone={TONE[c.status]}>{c.status}</Badge>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={creating} onClose={() => setCreating(false)} title="Create chase item">
        <form onSubmit={create} style={{ display: "grid", gap: 14 }}>
          <div>
            <label className="v2-label">Client</label>
            <select className="v2-input" value={form.clientId} onChange={(e) => setForm({ ...form, clientId: e.target.value })}>
              {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="v2-label">Type</label>
            <select className="v2-input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div style={{ display: "grid", gap: 14, gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))" }}>
            <div>
              <label className="v2-label">Contact</label>
              <input className="v2-input" value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} required />
            </div>
            <div>
              <label className="v2-label">Phone</label>
              <input className="v2-input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="919820011223" />
            </div>
          </div>
          <div>
            <label className="v2-label">Due date</label>
            <input className="v2-input" type="date" value={form.due} onChange={(e) => setForm({ ...form, due: e.target.value })} required />
          </div>
          <div>
            <label className="v2-label">Note</label>
            <textarea className="v2-input" rows={3} value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button type="button" className="v2-btn v2-btn-ghost" onClick={() => setCreating(false)}>Cancel</button>
            <button type="submit" className="v2-btn v2-btn-primary">Create</button>
          </div>
        </form>
      </Modal>

      <Drawer open={!!active} onClose={() => setOpen(null)} title={active?.type ?? ""}>
        {active && (
          <div style={{ display: "grid", gap: 18 }}>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <Badge tone={TONE[active.status]}>{active.status}</Badge>
              <Badge>{clientName(active.clientId)}</Badge>
              <Badge>Due {formatDate(active.due)}</Badge>
            </div>
            {active.note && <p style={{ fontSize: 13.5, color: V.body, lineHeight: 1.6, margin: 0 }}>{active.note}</p>}

            {active.phone && (
              <div>
                <label className="v2-label">WhatsApp message</label>
                <div style={{ background: V.gray, borderRadius: 12, padding: 14, fontSize: 13, lineHeight: 1.6 }}>
                  Hello {active.contact}, a gentle reminder from your accounts team regarding {active.type.toLowerCase()} for {clientName(active.clientId)}. Whenever convenient, could you please share it. Thank you.
                </div>
                <a className="v2-btn v2-btn-primary" style={{ marginTop: 12 }} href={waLink(active)} target="_blank" rel="noreferrer">
                  <MessageCircle size={15} /> Send WhatsApp
                </a>
              </div>
            )}

            <div>
              <label className="v2-label">Activity</label>
              <div style={{ display: "grid", gap: 10 }}>
                {active.timeline.map((t, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, fontSize: 13 }}>
                    <span className="num" style={{ color: V.muted, minWidth: 90 }}>{formatDate(t.at)}</span>
                    <span>{t.text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button className="v2-btn v2-btn-ghost" onClick={() => { setChaseStatus(active.id, "Following Up", "Follow up sent"); toast.success("Marked as following up"); }}>Following up</button>
              <button className="v2-btn v2-btn-ghost" onClick={() => { setChaseStatus(active.id, "Escalated", "Escalated to partner"); toast.success("Escalated"); }}>Escalate</button>
              <button className="v2-btn v2-btn-primary" onClick={() => { setChaseStatus(active.id, "Resolved", "Document received"); toast.success("Chase resolved"); }}>Resolve</button>
            </div>
          </div>
        )}
      </Drawer>
    </>
  );
}
