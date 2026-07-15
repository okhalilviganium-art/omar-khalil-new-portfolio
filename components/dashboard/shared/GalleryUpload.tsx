"use client";

import { useRef, useState, useCallback } from "react";
import { uploadFileAction } from "@/lib/actions/storage";
import { useToast } from "@/components/dashboard/shared/ToastProvider";

interface Props {
  name: string;
  label: string;
  values?: string[];
  mediaIds?: string[];
  folder?: string;
}

export default function GalleryUpload({ name, label, values = [], mediaIds: initialMediaIds = [], folder = "gallery" }: Props) {
  const [urls, setUrls] = useState<string[]>(values);
  const [currentMediaIds, setCurrentMediaIds] = useState<string[]>(initialMediaIds);
  const [uploading, setUploading] = useState(false);
  const ref = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFiles = useCallback(async (files: FileList) => {
    setUploading(true);
    try {
      const newUrls: string[] = [];
      const newMediaIds: string[] = [];
      for (const file of Array.from(files)) {
        try {
          const fd = new FormData();
          fd.append("file", file);
          fd.append("folder", folder);
          const res = await uploadFileAction(fd);
          if (res.success) {
            newUrls.push(res.url);
            newMediaIds.push(res.mediaId);
          } else {
            toast(res.error, "error");
          }
        } catch {
          toast("Upload failed", "error");
        }
      }
      setUrls((prev) => [...prev, ...newUrls]);
      setCurrentMediaIds((prev) => [...prev, ...newMediaIds]);
    } finally {
      setUploading(false);
    }
  }, [folder, toast]);

  const remove = (idx: number) => {
    setUrls((prev) => prev.filter((_, i) => i !== idx));
    setCurrentMediaIds((prev) => prev.filter((_, i) => i !== idx));
  };

  return (
    <div className="dash-field">
      <label>{label}</label>
      <input type="hidden" name={name} value={JSON.stringify(urls)} />
      <input type="hidden" name={`${name}_media_ids`} value={JSON.stringify(currentMediaIds)} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: ".5rem", marginBottom: ".5rem" }}>
        {urls.map((u, i) => (
          <div key={i} style={{ position: "relative", aspectRatio: "1", borderRadius: 8, overflow: "hidden", border: "1px solid var(--border)" }}>
            <img src={u} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            <button type="button" onClick={() => remove(i)} aria-label="Remove image"
              style={{ position: "absolute", top: 4, right: 4, width: 20, height: 20, borderRadius: "50%", background: "rgba(0,0,0,.7)", color: "#fff", border: "none", cursor: "pointer", fontSize: ".6rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <i className="bi bi-x-lg" />
            </button>
          </div>
        ))}
      </div>
      <div onClick={() => !uploading && ref.current?.click()}
        style={{ padding: "1rem", border: "1px dashed var(--border)", borderRadius: 8, textAlign: "center", cursor: uploading ? "wait" : "pointer", opacity: uploading ? 0.5 : 1 }}>
        {uploading ? (
          <span style={{ color: "var(--text-muted)", fontSize: ".85rem" }}><i className="bi bi-hourglass-split" /> Uploading...</span>
        ) : (
          <><i className="bi bi-images" style={{ color: "var(--accent)" }} /> <span style={{ color: "var(--text-muted)", fontSize: ".8rem" }}>Add images</span></>
        )}
      </div>
      <input ref={ref} type="file" accept="image/*" multiple style={{ display: "none" }}
        onChange={(e) => { if (e.target.files?.length) handleFiles(e.target.files); e.target.value = ""; }} />
    </div>
  );
}
