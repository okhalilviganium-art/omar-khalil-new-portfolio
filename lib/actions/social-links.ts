"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { DbSocialLink } from "@/types/supabase";

export async function getSocialLinks(): Promise<DbSocialLink[]> {
  const s = await createClient();
  const { data, error } = await s
    .from("social_links")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return data as DbSocialLink[];
}

export async function createSocialLink(formData: FormData) {
  const s = createAdminClient();
  const { count } = await s.from("social_links").select("*", { count: "exact", head: true });
  const { error } = await s.from("social_links").insert({
    icon: formData.get("icon") as string || "bi-link",
    url: formData.get("url") as string || "#",
    title: formData.get("title") as string || "Link",
    sort_order: count || 0,
  });
  if (error) return { success: false, error: error.message };
  revalidatePath("/dashboard/social-links");
  revalidatePath("/dashboard");
  revalidatePath("/");
  revalidateTag("social-links", "max");
  return { success: true };
}

export async function updateSocialLink(id: string, formData: FormData) {
  const s = createAdminClient();
  const { error } = await s
    .from("social_links")
    .update({
      icon: formData.get("icon") as string,
      url: formData.get("url") as string,
      title: formData.get("title") as string,
    })
    .eq("id", id);
  if (error) return { success: false, error: error.message };
  revalidatePath("/dashboard/social-links");
  revalidatePath("/dashboard");
  revalidatePath("/");
  revalidateTag("social-links", "max");
  return { success: true };
}

export async function deleteSocialLink(id: string) {
  const s = createAdminClient();
  const { error } = await s.from("social_links").delete().eq("id", id);
  if (error) return { success: false, error: error.message };
  revalidatePath("/dashboard/social-links");
  revalidatePath("/dashboard");
  revalidatePath("/");
  revalidateTag("social-links", "max");
  return { success: true };
}

export async function reorderSocialLinks(ids: string[]) {
  const s = createAdminClient();
  const updates = ids.map((id, i) =>
    s.from("social_links").update({ sort_order: i }).eq("id", id)
  );
  await Promise.all(updates);
  revalidatePath("/dashboard/social-links");
  revalidatePath("/dashboard");
  revalidatePath("/");
  revalidateTag("social-links", "max");
  return { success: true };
}
