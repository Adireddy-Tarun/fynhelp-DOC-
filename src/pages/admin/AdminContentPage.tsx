import { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, X, Send } from "lucide-react";
import { Card, PageHeader } from "./AdminDashboardPage";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { logAdminAction } from "@/lib/adminAudit";

type Tab = "blog" | "resources" | "glossary";
type BlogPost = {
  id: string;
  title: string;
  slug: string;
  content: string | null;
  category: string | null;
  status: string;
  author_id: string | null;
  published_at: string | null;
  views: number;
  created_at: string;
};

const RESOURCES: { id: string; title: string; type: string; category: string; date: string }[] = [];

const GLOSSARY: { id: string; term: string; definition: string; category: string; date: string }[] = [];

const STATUS_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  published: { bg: "rgba(16,185,129,0.12)", color: "#0F7B4F", label: "Published" },
  draft:     { bg: "rgba(26,16,8,0.08)",    color: "hsl(var(--fyn-ink) / 0.7)", label: "Draft" },
  scheduled: { bg: "rgba(24,119,242,0.12)", color: "#0F4FB0", label: "Scheduled" },
  archived:  { bg: "rgba(196,30,30,0.1)",   color: "#C41E1E", label: "Archived" },
};
const TYPE_COLORS: Record<string, string> = { Video: "#9333EA", Template: "#3B82F6", Article: "#10B981" };

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);

export default function AdminContentPage() {
  const [tab, setTab] = useState<Tab>("blog");
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(false);

  const loadPosts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("blog_posts")
      .select("id,title,slug,content,category,status,author_id,published_at,views,created_at")
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setPosts((data as BlogPost[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { loadPosts(); }, []);

  const publishPost = async (postId: string) => {
    const { error } = await supabase
      .from("blog_posts")
      .update({ status: "published", published_at: new Date().toISOString() })
      .eq("id", postId);
    if (error) { toast.error(error.message); return; }
    await logAdminAction({ action: "blog_post_published", target_type: "blog_post", target_id: postId });
    toast.success("Post published");
    loadPosts();
  };

  const deletePost = async (postId: string) => {
    if (!confirm("Delete this post? This cannot be undone.")) return;
    const { error } = await supabase.from("blog_posts").delete().eq("id", postId);
    if (error) { toast.error(error.message); return; }
    await logAdminAction({ action: "blog_post_deleted", target_type: "blog_post", target_id: postId });
    toast.success("Post deleted");
    loadPosts();
  };

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
        <button onClick={() => { setEditing(null); setEditorOpen(true); }} className="flex items-center gap-2 px-4 py-2 rounded-lg text-white"
          style={{ background: "linear-gradient(135deg, #C41E1E 0%, #8B6914 100%)", fontFamily: "Raleway, sans-serif", fontWeight: 600, fontSize: 13 }}>
          <Plus size={14} /> {tab === "blog" ? "New Blog Post" : tab === "resources" ? "Add Resource" : "Add Term"}
        </button>
      </div>

      {tab === "blog" && (
        <Card>
          {loading && <div style={{ padding: 12, fontFamily: "Roboto, sans-serif", color: "hsl(var(--fyn-ink) / 0.55)" }}>Loading…</div>}
          <Table headers={["Title", "Category", "Status", "Published", "Views", ""]}>
            {!loading && posts.length === 0 && (
              <tr><td colSpan={6} style={{ padding: 24, textAlign: "center", fontFamily: "Roboto, sans-serif", color: "hsl(var(--fyn-ink) / 0.5)" }}>No posts yet. Click "New Blog Post" to create one.</td></tr>
            )}
            {posts.map((p) => {
              const s = STATUS_STYLE[p.status] ?? STATUS_STYLE.draft;
              return (
                <tr key={p.id} className="hover:bg-[hsl(var(--fyn-ink)/0.03)]" style={{ borderBottom: "1px solid rgba(26,16,8,0.05)" }}>
                  <td className="py-3 px-2" style={{ color: "hsl(var(--fyn-ink))", fontWeight: 500 }}>{p.title}</td>
                  <td className="py-3 px-2" style={{ color: "hsl(var(--fyn-ink) / 0.7)" }}>{p.category ?? "—"}</td>
                  <td className="py-3 px-2"><span style={{ padding: "3px 9px", borderRadius: 6, fontWeight: 600, fontSize: 11, background: s.bg, color: s.color }}>{s.label}</span></td>
                  <td className="py-3 px-2 whitespace-nowrap" style={{ color: "hsl(var(--fyn-ink) / 0.6)" }}>
                    {p.published_at ? new Date(p.published_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }) : "—"}
                  </td>
                  <td className="py-3 px-2" style={{ fontFamily: "JetBrains Mono, monospace", color: "hsl(var(--fyn-ink))" }}>{(p.views ?? 0).toLocaleString("en-IN")}</td>
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-1">
                      {p.status !== "published" && (
                        <button onClick={() => publishPost(p.id)} className="p-1.5 rounded-lg hover:bg-[rgba(16,185,129,0.08)]" title="Publish">
                          <Send size={14} color="#0F7B4F" />
                        </button>
                      )}
                      <button onClick={() => { setEditing(p); setEditorOpen(true); }} className="p-1.5 rounded-lg hover:bg-[hsl(var(--fyn-ink)/0.06)]" title="Edit">
                        <Edit2 size={14} color="hsl(var(--fyn-ink) / 0.6)" />
                      </button>
                      <button onClick={() => deletePost(p.id)} className="p-1.5 rounded-lg hover:bg-[rgba(196,30,30,0.08)]" title="Delete">
                        <Trash2 size={14} color="#C41E1E" />
                      </button>
                    </div>
                  </td>
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
                <td className="py-3 px-2"><RowActionsStub /></td>
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
                <td className="py-3 px-2"><RowActionsStub /></td>
              </tr>
            ))}
          </Table>
        </Card>
      )}

      {editorOpen && tab === "blog" && (
        <BlogEditor
          post={editing}
          onClose={() => { setEditorOpen(false); setEditing(null); }}
          onSaved={() => { setEditorOpen(false); setEditing(null); loadPosts(); }}
        />
      )}
      {editorOpen && tab !== "blog" && (
        <SimpleEditorStub tab={tab} onClose={() => setEditorOpen(false)} />
      )}
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

function RowActionsStub() {
  return (
    <div className="flex items-center gap-1">
      <button onClick={() => toast.info("Resource/glossary CRUD coming soon")} className="p-1.5 rounded-lg hover:bg-[hsl(var(--fyn-ink)/0.06)]"><Edit2 size={14} color="hsl(var(--fyn-ink) / 0.6)" /></button>
      <button onClick={() => toast.info("Resource/glossary CRUD coming soon")} className="p-1.5 rounded-lg hover:bg-[rgba(196,30,30,0.08)]"><Trash2 size={14} color="#C41E1E" /></button>
    </div>
  );
}

function BlogEditor({ post, onClose, onSaved }: { post: BlogPost | null; onClose: () => void; onSaved: () => void }) {
  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [category, setCategory] = useState(post?.category ?? "");
  const [content, setContent] = useState(post?.content ?? "");
  const [status, setStatus] = useState(post?.status ?? "draft");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!title.trim()) { toast.error("Title is required"); return; }
    setSaving(true);
    const finalSlug = (slug.trim() || slugify(title));
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { toast.error("Not signed in"); setSaving(false); return; }

    if (post?.id) {
      const { error } = await supabase
        .from("blog_posts")
        .update({
          title: title.trim(),
          slug: finalSlug,
          content,
          category: category || null,
          status,
          published_at: status === "published" && !post.published_at ? new Date().toISOString() : post.published_at,
        })
        .eq("id", post.id);
      if (error) { toast.error(error.message); setSaving(false); return; }
      await logAdminAction({ action: "blog_post_updated", target_type: "blog_post", target_id: post.id, details: { status } });
    } else {
      const { data, error } = await supabase
        .from("blog_posts")
        .insert({
          title: title.trim(),
          slug: finalSlug,
          content,
          category: category || null,
          status,
          author_id: user.id,
          published_at: status === "published" ? new Date().toISOString() : null,
        })
        .select("id").maybeSingle();
      if (error) { toast.error(error.message); setSaving(false); return; }
      await logAdminAction({ action: "blog_post_created", target_type: "blog_post", target_id: data?.id ?? null, details: { status } });
    }
    toast.success("Post saved");
    setSaving(false);
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(26,16,8,0.5)", backdropFilter: "blur(4px)" }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-3xl rounded-2xl overflow-hidden"
        style={{ background: "#FFFFFF", boxShadow: "0 24px 64px rgba(0,0,0,0.3)", maxHeight: "90vh", overflowY: "auto" }}>
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid rgba(26,16,8,0.08)" }}>
          <h2 style={{ fontFamily: "Oswald, sans-serif", fontWeight: 700, fontSize: 22, color: "hsl(var(--fyn-ink))" }}>
            {post ? "Edit Blog Post" : "New Blog Post"}
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-[hsl(var(--fyn-ink)/0.05)]"><X size={18} /></button>
        </div>
        <div className="p-6 space-y-4">
          <input value={title} onChange={(e) => { setTitle(e.target.value); if (!post && !slug) setSlug(slugify(e.target.value)); }}
            placeholder="Title…"
            className="w-full rounded-lg px-3 py-3"
            style={{ border: "1px solid rgba(26,16,8,0.15)", fontFamily: "Oswald, sans-serif", fontWeight: 600, fontSize: 20 }} />
          <div className="grid grid-cols-2 gap-3">
            <input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="slug-url"
              className="rounded-lg px-3 py-2.5"
              style={{ border: "1px solid rgba(26,16,8,0.15)", fontFamily: "JetBrains Mono, monospace", fontSize: 13 }} />
            <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Category (Finance, Guides…)"
              className="rounded-lg px-3 py-2.5"
              style={{ border: "1px solid rgba(26,16,8,0.15)", fontFamily: "Roboto, sans-serif", fontSize: 13 }} />
          </div>
          <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={14}
            placeholder="Write your content (markdown supported)…"
            className="w-full rounded-lg px-3 py-2.5"
            style={{ border: "1px solid rgba(26,16,8,0.15)", fontFamily: "Roboto, sans-serif", fontSize: 14, lineHeight: 1.6 }} />
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
        </div>
        <div className="flex items-center justify-end gap-3 px-6 py-4" style={{ borderTop: "1px solid rgba(26,16,8,0.08)", background: "rgba(244,237,218,0.4)" }}>
          <button onClick={onClose} className="px-4 py-2 rounded-lg"
            style={{ border: "1px solid rgba(26,16,8,0.15)", fontFamily: "Raleway, sans-serif", fontWeight: 600, fontSize: 13, color: "hsl(var(--fyn-ink))" }}>Cancel</button>
          <button onClick={save} disabled={saving} className="px-5 py-2 rounded-lg text-white"
            style={{ background: "linear-gradient(135deg, #C41E1E 0%, #8B6914 100%)", fontFamily: "Raleway, sans-serif", fontWeight: 600, fontSize: 13, opacity: saving ? 0.6 : 1 }}>
            {saving ? "Saving…" : (status === "published" ? "Publish" : "Save")}
          </button>
        </div>
      </div>
    </div>
  );
}

function SimpleEditorStub({ tab, onClose }: { tab: Tab; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(26,16,8,0.5)", backdropFilter: "blur(4px)" }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-2xl p-6"
        style={{ background: "#FFFFFF", boxShadow: "0 24px 64px rgba(0,0,0,0.3)" }}>
        <div className="flex items-center justify-between mb-4">
          <h3 style={{ fontFamily: "Oswald, sans-serif", fontWeight: 700, fontSize: 20, color: "hsl(var(--fyn-ink))" }}>
            {tab === "resources" ? "Add Resource" : "Add Glossary Term"}
          </h3>
          <button onClick={onClose}><X size={18} /></button>
        </div>
        <p style={{ fontFamily: "Roboto, sans-serif", fontSize: 14, color: "hsl(var(--fyn-ink) / 0.65)" }}>
          {tab === "resources" ? "Resource" : "Glossary"} CRUD wiring is coming soon. Blog posts are fully wired today.
        </p>
        <div className="flex justify-end mt-4">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-white"
            style={{ background: "linear-gradient(135deg, #C41E1E 0%, #8B6914 100%)", fontFamily: "Raleway, sans-serif", fontWeight: 600, fontSize: 13 }}>Close</button>
        </div>
      </div>
    </div>
  );
}
