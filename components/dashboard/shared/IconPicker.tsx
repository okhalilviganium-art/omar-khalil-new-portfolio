"use client";

import { useState, useMemo, useRef, useEffect } from "react";

const ICONS = [
  "bi-palette", "bi-camera-reels", "bi-box", "bi-cpu", "bi-code-slash", "bi-stars",
  "bi-rocket-takeoff", "bi-brush", "bi-vector-pen", "bi-bezier2",
  "bi-film", "bi-camera-video", "bi-mic", "bi-music-note-beamed", "bi-soundwave",
  "bi-globe", "bi-phone", "bi-laptop", "bi-tablet", "bi-smartwatch",
  "bi-cart", "bi-bag", "bi-shop", "bi-credit-card", "bi-wallet2",
  "bi-graph-up", "bi-bar-chart", "bi-pie-chart", "bi-clipboard-data", "bi-speedometer2",
  "bi-lightbulb", "bi-idea", "bi-magic", "bi-wand", "bi-infinity",
  "bi-puzzle", "bi-joystick", "bi-gamepad", "bi-controller",
  "bi-envelope", "bi-chat-dots", "bi-megaphone", "bi-broadcast", "bi-share",
  "bi-gear", "bi-sliders", "bi-tools", "bi-wrench", "bi-nut",
  "bi-shield", "bi-lock", "bi-key", "bi-person-check",
  "bi-cloud", "bi-cloud-upload", "bi-database", "bi-server", "bi-hdd-network",
  "bi-geo-alt", "bi-compass", "bi-signpost", "bi-map",
  "bi-trophy", "bi-award", "bi-patch-check", "bi-fire",
  "bi-heart", "bi-hand-thumbs-up", "bi-emoji-smile", "bi-star",
  "bi-cube", "bi-boxes", "bi-diagram-3", "bi-bezier", "bi-node-hml",
  "bi-paint-bucket", "bi-paintRoller", "bi-eraser", "bi-scissors", "bi-crop",
  "bi-fonts", "bi-type", "bi-text-paragraph", "bi-blockquote-left",
  "bi-image", "bi-images", "bi-easel", "bi-camera",
  "bi-reception-4", "bi-wifi", "bi-sim", "bi-sim-fill",
  "bi-usb", "bi-hdmi", "bi-keyboard", "bi-printer", "bi-qq",
  "bi-triangle", "bi-hexagon", "bi-octagon", "bi-square",
  "bi-arrows-fullscreen", "bi-arrows-move", "bi-fullscreen", "bi-zoom-in",
  "bi-robot", "bi-chip", "bi-cpu-fill", "bi-memory",
  "bi-hourglass-split", "bi-stopwatch", "bi-calendar", "bi-clock-history",
  "bi-chat-left-text", "bi-reply", "bi-forward", "bi-paperclip",
  "bi-tag", "bi-bookmark", "bi-archive", "bi-inbox",
  "bi-folder", "bi-folder2-open", "bi-file-earmark", "bi-filetype-pdf",
  "bi-github", "bi-linkedin", "bi-twitter-x", "bi-instagram", "bi-behance",
  "bi-dribbble", "bi-youtube", "bi-tiktok", "bi-threads",
];

interface IconPickerProps {
  value: string;
  onChange: (icon: string) => void;
}

export default function IconPicker({ value, onChange }: IconPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return ICONS;
    const q = search.toLowerCase();
    return ICONS.filter((ic) => ic.replace("bi-", "").includes(q));
  }, [search]);

  return (
    <div className="dash-field" ref={ref} style={{ position: "relative" }}>
      <label>Icon</label>
      <div style={{ display: "flex", gap: ".5rem", alignItems: "center" }}>
        <button type="button" onClick={() => setOpen(!open)}
          style={{
            display: "flex", alignItems: "center", gap: ".6rem",
            padding: ".55rem .8rem", background: "var(--bg-input)", border: "1px solid var(--border)",
            borderRadius: 6, color: "var(--text)", cursor: "pointer", minWidth: 140,
            fontFamily: "'Outfit', sans-serif", fontSize: ".8rem",
          }}>
          <i className={`bi ${value || "bi-stars"}`} style={{ fontSize: "1.1rem", color: "var(--accent)" }} />
          <span>{value || "Select icon"}</span>
          <i className="bi bi-chevron-down" style={{ marginLeft: "auto", fontSize: ".6rem", color: "var(--text-muted)" }} />
        </button>
      </div>

      {open && (
        <div style={{
          position: "absolute", top: "100%", left: 0, right: 0, zIndex: 100,
          background: "var(--bg-dark, #060c18)", border: "1px solid var(--border)",
          borderRadius: 8, padding: ".75rem", maxHeight: 280, overflow: "auto",
          boxShadow: "0 12px 40px rgba(0,0,0,.5)",
        }}>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search icons..."
            autoFocus
            style={{
              width: "100%", padding: ".5rem .7rem", background: "var(--bg-input)", border: "1px solid var(--border)",
              borderRadius: 6, color: "var(--text)", fontFamily: "'Outfit', sans-serif", fontSize: ".8rem",
              outline: "none", marginBottom: ".5rem",
            }} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(36px, 1fr))", gap: 4 }}>
            {filtered.map((ic) => (
              <button key={ic} type="button"
                onClick={() => { onChange(ic); setOpen(false); setSearch(""); }}
                title={ic}
                style={{
                  width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center",
                  border: value === ic ? "1px solid var(--accent)" : "1px solid transparent",
                  borderRadius: 6, cursor: "pointer", fontSize: "1rem", color: value === ic ? "var(--accent)" : "var(--text-muted)",
                  background: value === ic ? "rgba(108,99,255,.12)" : "transparent",
                  transition: "all .15s",
                }}>
                <i className={`bi ${ic}`} />
              </button>
            ))}
          </div>
          {filtered.length === 0 && (
            <div style={{ textAlign: "center", color: "var(--text-muted)", fontSize: ".75rem", padding: "1rem" }}>
              No icons found
            </div>
          )}
        </div>
      )}
    </div>
  );
}
