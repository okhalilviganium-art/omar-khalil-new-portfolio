import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath, revalidateTag } from "next/cache";
import type { DbMessage } from "@/types/supabase";

export interface MessagesDB {
  getAll(): Promise<DbMessage[]>;
  getById(id: string): Promise<DbMessage | null>;
  create(row: { name: string; email: string; subject?: string; message: string }): Promise<{ id: string } | { error: string }>;
  update(id: string, row: Record<string, unknown>): Promise<{ success: boolean; error?: string }>;
  remove(id: string): Promise<{ success: boolean; error?: string }>;
  restore(id: string): Promise<{ success: boolean; error?: string }>;
}

function getClient() {
  return createAdminClient();
}

export const messages: MessagesDB = {
  async getAll() {
    const s = getClient();
    const { data, error } = await s
      .from("messages")
      .select("*")
      .order("date", { ascending: false });
    if (error) throw error;
    return (data as DbMessage[]) || [];
  },

  async getById(id: string) {
    const s = getClient();
    const { data, error } = await s
      .from("messages")
      .select("*")
      .eq("id", id)
      .single();
    if (error || !data) return null;
    return data as DbMessage;
  },

  async create(row: { name: string; email: string; subject?: string; message: string }) {
    const s = getClient();
    const { data, error } = await s
      .from("messages")
      .insert({
        name: row.name,
        email: row.email,
        subject: row.subject || "Contact Form Submission",
        message: row.message,
        status: "unread",
        is_read: false,
      })
      .select("id")
      .single();
    if (error) return { error: error.message };
    return { id: data!.id };
  },

  async update(id: string, row: Record<string, unknown>) {
    const s = getClient();
    if (Object.keys(row).length === 0) return { success: true };
    const { error } = await s.from("messages").update(row).eq("id", id);
    if (error) return { success: false, error: error.message };
    revalidatePath("/dashboard/messages");
    revalidatePath("/dashboard");
    revalidateTag("messages", "max");
    return { success: true };
  },

  async remove(id: string) {
    const s = getClient();
    const { error } = await s.from("messages").delete().eq("id", id);
    if (error) return { success: false, error: error.message };
    revalidatePath("/dashboard/messages");
    revalidatePath("/dashboard");
    revalidateTag("messages", "max");
    return { success: true };
  },

  async restore() {
    return { success: false, error: "Messages do not support restore (hard delete)" };
  },
};
