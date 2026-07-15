"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { logActivity } from "./activity";
import { createVersion, shouldCreateVersion } from "./versions";
import type { DbSiteSetting } from "@/types/supabase";

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

export async function getSiteSettings(): Promise<Record<string, string>> {
  const s = await createClient();
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
}

export async function updateSiteSettings(formData: FormData) {
  const s = createAdminClient();
  const entries: Record<string, string> = {};
  for (const key of ALL_KEYS) {
    const val = formData.get(key);
    if (val !== null) entries[key] = val as string;
  }
  const rows = Object.entries(entries).map(([key, value]) => ({
    key,
    value,
    updated_at: new Date().toISOString(),
  }));
  if (rows.length === 0) return { success: true };
  const { error } = await s
    .from("site_settings")
    .upsert(rows, { onConflict: "key" });
  if (error) return { success: false, error: error.message };
  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard/hero");
  revalidatePath("/dashboard/about");
  revalidatePath("/dashboard");
  revalidatePath("/");
  revalidateTag("site-settings", "max");
  logActivity("update", "settings", undefined, Object.keys(entries).join(", "));
  const s2 = createAdminClient();
  const { data: allSettings } = await s2.from("site_settings").select("*").in("key", ALL_KEYS);
  if (allSettings) {
    const snap: Record<string, string> = {};
    for (const r of allSettings as DbSiteSetting[]) snap[r.key] = r.value;
    shouldCreateVersion("settings", "global", snap).then((should) => { if (should) createVersion("settings", "global", snap, `Updated: ${Object.keys(entries).join(", ")}`); });
  }
  return { success: true };
}
