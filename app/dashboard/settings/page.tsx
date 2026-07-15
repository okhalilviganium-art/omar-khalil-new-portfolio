import { Suspense } from "react";
import { getSiteSettings } from "@/lib/actions/site-settings";
import SettingsPanel from "@/components/dashboard/settings/SettingsPanel";
import SettingsLoading from "./loading";

export const dynamic = "force-dynamic";

export const metadata = { title: "Settings — Dashboard" };

export default async function SettingsPage() {
  const siteSettings = await getSiteSettings();

  return (
    <Suspense fallback={<SettingsLoading />}>
      <SettingsPanel siteSettings={siteSettings} />
    </Suspense>
  );
}
