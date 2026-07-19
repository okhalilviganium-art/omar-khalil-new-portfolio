import { redirect } from "next/navigation";
import { getProjectById, getAllProjectCategories, getAllProjectTechTags } from "@/lib/actions/portfolio";
import ProjectEditor from "@/components/dashboard/portfolio/ProjectEditor";

export const dynamic = "force-dynamic";

export const metadata = { title: "Edit Project — Dashboard" };

export default async function ProjectEditorPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const params = await searchParams;
  const id = params.id;
  if (!id) redirect("/dashboard/portfolio");

  const project = await getProjectById(id);
  if (!project) redirect("/dashboard/portfolio");

  const [allCategories, allTechTags] = await Promise.all([
    getAllProjectCategories(),
    getAllProjectTechTags(),
  ]);

  const serialized = {
    id: project.id,
    title: project.title,
    slug: project.slug || "",
    shortDescription: project.shortDescription || "",
    fullDescription: project.fullDescription || "",
    client: project.client || "",
    year: project.year || "",
    role: project.role || "",
    img: project.img || "",
    tags: project.tags || "",
    stack: project.stack || "",
    live: project.live || "",
    category: project.category || "",
    categories: project.categories || [],
    techStack: project.techStack || [],
    gallery: project.gallery.map((g) => ({ ...g, thumbnailUrl: g.thumbnailUrl || "" })) || [],
    links: project.links || [],
    featured: project.featured || false,
    published: project.published !== false,
    status: project.status || "published",
    orderIndex: project.orderIndex || 0,
    thumbnailMediaId: project.thumbnailMediaId || "",
    coverImageMediaId: project.coverImageMediaId || "",
  };

  return (
    <ProjectEditor
      project={serialized}
      allCategories={allCategories}
      allTechTags={allTechTags}
    />
  );
}
