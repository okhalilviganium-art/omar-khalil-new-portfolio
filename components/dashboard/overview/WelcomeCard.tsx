import { getUser } from "@/lib/supabase/auth";

export default async function WelcomeCard() {
  const user = await getUser();
  const email = user?.email ?? "Admin";
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const timeStr = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

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
