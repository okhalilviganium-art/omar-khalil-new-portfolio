"use client";

import { useState, useRef, useCallback, useImperativeHandle, type ChangeEvent, type DragEvent } from "react";
import { uploadFileAction } from "@/lib/actions/storage";
import type { DbMediaFile } from "@/types/supabase";

interface UploadItem {
  id: string;
  file: File;
  progress: number;
  status: "pending" | "uploading" | "done" | "error";
  error?: string;
}

interface Props {
  folder: string;
  onComplete: (file: DbMediaFile) => void;
  uploadRef: React.MutableRefObject<{ trigger: () => void } | null>;
}

export default function MediaUploadZone({ folder, onComplete, uploadRef }: Props) {
  const [dragging, setDragging] = useState(false);
  const [queue, setQueue] = useState<UploadItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const counterRef = useRef(0);

  const processQueue = useCallback(async (items: UploadItem[]) => {
    setUploading(true);
    for (const item of items) {
      if (item.status !== "pending") continue;
      setQueue((prev) => prev.map((q) => q.id === item.id ? { ...q, status: "uploading", progress: 50 } : q));
      try {
        const fd = new FormData();
        fd.append("file", item.file);
        fd.append("folder", folder || "uploads");
        const res = await uploadFileAction(fd);
        if (res.success) {
          setQueue((prev) => prev.map((q) => q.id === item.id ? { ...q, status: "done", progress: 100 } : q));
          onComplete({ id: res.mediaId, filename: item.file.name, storage_path: res.path, public_url: res.url, mime_type: item.file.type, size: item.file.size, width: null, height: null, duration: null, folder: folder || "uploads", created_at: new Date().toISOString() } as DbMediaFile);
        } else {
          setQueue((prev) => prev.map((q) => q.id === item.id ? { ...q, status: "error", error: res.error } : q));
        }
      } catch (err) {
        setQueue((prev) => prev.map((q) => q.id === item.id ? { ...q, status: "error", error: (err as Error).message } : q));
      }
    }
    setUploading(false);
    setTimeout(() => setQueue((prev) => prev.filter((q) => q.status !== "done")), 2000);
  }, [folder, onComplete]);

  const handleDrop = useCallback((e: DragEvent) => {
    e.preventDefault(); e.stopPropagation(); setDragging(false);
    if (e.dataTransfer.files.length > 0) {
      const items: UploadItem[] = Array.from(e.dataTransfer.files).map((f) => ({
        id: `upload-${++counterRef.current}`, file: f, progress: 0, status: "pending" as const,
      }));
      setQueue((prev) => [...prev, ...items]);
      processQueue(items);
    }
  }, [processQueue]);

  const handleDragOver = (e: DragEvent) => { e.preventDefault(); e.stopPropagation(); setDragging(true); };
  const handleDragLeave = (e: DragEvent) => { e.preventDefault(); e.stopPropagation(); setDragging(false); };

  const triggerUpload = () => inputRef.current?.click();
  useImperativeHandle(uploadRef, () => ({ trigger: triggerUpload }));

  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      const items: UploadItem[] = Array.from(e.target.files).map((f) => ({
        id: `upload-${++counterRef.current}`, file: f, progress: 0, status: "pending" as const,
      }));
      setQueue((prev) => [...prev, ...items]);
      processQueue(items);
      e.target.value = "";
    }
  };

  const retryFailed = () => {
    const failed = queue.filter((q) => q.status === "error");
    const reset = failed.map((q) => ({ ...q, status: "pending" as const, progress: 0, error: undefined }));
    setQueue((prev) => prev.map((q) => q.status === "error" ? { ...q, status: "pending", progress: 0, error: undefined } : q));
    processQueue(reset);
  };

  const failedCount = queue.filter((q) => q.status === "error").length;
  const doneCount = queue.filter((q) => q.status === "done").length;
  const activeCount = queue.filter((q) => q.status === "uploading" || q.status === "pending").length;

  return (
    <div
      onDrop={handleDrop} onDragOver={handleDragOver} onDragLeave={handleDragLeave}
      onClick={() => !uploading && triggerUpload()}
      style={{
        border: `2px dashed ${dragging ? "var(--accent)" : "var(--border)"}`,
        borderRadius: 10, padding: "1.5rem", textAlign: "center", cursor: uploading ? "wait" : "pointer",
        background: dragging ? "rgba(108,99,255,.05)" : "transparent", transition: "all .15s", marginBottom: "1rem",
      }}
    >
      <input ref={inputRef} type="file" multiple accept="image/*,video/*,.pdf,.zip,.rar" style={{ display: "none" }} onChange={handleFileInput} />
      <i className="bi bi-cloud-arrow-up" style={{ fontSize: "1.5rem", color: "var(--accent)", display: "block", marginBottom: ".3rem" }} />
      <span style={{ fontFamily: "'Space Mono',monospace", fontSize: ".7rem", color: dragging ? "var(--accent)" : "var(--text-muted)" }}>
        {dragging ? "Drop files here" : "Drag & drop files or click to upload"}
      </span>

      {queue.length > 0 && (
        <div style={{ marginTop: ".75rem", textAlign: "left" }} onClick={(e) => e.stopPropagation()}>
          <div style={{ display: "flex", alignItems: "center", gap: ".5rem", marginBottom: ".35rem" }}>
            <span style={{ fontFamily: "'Space Mono',monospace", fontSize: ".6rem", color: "var(--text-muted)" }}>
              {activeCount > 0 ? `${activeCount} uploading...` : `${doneCount} uploaded`}
            </span>
            {failedCount > 0 && (
              <button className="dash-btn dash-btn-sm" style={{ fontSize: ".55rem", marginLeft: "auto" }} onClick={retryFailed}>
                <i className="bi bi-arrow-repeat" /> Retry {failedCount} failed
              </button>
            )}
          </div>
          {queue.map((item) => (
            <div key={item.id} style={{ display: "flex", alignItems: "center", gap: ".5rem", padding: ".2rem 0" }}>
              <span style={{ fontFamily: "'Space Mono',monospace", fontSize: ".55rem", color: "var(--text)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {item.file.name}
              </span>
              {item.status === "uploading" && <span style={{ color: "var(--accent)", fontSize: ".55rem" }}>...</span>}
              {item.status === "done" && <i className="bi bi-check-lg" style={{ color: "#2dffb3", fontSize: ".6rem" }} />}
              {item.status === "error" && <i className="bi bi-x-lg" style={{ color: "var(--danger, #ff4444)", fontSize: ".6rem" }} />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
