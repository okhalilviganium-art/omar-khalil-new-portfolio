const shimmer = {
  background: "linear-gradient(90deg, var(--bg-card) 25%, rgba(108,99,255,.06) 50%, var(--bg-card) 75%)",
  backgroundSize: "200% 100%",
  animation: "overview-shimmer 1.5s infinite",
  borderRadius: "6px",
};

function SkeletonBlock({ w, h, style }: { w?: string; h?: string; style?: React.CSSProperties }) {
  return <div style={{ width: w || "100%", height: h || "14px", ...shimmer, ...style }} />;
}

export default function MediaLoading() {
  return (
    <div className="dash-content" style={{ padding: "2rem" }}>
      <div className="dash-section-title" style={{ marginBottom: "1.5rem" }}>Loading media...</div>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
        <SkeletonBlock w="300px" h="36px" style={{ borderRadius: "6px" }} />
        <SkeletonBlock w="120px" h="36px" style={{ borderRadius: "6px", marginLeft: "auto" }} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "1rem" }}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="dash-card" style={{ padding: 0, overflow: "hidden" }}>
            <SkeletonBlock h="140px" style={{ borderRadius: 0 }} />
            <div style={{ padding: ".75rem" }}>
              <SkeletonBlock w="80%" h="12px" style={{ marginBottom: ".4rem" }} />
              <SkeletonBlock w="50%" h="10px" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
