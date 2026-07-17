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
  const status = row.status || "published";
  return {
    id: row.id, title: row.title, slug: row.slug || "", img: row.img, tags: row.tags,
    desc: row.description, shortDescription: row.short_description || "",
    fullDescription: row.full_description || row.description || "",
    role: row.role, year: row.year, stack: row.stack, live: row.live,
    overlayTag: row.overlay_tag, overlayName: row.overlay_name,
    featured: row.featured, category: row.category || "",
    categories: [], published: status !== "draft", status,
    client: row.client || "", thumbnailMediaId: row.thumbnail_media_id || "",
    coverImageMediaId: row.cover_image_media_id || "",
    gallery: [], links: [], techStack: [],
    orderIndex: row.sort_order || 0, createdAt: row.created_at || "",
    updatedAt: row.updated_at || null,
  };
}

function projectToDb(p: Project) {
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
    category: p.category || "",
    status: p.status || (p.published !== false ? "published" : "draft"),
    featured: p.featured || false,
    sort_order: 0,
  };
}
