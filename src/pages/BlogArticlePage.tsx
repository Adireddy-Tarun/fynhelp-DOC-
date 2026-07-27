import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { ArrowLeft, Clock, Eye } from "lucide-react";

const INK = "#1A1008";
const RED = "#C41E1E";
const BEIGE = "#F4EDDA";
const GOLD = "#8B6914";

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  author_name: string;
  author_role: string;
  tags: string[];
  views: number;
  reading_time_minutes: number;
  published_at: string;
}

export default function BlogArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("blog_posts")
        .select("id, slug, title, excerpt, content, category, author_name, author_role, tags, views, reading_time_minutes, published_at")
        .eq("slug", slug)
        .eq("status", "published")
        .maybeSingle();

      if (error || !data) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setPost(data as BlogPost);
      setLoading(false);
      await supabase.rpc("increment_blog_views" as any, { p_slug: slug });
    })();
  }, [slug]);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });

  if (loading) {
    return (
      <Layout>
        <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", background: BEIGE }}>
          <div style={{ fontFamily: "Inter, sans-serif", fontSize: 14, color: "rgba(26,16,8,0.5)" }}>Loading article…</div>
        </div>
      </Layout>
    );
  }

  if (notFound || !post) {
    return (
      <Layout>
        <div style={{ minHeight: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: BEIGE, gap: 16 }}>
          <h1 style={{ fontFamily: "Georgia, serif", fontSize: 28, color: INK, margin: 0 }}>Article not found</h1>
          <Link to="/resources?tab=blog" style={{ fontFamily: "Inter, sans-serif", fontSize: 14, color: RED, textDecoration: "none" }}>Back to blog</Link>
        </div>
      </Layout>
    );
  }

  const paragraphs = post.content.split("\n\n").filter(Boolean);

  return (
    <Layout>
      <div style={{ background: BEIGE, minHeight: "100vh" }}>
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "40px 24px 80px" }}>
          <Link to="/resources?tab=blog" style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: "Inter, sans-serif", fontSize: 13, color: "rgba(26,16,8,0.55)", textDecoration: "none", marginBottom: 32 }}>
            <ArrowLeft size={15} /> Back to blog
          </Link>

          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
            <span style={{ fontFamily: "Inter, sans-serif", fontSize: 12, fontWeight: 600, color: RED, background: "rgba(196,30,30,0.08)", padding: "4px 12px", borderRadius: 99, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              {post.category}
            </span>
            {post.tags.map(t => (
              <span key={t} style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 11, color: GOLD, background: "rgba(139,105,20,0.1)", padding: "3px 8px", borderRadius: 6 }}>{t}</span>
            ))}
          </div>

          <h1 style={{ fontFamily: "Georgia, serif", fontWeight: 700, fontSize: 34, color: INK, lineHeight: 1.2, margin: "0 0 20px 0" }}>{post.title}</h1>

          <p style={{ fontFamily: "Georgia, serif", fontSize: 18, color: "rgba(26,16,8,0.75)", lineHeight: 1.6, margin: "0 0 28px 0", fontStyle: "italic" }}>{post.excerpt}</p>

          <div style={{ display: "flex", alignItems: "center", gap: 20, padding: "16px 0", borderTop: "1px solid rgba(26,16,8,0.08)", borderBottom: "1px solid rgba(26,16,8,0.08)", marginBottom: 40, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: RED, color: "white", fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {post.author_name.charAt(0)}
              </div>
              <div>
                <div style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: 13.5, color: INK }}>{post.author_name}</div>
                <div style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: "rgba(26,16,8,0.5)" }}>{post.author_role}</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 16, marginLeft: "auto", flexWrap: "wrap" }}>
              <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 12, color: "rgba(26,16,8,0.5)", display: "flex", alignItems: "center", gap: 5 }}><Clock size={13} /> {post.reading_time_minutes} min read</span>
              <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 12, color: "rgba(26,16,8,0.5)", display: "flex", alignItems: "center", gap: 5 }}><Eye size={13} /> {post.views.toLocaleString("en-IN")} views</span>
              <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 12, color: "rgba(26,16,8,0.5)" }}>{formatDate(post.published_at)}</span>
            </div>
          </div>

          <div>
            {paragraphs.map((para, i) => {
              const isHeading = para.length < 80 && !para.includes(".") && i > 0;
              if (isHeading) {
                return (
                  <h2 key={i} style={{ fontFamily: "Georgia, serif", fontWeight: 700, fontSize: 22, color: INK, lineHeight: 1.3, margin: "36px 0 16px 0" }}>{para}</h2>
                );
              }
              return (
                <p key={i} style={{ fontFamily: "Georgia, serif", fontSize: 17, color: "rgba(26,16,8,0.85)", lineHeight: 1.75, margin: "0 0 24px 0" }}>{para}</p>
              );
            })}
          </div>

          <div style={{ background: "white", border: "1px solid rgba(26,16,8,0.08)", borderRadius: 12, padding: 24, marginTop: 48, textAlign: "center" }}>
            <div style={{ fontFamily: "Georgia, serif", fontWeight: 600, fontSize: 18, color: INK, marginBottom: 8 }}>Want financial intelligence like this, built into your dashboard?</div>
            <p style={{ fontFamily: "Inter, sans-serif", fontSize: 14, color: "rgba(26,16,8,0.65)", marginBottom: 20 }}>FYNHelp gives Indian SMEs real-time AI CFO access. Free for 30 days for the first 100 founders.</p>
            <Link to="/waitlist" style={{ display: "inline-block", padding: "11px 28px", background: RED, color: "white", fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: 14, borderRadius: 8, textDecoration: "none" }}>Join the waitlist</Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
