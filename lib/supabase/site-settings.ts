import { createAdminClient } from "./admin";
import type { DbSiteSetting } from "@/types/supabase";

export async function getSetting(key: string): Promise<string> {
  const s = createAdminClient();

  const { data, error } = await s
    .from("site_settings")
    .select("value")
    .eq("key", key)
    .single();

  console.log("GET SETTING:", key);
  console.log("DATA:", data);
  console.log("ERROR:", error);

  if (error || !data) return "";

  return (data as DbSiteSetting).value;
}

export async function getSettings(
  keys: string[]
): Promise<Record<string, string>> {
  const s = createAdminClient();

  console.log("SUPABASE URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);

  const { data, error } = await s
    .from("site_settings")
    .select("*")
    .in("key", keys);

  console.log("DATA:", data);
  console.log("ERROR:", error);

  if (error) throw error;

  const result: Record<string, string> = {};

  for (const row of data as DbSiteSetting[]) {
    result[row.key] = row.value;
  }

  console.log("RESULT:", result);

  return result;
}

export async function upsertSetting(
  key: string,
  value: string
): Promise<void> {
  const s = createAdminClient();

  const { error } = await s
    .from("site_settings")
    .upsert(
      {
        key,
        value,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "key",
      }
    );

  if (error) throw error;
}

export async function upsertSettings(
  entries: Record<string, string>
): Promise<void> {
  const s = createAdminClient();

  const rows = Object.entries(entries).map(([key, value]) => ({
    key,
    value,
    updated_at: new Date().toISOString(),
  }));

  const { error } = await s
    .from("site_settings")
    .upsert(rows, {
      onConflict: "key",
    });

  if (error) throw error;
}