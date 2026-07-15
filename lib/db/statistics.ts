import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath, revalidateTag } from "next/cache";
import type { DbStatistic } from "@/types/supabase";

export interface StatisticsDB {
  getAll(): Promise<DbStatistic[]>;
  getById(id: string): Promise<DbStatistic | null>;
  create(row: Partial<DbStatistic>): Promise<{ id: string } | { error: string }>;
  update(id: string, row: Record<string, unknown>): Promise<{ success: boolean; error?: string }>;
  remove(id: string): Promise<{ success: boolean; error?: string }>;
  restore(id: string): Promise<{ success: boolean; error?: string }>;
}

function getClient() {
  return createAdminClient();
}

export const statistics: StatisticsDB = {
  async getAll() {
    const s = getClient();
    const { data, error } = await s
      .from("statistics")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) throw error;
    return (data as DbStatistic[]) || [];
  },

  async getById(id: string) {
    const s = getClient();
    const { data, error } = await s
      .from("statistics")
      .select("*")
      .eq("id", id)
      .single();
    if (error || !data) return null;
    return data as DbStatistic;
  },

  async create(row: Partial<DbStatistic>) {
    const s = getClient();
    const { count } = await s
      .from("statistics")
      .select("*", { count: "exact", head: true });
    const insertData = {
      stat_type: row.stat_type || "card",
      name: row.name || "New Stat",
      number_val: row.number_val ?? null,
      pct: row.pct ?? null,
      sort_order: count || 0,
    };
    const { data, error } = await s
      .from("statistics")
      .insert(insertData)
      .select("id")
      .single();
    if (error) return { error: error.message };
    revalidatePath("/dashboard/statistics");
    revalidatePath("/dashboard");
    revalidatePath("/");
    revalidateTag("statistics", "max");
    return { id: data!.id };
  },

  async update(id: string, row: Record<string, unknown>) {
    const s = getClient();
    if (Object.keys(row).length === 0) return { success: true };
    const { error } = await s.from("statistics").update(row).eq("id", id);
    if (error) return { success: false, error: error.message };
    revalidatePath("/dashboard/statistics");
    revalidatePath("/dashboard");
    revalidatePath("/");
    revalidateTag("statistics", "max");
    return { success: true };
  },

  async remove(id: string) {
    const s = getClient();
    const { error } = await s.from("statistics").delete().eq("id", id);
    if (error) return { success: false, error: error.message };
    revalidatePath("/dashboard/statistics");
    revalidatePath("/dashboard");
    revalidatePath("/");
    revalidateTag("statistics", "max");
    return { success: true };
  },

  async restore() {
    return { success: false, error: "Statistics do not support restore (hard delete)" };
  },
};
