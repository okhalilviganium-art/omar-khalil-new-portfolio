"use server";

import type { DbActivityLog } from "@/types/supabase";

export async function logActivity(
  _action: string,
  _entityType: string,
  _entityId?: string,
  _entityTitle?: string,
  _metadata?: Record<string, unknown>
): Promise<void> {
  return;
}

export async function getActivityLog(
  _limit = 30
): Promise<DbActivityLog[]> {
  return [];
}

export async function clearActivityLog(): Promise<void> {
  return;
}