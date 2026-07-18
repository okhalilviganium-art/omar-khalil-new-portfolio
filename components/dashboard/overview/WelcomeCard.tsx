import { getUser } from "@/lib/supabase/auth";
import { formatDashboardDate, formatDashboardTime } from "@/lib/utils/time";

export default async function WelcomeCard() {
  const user = await getUser();
  const email = user?.email ?? "Admin";
  const now = new Date();
  const hour = now.getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const dateStr = formatDashboardDate(now);
  const timeStr = formatDashboardTime(now);

  return (
    <div className="dash-card" style={{ padding: "1.5rem" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <div style={{
            fontFamily: "'Bebas Neue',sans-serif",
            fontSize: "1.6rem",
            letterSpacing: ".06em",
            marginBottom: ".25rem",
          }}>
            {greeting}, {email.split("@")[0]}
          </div>
          <div style={{
            fontFamily: "'Space Mono',monospace",
            fontSize: ".7rem",
            letterSpacing: ".06em",
            color: "var(--text-muted)",
          }}>
            Here&apos;s what&apos;s happening with your portfolio today.
          </div>
        </div>
        <div style={{
          fontFamily: "'Space Mono',monospace",
          fontSize: ".65rem",
          letterSpacing: ".06em",
          color: "var(--accent2)",
          textAlign: "right",
          lineHeight: 1.6,
        }}>
          <div>{dateStr}</div>
          <div style={{ color: "var(--text-muted)" }}>{timeStr}</div>
        </div>
      </div>
    </div>
  );
}
