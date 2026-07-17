import { createAdminClient } from "./admin";
import type { DbSiteSetting } from "@/types/supabase";

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

  // Scan projects for video_media_id, gallery_media_ids
  const { data: projects } = await s
    .from("projects")
    .select("id, title, video_media_id, gallery_media_ids, thumbnail_media_id, cover_image_media_id");
  if (projects) {
    for (const row of projects) {
      const r = row as Record<string, unknown>;
      if (r.video_media_id === mediaId) {
        usedIn.push({ type: "project_video", field: "video_media_id", projectId: r.id as string, projectTitle: r.title as string });
      }
      if (r.thumbnail_media_id === mediaId) {
        usedIn.push({ type: "project", field: "thumbnail_media_id", projectId: r.id as string, projectTitle: r.title as string });
      }
      if (r.cover_image_media_id === mediaId) {
        usedIn.push({ type: "project", field: "cover_image_media_id", projectId: r.id as string, projectTitle: r.title as string });
      }
      let galleryIds: string[] = [];
      try {
        if (Array.isArray(r.gallery_media_ids)) galleryIds = r.gallery_media_ids as string[];
        else if (typeof r.gallery_media_ids === "string") galleryIds = JSON.parse((r.gallery_media_ids as string) || "[]");
      } catch {}
      if (galleryIds.includes(mediaId)) {
        usedIn.push({ type: "project_gallery", field: "gallery_media_ids", projectId: r.id as string, projectTitle: r.title as string });
      }
    }
  }

  // Scan project_gallery table for media_id references
  const { data: galleryItems } = await s
    .from("project_gallery")
    .select("id, project_id, media_id");
  if (galleryItems) {
    for (const item of galleryItems as { id: string; project_id: string; media_id: string }[]) {
      if (item.media_id === mediaId) {
        usedIn.push({ type: "project_gallery", field: "project_gallery.media_id", projectId: item.project_id });
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
    .select("id, video_media_id, gallery_media_ids, thumbnail_media_id, cover_image_media_id");
  if (projects) {
    for (const row of projects) {
      const r = row as Record<string, unknown>;
      if (r.video_media_id) referencedIds.add(r.video_media_id as string);
      if (r.thumbnail_media_id) referencedIds.add(r.thumbnail_media_id as string);
      if (r.cover_image_media_id) referencedIds.add(r.cover_image_media_id as string);
      let galleryIds: string[] = [];
      try {
        if (Array.isArray(r.gallery_media_ids)) galleryIds = r.gallery_media_ids as string[];
        else if (typeof r.gallery_media_ids === "string") galleryIds = JSON.parse((r.gallery_media_ids as string) || "[]");
      } catch {}
      for (const gid of galleryIds) {
        if (gid) referencedIds.add(gid);
      }
    }
  }

  // project_gallery table
  const { data: galleryItems } = await s
    .from("project_gallery")
    .select("media_id");
  if (galleryItems) {
    for (const item of galleryItems as { media_id: string }[]) {
      if (item.media_id) referencedIds.add(item.media_id);
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
    .select("id, title, video_media_id, gallery_media_ids, thumbnail_media_id, cover_image_media_id");
  if (projects) {
    for (const row of projects) {
      const r = row as Record<string, unknown>;
      if (r.video_media_id) refs.push({ id: r.video_media_id as string, ref: { type: "project_video", field: "video_media_id", projectId: r.id as string, projectTitle: r.title as string } });
      if (r.thumbnail_media_id) refs.push({ id: r.thumbnail_media_id as string, ref: { type: "project", field: "thumbnail_media_id", projectId: r.id as string, projectTitle: r.title as string } });
      if (r.cover_image_media_id) refs.push({ id: r.cover_image_media_id as string, ref: { type: "project", field: "cover_image_media_id", projectId: r.id as string, projectTitle: r.title as string } });
      let galleryIds: string[] = [];
      try {
        if (Array.isArray(r.gallery_media_ids)) galleryIds = r.gallery_media_ids as string[];
        else if (typeof r.gallery_media_ids === "string") galleryIds = JSON.parse((r.gallery_media_ids as string) || "[]");
      } catch {}
      for (const gid of galleryIds) {
        if (gid) refs.push({ id: gid, ref: { type: "project_gallery", field: "gallery_media_ids", projectId: r.id as string, projectTitle: r.title as string } });
      }
    }
  }

  // project_gallery table
  const { data: galleryItems } = await s
    .from("project_gallery")
    .select("id, project_id, media_id");
  if (galleryItems) {
    for (const item of galleryItems as { id: string; project_id: string; media_id: string }[]) {
      if (item.media_id) refs.push({ id: item.media_id, ref: { type: "project_gallery", field: "project_gallery.media_id", projectId: item.project_id } });
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
