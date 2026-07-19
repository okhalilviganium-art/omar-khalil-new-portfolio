export default function CategoriesLoading() {
  return (
    <div className="dash-content" style={{ padding: "2rem" }}>
      <div className="dash-section-title" style={{ marginBottom: "1.5rem" }}>Loading categories...</div>
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="dash-card" style={{ marginBottom: ".75rem", opacity: 0.4 }}>
          <div style={{ height: "48px", background: "var(--bg-card)", borderRadius: "8px" }} />
        </div>
      ))}
    </div>
  );
}
