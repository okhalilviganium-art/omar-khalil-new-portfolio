import { createAdminClient } from "./admin";
import type { DbMediaFile, DbMediaFolder } from "@/types/supabase";

export async function insertMediaFile(row: {
  filename: string;
  storage_path: string;
  public_url: string;
  mime_type: string;
  size: number;
  width?: number | null;
  height?: number | null;
  duration?: number | null;
  folder: string;
}): Promise<DbMediaFile | null> {
  const s = createAdminClient();
  const { data, error } = await s
    .from("media_files")
    .insert(row)
    .select()
    .single();
  if (error) return null;
  return data as DbMediaFile;
}

export async function getMediaById(id: string): Promise<DbMediaFile | null> {
  const s = createAdminClient();
  const { data, error } = await s
    .from("media_files")
    .select("*")
    .eq("id", id)
    .single();
  if (error || !data) return null;
  return data as DbMediaFile;
}

export async function getMediaByIds(ids: string[]): Promise<Map<string, DbMediaFile>> {
  if (ids.length === 0) return new Map();
  const s = createAdminClient();
  const { data, error } = await s
    .from("media_files")
    .select("*")
    .in("id", ids);
  if (error || !data) return new Map();
  const map = new Map<string, DbMediaFile>();
  for (const row of data as DbMediaFile[]) {
    map.set(row.id, row);
  }
  return map;
}

export async function getMediaByPath(storagePath: string): Promise<DbMediaFile | null> {
  const s = createAdminClient();
  const { data, error } = await s
    .from("media_files")
    .select("*")
    .eq("storage_path", storagePath)
    .single();
  if (error || !data) return null;
  return data as DbMediaFile;
}

export async function listMediaFiles(
  folder?: string,
  limit = 500
): Promise<DbMediaFile[]> {
  const s = createAdminClient();
  let query = s
    .from("media_files")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (folder) {
    query = query.eq("folder", folder);
  }
  const { data, error } = await query;
  if (error) throw error;
  return (data as DbMediaFile[]) || [];
}

export async function listAllMediaFiles(): Promise<DbMediaFile[]> {
  const s = createAdminClient();
  const { data, error } = await s
    .from("media_files")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as DbMediaFile[]) || [];
}

export async function deleteMediaFile(id: string): Promise<void> {
  const s = createAdminClient();
  const { error } = await s
    .from("media_files")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

export async function deleteMediaFiles(ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  const s = createAdminClient();
  const { error } = await s
    .from("media_files")
    .delete()
    .in("id", ids);
  if (error) throw error;
}

export async function deleteMediaFileByPath(storagePath: string): Promise<void> {
  const s = createAdminClient();
  const { error } = await s
    .from("media_files")
    .delete()
    .eq("storage_path", storagePath);
  if (error) throw error;
}

export async function updateMediaFile(id: string, updates: Partial<Pick<DbMediaFile, "filename" | "folder">>): Promise<void> {
  const s = createAdminClient();
  const { error } = await s
    .from("media_files")
    .update(updates)
    .eq("id", id);
  if (error) throw error;
}

export async function moveMediaFiles(ids: string[], folder: string): Promise<void> {
  if (ids.length === 0) return;
  const s = createAdminClient();
  const { error } = await s
    .from("media_files")
    .update({ folder })
    .in("id", ids);
  if (error) throw error;
}

export async function updateMediaFilePath(id: string, storagePath: string, publicUrl: string): Promise<void> {
  const s = createAdminClient();
  const { error } = await s
    .from("media_files")
    .update({ storage_path: storagePath, public_url: publicUrl })
    .eq("id", id);
  if (error) throw error;
}

export async function getMediaStats(): Promise<{ fileCount: number; totalBytes: number }> {
  const s = createAdminClient();
  const { data, error } = await s
    .from("media_files")
    .select("size");
  if (error) throw error;
  const rows = (data as { size: number }[]) || [];
  return {
    fileCount: rows.length,
    totalBytes: rows.reduce((acc, r) => acc + (r.size || 0), 0),
  };
}

export async function getDistinctFolders(): Promise<string[]> {
  const s = createAdminClient();
  const { data, error } = await s
    .from("media_files")
    .select("folder");
  if (error) throw error;
  const folders = new Set((data as { folder: string }[]).map((r) => r.folder).filter(Boolean));
  return Array.from(folders).sort();
}

export async function createMediaFolder(name: string, path: string): Promise<DbMediaFolder | null> {
  const s = createAdminClient();
  const { data, error } = await s
    .from("media_folders")
    .insert({ name, path })
    .select()
    .single();
  if (error) return null;
  return data as DbMediaFolder;
}

export async function listMediaFolders(): Promise<DbMediaFolder[]> {
  const s = createAdminClient();
  const { data, error } = await s
    .from("media_folders")
    .select("*")
    .order("name", { ascending: true });
  if (error) throw error;
  return (data as DbMediaFolder[]) || [];
}

export async function renameMediaFolder(path: string, newName: string, newPath: string): Promise<void> {
  const s = createAdminClient();
  const { error } = await s
    .from("media_folders")
    .update({ name: newName, path: newPath })
    .eq("path", path);
  if (error) throw error;
}

export async function deleteMediaFolder(path: string): Promise<void> {
  const s = createAdminClient();
  const { error } = await s
    .from("media_folders")
    .delete()
    .eq("path", path);
  if (error) throw error;
}
