"use client";

import { useState, useEffect, useCallback } from "react";
import { getNotifications, markAsRead, markAllAsRead, getUnreadCount, deleteNotification, clearNotifications } from "@/lib/actions/notifications";
import { relativeTime } from "@/lib/utils/time";
import type { DbNotification } from "@/types/supabase";
import { useOverlay } from "@/components/dashboard/shared/OverlayProvider";

export default function NotificationCenter() {
  const { unreadCount, setUnreadCount } = useOverlay();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<DbNotification[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [notifs, count] = await Promise.all([getNotifications(30), getUnreadCount()]);
      setNotifications(notifs);
      setUnreadCount(count);
    } catch {}
    setLoading(false);
  }, [setUnreadCount]);

  useEffect(() => { const id = requestAnimationFrame(() => { refresh(); }); return () => cancelAnimationFrame(id); }, [refresh]);

  const handleMarkRead = async (id: string) => {
    try { await markAsRead(id); } catch { return; }
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const handleMarkAllRead = async () => {
    try { await markAllAsRead(); } catch { return; }
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const handleDelete = async (id: string) => {
    try { await deleteNotification(id); } catch { return; }
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    if (!notifications.find((n) => n.id === id)?.read) setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const handleClearAll = async () => {
    try { await clearNotifications(); } catch { return; }
    setNotifications([]);
    setUnreadCount(0);
  };

  return (
    <div style={{ position: "relative" }}>
      <button onClick={() => setOpen(!open)} aria-label="Notifications" className="dash-btn dash-btn-sm" style={{ position: "relative" }}>
        <i className="bi bi-bell" />
        {unreadCount > 0 && (
          <span style={{ position: "absolute", top: -4, right: -4, width: 16, height: 16, borderRadius: "50%", background: "var(--accent, #6c63ff)", color: "#fff", fontSize: ".5rem", fontFamily: "'Space Mono',monospace", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div style={{ position: "fixed", inset: 0, zIndex: 9998 }} onClick={() => setOpen(false)} />
          <div style={{ position: "absolute", top: "100%", right: 0, marginTop: 8, width: 360, maxHeight: 480, background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden", zIndex: 9999, boxShadow: "0 12px 40px rgba(0,0,0,.4)" }}>
            <div style={{ padding: ".6rem .75rem", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontFamily: "'Space Mono',monospace", fontSize: ".65rem", letterSpacing: ".06em", textTransform: "uppercase", color: "var(--text-muted)" }}>Notifications</span>
              <div style={{ display: "flex", gap: ".25rem" }}>
                {unreadCount > 0 && <button onClick={handleMarkAllRead} className="dash-btn dash-btn-sm" style={{ fontSize: ".55rem" }}>Mark all read</button>}
                {notifications.length > 0 && <button onClick={handleClearAll} className="dash-btn dash-btn-sm" style={{ fontSize: ".55rem" }}>Clear all</button>}
              </div>
            </div>
            <div style={{ maxHeight: 420, overflow: "auto" }}>
              {loading && <div style={{ padding: "1.5rem", textAlign: "center", color: "var(--text-muted)", fontSize: ".75rem" }}>Loading...</div>}
              {!loading && notifications.length === 0 && (
                <div style={{ padding: "2rem", textAlign: "center", color: "var(--text-muted)", fontFamily: "'Space Mono',monospace", fontSize: ".7rem" }}>
                  <i className="bi bi-bell-slash" style={{ fontSize: "1.5rem", display: "block", marginBottom: ".5rem", opacity: .3 }} />
                  No notifications
                </div>
              )}
              {notifications.map((n) => (
                <div key={n.id} onClick={() => !n.read && handleMarkRead(n.id)}
                  style={{ padding: ".6rem .75rem", borderBottom: "1px solid var(--border)", cursor: "pointer", background: n.read ? "transparent" : "rgba(108,99,255,.04)", display: "flex", gap: ".6rem", alignItems: "flex-start" }}>
                  {!n.read && <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent, #6c63ff)", flexShrink: 0, marginTop: 5 }} />}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: ".8rem", fontWeight: n.read ? 400 : 600 }}>{n.title}</div>
                    {n.message && <div style={{ fontFamily: "'Space Mono',monospace", fontSize: ".6rem", color: "var(--text-muted)", marginTop: ".1rem" }}>{n.message}</div>}
                    <div style={{ fontFamily: "'Space Mono',monospace", fontSize: ".5rem", color: "var(--text-muted)", marginTop: ".15rem" }}>{relativeTime(n.created_at)}</div>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); handleDelete(n.id); }} aria-label="Delete notification" style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: ".6rem", padding: 2 }}>
                    <i className="bi bi-x" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
