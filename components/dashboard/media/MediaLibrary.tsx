"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useToast } from "@/components/dashboard/shared/ToastProvider";
import {
  listAllMediaFilesAction,
  listMediaFoldersAction,
  bulkDeleteMediaAction,
  renameMediaAction,
  moveMediaAction,
  createFolderAction,
  getMediaUsageAction,
} from "@/lib/actions/media";
import type { DbMediaFile, DbMediaFolder } from "@/types/supabase";
import type { MediaUsageRef } from "@/lib/supabase/media-usage";
import MediaToolbar from "./MediaToolbar";
import type { SortOption, FilterTab, ViewMode } from "./MediaToolbar";
import MediaFileGrid from "./MediaFileGrid";
import MediaFileList from "./MediaFileList";
import MediaDetailsPanel from "./MediaDetailsPanel";
import MediaUploadZone from "./MediaUploadZone";
import MediaBulkBar from "./MediaBulkBar";

interface Props {
  initialFiles: DbMediaFile[];
  initialFolders: DbMediaFolder[];
}

export default function MediaLibrary({ initialFiles, initialFolders }: Props) {
  const { toast } = useToast();
  const [files, setFiles] = useState<DbMediaFile[]>(initialFiles);
  const [folders, setFolders] = useState<DbMediaFolder[]>(initialFolders);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>(() => (typeof window !== "undefined" ? (localStorage.getItem("media_sort") as SortOption) || "newest" : "newest"));
  const [viewMode, setViewMode] = useState<ViewMode>(() => (typeof window !== "undefined" ? (localStorage.getItem("media_view") as ViewMode) || "grid" : "grid"));
  const [filter, setFilter] = useState<FilterTab>("all");
  const [currentFolder, setCurrentFolder] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [detailFile, setDetailFile] = useState<DbMediaFile | null>(null);
  const [usageCache, setUsageCache] = useState<Record<string, MediaUsageRef[]>>({});
  const [showUpload, setShowUpload] = useState(false);
  const uploadRef = useRef<{ trigger: () => void } | null>(null);

  useEffect(() => { localStorage.setItem("media_sort", sortBy); }, [sortBy]);
  useEffect(() => { localStorage.setItem("media_view", viewMode); }, [viewMode]);

  const filtered = files.filter((f) => {
    if (currentFolder && f.folder !== currentFolder) return false;
    if (search && !f.filename.toLowerCase().includes(search.toLowerCase())) return false;
    if (filter === "images" && !f.mime_type.startsWith("image/")) return false;
    if (filter === "videos" && !f.mime_type.startsWith("video/")) return false;
    if (filter === "pdfs" && f.mime_type !== "application/pdf") return false;
    if (filter === "other" && (f.mime_type.startsWith("image/") || f.mime_type.startsWith("video/") || f.mime_type === "application/pdf")) return false;
    if (filter === "unused" && usageCache[f.id] && usageCache[f.id].length > 0) return false;
    if (filter === "used" && (!usageCache[f.id] || usageCache[f.id].length === 0)) return false;
    return true;
  }).sort((a, b) => {
    if (sortBy === "newest") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    if (sortBy === "oldest") return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    if (sortBy === "name-asc") return a.filename.localeCompare(b.filename);
    if (sortBy === "name-desc") return b.filename.localeCompare(a.filename);
    if (sortBy === "largest") return b.size - a.size;
    if (sortBy === "smallest") return a.size - b.size;
    return 0;
  });

  const refreshFiles = useCallback(async () => {
    try {
      const all = await listAllMediaFilesAction();
      if (all) setFiles(all);
      const f = await listMediaFoldersAction();
      if (f) setFolders(f);
    } catch {
      toast("Failed to refresh files", "error");
    }
  }, [toast]);

  const handleSelect = (id: string, shiftKey?: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (shiftKey) { next.add(id); }
      else {
        if (next.has(id)) next.delete(id); else next.add(id);
      }
      return next;
    });
  };

  const handleOpen = (file: DbMediaFile) => {
    setDetailFile(file);
    if (!usageCache[file.id]) {
      getMediaUsageAction(file.id).then((result) => {
        if (result?.usedIn) setUsageCache((prev) => ({ ...prev, [file.id]: result.usedIn }));
      }).catch(() => {});
    }
  };

  const handleRename = async (id: string, name: string) => {
    try {
      const res = await renameMediaAction(id, name);
      if (res?.success) {
        setFiles((prev) => prev.map((f) => f.id === id ? { ...f, filename: name } : f));
        if (detailFile?.id === id) setDetailFile((prev) => prev ? { ...prev, filename: name } : null);
        toast("Renamed");
      } else { toast(res?.error || "Rename failed", "error"); }
    } catch { toast("Rename failed", "error"); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this file?")) return;
    try {
      const res = await bulkDeleteMediaAction([id]);
      if (res?.success) {
        setFiles((prev) => prev.filter((f) => f.id !== id));
        if (detailFile?.id === id) setDetailFile(null);
        setSelected((prev) => { const n = new Set(prev); n.delete(id); return n; });
        toast("Deleted");
      } else { toast(res?.error || "Delete failed", "error"); }
    } catch { toast("Delete failed", "error"); }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${selected.size} files?`)) return;
    try {
      const res = await bulkDeleteMediaAction(Array.from(selected));
      if (res?.success) {
        await refreshFiles();
        setSelected(new Set());
        if (detailFile && selected.has(detailFile.id)) setDetailFile(null);
        toast(`${res.deleted} deleted, ${res.skipped} skipped`);
      } else { toast(res?.error || "Bulk delete failed", "error"); }
    } catch { toast("Bulk delete failed", "error"); }
  };

  const handleBulkMove = async () => {
    const target = prompt("Move to folder (leave empty for root):");
    if (target === null) return;
    try {
      await moveMediaAction(Array.from(selected), target);
      await refreshFiles();
      setSelected(new Set());
      toast("Moved");
    } catch { toast("Move failed", "error"); }
  };

  const handleCopyUrls = () => {
    try {
      const urls = filtered.filter((f) => selected.has(f.id)).map((f) => f.public_url).join("\n");
      navigator.clipboard.writeText(urls);
      toast("URLs copied");
    } catch { toast("Copy failed", "error"); }
  };

  const handleCopyIds = () => {
    try {
      const ids = filtered.filter((f) => selected.has(f.id)).map((f) => f.id).join("\n");
      navigator.clipboard.writeText(ids);
      toast("IDs copied");
    } catch { toast("Copy failed", "error"); }
  };

  const handleCopyUrl = (url: string) => { try { navigator.clipboard.writeText(url); toast("URL copied"); } catch { toast("Copy failed", "error"); } };
  const handleCopyId = (id: string) => { try { navigator.clipboard.writeText(id); toast("ID copied"); } catch { toast("Copy failed", "error"); } };

  const handleMoveFile = async (id: string, folder: string) => {
    try {
      const res = await moveMediaAction([id], folder);
      if (res?.success) {
        setFiles((prev) => prev.map((f) => f.id === id ? { ...f, folder } : f));
        if (detailFile?.id === id) setDetailFile((prev) => prev ? { ...prev, folder } : null);
        toast("Moved");
      } else { toast(res?.error || "Move failed", "error"); }
    } catch { toast("Move failed", "error"); }
  };

  const handleReplace = async (id: string, file: File) => {
    try {
      const fd = new FormData();
      fd.append("file", file);
      const { replaceMediaAction } = await import("@/lib/actions/media");
      const res = await replaceMediaAction(id, fd);
      if (res?.success) {
        await refreshFiles();
        toast("Replaced");
      } else { toast(res?.error || "Replace failed", "error"); }
    } catch { toast("Replace failed", "error"); }
  };

  const handleCreateFolder = async () => {
    const name = prompt("Folder name:");
    if (!name) return;
    try {
      const res = await createFolderAction(name);
      if (res?.success) {
        await refreshFiles();
        toast("Folder created");
      } else { toast(res?.error || "Failed", "error"); }
    } catch { toast("Failed to create folder", "error"); }
  };

  const handleUploadComplete = (file: DbMediaFile) => {
    setFiles((prev) => [file, ...prev]);
  };

  const usageCounts = Object.fromEntries(Object.entries(usageCache).map(([id, refs]) => [id, refs.length]));

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <MediaToolbar
        search={search} onSearchChange={setSearch}
        sort={sortBy} onSortChange={setSortBy}
        view={viewMode} onViewChange={setViewMode}
        filter={filter} onFilterChange={setFilter}
        currentFolder={currentFolder} onFolderChange={setCurrentFolder}
        folders={folders} fileCount={filtered.length}
        onUpload={() => { setShowUpload(true); setTimeout(() => uploadRef.current?.trigger(), 100); }}
        onNewFolder={handleCreateFolder}
      />

      {showUpload && (
        <MediaUploadZone folder={currentFolder || "uploads"} onComplete={handleUploadComplete} uploadRef={uploadRef} />
      )}

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <div style={{ flex: 1, overflow: "auto", padding: "1rem" }}>
          {viewMode === "grid" ? (
            <MediaFileGrid files={filtered} selected={selected} onSelect={handleSelect} onOpen={handleOpen} usageCounts={usageCounts} />
          ) : (
            <MediaFileList files={filtered} selected={selected} onSelect={handleSelect} onOpen={handleOpen} usageCounts={usageCounts} />
          )}
          {filtered.length === 0 && (
            <div style={{ textAlign: "center", padding: "3rem", fontFamily: "'Space Mono',monospace", fontSize: ".75rem", color: "var(--text-muted)" }}>
              No files found
            </div>
          )}
        </div>

        {detailFile && (
          <MediaDetailsPanel
            file={detailFile}
            onClose={() => setDetailFile(null)}
            onRename={handleRename}
            onReplace={handleReplace}
            onDelete={handleDelete}
            onCopyUrl={handleCopyUrl}
            onCopyId={handleCopyId}
            onMove={handleMoveFile}
            folders={folders.map((f) => f.path || f.name)}
            usage={usageCache[detailFile.id]}
            usageLoading={!usageCache[detailFile.id]}
          />
        )}
      </div>

      <MediaBulkBar
        selectedCount={selected.size}
        onDelete={handleBulkDelete}
        onMove={handleBulkMove}
        onCopyUrls={handleCopyUrls}
        onCopyIds={handleCopyIds}
        onClear={() => setSelected(new Set())}
      />
    </div>
  );
}
