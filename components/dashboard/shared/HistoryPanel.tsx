"use client";

import { useState, useEffect, useCallback } from "react";
import { getVersions, restoreVersion } from "@/lib/actions/versions";
import { relativeTime } from "@/lib/utils/time";
import type { DbVersion } from "@/types/supabase";
import { useToast } from "@/components/dashboard/shared/ToastProvider";
import CompareVersions from "./CompareVersions";

interface Props {
  entityType: string;
  entityId: string;
  currentSnapshot: Record<string, unknown>;
  onRestore?: (snapshot: Record<string, unknown>) => void;
  /** When true, Restore only loads the snapshot into the editor (no DB write). User must Save to publish. */
  localOnly?: boolean;
}

export default function HistoryPanel({ entityType, entityId, currentSnapshot, onRestore, localOnly }: Props) {
  const { toast } = useToast();
  const [versions, setVersions] = useState<DbVersion[]>([]);
  const [loading] = useState(true);
  const [restoring, setRestoring] = useState<string | null>(null);
  const [compareWith, setCompareWith] = useState<DbVersion | null>(null);
  const [expanded, setExpanded] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await getVersions(entityType, entityId);
      setVersions(data);
    } catch {
      setVersions([]);
    }
  }, [entityType, entityId]);

  useEffect(() => { const id = requestAnimationFrame(() => { load(); }); return () => cancelAnimationFrame(id); }, [load]);

  const handleRestore = async (ver: DbVersion) => {
    setRestoring(ver.id);
    try {
      if (localOnly) {
        if (onRestore && ver.snapshot) onRestore(ver.snapshot as Record<string, unknown>);
        toast("Snapshot loaded into editor — click Save to publish");
        setRestoring(null);
        return;
      }
      const res = await restoreVersion(ver.id);
      if (res.success) {
        toast(`Restored to v${ver.version_number}`);
        if (onRestore && res.snapshot) onRestore(res.snapshot);
        load();
      } else {
        toast(res.error || "Restore failed", "error");
      }
    } catch {
      toast("Restore failed", "error");
    } finally {
      setRestoring(null);
    }
  };

  if (compareWith) {
    return (
      <CompareVersions
        oldVersion={compareWith}
        currentSnapshot={currentSnapshot}
        onClose={() => setCompareWith(null)}
      />
    );
  }

  return (
    <div className="dash-card" style={{ padding: "1rem", marginBottom: "1rem" }}>
      <div onClick={() => setExpanded(!expanded)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}>
        <div style={{ display: "flex", alignItems: "center", gap: ".5rem" }}>
          <i className="bi bi-clock-history" style={{ color: "var(--accent)", fontSize: ".85rem" }} />
          <span style={{ fontFamily: "'Space Mono',monospace", fontSize: ".7rem", letterSpacing: ".06em", textTransform: "uppercase" }}>Version History</span>
          <span style={{ fontFamily: "'Space Mono',monospace", fontSize: ".6rem", color: "var(--text-muted)", padding: ".1rem .4rem", background: "var(--bg-input)", borderRadius: 4 }}>{versions.length}</span>
        </div>
        <i className={`bi bi-chevron-${expanded ? "up" : "down"}`} style={{ fontSize: ".7rem", color: "var(--text-muted)" }} />
      </div>

      {expanded && (
        <div style={{ marginTop: ".75rem" }}>
          {loading && <div style={{ padding: "1rem", textAlign: "center", color: "var(--text-muted)", fontSize: ".7rem" }}>Loading versions...</div>}
          {!loading && versions.length === 0 && (
            <div style={{ padding: "1rem", textAlign: "center", color: "var(--text-muted)", fontFamily: "'Space Mono',monospace", fontSize: ".7rem" }}>
              No versions yet. Versions are created automatically on save.
            </div>
          )}
          {versions.map((ver) => (
            <div key={ver.id} style={{ display: "flex", alignItems: "center", gap: ".6rem", padding: ".5rem .4rem", borderBottom: "1px solid var(--border)" }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--bg-input)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: "1px solid var(--border)" }}>
                <span style={{ fontFamily: "'Space Mono',monospace", fontSize: ".55rem", fontWeight: 700, color: "var(--accent)" }}>v{ver.version_number}</span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: ".8rem" }}>{ver.summary || `Version ${ver.version_number}`}</div>
                <div style={{ fontFamily: "'Space Mono',monospace", fontSize: ".55rem", color: "var(--text-muted)" }}>
                  {relativeTime(ver.created_at)} by {ver.created_by || "system"}
                </div>
              </div>
              <button onClick={() => setCompareWith(ver)} className="dash-btn dash-btn-sm" style={{ fontSize: ".55rem" }} title="Compare">
                <i className="bi bi-arrow-left-right" />
              </button>
              <button onClick={() => handleRestore(ver)} disabled={restoring === ver.id} className="dash-btn dash-btn-sm dash-btn-add" style={{ fontSize: ".55rem" }} title="Restore">
                {restoring === ver.id ? "..." : <><i className="bi bi-arrow-counterclockwise" /> Restore</>}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
