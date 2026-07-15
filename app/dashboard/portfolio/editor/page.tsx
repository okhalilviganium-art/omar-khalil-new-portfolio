import { redirect } from "next/navigation";
import { getProjectById } from "@/lib/actions/projects";
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

  const serialized = {
    id: project.id,
    title: project.title,
    img: project.img,
    tags: project.tags,
    description: project.description,
    role: project.role,
    year: project.year,
    stack: project.stack,
    live: project.live,
    overlay_tag: project.overlay_tag,
    overlay_name: project.overlay_name,
    gallery_images: project.gallery_images,
    featured: project.featured,
    github_url: project.github_url,
    slug: project.slug || "",
    category: project.category || "",
    client: project.client || "",
    published: project.published !== false,
    gallery_media_ids: typeof project.gallery_media_ids === "string"
      ? project.gallery_media_ids
      : JSON.stringify(project.gallery_media_ids || []),
    cover_media_id: project.cover_media_id || "",
    video_media_id: project.video_media_id || "",
    seo_title: project.seo_title || "",
    seo_description: project.seo_description || "",
    technologies: project.technologies || "",
    services_text: project.services_text || "",
    publish_status: project.publish_status || "draft",
  };

  return <ProjectEditor project={serialized} />;
}
