import Link from "next/link";

const actions = [
  {
    label: "Add Project",
    icon: "bi-folder-plus",
    href: "/dashboard/portfolio",
    color: "var(--accent)",
  },
  {
    label: "Upload Media",
    icon: "bi-cloud-upload",
    href: "/dashboard/media",
    color: "var(--accent2)",
  },
  {
    label: "Add Service",
    icon: "bi-plus-circle",
    href: "/dashboard/services",
    color: "var(--accent3)",
  },
];

export default function QuickActions() {
  return (
    <div className="dash-card" style={{ padding: "1.2rem" }}>
      <div className="dash-card-header">
        <div className="dash-card-title">Quick Actions</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: ".5rem" }}>
        {actions.map((a) => (
          <Link
            key={a.label}
            href={a.href}
            style={{
              display: "flex", alignItems: "center", gap: ".75rem",
              padding: ".7rem 1rem", borderRadius: "8px",
              background: "var(--bg-input)", border: "1px solid var(--border)",
              textDecoration: "none", color: "var(--text)",
              transition: "border-color .25s, background .25s",
            }}
          >
            <i className={`bi ${a.icon}`} style={{ fontSize: "1rem", color: a.color }} />
            <span style={{
              fontFamily: "'Space Mono',monospace",
              fontSize: ".7rem", letterSpacing: ".06em",
            }}>
              {a.label}
            </span>
            <i className="bi bi-arrow-right" style={{
              marginLeft: "auto", fontSize: ".7rem",
              color: "var(--text-muted)",
            }} />
          </Link>
        ))}
      </div>
    </div>
  );
}
