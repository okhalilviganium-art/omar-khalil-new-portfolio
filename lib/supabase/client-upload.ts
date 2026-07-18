import { createClient } from "@/lib/supabase/client";

export interface ClientUploadResult {
  url: string;
  path: string;
  mediaId: string;
}

function buildUploadPath(folder: string, filename: string): string {
  const safe = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  return `${folder}/${Date.now()}_${safe}`;
}

export async function clientUploadFile(
  file: File,
  folder: string
): Promise<ClientUploadResult> {
  const supabase = createClient();
  const path = buildUploadPath(folder, file.name);

  const { error: uploadError } = await supabase.storage
    .from("media")
    .upload(path, file, { contentType: file.type, upsert: true });
  if (uploadError) throw uploadError;

  const { data: urlData } = supabase.storage.from("media").getPublicUrl(path);
  const url = urlData.publicUrl;

  const { registerMediaRow } = await import("@/lib/actions/media");
  const result = await registerMediaRow({
    path,
    url,
    filename: file.name,
    mimeType: file.type || "application/octet-stream",
    size: file.size,
    folder,
  });

  return { url, path, mediaId: result.success ? result.mediaId : "" };
}
