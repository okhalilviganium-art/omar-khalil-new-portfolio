"use client";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="dash-content" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: "1rem" }}>
      <div style={{ color: "var(--danger)", fontSize: "1rem", fontFamily: "'Space Mono',monospace" }}>
        Something went wrong
      </div>
      <div style={{ color: "var(--text-muted)", fontSize: ".8rem", maxWidth: "400px", textAlign: "center" }}>
        {error.message}
      </div>
      <button className="dash-btn dash-btn-add" onClick={reset} style={{ marginTop: ".5rem" }}>
        Try again
      </button>
    </div>
  );
}
