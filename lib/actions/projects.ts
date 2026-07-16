"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { logActivity } from "./activity";
import { softDelete } from "./recycle-bin";
import { createVersion, shouldCreateVersion } from "./versions";
import type { DbProject } from "@/types/supabase";
import type { Project } from "@/types";

function dbToProject(row: DbProject): Project {
  const status = row.status || "published";
  return {
    id: row.id, title: row.title, slug: row.slug || "", img: row.img, tags: row.tags,
    desc: row.description, shortDescription: row.short_description || "",
    fullDescription: row.full_description || row.description || "",
    role: row.role, year: row.year, stack: row.stack, live: row.live,
    overlayTag: row.overlay_tag, overlayName: row.overlay_name,
    featured: row.featured, category: row.category || "",
    categories: [], published: status !== "draft", publishStatus: status,
    client: row.client || "", thumbnailMediaId: row.thumbnail_media_id || "",
    coverImageMediaId: row.cover_image_media_id || "",
    gallery: [], links: [], techStack: [],
    orderIndex: row.sort_order || 0, createdAt: row.created_at || "",
    updatedAt: row.updated_at || null,
  };
}

export async function getProjects(): Promise<Project[]> {
  const s = await createClient();
  const { data, error } = await s
    .from("projects")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data as DbProject[]).map(dbToProject);
}

export async function getProjectsRaw(): Promise<DbProject[]> {
  const s = await createClient();
  const { data, error } = await s
    .from("projects")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data as DbProject[]) || [];
}

export async function getProjectById(id: string): Promise<DbProject | null> {
  const s = await createClient();
  const { data, error } = await s.from("projects").select("*").eq("id", id).single();
  if (error || !data) return null;
  return data as DbProject;
}

export async function createProject(formData: FormData) {
  const s = createAdminClient();
  const title = formData.get("title") as string || "Untitled";
  const published = formData.get("published") !== "false";
  const featured = formData.get("featured") === "true";

  const { count } = await s.from("projects").select("*", { count: "exact", head: true });

  const row = {
    title,
    img: formData.get("img") as string || "",
    tags: formData.get("tags") as string || "",
    description: formData.get("description") as string || "",
    role: formData.get("role") as string || "",
    year: formData.get("year") as string || new Date().getFullYear().toString(),
    stack: formData.get("stack") as string || "",
    live: formData.get("live") as string || "#",
    overlay_tag: formData.get("overlay_tag") as string || "",
    overlay_name: formData.get("overlay_name") as string || "",
    category: formData.get("category") as string || "",
    status: published ? "published" : "draft",
    featured,
    sort_order: count || 0,
  };

  const { data, error } = await s.from("projects").insert(row).select("id").single();
  if (error) return { success: false, error: error.message };
  revalidatePath("/dashboard/portfolio");
  revalidatePath("/dashboard");
  revalidatePath("/");
  revalidateTag("projects", "max");
  logActivity("create", "project", data?.id, title);
  if (data?.id) createVersion("project", data.id, { ...row, id: data.id }, "Project created");
  return { success: true, id: data?.id };
}

export async function updateProject(id: string, formData: FormData) {
  const s = createAdminClient();
  const updates: Record<string, unknown> = {};

  const stringFields = [
    "title", "img", "tags", "description", "role", "year", "stack",
    "live", "overlay_tag", "overlay_name", "category",
  ];
  for (const f of stringFields) {
    const val = formData.get(f);
    if (val !== null) updates[f] = val as string;
  }

  const featuredVal = formData.get("featured");
  if (featuredVal !== null) updates.featured = featuredVal === "true";

  const publishedVal = formData.get("published");
  const statusVal = formData.get("status");
  if (statusVal !== null) {
    updates.status = statusVal as string;
  } else if (publishedVal !== null) {
    updates.status = publishedVal !== "false" ? "published" : "draft";
  }

  if (Object.keys(updates).length === 0) return { success: true };
  const { error } = await s.from("projects").update(updates).eq("id", id);
  if (error) return { success: false, error: error.message };
  revalidatePath("/dashboard/portfolio");
  revalidatePath("/dashboard");
  revalidatePath("/");
  revalidateTag("projects", "max");
  logActivity("update", "project", id, updates.title as string);
  const { data: snap } = await s.from("projects").select("*").eq("id", id).maybeSingle();
  if (snap) shouldCreateVersion("project", id, snap).then((should) => { if (should) createVersion("project", id, snap, updates.title ? `Updated: ${updates.title}` : "Project updated"); });
  return { success: true };
}

export async function updateProjectField(id: string, field: string, value: unknown) {
  const s = createAdminClient();
  const allowed = ["title", "category", "sort_order", "featured"];
  if (!allowed.includes(field)) {
    if (field === "published") {
      const updates = { status: value ? "published" : "draft" };
      const { error } = await s.from("projects").update(updates).eq("id", id);
      if (error) return { success: false, error: error.message };
      revalidatePath("/dashboard/portfolio");
      revalidatePath("/dashboard");
      revalidatePath("/");
      revalidateTag("projects", "max");
      return { success: true };
    }
    if (field === "publish_status") {
      const updates = { status: value as string };
      const { error } = await s.from("projects").update(updates).eq("id", id);
      if (error) return { success: false, error: error.message };
      revalidatePath("/dashboard/portfolio");
      revalidatePath("/dashboard");
      revalidatePath("/");
      revalidateTag("projects", "max");
      return { success: true };
    }
    return { success: false, error: "Invalid field" };
  }
  const { error } = await s.from("projects").update({ [field]: value }).eq("id", id);
  if (error) return { success: false, error: error.message };
  revalidatePath("/dashboard/portfolio");
  revalidatePath("/dashboard");
  revalidatePath("/");
  revalidateTag("projects", "max");
  return { success: true };
}

export async function deleteProject(id: string) {
  const s = createAdminClient();
  const { data: project, error: fetchError } = await s.from("projects").select("*").eq("id", id).single();
  if (fetchError || !project) return { success: false, error: "Project not found" };
  const result = await softDelete("project", id, project.title, project as unknown as Record<string, unknown>);
  if (!result.success) return result;
  revalidatePath("/dashboard/portfolio");
  revalidatePath("/dashboard");
  revalidatePath("/");
  revalidateTag("projects", "max");
  logActivity("delete", "project", id, project.title);
  return { success: true };
}

export async function duplicateProject(id: string) {
  const s = createAdminClient();
  const { data: original, error: fetchError } = await s.from("projects").select("*").eq("id", id).single();
  if (fetchError || !original) return { success: false, error: "Project not found" };

  const { count } = await s.from("projects").select("*", { count: "exact", head: true });

  const row = {
    title: `${original.title} (Copy)`,
    img: original.img,
    tags: original.tags,
    description: original.description,
    role: original.role,
    year: original.year,
    stack: original.stack,
    live: original.live,
    overlay_tag: original.overlay_tag,
    overlay_name: original.overlay_name,
    category: original.category,
    status: original.status,
    featured: false,
    sort_order: count || 0,
  };

  const { error } = await s.from("projects").insert(row);
  if (error) return { success: false, error: error.message };
  revalidatePath("/dashboard/portfolio");
  revalidatePath("/dashboard");
  revalidatePath("/");
  revalidateTag("projects", "max");
  return { success: true };
}

export async function reorderProjects(ids: string[]) {
  const s = createAdminClient();
  const updates = ids.map((id, i) =>
    s.from("projects").update({ sort_order: i }).eq("id", id)
  );
  await Promise.all(updates);
  revalidatePath("/dashboard/portfolio");
  revalidatePath("/dashboard");
  revalidatePath("/");
  revalidateTag("projects", "max");
  return { success: true };
}
