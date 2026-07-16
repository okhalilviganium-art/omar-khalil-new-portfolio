import { cache } from "react";
import { createAdminClient } from "./admin";
import type { DbService, DbMessage, DbSiteSetting } from "@/types/supabase";
import type { Project } from "@/types";
import { getFeaturedProjects } from "./portfolio";

export const getCachedFeaturedProjects = cache(async (limit = 6): Promise<Project[]> => {
  return getFeaturedProjects(limit);
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
