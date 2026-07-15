import { getCachedProjects } from "@/lib/supabase/cached";
import { getCachedServices } from "@/lib/supabase/cached";
import { getCachedMessages } from "@/lib/supabase/cached";
import { getStorageStats } from "@/lib/supabase/storage";

export default async function StatCards() {
  let projectCount = 0;
  let serviceCount = 0;
  let messageCount = 0;
  let unreadCount = 0;
  let fileCount = 0;
  let storageMB = "0.00";

  try {
    const [projects, services, messages, storage] = await Promise.all([
      getCachedProjects().catch(() => []),
      getCachedServices().catch(() => []),
      getCachedMessages().catch(() => []),
      getStorageStats().catch(() => ({ fileCount: 0, totalBytes: 0 })),
    ]);
    projectCount = projects.length;
    serviceCount = services.length;
    messageCount = messages.length;
    unreadCount = messages.filter((m) => m.status === "unread").length;
    fileCount = storage.fileCount;
    storageMB = (storage.totalBytes / (1024 * 1024)).toFixed(2);
  } catch {}

  const cards = [
    { label: "Projects", value: projectCount, icon: "bi-folder", color: "var(--accent)" },
    { label: "Services", value: serviceCount, icon: "bi-lightning", color: "var(--accent3)" },
    { label: "Messages", value: messageCount, icon: "bi-chat-dots", color: "var(--accent2)" },
    { label: "Unread", value: unreadCount, icon: "bi-envelope", color: unreadCount > 0 ? "var(--accent2)" : "var(--text-muted)" },
    { label: "Media Files", value: fileCount, icon: "bi-collection", color: "var(--success)" },
    { label: "Storage", value: `${storageMB} MB`, icon: "bi-hdd", color: "var(--accent3)" },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))", gap: "1rem" }}>
      {cards.map((c) => (
        <div key={c.label} className="dash-card" style={{ padding: "1.2rem", position: "relative", overflow: "hidden" }}>
          <div style={{
            position: "absolute", top: ".8rem", right: ".8rem",
            width: "32px", height: "32px", borderRadius: "8px",
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "rgba(108,99,255,.1)", border: "1px solid rgba(108,99,255,.15)",
          }}>
            <i className={`bi ${c.icon}`} style={{ fontSize: ".85rem", color: c.color }} />
          </div>
          <div style={{
            fontFamily: "'Bebas Neue',sans-serif",
            fontSize: "2rem", lineHeight: 1, marginBottom: ".25rem",
          }}>
            {c.value}
          </div>
          <div style={{
            fontFamily: "'Space Mono',monospace",
            fontSize: ".6rem", letterSpacing: ".1em", textTransform: "uppercase",
            color: "var(--text-muted)",
          }}>
            {c.label}
          </div>
        </div>
      ))}
    </div>
  );
}
