/**
 * Blog posts are often pasted in from an SEO writing template that carries
 * production scaffolding into the body: an "SEO Information" field table, a
 * duplicated "Blog Title" block, a table of contents, internal-linking notes
 * and fact-check notes. None of that belongs on the public article.
 *
 * These helpers strip that scaffolding at render time (and are also used for
 * the one-off content cleanup), working on raw HTML strings so they are safe
 * during SSR.
 */

const HEADING_RE = /<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/gi;

/** Sections removed entirely (heading + everything until the next heading). */
const DROP_SECTIONS = [
  "seo information",
  "blog title",
  "table of contents",
  "internal linking suggestions",
  "internal links",
  "fact check notes",
  "fact-check notes",
  "meta information",
  "keyword research",
];

/** Sections whose heading is dropped but whose body is kept. */
const UNWRAP_SECTIONS = ["featured snippet answer", "introduction", "intro"];

const stripTags = (html: string) =>
  html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();

/** "12. Why Cash Flow Matters" -> "Why Cash Flow Matters" */
const stripNumberPrefix = (text: string) => text.replace(/^\s*\d+[.)]\s+/, "");

const normalise = (text: string) => stripNumberPrefix(stripTags(text)).toLowerCase().replace(/[:.]+$/, "").trim();

export function cleanArticleHtml(html: string): string {
  if (!html) return "";

  const headings: { start: number; end: number; level: number; inner: string }[] = [];
  let match: RegExpExecArray | null;
  HEADING_RE.lastIndex = 0;
  while ((match = HEADING_RE.exec(html)) !== null) {
    headings.push({
      start: match.index,
      end: match.index + match[0].length,
      level: Number(match[1]),
      inner: match[2],
    });
  }

  if (headings.length === 0) return html;

  let out = html.slice(0, headings[0].start);

  headings.forEach((h, i) => {
    const bodyEnd = i + 1 < headings.length ? headings[i + 1].start : html.length;
    const body = html.slice(h.end, bodyEnd);
    const title = normalise(h.inner);

    if (DROP_SECTIONS.some((s) => title === s || title.startsWith(`${s} `))) return;

    if (UNWRAP_SECTIONS.includes(title)) {
      out += body;
      return;
    }

    const cleanTitle = h.inner.replace(/^(\s*(?:<(?:strong|b|em|span)[^>]*>\s*)*)\s*\d+[.)]\s+/i, "$1");
    out += `<h${h.level}>${cleanTitle}</h${h.level}>${body}`;
  });

  return out
    .replace(/(?:\s*<p>(?:\s|&nbsp;|<br\s*\/?>)*<\/p>\s*)+(<hr\s*\/?>)/gi, "$1")
    .replace(/(<hr\s*\/?>)(?:\s*<p>(?:\s|&nbsp;|<br\s*\/?>)*<\/p>\s*)+/gi, "$1")
    .replace(/(?:<hr\s*\/?>\s*){2,}/gi, "<hr />")
    .replace(/^(?:\s*(?:<p>(?:\s|&nbsp;|<br\s*\/?>)*<\/p>|<hr\s*\/?>)\s*)+/i, "")
    .replace(/(?:\s*(?:<p>(?:\s|&nbsp;|<br\s*\/?>)*<\/p>|<hr\s*\/?>)\s*)+$/i, "")
    .trim();
}

/** First real sentence(s) of an article, for use when a post has no excerpt. */
export function articleExcerpt(html: string, maxLength = 200): string {
  const text = stripTags(cleanArticleHtml(html));
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).replace(/\s+\S*$/, "")}…`;
}
