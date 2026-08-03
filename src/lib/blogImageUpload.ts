import { supabase } from "@/integrations/supabase/client";

const YEAR_SECONDS = 60 * 60 * 24 * 365;

export async function uploadBlogImage(
  file: File,
  folder: "cover" | "content",
): Promise<string | null> {
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabase.storage
    .from("blog-images")
    .upload(path, file, { upsert: false });
  if (error) return null;

  const { data: signed } = await supabase.storage
    .from("blog-images")
    .createSignedUrl(path, YEAR_SECONDS);
  if (signed?.signedUrl) return signed.signedUrl;

  const { data } = supabase.storage.from("blog-images").getPublicUrl(path);
  return data.publicUrl;
}
