"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { DbNotification } from "@/types/supabase";

export async function getNotifications(limit = 50): Promise<DbNotification[]> {
  const s = await createClient();
  const { data, error } = await s
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data as DbNotification[]) || [];
}

export async function getUnreadCount(): Promise<number> {
  const s = await createClient();
  const { count } = await s
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("read", false);
  return count || 0;
}

export async function markAsRead(id: string) {
  const s = createAdminClient();
  await s.from("notifications").update({ read: true }).eq("id", id);
}

export async function markAllAsRead() {
  const s = createAdminClient();
  await s.from("notifications").update({ read: true }).eq("read", false);
}

export async function createNotification(
  title: string,
  message?: string,
  type?: string,
  entityType?: string,
  entityId?: string
) {
  try {
    const s = createAdminClient();
    await s.from("notifications").insert({
      title,
      message: message || null,
      type: type || "info",
      entity_type: entityType || null,
      entity_id: entityId || null,
    });
  } catch {}
}

export async function deleteNotification(id: string) {
  const s = createAdminClient();
  await s.from("notifications").delete().eq("id", id);
}

export async function clearNotifications() {
  const s = createAdminClient();
  await s.from("notifications").delete().neq("id", "00000000-0000-0000-0000-000000000000");
}
