import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const TEMPLATE_STORAGE_BUCKET = "resources";

Deno.serve(async (req) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };

  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const url = new URL(req.url);
  const id = url.searchParams.get("id");

  if (!id) {
    return new Response(JSON.stringify({ error: "Resource ID required" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supa = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  const { data: resource, error } = await supa
    .from("resources")
    .select("id, title, format, file_path, file_url, is_published")
    .eq("id", id)
    .eq("is_published", true)
    .maybeSingle();

  if (error || !resource) {
    return new Response(JSON.stringify({ error: "Resource not found" }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (resource.file_path) {
    const { data: signed } = await supa.storage
      .from(TEMPLATE_STORAGE_BUCKET)
      .createSignedUrl(resource.file_path, 3600);
    if (signed?.signedUrl) return Response.redirect(signed.signedUrl, 302);
  }

  if (resource.file_url) return Response.redirect(resource.file_url, 302);

  const filename = resource.title.replace(/[^a-zA-Z0-9 ]/g, "").replace(/\s+/g, "_") + "." + String(resource.format ?? "xlsx").toLowerCase();
  return new Response(
    JSON.stringify({
      message: "Template file not yet uploaded to storage. Contact support@fynhelp.com to request this template.",
      title: resource.title,
      format: resource.format,
    }),
    {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    }
  );
});
