import { createClient } from "./client";
import type { DbSocialLink } from "@/types/supabase";
import type { Social } from "@/types";

export async function getSocials(): Promise<Social[]> {
  const s = createClient();
  const { data, error } = await s
    .from("social_links")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data as DbSocialLink[]).map((r) => ({
    icon: r.icon,
    url: r.url,
    title: r.title,
  }));
}

export async function getSocialsRaw(): Promise<DbSocialLink[]> {
  const s = createClient();
  const { data, error } = await s
    .from("social_links")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return data as DbSocialLink[];
}

export async function syncSocials(socials: Social[]): Promise<void> {
  const s = createClient();
  const rows = socials.map((soc, i) => ({
    icon: soc.icon,
    url: soc.url,
    title: soc.title,
    sort_order: i,
  }));

  const { error: delErr } = await s.from("social_links").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  if (delErr) throw delErr;

  const { error } = await s.from("social_links").insert(rows);
  if (error) throw error;
}
