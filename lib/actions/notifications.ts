"use server";

import type { DbNotification } from "@/types/supabase";

export async function getNotifications(
  _limit = 50
): Promise<DbNotification[]> {
  return [];
}

export async function getUnreadCount(): Promise<number> {
  return 0;
}

export async function markAsRead(_id: string): Promise<void> {
  return;
}

export async function markAllAsRead(): Promise<void> {
  return;
}

export async function createNotification(
  _title: string,
  _message?: string,
  _type?: string,
  _entityType?: string,
  _entityId?: string
): Promise<void> {
  return;
}

export async function deleteNotification(_id: string): Promise<void> {
  return;
}

export async function clearNotifications(): Promise<void> {
  return;
}