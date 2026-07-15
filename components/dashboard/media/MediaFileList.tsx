"use client";

import type { DbMediaFile } from "@/types/supabase";

interface Props {
  files: DbMediaFile[];
  selected: Set<string>;
  onSelect: (id: string, shiftKey: boolean) => void;
  onOpen: (file: DbMediaFile) => void;
  usageCounts: Record<string, number>;
}

function isImage(mime: string) { return mime.startsWith("image/"); }

function formatBytes(bytes: number) {
  if (bytes === 0) return "0 B";
  const k = 1024, sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

const COLS = "40px 40px 1fr 100px 100px 80px 80px 90px";

export default function MediaFileList({ files, selected, onSelect, onOpen, usageCounts }: Props) {
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: COLS, gap: ".5rem", padding: ".4rem .75rem", fontFamily: "'Space Mono',monospace", fontSize: ".55rem", color: "var(--text-muted)", letterSpacing: ".08em", textTransform: "uppercase", borderBottom: "1px solid var(--border)", marginBottom: ".25rem" }}>
        <span></span><span></span><span>Name</span><span>Folder</span><span>Type</span><span>Size</span><span>Date</span><span>Refs</span>
      </div>
      {files.map((f) => {
        const isSel = selected.has(f.id);
        const count = usageCounts[f.id] || 0;
        return (
          <div key={f.id}
            onClick={(e) => onSelect(f.id, e.shiftKey)}
            onDoubleClick={() => onOpen(f)}
            style={{
              display: "grid", gridTemplateColumns: COLS, gap: ".5rem", padding: ".35rem .75rem",
              alignItems: "center", background: isSel ? "rgba(108,99,255,.08)" : "transparent",
              border: `1px solid ${isSel ? "var(--accent)" : "transparent"}`, borderRadius: 6,
              cursor: "pointer", transition: "background .1s",
            }}
          >
            <input type="checkbox" checked={isSel} readOnly
              style={{ accentColor: "var(--accent)", width: 14, height: 14, pointerEvents: "none" }} />
            {isImage(f.mime_type) ? (
              <img src={f.public_url} alt="" loading="lazy" style={{ width: 32, height: 32, borderRadius: 4, objectFit: "cover" }} />
            ) : (
              <div style={{ width: 32, height: 32, borderRadius: 4, background: "var(--bg-dark, #060c18)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: ".9rem" }}>
                {f.mime_type.startsWith("video/") ? "\ud83c\udfac" : f.mime_type === "application/pdf" ? "\ud83d\udcc4" : "\ud83d\udcc1"}
              </div>
            )}
            <div style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: "'Outfit',sans-serif", fontSize: ".8rem", fontWeight: 500 }}>
              {f.filename}
            </div>
            <span style={{ fontFamily: "'Space Mono',monospace", fontSize: ".6rem", color: "var(--text-muted)" }}>{f.folder || "-"}</span>
            <span style={{ fontFamily: "'Space Mono',monospace", fontSize: ".6rem", color: "var(--text-muted)" }}>{f.mime_type.split("/")[1] || f.mime_type}</span>
            <span style={{ fontFamily: "'Space Mono',monospace", fontSize: ".6rem", color: "var(--text-muted)" }}>{formatBytes(f.size)}</span>
            <span style={{ fontFamily: "'Space Mono',monospace", fontSize: ".6rem", color: "var(--text-muted)" }}>{timeAgo(f.created_at)}</span>
            <span style={{ fontFamily: "'Space Mono',monospace", fontSize: ".6rem", color: count > 0 ? "var(--accent)" : "var(--text-muted)" }}>
              {count > 0 ? `${count} ref${count !== 1 ? "s" : ""}` : "-"}
            </span>
          </div>
        );
      })}
    </div>
  );
}
