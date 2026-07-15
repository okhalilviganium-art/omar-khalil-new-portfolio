import {
  WelcomeSkeleton,
  StatCardsSkeleton,
  RecentMessagesSkeleton,
  LatestProjectsSkeleton,
  StorageSkeleton,
} from "@/components/dashboard/overview/OverviewSkeleton";

export default function DashboardLoading() {
  return (
    <div className="dash-content" style={{ padding: "2rem" }}>
      <div className="dash-section-title" style={{ border: 0, padding: 0, marginBottom: ".5rem" }}>
        Overview
      </div>
      <p style={{
        color: "var(--text-muted)", fontSize: ".85rem",
        fontFamily: "'Space Mono',monospace", marginBottom: "2rem",
      }}>
        Loading dashboard...
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        <WelcomeSkeleton />
        <StatCardsSkeleton />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
          <RecentMessagesSkeleton />
          <LatestProjectsSkeleton />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: "1.5rem" }}>
          <StorageSkeleton />
          <div className="dash-card" style={{ padding: "1.2rem" }}>
            <div style={{
              fontFamily: "'Bebas Neue',sans-serif", fontSize: "1rem",
              letterSpacing: ".06em", color: "var(--text-muted)",
              marginBottom: "1rem", paddingBottom: ".5rem",
              borderBottom: "1px solid rgba(255,255,255,.04)",
            }}>
              Quick Actions
            </div>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} style={{
                height: "40px", borderRadius: "8px", marginBottom: ".5rem",
                background: "linear-gradient(90deg, var(--bg-card) 25%, rgba(108,99,255,.06) 50%, var(--bg-card) 75%)",
                backgroundSize: "200% 100%",
                animation: "overview-shimmer 1.5s infinite",
              }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
