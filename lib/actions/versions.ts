"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getUser } from "@/lib/supabase/auth";
import type { DbVersion } from "@/types/supabase";

export async function createVersion(
  entityType: string,
  entityId: string,
  snapshot: Record<string, unknown>,
  summary?: string
): Promise<{ versionNumber: number } | null> {
  try {
    const s = createAdminClient();
    const user = await getUser();

    const { data: last } = await s
      .from("versions")
      .select("version_number")
      .eq("entity_type", entityType)
      .eq("entity_id", entityId)
      .order("version_number", { ascending: false })
      .limit(1)
      .maybeSingle();

    const nextVersion = (last?.version_number || 0) + 1;

    const { error } = await s.from("versions").insert({
      version_number: nextVersion,
      entity_type: entityType,
      entity_id: entityId,
      snapshot,
      summary: summary || null,
      created_by: user?.email || "system",
    });
    if (error) return null;
    return { versionNumber: nextVersion };
  } catch {
    return null;
  }
}

export async function getVersions(
  entityType: string,
  entityId: string,
  limit = 50
): Promise<DbVersion[]> {
  const s = await createClient();
  const { data, error } = await s
    .from("versions")
    .select("*")
    .eq("entity_type", entityType)
    .eq("entity_id", entityId)
    .order("version_number", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data as DbVersion[]) || [];
}

export async function getVersionById(id: string): Promise<DbVersion | null> {
  const s = await createClient();
  const { data, error } = await s
    .from("versions")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data as DbVersion | null;
}

export async function restoreVersion(versionId: string): Promise<{ success: boolean; newVersion?: number; snapshot?: Record<string, unknown>; error?: string }> {
  try {
    const s = createAdminClient();
    const user = await getUser();

    const { data: version, error: vErr } = await s
      .from("versions")
      .select("*")
      .eq("id", versionId)
      .single();
    if (vErr || !version) return { success: false, error: "Version not found" };

    const ver = version as DbVersion;

    const { data: last } = await s
      .from("versions")
      .select("version_number")
      .eq("entity_type", ver.entity_type)
      .eq("entity_id", ver.entity_id)
      .order("version_number", { ascending: false })
      .limit(1)
      .maybeSingle();

    const nextVersion = (last?.version_number || 0) + 1;

    await s.from("versions").insert({
      version_number: nextVersion,
      entity_type: ver.entity_type,
      entity_id: ver.entity_id,
      snapshot: ver.snapshot,
      summary: `Restored from v${ver.version_number}`,
      created_by: user?.email || "system",
    });

    return { success: true, newVersion: nextVersion, snapshot: ver.snapshot };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

export async function compareSnapshots(
  oldSnap: Record<string, unknown>,
  newSnap: Record<string, unknown>
): Promise<{ key: string; type: "added" | "removed" | "modified" | "unchanged"; oldValue?: unknown; newValue?: unknown }[]> {
  const allKeys = new Set([...Object.keys(oldSnap), ...Object.keys(newSnap)]);
  const diffs: { key: string; type: "added" | "removed" | "modified" | "unchanged"; oldValue?: unknown; newValue?: unknown }[] = [];

  for (const key of Array.from(allKeys).sort()) {
    const oldVal = oldSnap[key];
    const newVal = newSnap[key];

    if (oldVal === undefined && newVal !== undefined) {
      diffs.push({ key, type: "added", newValue: newVal });
    } else if (oldVal !== undefined && newVal === undefined) {
      diffs.push({ key, type: "removed", oldValue: oldVal });
    } else if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
      diffs.push({ key, type: "modified", oldValue: oldVal, newValue: newVal });
    } else {
      diffs.push({ key, type: "unchanged", oldValue: oldVal, newValue: newVal });
    }
  }

  return diffs;
}

export async function shouldCreateVersion(
  entityType: string,
  entityId: string,
  newSnapshot: Record<string, unknown>
): Promise<boolean> {
  try {
    const s = await createClient();
    const { data: last } = await s
      .from("versions")
      .select("snapshot")
      .eq("entity_type", entityType)
      .eq("entity_id", entityId)
      .order("version_number", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!last) return true;
    return JSON.stringify(last.snapshot) !== JSON.stringify(newSnapshot);
  } catch {
    return true;
  }
}
