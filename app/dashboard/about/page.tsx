import { Suspense } from "react";
import { getSiteSettings } from "@/lib/actions/site-settings";
import AboutEditor from "@/components/dashboard/about/AboutEditor";
import AboutLoading from "./loading";

export const dynamic = "force-dynamic";

export const metadata = { title: "About — Dashboard" };

export default async function AboutPage() {
  const siteSettings = await getSiteSettings();

  return (
    <Suspense fallback={<AboutLoading />}>
      <AboutEditor siteSettings={siteSettings} />
    </Suspense>
  );
}
