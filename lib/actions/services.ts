"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { logActivity } from "./activity";
import { createVersion } from "./versions";
import type { DbService } from "@/types/supabase";

export async function getServices(): Promise<DbService[]> {
  const s = await createClient();
  const { data, error } = await s
    .from("services")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return data as DbService[];
}

export async function createService(fd: FormData) {
  const s = createAdminClient();
  const { count } = await s.from("services").select("*", { count: "exact", head: true });
  const { error } = await s.from("services").insert({
    icon: (fd.get("icon") as string) || "bi-stars",
    name: (fd.get("name") as string) || "New Service",
    description: (fd.get("description") as string) || "",
    category: (fd.get("category") as string) || "",
    active: fd.get("active") !== "false",
    sort_order: count || 0,
  });
  if (error) return { success: false, error: error.message };
  revalidatePath("/dashboard/services");
  revalidatePath("/dashboard");
  revalidatePath("/");
  revalidateTag("services", "max");
  logActivity("create", "service", undefined, (fd.get("name") as string) || "New Service");
  const { data: svc } = await s.from("services").select("*").eq("name", fd.get("name")).order("created_at", { ascending: false }).limit(1).maybeSingle();
  if (svc) createVersion("service", svc.id, svc, `Created: ${fd.get("name")}`);
  return { success: true };
}

export async function updateService(id: string, fd: FormData) {
  const s = createAdminClient();
  const { error } = await s
    .from("services")
    .update({
      icon: fd.get("icon") as string,
      name: fd.get("name") as string,
      description: fd.get("description") as string,
      category: fd.get("category") as string,
      active: fd.get("active") !== "false",
    })
    .eq("id", id);
  if (error) return { success: false, error: error.message };
  revalidatePath("/dashboard/services");
  revalidatePath("/dashboard");
  revalidatePath("/");
  revalidateTag("services", "max");
  logActivity("update", "service", id, fd.get("name") as string);
  const { data: svc } = await s.from("services").select("*").eq("id", id).maybeSingle();
  if (svc) createVersion("service", id, svc, `Updated: ${fd.get("name")}`);
  return { success: true };
}

export async function toggleServiceActive(id: string, active: boolean) {
  const s = createAdminClient();
  const { error } = await s
    .from("services")
    .update({ active })
    .eq("id", id);
  if (error) return { success: false, error: error.message };
  revalidatePath("/dashboard/services");
  revalidatePath("/dashboard");
  revalidatePath("/");
  revalidateTag("services", "max");
  return { success: true };
}

export async function deleteService(id: string) {
  const s = createAdminClient();
  const { error } = await s.from("services").delete().eq("id", id);
  if (error) return { success: false, error: error.message };
  revalidatePath("/dashboard/services");
  revalidatePath("/dashboard");
  revalidatePath("/");
  revalidateTag("services", "max");
  logActivity("delete", "service", id);
  return { success: true };
}

export async function reorderServices(ids: string[]) {
  const s = createAdminClient();
  const updates = ids.map((id, i) =>
    s.from("services").update({ sort_order: i }).eq("id", id)
  );
  await Promise.all(updates);
  revalidatePath("/dashboard/services");
  revalidatePath("/dashboard");
  revalidatePath("/");
  revalidateTag("services", "max");
  return { success: true };
}
