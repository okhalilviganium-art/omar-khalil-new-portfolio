"use server";

import type { DbFavorite } from "@/types/supabase";

export async function getFavorites(): Promise<DbFavorite[]> {
  return [];
}

export async function addFavorite(
  _entityType: string,
  _entityId: string,
  _entityTitle?: string,
  _entityUrl?: string
) {
  return {
    success: true,
  };
}

export async function removeFavorite(
  _entityType: string,
  _entityId: string
) {
  return {
    success: true,
  };
}

export async function isFavorited(
  _entityType: string,
  _entityId: string
): Promise<boolean> {
  return false;
}