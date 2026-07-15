const shimmer = {
  background: "linear-gradient(90deg, var(--bg-card) 25%, rgba(108,99,255,.06) 50%, var(--bg-card) 75%)",
  backgroundSize: "200% 100%",
  animation: "overview-shimmer 1.5s infinite",
  borderRadius: "6px",
};

function SkeletonBlock({ w, h, style }: { w?: string; h?: string; style?: React.CSSProperties }) {
  return <div style={{ width: w || "100%", height: h || "14px", ...shimmer, ...style }} />;
}

export default function AboutLoading() {
  return (
    <div className="dash-content" style={{ padding: "2rem" }}>
      <div className="dash-section-title" style={{ marginBottom: "1.5rem" }}>Loading about...</div>
      <div className="dash-card" style={{ padding: "1.5rem" }}>
        <div style={{ display: "flex", gap: "2rem" }}>
          <SkeletonBlock w="240px" h="280px" style={{ borderRadius: "10px", flexShrink: 0 }} />
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "1rem" }}>
            <SkeletonBlock w="120px" h="12px" />
            <SkeletonBlock w="260px" h="24px" />
            <SkeletonBlock h="60px" />
            <div style={{ display: "flex", gap: ".5rem" }}>
              <SkeletonBlock w="80px" h="28px" style={{ borderRadius: "100px" }} />
              <SkeletonBlock w="100px" h="28px" style={{ borderRadius: "100px" }} />
              <SkeletonBlock w="90px" h="28px" style={{ borderRadius: "100px" }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
