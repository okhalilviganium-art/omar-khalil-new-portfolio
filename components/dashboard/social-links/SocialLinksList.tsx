"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/dashboard/shared/ToastProvider";
import { createSocialLink, updateSocialLink, deleteSocialLink } from "@/lib/actions/social-links";
import { useDraft } from "@/hooks/useDraft";
import type { DbSocialLink } from "@/types/supabase";

const ICON_HINT = "Icon class: bi-github, bi-linkedin, bi-twitter-x, bi-dribbble, bi-behance, etc.";

export default function SocialLinksList({ socialLinks }: { socialLinks: DbSocialLink[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const editDefaults = { icon: "", title: "", url: "" };
  const { values: editVals, setValue: setEditVal, clearDraft: clearEditDraft } = useDraft(
    editingId ? "social:" + editingId : "social:_none",
    editDefaults
  );

  const startEdit = useCallback((link: DbSocialLink) => {
    setEditingId(link.id);
    setEditVal("icon", link.icon);
    setEditVal("title", link.title);
    setEditVal("url", link.url);
  }, [setEditVal]);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"?`)) return;
    try {
      const res = await deleteSocialLink(id);
      if (res.success) { toast("Social link deleted"); router.refresh(); }
      else toast(res.error || "Failed", "error");
    } catch { toast("Failed", "error"); }
  };

  const handleCreate = async (fd: FormData) => {
    try {
      const res = await createSocialLink(fd);
      if (res.success) { toast("Social link created"); setShowCreate(false); router.refresh(); }
      else toast(res.error || "Failed", "error");
    } catch { toast("Failed", "error"); }
  };

  const applyUpdate = useCallback(async (id: string) => {
    const fd = new FormData();
    fd.append("icon", String(editVals.icon));
    fd.append("title", String(editVals.title));
    fd.append("url", String(editVals.url));
    try {
      const res = await updateSocialLink(id, fd);
      if (res.success) { toast("Social link updated"); clearEditDraft(); setEditingId(null); router.refresh(); }
      else toast(res.error || "Failed", "error");
    } catch { toast("Failed", "error"); }
  }, [editVals, clearEditDraft, toast, router]);

  return (
    <div className="dash-content" style={{ padding: "2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: ".75rem" }}>
        <div className="dash-section-title" style={{ margin: 0, border: 0, padding: 0 }}>
          Social Links ({socialLinks.length})
        </div>
        <button className="dash-btn dash-btn-add" onClick={() => setShowCreate(!showCreate)}>
          <i className="bi bi-plus-lg" /> Add Link
        </button>
      </div>

      {showCreate && (
        <div className="dash-section" style={{ marginBottom: "1.5rem", border: "1px solid var(--accent)", borderRadius: "12px", padding: "1.5rem", background: "rgba(108,99,255,.05)" }}>
          <div className="dash-section-title">New Social Link</div>
          <SocialLinkForm onSubmit={handleCreate} onCancel={() => setShowCreate(false)} />
        </div>
      )}

      {socialLinks.map((link) => (
        <div key={link.id} className="dash-card" style={{ marginBottom: ".75rem" }}>
          {editingId === link.id ? (
            <div style={{ padding: "1rem" }}>
              <div className="dash-section-title">Editing: {link.title}</div>
              <div style={{ marginTop: ".75rem" }}>
                <div className="dash-grid dash-grid-2">
                  <div className="dash-field">
                    <label>Icon Class</label>
                    <input value={String(editVals.icon)} onChange={(e) => setEditVal("icon", e.target.value)} required placeholder="bi-github" />
                    <span style={{ color: "var(--text-muted)", fontSize: ".7rem", fontFamily: "'Space Mono',monospace", marginTop: ".25rem", display: "block" }}>
                      {ICON_HINT}
                    </span>
                  </div>
                  <div className="dash-field">
                    <label>Title</label>
                    <input value={String(editVals.title)} onChange={(e) => setEditVal("title", e.target.value)} required placeholder="GitHub" />
                  </div>
                </div>
                <div className="dash-field">
                  <label>URL</label>
                  <input value={String(editVals.url)} onChange={(e) => setEditVal("url", e.target.value)} required placeholder="https://github.com/username" />
                </div>
                <div style={{ display: "flex", gap: ".75rem", marginTop: "1rem" }}>
                  <button className="dash-btn dash-btn-save" onClick={() => applyUpdate(link.id)} data-shortcut="save">
                    <i className="bi bi-check-lg" /> Apply
                  </button>
                  <button className="dash-btn dash-btn-danger dash-btn-sm" onClick={() => { setEditingId(null); clearEditDraft(); }}>Cancel</button>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "1rem" }}>
              <i className={`bi ${link.icon}`} style={{ fontSize: "1.5rem", color: "var(--accent)", width: "2rem", textAlign: "center" }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: ".95rem" }}>{link.title}</div>
                <div style={{ color: "var(--text-muted)", fontSize: ".8rem", fontFamily: "'Space Mono',monospace" }}>{link.url}</div>
              </div>
              <div className="dash-card-actions">
                <button className="dash-btn dash-btn-add dash-btn-sm" onClick={() => startEdit(link)}>
                  <i className="bi bi-pencil" /> Edit
                </button>
                <button className="dash-btn dash-btn-danger dash-btn-sm" onClick={() => handleDelete(link.id, link.title)}>
                  <i className="bi bi-trash" />
                </button>
              </div>
            </div>
          )}
        </div>
      ))}

      {socialLinks.length === 0 && (
        <div style={{ color: "var(--text-muted)", padding: "2rem", textAlign: "center", fontFamily: "'Space Mono',monospace", fontSize: ".8rem" }}>
          No social links yet
        </div>
      )}
    </div>
  );
}

function SocialLinkForm({ onSubmit, onCancel }: { onSubmit: (fd: FormData) => void; onCancel: () => void }) {
  const [icon, setIcon] = useState("");
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");

  const handleSubmit = () => {
    const fd = new FormData();
    fd.append("icon", icon);
    fd.append("title", title);
    fd.append("url", url);
    onSubmit(fd);
  };

  return (
    <div>
      <div className="dash-grid dash-grid-2">
        <div className="dash-field">
          <label>Icon Class</label>
          <input value={icon} onChange={(e) => setIcon(e.target.value)} required placeholder="bi-github" />
          <span style={{ color: "var(--text-muted)", fontSize: ".7rem", fontFamily: "'Space Mono',monospace", marginTop: ".25rem", display: "block" }}>
            {ICON_HINT}
          </span>
        </div>
        <div className="dash-field">
          <label>Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="GitHub" />
        </div>
      </div>
      <div className="dash-field">
        <label>URL</label>
        <input value={url} onChange={(e) => setUrl(e.target.value)} required placeholder="https://github.com/username" />
      </div>
      <div style={{ display: "flex", gap: ".75rem", marginTop: "1rem" }}>
        <button className="dash-btn dash-btn-save" onClick={handleSubmit}><i className="bi bi-check-lg" /> Create</button>
        <button className="dash-btn dash-btn-danger dash-btn-sm" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}
