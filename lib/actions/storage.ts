"use server";

import { uploadFile as _upload, deleteFile as _delete, buildUploadPath } from "@/lib/supabase/storage";
import { logActivity } from "./activity";

export async function uploadFileAction(
  formData: FormData
): Promise<{ success: true; url: string; path: string; mediaId: string } | { success: false; error: string }> {
  const file = formData.get("file") as File | null;
  const folder = (formData.get("folder") as string) || "uploads";
  if (!file || file.size === 0) return { success: false, error: "No file provided" };
  try {
    const path = buildUploadPath(folder, file.name);
    const result = await _upload(file, path);
    logActivity("upload", "media", result.mediaId, file.name, { size: file.size, type: file.type });
    return { success: true, url: result.url, path: result.path, mediaId: result.mediaId };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

export async function deleteFileAction(
  path: string
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    await _delete(path);
    return { success: true };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}
