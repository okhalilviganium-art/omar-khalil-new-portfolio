import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "./admin";
import { insertMediaFile } from "./media";

export interface UploadResult {
  path: string;
  url: string;
  mediaId: string;
}

function getPublicUrl(supabase: SupabaseClient, path: string): string {
  const { data } = supabase.storage.from("media").getPublicUrl(path);
  return data.publicUrl;
}

export async function uploadFile(
  file: File,
  path: string
): Promise<UploadResult> {
  const supabase = createAdminClient();
  const { error } = await supabase.storage
    .from("media")
    .upload(path, file, { contentType: file.type, upsert: true });
  if (error) throw error;

  const url = getPublicUrl(supabase, path);
  const filename = path.split("/").pop() || file.name;
  const folder = path.includes("/") ? path.split("/")[0] : "";

  const row = await insertMediaFile({
    filename,
    storage_path: path,
    public_url: url,
    mime_type: file.type || "application/octet-stream",
    size: file.size,
    folder,
  });

  return { path, url, mediaId: row?.id || "" };
}

export async function deleteFile(path: string): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase.storage.from("media").remove([path]);
  if (error) throw error;
}

export async function listFiles(
  folder?: string,
  limit = 100
): Promise<{ name: string; url: string; id: string; created_at: string }[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.storage
    .from("media")
    .list(folder || "", { limit, sortBy: { column: "created_at", order: "desc" } });
  if (error) throw error;
  return (data || []).map((f) => ({
    name: f.name,
    id: f.id || f.name,
    created_at: f.created_at || new Date().toISOString(),
    url: getPublicUrl(supabase, folder ? `${folder}/${f.name}` : f.name),
  }));
}

export interface StorageStats {
  fileCount: number;
  totalBytes: number;
}

export async function getStorageStats(): Promise<StorageStats> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.storage
    .from("media")
    .list("", { limit: 1000, sortBy: { column: "created_at", order: "desc" } });
  if (error) throw error;
  const files = data || [];
  const totalBytes = files.reduce((acc, f) => {
    const size = f.metadata?.size ?? 0;
    return acc + size;
  }, 0);
  return { fileCount: files.length, totalBytes };
}

export function buildUploadPath(
  folder: string,
  filename: string
): string {
  const safe = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  return `${folder}/${Date.now()}_${safe}`;
}
