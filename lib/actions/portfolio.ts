"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { logActivity } from "./activity";
import { softDelete } from "./recycle-bin";
import { createVersion, shouldCreateVersion } from "./versions";
import {
  getProjectsFull,
  getFeaturedProjects as getFeatured,
  getDbProjectsRaw,
  createDbProject,
  updateDbProject,
  setProjectCategories,
  setProjectTechTags,
  replaceGallery,
  replaceLinks,
  getAllCategories,
  getAllTechTags,
  ensureCategory,
  ensureTechTag,
  slugify,
} from "@/lib/supabase/portfolio";
import type { DbProject } from "@/types/supabase";

function revalidatePortfolio() {
  revalidatePath("/dashboard/portfolio");
  revalidatePath("/dashboard");
  revalidatePath("/");
  revalidateTag("projects", "max");
}

export async function getProjects() {
  return getProjectsFull();
}

export async function getProjectsRaw(): Promise<DbProject[]> {
  return getDbProjectsRaw();
}

export async function getProjectById(id: string) {
  const projects = await getProjectsFull();
  return projects.find((p) => p.id === id) || null;
}

export async function getFeaturedProjects(limit = 6) {
  return getFeatured(limit);
}

export async function getAllPublishedProjects() {
  const all = await getProjectsFull();
  return all
    .filter((p) => p.published)
    .sort((a, b) => {
      const orderDiff = a.orderIndex - b.orderIndex;
      if (orderDiff !== 0) return orderDiff;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
}

export async function getProjectBySlug(slug: string) {
  const projects = await getProjectsFull();
  const project = projects.find((p) => p.slug === slug && p.published);
  if (!project) return null;
  const idx = projects.filter((p) => p.published).findIndex((p) => p.id === project.id);
  const published = projects.filter((p) => p.published);
  const prev = idx > 0 ? published[idx - 1] : published[published.length - 1];
  const next = idx < published.length - 1 ? published[idx + 1] : published[0];
  return {
    project,
    prevProject: prev ? { slug: prev.slug, title: prev.title } : null,
    nextProject: next ? { slug: next.slug, title: next.title } : null,
  };
}

export async function getRelatedProjects(currentId: string, limit = 3) {
  const all = await getProjectsFull();
  return all
    .filter((p) => p.published && p.id !== currentId && p.featured)
    .slice(0, limit);
}

export async function getAllProjectCategories() {
  return getAllCategories();
}

export async function getAllProjectTechTags() {
  return getAllTechTags();
}

export async function createProject(formData: FormData) {
  const s = createAdminClient();
  const title = (formData.get("title") as string) || "Untitled";
  const status = (formData.get("status") as string) || "published";
  const featured = formData.get("featured") === "true";
  const slug = (formData.get("slug") as string) || slugify(title);
  const year = (formData.get("year") as string) || new Date().getFullYear().toString();

  const { count } = await s
    .from("projects")
    .select("*", { count: "exact", head: true });

  const row = {
    title,
    slug,
    short_description: (formData.get("short_description") as string) || "",
    full_description: (formData.get("full_description") as string) || "",
    client: (formData.get("client") as string) || "",
    year,
    role: (formData.get("role") as string) || "",
    img: (formData.get("img") as string) || "",
    tags: (formData.get("tags") as string) || "",
    stack: (formData.get("stack") as string) || "",
    live: (formData.get("live") as string) || "",
    description: (formData.get("full_description") as string) || "",
    overlay_tag: (formData.get("tags") as string)?.split(",").slice(0, 2).join(" · ") || "",
    overlay_name: title,
    category: (formData.get("category") as string) || "",
    status: status,
    featured,
    sort_order: count || 0,
    thumbnail_media_id: (formData.get("thumbnail_media_id") as string) || "",
    cover_image_media_id: (formData.get("cover_image_media_id") as string) || "",
  };

  const result = await createDbProject(row);
  if (!result.success || !result.id) return result;

  const id = result.id;

  const catIdsRaw = formData.get("category_ids") as string;
  if (catIdsRaw) {
    const catIds = JSON.parse(catIdsRaw) as string[];
    await setProjectCategories(id, catIds);
  }

  const tagIdsRaw = formData.get("tech_tag_ids") as string;
  if (tagIdsRaw) {
    const tagIds = JSON.parse(tagIdsRaw) as string[];
    await setProjectTechTags(id, tagIds);
  }

  const galleryRaw = formData.get("gallery") as string;
  if (galleryRaw) {
    const gallery = JSON.parse(galleryRaw);
    await replaceGallery(id, gallery);
  }

  const linksRaw = formData.get("links") as string;
  if (linksRaw) {
    const links = JSON.parse(linksRaw);
    await replaceLinks(id, links);
  }

  revalidatePortfolio();
  logActivity("create", "project", id, title);
  createVersion("project", id, { ...row, id }, "Project created");
  return { success: true, id };
}

export async function updateProject(id: string, formData: FormData) {
  const updates: Record<string, unknown> = {};

  const stringFields = [
    "title", "slug", "short_description", "full_description",
    "client", "year", "role", "img", "tags", "stack", "live",
    "overlay_tag", "overlay_name", "category", "status",
    "thumbnail_media_id", "cover_image_media_id",
  ];
  for (const f of stringFields) {
    const val = formData.get(f);
    if (val !== null) updates[f] = val as string;
  }

  const desc = formData.get("full_description");
  if (desc !== null) updates.description = desc as string;

  const featuredVal = formData.get("featured");
  if (featuredVal !== null) updates.featured = featuredVal === "true";

  const sortVal = formData.get("sort_order");
  if (sortVal !== null) updates.sort_order = parseInt(sortVal as string, 10) || 0;

  if (Object.keys(updates).length > 0) {
    const result = await updateDbProject(id, updates);
    if (!result.success) return result;
  }

  const catIdsRaw = formData.get("category_ids");
  if (catIdsRaw) {
    const catIds = JSON.parse(catIdsRaw as string) as string[];
    await setProjectCategories(id, catIds);
  }

  const tagIdsRaw = formData.get("tech_tag_ids");
  if (tagIdsRaw) {
    const tagIds = JSON.parse(tagIdsRaw as string) as string[];
    await setProjectTechTags(id, tagIds);
  }

  const galleryRaw = formData.get("gallery");
  if (galleryRaw) {
    const gallery = JSON.parse(galleryRaw as string);
    await replaceGallery(id, gallery);
  }

  const linksRaw = formData.get("links");
  if (linksRaw) {
    const links = JSON.parse(linksRaw as string);
    await replaceLinks(id, links);
  }

  revalidatePortfolio();
  logActivity("update", "project", id, updates.title as string);

  const s = createAdminClient();
  const { data: snap } = await s
    .from("projects")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (snap) {
    shouldCreateVersion("project", id, snap).then((should) => {
      if (should)
        createVersion(
          "project",
          id,
          snap,
          updates.title ? `Updated: ${updates.title}` : "Project updated"
        );
    });
  }

  return { success: true };
}

export async function updateProjectField(
  id: string,
  field: string,
  value: unknown
) {
  const s = createAdminClient();
  const allowed = ["title", "category", "sort_order", "featured", "status"];

  if (!allowed.includes(field)) {
    return { success: false, error: "Invalid field" };
  }

  const { error } = await s
    .from("projects")
    .update({ [field]: value, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { success: false, error: error.message };
  revalidatePortfolio();
  return { success: true };
}

export async function deleteProject(id: string) {
  const s = createAdminClient();
  const { data: project, error: fetchError } = await s
    .from("projects")
    .select("*")
    .eq("id", id)
    .single();
  if (fetchError || !project)
    return { success: false, error: "Project not found" };

  const result = await softDelete(
    "project",
    id,
    project.title,
    project as unknown as Record<string, unknown>
  );
  if (!result.success) return result;

  revalidatePortfolio();
  logActivity("delete", "project", id, project.title);
  return { success: true };
}

export async function duplicateProject(id: string) {
  const s = createAdminClient();
  const { data: original, error: fetchError } = await s
    .from("projects")
    .select("*")
    .eq("id", id)
    .single();
  if (fetchError || !original)
    return { success: false, error: "Project not found" };

  const { count } = await s
    .from("projects")
    .select("*", { count: "exact", head: true });

  const row = {
    title: `${original.title} (Copy)`,
    slug: `${original.slug}-copy-${Date.now()}`,
    img: original.img,
    tags: original.tags,
    description: original.description,
    short_description: original.short_description || "",
    full_description: original.full_description || original.description || "",
    client: original.client || "",
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
    thumbnail_media_id: original.thumbnail_media_id || "",
    cover_image_media_id: original.cover_image_media_id || "",
  };

  const { data: newProj, error } = await s
    .from("projects")
    .insert(row)
    .select("id")
    .single();
  if (error) return { success: false, error: error.message };

  const newId = newProj.id;

  const [catRows, tagRows, galRows, linkRows] = await Promise.all([
    s.from("project_categories").select("category_id").eq("project_id", id),
    s.from("project_tech_tags").select("tag_id").eq("project_id", id),
    s.from("project_gallery").select("*").eq("project_id", id).order("sort_order"),
    s.from("project_links").select("*").eq("project_id", id).order("sort_order"),
  ]);

  if (catRows.data && catRows.data.length > 0) {
    await s.from("project_categories").insert(
      catRows.data.map((r) => ({ project_id: newId, category_id: r.category_id }))
    );
  }
  if (tagRows.data && tagRows.data.length > 0) {
    await s.from("project_tech_tags").insert(
      tagRows.data.map((r) => ({ project_id: newId, tag_id: r.tag_id }))
    );
  }
  if (galRows.data && galRows.data.length > 0) {
    await s.from("project_gallery").insert(
      galRows.data.map((g) => ({
        project_id: newId,
        media_type: g.media_type,
        media_id: g.media_id,
        url: g.url,
        caption: g.caption,
        sort_order: g.sort_order,
      }))
    );
  }
  if (linkRows.data && linkRows.data.length > 0) {
    await s.from("project_links").insert(
      linkRows.data.map((l) => ({
        project_id: newId,
        title: l.title,
        url: l.url,
        sort_order: l.sort_order,
      }))
    );
  }

  revalidatePortfolio();
  return { success: true };
}

export async function reorderProjects(ids: string[]) {
  const s = createAdminClient();
  const updates = ids.map((id, i) =>
    s.from("projects").update({ sort_order: i, updated_at: new Date().toISOString() }).eq("id", id)
  );
  await Promise.all(updates);
  revalidatePortfolio();
  return { success: true };
}

export { ensureCategory, ensureTechTag, slugify };
