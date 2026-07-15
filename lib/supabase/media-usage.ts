import { createAdminClient } from "./admin";
import type { DbSiteSetting, DbProject } from "@/types/supabase";

export interface MediaUsageRef {
  type: "hero" | "about" | "project" | "project_gallery" | "project_video";
  field: string;
  projectId?: string;
  projectTitle?: string;
}

export interface MediaUsage {
  mediaId: string;
  usedIn: MediaUsageRef[];
}

const MEDIA_ID_SETTINGS = [
  { key: "hero_image_media_id", type: "hero" as const, field: "hero_image" },
  { key: "hero_bg_media_id", type: "hero" as const, field: "hero_bg" },
  { key: "resume_url_media_id", type: "hero" as const, field: "resume_url" },
  { key: "about_image_media_id", type: "about" as const, field: "about_image" },
];

export async function getMediaUsage(mediaId: string): Promise<MediaUsage> {
  const s = createAdminClient();
  const usedIn: MediaUsageRef[] = [];

  // Scan site_settings for media_id references
  const mediaIdKeys = MEDIA_ID_SETTINGS.map((m) => m.key);
  const { data: settings } = await s
    .from("site_settings")
    .select("key, value")
    .in("key", mediaIdKeys);
  if (settings) {
    for (const row of settings as DbSiteSetting[]) {
      if (row.value === mediaId) {
        const match = MEDIA_ID_SETTINGS.find((m) => m.key === row.key);
        if (match) usedIn.push({ type: match.type, field: match.field });
      }
    }
  }

  // Scan projects for cover_media_id, video_media_id, gallery_media_ids
  const { data: projects } = await s
    .from("projects")
    .select("id, title, cover_media_id, video_media_id, gallery_media_ids");
  if (projects) {
    for (const row of projects as DbProject[]) {
      if (row.cover_media_id === mediaId) {
        usedIn.push({ type: "project", field: "cover_media_id", projectId: row.id, projectTitle: row.title });
      }
      if (row.video_media_id === mediaId) {
        usedIn.push({ type: "project_video", field: "video_media_id", projectId: row.id, projectTitle: row.title });
      }
      let galleryIds: string[] = [];
      try {
        if (Array.isArray(row.gallery_media_ids)) galleryIds = row.gallery_media_ids;
        else if (typeof row.gallery_media_ids === "string") galleryIds = JSON.parse(row.gallery_media_ids || "[]");
      } catch {}
      if (galleryIds.includes(mediaId)) {
        usedIn.push({ type: "project_gallery", field: "gallery_media_ids", projectId: row.id, projectTitle: row.title });
      }
    }
  }

  return { mediaId, usedIn };
}

export async function isMediaSafeToDelete(mediaId: string): Promise<boolean> {
  const usage = await getMediaUsage(mediaId);
  return usage.usedIn.length === 0;
}

export async function findUnusedMedia(): Promise<string[]> {
  const s = createAdminClient();
  const { data: allMedia } = await s
    .from("media_files")
    .select("id");
  if (!allMedia || allMedia.length === 0) return [];

  const allIds = (allMedia as { id: string }[]).map((m) => m.id);

  // Collect all referenced media IDs
  const referencedIds = new Set<string>();

  // site_settings
  const mediaIdKeys = MEDIA_ID_SETTINGS.map((m) => m.key);
  const { data: settings } = await s
    .from("site_settings")
    .select("key, value")
    .in("key", mediaIdKeys);
  if (settings) {
    for (const row of settings as DbSiteSetting[]) {
      if (row.value) referencedIds.add(row.value);
    }
  }

  // projects
  const { data: projects } = await s
    .from("projects")
    .select("cover_media_id, video_media_id, gallery_media_ids");
  if (projects) {
    for (const row of projects as DbProject[]) {
      if (row.cover_media_id) referencedIds.add(row.cover_media_id);
      if (row.video_media_id) referencedIds.add(row.video_media_id);
      let galleryIds: string[] = [];
      try {
        if (Array.isArray(row.gallery_media_ids)) galleryIds = row.gallery_media_ids;
        else if (typeof row.gallery_media_ids === "string") galleryIds = JSON.parse(row.gallery_media_ids || "[]");
      } catch {}
      for (const gid of galleryIds) {
        if (gid) referencedIds.add(gid);
      }
    }
  }

  return allIds.filter((id) => !referencedIds.has(id));
}

export async function findBrokenMediaReferences(): Promise<MediaUsageRef[]> {
  const s = createAdminClient();
  const broken: MediaUsageRef[] = [];

  // Collect all referenced media IDs with their locations
  const refs: { id: string; ref: MediaUsageRef }[] = [];

  // site_settings
  const mediaIdKeys = MEDIA_ID_SETTINGS.map((m) => m.key);
  const { data: settings } = await s
    .from("site_settings")
    .select("key, value")
    .in("key", mediaIdKeys);
  if (settings) {
    for (const row of settings as DbSiteSetting[]) {
      if (row.value) {
        const match = MEDIA_ID_SETTINGS.find((m) => m.key === row.key);
        if (match) refs.push({ id: row.value, ref: { type: match.type, field: match.field } });
      }
    }
  }

  // projects
  const { data: projects } = await s
    .from("projects")
    .select("id, title, cover_media_id, video_media_id, gallery_media_ids");
  if (projects) {
    for (const row of projects as DbProject[]) {
      if (row.cover_media_id) refs.push({ id: row.cover_media_id, ref: { type: "project", field: "cover_media_id", projectId: row.id, projectTitle: row.title } });
      if (row.video_media_id) refs.push({ id: row.video_media_id, ref: { type: "project_video", field: "video_media_id", projectId: row.id, projectTitle: row.title } });
      let galleryIds: string[] = [];
      try {
        if (Array.isArray(row.gallery_media_ids)) galleryIds = row.gallery_media_ids;
        else if (typeof row.gallery_media_ids === "string") galleryIds = JSON.parse(row.gallery_media_ids || "[]");
      } catch {}
      for (const gid of galleryIds) {
        if (gid) refs.push({ id: gid, ref: { type: "project_gallery", field: "gallery_media_ids", projectId: row.id, projectTitle: row.title } });
      }
    }
  }

  if (refs.length === 0) return [];

  const uniqueIds = [...new Set(refs.map((r) => r.id))];
  const { data: existing } = await s
    .from("media_files")
    .select("id")
    .in("id", uniqueIds);
  const existingIds = new Set((existing as { id: string }[] | null)?.map((m) => m.id) || []);

  for (const { id, ref } of refs) {
    if (!existingIds.has(id)) broken.push(ref);
  }

  return broken;
}
