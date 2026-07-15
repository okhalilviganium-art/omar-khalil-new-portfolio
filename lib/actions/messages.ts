"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { logActivity } from "./activity";
import {
  getMessages as _getMessages,
  markAsRead as _markAsRead,
  markAsUnread as _markAsUnread,
  archiveMessage as _archiveMessage,
  restoreMessage as _restoreMessage,
  deleteMessage as _deleteMessage,
} from "@/lib/supabase/messages";

export type { Message } from "@/lib/supabase/messages";

export async function getMessages() {
  const s = await createClient();
  return _getMessages(s);
}

export async function getUnreadCountAction(): Promise<number> {
  const s = await createClient();
  const { count, error } = await s
    .from("messages")
    .select("*", { count: "exact", head: true })
    .eq("status", "unread");
  if (error) return 0;
  return count || 0;
}

export async function markAsRead(id: string) {
  const s = createAdminClient();
  try {
    await _markAsRead(id, s);
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
  revalidatePath("/dashboard/messages");
  revalidatePath("/dashboard");
  revalidateTag("messages", "max");
  return { success: true };
}

export async function markAsUnread(id: string) {
  const s = createAdminClient();
  try {
    await _markAsUnread(id, s);
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
  revalidatePath("/dashboard/messages");
  revalidatePath("/dashboard");
  revalidateTag("messages", "max");
  return { success: true };
}

export async function archiveMessage(id: string) {
  const s = createAdminClient();
  try {
    await _archiveMessage(id, s);
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
  revalidatePath("/dashboard/messages");
  revalidatePath("/dashboard");
  revalidateTag("messages", "max");
  return { success: true };
}

export async function restoreMessage(id: string) {
  const s = createAdminClient();
  try {
    await _restoreMessage(id, s);
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
  revalidatePath("/dashboard/messages");
  revalidatePath("/dashboard");
  revalidateTag("messages", "max");
  return { success: true };
}

export async function deleteMessage(id: string) {
  const s = createAdminClient();
  try {
    await _deleteMessage(id, s);
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
  revalidatePath("/dashboard/messages");
  revalidatePath("/dashboard");
  revalidateTag("messages", "max");
  logActivity("delete", "message", id);
  return { success: true };
}
