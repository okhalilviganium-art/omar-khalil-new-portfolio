import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath, revalidateTag } from "next/cache";
import type { DbSocialLink } from "@/types/supabase";

export interface SocialsDB {
  getAll(): Promise<DbSocialLink[]>;
  getById(id: string): Promise<DbSocialLink | null>;
  create(row: Partial<DbSocialLink>): Promise<{ id: string } | { error: string }>;
  update(id: string, row: Record<string, unknown>): Promise<{ success: boolean; error?: string }>;
  remove(id: string): Promise<{ success: boolean; error?: string }>;
  restore(id: string): Promise<{ success: boolean; error?: string }>;
}

function getClient() {
  return createAdminClient();
}

export const socials: SocialsDB = {
  async getAll() {
    const s = getClient();
    const { data, error } = await s
      .from("social_links")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) throw error;
    return (data as DbSocialLink[]) || [];
  },

  async getById(id: string) {
    const s = getClient();
    const { data, error } = await s
      .from("social_links")
      .select("*")
      .eq("id", id)
      .single();
    if (error || !data) return null;
    return data as DbSocialLink;
  },

  async create(row: Partial<DbSocialLink>) {
    const s = getClient();
    const { count } = await s
      .from("social_links")
      .select("*", { count: "exact", head: true });
    const insertData = {
      icon: row.icon || "bi-link",
      url: row.url || "#",
      title: row.title || "Link",
      sort_order: count || 0,
    };
    const { data, error } = await s
      .from("social_links")
      .insert(insertData)
      .select("id")
      .single();
    if (error) return { error: error.message };
    revalidatePath("/dashboard/social-links");
    revalidatePath("/dashboard");
    revalidatePath("/");
    revalidateTag("social-links", "max");
    return { id: data!.id };
  },

  async update(id: string, row: Record<string, unknown>) {
    const s = getClient();
    if (Object.keys(row).length === 0) return { success: true };
    const { error } = await s.from("social_links").update(row).eq("id", id);
    if (error) return { success: false, error: error.message };
    revalidatePath("/dashboard/social-links");
    revalidatePath("/dashboard");
    revalidatePath("/");
    revalidateTag("social-links", "max");
    return { success: true };
  },

  async remove(id: string) {
    const s = getClient();
    const { error } = await s.from("social_links").delete().eq("id", id);
    if (error) return { success: false, error: error.message };
    revalidatePath("/dashboard/social-links");
    revalidatePath("/dashboard");
    revalidatePath("/");
    revalidateTag("social-links", "max");
    return { success: true };
  },

  async restore() {
    return { success: false, error: "Social links do not support restore (hard delete)" };
  },
};
