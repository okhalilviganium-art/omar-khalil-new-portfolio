import { getProjectsRaw } from "@/lib/actions/portfolio";
import Link from "next/link";

export default async function LatestProjects() {
  let projects: Awaited<ReturnType<typeof getProjectsRaw>> = [];

  try {
    projects = await getProjectsRaw();
  } catch {}

  const latest = projects.slice(0, 4);

  return (
    <div className="dash-card" style={{ padding: "1.2rem" }}>
      <div className="dash-card-header">
        <div className="dash-card-title">Latest Projects</div>

        <Link
          href="/dashboard/portfolio"
          className="msg-view-btn"
          style={{ fontSize: ".58rem" }}
        >
          View All
        </Link>
      </div>

      {latest.length === 0 ? (
        <div
          style={{
            padding: "2rem 1rem",
            textAlign: "center",
            color: "var(--text-muted)",
            fontFamily: "'Space Mono', monospace",
            fontSize: ".75rem",
            letterSpacing: ".06em",
          }}
        >
          <i
            className="bi bi-folder"
            style={{
              fontSize: "1.5rem",
              display: "block",
              marginBottom: ".5rem",
              opacity: 0.3,
            }}
          />
          No projects yet
        </div>
      ) : (
        <div className="dash-project-list">
          {latest.map((p) => (
            <div key={p.id} className="dash-project-card">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.img || "/images/placeholder.jpg"}
                alt={p.title}
                className="dash-project-thumb"
              />

              <div className="dash-project-info">
                <h4
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: ".5rem",
                  }}
                >
                  {p.title}

                  {p.featured && (
                    <span
                      style={{
                        fontFamily: "'Space Mono', monospace",
                        fontSize: ".5rem",
                        letterSpacing: ".08em",
                        padding: ".15rem .5rem",
                        borderRadius: "100px",
                        background: "rgba(108,99,255,.15)",
                        color: "var(--accent)",
                        border: "1px solid rgba(108,99,255,.25)",
                        textTransform: "uppercase",
                        fontWeight: 400,
                      }}
                    >
                      Featured
                    </span>
                  )}
                </h4>

                <p>{p.short_description || p.description}</p>
              </div>

              <Link
                href="/dashboard/portfolio"
                className="msg-view-btn"
                style={{
                  flexShrink: 0,
                  fontSize: ".55rem",
                }}
              >
                Edit
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}