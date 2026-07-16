import { createAdminClient } from "./admin";
import type {
  DbProject,
  DbCategory,
  DbTechTag,
  DbProjectGalleryItem,
  DbProjectLink,
} from "@/types/supabase";
import type {
  Project,
  ProjectCategory,
  ProjectTechTag,
  ProjectGalleryItem,
  ProjectLink,
} from "@/types";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function mapCategory(c: DbCategory): ProjectCategory {
  return { id: c.id, name: c.name, slug: c.slug };
}

function mapTechTag(t: DbTechTag): ProjectTechTag {
  return { id: t.id, name: t.name, slug: t.slug };
}

function mapGalleryItem(g: DbProjectGalleryItem): ProjectGalleryItem {
  return {
    id: g.id,
    projectId: g.project_id,
    mediaType: g.media_type,
    mediaId: g.media_id,
    url: g.url,
    caption: g.caption,
    orderIndex: g.sort_order,
  };
}

function mapLink(l: DbProjectLink): ProjectLink {
  return {
    id: l.id,
    projectId: l.project_id,
    title: l.title,
    url: l.url,
    orderIndex: l.sort_order,
  };
}

function dbToProject(
  row: DbProject,
  categories: ProjectCategory[] = [],
  techStack: ProjectTechTag[] = [],
  gallery: ProjectGalleryItem[] = [],
  links: ProjectLink[] = []
): Project {
  const status = row.status || row.publish_status || "published";
  return {
    id: row.id,
    title: row.title,
    slug: row.slug || "",
    img: row.img || "",
    tags: row.tags || "",
    desc: row.description || "",
    shortDescription: row.short_description || "",
    fullDescription: row.full_description || row.description || "",
    role: row.role || "",
    year: row.year || "",
    stack: row.stack || "",
    live: row.live || "",
    overlayTag: row.overlay_tag || "",
    overlayName: row.overlay_name || "",
    category: row.category || "",
    categories,
    featured: row.featured || false,
    published: status !== "draft",
    publishStatus: status,
    client: row.client || "",
    thumbnailMediaId: row.thumbnail_media_id || row.cover_media_id || "",
    coverImageMediaId: row.cover_image_media_id || "",
    gallery,
    links,
    techStack,
    orderIndex: row.sort_order || 0,
    createdAt: row.created_at || "",
    updatedAt: row.updated_at || null,
  };
}

export async function getProjectsFull(): Promise<Project[]> {
  const s = createAdminClient();
  const { data: rows, error } = await s
    .from("projects")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  if (!rows || rows.length === 0) return [];

  const ids = rows.map((r) => r.id);

  const [catRows, tagRows, galRows, linkRows] = await Promise.all([
    s.from("project_categories").select("project_id, category_id, portfolio_categories(id, name, slug)").in("project_id", ids),
    s.from("project_tech_tags").select("project_id, tag_id, portfolio_tech_tags(id, name, slug)").in("project_id", ids),
    s.from("project_gallery").select("*").in("project_id", ids).order("sort_order", { ascending: true }),
    s.from("project_links").select("*").in("project_id", ids).order("sort_order", { ascending: true }),
  ]);

  const catMap = new Map<string, ProjectCategory[]>();
  const tagMap = new Map<string, ProjectTechTag[]>();
  const galMap = new Map<string, ProjectGalleryItem[]>();
  const linkMap = new Map<string, ProjectLink[]>();

  if (catRows.data) {
    for (const row of catRows.data as Record<string, unknown>[]) {
      const pid = row.project_id as string;
      const cat = row.portfolio_categories as { id: string; name: string; slug: string } | null;
      if (cat) {
        if (!catMap.has(pid)) catMap.set(pid, []);
        catMap.get(pid)!.push(mapCategory(cat as unknown as DbCategory));
      }
    }
  }

  if (tagRows.data) {
    for (const row of tagRows.data as Record<string, unknown>[]) {
      const pid = row.project_id as string;
      const tag = row.portfolio_tech_tags as { id: string; name: string; slug: string } | null;
      if (tag) {
        if (!tagMap.has(pid)) tagMap.set(pid, []);
        tagMap.get(pid)!.push(mapTechTag(tag as unknown as DbTechTag));
      }
    }
  }

  if (galRows.data) {
    for (const g of galRows.data as DbProjectGalleryItem[]) {
      if (!galMap.has(g.project_id)) galMap.set(g.project_id, []);
      galMap.get(g.project_id)!.push(mapGalleryItem(g));
    }
  }

  if (linkRows.data) {
    for (const l of linkRows.data as DbProjectLink[]) {
      if (!linkMap.has(l.project_id)) linkMap.set(l.project_id, []);
      linkMap.get(l.project_id)!.push(mapLink(l));
    }
  }

  return rows.map((row) =>
    dbToProject(
      row as DbProject,
      catMap.get(row.id) || [],
      tagMap.get(row.id) || [],
      galMap.get(row.id) || [],
      linkMap.get(row.id) || []
    )
  );
}

export async function getFeaturedProjects(limit = 6): Promise<Project[]> {
  const all = await getProjectsFull();
  return all
    .filter((p) => p.featured && p.published)
    .sort((a, b) => a.orderIndex - b.orderIndex)
    .slice(0, limit);
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  const s = createAdminClient();
  const { data: row, error } = await s
    .from("projects")
    .select("*")
    .eq("slug", slug)
    .single();
  if (error || !row) return null;
  const projects = await getProjectsFull();
  return projects.find((p) => p.id === row.id) || null;
}

export async function getProjectById(id: string): Promise<Project | null> {
  const projects = await getProjectsFull();
  return projects.find((p) => p.id === id) || null;
}

export async function getAllCategories(): Promise<DbCategory[]> {
  const s = createAdminClient();
  const { data, error } = await s
    .from("portfolio_categories")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data as DbCategory[]) || [];
}

export async function getAllTechTags(): Promise<DbTechTag[]> {
  const s = createAdminClient();
  const { data, error } = await s
    .from("portfolio_tech_tags")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data as DbTechTag[]) || [];
}

export async function getDbProjectsRaw(): Promise<DbProject[]> {
  const s = createAdminClient();
  const { data, error } = await s
    .from("projects")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data as DbProject[]) || [];
}

export async function getDbProjectById(id: string): Promise<DbProject | null> {
  const s = createAdminClient();
  const { data, error } = await s
    .from("projects")
    .select("*")
    .eq("id", id)
    .single();
  if (error || !data) return null;
  return data as DbProject;
}

export async function createDbProject(row: Record<string, unknown>) {
  const s = createAdminClient();
  const { data, error } = await s
    .from("projects")
    .insert(row)
    .select("id")
    .single();
  if (error) return { success: false, error: error.message };
  return { success: true, id: data?.id as string };
}

export async function updateDbProject(id: string, updates: Record<string, unknown>) {
  const s = createAdminClient();
  updates.updated_at = new Date().toISOString();
  const { error } = await s.from("projects").update(updates).eq("id", id);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function setProjectCategories(projectId: string, categoryIds: string[]) {
  const s = createAdminClient();
  await s.from("project_categories").delete().eq("project_id", projectId);
  if (categoryIds.length > 0) {
    const rows = categoryIds.map((cid) => ({ project_id: projectId, category_id: cid }));
    const { error } = await s.from("project_categories").insert(rows);
    if (error) return { success: false, error: error.message };
  }
  return { success: true };
}

export async function setProjectTechTags(projectId: string, tagIds: string[]) {
  const s = createAdminClient();
  await s.from("project_tech_tags").delete().eq("project_id", projectId);
  if (tagIds.length > 0) {
    const rows = tagIds.map((tid) => ({ project_id: projectId, tag_id: tid }));
    const { error } = await s.from("project_tech_tags").insert(rows);
    if (error) return { success: false, error: error.message };
  }
  return { success: true };
}

export async function replaceGallery(projectId: string, items: { media_type: string; media_id: string; url: string; caption: string; sort_order: number }[]) {
  const s = createAdminClient();
  await s.from("project_gallery").delete().eq("project_id", projectId);
  if (items.length > 0) {
    const rows = items.map((item) => ({ ...item, project_id: projectId }));
    const { error } = await s.from("project_gallery").insert(rows);
    if (error) return { success: false, error: error.message };
  }
  return { success: true };
}

export async function replaceLinks(projectId: string, items: { title: string; url: string; sort_order: number }[]) {
  const s = createAdminClient();
  await s.from("project_links").delete().eq("project_id", projectId);
  if (items.length > 0) {
    const rows = items.map((item) => ({ ...item, project_id: projectId }));
    const { error } = await s.from("project_links").insert(rows);
    if (error) return { success: false, error: error.message };
  }
  return { success: true };
}

export async function ensureCategory(name: string): Promise<string> {
  const s = createAdminClient();
  const slug = slugify(name);
  const { data: existing } = await s
    .from("portfolio_categories")
    .select("id")
    .eq("slug", slug)
    .single();
  if (existing) return existing.id;
  const { data } = await s
    .from("portfolio_categories")
    .insert({ name, slug })
    .select("id")
    .single();
  return data?.id || "";
}

export async function ensureTechTag(name: string): Promise<string> {
  const s = createAdminClient();
  const slug = slugify(name);
  const { data: existing } = await s
    .from("portfolio_tech_tags")
    .select("id")
    .eq("slug", slug)
    .single();
  if (existing) return existing.id;
  const { data } = await s
    .from("portfolio_tech_tags")
    .insert({ name, slug })
    .select("id")
    .single();
  return data?.id || "";
}

export { slugify };
