"use client";

import { useState, useEffect, useCallback } from "react";
import { getRecycleBin, restoreFromBin, permanentDelete, permanentDeleteAll, cleanupExpired } from "@/lib/actions/recycle-bin";
import type { DbRecycleBin } from "@/types/supabase";
import { useToast } from "@/components/dashboard/shared/ToastProvider";

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function daysUntilExpiry(expiresAt: string | null): string {
  if (!expiresAt) return "Never";
  const diff = new Date(expiresAt).getTime() - Date.now();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  if (days <= 0) return "Expired";
  if (days === 1) return "1 day";
  return `${days} days`;
}

function entityIcon(type: string): string {
  switch (type) {
    case "project": return "bi-folder";
    case "service": return "bi-lightning";
    case "media": return "bi-collection";
    case "settings": return "bi-gear";
    default: return "bi-file-earmark";
  }
}

export default function RecycleBinContent() {
  const { toast } = useToast();
  const [items, setItems] = useState<DbRecycleBin[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try { const data = await getRecycleBin(); setItems(data); } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const handleRestore = async (item: DbRecycleBin) => {
    setActionId(item.id);
    try {
      const res = await restoreFromBin(item.id);
      if (res.success) {
        toast(`Restored ${item.entity_type}`);
        refresh();
      } else {
        toast(res.error || "Restore failed", "error");
      }
    } catch {
      toast("Restore failed", "error");
    } finally {
      setActionId(null);
    }
  };

  const handlePermanentDelete = async (item: DbRecycleBin) => {
    if (!confirm(`Permanently delete "${item.entity_title || item.entity_type}"? This cannot be undone.`)) return;
    setActionId(item.id);
    try {
      const res = await permanentDelete(item.id);
      if (res.success) {
        toast("Permanently deleted");
        refresh();
      } else {
        toast(res.error || "Delete failed", "error");
      }
    } catch {
      toast("Delete failed", "error");
    } finally {
      setActionId(null);
    }
  };

  const handleEmptyAll = async () => {
    if (!confirm("Permanently delete ALL items in the Recycle Bin? This cannot be undone.")) return;
    try {
      const res = await permanentDeleteAll();
      if (res.success) {
        toast("Recycle Bin emptied");
        refresh();
      }
    } catch {
      toast("Failed to empty recycle bin", "error");
    }
  };

  const handleCleanup = async () => {
    try {
      const res = await cleanupExpired();
      if (res.deleted > 0) {
        toast(`Cleaned up ${res.deleted} expired items`);
        refresh();
      } else {
        toast("No expired items to clean up");
      }
    } catch {
      toast("Cleanup failed", "error");
    }
  };

  return (
    <div className="dash-content" style={{ padding: "2rem" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
        <div>
          <div className="dash-section-title" style={{ margin: 0, border: 0, padding: 0, marginBottom: ".25rem" }}>Recycle Bin</div>
          <div style={{ fontFamily: "'Space Mono',monospace", fontSize: ".65rem", color: "var(--text-muted)" }}>
            {items.length} item{items.length !== 1 ? "s" : ""} &middot; Auto-deleted after 30 days
          </div>
        </div>
        <div style={{ display: "flex", gap: ".35rem" }}>
          {items.length > 0 && (
            <>
              <button onClick={handleCleanup} className="dash-btn dash-btn-sm" style={{ fontSize: ".65rem" }}>
                <i className="bi bi-broom" /> Clean Expired
              </button>
              <button onClick={handleEmptyAll} className="dash-btn dash-btn-danger dash-btn-sm" style={{ fontSize: ".65rem" }}>
                <i className="bi bi-trash" /> Empty All
              </button>
            </>
          )}
        </div>
      </div>

      {loading && (
        <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)", fontFamily: "'Space Mono',monospace", fontSize: ".75rem" }}>Loading...</div>
      )}

      {!loading && items.length === 0 && (
        <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>
          <i className="bi bi-trash" style={{ fontSize: "2rem", display: "block", marginBottom: ".5rem", opacity: .3 }} />
          <div style={{ fontFamily: "'Space Mono',monospace", fontSize: ".75rem" }}>Recycle Bin is empty</div>
          <div style={{ fontFamily: "'Space Mono',monospace", fontSize: ".6rem", marginTop: ".25rem" }}>Deleted items will appear here</div>
        </div>
      )}

      {!loading && items.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: ".5rem" }}>
          {items.map((item) => (
            <div key={item.id} style={{
              display: "flex", alignItems: "center", gap: ".75rem", padding: ".75rem 1rem",
              background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 8,
            }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--bg-input)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: "1px solid var(--border)" }}>
                <i className={`bi ${entityIcon(item.entity_type)}`} style={{ fontSize: ".85rem", color: "var(--text-muted)" }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: ".85rem", fontWeight: 500 }}>
                  {item.entity_title || "Untitled"}
                </div>
                <div style={{ fontFamily: "'Space Mono',monospace", fontSize: ".55rem", color: "var(--text-muted)", display: "flex", gap: ".75rem", flexWrap: "wrap" }}>
                  <span style={{ textTransform: "capitalize" }}>{item.entity_type}</span>
                  <span>Deleted {relativeTime(item.deleted_at)}</span>
                  <span>Expires in {daysUntilExpiry(item.expires_at)}</span>
                  {item.deleted_by && <span>by {item.deleted_by}</span>}
                </div>
              </div>
              <div style={{ display: "flex", gap: ".3rem", flexShrink: 0 }}>
                <button onClick={() => handleRestore(item)} disabled={actionId === item.id} className="dash-btn dash-btn-sm dash-btn-add" style={{ fontSize: ".6rem" }}>
                  <i className="bi bi-arrow-counterclockwise" /> Restore
                </button>
                <button onClick={() => handlePermanentDelete(item)} disabled={actionId === item.id} className="dash-btn dash-btn-danger dash-btn-sm" style={{ fontSize: ".6rem" }}>
                  <i className="bi bi-x-lg" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
