import { loadSiteData } from "@/lib/supabase/load-site";
import HomeClient from "@/components/HomeClient";

export const dynamic = "force-dynamic";

export default async function Page() {
  const data = await loadSiteData();

  return <HomeClient initialData={data} />;
}
