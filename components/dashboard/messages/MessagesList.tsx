"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/components/dashboard/shared/ToastProvider";
import { markAsRead, markAsUnread, archiveMessage, restoreMessage, deleteMessage } from "@/lib/actions/messages";
import { useMessagesRealtime } from "./useMessagesRealtime";
import type { Message } from "@/lib/supabase/messages";

function relativeDate(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return mins + "m ago";
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return hrs + "h ago";
  const days = Math.floor(hrs / 24);
  if (days < 7) return days + "d ago";
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function MessagesList({ messages: initial }: { messages: Message[] }) {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [drawer, setDrawer] = useState<Message | null>(null);
  const [mounted, setMounted] = useState(false);
  const { toast } = useToast();

  const messages = useMessagesRealtime(initial, {
    onInsert: () => toast("New message received."),
  });

  useEffect(() => {
    if (!drawer) return;
    const updated = messages.find((m) => m.id === drawer.id);
    if (updated) setDrawer(updated);
    else setDrawer(null);
  }, [messages, drawer]);

  useEffect(() => { setMounted(true); }, []);

  const filtered = messages.filter((m) => {
    if (filter !== "all" && m.status !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q) || m.subject.toLowerCase().includes(q) || m.message.toLowerCase().includes(q);
    }
    return true;
  });

  const counts = {
    total: messages.length,
    unread: messages.filter((m) => m.status === "unread").length,
    read: messages.filter((m) => m.status === "read").length,
    replied: messages.filter((m) => m.status === "replied").length,
    archived: messages.filter((m) => m.status === "archived").length,
  };

  const handleMarkRead = async (id: string) => {
    try {
      const res = await markAsRead(id);
      if (res.success) { toast("Marked as read"); setDrawer(null); }
      else toast(res.error || "Failed", "error");
    } catch { toast("Failed", "error"); }
  };

  const handleMarkUnread = async (id: string) => {
    try {
      const res = await markAsUnread(id);
      if (res.success) { toast("Marked as unread"); setDrawer(null); }
      else toast(res.error || "Failed", "error");
    } catch { toast("Failed", "error"); }
  };

  const handleArchive = async (id: string) => {
    try {
      const res = await archiveMessage(id);
      if (res.success) { toast("Archived"); setDrawer(null); }
      else toast(res.error || "Failed", "error");
    } catch { toast("Failed", "error"); }
  };

  const handleRestore = async (id: string) => {
    try {
      const res = await restoreMessage(id);
      if (res.success) { toast("Restored to inbox"); setDrawer(null); }
      else toast(res.error || "Failed", "error");
    } catch { toast("Failed", "error"); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete message?")) return;
    try {
      const res = await deleteMessage(id);
      if (res.success) { toast("Deleted"); setDrawer(null); }
      else toast(res.error || "Failed", "error");
    } catch { toast("Failed", "error"); }
  };

  return (
    <div className="dash-content" style={{ padding: "2rem" }}>
      <div className="msg-stats">
        {[
          { label: "Total", count: counts.total, cls: "sc-total", icon: "bi-envelope" },
          { label: "Unread", count: counts.unread, cls: "sc-unread", icon: "bi-envelope-unread" },
          { label: "Replied", count: counts.replied, cls: "sc-replied", icon: "bi-reply" },
          { label: "Archived", count: counts.archived, cls: "sc-archived", icon: "bi-archive" },
        ].map((s) => (
          <div key={s.label} className={`msg-stat-card ${s.cls}`}>
            <div className="msg-stat-icon"><i className={`bi ${s.icon}`} /></div>
            <div className="msg-stat-num">{s.count}</div>
            <div className="msg-stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="msg-filter-bar">
        {["all", "unread", "read", "replied", "archived"].map((f) => (
          <button key={f} className={`msg-filter-btn${filter === f ? " active" : ""}`} onClick={() => setFilter(f)}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
        <input className="msg-search" placeholder="Search messages..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {filtered.length > 0 ? (
        <div className="msg-table-wrap">
          <table className="msg-table">
            <thead>
              <tr><th>Status</th><th>Name</th><th>Email</th><th>Subject</th><th>Date</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.map((m) => (
                <tr key={m.id} className={m.status === "unread" ? "msg-unread" : ""} onClick={() => setDrawer(m)}>
                  <td>
                    <span className={`msg-status-badge s-${m.status}`}>
                      {m.status === "unread" && <span className="msg-unread-dot" />}
                      {m.status}
                    </span>
                  </td>
                  <td>{m.status === "unread" ? <strong>{m.name}</strong> : m.name}</td>
                  <td className="msg-email-cell">{m.email}</td>
                  <td className="msg-preview-cell">{m.subject.length > 60 ? m.subject.substring(0, 60) + "..." : m.subject}</td>
                  <td className="msg-date-cell">{mounted ? relativeDate(m.date) : new Date(m.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</td>
                  <td>
                    <button className="msg-view-btn" onClick={(e) => { e.stopPropagation(); setDrawer(m); }}>
                      <i className="bi bi-eye" /> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="msg-empty"><i className="bi bi-inbox" /><p>No messages match your filter</p></div>
      )}

      <div className={`msg-drawer-overlay${drawer ? " open" : ""}`} onClick={() => setDrawer(null)} />
      <div className={`msg-drawer${drawer ? " open" : ""}`}>
        <div className="msg-drawer-header">
          <h3 className="msg-drawer-title">Message Details</h3>
          <button className="msg-drawer-close" onClick={() => setDrawer(null)}><i className="bi bi-x-lg" /></button>
        </div>
        {drawer && (
          <div className="msg-drawer-body">
            <div className="msg-drawer-meta">
              <div className="msg-drawer-meta-item">
                <div className="msg-drawer-meta-label">From</div>
                <div className="msg-drawer-meta-val">{drawer.name}</div>
              </div>
              <div className="msg-drawer-meta-item">
                <div className="msg-drawer-meta-label">Email</div>
                <div className="msg-drawer-meta-val email-link"><a href={`mailto:${drawer.email}`}>{drawer.email}</a></div>
              </div>
              <div className="msg-drawer-meta-item">
                <div className="msg-drawer-meta-label">Date</div>
                <div className="msg-drawer-meta-val">{new Date(drawer.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}</div>
              </div>
              <div className="msg-drawer-meta-item">
                <div className="msg-drawer-meta-label">Status</div>
                <div className="msg-drawer-meta-val"><span className={`msg-status-badge s-${drawer.status}`}>{drawer.status}</span></div>
              </div>
            </div>
            <div className="msg-drawer-meta-item" style={{ marginBottom: "1.5rem" }}>
              <div className="msg-drawer-meta-label">Subject</div>
              <div className="msg-drawer-meta-val" style={{ fontSize: "1.05rem", fontWeight: 600 }}>{drawer.subject}</div>
            </div>
            <div className="msg-drawer-message">{drawer.message}</div>
            <div className="msg-drawer-actions">
              {drawer.status === "unread" ? (
                <button className="dash-btn dash-btn-add dash-btn-sm" onClick={() => handleMarkRead(drawer.id)}><i className="bi bi-envelope-open" /> Mark Read</button>
              ) : (
                <button className="dash-btn dash-btn-add dash-btn-sm" onClick={() => handleMarkUnread(drawer.id)}><i className="bi bi-envelope" /> Mark Unread</button>
              )}
              <button className="dash-btn dash-btn-add dash-btn-sm" onClick={() => { window.location.href = `mailto:${drawer.email}?subject=Re: ${encodeURIComponent(drawer.subject)}`; handleMarkRead(drawer.id); }}><i className="bi bi-reply" /> Reply</button>
              {drawer.status === "archived" ? (
                <button className="dash-btn dash-btn-add dash-btn-sm" onClick={() => handleRestore(drawer.id)}><i className="bi bi-arrow-counterclockwise" /> Restore</button>
              ) : (
                <button className="dash-btn dash-btn-add dash-btn-sm" onClick={() => handleArchive(drawer.id)}><i className="bi bi-archive" /> Archive</button>
              )}
              <button className="dash-btn dash-btn-danger dash-btn-sm" onClick={() => handleDelete(drawer.id)}><i className="bi bi-trash" /> Delete</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
