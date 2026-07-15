import { Suspense } from "react";
import { getSocialLinks } from "@/lib/actions/social-links";
import SocialLinksList from "@/components/dashboard/social-links/SocialLinksList";
import SocialLinksLoading from "./loading";

export const dynamic = "force-dynamic";

export const metadata = { title: "Social Links — Dashboard" };

export default async function SocialLinksPage() {
  const socialLinks = await getSocialLinks();
  return (
    <Suspense fallback={<SocialLinksLoading />}>
      <SocialLinksList socialLinks={socialLinks} />
    </Suspense>
  );
}
