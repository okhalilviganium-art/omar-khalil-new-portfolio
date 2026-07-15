"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/dashboard/shared/ToastProvider";
import { createSocialLink, updateSocialLink, deleteSocialLink } from "@/lib/actions/social-links";
import type { DbSocialLink } from "@/types/supabase";

const ICON_HINT = "Icon class: bi-github, bi-linkedin, bi-twitter-x, bi-dribbble, bi-behance, etc.";

export default function SocialLinksList({ socialLinks }: { socialLinks: DbSocialLink[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

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

  const handleUpdate = async (id: string, fd: FormData) => {
    try {
      const res = await updateSocialLink(id, fd);
      if (res.success) { toast("Social link updated"); setEditingId(null); router.refresh(); }
      else toast(res.error || "Failed", "error");
    } catch { toast("Failed", "error"); }
  };

  return (
    <div className="dash-content" style={{ padding: "2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
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
              <SocialLinkForm socialLink={link} onSubmit={(fd) => handleUpdate(link.id, fd)} onCancel={() => setEditingId(null)} />
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "1rem" }}>
              <i className={`bi ${link.icon}`} style={{ fontSize: "1.5rem", color: "var(--accent)", width: "2rem", textAlign: "center" }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: ".95rem" }}>{link.title}</div>
                <div style={{ color: "var(--text-muted)", fontSize: ".8rem", fontFamily: "'Space Mono',monospace" }}>{link.url}</div>
              </div>
              <div className="dash-card-actions">
                <button className="dash-btn dash-btn-add dash-btn-sm" onClick={() => setEditingId(link.id)}>
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

function SocialLinkForm({ socialLink, onSubmit, onCancel }: { socialLink?: DbSocialLink; onSubmit: (fd: FormData) => void; onCancel: () => void }) {
  return (
    <form action={onSubmit}>
      <div className="dash-grid dash-grid-2">
        <div className="dash-field">
          <label>Icon Class</label>
          <input name="icon" defaultValue={socialLink?.icon || ""} required placeholder="bi-github" />
          <span style={{ color: "var(--text-muted)", fontSize: ".7rem", fontFamily: "'Space Mono',monospace", marginTop: ".25rem", display: "block" }}>
            {ICON_HINT}
          </span>
        </div>
        <div className="dash-field">
          <label>Title</label>
          <input name="title" defaultValue={socialLink?.title || ""} required placeholder="GitHub" />
        </div>
      </div>
      <div className="dash-field">
        <label>URL</label>
        <input name="url" defaultValue={socialLink?.url || ""} required placeholder="https://github.com/username" />
      </div>
      <div style={{ display: "flex", gap: ".75rem", marginTop: "1rem" }}>
        <button className="dash-btn dash-btn-save" type="submit"><i className="bi bi-check-lg" /> {socialLink ? "Apply" : "Create"}</button>
        <button className="dash-btn dash-btn-danger dash-btn-sm" type="button" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}
