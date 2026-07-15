import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath, revalidateTag } from "next/cache";
import type { DbService } from "@/types/supabase";

export interface ServicesDB {
  getAll(): Promise<DbService[]>;
  getById(id: string): Promise<DbService | null>;
  create(row: Partial<DbService>): Promise<{ id: string } | { error: string }>;
  update(id: string, row: Record<string, unknown>): Promise<{ success: boolean; error?: string }>;
  remove(id: string): Promise<{ success: boolean; error?: string }>;
  restore(id: string): Promise<{ success: boolean; error?: string }>;
}

function getClient() {
  return createAdminClient();
}

export const services: ServicesDB = {
  async getAll() {
    const s = getClient();
    const { data, error } = await s
      .from("services")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) throw error;
    return (data as DbService[]) || [];
  },

  async getById(id: string) {
    const s = getClient();
    const { data, error } = await s
      .from("services")
      .select("*")
      .eq("id", id)
      .single();
    if (error || !data) return null;
    return data as DbService;
  },

  async create(row: Partial<DbService>) {
    const s = getClient();
    const { count } = await s
      .from("services")
      .select("*", { count: "exact", head: true });
    const insertData = {
      icon: row.icon || "bi-stars",
      name: row.name || "New Service",
      description: row.description || "",
      category: row.category || "",
      active: row.active !== false,
      sort_order: count || 0,
    };
    const { data, error } = await s
      .from("services")
      .insert(insertData)
      .select("id")
      .single();
    if (error) return { error: error.message };
    revalidatePath("/dashboard/services");
    revalidatePath("/dashboard");
    revalidatePath("/");
    revalidateTag("services", "max");
    return { id: data!.id };
  },

  async update(id: string, row: Record<string, unknown>) {
    const s = getClient();
    if (Object.keys(row).length === 0) return { success: true };
    const { error } = await s.from("services").update(row).eq("id", id);
    if (error) return { success: false, error: error.message };
    revalidatePath("/dashboard/services");
    revalidatePath("/dashboard");
    revalidatePath("/");
    revalidateTag("services", "max");
    return { success: true };
  },

  async remove(id: string) {
    const s = getClient();
    const { error } = await s.from("services").delete().eq("id", id);
    if (error) return { success: false, error: error.message };
    revalidatePath("/dashboard/services");
    revalidatePath("/dashboard");
    revalidatePath("/");
    revalidateTag("services", "max");
    return { success: true };
  },

  async restore() {
    return { success: false, error: "Services do not support restore (hard delete)" };
  },
};
