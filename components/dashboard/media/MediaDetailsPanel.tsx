"use client";

import { useState, useEffect, useRef } from "react";
import type { DbMediaFile } from "@/types/supabase";
import type { MediaUsageRef } from "@/lib/supabase/media-usage";
import { formatDate } from "@/lib/utils/time";

interface Props {
  file: DbMediaFile;
  onClose: () => void;
  onRename: (id: string, name: string) => void;
  onReplace: (id: string, file: File) => void;
  onDelete: (id: string) => void;
  onCopyUrl: (url: string) => void;
  onCopyId: (id: string) => void;
  onMove: (id: string, folder: string) => void;
  folders: string[];
  usage?: MediaUsageRef[] | null;
  usageLoading?: boolean;
}

function formatBytes(bytes: number) {
  if (bytes === 0) return "0 B";
  const k = 1024, sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

function isImage(mime: string) { return mime.startsWith("image/"); }
function isVideo(mime: string) { return mime.startsWith("video/"); }
function isPdf(mime: string) { return mime === "application/pdf"; }

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: ".3rem 0", borderBottom: "1px solid rgba(255,255,255,.04)" }}>
      <span style={{ fontFamily: "'Space Mono',monospace", fontSize: ".6rem", color: "var(--text-muted)", letterSpacing: ".04em" }}>{label}</span>
      <span style={{ fontFamily: "'Space Mono',monospace", fontSize: ".6rem", color: "var(--text)" }}>{value}</span>
    </div>
  );
}

export default function MediaDetailsPanel({ file, onClose, onRename, onReplace, onDelete, onCopyUrl, onCopyId, onMove, folders, usage, usageLoading }: Props) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(file.filename);
  const [showMove, setShowMove] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const id = requestAnimationFrame(() => { setName(file.filename); setEditing(false); setShowMove(false); });
    return () => cancelAnimationFrame(id);
  }, [file.id]);

  const handleRename = () => { if (name.trim() && name !== file.filename) onRename(file.id, name.trim()); setEditing(false); };

  return (
    <div style={{ width: 320, background: "var(--bg-card)", borderLeft: "1px solid var(--border)", display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      <div style={{ padding: ".75rem 1rem", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontFamily: "'Space Mono',monospace", fontSize: ".65rem", letterSpacing: ".08em", textTransform: "uppercase", color: "var(--text-muted)" }}>Details</span>
        <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "1rem" }}><i className="bi bi-x-lg" /></button>
      </div>

      <div style={{ flex: 1, overflow: "auto", padding: "1rem" }}>
        <div style={{ background: "#060c18", borderRadius: 8, overflow: "hidden", marginBottom: "1rem", border: "1px solid var(--border)" }}>
          {isImage(file.mime_type) ? (
            <img src={file.public_url} alt="" style={{ width: "100%", maxHeight: 200, objectFit: "contain" }} />
          ) : isVideo(file.mime_type) ? (
            <video src={file.public_url} controls style={{ width: "100%", maxHeight: 200 }} />
          ) : isPdf(file.mime_type) ? (
            <div style={{ padding: "2rem", textAlign: "center", fontSize: "2rem" }}>{"\ud83d\udcc4"}</div>
          ) : (
            <div style={{ padding: "2rem", textAlign: "center", fontSize: "2rem" }}>{"\ud83d\udcc1"}</div>
          )}
        </div>

        <div style={{ marginBottom: "1rem" }}>
          {editing ? (
            <div style={{ display: "flex", gap: ".35rem" }}>
              <input ref={nameRef} autoFocus value={name} onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleRename(); if (e.key === "Escape") setEditing(false); }}
                style={{ flex: 1, padding: ".3rem .5rem", background: "var(--bg-input)", border: "1px solid var(--accent)", borderRadius: 4, color: "var(--text)", fontFamily: "'Outfit',sans-serif", fontSize: ".8rem" }} />
              <button className="dash-btn dash-btn-sm dash-btn-add" onClick={handleRename} style={{ fontSize: ".65rem" }}><i className="bi bi-check" /></button>
            </div>
          ) : (
            <div onClick={() => setEditing(true)} style={{ fontFamily: "'Outfit',sans-serif", fontSize: ".85rem", fontWeight: 500, cursor: "pointer", padding: ".3rem .5rem", borderRadius: 4 }} title="Click to rename">
              {file.filename}
            </div>
          )}
        </div>

        <InfoRow label="Folder" value={file.folder || "Root"} />
        <InfoRow label="Type" value={file.mime_type} />
        <InfoRow label="Size" value={formatBytes(file.size)} />
        {file.width && file.height && <InfoRow label="Dimensions" value={`${file.width} x ${file.height}`} />}
        {file.duration && <InfoRow label="Duration" value={`${file.duration}s`} />}
        <InfoRow label="Created" value={formatDate(file.created_at)} />

        <div style={{ marginTop: "1rem", padding: ".6rem", background: "var(--bg-dark, #060c18)", borderRadius: 6, border: "1px solid var(--border)" }}>
          <div style={{ fontFamily: "'Space Mono',monospace", fontSize: ".5rem", color: "var(--text-muted)", letterSpacing: ".08em", textTransform: "uppercase", marginBottom: ".25rem" }}>Media ID</div>
          <div style={{ fontFamily: "'Space Mono',monospace", fontSize: ".6rem", color: "var(--accent)", wordBreak: "break-all", cursor: "pointer" }} onClick={() => onCopyId(file.id)} title="Click to copy">
            {file.id}
          </div>
        </div>

        <div style={{ marginTop: ".5rem", padding: ".6rem", background: "var(--bg-dark, #060c18)", borderRadius: 6, border: "1px solid var(--border)" }}>
          <div style={{ fontFamily: "'Space Mono',monospace", fontSize: ".5rem", color: "var(--text-muted)", letterSpacing: ".08em", textTransform: "uppercase", marginBottom: ".25rem" }}>Public URL</div>
          <div style={{ fontFamily: "'Space Mono',monospace", fontSize: ".55rem", color: "var(--text)", wordBreak: "break-all", cursor: "pointer", maxHeight: 40, overflow: "hidden" }} onClick={() => onCopyUrl(file.public_url)} title="Click to copy">
            {file.public_url}
          </div>
        </div>

        <div style={{ marginTop: "1rem" }}>
          <div style={{ fontFamily: "'Space Mono',monospace", fontSize: ".55rem", letterSpacing: ".08em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: ".4rem" }}>Used In</div>
          {usageLoading ? (
            <div style={{ fontFamily: "'Space Mono',monospace", fontSize: ".65rem", color: "var(--text-muted)" }}>Loading...</div>
          ) : usage && usage.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: ".3rem" }}>
              {usage.map((u, i) => (
                <div key={i} style={{ padding: ".35rem .5rem", background: "rgba(108,99,255,.08)", borderRadius: 4, fontFamily: "'Space Mono',monospace", fontSize: ".6rem", color: "var(--text)", display: "flex", alignItems: "center", gap: ".4rem" }}>
                  <i className="bi bi-link-45deg" style={{ color: "var(--accent)" }} />
                  <span style={{ textTransform: "capitalize" }}>{u.type.replace("_", " ")}</span>
                  {u.projectTitle && <span style={{ color: "var(--text-muted)" }}>— {u.projectTitle}</span>}
                  <span style={{ marginLeft: "auto", color: "var(--text-muted)" }}>{u.field}</span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ fontFamily: "'Space Mono',monospace", fontSize: ".6rem", color: "var(--text-muted)" }}>Not used anywhere</div>
          )}
        </div>

        {showMove && (
          <div style={{ marginTop: ".75rem", padding: ".5rem", background: "rgba(108,99,255,.05)", borderRadius: 6, border: "1px solid var(--border)" }}>
            <div style={{ fontFamily: "'Space Mono',monospace", fontSize: ".5rem", color: "var(--text-muted)", letterSpacing: ".06em", textTransform: "uppercase", marginBottom: ".35rem" }}>Move to folder</div>
            <div style={{ display: "flex", flexDirection: "column", gap: ".2rem" }}>
              <button className="dash-btn dash-btn-sm" style={{ fontSize: ".6rem", textAlign: "left" }}
                onClick={() => { onMove(file.id, ""); setShowMove(false); }}>Root</button>
              {folders.filter((f) => f !== file.folder).map((f) => (
                <button key={f} className="dash-btn dash-btn-sm" style={{ fontSize: ".6rem", textAlign: "left" }}
                  onClick={() => { onMove(file.id, f); setShowMove(false); }}>{f}</button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div style={{ padding: ".75rem 1rem", borderTop: "1px solid var(--border)", display: "flex", gap: ".3rem", flexWrap: "wrap" }}>
        <button className="dash-btn dash-btn-sm" style={{ fontSize: ".6rem" }} onClick={() => setShowMove(!showMove)}><i className="bi bi-folder-symlink" /> Move</button>
        <label className="dash-btn dash-btn-sm" style={{ fontSize: ".6rem", cursor: "pointer" }}>
          <i className="bi bi-arrow-repeat" /> Replace
          <input type="file" accept="image/*,video/*,.pdf" style={{ display: "none" }}
            onChange={(e) => { const f = e.target.files?.[0]; if (f) onReplace(file.id, f); e.target.value = ""; }} />
        </label>
        <button className="dash-btn dash-btn-sm" style={{ fontSize: ".6rem" }} onClick={() => onCopyUrl(file.public_url)}><i className="bi bi-clipboard" /> URL</button>
        <button className="dash-btn dash-btn-sm" style={{ fontSize: ".6rem" }} onClick={() => onCopyId(file.id)}><i className="bi bi-clipboard" /> ID</button>
        <button className="dash-btn dash-btn-danger dash-btn-sm" style={{ fontSize: ".6rem", marginLeft: "auto" }} onClick={() => onDelete(file.id)}><i className="bi bi-trash" /></button>
      </div>
    </div>
  );
}
