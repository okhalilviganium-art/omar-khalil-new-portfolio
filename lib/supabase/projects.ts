import { createClient } from "./client";
import type { DbProject } from "@/types/supabase";
import type { Project } from "@/types";

export async function getProjects(): Promise<Project[]> {
  const s = createClient();
  const { data, error } = await s
    .from("projects")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data as DbProject[]).map(dbToProject);
}

export async function getProjectsRaw(): Promise<DbProject[]> {
  const s = createClient();
  const { data, error } = await s
    .from("projects")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return data as DbProject[];
}

export async function upsertProject(project: Project): Promise<Project> {
  const s = createClient();
  const row = projectToDb(project);
  const { data, error } = await s
    .from("projects")
    .upsert(row, { onConflict: "id" })
    .select()
    .single();
  if (error) throw error;
  return dbToProject(data as DbProject);
}

export async function deleteProject(id: string): Promise<void> {
  const s = createClient();
  const { error } = await s.from("projects").delete().eq("id", id);
  if (error) throw error;
}

export async function syncProjects(projects: Project[]): Promise<void> {
  const s = createClient();
  const rows = projects.map((p, i) => ({ ...projectToDb(p), sort_order: i }));
  const { error } = await s
    .from("projects")
    .upsert(rows, { onConflict: "id" });
  if (error) throw error;
  const ids = rows.map((r) => r.id);
  const { error: delErr } = await s
    .from("projects")
    .delete()
    .not("id", "in", `(${ids.join(",")})`);
  if (delErr) throw delErr;
}

function dbToProject(row: DbProject): Project {
  let gallery: string[] = [];
  try { gallery = JSON.parse(row.gallery_images || "[]"); } catch {}
  let galleryMediaIds: string[] = [];
  try {
    if (Array.isArray(row.gallery_media_ids)) galleryMediaIds = row.gallery_media_ids;
    else if (typeof row.gallery_media_ids === "string") galleryMediaIds = JSON.parse(row.gallery_media_ids || "[]");
  } catch {}
  return {
    id: row.id, title: row.title, img: row.img, tags: row.tags,
    desc: row.description, role: row.role, year: row.year, stack: row.stack,
    live: row.live, overlayTag: row.overlay_tag, overlayName: row.overlay_name,
    galleryImages: gallery, featured: row.featured, githubUrl: row.github_url,
    slug: row.slug || "", category: row.category || "", client: row.client || "",
    published: row.published !== false, galleryMediaIds, coverMediaId: row.cover_media_id || "",
    videoMediaId: row.video_media_id || "", seoTitle: row.seo_title || "",
    seoDescription: row.seo_description || "", technologies: row.technologies || "",
    servicesText: row.services_text || "",
    publishStatus: row.publish_status || "published",
  };
}

function projectToDb(p: Project): DbProject {
  return {
    id: p.id,
    title: p.title,
    img: p.img,
    tags: p.tags,
    description: p.desc,
    role: p.role,
    year: p.year,
    stack: p.stack,
    live: p.live,
    overlay_tag: p.overlayTag || "",
    overlay_name: p.overlayName || "",
    gallery_images: JSON.stringify(p.galleryImages || []),
    featured: p.featured || false,
    github_url: p.githubUrl || "",
    sort_order: 0,
    created_at: new Date().toISOString(),
    slug: p.slug || "",
    category: p.category || "",
    client: p.client || "",
    published: p.published !== false,
    gallery_media_ids: p.galleryMediaIds || [],
    cover_media_id: p.coverMediaId || "",
    video_media_id: p.videoMediaId || "",
    seo_title: p.seoTitle || "",
    seo_description: p.seoDescription || "",
    technologies: p.technologies || "",
    services_text: p.servicesText || "",
    publish_status: p.publishStatus || "published",
  };
}
