"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import type { DbStatistic } from "@/types/supabase";

export async function getStatistics(): Promise<DbStatistic[]> {
  const s = createAdminClient();
  const { data, error } = await s
    .from("statistics")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) {
    console.error("getStatistics ERROR:", error.message, error);
    throw error;
  }
  console.log("getStatistics result:", data?.length, "rows", JSON.stringify(data));
  return (data as DbStatistic[]) || [];
}

export async function createStatistic(formData: FormData) {
  const s = createAdminClient();
  const statType = formData.get("stat_type") as string;
  const { count } = await s.from("statistics").select("*", { count: "exact", head: true });
  const { error } = await s.from("statistics").insert({
    stat_type: statType,
    name: formData.get("name") as string || "New Stat",
    number_val: statType === "card" ? parseInt(formData.get("number_val") as string) || 0 : null,
    pct: statType === "bar" ? parseInt(formData.get("pct") as string) || 0 : null,
    sort_order: count || 0,
  });
  if (error) return { success: false, error: error.message };
  revalidatePath("/dashboard/statistics");
  revalidatePath("/dashboard");
  revalidatePath("/");
  revalidateTag("statistics", "max");
  return { success: true };
}

export async function updateStatistic(id: string, formData: FormData) {
  const s = createAdminClient();
  const { error } = await s
    .from("statistics")
    .update({
      name: formData.get("name") as string,
      number_val: formData.get("number_val") ? parseInt(formData.get("number_val") as string) : null,
      pct: formData.get("pct") ? parseInt(formData.get("pct") as string) : null,
    })
    .eq("id", id);
  if (error) return { success: false, error: error.message };
  revalidatePath("/dashboard/statistics");
  revalidatePath("/dashboard");
  revalidatePath("/");
  revalidateTag("statistics", "max");
  return { success: true };
}

export async function deleteStatistic(id: string) {
  const s = createAdminClient();
  const { error } = await s.from("statistics").delete().eq("id", id);
  if (error) return { success: false, error: error.message };
  revalidatePath("/dashboard/statistics");
  revalidatePath("/dashboard");
  revalidatePath("/");
  revalidateTag("statistics", "max");
  return { success: true };
}
