"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { DbFavorite } from "@/types/supabase";

export async function getFavorites(): Promise<DbFavorite[]> {
  const s = await createClient();
  const { data, error } = await s
    .from("favorites")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as DbFavorite[]) || [];
}

export async function addFavorite(
  entityType: string,
  entityId: string,
  entityTitle?: string,
  entityUrl?: string
) {
  const s = createAdminClient();
  const { error } = await s.from("favorites").upsert({
    entity_type: entityType,
    entity_id: entityId,
    entity_title: entityTitle || null,
    entity_url: entityUrl || null,
  }, { onConflict: "entity_type,entity_id" });
  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function removeFavorite(entityType: string, entityId: string) {
  const s = createAdminClient();
  const { error } = await s
    .from("favorites")
    .delete()
    .eq("entity_type", entityType)
    .eq("entity_id", entityId);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function isFavorited(entityType: string, entityId: string): Promise<boolean> {
  const s = await createClient();
  const { data } = await s
    .from("favorites")
    .select("id")
    .eq("entity_type", entityType)
    .eq("entity_id", entityId)
    .maybeSingle();
  return !!data;
}
