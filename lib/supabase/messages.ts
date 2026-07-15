import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient as createBrowserClient } from "./client";
import type { DbMessage } from "@/types/supabase";

export interface Message {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  date: string;
  status: "unread" | "read" | "replied" | "archived";
  is_read: boolean;
}

function client(c?: SupabaseClient): SupabaseClient {
  return c || createBrowserClient();
}

export function dbToMessage(row: DbMessage): Message {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    subject: row.subject,
    message: row.message,
    date: row.date,
    status: row.status,
    is_read: row.is_read,
  };
}

export async function getMessages(c?: SupabaseClient): Promise<Message[]> {
  const s = client(c);
  const { data, error } = await s
    .from("messages")
    .select("*")
    .order("date", { ascending: false });
  if (error) throw error;
  return (data as DbMessage[]).map(dbToMessage);
}

export async function insertMessage(
  msg: { name: string; email: string; subject?: string; message: string },
  c?: SupabaseClient
): Promise<void> {
  const s = client(c);
  const { error } = await s.from("messages").insert({
    name: msg.name,
    email: msg.email,
    subject: msg.subject || "Contact Form Submission",
    message: msg.message,
    status: "unread",
    is_read: false,
  });
  if (error) throw error;
}

export async function markAsRead(
  id: string,
  c?: SupabaseClient
): Promise<void> {
  const s = client(c);
  const { error } = await s
    .from("messages")
    .update({ status: "read", is_read: true })
    .eq("id", id);
  if (error) throw error;
}

export async function markAsUnread(
  id: string,
  c?: SupabaseClient
): Promise<void> {
  const s = client(c);
  const { error } = await s
    .from("messages")
    .update({ status: "unread", is_read: false })
    .eq("id", id);
  if (error) throw error;
}

export async function restoreMessage(
  id: string,
  c?: SupabaseClient
): Promise<void> {
  const s = client(c);
  const { error } = await s
    .from("messages")
    .update({ status: "unread", is_read: false })
    .eq("id", id);
  if (error) throw error;
}

export async function archiveMessage(
  id: string,
  c?: SupabaseClient
): Promise<void> {
  const s = client(c);
  const { error } = await s
    .from("messages")
    .update({ status: "archived" })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteMessage(
  id: string,
  c?: SupabaseClient
): Promise<void> {
  const s = client(c);
  const { error } = await s.from("messages").delete().eq("id", id);
  if (error) throw error;
}
