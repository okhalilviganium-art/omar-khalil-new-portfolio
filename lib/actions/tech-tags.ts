"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAllTechTags, slugify } from "@/lib/supabase/portfolio";

export async function getTechTags() {
  return getAllTechTags();
}

export async function createTechTag(name: string) {
  const trimmed = name.trim();
  if (!trimmed) return { success: false, error: "Name is required" };

  const s = createAdminClient();
  const slug = slugify(trimmed);

  const { data: existing } = await s
    .from("portfolio_tech_tags")
    .select("id")
    .eq("slug", slug)
    .single();
  if (existing) return { success: false, error: "A tag with this name already exists" };

  const { count } = await s
    .from("portfolio_tech_tags")
    .select("*", { count: "exact", head: true });

  const { data, error } = await s
    .from("portfolio_tech_tags")
    .insert({ name: trimmed, slug, sort_order: count || 0 })
    .select("id")
    .single();
  if (error) return { success: false, error: error.message };

  revalidatePath("/dashboard/portfolio");
  revalidatePath("/dashboard/portfolio/editor");
  revalidatePath("/dashboard/portfolio/tech-stack");
  revalidatePath("/");
  revalidateTag("projects", "max");
  return { success: true, id: data.id };
}

export async function updateTechTag(id: string, name: string) {
  const trimmed = name.trim();
  if (!trimmed) return { success: false, error: "Name is required" };

  const s = createAdminClient();
  const slug = slugify(trimmed);

  const { data: existing } = await s
    .from("portfolio_tech_tags")
    .select("id")
    .eq("slug", slug)
    .neq("id", id)
    .single();
  if (existing) return { success: false, error: "A tag with this name already exists" };

  const { error } = await s
    .from("portfolio_tech_tags")
    .update({ name: trimmed, slug })
    .eq("id", id);
  if (error) return { success: false, error: error.message };

  revalidatePath("/dashboard/portfolio");
  revalidatePath("/dashboard/portfolio/editor");
  revalidatePath("/dashboard/portfolio/tech-stack");
  revalidatePath("/");
  revalidateTag("projects", "max");
  return { success: true };
}

export async function deleteTechTag(id: string) {
  const s = createAdminClient();

  const { error: junctionErr } = await s.from("project_tech_tags").delete().eq("tag_id", id);
  if (junctionErr) return { success: false, error: junctionErr.message };

  const { error } = await s
    .from("portfolio_tech_tags")
    .delete()
    .eq("id", id);
  if (error) return { success: false, error: error.message };

  revalidatePath("/dashboard/portfolio");
  revalidatePath("/dashboard/portfolio/editor");
  revalidatePath("/dashboard/portfolio/tech-stack");
  revalidatePath("/");
  revalidateTag("projects", "max");
  return { success: true };
}

export async function reorderTechTags(ids: string[]) {
  const s = createAdminClient();
  const updates = ids.map((id, i) =>
    s.from("portfolio_tech_tags").update({ sort_order: i }).eq("id", id)
  );
  await Promise.all(updates);
  revalidatePath("/dashboard/portfolio");
  revalidatePath("/dashboard/portfolio/editor");
  revalidatePath("/dashboard/portfolio/tech-stack");
  revalidatePath("/");
  revalidateTag("projects", "max");
  return { success: true };
}
