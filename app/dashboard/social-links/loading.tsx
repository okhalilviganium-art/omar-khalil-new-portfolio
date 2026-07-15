const shimmer = {
  background: "linear-gradient(90deg, var(--bg-card) 25%, rgba(108,99,255,.06) 50%, var(--bg-card) 75%)",
  backgroundSize: "200% 100%",
  animation: "overview-shimmer 1.5s infinite",
  borderRadius: "6px",
};

function SkeletonBlock({ w, h, style }: { w?: string; h?: string; style?: React.CSSProperties }) {
  return <div style={{ width: w || "100%", height: h || "14px", ...shimmer, ...style }} />;
}

export default function SocialLinksLoading() {
  return (
    <div className="dash-content" style={{ padding: "2rem" }}>
      <div className="dash-section-title" style={{ marginBottom: "1.5rem" }}>Loading social links...</div>
      <div style={{ display: "flex", flexDirection: "column", gap: ".75rem" }}>
        {[1, 2, 3].map((i) => (
          <div key={i} style={{
            display: "flex", alignItems: "center", gap: ".75rem",
            padding: ".8rem", borderRadius: "8px",
            background: "var(--bg-card)", border: "1px solid var(--border)",
          }}>
            <SkeletonBlock w="32px" h="32px" style={{ borderRadius: "6px", flexShrink: 0 }} />
            <SkeletonBlock w="120px" h="14px" style={{ flex: 1 }} />
            <SkeletonBlock w="200px" h="14px" />
            <SkeletonBlock w="60px" h="28px" style={{ borderRadius: "6px", flexShrink: 0 }} />
          </div>
        ))}
      </div>
    </div>
  );
}
