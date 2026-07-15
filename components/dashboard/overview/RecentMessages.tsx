import { getCachedMessages } from "@/lib/supabase/cached";
import { dbToMessage } from "@/lib/supabase/messages";
import Link from "next/link";

export default async function RecentMessages() {
  let raw: Awaited<ReturnType<typeof getCachedMessages>> = [];

  try {
    raw = await getCachedMessages();
  } catch {}

  const recent = raw.slice(0, 5).map(dbToMessage);

  function statusClass(status: string) {
    switch (status) {
      case "unread": return "s-unread";
      case "read": return "s-read";
      case "replied": return "s-replied";
      default: return "s-archived";
    }
  }

  return (
    <div className="dash-card" style={{ padding: "1.2rem" }}>
      <div className="dash-card-header">
        <div className="dash-card-title">Recent Messages</div>
        <Link href="/dashboard/messages" className="msg-view-btn" style={{ fontSize: ".58rem" }}>
          View All
        </Link>
      </div>
      {recent.length === 0 ? (
        <div style={{
          padding: "2rem 1rem", textAlign: "center",
          color: "var(--text-muted)", fontFamily: "'Space Mono',monospace",
          fontSize: ".75rem", letterSpacing: ".06em",
        }}>
          <i className="bi bi-chat-dots" style={{ fontSize: "1.5rem", display: "block", marginBottom: ".5rem", opacity: .3 }} />
          No messages yet
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: ".5rem" }}>
          {recent.map((m) => (
            <div
              key={m.id}
              style={{
                display: "flex", alignItems: "center", gap: ".75rem",
                padding: ".6rem .75rem", borderRadius: "8px",
                background: m.status === "unread" ? "rgba(0,212,255,.03)" : "transparent",
                transition: "background .2s",
              }}
            >
              {m.status === "unread" && (
                <div style={{
                  width: "6px", height: "6px", borderRadius: "50%",
                  background: "var(--accent2)", flexShrink: 0,
                  boxShadow: "0 0 6px var(--accent2)",
                }} />
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontFamily: "'Outfit',sans-serif", fontSize: ".82rem",
                  fontWeight: m.status === "unread" ? 600 : 400,
                  whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                }}>
                  {m.name}
                </div>
                <div style={{
                  fontFamily: "'Space Mono',monospace", fontSize: ".6rem",
                  color: "var(--text-muted)", letterSpacing: ".04em",
                  whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                }}>
                  {m.subject}
                </div>
              </div>
              <span
                className={`msg-status-badge ${statusClass(m.status)}`}
                style={{ flexShrink: 0 }}
              >
                {m.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
