import { Suspense } from "react";
import { getSiteSettings } from "@/lib/actions/site-settings";
import HeroEditor from "@/components/dashboard/hero/HeroEditor";
import HeroLoading from "./loading";

export const dynamic = "force-dynamic";

export const metadata = { title: "Hero — Dashboard" };

export default async function HeroPage() {
  const siteSettings = await getSiteSettings();

  return (
    <Suspense fallback={<HeroLoading />}>
      <HeroEditor siteSettings={siteSettings} />
    </Suspense>
  );
}
