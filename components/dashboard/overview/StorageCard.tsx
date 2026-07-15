import { getStorageStats } from "@/lib/supabase/storage";

export default async function StorageCard() {
  let fileCount = 0;
  let totalBytes = 0;

  try {
    const stats = await getStorageStats();
    fileCount = stats.fileCount;
    totalBytes = stats.totalBytes;
  } catch {}

  const totalMB = totalBytes / (1024 * 1024);
  const maxMB = 1024;
  const pct = Math.min((totalMB / maxMB) * 100, 100);

  return (
    <div className="dash-card" style={{ padding: "1.2rem" }}>
      <div className="dash-card-header">
        <div className="dash-card-title">Storage</div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: ".75rem" }}>
        <div>
          <div style={{
            fontFamily: "'Bebas Neue',sans-serif",
            fontSize: "1.8rem", lineHeight: 1,
          }}>
            {totalMB.toFixed(2)} MB
          </div>
          <div style={{
            fontFamily: "'Space Mono',monospace",
            fontSize: ".6rem", letterSpacing: ".1em",
            textTransform: "uppercase", color: "var(--text-muted)",
          }}>
            of {maxMB} MB used
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{
            fontFamily: "'Bebas Neue',sans-serif",
            fontSize: "1.4rem", lineHeight: 1,
          }}>
            {fileCount}
          </div>
          <div style={{
            fontFamily: "'Space Mono',monospace",
            fontSize: ".6rem", letterSpacing: ".1em",
            textTransform: "uppercase", color: "var(--text-muted)",
          }}>
            files
          </div>
        </div>
      </div>
      <div style={{
        width: "100%", height: "6px", borderRadius: "3px",
        background: "var(--bg-input)", overflow: "hidden",
      }}>
        <div style={{
          width: `${pct}%`, height: "100%", borderRadius: "3px",
          background: pct > 80
            ? "linear-gradient(90deg, var(--danger), var(--accent3))"
            : "linear-gradient(90deg, var(--accent), var(--accent2))",
          transition: "width .4s ease",
        }} />
      </div>
      <div style={{
        display: "flex", justifyContent: "space-between",
        marginTop: ".4rem",
        fontFamily: "'Space Mono',monospace",
        fontSize: ".55rem", color: "var(--text-muted)",
        letterSpacing: ".06em",
      }}>
        <span>{pct.toFixed(1)}% used</span>
        <span>{(maxMB - totalMB).toFixed(2)} MB free</span>
      </div>
    </div>
  );
}
