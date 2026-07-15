"use client";

import { useRef, useState, useCallback } from "react";
import { uploadFileAction } from "@/lib/actions/storage";
import { useToast } from "@/components/dashboard/shared/ToastProvider";

interface Props {
  name: string;
  label: string;
  value?: string;
  mediaId?: string;
  folder?: string;
  accept?: string;
  onUpload?: (url: string, mediaId: string) => void;
}

export default function FileUpload({ name, label, value, mediaId: initialMediaId, folder = "uploads", accept = ".pdf,.doc,.docx", onUpload }: Props) {
  const [url, setUrl] = useState(value || "");
  const [currentMediaId, setCurrentMediaId] = useState(initialMediaId || "");
  const [fileName, setFileName] = useState("");
  const [uploading, setUploading] = useState(false);
  const ref = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFile = useCallback(async (file: File) => {
    setFileName(file.name);
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
        setFileName("");
      }
    } catch {
      toast("Upload failed", "error");
      setFileName("");
    } finally {
      setUploading(false);
    }
  }, [folder, toast, onUpload]);

  return (
    <div className="dash-field">
      <label>{label}</label>
      <input type="hidden" name={name} value={url} />
      <input type="hidden" name={`${name}_media_id`} value={currentMediaId} />
      <div style={{ display: "flex", gap: ".75rem", alignItems: "center" }}>
        <div onClick={() => !uploading && ref.current?.click()}
          style={{ flex: 1, padding: "1rem", border: "1px dashed var(--border)", borderRadius: 8, cursor: uploading ? "wait" : "pointer", opacity: uploading ? 0.5 : 1, display: "flex", alignItems: "center", gap: ".75rem" }}>
          <i className="bi bi-file-earmark-arrow-up" style={{ fontSize: "1.3rem", color: "var(--accent)" }} />
          <div>
            {uploading ? <span style={{ color: "var(--text-muted)", fontSize: ".85rem" }}>Uploading...</span> : fileName || (url ? url.split("/").pop() : "Click to upload file")}
          </div>
        </div>
        <input ref={ref} type="file" accept={accept} style={{ display: "none" }}
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }} />
        {url && (
          <button type="button" onClick={() => { setUrl(""); setFileName(""); setCurrentMediaId(""); }}
            className="dash-btn dash-btn-danger dash-btn-sm">
            <i className="bi bi-trash" />
          </button>
        )}
      </div>
    </div>
  );
}
