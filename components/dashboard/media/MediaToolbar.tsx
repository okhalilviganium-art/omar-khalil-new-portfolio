"use client";

import { useState } from "react";
import type { DbMediaFolder } from "@/types/supabase";

export type FilterTab = "all" | "images" | "videos" | "pdfs" | "other" | "unused" | "used" | "broken" | "folders";
export type SortOption = "newest" | "oldest" | "name-asc" | "name-desc" | "largest" | "smallest";
export type ViewMode = "grid" | "list";

interface Props {
  search: string;
  onSearchChange: (v: string) => void;
  filter: FilterTab;
  onFilterChange: (f: FilterTab) => void;
  sort: SortOption;
  onSortChange: (s: SortOption) => void;
  view: ViewMode;
  onViewChange: (v: ViewMode) => void;
  currentFolder: string;
  onFolderChange: (f: string) => void;
  folders: DbMediaFolder[];
  fileCount: number;
  onUpload: () => void;
  onNewFolder: () => void;
}

const FILTER_TABS: { key: FilterTab; label: string; icon: string }[] = [
  { key: "all", label: "All", icon: "bi-folder2" },
  { key: "images", label: "Images", icon: "bi-image" },
  { key: "videos", label: "Videos", icon: "bi-camera-reels" },
  { key: "pdfs", label: "PDFs", icon: "bi-file-earmark-pdf" },
  { key: "other", label: "Other", icon: "bi-file-earmark" },
  { key: "unused", label: "Unused", icon: "bi-circle" },
  { key: "used", label: "Used", icon: "bi-link-45deg" },
  { key: "broken", label: "Broken", icon: "bi-exclamation-triangle" },
  { key: "folders", label: "Folders", icon: "bi-folder" },
];

const SORT_OPTIONS: { key: SortOption; label: string }[] = [
  { key: "newest", label: "Newest" },
  { key: "oldest", label: "Oldest" },
  { key: "name-asc", label: "Name A-Z" },
  { key: "name-desc", label: "Name Z-A" },
  { key: "largest", label: "Largest" },
  { key: "smallest", label: "Smallest" },
];

export default function MediaToolbar({
  search, onSearchChange, filter, onFilterChange,
  sort, onSortChange, view, onViewChange,
  fileCount,
  onUpload, onNewFolder,
}: Props) {
  const [showSort, setShowSort] = useState(false);

  return (
    <div style={{ marginBottom: "1rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: ".5rem", marginBottom: ".75rem", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: "1 1 200px", maxWidth: "320px" }}>
          <i className="bi bi-search" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", fontSize: ".75rem" }} />
          <input
            value={search} onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search files..."
            style={{ width: "100%", padding: ".5rem .75rem .5rem 2rem", background: "var(--bg-input)", border: "1px solid var(--border)", borderRadius: 6, color: "var(--text)", fontFamily: "'Space Mono',monospace", fontSize: ".8rem" }}
          />
        </div>

        <div style={{ position: "relative" }}>
          <button className={`dash-btn dash-btn-sm`} onClick={() => setShowSort(!showSort)}>
            <i className="bi bi-arrow-down-up" /> Sort
          </button>
          {showSort && (
            <div style={{ position: "absolute", top: "100%", right: 0, marginTop: 4, background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 8, padding: ".35rem", zIndex: 50, minWidth: 140, boxShadow: "0 8px 24px rgba(0,0,0,.4)" }}>
              {SORT_OPTIONS.map((o) => (
                <button key={o.key} onClick={() => { onSortChange(o.key); setShowSort(false); }}
                  style={{ display: "block", width: "100%", textAlign: "left", padding: ".4rem .6rem", background: sort === o.key ? "rgba(108,99,255,.15)" : "transparent", border: "none", borderRadius: 4, color: sort === o.key ? "var(--accent)" : "var(--text)", fontFamily: "'Space Mono',monospace", fontSize: ".7rem", cursor: "pointer" }}>
                  {o.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <button className="dash-btn dash-btn-sm" onClick={onNewFolder}>
          <i className="bi bi-folder-plus" /> Folder
        </button>
        <button className="dash-btn dash-btn-add" onClick={onUpload}>
          <i className="bi bi-cloud-arrow-up" /> Upload
        </button>

        <div style={{ marginLeft: "auto", display: "flex", gap: ".2rem" }}>
          <button className={`dash-btn dash-btn-sm ${view === "grid" ? "dash-btn-add" : ""}`} onClick={() => onViewChange("grid")}><i className="bi bi-grid-3x3-gap" /></button>
          <button className={`dash-btn dash-btn-sm ${view === "list" ? "dash-btn-add" : ""}`} onClick={() => onViewChange("list")}><i className="bi bi-list-ul" /></button>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: ".35rem", flexWrap: "wrap" }}>
        {FILTER_TABS.map((t) => (
          <button key={t.key} className={`dash-btn dash-btn-sm ${filter === t.key ? "dash-btn-add" : ""}`}
            style={{ fontSize: ".65rem", textTransform: "none" }}
            onClick={() => onFilterChange(t.key)}>
            <i className={`bi ${t.icon}`} /> {t.label}
          </button>
        ))}
        <span style={{ marginLeft: "auto", fontFamily: "'Space Mono',monospace", fontSize: ".65rem", color: "var(--text-muted)", letterSpacing: ".04em" }}>
          {fileCount} file{fileCount !== 1 ? "s" : ""}
        </span>
      </div>
    </div>
  );
}
