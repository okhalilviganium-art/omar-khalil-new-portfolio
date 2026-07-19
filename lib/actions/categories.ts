"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAllCategories, slugify } from "@/lib/supabase/portfolio";

export async function getCategories() {
  return getAllCategories();
}

export async function createCategory(name: string) {
  const trimmed = name.trim();
  if (!trimmed) return { success: false, error: "Name is required" };

  const s = createAdminClient();
  const slug = slugify(trimmed);

  const { data: existing } = await s
    .from("portfolio_categories")
    .select("id")
    .eq("slug", slug)
    .single();
  if (existing) return { success: false, error: "A category with this name already exists" };

  const { count } = await s
    .from("portfolio_categories")
    .select("*", { count: "exact", head: true });

  const { data, error } = await s
    .from("portfolio_categories")
    .insert({ name: trimmed, slug, sort_order: count || 0 })
    .select("id")
    .single();
  if (error) return { success: false, error: error.message };

  revalidatePath("/dashboard/portfolio");
  revalidatePath("/dashboard/portfolio/editor");
  revalidatePath("/dashboard/portfolio/categories");
  revalidatePath("/");
  revalidateTag("projects", "max");
  return { success: true, id: data.id };
}

export async function updateCategory(id: string, name: string) {
  const trimmed = name.trim();
  if (!trimmed) return { success: false, error: "Name is required" };

  const s = createAdminClient();
  const slug = slugify(trimmed);

  const { data: existing } = await s
    .from("portfolio_categories")
    .select("id")
    .eq("slug", slug)
    .neq("id", id)
    .single();
  if (existing) return { success: false, error: "A category with this name already exists" };

  const { error } = await s
    .from("portfolio_categories")
    .update({ name: trimmed, slug })
    .eq("id", id);
  if (error) return { success: false, error: error.message };

  revalidatePath("/dashboard/portfolio");
  revalidatePath("/dashboard/portfolio/editor");
  revalidatePath("/dashboard/portfolio/categories");
  revalidatePath("/");
  revalidateTag("projects", "max");
  return { success: true };
}

export async function deleteCategory(id: string) {
  const s = createAdminClient();

  const { error: junctionErr } = await s.from("project_categories").delete().eq("category_id", id);
  if (junctionErr) return { success: false, error: junctionErr.message };

  const { error } = await s
    .from("portfolio_categories")
    .delete()
    .eq("id", id);
  if (error) return { success: false, error: error.message };

  revalidatePath("/dashboard/portfolio");
  revalidatePath("/dashboard/portfolio/editor");
  revalidatePath("/dashboard/portfolio/categories");
  revalidatePath("/");
  revalidateTag("projects", "max");
  return { success: true };
}

export async function reorderCategories(ids: string[]) {
  const s = createAdminClient();
  const updates = ids.map((id, i) =>
    s.from("portfolio_categories").update({ sort_order: i }).eq("id", id)
  );
  await Promise.all(updates);
  revalidatePath("/dashboard/portfolio");
  revalidatePath("/dashboard/portfolio/editor");
  revalidatePath("/dashboard/portfolio/categories");
  revalidatePath("/");
  revalidateTag("projects", "max");
  return { success: true };
}
