import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Send, Paperclip } from "lucide-react";
import { Card } from "./AdminDashboardPage";
import { toast } from "sonner";
import { logAdminAction } from "@/lib/adminAudit";

const MOCK = {
  number: "TKT-001234",
  subject: "Payment failed after upgrade",
  created: "May 5, 2026 at 14:35",
  updated: "2 hours ago",
  user: { name: "Rajesh Kumar", email: "rajesh@techcorp.com", company: "TechCorp Pvt Ltd", plan: "Pro", id: "user-1" },
  thread: [
    { from: "user", author: "Rajesh Kumar", time: "May 5, 14:35", text: "I upgraded to Pro yesterday but my payment failed. Can you help?" },
    { from: "admin", author: "Tarun", time: "May 5, 15:10", text: "Hi Rajesh, I can help with that. Let me check your payment logs." },
  ],
  notes: [{ author: "Tarun", time: "1 hour ago", text: "Called user. Issue was incorrect card details." }],
};

export default function AdminSupportTicketDetailPage() {
  const { id } = useParams();
  const nav = useNavigate();
  const [reply, setReply] = useState("");
  const [internal, setInternal] = useState(false);
  const [thread, setThread] = useState(MOCK.thread);
  const [notes, setNotes] = useState(MOCK.notes);
  const [note, setNote] = useState("");
  const [status, setStatus] = useState("open");
  const [priority, setPriority] = useState("high");
  const [category, setCategory] = useState("billing");
  const [assigned, setAssigned] = useState("unassigned");

  const sendReply = async () => {
    if (!reply.trim()) return;
    if (internal) {
      setNotes((n) => [{ author: "You", time: "just now", text: reply }, ...n]);
    } else {
      setThread((t) => [...t, { from: "admin", author: "You", time: "just now", text: reply }]);
    }
    await logAdminAction({
      action: internal ? "ticket_internal_note_added" : "ticket_reply_sent",
      target_type: "support_ticket",
      details: { ticket_id: id, length: reply.length },
    });
    toast.success(internal ? "Internal note saved" : "Reply sent to user");
    setReply("");
  };

  const saveNote = () => {
    if (!note.trim()) return;
    setNotes((n) => [{ author: "You", time: "just now", text: note }, ...n]);
    setNote("");
    toast.success("Note saved");
  };

  return (
    <div>
      <button onClick={() => nav(-1)} className="flex items-center gap-2 mb-5 text-sm hover:opacity-80"
        style={{ fontFamily: "Raleway, sans-serif", fontWeight: 600, color: "hsl(var(--fyn-ink) / 0.7)" }}>
        <ArrowLeft size={16} /> Back to tickets
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: ticket info */}
        <div className="lg:col-span-3">
          <Card>
            <div style={{ fontFamily: "Oswald, sans-serif", fontWeight: 700, fontSize: 22, color: "hsl(var(--fyn-ink))" }}>{MOCK.number}</div>
            <div className="mt-1" style={{ fontFamily: "Roboto, sans-serif", fontSize: 12, color: "hsl(var(--fyn-ink) / 0.6)" }}>
              Created {MOCK.created}<br />Updated {MOCK.updated}
            </div>
            <Divider />
            <div className="flex items-center gap-3">
              <span className="grid place-items-center rounded-full text-white"
                style={{ width: 44, height: 44, background: "linear-gradient(135deg, #C41E1E 0%, #8B6914 100%)", fontFamily: "Raleway, sans-serif", fontWeight: 700 }}>
                {MOCK.user.name.split(" ").map(s => s[0]).join("").slice(0, 2)}
              </span>
              <div>
                <div style={{ fontFamily: "Raleway, sans-serif", fontWeight: 600, fontSize: 14, color: "hsl(var(--fyn-ink))" }}>{MOCK.user.name}</div>
                <div style={{ fontFamily: "Roboto, sans-serif", fontSize: 12, color: "hsl(var(--fyn-ink) / 0.6)" }}>{MOCK.user.email}</div>
              </div>
            </div>
            <div className="mt-2" style={{ fontFamily: "Roboto, sans-serif", fontSize: 12, color: "hsl(var(--fyn-ink) / 0.7)" }}>
              {MOCK.user.company}
              <span className="ml-2" style={{ padding: "2px 7px", borderRadius: 6, background: "rgba(139,105,20,0.15)", color: "#8B6914", fontWeight: 600, fontSize: 10 }}>{MOCK.user.plan}</span>
            </div>

            <Divider />
            <Field label="Category"><Select value={category} onChange={setCategory} options={[["billing","Billing"],["technical","Technical"],["feature_request","Feature"],["bug","Bug"],["other","Other"]]} /></Field>
            <Field label="Priority"><Select value={priority} onChange={setPriority} options={[["low","Low"],["medium","Medium"],["high","High"],["urgent","Urgent"]]} /></Field>
            <Field label="Status"><Select value={status} onChange={setStatus} options={[["open","Open"],["in_progress","In Progress"],["waiting_customer","Waiting Customer"],["resolved","Resolved"],["closed","Closed"]]} /></Field>
            <Field label="Assigned"><Select value={assigned} onChange={setAssigned} options={[["unassigned","Unassigned"],["self","Assign to me"],["tarun","Tarun"],["nidhi","Nidhi"]]} /></Field>

            <Divider />
            <button onClick={() => toast.info("Close ticket coming in Part 4")} className="w-full py-2 rounded-lg text-white"
              style={{ background: "#C41E1E", fontFamily: "Raleway, sans-serif", fontWeight: 600, fontSize: 13 }}>
              Close Ticket
            </button>
          </Card>
        </div>

        {/* Middle: conversation */}
        <div className="lg:col-span-6">
          <Card>
            <h2 style={{ fontFamily: "Raleway, sans-serif", fontWeight: 700, fontSize: 20, color: "hsl(var(--fyn-ink))" }}>{MOCK.subject}</h2>
            <Divider />
            <div className="space-y-3">
              {thread.map((m, i) => (
                <div key={i} className={m.from === "admin" ? "flex justify-end" : "flex justify-start"}>
                  <div className="max-w-[80%] rounded-2xl p-3"
                    style={{
                      background: m.from === "admin" ? "rgba(139,105,20,0.12)" : "rgba(244,237,218,0.7)",
                      border: "1px solid rgba(139,105,20,0.15)",
                    }}>
                    <div className="flex items-center justify-between gap-3 mb-1" style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11, color: "hsl(var(--fyn-ink) / 0.6)" }}>
                      <span style={{ fontWeight: 600, color: "hsl(var(--fyn-ink))" }}>{m.author}</span><span>{m.time}</span>
                    </div>
                    <div style={{ fontFamily: "Roboto, sans-serif", fontSize: 14, color: "hsl(var(--fyn-ink))", lineHeight: 1.5 }}>{m.text}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-xl p-3" style={{ background: "rgba(244,237,218,0.4)", border: "1px solid rgba(139,105,20,0.15)" }}>
              <textarea value={reply} onChange={(e) => setReply(e.target.value)} rows={3}
                placeholder={`Write a reply to ${MOCK.user.name.split(" ")[0]}…`}
                className="w-full bg-transparent outline-none resize-y"
                style={{ fontFamily: "Roboto, sans-serif", fontSize: 14, color: "hsl(var(--fyn-ink))" }} />
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-3">
                  <button className="p-1.5 rounded hover:bg-[hsl(var(--fyn-ink)/0.05)]" aria-label="Attach"><Paperclip size={16} color="hsl(var(--fyn-ink) / 0.5)" /></button>
                  <label className="flex items-center gap-2" style={{ fontFamily: "Roboto, sans-serif", fontSize: 12, color: "hsl(var(--fyn-ink) / 0.7)" }}>
                    <input type="checkbox" checked={internal} onChange={(e) => setInternal(e.target.checked)} />
                    Internal note (not visible to user)
                  </label>
                </div>
                <button onClick={sendReply} className="flex items-center gap-2 px-4 py-2 rounded-lg text-white"
                  style={{ background: "linear-gradient(135deg, #C41E1E 0%, #8B6914 100%)", fontFamily: "Raleway, sans-serif", fontWeight: 600, fontSize: 13 }}>
                  <Send size={13} /> {internal ? "Save Note" : "Send Reply"}
                </button>
              </div>
            </div>
          </Card>
        </div>

        {/* Right: notes */}
        <div className="lg:col-span-3">
          <Card>
            <h3 style={{ fontFamily: "Raleway, sans-serif", fontWeight: 700, fontSize: 16, color: "hsl(var(--fyn-ink))" }}>Internal Notes</h3>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={4}
              placeholder="Add private notes about this ticket…"
              className="w-full mt-3 rounded-lg px-3 py-2.5"
              style={{ border: "1px solid rgba(26,16,8,0.15)", fontFamily: "Roboto, sans-serif", fontSize: 13 }} />
            <button onClick={saveNote} className="mt-2 px-4 py-2 rounded-lg"
              style={{ background: "rgba(139,105,20,0.15)", color: "#8B6914", fontFamily: "Raleway, sans-serif", fontWeight: 600, fontSize: 13 }}>
              Save note
            </button>
            <Divider />
            <div className="space-y-3">
              {notes.map((n, i) => (
                <div key={i}>
                  <div style={{ fontFamily: "Roboto, sans-serif", fontSize: 13, color: "hsl(var(--fyn-ink))", lineHeight: 1.5 }}>{n.text}</div>
                  <div className="mt-1" style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11, color: "hsl(var(--fyn-ink) / 0.5)" }}>{n.author}, {n.time}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Divider() { return <div className="my-4" style={{ height: 1, background: "rgba(26,16,8,0.08)" }} />; }
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block mb-3">
      <span className="block mb-1" style={{ fontFamily: "Raleway, sans-serif", fontWeight: 600, fontSize: 11, color: "hsl(var(--fyn-ink) / 0.6)", textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</span>
      {children}
    </label>
  );
}
function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: [string, string][] }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-lg px-2.5 py-2"
      style={{ border: "1px solid rgba(26,16,8,0.15)", fontFamily: "Roboto, sans-serif", fontSize: 13 }}>
      {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
    </select>
  );
}
