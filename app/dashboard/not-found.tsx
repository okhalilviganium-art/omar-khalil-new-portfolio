import Link from "next/link";

export default function DashboardNotFound() {
  return (
    <div className="dash-content" style={{
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: "1rem",
    }}>
      <div style={{
        fontFamily: "'Bebas Neue',sans-serif", fontSize: "4rem", lineHeight: 1,
        background: "linear-gradient(135deg, var(--accent), var(--accent2))",
        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
      }}>
        404
      </div>
      <div style={{
        color: "var(--text-muted)", fontSize: ".85rem",
        fontFamily: "'Space Mono',monospace", textAlign: "center",
      }}>
        This page doesn&apos;t exist.
      </div>
      <Link href="/dashboard" className="dash-btn dash-btn-add" style={{ marginTop: ".5rem" }}>
        Back to Dashboard
      </Link>
    </div>
  );
}
