"use client";

import { useState, useEffect } from "react";
import { compareSnapshots } from "@/lib/actions/versions";
import type { DbVersion } from "@/types/supabase";

interface Props {
  oldVersion: DbVersion;
  currentSnapshot: Record<string, unknown>;
  onClose: () => void;
}

interface DiffEntry {
  key: string;
  type: "added" | "removed" | "modified" | "unchanged";
  oldValue?: unknown;
  newValue?: unknown;
}

function DiffValue({ value }: { value: unknown }) {
  if (value === null || value === undefined) return <span style={{ color: "var(--text-muted)", fontStyle: "italic" }}>null</span>;
  if (typeof value === "boolean") return <span>{value ? "true" : "false"}</span>;
  if (typeof value === "string" && value.length > 120) {
    return <span style={{ wordBreak: "break-all" }}>{value.slice(0, 120)}...</span>;
  }
  return <span>{String(value)}</span>;
}

export default function CompareVersions({ oldVersion, currentSnapshot, onClose }: Props) {
  const [diffs, setDiffs] = useState<DiffEntry[]>([]);

  useEffect(() => {
    compareSnapshots(oldVersion.snapshot as Record<string, unknown>, currentSnapshot).then(setDiffs).catch(() => setDiffs([]));
  }, [oldVersion, currentSnapshot]);

  const added = diffs.filter((d) => d.type === "added");
  const removed = diffs.filter((d) => d.type === "removed");
  const modified = diffs.filter((d) => d.type === "modified");
  const changes = diffs.filter((d) => d.type !== "unchanged");

  return (
    <div className="dash-card" style={{ padding: "1rem", marginBottom: "1rem" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: ".75rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: ".5rem" }}>
          <i className="bi bi-arrow-left-right" style={{ color: "var(--accent)", fontSize: ".85rem" }} />
          <span style={{ fontFamily: "'Space Mono',monospace", fontSize: ".7rem", letterSpacing: ".06em", textTransform: "uppercase" }}>
            Comparing v{oldVersion.version_number} with Current
          </span>
        </div>
        <button onClick={onClose} className="dash-btn dash-btn-sm" style={{ fontSize: ".6rem" }}>
          <i className="bi bi-x-lg" /> Close
        </button>
      </div>

      <div style={{ display: "flex", gap: ".5rem", marginBottom: ".75rem", flexWrap: "wrap" }}>
        {added.length > 0 && (
          <span style={{ fontFamily: "'Space Mono',monospace", fontSize: ".55rem", padding: ".15rem .5rem", borderRadius: 100, background: "rgba(45,255,179,.1)", color: "#2dffb3", border: "1px solid rgba(45,255,179,.2)" }}>
            {added.length} added
          </span>
        )}
        {removed.length > 0 && (
          <span style={{ fontFamily: "'Space Mono',monospace", fontSize: ".55rem", padding: ".15rem .5rem", borderRadius: 100, background: "rgba(255,68,68,.1)", color: "#ff4444", border: "1px solid rgba(255,68,68,.2)" }}>
            {removed.length} removed
          </span>
        )}
        {modified.length > 0 && (
          <span style={{ fontFamily: "'Space Mono',monospace", fontSize: ".55rem", padding: ".15rem .5rem", borderRadius: 100, background: "rgba(0,212,255,.1)", color: "#00d4ff", border: "1px solid rgba(0,212,255,.2)" }}>
            {modified.length} modified
          </span>
        )}
      </div>

      {changes.length === 0 && (
        <div style={{ padding: "1rem", textAlign: "center", color: "var(--text-muted)", fontFamily: "'Space Mono',monospace", fontSize: ".7rem" }}>
          No differences found
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: ".35rem" }}>
        {changes.map((diff) => (
          <div key={diff.key} style={{
            padding: ".5rem .6rem", borderRadius: 6, border: "1px solid var(--border)",
            background: diff.type === "added" ? "rgba(45,255,179,.03)" : diff.type === "removed" ? "rgba(255,68,68,.03)" : "rgba(0,212,255,.03)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: ".5rem", marginBottom: ".25rem" }}>
              <span style={{
                fontFamily: "'Space Mono',monospace", fontSize: ".5rem", padding: ".1rem .3rem",
                borderRadius: 3, fontWeight: 700, textTransform: "uppercase",
                background: diff.type === "added" ? "rgba(45,255,179,.15)" : diff.type === "removed" ? "rgba(255,68,68,.15)" : "rgba(0,212,255,.15)",
                color: diff.type === "added" ? "#2dffb3" : diff.type === "removed" ? "#ff4444" : "#00d4ff",
              }}>
                {diff.type}
              </span>
              <span style={{ fontFamily: "'Space Mono',monospace", fontSize: ".65rem", fontWeight: 600 }}>{diff.key}</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: diff.type === "modified" ? "1fr 1fr" : "1fr", gap: ".5rem" }}>
              {(diff.type === "removed" || diff.type === "modified") && (
                <div style={{ fontFamily: "'Space Mono',monospace", fontSize: ".6rem", padding: ".3rem .5rem", background: "rgba(255,68,68,.05)", borderRadius: 4, border: "1px solid rgba(255,68,68,.1)", color: "#ff8888" }}>
                  <DiffValue value={diff.oldValue} />
                </div>
              )}
              {(diff.type === "added" || diff.type === "modified") && (
                <div style={{ fontFamily: "'Space Mono',monospace", fontSize: ".6rem", padding: ".3rem .5rem", background: "rgba(45,255,179,.05)", borderRadius: 4, border: "1px solid rgba(45,255,179,.1)", color: "#88ffbb" }}>
                  <DiffValue value={diff.newValue} />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
