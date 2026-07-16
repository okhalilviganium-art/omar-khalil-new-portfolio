import type { Metadata } from "next";
import { Suspense } from "react";
import { getAllPublishedProjects } from "@/lib/actions/portfolio";
import WorkClient from "./WorkClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Selected Works — Omar Khalil",
  description: "A curated collection of branding, motion, web, AI and creative projects by Omar Khalil.",
  openGraph: {
    title: "Selected Works — Omar Khalil",
    description: "A curated collection of branding, motion, web, AI and creative projects.",
    type: "website",
  },
};

export default async function WorkPage() {
  const projects = await getAllPublishedProjects();

  return (
    <Suspense>
      <WorkClient projects={projects} />
    </Suspense>
  );
}
