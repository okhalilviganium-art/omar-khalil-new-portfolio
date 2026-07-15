import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath, revalidateTag } from "next/cache";
import type { DbSiteSetting } from "@/types/supabase";

export interface SettingsDB {
  getAll(keys?: string[]): Promise<Record<string, string>>;
  getById(key: string): Promise<string | null>;
  create(key: string, value: string): Promise<{ success: boolean; error?: string }>;
  update(key: string, value: string): Promise<{ success: boolean; error?: string }>;
  remove(key: string): Promise<{ success: boolean; error?: string }>;
  restore(): Promise<{ success: boolean; error?: string }>;
  upsertMany(entries: Record<string, string>): Promise<{ success: boolean; error?: string }>;
}

function getClient() {
  return createAdminClient();
}

export const settings: SettingsDB = {
  async getAll(keys?: string[]) {
    const s = getClient();
    let query = s.from("site_settings").select("*");
    if (keys && keys.length > 0) {
      query = query.in("key", keys);
    }
    const { data, error } = await query;
    if (error) throw error;
    const result: Record<string, string> = {};
    for (const row of data as DbSiteSetting[]) {
      result[row.key] = row.value;
    }
    return result;
  },

  async getById(key: string) {
    const s = getClient();
    const { data, error } = await s
      .from("site_settings")
      .select("value")
      .eq("key", key)
      .single();
    if (error || !data) return null;
    return (data as DbSiteSetting).value;
  },

  async create(key: string, value: string) {
    const s = getClient();
    const { error } = await s
      .from("site_settings")
      .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: "key" });
    if (error) return { success: false, error: error.message };
    revalidatePath("/dashboard/settings");
    revalidatePath("/dashboard");
    revalidatePath("/");
    revalidateTag("site-settings", "max");
    return { success: true };
  },

  async update(key: string, value: string) {
    const s = getClient();
    const { error } = await s
      .from("site_settings")
      .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: "key" });
    if (error) return { success: false, error: error.message };
    revalidatePath("/dashboard/settings");
    revalidatePath("/dashboard/hero");
    revalidatePath("/dashboard/about");
    revalidatePath("/");
    revalidateTag("site-settings", "max");
    return { success: true };
  },

  async remove(key: string) {
    const s = getClient();
    const { error } = await s.from("site_settings").delete().eq("key", key);
    if (error) return { success: false, error: error.message };
    revalidatePath("/dashboard/settings");
    revalidatePath("/dashboard");
    revalidatePath("/");
    revalidateTag("site-settings", "max");
    return { success: true };
  },

  async restore() {
    return { success: false, error: "Settings do not support restore (key-value store)" };
  },

  async upsertMany(entries: Record<string, string>) {
    const s = getClient();
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
    return { success: true };
  },
};
