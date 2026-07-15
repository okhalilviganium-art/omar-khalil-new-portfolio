"use client";

import { useRef, useState, useCallback } from "react";
import { uploadFileAction } from "@/lib/actions/storage";
import { useToast } from "@/components/dashboard/shared/ToastProvider";

interface UploadResult {
  url: string;
  mediaId: string;
}

interface Props {
  name: string;
  label: string;
  value?: string;
  mediaId?: string;
  folder?: string;
  accept?: string;
  onUpload?: (url: string, mediaId: string) => void;
}

export default function ImageUpload({ name, label, value, mediaId: initialMediaId, folder = "uploads", accept = "image/*", onUpload }: Props) {
  const [url, setUrl] = useState(value || "");
  const [currentMediaId, setCurrentMediaId] = useState(initialMediaId || "");
  const [uploading, setUploading] = useState(false);
  const ref = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFile = useCallback(async (file: File) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", folder);
      const res = await uploadFileAction(fd);
      if (res.success) {
        setUrl(res.url);
        setCurrentMediaId(res.mediaId);
        onUpload?.(res.url, res.mediaId);
      } else {
        toast(res.error, "error");
      }
    } catch {
      toast("Upload failed", "error");
    } finally {
      setUploading(false);
    }
  }, [folder, toast, onUpload]);

  const handleClear = useCallback(() => {
    setUrl("");
    setCurrentMediaId("");
    onUpload?.("", "");
  }, [onUpload]);

  return (
    <div className="dash-field">
      <label>{label}</label>
      <input type="hidden" name={name} value={url} />
      <input type="hidden" name={`${name}_media_id`} value={currentMediaId} />
      <div style={{ display: "flex", gap: ".75rem", alignItems: "flex-start" }}>
        {url && (
          <div style={{ position: "relative", flexShrink: 0 }}>
            <img src={url} alt="" style={{ width: 120, height: 80, objectFit: "cover", borderRadius: 8, border: "1px solid var(--border)" }} />
            <button type="button" onClick={handleClear}
              style={{ position: "absolute", top: -6, right: -6, width: 20, height: 20, borderRadius: "50%", background: "var(--danger, #ff4444)", color: "#fff", border: "none", cursor: "pointer", fontSize: "0.7rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <i className="bi bi-x-lg" />
            </button>
          </div>
        )}
        <div onClick={() => !uploading && ref.current?.click()}
          style={{ flex: 1, padding: "1.5rem", border: "1px dashed var(--border)", borderRadius: 8, textAlign: "center", cursor: uploading ? "wait" : "pointer", opacity: uploading ? 0.5 : 1, transition: "border-color .2s" }}>
          {uploading ? (
            <span style={{ color: "var(--text-muted)", fontSize: ".85rem" }}><i className="bi bi-hourglass-split" /> Uploading...</span>
          ) : (
            <>
              <i className="bi bi-cloud-arrow-up" style={{ fontSize: "1.5rem", color: "var(--accent)", display: "block", marginBottom: ".25rem" }} />
              <span style={{ color: "var(--text-muted)", fontSize: ".8rem" }}>Click to upload</span>
            </>
          )}
        </div>
        <input ref={ref} type="file" accept={accept} style={{ display: "none" }}
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }} />
      </div>
    </div>
  );
}
