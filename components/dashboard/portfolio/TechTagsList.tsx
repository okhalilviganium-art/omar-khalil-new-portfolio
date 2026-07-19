"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/dashboard/shared/ToastProvider";
import { createTechTag, updateTechTag, deleteTechTag, reorderTechTags } from "@/lib/actions/tech-tags";
import type { DbTechTag } from "@/types/supabase";

export default function TechTagsList({ items: initial }: { items: DbTechTag[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [items, setItems] = useState(initial);
  const [search, setSearch] = useState("");
  const [creating, setCreating] = useState(false);
  const [createName, setCreateName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  const filtered = items.filter((t) => {
    if (!search.trim()) return true;
    return t.name.toLowerCase().includes(search.toLowerCase());
  });

  const handleCreate = useCallback(async () => {
    const name = createName.trim();
    if (!name) return;
    setCreating(true);
    const res = await createTechTag(name);
    setCreating(false);
    if (res.success) {
      toast("Tag created");
      setCreateName("");
      router.refresh();
    } else {
      toast(res.error || "Failed", "error");
    }
  }, [createName, toast, router]);

  const handleRename = useCallback(async (id: string) => {
    if (editingId !== id) return;
    const name = editName.trim();
    if (!name) { setEditingId(null); return; }
    const prev = [...items];
    setItems((prev) => prev.map((t) => t.id === id ? { ...t, name, slug: name.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/^-+|-+$/g, "") } : t));
    setEditingId(null);
    const res = await updateTechTag(id, name);
    if (res.success) {
      toast("Tag renamed");
      router.refresh();
    } else {
      setItems(prev);
      toast(res.error || "Failed", "error");
    }
  }, [editName, editingId, items, toast, router]);

  const handleDelete = useCallback(async (id: string) => {
    const prev = [...items];
    setItems((prev) => prev.filter((t) => t.id !== id));
    setDeletingId(null);
    const res = await deleteTechTag(id);
    if (res.success) {
      toast("Tag deleted");
      router.refresh();
    } else {
      setItems(prev);
      toast(res.error || "Failed", "error");
    }
  }, [items, toast, router]);

  const handleDragEnd = useCallback(async () => {
    setDragIdx(null);
    const ids = items.map((t) => t.id);
    const res = await reorderTechTags(ids);
    if (res.success) {
      toast("Order saved");
      router.refresh();
    } else {
      toast("Reorder failed", "error");
    }
  }, [items, toast, router]);

  const handleDragOver = useCallback((e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (dragIdx === null || dragIdx === idx) return;
    const next = [...items];
    const [moved] = next.splice(dragIdx, 1);
    next.splice(idx, 0, moved);
    setItems(next);
    setDragIdx(idx);
  }, [dragIdx, items]);

  return (
    <div className="dash-content" style={{ padding: "2rem" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem", flexWrap: "wrap", gap: ".75rem" }}>
        <div className="dash-section-title" style={{ margin: 0, border: 0, padding: 0 }}>
          Tech Stack ({items.length})
        </div>
        <button className="dash-btn dash-btn-add" onClick={() => setCreating(!creating)}>
          <i className={`bi bi-${creating ? "x-lg" : "plus-lg"}`} /> {creating ? "Cancel" : "New Tag"}
        </button>
      </div>

      <div style={{ display: "flex", gap: ".75rem", marginBottom: "1.5rem", alignItems: "center" }}>
        <div style={{ position: "relative", flex: "1 1 200px", maxWidth: "400px" }}>
          <i className="bi bi-search" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", fontSize: ".8rem" }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tags..."
            style={{ width: "100%", padding: ".5rem .75rem .5rem 2rem", background: "var(--bg-input)", border: "1px solid var(--border)", borderRadius: 6, color: "var(--text)", fontFamily: "'Space Mono',monospace", fontSize: ".8rem" }}
          />
        </div>
      </div>

      {creating && (
        <div style={{ marginBottom: "1.5rem", border: "1px solid var(--accent2)", borderRadius: 12, padding: "1.25rem", background: "rgba(0,212,255,.05)" }}>
          <div className="dash-section-title" style={{ marginBottom: ".75rem" }}>New Tech Tag</div>
          <div style={{ display: "flex", gap: ".75rem", alignItems: "flex-end" }}>
            <div className="dash-field" style={{ flex: 1, marginBottom: 0 }}>
              <label>Name</label>
              <input
                autoFocus
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleCreate(); }}
                placeholder="e.g. Photoshop, Figma, Next.js..."
              />
            </div>
            <button className="dash-btn dash-btn-save" onClick={handleCreate} disabled={creating || !createName.trim()} style={{ borderColor: "var(--accent2)", background: "var(--accent2)" }}>
              <i className="bi bi-plus-lg" /> Create
            </button>
          </div>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: ".5rem" }}>
        {filtered.map((tag, idx) => (
          <div
            key={tag.id}
            draggable
            onDragStart={() => setDragIdx(idx)}
            onDragOver={(e) => handleDragOver(e, idx)}
            onDragEnd={handleDragEnd}
            style={{
              display: "flex", alignItems: "center", gap: "1rem", padding: ".85rem 1rem",
              background: "var(--bg-card)", border: `1px solid ${dragIdx === idx ? "var(--accent2)" : "var(--border)"}`,
              borderRadius: 10, cursor: "grab", transition: "border-color .15s, opacity .15s",
              opacity: dragIdx !== null && dragIdx !== idx ? 0.6 : 1,
            }}
          >
            <i className="bi bi-grip-vertical" style={{ color: "var(--text-muted)", fontSize: ".85rem", cursor: "grab", flexShrink: 0 }} />

            {editingId === tag.id ? (
              <div style={{ flex: 1, display: "flex", gap: ".5rem", alignItems: "center" }}>
                <input
                  autoFocus
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleRename(tag.id); if (e.key === "Escape") setEditingId(null); }}
                  onBlur={() => handleRename(tag.id)}
                  style={{ flex: 1, padding: ".4rem .6rem", background: "var(--bg-input)", border: "1px solid var(--accent2)", borderRadius: 6, color: "var(--text)", fontFamily: "'Space Mono',monospace", fontSize: ".8rem" }}
                />
                <button className="dash-btn dash-btn-save dash-btn-sm" onClick={() => handleRename(tag.id)} style={{ borderColor: "var(--accent2)", background: "var(--accent2)" }}>
                  <i className="bi bi-check-lg" /> Save
                </button>
                <button className="dash-btn dash-btn-danger dash-btn-sm" onClick={() => setEditingId(null)}>
                  Cancel
                </button>
              </div>
            ) : (
              <>
                <i className="bi bi-cpu" style={{ color: "var(--accent2)", fontSize: "1rem", flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 600, fontSize: ".9rem" }}>{tag.name}</div>
                  <div style={{ fontFamily: "'Space Mono',monospace", fontSize: ".6rem", color: "var(--text-muted)", marginTop: ".15rem" }}>
                    slug: {tag.slug}
                  </div>
                </div>
                <div style={{ display: "flex", gap: ".35rem", flexShrink: 0 }}>
                  <button
                    className="dash-btn dash-btn-add dash-btn-sm"
                    onClick={() => { setEditingId(tag.id); setEditName(tag.name); }}
                    title="Rename"
                    style={{ borderColor: "var(--accent2)" }}
                  >
                    <i className="bi bi-pencil" />
                  </button>
                  <button
                    className="dash-btn dash-btn-danger dash-btn-sm"
                    onClick={() => setDeletingId(tag.id)}
                    title="Delete"
                  >
                    <i className="bi bi-trash" />
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={{ color: "var(--text-muted)", padding: "2rem", textAlign: "center", fontFamily: "'Space Mono',monospace", fontSize: ".8rem" }}>
          {search ? "No tags match your search" : "No tags yet"}
        </div>
      )}

      {deletingId && (() => {
        const tag = items.find((t) => t.id === deletingId);
        return (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}
            onClick={() => setDeletingId(null)}>
            <div onClick={(e) => e.stopPropagation()} style={{
              background: "var(--bg-dark, #060c18)", border: "1px solid var(--border)", borderRadius: 12,
              padding: "2rem", maxWidth: 380, width: "90%", textAlign: "center",
            }}>
              <i className="bi bi-exclamation-triangle" style={{ fontSize: "2rem", color: "var(--danger)", display: "block", marginBottom: "1rem" }} />
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.2rem", letterSpacing: ".06em", marginBottom: ".5rem" }}>Delete Tag?</div>
              <div style={{ color: "var(--text-muted)", fontSize: ".8rem", marginBottom: "1.5rem" }}>
                &quot;{tag?.name}&quot; will be removed from all projects. This action cannot be undone.
              </div>
              <div style={{ display: "flex", gap: ".75rem", justifyContent: "center" }}>
                <button className="dash-btn dash-btn-danger" onClick={() => handleDelete(deletingId)}>
                  <i className="bi bi-trash" /> Delete
                </button>
                <button className="dash-btn dash-btn-add" onClick={() => setDeletingId(null)}>Cancel</button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
