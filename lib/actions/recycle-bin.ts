"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getUser } from "@/lib/supabase/auth";
import type { DbRecycleBin } from "@/types/supabase";

const DEFAULT_EXPIRY_DAYS = 30;

export async function softDelete(
  entityType: string,
  entityId: string,
  entityTitle: string,
  snapshot: Record<string, unknown>,
  expiryDays = DEFAULT_EXPIRY_DAYS
): Promise<{ success: boolean; error?: string }> {
  try {
    const s = createAdminClient();
    const user = await getUser();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiryDays);

    const { error } = await s.from("recycle_bin").insert({
      entity_type: entityType,
      entity_id: entityId,
      entity_title: entityTitle,
      snapshot,
      deleted_by: user?.email || "system",
      expires_at: expiresAt.toISOString(),
    });
    if (error) return { success: false, error: error.message };

    if (entityType === "project") {
      await s.from("projects").delete().eq("id", entityId);
      revalidatePath("/dashboard/portfolio");
    } else if (entityType === "service") {
      await s.from("services").delete().eq("id", entityId);
      revalidatePath("/dashboard/services");
    }
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/recycle-bin");
    return { success: true };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

export async function getRecycleBin(): Promise<DbRecycleBin[]> {
  const s = await createClient();
  const { data, error } = await s
    .from("recycle_bin")
    .select("*")
    .order("deleted_at", { ascending: false });
  if (error) throw error;
  return (data as DbRecycleBin[]) || [];
}

export async function restoreFromBin(
  binId: string
): Promise<{ success: boolean; entityType?: string; snapshot?: Record<string, unknown>; error?: string }> {
  try {
    const s = createAdminClient();

    const { data: item, error: fErr } = await s
      .from("recycle_bin")
      .select("*")
      .eq("id", binId)
      .single();
    if (fErr || !item) return { success: false, error: "Item not found" };

    const bin = item as DbRecycleBin;

    if (bin.entity_type === "project") {
      const { id, created_at, ...rest } = bin.snapshot as Record<string, unknown>;
      await s.from("projects").upsert({ ...rest, id: bin.entity_id, published: true }, { onConflict: "id" });
      revalidatePath("/dashboard/portfolio");
    } else if (bin.entity_type === "service") {
      const { id, created_at, ...rest } = bin.snapshot as Record<string, unknown>;
      await s.from("services").upsert({ ...rest, id: bin.entity_id }, { onConflict: "id" });
      revalidatePath("/dashboard/services");
    }

    await s.from("recycle_bin").delete().eq("id", binId);
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/recycle-bin");
    return { success: true, entityType: bin.entity_type, snapshot: bin.snapshot };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

export async function permanentDelete(binId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const s = createAdminClient();
    const { error } = await s.from("recycle_bin").delete().eq("id", binId);
    if (error) return { success: false, error: error.message };
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/recycle-bin");
    return { success: true };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

export async function cleanupExpired(): Promise<{ deleted: number }> {
  try {
    const s = createAdminClient();
    const { data } = await s
      .from("recycle_bin")
      .select("id")
      .lt("expires_at", new Date().toISOString());
    if (!data || data.length === 0) return { deleted: 0 };
    await s.from("recycle_bin").delete().lt("expires_at", new Date().toISOString());
    return { deleted: data.length };
  } catch {
    return { deleted: 0 };
  }
}

export async function permanentDeleteAll(): Promise<{ success: boolean; error?: string }> {
  try {
    const s = createAdminClient();
    await s.from("recycle_bin").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/recycle-bin");
    return { success: true };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}
