import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath, revalidateTag } from "next/cache";
import type { DbProject } from "@/types/supabase";

export interface PortfolioDB {
  getAll(): Promise<DbProject[]>;
  getById(id: string): Promise<DbProject | null>;
  create(row: Partial<DbProject>): Promise<{ id: string } | { error: string }>;
  update(id: string, row: Record<string, unknown>): Promise<{ success: boolean; error?: string }>;
  remove(id: string): Promise<{ success: boolean; error?: string }>;
  restore(id: string): Promise<{ success: boolean; error?: string }>;
}

function getClient() {
  return createAdminClient();
}

export const portfolio: PortfolioDB = {
  async getAll() {
    const s = getClient();
    const { data, error } = await s
      .from("projects")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) throw error;
    return (data as DbProject[]) || [];
  },

  async getById(id: string) {
    const s = getClient();
    const { data, error } = await s
      .from("projects")
      .select("*")
      .eq("id", id)
      .single();
    if (error || !data) return null;
    return data as DbProject;
  },

  async create(row: Partial<DbProject>) {
    const s = getClient();
    const { count } = await s
      .from("projects")
      .select("*", { count: "exact", head: true });
    const insertData = {
      title: row.title || "Untitled",
      img: row.img || "",
      tags: row.tags || "",
      description: row.description || "",
      role: row.role || "",
      year: row.year || "",
      stack: row.stack || "",
      live: row.live || "#",
      overlay_tag: row.overlay_tag || "",
      overlay_name: row.overlay_name || "",
      category: row.category || "",
      status: row.status || "published",
      featured: row.featured || false,
      sort_order: count || 0,
    };
    const { data, error } = await s
      .from("projects")
      .insert(insertData)
      .select("id")
      .single();
    if (error) return { error: error.message };
    revalidatePath("/dashboard/portfolio");
    revalidatePath("/dashboard");
    revalidatePath("/");
    revalidateTag("projects", "max");
    return { id: data!.id };
  },

  async update(id: string, row: Record<string, unknown>) {
    const s = getClient();
    if (Object.keys(row).length === 0) return { success: true };
    const { error } = await s.from("projects").update(row).eq("id", id);
    if (error) return { success: false, error: error.message };
    revalidatePath("/dashboard/portfolio");
    revalidatePath("/dashboard");
    revalidatePath("/");
    revalidateTag("projects", "max");
    return { success: true };
  },

  async remove(id: string) {
    const s = getClient();
    const { error } = await s.from("projects").delete().eq("id", id);
    if (error) return { success: false, error: error.message };
    revalidatePath("/dashboard/portfolio");
    revalidatePath("/dashboard");
    revalidatePath("/");
    revalidateTag("projects", "max");
    return { success: true };
  },

  async restore(id: string) {
    const s = getClient();
    const { data: binEntry, error: fetchErr } = await s
      .from("recycle_bin")
      .select("*")
      .eq("entity_type", "project")
      .eq("entity_id", id)
      .single();
    if (fetchErr || !binEntry) return { success: false, error: "Not found in recycle bin" };
    const snapshot = binEntry.snapshot as Record<string, unknown>;
    const { id: _removedId, created_at: _removedCreatedAt, ...rest } = snapshot;
    const { error } = await s.from("projects").insert(rest);
    if (error) return { success: false, error: error.message };
    await s.from("recycle_bin").delete().eq("id", binEntry.id);
    revalidatePath("/dashboard/portfolio");
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/recycle-bin");
    revalidatePath("/");
    revalidateTag("projects", "max");
    return { success: true };
  },
};
