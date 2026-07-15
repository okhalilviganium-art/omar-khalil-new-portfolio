import { Suspense } from "react";
import { getProjectsRaw } from "@/lib/actions/projects";
import PortfolioList from "@/components/dashboard/portfolio/PortfolioList";
import PortfolioLoading from "./loading";

export const dynamic = "force-dynamic";

export const metadata = { title: "Portfolio — Dashboard" };

export default async function PortfolioPage() {
  const projects = await getProjectsRaw();
  return (
    <Suspense fallback={<PortfolioLoading />}>
      <PortfolioList projects={projects} />
    </Suspense>
  );
}
