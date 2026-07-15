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
  let gallery: string[] = [];
  try { gallery = JSON.parse(row.gallery_images || "[]"); } catch {}
  let galleryMediaIds: string[] = [];
  try {
    if (Array.isArray(row.gallery_media_ids)) galleryMediaIds = row.gallery_media_ids;
    else if (typeof row.gallery_media_ids === "string") galleryMediaIds = JSON.parse(row.gallery_media_ids || "[]");
  } catch {}
  return {
    id: row.id, title: row.title, img: row.img, tags: row.tags, desc: row.description,
    role: row.role, year: row.year, stack: row.stack, live: row.live,
    overlayTag: row.overlay_tag, overlayName: row.overlay_name,
    galleryImages: gallery, featured: row.featured, githubUrl: row.github_url,
    slug: row.slug || "", category: row.category || "", client: row.client || "",
    published: row.published !== false, galleryMediaIds, coverMediaId: row.cover_media_id || "",
    videoMediaId: row.video_media_id || "", seoTitle: row.seo_title || "",
    seoDescription: row.seo_description || "", technologies: row.technologies || "",
    servicesText: row.services_text || "",
    publishStatus: row.publish_status || "published",
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

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function createProject(formData: FormData) {
  const s = createAdminClient();
  const title = formData.get("title") as string || "Untitled";
  const slug = formData.get("slug") as string || slugify(title);
  const row = {
    title,
    slug,
    img: formData.get("img") as string || "",
    tags: formData.get("tags") as string || "",
    description: formData.get("description") as string || "",
    role: formData.get("role") as string || "",
    year: formData.get("year") as string || new Date().getFullYear().toString(),
    stack: formData.get("stack") as string || "",
    live: formData.get("live") as string || "#",
    overlay_tag: formData.get("overlay_tag") as string || "",
    overlay_name: formData.get("overlay_name") as string || "",
    gallery_images: formData.get("gallery_images") as string || "[]",
    featured: formData.get("featured") === "true",
    github_url: formData.get("github_url") as string || "",
    category: formData.get("category") as string || "",
    client: formData.get("client") as string || "",
    published: formData.get("published") !== "false",
    cover_media_id: formData.get("cover_media_id") as string || "",
    video_media_id: formData.get("video_media_id") as string || "",
    seo_title: formData.get("seo_title") as string || "",
    seo_description: formData.get("seo_description") as string || "",
    technologies: formData.get("technologies") as string || "",
    services_text: formData.get("services_text") as string || "",
    publish_status: "draft",
    sort_order: 0,
  };
  const { count } = await s.from("projects").select("*", { count: "exact", head: true });
  row.sort_order = count || 0;
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
  const fields = [
    "title", "slug", "img", "tags", "description", "role", "year", "stack",
    "live", "overlay_tag", "overlay_name", "gallery_images", "github_url",
    "category", "client", "cover_media_id", "video_media_id",
    "seo_title", "seo_description", "technologies", "services_text", "publish_status",
  ];
  for (const f of fields) {
    const val = formData.get(f);
    if (val !== null) updates[f] = val as string;
  }
  const featuredVal = formData.get("featured");
  if (featuredVal !== null) updates.featured = featuredVal === "true";
  const publishedVal = formData.get("published");
  if (publishedVal !== null) updates.published = publishedVal !== "false";
  const galleryMediaIdsVal = formData.get("gallery_media_ids");
  if (galleryMediaIdsVal !== null) {
    try { updates.gallery_media_ids = JSON.parse(galleryMediaIdsVal as string); } catch {
      updates.gallery_media_ids = [];
    }
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
  const allowed = [
    "title", "slug", "category", "client", "published", "featured", "sort_order", "publish_status",
  ];
  if (!allowed.includes(field)) return { success: false, error: "Invalid field" };
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
  const { id: _origId, created_at: _origCreated, ...rest } = original as DbProject;
  rest.title = `${rest.title} (Copy)`;
  rest.slug = `${rest.slug || slugify(rest.title)}-copy`;
  rest.featured = false;
  const { count } = await s.from("projects").select("*", { count: "exact", head: true });
  rest.sort_order = count || 0;
  const { error } = await s.from("projects").insert(rest);
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
