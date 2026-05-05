import { useState } from "react";
import { Plus, Edit2, Trash2, X } from "lucide-react";
import { Card, PageHeader } from "./AdminDashboardPage";
import { toast } from "sonner";
import { logAdminAction } from "@/lib/adminAudit";

type Tab = "blog" | "resources" | "glossary";

const BLOG = [
  { id: "1", title: "5 Signs You Need an AI CFO",                  category: "Finance",         status: "published", author: "Nidhi", date: "May 1, 2026", views: 1247 },
  { id: "2", title: "Product Update: Decision Simulator Launch",   category: "Product Updates", status: "published", author: "Tarun", date: "Apr 28",      views: 892 },
  { id: "3", title: "How to Reduce Burn Rate in 30 Days",          category: "Guides",          status: "draft",     author: "Nidhi", date: "—",            views: 0 },
  { id: "4", title: "Case Study: TechCorp saves ₹4.2L on GST",    category: "Case Studies",    status: "scheduled", author: "Tarun", date: "May 10",      views: 0 },
];

const RESOURCES = [
  { id: "r1", title: "Cash Flow Template (Excel)",  type: "Template", category: "Finance", date: "May 2"  },
  { id: "r2", title: "GST Filing Checklist",         type: "Article",  category: "Tax",     date: "Apr 30" },
  { id: "r3", title: "Runway Calculation Tutorial",  type: "Video",    category: "Finance", date: "Apr 25" },
];

const GLOSSARY = [
  { id: "g1", term: "ARR",        definition: "Annual Recurring Revenue — predictable revenue normalized to a 12-month period.", category: "Metrics", date: "May 1"  },
  { id: "g2", term: "Burn Rate",  definition: "The rate at which a company spends its cash reserves.",                          category: "Finance", date: "Apr 28" },
  { id: "g3", term: "Churn",      definition: "The percentage of customers who cancel their subscription in a period.",          category: "Metrics", date: "Apr 20" },
];

const STATUS_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  published: { bg: "rgba(16,185,129,0.12)", color: "#0F7B4F", label: "Published" },
  draft:     { bg: "rgba(26,16,8,0.08)",    color: "hsl(var(--fyn-ink) / 0.7)", label: "Draft" },
  scheduled: { bg: "rgba(24,119,242,0.12)", color: "#0F4FB0", label: "Scheduled" },
  archived:  { bg: "rgba(196,30,30,0.1)",   color: "#C41E1E", label: "Archived" },
};

const TYPE_COLORS: Record<string, string> = {
  Video: "#9333EA",
  Template: "#3B82F6",
  Article: "#10B981",
};

export default function AdminContentPage() {
  const [tab, setTab] = useState<Tab>("blog");
  const [editorOpen, setEditorOpen] = useState(false);

  return (
    <div>
      <PageHeader title="Content Management" subtitle="Manage blog posts, resources, and glossary" />

      <div className="flex items-center gap-1 mb-5" style={{ borderBottom: "1px solid rgba(26,16,8,0.1)" }}>
        {(["blog", "resources", "glossary"] as Tab[]).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className="px-4 py-2.5 capitalize"
            style={{
              fontFamily: "Raleway, sans-serif", fontWeight: 600, fontSize: 14,
              color: tab === t ? "hsl(var(--fyn-ink))" : "hsl(var(--fyn-ink) / 0.5)",
              borderBottom: tab === t ? "3px solid #8B6914" : "3px solid transparent",
              marginBottom: -1,
            }}>
            {t === "blog" ? "Blog Posts" : t === "resources" ? "Resources" : "Glossary"}
          </button>
        ))}
      </div>

      <div className="flex justify-end mb-4">
        <button onClick={() => setEditorOpen(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg text-white"
          style={{ background: "linear-gradient(135deg, #C41E1E 0%, #8B6914 100%)", fontFamily: "Raleway, sans-serif", fontWeight: 600, fontSize: 13 }}>
          <Plus size={14} /> {tab === "blog" ? "New Blog Post" : tab === "resources" ? "Add Resource" : "Add Term"}
        </button>
      </div>

      {tab === "blog" && (
        <Card>
          <Table headers={["Title", "Category", "Status", "Author", "Published", "Views", ""]}>
            {BLOG.map((p) => {
              const s = STATUS_STYLE[p.status];
              return (
                <tr key={p.id} className="hover:bg-[hsl(var(--fyn-ink)/0.03)]" style={{ borderBottom: "1px solid rgba(26,16,8,0.05)" }}>
                  <td className="py-3 px-2" style={{ color: "hsl(var(--fyn-ink))", fontWeight: 500 }}>{p.title}</td>
                  <td className="py-3 px-2" style={{ color: "hsl(var(--fyn-ink) / 0.7)" }}>{p.category}</td>
                  <td className="py-3 px-2"><span style={{ padding: "3px 9px", borderRadius: 6, fontWeight: 600, fontSize: 11, background: s.bg, color: s.color }}>{s.label}</span></td>
                  <td className="py-3 px-2" style={{ color: "hsl(var(--fyn-ink) / 0.7)" }}>{p.author}</td>
                  <td className="py-3 px-2 whitespace-nowrap" style={{ color: "hsl(var(--fyn-ink) / 0.6)" }}>{p.date}</td>
                  <td className="py-3 px-2" style={{ fontFamily: "DM Sans, sans-serif", color: "hsl(var(--fyn-ink))" }}>{p.views.toLocaleString("en-IN")}</td>
                  <td className="py-3 px-2"><RowActions onEdit={() => setEditorOpen(true)} /></td>
                </tr>
              );
            })}
          </Table>
        </Card>
      )}

      {tab === "resources" && (
        <Card>
          <Table headers={["Title", "Type", "Category", "Last Updated", ""]}>
            {RESOURCES.map((r) => (
              <tr key={r.id} className="hover:bg-[hsl(var(--fyn-ink)/0.03)]" style={{ borderBottom: "1px solid rgba(26,16,8,0.05)" }}>
                <td className="py-3 px-2" style={{ color: "hsl(var(--fyn-ink))", fontWeight: 500 }}>{r.title}</td>
                <td className="py-3 px-2"><span style={{ padding: "3px 9px", borderRadius: 6, fontWeight: 600, fontSize: 11, background: `${TYPE_COLORS[r.type] ?? "#8B6914"}20`, color: TYPE_COLORS[r.type] ?? "#8B6914" }}>{r.type}</span></td>
                <td className="py-3 px-2" style={{ color: "hsl(var(--fyn-ink) / 0.7)" }}>{r.category}</td>
                <td className="py-3 px-2 whitespace-nowrap" style={{ color: "hsl(var(--fyn-ink) / 0.6)" }}>{r.date}</td>
                <td className="py-3 px-2"><RowActions onEdit={() => setEditorOpen(true)} /></td>
              </tr>
            ))}
          </Table>
        </Card>
      )}

      {tab === "glossary" && (
        <Card>
          <Table headers={["Term", "Definition", "Category", "Updated", ""]}>
            {GLOSSARY.map((g) => (
              <tr key={g.id} className="hover:bg-[hsl(var(--fyn-ink)/0.03)]" style={{ borderBottom: "1px solid rgba(26,16,8,0.05)" }}>
                <td className="py-3 px-2" style={{ color: "hsl(var(--fyn-ink))", fontWeight: 600, fontFamily: "Oswald, sans-serif" }}>{g.term}</td>
                <td className="py-3 px-2" style={{ color: "hsl(var(--fyn-ink) / 0.8)" }}>{g.definition}</td>
                <td className="py-3 px-2" style={{ color: "hsl(var(--fyn-ink) / 0.7)" }}>{g.category}</td>
                <td className="py-3 px-2 whitespace-nowrap" style={{ color: "hsl(var(--fyn-ink) / 0.6)" }}>{g.date}</td>
                <td className="py-3 px-2"><RowActions onEdit={() => setEditorOpen(true)} /></td>
              </tr>
            ))}
          </Table>
        </Card>
      )}

      {editorOpen && <SimpleEditor tab={tab} onClose={() => setEditorOpen(false)} />}
    </div>
  );
}

function Table({ headers, children }: { headers: string[]; children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full" style={{ fontFamily: "Roboto, sans-serif", fontSize: 13 }}>
        <thead>
          <tr style={{ borderBottom: "1px solid rgba(26,16,8,0.08)" }}>
            {headers.map((h) => (
              <th key={h} className="text-left py-2.5 px-2"
                style={{ fontFamily: "Raleway, sans-serif", fontWeight: 600, fontSize: 12, color: "hsl(var(--fyn-ink) / 0.6)", textTransform: "uppercase", letterSpacing: 0.5 }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

function RowActions({ onEdit }: { onEdit: () => void }) {
  return (
    <div className="flex items-center gap-1">
      <button onClick={onEdit} className="p-1.5 rounded-lg hover:bg-[hsl(var(--fyn-ink)/0.06)]" aria-label="Edit"><Edit2 size={14} color="hsl(var(--fyn-ink) / 0.6)" /></button>
      <button onClick={() => toast.info("Delete coming in Part 4")} className="p-1.5 rounded-lg hover:bg-[rgba(196,30,30,0.08)]" aria-label="Delete"><Trash2 size={14} color="#C41E1E" /></button>
    </div>
  );
}

function SimpleEditor({ tab, onClose }: { tab: Tab; onClose: () => void }) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [status, setStatus] = useState("draft");

  const save = async () => {
    if (!title.trim()) { toast.error("Title is required"); return; }
    await logAdminAction({
      action: tab === "blog" ? "blog_post_saved" : tab === "resources" ? "resource_saved" : "glossary_term_saved",
      target_type: tab,
      details: { title, status, length: body.length },
    });
    toast.success(`${tab === "blog" ? "Post" : tab === "resources" ? "Resource" : "Term"} saved`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(26,16,8,0.5)", backdropFilter: "blur(4px)" }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-3xl rounded-2xl overflow-hidden"
        style={{ background: "#FFFFFF", boxShadow: "0 24px 64px rgba(0,0,0,0.3)", maxHeight: "90vh", overflowY: "auto" }}>
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid rgba(26,16,8,0.08)" }}>
          <h2 style={{ fontFamily: "Oswald, sans-serif", fontWeight: 700, fontSize: 22, color: "hsl(var(--fyn-ink))" }}>
            {tab === "blog" ? "New Blog Post" : tab === "resources" ? "New Resource" : "New Glossary Term"}
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-[hsl(var(--fyn-ink)/0.05)]"><X size={18} /></button>
        </div>
        <div className="p-6 space-y-4">
          <input value={title} onChange={(e) => setTitle(e.target.value)}
            placeholder={tab === "glossary" ? "Term…" : "Title…"}
            className="w-full rounded-lg px-3 py-3"
            style={{ border: "1px solid rgba(26,16,8,0.15)", fontFamily: "Oswald, sans-serif", fontWeight: 600, fontSize: 20 }} />
          <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={tab === "glossary" ? 4 : 12}
            placeholder={tab === "glossary" ? "Definition (markdown supported)…" : "Write your content…"}
            className="w-full rounded-lg px-3 py-2.5"
            style={{ border: "1px solid rgba(26,16,8,0.15)", fontFamily: "Roboto, sans-serif", fontSize: 14, lineHeight: 1.6 }} />
          {tab === "blog" && (
            <div className="flex items-center gap-3">
              <span style={{ fontFamily: "Raleway, sans-serif", fontWeight: 600, fontSize: 12, color: "hsl(var(--fyn-ink) / 0.7)" }}>Status:</span>
              {["draft", "scheduled", "published"].map((s) => (
                <button key={s} onClick={() => setStatus(s)}
                  className="px-3 py-1.5 rounded-lg capitalize"
                  style={{
                    border: "1px solid rgba(26,16,8,0.15)",
                    background: status === s ? "rgba(139,105,20,0.15)" : "transparent",
                    color: status === s ? "#8B6914" : "hsl(var(--fyn-ink) / 0.7)",
                    fontFamily: "Raleway, sans-serif", fontWeight: 600, fontSize: 12,
                  }}>{s}</button>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center justify-end gap-3 px-6 py-4" style={{ borderTop: "1px solid rgba(26,16,8,0.08)", background: "rgba(244,237,218,0.4)" }}>
          <button onClick={onClose} className="px-4 py-2 rounded-lg"
            style={{ border: "1px solid rgba(26,16,8,0.15)", fontFamily: "Raleway, sans-serif", fontWeight: 600, fontSize: 13, color: "hsl(var(--fyn-ink))" }}>Cancel</button>
          <button onClick={save} className="px-5 py-2 rounded-lg text-white"
            style={{ background: "linear-gradient(135deg, #C41E1E 0%, #8B6914 100%)", fontFamily: "Raleway, sans-serif", fontWeight: 600, fontSize: 13 }}>
            {status === "published" && tab === "blog" ? "Publish" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
