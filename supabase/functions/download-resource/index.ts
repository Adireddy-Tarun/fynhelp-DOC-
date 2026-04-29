// Download proxy for resource files.
// Streams the requested file from Supabase Storage (or any allowlisted host)
// back to the browser with Content-Disposition: attachment so the download
// happens reliably regardless of cross-origin / mixed-content policies.
//
// Usage:
//   GET /functions/v1/download-resource?id=gst-reconciliation
//   GET /functions/v1/download-resource?url=<allowlisted-url>&filename=foo.xlsx

import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

type Resource = {
  url: string;
  filename: string;
  contentType: string;
};

// Curated registry. Keep IDs stable — the frontend uses them.
const RESOURCES: Record<string, Resource> = {
  "gst-reconciliation": {
    url: "https://wiknwxniwqvsxgyzqqxu.supabase.co/storage/v1/object/public/fynhelp-resources/1_GSTR2B_Reconciliation_Tracker.xlsx",
    filename: "GSTR2B_Reconciliation_Tracker.xlsx",
    contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  },
  "cash-flow": {
    url: "https://wiknwxniwqvsxgyzqqxu.supabase.co/storage/v1/object/public/fynhelp-resources/2_Cash_Flow_Projection_Workbook.xlsx",
    filename: "Cash_Flow_Projection_Workbook.xlsx",
    contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  },
  "receivables-aging": {
    url: "https://wiknwxniwqvsxgyzqqxu.supabase.co/storage/v1/object/public/fynhelp-resources/3_Receivables_Aging_Register.xlsx",
    filename: "Receivables_Aging_Register.xlsx",
    contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  },
  "vendor-gst": {
    url: "https://wiknwxniwqvsxgyzqqxu.supabase.co/storage/v1/object/public/fynhelp-resources/4_Vendor_GST_Compliance_Checklist.pdf",
    filename: "Vendor_GST_Compliance_Checklist.pdf",
    contentType: "application/pdf",
  },
  "msme-letter": {
    url: "https://wiknwxniwqvsxgyzqqxu.supabase.co/storage/v1/object/public/fynhelp-resources/5_MSME_Rights_Demand_Letter.docx",
    filename: "MSME_Rights_Demand_Letter.docx",
    contentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  },
  "advance-tax": {
    url: "https://wiknwxniwqvsxgyzqqxu.supabase.co/storage/v1/object/public/fynhelp-resources/6_Advance_Tax_Calculation_Workbook.xlsx",
    filename: "Advance_Tax_Calculation_Workbook.xlsx",
    contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  },
  "cfo-report": {
    url: "https://wiknwxniwqvsxgyzqqxu.supabase.co/storage/v1/object/public/fynhelp-resources/7_Monthly_CFO_Report_Template.docx",
    filename: "Monthly_CFO_Report_Template.docx",
    contentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  },
  "board-meeting": {
    url: "https://wiknwxniwqvsxgyzqqxu.supabase.co/storage/v1/object/public/fynhelp-resources/8_Board_Meeting_Financial_Update.pptx",
    filename: "Board_Meeting_Financial_Update.pptx",
    contentType: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  },
};

const ALLOWED_HOSTS = new Set<string>([
  "wiknwxniwqvsxgyzqqxu.supabase.co",
  "ukmtzflxtcoqnwujvrqh.supabase.co",
]);

function jsonError(status: number, message: string) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function sanitizeFilename(name: string): string {
  // Strip path separators and quotes; keep it simple & safe for headers.
  const cleaned = name.replace(/[\\\r\n\"\\\/]/g, "_").trim();
  return cleaned.length > 0 && cleaned.length <= 200 ? cleaned : "download";
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
      const found = RESOURCES[id];
      if (!found) return jsonError(404, "Unknown resource id");
      target = found;
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
        contentType: "application/octet-stream",
      };
    } else {
      return jsonError(400, "Missing id or url");
    }

    const upstream = await fetch(target.url, {
      headers: { Accept: "*/*" },
    });

    if (!upstream.ok || !upstream.body) {
      const text = await upstream.text().catch(() => "");
      console.error("upstream fetch failed", upstream.status, text.slice(0, 200));
      return jsonError(502, `Upstream fetch failed (${upstream.status})`);
    }

    const filename = sanitizeFilename(filenameOverride ?? target.filename);
    const contentType =
      upstream.headers.get("content-type") ?? target.contentType;
    const contentLength = upstream.headers.get("content-length");

    const headers: Record<string, string> = {
      ...corsHeaders,
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(filename)}`,
      "Cache-Control": "public, max-age=300",
      "X-Content-Type-Options": "nosniff",
    };
    if (contentLength) headers["Content-Length"] = contentLength;

    return new Response(upstream.body, { status: 200, headers });
  } catch (err) {
    console.error("download-resource error", err);
    return jsonError(500, "Internal error");
  }
});
