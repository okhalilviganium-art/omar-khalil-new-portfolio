import { Suspense } from "react";
import WelcomeCard from "@/components/dashboard/overview/WelcomeCard";
import StatCards from "@/components/dashboard/overview/StatCards";
import RecentMessages from "@/components/dashboard/overview/RecentMessages";
import LatestProjects from "@/components/dashboard/overview/LatestProjects";
import StorageCard from "@/components/dashboard/overview/StorageCard";
import QuickActions from "@/components/dashboard/overview/QuickActions";
import ActivityTimeline from "@/components/dashboard/overview/ActivityTimeline";
import RecentItems from "@/components/dashboard/shared/RecentItems";
import FavoritesPanel from "@/components/dashboard/shared/FavoritesPanel";
import {
  WelcomeSkeleton,
  StatCardsSkeleton,
  RecentMessagesSkeleton,
  LatestProjectsSkeleton,
  StorageSkeleton,
} from "@/components/dashboard/overview/OverviewSkeleton";

export const dynamic = "force-dynamic";

export const metadata = { title: "Dashboard" };

export default function DashboardPage() {
  return (
    <div className="dash-content" style={{ padding: "2rem" }}>
      <div className="dash-section-title" style={{ border: 0, padding: 0, marginBottom: ".5rem" }}>
        Overview
      </div>
      <p style={{
        color: "var(--text-muted)", fontSize: ".85rem",
        fontFamily: "'Space Mono',monospace", marginBottom: "2rem",
      }}>
        Manage your portfolio site content
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        <Suspense fallback={<WelcomeSkeleton />}>
          <WelcomeCard />
        </Suspense>

        <Suspense fallback={<StatCardsSkeleton />}>
          <StatCards />
        </Suspense>

        <div className="dash-grid-2" style={{ gap: "1.5rem", alignItems: "start" }}>
          <Suspense fallback={<RecentMessagesSkeleton />}>
            <RecentMessages />
          </Suspense>
          <Suspense fallback={<LatestProjectsSkeleton />}>
            <LatestProjects />
          </Suspense>
        </div>

        <div className="dash-overview-sidebar" style={{ gap: "1.5rem", alignItems: "start" }}>
          <Suspense fallback={<StorageSkeleton />}>
            <StorageCard />
          </Suspense>
          <QuickActions />
        </div>

        <div className="dash-overview-triple" style={{ gap: "1.5rem", alignItems: "start" }}>
          <ActivityTimeline limit={15} />
          <RecentItems />
          <FavoritesPanel />
        </div>
      </div>
    </div>
  );
}
