// Download proxy for resource files.
// Streams the requested file from Supabase Storage (or any allowlisted host)
// back to the browser with Content-Disposition: attachment so the download
// happens reliably regardless of cross-origin / mixed-content policies.
//
// Usage:
//   GET /functions/v1/download-resource?id=gst-reconciliation
//   GET /functions/v1/download-resource?url=<allowlisted-url>&filename=foo.xlsx

import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.0";

type Resource = {
  url: string;
  filename: string;
  contentType: string;
};

const ALLOWED_HOSTS = new Set<string>([
  "wiknwxniwqvsxgyzqqxu.supabase.co",
  "ukmtzflxtcoqnwujvrqh.supabase.co",
]);

const EXT_TO_MIME: Record<string, string> = {
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  xls: "application/vnd.ms-excel",
  pdf: "application/pdf",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  doc: "application/msword",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ppt: "application/vnd.ms-powerpoint",
  csv: "text/csv",
  zip: "application/zip",
};

function jsonError(status: number, message: string) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function sanitizeFilename(name: string): string {
  const cleaned = name.replace(/[\\\r\n\"\/]/g, "_").trim();
  return cleaned.length > 0 && cleaned.length <= 200 ? cleaned : "download";
}

function inferContentType(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  return EXT_TO_MIME[ext] ?? "application/octet-stream";
}

async function lookupResourceById(id: string): Promise<Resource | null> {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
  const { data, error } = await supabase
    .from("resources")
    .select("file_url, title")
    .eq("id", id)
    .maybeSingle();
  if (error || !data?.file_url) return null;
  const filename = (data.file_url.split("/").pop() ?? "download").split("?")[0];
  return {
    url: data.file_url,
    filename,
    contentType: inferContentType(filename),
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "GET") {
    return jsonError(405, "Method not allowed");
  }

  try {
    const reqUrl = new URL(req.url);
    const id = reqUrl.searchParams.get("id");
    const rawUrl = reqUrl.searchParams.get("url");
    const filenameOverride = reqUrl.searchParams.get("filename");

    let target: Resource | null = null;

    if (id) {
      target = await lookupResourceById(id);
      if (!target) return jsonError(404, "Unknown resource id");
      // Verify host
      try {
        const parsed = new URL(target.url);
        if (parsed.protocol !== "https:" || !ALLOWED_HOSTS.has(parsed.hostname)) {
          return jsonError(400, "Host not allowed");
        }
      } catch {
        return jsonError(400, "Invalid stored url");
      }
    } else if (rawUrl) {
      let parsed: URL;
      try {
        parsed = new URL(rawUrl);
      } catch {
        return jsonError(400, "Invalid url");
      }
      if (parsed.protocol !== "https:" || !ALLOWED_HOSTS.has(parsed.hostname)) {
        return jsonError(400, "Host not allowed");
      }
      const inferredName =
        filenameOverride ?? parsed.pathname.split("/").pop() ?? "download";
      target = {
        url: parsed.toString(),
        filename: inferredName,
        contentType: inferContentType(inferredName),
      };
    } else {
      return jsonError(400, "Missing id or url");
    }

    const upstream = await fetch(target.url, { headers: { Accept: "*/*" } });

    if (!upstream.ok || !upstream.body) {
      const text = await upstream.text().catch(() => "");
      console.error("upstream fetch failed", upstream.status, text.slice(0, 200));
      return jsonError(502, `Upstream fetch failed (${upstream.status})`);
    }

    const filename = sanitizeFilename(filenameOverride ?? target.filename);
    const contentType = upstream.headers.get("content-type") ?? target.contentType;
    const contentLength = upstream.headers.get("content-length");

    const headers: Record<string, string> = {
      ...corsHeaders,
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(filename)}`,
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    };
    if (contentLength) headers["Content-Length"] = contentLength;

    return new Response(upstream.body, { status: 200, headers });
  } catch (err) {
    console.error("download-resource error", err);
    return jsonError(500, "Internal error");
  }
});
