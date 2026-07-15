import { cache } from "react";
import { createAdminClient } from "./admin";
import type { DbProject, DbService, DbMessage, DbSiteSetting } from "@/types/supabase";
import type { Project } from "@/types";

export const getCachedProjects = cache(async (): Promise<Project[]> => {
  const s = createAdminClient();
  const { data, error } = await s
    .from("projects")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data as DbProject[]).map((row) => {
    let gallery: string[] = [];
    try { gallery = JSON.parse(row.gallery_images || "[]"); } catch {}
    let galleryMediaIds: string[] = [];
    try {
      if (Array.isArray(row.gallery_media_ids)) galleryMediaIds = row.gallery_media_ids;
      else if (typeof row.gallery_media_ids === "string") galleryMediaIds = JSON.parse(row.gallery_media_ids || "[]");
    } catch {}
    return {
      id: row.id, title: row.title, img: row.img, tags: row.tags,
      desc: row.description, role: row.role, year: row.year, stack: row.stack,
      live: row.live, overlayTag: row.overlay_tag, overlayName: row.overlay_name,
      galleryImages: gallery, featured: row.featured, githubUrl: row.github_url,
      slug: row.slug || "", category: row.category || "", client: row.client || "",
      published: row.published !== false, galleryMediaIds, coverMediaId: row.cover_media_id || "",
      videoMediaId: row.video_media_id || "", seoTitle: row.seo_title || "",
      seoDescription: row.seo_description || "", technologies: row.technologies || "",
      servicesText: row.services_text || "",
      publishStatus: row.publish_status || "published",
    };
  });
});

export const getCachedServices = cache(async (): Promise<DbService[]> => {
  const s = createAdminClient();
  const { data, error } = await s
    .from("services")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return data as DbService[];
});

export const getCachedMessages = cache(async (): Promise<DbMessage[]> => {
  const s = createAdminClient();
  const { data, error } = await s
    .from("messages")
    .select("*")
    .order("date", { ascending: false });
  if (error) throw error;
  return data as DbMessage[];
});

export const getCachedSiteSettings = cache(async (): Promise<Record<string, string>> => {
  const s = createAdminClient();
  const ALL_KEYS = [
    "topbar_logo", "topbar_status",
    "home_pre", "home_name", "home_role", "home_subtitle", "home_status",
    "hero_image", "hero_bg", "resume_url",
    "hero_image_media_id", "hero_bg_media_id", "resume_url_media_id",
    "hero_cta1_text", "hero_cta1_url", "hero_cta1_style",
    "hero_cta2_text", "hero_cta2_url", "hero_cta2_style",
    "hero_social_linkedin", "hero_social_behance", "hero_social_github",
    "hero_social_instagram", "hero_social_x",
    "about_image", "about_image_media_id", "about_experience", "about_label", "about_title", "about_description", "about_skills", "about_tools",
    "about_stat_years", "about_stat_projects", "about_stat_clients", "about_stat_awards",
    "stats_label", "stats_title",
    "services_label", "services_title",
    "contact_label", "contact_title", "contact_subtitle", "contact_email",
  ];
  const { data, error } = await s
    .from("site_settings")
    .select("*")
    .in("key", ALL_KEYS);
  if (error) throw error;
  const result: Record<string, string> = {};
  for (const row of data as DbSiteSetting[]) {
    result[row.key] = row.value;
  }
  return result;
});
