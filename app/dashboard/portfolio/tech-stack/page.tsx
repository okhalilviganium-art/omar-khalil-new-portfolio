import { Suspense } from "react";
import { getTechTags } from "@/lib/actions/tech-tags";
import TechTagsList from "@/components/dashboard/portfolio/TechTagsList";
import TechStackLoading from "./loading";

export const dynamic = "force-dynamic";

export const metadata = { title: "Tech Stack — Dashboard" };

export default async function TechStackPage() {
  const tags = await getTechTags();
  return (
    <Suspense fallback={<TechStackLoading />}>
      <TechTagsList items={tags} />
    </Suspense>
  );
}
