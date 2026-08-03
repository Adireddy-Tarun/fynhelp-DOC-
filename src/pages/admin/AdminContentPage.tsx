import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Plus,
  Edit2,
  Trash2,
  X,
  ExternalLink,
  Archive,
  RotateCcw,
  Image as ImageIcon,
  Star,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card, PageHeader } from "./AdminDashboardPage";
import { BlogPost, BLOG_CATEGORIES } from "@/types/blog";

const INK = "#1A1008";
const RED = "#C41E1E";
const GOLD = "#8B6914";
const BEIGE = "#F4EDDA";
const BORDER = "rgba(26,16,8,0.12)";
const HEADING = "'Times New Roman', Times, serif";
const BODY = "Arial, Helvetica, sans-serif";

const PER_PAGE = 5;

type Tab = "blog" | "resources" | "glossary";
type BlogTab = "all" | "published" | "draft" | "scheduled" | "archived";

const RESOURCES: { id: string; title: string; type: string; category: string; date: string }[] = [];
const GLOSSARY: { id: string; term: string; definition: string; category: string; date: string }[] = [];

const TYPE_COLORS: Record<string, string> = { Video: "#9333EA", Template: "#3B82F6", Article: "#10B981" };

const SELECT_COLS =
  "id, slug, title, excerpt, category, tags, status, author_name, reading_time_minutes, cover_image_url, is_featured, published_at, archived_at, created_at, views";

const controlStyle: React.CSSProperties = {
  height: 32,
  border: `0.5px solid ${BORDER}`,
  borderRadius: 8,
  fontFamily: BODY,
  fontSize: 12,
  background: "#FFFFFF",
  color: INK,
  padding: "0 10px",
};

export default function AdminContentPage() {
  const [tab, setTab] = useState<Tab>("blog");
  const [editorOpen, setEditorOpen] = useState(false);

  return (
    <div>
      <PageHeader title="Content Management" subtitle="Manage blog, resources and glossary" />

      <div className="flex items-center gap-1 mb-5" style={{ borderBottom: `1px solid ${BORDER}` }}>
        {(["blog", "resources", "glossary"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="px-4 py-2.5 capitalize"
            style={{
              fontFamily: "Raleway, sans-serif",
              fontWeight: 600,
              fontSize: 14,
              color: tab === t ? INK : "rgba(26,16,8,0.5)",
              borderBottom: tab === t ? `3px solid ${GOLD}` : "3px solid transparent",
              marginBottom: -1,
            }}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="flex justify-end mb-4">
        {tab === "blog" ? (
          <Link
            to="/admin/blog/new"
            className="inline-flex items-center gap-2 px-3"
            style={{
              height: 32,
              background: RED,
              color: "#FFFFFF",
              borderRadius: 8,
              fontFamily: BODY,
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            <Plus size={14} /> New post
          </Link>
        ) : (
          <button
            onClick={() => setEditorOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-white"
            style={{
              background: "linear-gradient(135deg, #C41E1E 0%, #8B6914 100%)",
              fontFamily: "Raleway, sans-serif",
              fontWeight: 600,
              fontSize: 13,
            }}
          >
            <Plus size={14} /> {tab === "resources" ? "Add Resource" : "Add Term"}
          </button>
        )}
      </div>

      {tab === "blog" && <BlogSection />}

      {tab === "resources" && (
        <Card>
          <Table headers={["Title", "Type", "Category", "Last Updated", ""]}>
            {RESOURCES.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: 24, textAlign: "center", fontFamily: "Roboto, sans-serif", color: "rgba(26,16,8,0.5)" }}>
                  No resources yet.
                </td>
              </tr>
            )}
            {RESOURCES.map((r) => (
              <tr key={r.id} className="hover:bg-[hsl(var(--fyn-ink)/0.03)]" style={{ borderBottom: "1px solid rgba(26,16,8,0.05)" }}>
                <td className="py-3 px-2" style={{ color: INK, fontWeight: 500 }}>{r.title}</td>
                <td className="py-3 px-2">
                  <span style={{ padding: "3px 9px", borderRadius: 6, fontWeight: 600, fontSize: 11, background: `${TYPE_COLORS[r.type] ?? GOLD}20`, color: TYPE_COLORS[r.type] ?? GOLD }}>{r.type}</span>
                </td>
                <td className="py-3 px-2" style={{ color: "rgba(26,16,8,0.7)" }}>{r.category}</td>
                <td className="py-3 px-2 whitespace-nowrap" style={{ color: "rgba(26,16,8,0.6)" }}>{r.date}</td>
                <td className="py-3 px-2"><RowActionsStub /></td>
              </tr>
            ))}
          </Table>
        </Card>
      )}

      {tab === "glossary" && (
        <Card>
          <Table headers={["Term", "Definition", "Category", "Updated", ""]}>
            {GLOSSARY.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: 24, textAlign: "center", fontFamily: "Roboto, sans-serif", color: "rgba(26,16,8,0.5)" }}>
                  No glossary terms yet.
                </td>
              </tr>
            )}
            {GLOSSARY.map((g) => (
              <tr key={g.id} className="hover:bg-[hsl(var(--fyn-ink)/0.03)]" style={{ borderBottom: "1px solid rgba(26,16,8,0.05)" }}>
                <td className="py-3 px-2" style={{ color: INK, fontWeight: 600, fontFamily: "Oswald, sans-serif" }}>{g.term}</td>
                <td className="py-3 px-2" style={{ color: "rgba(26,16,8,0.8)" }}>{g.definition}</td>
                <td className="py-3 px-2" style={{ color: "rgba(26,16,8,0.7)" }}>{g.category}</td>
                <td className="py-3 px-2 whitespace-nowrap" style={{ color: "rgba(26,16,8,0.6)" }}>{g.date}</td>
                <td className="py-3 px-2"><RowActionsStub /></td>
              </tr>
            ))}
          </Table>
        </Card>
      )}

      {editorOpen && tab !== "blog" && <SimpleEditorStub tab={tab} onClose={() => setEditorOpen(false)} />}
    </div>
  );
}

/* ---------------------------------- Blog ---------------------------------- */

function BlogSection() {
  const nav = useNavigate();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [blogTab, setBlogTab] = useState<BlogTab>("all");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState<"date" | "title" | "views">("date");
  const [blogPage, setBlogPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await (supabase as never as typeof supabase)
      .from("blog_posts")
      .select(SELECT_COLS)
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    else setLastRefreshed(new Date());
    setPosts(((data ?? []) as unknown) as BlogPost[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel("blog_posts_realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "blog_posts" }, () => load())
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "blog_posts" }, () => load())
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "blog_posts" }, () => load())
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    setBlogPage(1);
  }, [blogTab, search, categoryFilter, sortOrder]);

  const counts = useMemo(() => {
    const active = posts.filter((p) => !p.archived_at);
    return {
      all: active.length,
      published: active.filter((p) => p.status === "published").length,
      draft: active.filter((p) => p.status === "draft").length,
      scheduled: active.filter((p) => p.status === "scheduled").length,
      archived: posts.filter((p) => p.archived_at).length,
    };
  }, [posts]);

  const analytics = useMemo(() => {
    const totalViews = posts.reduce((s, p) => s + (p.views ?? 0), 0);
    const published = posts.filter((p) => p.status === "published" && !p.archived_at).length;
    const topViews = posts.reduce((m, p) => Math.max(m, p.views ?? 0), 0);
    const avgRead = posts.length
      ? Math.round(posts.reduce((s, p) => s + (p.reading_time_minutes ?? 0), 0) / posts.length)
      : 0;
    return { totalViews, published, topViews, avgRead };
  }, [posts]);

  const filtered = useMemo(() => {
    let rows = blogTab === "archived" ? posts.filter((p) => p.archived_at) : posts.filter((p) => !p.archived_at);
    if (blogTab === "published" || blogTab === "draft" || blogTab === "scheduled") {
      rows = rows.filter((p) => p.status === blogTab);
    }
    const q = search.trim().toLowerCase();
    if (q) rows = rows.filter((p) => p.title?.toLowerCase().includes(q) || p.slug?.toLowerCase().includes(q));
    if (categoryFilter !== "all") rows = rows.filter((p) => p.category === categoryFilter);
    const sorted = [...rows];
    if (sortOrder === "title") sorted.sort((a, b) => (a.title ?? "").localeCompare(b.title ?? ""));
    else if (sortOrder === "views") sorted.sort((a, b) => (b.views ?? 0) - (a.views ?? 0));
    else sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return sorted;
  }, [posts, blogTab, search, categoryFilter, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const page = Math.min(blogPage, totalPages);
  const pageRows = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const update = async (ids: string[], patch: Record<string, unknown>, msg: string) => {
    const { error } = await (supabase as never as typeof supabase)
      .from("blog_posts")
      .update(patch as never)
      .in("id", ids);
    if (error) return toast.error(error.message);
    toast.success(msg);
    await load();
  };

  const runBulk = async (patch: Record<string, unknown>, msg: string) => {
    setBulkLoading(true);
    await update(selectedIds, patch, msg);
    setSelectedIds([]);
    setBulkLoading(false);
  };

  const toggle = (id: string) =>
    setSelectedIds((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const allOnPageSelected = pageRows.length > 0 && pageRows.every((p) => selectedIds.includes(p.id));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-end">
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: BODY, fontSize: 10, color: "#10B981", fontWeight: 700 }}>
          <span style={{ width: 7, height: 7, borderRadius: 999, background: "#10B981", animation: "fyn-blog-live-pulse 1.6s ease-out infinite" }} />
          Live
          <style>{`@keyframes fyn-blog-live-pulse { 0%{box-shadow:0 0 0 0 rgba(16,185,129,0.55)} 70%{box-shadow:0 0 0 6px rgba(16,185,129,0)} 100%{box-shadow:0 0 0 0 rgba(16,185,129,0)} }`}</style>
        </span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="Total views" value={analytics.totalViews.toLocaleString("en-IN")} />
        <Stat label="Published" value={String(analytics.published)} />
        <Stat label="Top post views" value={analytics.topViews.toLocaleString("en-IN")} />
        <Stat label="Avg read time" value={`${analytics.avgRead} min`} />
      </div>
      {lastRefreshed && (
        <div style={{ fontFamily: BODY, fontSize: 10, color: "rgba(26,16,8,0.45)", marginTop: -8 }}>
          Last updated: {lastRefreshed.toLocaleTimeString()}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search title or slug"
          style={{ ...controlStyle, width: 220 }}
        />
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} style={controlStyle}>
          <option value="all">All categories</option>
          {BLOG_CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value as "date" | "title" | "views")}
          style={controlStyle}
        >
          <option value="date">Date</option>
          <option value="title">Title</option>
          <option value="views">Views</option>
        </select>
        <Link
          to="/admin/blog/new"
          className="inline-flex items-center gap-2 px-3 ml-auto"
          style={{ height: 32, background: RED, color: "#FFFFFF", borderRadius: 8, fontFamily: BODY, fontSize: 12, fontWeight: 700 }}
        >
          <Plus size={14} /> New post
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        {([
          ["all", "All", counts.all],
          ["published", "Published", counts.published],
          ["draft", "Drafts", counts.draft],
          ["scheduled", "Scheduled", counts.scheduled],
          ["archived", "Archived", counts.archived],
        ] as [BlogTab, string, number][]).map(([key, label, count]) => {
          const active = blogTab === key;
          return (
            <button
              key={key}
              onClick={() => setBlogTab(key)}
              style={{
                padding: "6px 12px",
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 600,
                fontFamily: BODY,
                background: active ? INK : "#FFFFFF",
                color: active ? BEIGE : INK,
                border: active ? `0.5px solid ${INK}` : `0.5px solid ${BORDER}`,
              }}
            >
              {label} ({count})
            </button>
          );
        })}
      </div>

      {selectedIds.length > 0 && (
        <div
          className="flex flex-wrap items-center"
          style={{ background: BEIGE, border: `0.5px solid ${BORDER}`, borderRadius: 8, padding: "10px 14px", gap: 10 }}
        >
          <span style={{ fontFamily: BODY, fontSize: 12, color: INK, fontWeight: 700 }}>
            {selectedIds.length} selected
          </span>
          <BulkBtn disabled={bulkLoading} onClick={() => runBulk({ status: "published", published_at: new Date().toISOString(), archived_at: null }, "Published")}>
            Publish selected
          </BulkBtn>
          <BulkBtn disabled={bulkLoading} onClick={() => runBulk({ status: "draft", published_at: null }, "Unpublished")}>
            Unpublish selected
          </BulkBtn>
          <BulkBtn disabled={bulkLoading} onClick={() => runBulk({ archived_at: new Date().toISOString() }, "Archived")}>
            Archive selected
          </BulkBtn>
        </div>
      )}

      <div style={{ background: "#FFFFFF", border: `0.5px solid ${BORDER}`, borderRadius: 8, overflow: "hidden" }}>
        <table className="w-full" style={{ fontFamily: BODY, borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: BEIGE }}>
              <Th style={{ width: 34 }}>
                <input
                  type="checkbox"
                  checked={allOnPageSelected}
                  onChange={(e) =>
                    setSelectedIds((s) =>
                      e.target.checked
                        ? Array.from(new Set([...s, ...pageRows.map((p) => p.id)]))
                        : s.filter((id) => !pageRows.some((p) => p.id === id)),
                    )
                  }
                />
              </Th>
              <Th>Cover</Th>
              <Th>Title</Th>
              <Th>Category</Th>
              <Th>Status</Th>
              <Th>Author</Th>
              <Th>Featured</Th>
              <Th>Date</Th>
              <Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={9} style={{ padding: 24, textAlign: "center", fontSize: 12, color: "rgba(26,16,8,0.5)" }}>Loading…</td></tr>
            )}
            {!loading && pageRows.length === 0 && (
              <tr><td colSpan={9} style={{ padding: 24, textAlign: "center", fontSize: 12, color: "rgba(26,16,8,0.5)" }}>No posts found.</td></tr>
            )}
            {!loading && pageRows.map((p) => (
              <tr
                key={p.id}
                style={{ borderTop: `0.5px solid ${BORDER}` }}
                className="hover:bg-[rgba(26,16,8,0.03)]"
              >
                <Td><input type="checkbox" checked={selectedIds.includes(p.id)} onChange={() => toggle(p.id)} /></Td>
                <Td>
                  {p.cover_image_url ? (
                    <img src={p.cover_image_url} alt={p.title} style={{ width: 38, height: 28, objectFit: "cover", borderRadius: 3 }} />
                  ) : (
                    <div style={{ width: 38, height: 28, borderRadius: 3, background: "rgba(26,16,8,0.07)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <ImageIcon size={12} color="rgba(26,16,8,0.35)" />
                    </div>
                  )}
                </Td>
                <Td>
                  <div style={{ fontSize: 12, fontWeight: 700, color: INK }}>{p.title}</div>
                  <div style={{ fontFamily: "monospace", fontSize: 10, color: "rgba(26,16,8,0.45)" }}>/{p.slug}</div>
                </Td>
                <Td>
                  <span style={{ fontSize: 11, color: RED, background: "rgba(196,30,30,0.08)", padding: "2px 8px", borderRadius: 99 }}>
                    {p.category}
                  </span>
                </Td>
                <Td><StatusBadge post={p} /></Td>
                <Td><span style={{ fontSize: 11, color: "rgba(26,16,8,0.65)" }}>{p.author_name}</span></Td>
                <Td>
                  <Star size={14} color={p.is_featured ? GOLD : "rgba(26,16,8,0.2)"} fill={p.is_featured ? GOLD : "none"} />
                </Td>
                <Td>
                  <span style={{ fontFamily: "monospace", fontSize: 11, color: "rgba(26,16,8,0.5)" }}>
                    {new Date(p.published_at ?? p.created_at).toLocaleDateString("en-IN")}
                  </span>
                </Td>
                <Td>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <RowBtn onClick={() => nav(`/admin/blog/${p.id}/edit`)}>
                      <Edit2 size={12} /> Edit
                    </RowBtn>
                    <a
                      href={`/blog/${p.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      style={rowBtnStyle}
                      className="inline-flex items-center gap-1 px-2"
                    >
                      <ExternalLink size={12} /> View
                    </a>
                    {p.archived_at ? (
                      <RowBtn onClick={() => update([p.id], { archived_at: null, status: "draft" }, "Restored")}>
                        <RotateCcw size={12} /> Restore
                      </RowBtn>
                    ) : (
                      <RowBtn onClick={() => update([p.id], { archived_at: new Date().toISOString() }, "Archived")}>
                        <Archive size={12} /> Archive
                      </RowBtn>
                    )}
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between">
        <span style={{ fontSize: 12, color: "rgba(26,16,8,0.55)", fontFamily: BODY }}>
          Page {page} of {totalPages}, {filtered.length} posts
        </span>
        <div className="flex gap-2">
          <RowBtn disabled={page <= 1} onClick={() => setBlogPage(page - 1)}>Previous</RowBtn>
          <RowBtn disabled={page >= totalPages} onClick={() => setBlogPage(page + 1)}>Next</RowBtn>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ background: "#FFFFFF", border: `0.5px solid ${BORDER}`, borderRadius: 8, padding: "14px 16px" }}>
      <div style={{ fontFamily: "Raleway, sans-serif", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em", color: GOLD, fontWeight: 700 }}>
        {label}
      </div>
      <div style={{ fontFamily: HEADING, fontSize: 24, fontWeight: 700, color: INK, marginTop: 4 }}>{value}</div>
    </div>
  );
}

function StatusBadge({ post }: { post: BlogPost }) {
  const s: React.CSSProperties = { fontSize: 10, fontWeight: 700, textTransform: "uppercase", padding: "2px 8px", borderRadius: 99 };
  if (post.archived_at)
    return <span style={{ ...s, background: "rgba(26,16,8,0.06)", color: "rgba(26,16,8,0.45)" }}>Archived</span>;
  if (post.status === "published")
    return <span style={{ ...s, background: "rgba(16,185,129,0.12)", color: "#0B7A5A" }}>Published</span>;
  if (post.status === "scheduled")
    return <span style={{ ...s, background: "rgba(37,99,235,0.10)", color: "#1D4ED8" }}>Scheduled</span>;
  return <span style={{ ...s, border: `0.5px solid ${BORDER}`, color: "rgba(26,16,8,0.6)" }}>Draft</span>;
}

const rowBtnStyle: React.CSSProperties = {
  height: 26,
  border: `0.5px solid ${BORDER}`,
  borderRadius: 8,
  fontFamily: BODY,
  fontSize: 12,
  color: INK,
  background: "#FFFFFF",
  padding: "0 8px",
  display: "inline-flex",
  alignItems: "center",
  gap: 4,
};

function RowBtn({ children, onClick, disabled }: { children: React.ReactNode; onClick?: () => void; disabled?: boolean }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{ ...rowBtnStyle, opacity: disabled ? 0.4 : 1 }}>
      {children}
    </button>
  );
}

function BulkBtn({ children, onClick, disabled }: { children: React.ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{ ...rowBtnStyle, height: 28, opacity: disabled ? 0.5 : 1 }}
    >
      {children}
    </button>
  );
}

function Th({ children, style }: { children?: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <th
      className="text-left py-2 px-2"
      style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "rgba(26,16,8,0.5)", ...style }}
    >
      {children}
    </th>
  );
}

function Td({ children }: { children?: React.ReactNode }) {
  return <td className="py-2.5 px-2 align-middle">{children}</td>;
}

/* ------------------------- Resources / Glossary --------------------------- */

function Table({ headers, children }: { headers: string[]; children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full" style={{ fontFamily: "Roboto, sans-serif", fontSize: 13 }}>
        <thead>
          <tr style={{ borderBottom: "1px solid rgba(26,16,8,0.08)" }}>
            {headers.map((h) => (
              <th key={h} className="text-left py-2.5 px-2"
                style={{ fontFamily: "Raleway, sans-serif", fontWeight: 600, fontSize: 12, color: "rgba(26,16,8,0.6)", textTransform: "uppercase", letterSpacing: 0.5 }}>{h}</th>
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
      <button onClick={() => toast.info("Resource/glossary CRUD coming soon")} className="p-1.5 rounded-lg hover:bg-[rgba(26,16,8,0.06)]"><Edit2 size={14} color="rgba(26,16,8,0.6)" /></button>
      <button onClick={() => toast.info("Resource/glossary CRUD coming soon")} className="p-1.5 rounded-lg hover:bg-[rgba(196,30,30,0.08)]"><Trash2 size={14} color={RED} /></button>
    </div>
  );
}

function SimpleEditorStub({ tab, onClose }: { tab: Exclude<Tab, "blog">; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(26,16,8,0.5)", backdropFilter: "blur(4px)" }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-2xl p-6"
        style={{ background: "#FFFFFF", boxShadow: "0 24px 64px rgba(0,0,0,0.3)" }}>
        <div className="flex items-center justify-between mb-4">
          <h3 style={{ fontFamily: "Oswald, sans-serif", fontWeight: 700, fontSize: 20, color: INK }}>
            {tab === "resources" ? "Add Resource" : "Add Glossary Term"}
          </h3>
          <button onClick={onClose}><X size={18} /></button>
        </div>
        <p style={{ fontFamily: "Roboto, sans-serif", fontSize: 14, color: "rgba(26,16,8,0.65)" }}>
          {tab === "resources" ? "Resource" : "Glossary"} CRUD wiring is coming soon.
        </p>
        <div className="flex justify-end mt-4">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-white"
            style={{ background: "linear-gradient(135deg, #C41E1E 0%, #8B6914 100%)", fontFamily: "Raleway, sans-serif", fontWeight: 600, fontSize: 13 }}>Close</button>
        </div>
      </div>
    </div>
  );
}
