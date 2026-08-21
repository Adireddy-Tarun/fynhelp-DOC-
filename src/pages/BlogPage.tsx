import { useEffect, useState } from "react";
import { Link } from "@/lib/router-compat";
import { Helmet } from "react-helmet-async";
import Layout from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";

interface ListPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  category: string | null;
  author_name: string | null;
  reading_time_minutes: number | null;
  published_at: string | null;
  cover_image_url: string | null;
}

const formatDate = (d: string | null) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "";

const BlogPage = () => {
  const [posts, setPosts] = useState<ListPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("blog_posts")
      .select("id, slug, title, excerpt, category, author_name, reading_time_minutes, published_at, cover_image_url")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .then(({ data }) => {
        setPosts((data ?? []) as ListPost[]);
        setLoading(false);
      });
  }, []);

  const [featured, ...rest] = posts;

  return (
    <Layout>
      <Helmet>
        <title>FynHelp Blog — Financial Intelligence for Indian SMEs</title>
        <meta name="description" content="Tips, guides, and insights on cash flow management, GST compliance, and financial intelligence for Indian startups and SMEs." />
        <link rel="canonical" href="https://fynhelp.com/blog" />
        <meta property="og:title" content="FynHelp Blog — Financial Intelligence for Indian SMEs" />
        <meta property="og:description" content="Insights on cash flow, GST compliance, and finance for Indian SMEs." />
        <meta property="og:url" content="https://fynhelp.com/blog" />
      </Helmet>

      <section className="bg-fyn-ink py-16">
        <div className="fyn-container text-center">
          <h1 className="text-3xl md:text-[48px] leading-tight text-white mb-4">The FynHelp Journal</h1>
          <p className="text-white/60 text-lg">Insights, guides, and analysis for the Indian SME owner who wants to master their numbers.</p>
        </div>
      </section>

      <section className="bg-fyn-beige fyn-section">
        <div className="fyn-container">
          {loading ? (
            <p className="text-fyn-ink/50 text-sm">Loading articles…</p>
          ) : posts.length === 0 ? (
            <p className="text-fyn-ink/50 text-sm">No articles published yet.</p>
          ) : (
            <>
              <Link to={`/blog/${featured.slug}`} className="block bg-fyn-beige-dark border border-fyn-ink-10 rounded-xl overflow-hidden mb-12 hover:shadow-md transition-shadow group">
                {featured.cover_image_url && (
                  <img src={featured.cover_image_url} alt={featured.title} loading="lazy" className="w-full aspect-[16/7] object-cover" />
                )}
                <div className="p-8">
                  <span className="fyn-label text-fyn-red text-[11px]">{featured.category}</span>
                  <span className="text-fyn-ink/40 text-sm ml-3">
                    {featured.reading_time_minutes ? `${featured.reading_time_minutes} min read · ` : ""}{formatDate(featured.published_at)}
                  </span>
                  <h2 className="text-fyn-ink font-serif text-3xl mt-3 mb-4 group-hover:text-fyn-red transition-colors">{featured.title}</h2>
                  {featured.excerpt && <p className="text-fyn-ink/60 text-base leading-relaxed mb-4">{featured.excerpt}</p>}
                  {featured.author_name && <p className="text-fyn-gold text-sm">By {featured.author_name}</p>}
                </div>
              </Link>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rest.map((b) => (
                  <Link key={b.id} to={`/blog/${b.slug}`} className="bg-fyn-beige-dark border border-fyn-ink-10 rounded-lg overflow-hidden hover:shadow-md transition-shadow group flex flex-col">
                    {b.cover_image_url && (
                      <img src={b.cover_image_url} alt={b.title} loading="lazy" className="w-full aspect-video object-cover" />
                    )}
                    <div className="p-6 flex flex-col flex-1">
                      <span className="fyn-label text-fyn-red text-[11px]">{b.category}</span>
                      {b.reading_time_minutes ? <span className="text-fyn-ink/40 text-sm ml-2">{b.reading_time_minutes} min read</span> : null}
                      <h3 className="text-fyn-ink font-serif text-lg mt-2 mb-3 group-hover:text-fyn-red transition-colors">{b.title}</h3>
                      {b.excerpt && <p className="text-fyn-ink/60 text-sm leading-relaxed mb-3">{b.excerpt}</p>}
                      <p className="text-fyn-gold text-xs mt-auto">{b.author_name ?? "FynHelp"} · {formatDate(b.published_at)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default BlogPage;
