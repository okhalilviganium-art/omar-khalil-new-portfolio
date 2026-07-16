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
function isVideo(mime: string) { return mime.startsWith("video/"); }
function fileIcon(mime: string) {
  if (mime.startsWith("image/")) return "\ud83d\uddbc\ufe0f";
  if (mime.startsWith("video/")) return "\ud83c\udfac";
  if (mime.startsWith("audio/")) return "\ud83c\udfb5";
  if (mime === "application/pdf") return "\ud83d\udcc4";
  return "\ud83d\udcc1";
}

function formatBytes(bytes: number) {
  if (bytes === 0) return "0 B";
  const k = 1024, sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

export default function MediaFileGrid({ files, selected, onSelect, onOpen, usageCounts }: Props) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: ".5rem" }}>
      {files.map((f) => {
        const isSel = selected.has(f.id);
        const count = usageCounts[f.id] || 0;
        return (
          <div key={f.id}
            onClick={(e) => onSelect(f.id, e.shiftKey)}
            onDoubleClick={() => onOpen(f)}
            style={{
              background: "var(--bg-card)", border: `1px solid ${isSel ? "var(--accent)" : "var(--border)"}`,
              borderRadius: 8, overflow: "hidden", cursor: "pointer", position: "relative",
              outline: isSel ? "2px solid var(--accent)" : "none", outlineOffset: -2,
              transition: "border-color .12s",
            }}
          >
            <div style={{ height: 130, background: "#060c18", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", position: "relative" }}>
              {isImage(f.mime_type) ? (
                <img src={f.public_url} alt="" loading="lazy"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
              ) : isVideo(f.mime_type) ? (
                <video src={f.public_url} muted preload="metadata"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <span style={{ fontSize: "2rem" }}>{fileIcon(f.mime_type)}</span>
              )}
              {count > 0 && (
                <div style={{ position: "absolute", top: 6, right: 6, background: "rgba(108,99,255,.9)", color: "#fff", borderRadius: 4, padding: "1px 6px", fontFamily: "'Space Mono',monospace", fontSize: ".5rem", letterSpacing: ".04em" }}>
                  {count} ref{count !== 1 ? "s" : ""}
                </div>
              )}
              {isSel && (
                <div style={{ position: "absolute", top: 6, left: 6, width: 20, height: 20, borderRadius: "50%", background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <i className="bi bi-check-lg" style={{ color: "#fff", fontSize: ".65rem" }} />
                </div>
              )}
            </div>
            <div style={{ padding: ".5rem .6rem" }}>
              <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: ".75rem", fontWeight: 500, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={f.filename}>
                {f.filename}
              </div>
              <div style={{ fontFamily: "'Space Mono',monospace", fontSize: ".55rem", color: "var(--text-muted)", letterSpacing: ".04em", marginTop: 2, display: "flex", gap: ".5rem" }}>
                <span>{formatBytes(f.size)}</span>
                {f.folder && <span style={{ color: "var(--accent)", opacity: .7 }}>{f.folder}</span>}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
