const shimmer = {
  background: "linear-gradient(90deg, var(--bg-card) 25%, rgba(108,99,255,.06) 50%, var(--bg-card) 75%)",
  backgroundSize: "200% 100%",
  animation: "overview-shimmer 1.5s infinite",
  borderRadius: "6px",
};

function SkeletonBlock({ w, h, style }: { w?: string; h?: string; style?: React.CSSProperties }) {
  return <div style={{ width: w || "100%", height: h || "14px", ...shimmer, ...style }} />;
}

export default function StatisticsLoading() {
  return (
    <div className="dash-content" style={{ padding: "2rem" }}>
      <div className="dash-section-title" style={{ marginBottom: "1.5rem" }}>Loading statistics...</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="dash-card" style={{ padding: "1.2rem" }}>
            <SkeletonBlock w="60px" h="32px" style={{ marginBottom: ".5rem" }} />
            <SkeletonBlock w="100px" h="10px" />
          </div>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {[1, 2, 3].map((i) => (
          <div key={i} className="dash-card" style={{ padding: "1rem" }}>
            <SkeletonBlock w="160px" h="12px" style={{ marginBottom: ".5rem" }} />
            <SkeletonBlock h="8px" style={{ borderRadius: "4px" }} />
          </div>
        ))}
      </div>
    </div>
  );
}
