const shimmer = {
  background: "linear-gradient(90deg, var(--bg-card) 25%, rgba(108,99,255,.06) 50%, var(--bg-card) 75%)",
  backgroundSize: "200% 100%",
  animation: "overview-shimmer 1.5s infinite",
  borderRadius: "6px",
};

function SkeletonBlock({ w, h, style }: { w?: string; h?: string; style?: React.CSSProperties }) {
  return (
    <div style={{
      width: w || "100%", height: h || "14px",
      ...shimmer, ...style,
    }} />
  );
}

export function WelcomeSkeleton() {
  return (
    <div className="dash-card" style={{ padding: "1.5rem" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ flex: 1 }}>
          <SkeletonBlock w="280px" h="24px" style={{ marginBottom: ".5rem" }} />
          <SkeletonBlock w="380px" h="12px" />
        </div>
        <SkeletonBlock w="140px" h="36px" style={{ flexShrink: 0 }} />
      </div>
    </div>
  );
}

export function StatCardsSkeleton() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))", gap: "1rem" }}>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="dash-card" style={{ padding: "1.2rem" }}>
          <SkeletonBlock w="40px" h="32px" style={{ marginBottom: ".5rem" }} />
          <SkeletonBlock w="70px" h="10px" />
        </div>
      ))}
    </div>
  );
}

export function RecentMessagesSkeleton() {
  return (
    <div className="dash-card" style={{ padding: "1.2rem" }}>
      <div className="dash-card-header">
        <SkeletonBlock w="140px" h="16px" />
        <SkeletonBlock w="70px" h="12px" />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: ".5rem" }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: ".75rem", padding: ".6rem 0" }}>
            <SkeletonBlock w="6px" h="6px" style={{ borderRadius: "50%", flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <SkeletonBlock w="120px" h="12px" style={{ marginBottom: ".3rem" }} />
              <SkeletonBlock w="200px" h="10px" />
            </div>
            <SkeletonBlock w="60px" h="20px" style={{ borderRadius: "100px", flexShrink: 0 }} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function LatestProjectsSkeleton() {
  return (
    <div className="dash-card" style={{ padding: "1.2rem" }}>
      <div className="dash-card-header">
        <SkeletonBlock w="140px" h="16px" />
        <SkeletonBlock w="70px" h="12px" />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: ".75rem" }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <SkeletonBlock w="80px" h="60px" style={{ borderRadius: "6px", flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <SkeletonBlock w="150px" h="14px" style={{ marginBottom: ".3rem" }} />
              <SkeletonBlock w="100%" h="10px" />
            </div>
            <SkeletonBlock w="45px" h="24px" style={{ borderRadius: "6px", flexShrink: 0 }} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function StorageSkeleton() {
  return (
    <div className="dash-card" style={{ padding: "1.2rem" }}>
      <div className="dash-card-header">
        <SkeletonBlock w="80px" h="16px" />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: ".75rem" }}>
        <div>
          <SkeletonBlock w="90px" h="28px" style={{ marginBottom: ".4rem" }} />
          <SkeletonBlock w="80px" h="10px" />
        </div>
        <div>
          <SkeletonBlock w="50px" h="22px" style={{ marginBottom: ".4rem" }} />
          <SkeletonBlock w="40px" h="10px" />
        </div>
      </div>
      <SkeletonBlock h="6px" style={{ borderRadius: "3px" }} />
    </div>
  );
}
