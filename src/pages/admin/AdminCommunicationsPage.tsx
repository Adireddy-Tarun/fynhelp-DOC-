import { useState } from "react";
import { MessageCircle, Share2, Twitter, Mail, Eye, Clock, X, Send } from "lucide-react";
import { Card, PageHeader } from "./AdminDashboardPage";
import { toast } from "sonner";
import { logAdminAction } from "@/lib/adminAudit";

type Platform = "whatsapp" | "meta" | "twitter" | "email";

const CHANNELS: { id: Platform; title: string; subtitle: string; icon: typeof MessageCircle; color: string; status: "connected" | "not"; lastSent: string }[] = [
  { id: "whatsapp", title: "WhatsApp Blast", subtitle: "Broadcast & 1:1 messages", icon: MessageCircle, color: "#25D366", status: "not", lastSent: "Never" },
  { id: "meta",     title: "Facebook & Instagram", subtitle: "Feed posts & stories", icon: Share2, color: "#1877F2", status: "not", lastSent: "Never" },
  { id: "twitter",  title: "Twitter / X", subtitle: "Tweets & threads", icon: Twitter, color: "#1DA1F2", status: "not", lastSent: "Never" },
  { id: "email",    title: "Email Blast", subtitle: "Powered by Resend", icon: Mail, color: "#8B6914", status: "connected", lastSent: "2 days ago" },
];

const ACTIVITY = [
  { time: "May 5, 14:35", platform: "whatsapp", type: "Blast", content: "New feature launch! Decision Simulator is live…", recipients: "247 users", status: "sent" },
  { time: "May 5, 12:20", platform: "meta",     type: "Post",  content: "Customer success story: How TechCorp saved ₹4.2L…", recipients: "—", status: "sent" },
  { time: "May 4, 18:45", platform: "email",    type: "Blast", content: "Your trial is ending in 3 days — don't lose access", recipients: "89 users", status: "sent" },
  { time: "May 4, 09:15", platform: "twitter",  type: "Tweet", content: "Weekly tip: Optimize your cash conversion cycle…", recipients: "—", status: "sent" },
  { time: "May 3, 11:00", platform: "whatsapp", type: "Blast", content: "Reminder: GST returns due in 5 days", recipients: "412 users", status: "sent" },
  { time: "May 2, 16:22", platform: "email",    type: "Draft", content: "Monthly newsletter — May edition", recipients: "All users", status: "draft" },
];

const SCHEDULED = [
  { platform: "whatsapp", content: "New feature launch announcement", when: "Today, 6:00 PM" },
  { platform: "meta",     content: "Customer success story carousel post", when: "Tomorrow, 10:00 AM" },
  { platform: "twitter",  content: "Weekly tip #42 — receivables hygiene", when: "May 8, 9:00 AM" },
];

const PLATFORM_META: Record<string, { label: string; color: string; bg: string }> = {
  whatsapp: { label: "WhatsApp", color: "#0E7C3A", bg: "rgba(37,211,102,0.15)" },
  meta:     { label: "Meta",     color: "#0F4FB0", bg: "rgba(24,119,242,0.15)" },
  twitter:  { label: "Twitter",  color: "#0F6AB4", bg: "rgba(29,161,242,0.15)" },
  email:    { label: "Email",    color: "#8B6914", bg: "rgba(139,105,20,0.15)" },
};

export default function AdminCommunicationsPage() {
  const [openModal, setOpenModal] = useState<Platform | null>(null);

  return (
    <div>
      <PageHeader
        title="Communications Hub"
        subtitle="Send messages and manage social media from one place"
      />

      {/* Channels */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {CHANNELS.map((c) => {
          const Icon = c.icon;
          return (
            <Card key={c.id}>
              <div className="flex items-start justify-between mb-4">
                <span className="grid place-items-center rounded-2xl"
                  style={{ width: 56, height: 56, background: `${c.color}15` }}>
                  <Icon size={28} color={c.color} />
                </span>
                <span style={{
                  fontFamily: "DM Sans, sans-serif", fontSize: 11, fontWeight: 600,
                  padding: "4px 10px", borderRadius: 999,
                  background: c.status === "connected" ? "rgba(16,185,129,0.12)" : "rgba(196,30,30,0.1)",
                  color: c.status === "connected" ? "#0F7B4F" : "#C41E1E",
                }}>
                  {c.status === "connected" ? "✓ Connected" : "⚠ Not Connected"}
                </span>
              </div>
              <h3 style={{ fontFamily: "Raleway, sans-serif", fontWeight: 700, fontSize: 17, color: "hsl(var(--fyn-ink))" }}>
                {c.title}
              </h3>
              <p className="mt-1" style={{ fontFamily: "Roboto, sans-serif", fontSize: 13, color: "hsl(var(--fyn-ink) / 0.6)" }}>
                {c.subtitle}
              </p>
              <div className="mt-3 flex items-center gap-1.5" style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12, color: "hsl(var(--fyn-ink) / 0.5)" }}>
                <Clock size={12} /> Last sent: {c.lastSent}
              </div>
              <button
                onClick={() => setOpenModal(c.id)}
                className="w-full mt-4 py-2.5 rounded-xl text-white"
                style={{
                  background: "linear-gradient(135deg, #C41E1E 0%, #8B6914 100%)",
                  fontFamily: "Raleway, sans-serif", fontWeight: 600, fontSize: 14,
                }}
              >
                {c.id === "whatsapp" || c.id === "email" ? "Send Message" : c.id === "twitter" ? "Tweet" : "Create Post"}
              </button>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity */}
      <Card className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 style={{ fontFamily: "Oswald, sans-serif", fontWeight: 600, fontSize: 22, color: "hsl(var(--fyn-ink))" }}>
            Recent Activity
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full" style={{ fontFamily: "Roboto, sans-serif", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(26,16,8,0.08)" }}>
                {["Time", "Platform", "Type", "Content", "Recipients", "Status", ""].map((h) => (
                  <th key={h} className="text-left py-2.5 px-2"
                    style={{ fontFamily: "Raleway, sans-serif", fontWeight: 600, fontSize: 12, color: "hsl(var(--fyn-ink) / 0.6)", textTransform: "uppercase", letterSpacing: 0.5 }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ACTIVITY.map((row, i) => {
                const meta = PLATFORM_META[row.platform];
                return (
                  <tr key={i} style={{ borderBottom: "1px solid rgba(26,16,8,0.05)" }}>
                    <td className="py-3 px-2 whitespace-nowrap" style={{ color: "hsl(var(--fyn-ink) / 0.7)" }}>{row.time}</td>
                    <td className="py-3 px-2">
                      <span style={{
                        padding: "3px 9px", borderRadius: 6, fontWeight: 600, fontSize: 11,
                        background: meta.bg, color: meta.color,
                      }}>{meta.label}</span>
                    </td>
                    <td className="py-3 px-2" style={{ color: "hsl(var(--fyn-ink))" }}>{row.type}</td>
                    <td className="py-3 px-2 max-w-md truncate" style={{ color: "hsl(var(--fyn-ink) / 0.8)" }}>{row.content}</td>
                    <td className="py-3 px-2 whitespace-nowrap" style={{ color: "hsl(var(--fyn-ink) / 0.7)" }}>{row.recipients}</td>
                    <td className="py-3 px-2">
                      <StatusBadge status={row.status} />
                    </td>
                    <td className="py-3 px-2">
                      <button className="p-1.5 rounded-lg hover:bg-[hsl(var(--fyn-ink)/0.06)]" aria-label="View">
                        <Eye size={15} color="hsl(var(--fyn-ink) / 0.6)" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Scheduled */}
      <Card>
        <h2 className="mb-4" style={{ fontFamily: "Oswald, sans-serif", fontWeight: 600, fontSize: 22, color: "hsl(var(--fyn-ink))" }}>
          Scheduled Posts <span style={{ color: "hsl(var(--fyn-ink) / 0.5)", fontSize: 14, fontWeight: 400 }}>(Next 7 days)</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {SCHEDULED.map((s, i) => {
            const meta = PLATFORM_META[s.platform];
            return (
              <div key={i} className="rounded-xl p-4" style={{ background: "rgba(244,237,218,0.5)", border: "1px solid rgba(139,105,20,0.15)" }}>
                <div className="flex items-center justify-between mb-2">
                  <span style={{
                    padding: "3px 9px", borderRadius: 6, fontWeight: 600, fontSize: 11,
                    background: meta.bg, color: meta.color,
                  }}>{meta.label}</span>
                  <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12, color: "hsl(var(--fyn-ink) / 0.6)" }}>{s.when}</span>
                </div>
                <p className="mt-1" style={{ fontFamily: "Roboto, sans-serif", fontSize: 13, color: "hsl(var(--fyn-ink))" }}>
                  {s.content}
                </p>
                <div className="mt-3 flex gap-2">
                  <button onClick={() => toast.info("Edit scheduled post coming in Part 4")} className="text-xs px-3 py-1.5 rounded-lg" style={{ border: "1px solid rgba(26,16,8,0.15)", fontFamily: "Raleway, sans-serif", fontWeight: 500, color: "hsl(var(--fyn-ink))" }}>Edit</button>
                  <button onClick={() => toast.info("Cancel scheduled post coming in Part 4")} className="text-xs px-3 py-1.5 rounded-lg" style={{ border: "1px solid rgba(196,30,30,0.3)", fontFamily: "Raleway, sans-serif", fontWeight: 500, color: "#C41E1E" }}>Cancel</button>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {openModal && <ComposeModal platform={openModal} onClose={() => setOpenModal(null)} />}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    sent:      { bg: "rgba(16,185,129,0.12)", color: "#0F7B4F" },
    scheduled: { bg: "rgba(24,119,242,0.12)", color: "#0F4FB0" },
    failed:    { bg: "rgba(196,30,30,0.12)",  color: "#C41E1E" },
    draft:     { bg: "rgba(26,16,8,0.08)",    color: "hsl(var(--fyn-ink) / 0.7)" },
  };
  const m = map[status] ?? map.draft;
  return (
    <span style={{
      padding: "3px 9px", borderRadius: 6, fontFamily: "DM Sans, sans-serif", fontWeight: 600, fontSize: 11,
      background: m.bg, color: m.color, textTransform: "capitalize",
    }}>{status}</span>
  );
}

function ComposeModal({ platform, onClose }: { platform: Platform; onClose: () => void }) {
  const [content, setContent] = useState("");
  const [audience, setAudience] = useState("all_users");
  const [subject, setSubject] = useState("");
  const max = platform === "twitter" ? 280 : 1000;

  const send = async () => {
    if (!content.trim() && platform !== "email") { toast.error("Message is empty"); return; }
    if (platform === "email" && !subject.trim()) { toast.error("Subject is required"); return; }
    await logAdminAction({
      action: `${platform}_blast_sent`,
      target_type: "communications",
      details: { platform, audience, length: content.length, subject: platform === "email" ? subject : undefined },
    });
    toast.success(`${PLATFORM_META[platform].label} message queued`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(26,16,8,0.5)", backdropFilter: "blur(4px)" }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-2xl rounded-2xl overflow-hidden"
        style={{ background: "#FFFFFF", boxShadow: "0 24px 64px rgba(0,0,0,0.3)", maxHeight: "90vh", overflowY: "auto" }}>
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid rgba(26,16,8,0.08)" }}>
          <h2 style={{ fontFamily: "Oswald, sans-serif", fontWeight: 700, fontSize: 22, color: "hsl(var(--fyn-ink))" }}>
            New {PLATFORM_META[platform].label} {platform === "twitter" ? "Tweet" : platform === "email" ? "Blast" : "Message"}
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-[hsl(var(--fyn-ink)/0.05)]"><X size={18} /></button>
        </div>

        <div className="p-6 space-y-4">
          {(platform === "whatsapp" || platform === "email") && (
            <Field label="Audience">
              <select value={audience} onChange={(e) => setAudience(e.target.value)} className="w-full rounded-lg px-3 py-2.5"
                style={{ border: "1px solid rgba(26,16,8,0.15)", fontFamily: "Roboto, sans-serif", fontSize: 14 }}>
                <option value="all_users">All users</option>
                <option value="pro_users">Pro users</option>
                <option value="trial_users">Trial users (ending soon)</option>
                <option value="churned_users">Churned users</option>
              </select>
            </Field>
          )}
          {platform === "email" && (
            <Field label="Subject">
              <input value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full rounded-lg px-3 py-2.5"
                placeholder="Your trial is ending in 3 days"
                style={{ border: "1px solid rgba(26,16,8,0.15)", fontFamily: "Roboto, sans-serif", fontSize: 14 }} />
            </Field>
          )}

          <Field label={platform === "email" ? "Body" : "Message"}>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value.slice(0, max))}
              rows={platform === "twitter" ? 4 : 8}
              placeholder={
                platform === "whatsapp" ? "Type your WhatsApp message…"
                  : platform === "twitter" ? "What's happening?"
                  : platform === "meta" ? "What's on your mind?"
                  : "Write your email body…"
              }
              className="w-full rounded-lg px-3 py-2.5 resize-y"
              style={{ border: "1px solid rgba(26,16,8,0.15)", fontFamily: "Roboto, sans-serif", fontSize: 14, lineHeight: 1.5 }}
            />
            <div className="mt-1 text-right" style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11, color: content.length > max * 0.9 ? "#C41E1E" : "hsl(var(--fyn-ink) / 0.5)" }}>
              {content.length} / {max}
            </div>
          </Field>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4" style={{ borderTop: "1px solid rgba(26,16,8,0.08)", background: "rgba(244,237,218,0.4)" }}>
          <button onClick={onClose} className="px-4 py-2 rounded-lg"
            style={{ border: "1px solid rgba(26,16,8,0.15)", fontFamily: "Raleway, sans-serif", fontWeight: 600, fontSize: 14, color: "hsl(var(--fyn-ink))" }}>
            Cancel
          </button>
          <button onClick={send} className="flex items-center gap-2 px-5 py-2 rounded-lg text-white"
            style={{ background: "linear-gradient(135deg, #C41E1E 0%, #8B6914 100%)", fontFamily: "Raleway, sans-serif", fontWeight: 600, fontSize: 14 }}>
            <Send size={14} /> Send Now
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block mb-1.5" style={{ fontFamily: "Raleway, sans-serif", fontWeight: 600, fontSize: 13, color: "hsl(var(--fyn-ink))" }}>{label}</span>
      {children}
    </label>
  );
}
