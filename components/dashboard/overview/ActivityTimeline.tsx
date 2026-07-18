"use client";

import { useState, useEffect } from "react";
import { getActivityLog } from "@/lib/actions/activity";
import { relativeTime } from "@/lib/utils/time";
import type { DbActivityLog } from "@/types/supabase";

function entityIcon(type: string): string {
  switch (type) {
    case "project": return "bi-folder";
    case "media": return "bi-collection";
    case "service": return "bi-lightning";
    case "settings": return "bi-gear";
    case "message": return "bi-chat-dots";
    case "statistic": return "bi-bar-chart";
    case "social_link": return "bi-share";
    default: return "bi-circle";
  }
}

function actionColor(action: string): string {
  if (action.includes("create")) return "var(--accent3, #2dffb3)";
  if (action.includes("update") || action.includes("edit")) return "var(--accent, #6c63ff)";
  if (action.includes("delete")) return "var(--danger, #ff4444)";
  if (action.includes("upload")) return "var(--accent2, #00d4ff)";
  return "var(--text-muted)";
}

interface Props {
  limit?: number;
}

export default function ActivityTimeline({ limit = 20 }: Props) {
  const [activities, setActivities] = useState<DbActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getActivityLog(limit).then((data) => { setActivities(data); setLoading(false); }).catch(() => setLoading(false));
  }, [limit]);

  if (loading) {
    return (
      <div className="dash-card" style={{ padding: "1.2rem" }}>
        <div className="dash-card-header"><div className="dash-card-title">Recent Activity</div></div>
        <div style={{ padding: "1rem", textAlign: "center", color: "var(--text-muted)", fontFamily: "'Space Mono',monospace", fontSize: ".7rem" }}>Loading...</div>
      </div>
    );
  }

  return (
    <div className="dash-card" style={{ padding: "1.2rem" }}>
      <div className="dash-card-header"><div className="dash-card-title">Recent Activity</div></div>
      {activities.length === 0 ? (
        <div style={{ padding: "2rem 1rem", textAlign: "center", color: "var(--text-muted)", fontFamily: "'Space Mono',monospace", fontSize: ".75rem" }}>
          <i className="bi bi-activity" style={{ fontSize: "1.5rem", display: "block", marginBottom: ".5rem", opacity: .3 }} />
          No activity yet
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {activities.map((a, i) => (
            <div key={a.id} style={{ display: "flex", gap: ".75rem", padding: ".5rem 0", position: "relative" }}>
              {i < activities.length - 1 && (
                <div style={{ position: "absolute", left: 11, top: 28, bottom: 0, width: 1, background: "var(--border)" }} />
              )}
              <div style={{ width: 24, height: 24, borderRadius: "50%", background: "var(--bg-input)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: "1px solid var(--border)" }}>
                <i className={`bi ${entityIcon(a.entity_type)}`} style={{ fontSize: ".6rem", color: actionColor(a.action) }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: ".8rem", lineHeight: 1.4 }}>
                  <span style={{ fontWeight: 600, textTransform: "capitalize" }}>{a.action.replace(/_/g, " ")}</span>
                  {" "}
                  <span style={{ color: "var(--text-muted)" }}>{a.entity_type.replace(/_/g, " ")}</span>
                  {a.entity_title && <span style={{ fontWeight: 500 }}> &ldquo;{a.entity_title}&rdquo;</span>}
                </div>
                <div style={{ fontFamily: "'Space Mono',monospace", fontSize: ".55rem", color: "var(--text-muted)", marginTop: ".1rem" }}>
                  {relativeTime(a.created_at)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
