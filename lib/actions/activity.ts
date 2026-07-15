"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { DbActivityLog } from "@/types/supabase";

export async function logActivity(
  action: string,
  entityType: string,
  entityId?: string,
  entityTitle?: string,
  metadata?: Record<string, unknown>
) {
  try {
    const s = createAdminClient();
    await s.from("activity_log").insert({
      action,
      entity_type: entityType,
      entity_id: entityId || null,
      entity_title: entityTitle || null,
      metadata: metadata || {},
    });
  } catch {}
}

export async function getActivityLog(limit = 30): Promise<DbActivityLog[]> {
  const s = await createClient();
  const { data, error } = await s
    .from("activity_log")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data as DbActivityLog[]) || [];
}

export async function clearActivityLog() {
  const s = createAdminClient();
  await s.from("activity_log").delete().neq("id", "00000000-0000-0000-0000-000000000000");
}
