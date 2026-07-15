"use server";

import {
  deleteMediaFile as _deleteMedia,
  deleteMediaFiles as _deleteMediaBulk,
  listMediaFiles as _listMedia,
  listAllMediaFiles as _listAllMedia,
  getMediaByIds as _getMediaByIds,
  getMediaById as _getMediaById,
  getMediaStats as _stats,
  updateMediaFile as _updateMedia,
  moveMediaFiles as _moveMedia,
  getDistinctFolders as _getFolders,
  createMediaFolder as _createFolder,
  listMediaFolders as _listFolders,
  renameMediaFolder as _renameFolder,
  deleteMediaFolder as _deleteFolder,
} from "@/lib/supabase/media";
import {
  deleteFile as _deleteStorage,
  uploadFile as _upload,
  buildUploadPath,
} from "@/lib/supabase/storage";
import {
  getMediaUsage as _getUsage,
  findUnusedMedia as _findUnused,
  findBrokenMediaReferences as _findBroken,
  isMediaSafeToDelete as _isSafe,
} from "@/lib/supabase/media-usage";
import { createAdminClient } from "@/lib/supabase/admin";
import { logActivity } from "./activity";

export async function listMediaFilesAction(folder?: string, limit?: number) {
  return _listMedia(folder, limit);
}

export async function listAllMediaFilesAction() {
  return _listAllMedia();
}

export async function getDistinctFoldersAction() {
  return _getFolders();
}

export async function deleteMediaAction(
  id: string
): Promise<{ success: true } | { success: false; error: string; reason?: "used" }> {
  try {
    const usage = await _getUsage(id);
    if (usage.usedIn.length > 0) {
      const locations = usage.usedIn.map((u) => {
        if (u.projectTitle) return `${u.type} (${u.projectTitle})`;
        return u.type;
      }).join(", ");
      return { success: false, error: `Media is used in: ${locations}`, reason: "used" };
    }
    const s = createAdminClient();
    const { data: row } = await s.from("media_files").select("storage_path").eq("id", id).single();
    if (row?.storage_path) {
      try { await _deleteStorage(row.storage_path); } catch {}
    }
    await _deleteMedia(id);
    logActivity("delete", "media", id);
    return { success: true };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

export async function bulkDeleteMediaAction(
  ids: string[]
): Promise<{ success: true; deleted: number; skipped: number } | { success: false; error: string }> {
  try {
    const s = createAdminClient();
    const safeIds: string[] = [];
    const usedIds: string[] = [];
    for (const id of ids) {
      const usage = await _getUsage(id);
      if (usage.usedIn.length > 0) usedIds.push(id);
      else safeIds.push(id);
    }
    if (safeIds.length > 0) {
      const { data: rows } = await s.from("media_files").select("storage_path").in("id", safeIds);
      if (rows) {
        for (const r of rows as { storage_path: string }[]) {
          if (r.storage_path) {
            try { await _deleteStorage(r.storage_path); } catch {}
          }
        }
      }
      await _deleteMediaBulk(safeIds);
    }
    return { success: true, deleted: safeIds.length, skipped: usedIds.length };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

export async function replaceMediaAction(
  id: string,
  formData: FormData
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const file = formData.get("file") as File | null;
    if (!file || file.size === 0) return { success: false, error: "No file provided" };
    const s = createAdminClient();
    const { data: existing, error: fetchErr } = await s
      .from("media_files").select("storage_path, folder").eq("id", id).single();
    if (fetchErr || !existing) return { success: false, error: "Media record not found" };
    const folder = existing.folder || "uploads";
    const newPath = buildUploadPath(folder, file.name);
    const result = await _upload(file, newPath);
    const { error: updateErr } = await s
      .from("media_files")
      .update({ filename: file.name, storage_path: result.path, public_url: result.url, mime_type: file.type || "application/octet-stream", size: file.size })
      .eq("id", id);
    if (updateErr) return { success: false, error: updateErr.message };
    if (existing.storage_path && existing.storage_path !== result.path) {
      try { await _deleteStorage(existing.storage_path); } catch {}
    }
    return { success: true };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

export async function renameMediaAction(
  id: string, filename: string
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    await _updateMedia(id, { filename });
    return { success: true };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

export async function moveMediaAction(
  ids: string[], folder: string
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    await _moveMedia(ids, folder);
    return { success: true };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

export async function createFolderAction(
  name: string
): Promise<{ success: true; path: string } | { success: false; error: string }> {
  try {
    const path = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const existing = await _listFolders();
    if (existing.some((f) => f.path === path)) {
      return { success: false, error: "Folder already exists" };
    }
    await _createFolder(name, path);
    return { success: true, path };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

export async function renameFolderAction(
  oldPath: string, newName: string
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const newPath = newName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    await _renameFolder(oldPath, newName, newPath);
    return { success: true };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

export async function deleteFolderAction(
  path: string
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    await _deleteFolder(path);
    return { success: true };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

export async function listMediaFoldersAction() {
  return _listFolders();
}

export async function getMediaByIdsAction(ids: string[]): Promise<Record<string, string>> {
  if (ids.length === 0) return {};
  const map = await _getMediaByIds(ids);
  const result: Record<string, string> = {};
  for (const [id, file] of map) {
    result[id] = file.public_url;
  }
  return result;
}

export async function getMediaUsageAction(mediaId: string) {
  return _getUsage(mediaId);
}

export async function isMediaSafeToDeleteAction(mediaId: string): Promise<boolean> {
  return _isSafe(mediaId);
}

export async function findUnusedMediaAction() {
  return _findUnused();
}

export async function findBrokenMediaReferencesAction() {
  return _findBroken();
}

export async function getMediaStatsAction() {
  return _stats();
}
