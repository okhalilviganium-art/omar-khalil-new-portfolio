import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProjectBySlug, getRelatedProjects } from "@/lib/actions/portfolio";
import ProjectDetailClient from "./ProjectDetailClient";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const result = await getProjectBySlug(slug);
  if (!result) return {};
  const { project } = result;

  const title = `${project.title} — Omar Khalil`;
  const description = project.shortDescription || project.fullDescription?.slice(0, 160) || "";
  const img = project.img || "";
  const url = `/work/${project.slug}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      url,
      images: img ? [{ url: img, width: 1200, height: 630, alt: project.title }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: img ? [img] : [],
    },
    alternates: {
      canonical: url,
    },
  };
}

export default async function ProjectDetailPage({ params }: Props) {
  const { slug } = await params;
  const result = await getProjectBySlug(slug);
  if (!result) notFound();

  const { project, prevProject, nextProject } = result;
  const related = await getRelatedProjects(project.id, 3);

  return (
    <ProjectDetailClient
      project={project}
      prevProject={prevProject}
      nextProject={nextProject}
      relatedProjects={related}
    />
  );
}
