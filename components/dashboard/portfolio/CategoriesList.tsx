"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/dashboard/shared/ToastProvider";
import { createCategory, updateCategory, deleteCategory, reorderCategories } from "@/lib/actions/categories";
import type { DbCategory } from "@/types/supabase";

export default function CategoriesList({ items: initial }: { items: DbCategory[] }) {
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

  const filtered = items.filter((c) => {
    if (!search.trim()) return true;
    return c.name.toLowerCase().includes(search.toLowerCase());
  });

  const handleCreate = useCallback(async () => {
    const name = createName.trim();
    if (!name) return;
    setCreating(true);
    const res = await createCategory(name);
    setCreating(false);
    if (res.success) {
      toast("Category created");
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
    setItems((prev) => prev.map((c) => c.id === id ? { ...c, name, slug: name.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/^-+|-+$/g, "") } : c));
    setEditingId(null);
    const res = await updateCategory(id, name);
    if (res.success) {
      toast("Category renamed");
      router.refresh();
    } else {
      setItems(prev);
      toast(res.error || "Failed", "error");
    }
  }, [editName, editingId, items, toast, router]);

  const handleDelete = useCallback(async (id: string) => {
    const prev = [...items];
    setItems((prev) => prev.filter((c) => c.id !== id));
    setDeletingId(null);
    const res = await deleteCategory(id);
    if (res.success) {
      toast("Category deleted");
      router.refresh();
    } else {
      setItems(prev);
      toast(res.error || "Failed", "error");
    }
  }, [items, toast, router]);

  const handleDragEnd = useCallback(async () => {
    setDragIdx(null);
    const ids = items.map((c) => c.id);
    const res = await reorderCategories(ids);
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
          Categories ({items.length})
        </div>
        <button className="dash-btn dash-btn-add" onClick={() => setCreating(!creating)}>
          <i className={`bi bi-${creating ? "x-lg" : "plus-lg"}`} /> {creating ? "Cancel" : "New Category"}
        </button>
      </div>

      <div style={{ display: "flex", gap: ".75rem", marginBottom: "1.5rem", alignItems: "center" }}>
        <div style={{ position: "relative", flex: "1 1 200px", maxWidth: "400px" }}>
          <i className="bi bi-search" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", fontSize: ".8rem" }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search categories..."
            style={{ width: "100%", padding: ".5rem .75rem .5rem 2rem", background: "var(--bg-input)", border: "1px solid var(--border)", borderRadius: 6, color: "var(--text)", fontFamily: "'Space Mono',monospace", fontSize: ".8rem" }}
          />
        </div>
      </div>

      {creating && (
        <div style={{ marginBottom: "1.5rem", border: "1px solid var(--accent)", borderRadius: 12, padding: "1.25rem", background: "rgba(108,99,255,.05)" }}>
          <div className="dash-section-title" style={{ marginBottom: ".75rem" }}>New Category</div>
          <div style={{ display: "flex", gap: ".75rem", alignItems: "flex-end" }}>
            <div className="dash-field" style={{ flex: 1, marginBottom: 0 }}>
              <label>Name</label>
              <input
                autoFocus
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleCreate(); }}
                placeholder="e.g. Branding, UI/UX, Motion..."
              />
            </div>
            <button className="dash-btn dash-btn-save" onClick={handleCreate} disabled={creating || !createName.trim()}>
              <i className="bi bi-plus-lg" /> Create
            </button>
          </div>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: ".5rem" }}>
        {filtered.map((cat, idx) => (
          <div
            key={cat.id}
            draggable
            onDragStart={() => setDragIdx(idx)}
            onDragOver={(e) => handleDragOver(e, idx)}
            onDragEnd={handleDragEnd}
            style={{
              display: "flex", alignItems: "center", gap: "1rem", padding: ".85rem 1rem",
              background: "var(--bg-card)", border: `1px solid ${dragIdx === idx ? "var(--accent)" : "var(--border)"}`,
              borderRadius: 10, cursor: "grab", transition: "border-color .15s, opacity .15s",
              opacity: dragIdx !== null && dragIdx !== idx ? 0.6 : 1,
            }}
          >
            <i className="bi bi-grip-vertical" style={{ color: "var(--text-muted)", fontSize: ".85rem", cursor: "grab", flexShrink: 0 }} />

            {editingId === cat.id ? (
              <div style={{ flex: 1, display: "flex", gap: ".5rem", alignItems: "center" }}>
                <input
                  autoFocus
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleRename(cat.id); if (e.key === "Escape") setEditingId(null); }}
                  onBlur={() => handleRename(cat.id)}
                  style={{ flex: 1, padding: ".4rem .6rem", background: "var(--bg-input)", border: "1px solid var(--accent)", borderRadius: 6, color: "var(--text)", fontFamily: "'Space Mono',monospace", fontSize: ".8rem" }}
                />
                <button className="dash-btn dash-btn-save dash-btn-sm" onClick={() => handleRename(cat.id)}>
                  <i className="bi bi-check-lg" /> Save
                </button>
                <button className="dash-btn dash-btn-danger dash-btn-sm" onClick={() => setEditingId(null)}>
                  Cancel
                </button>
              </div>
            ) : (
              <>
                <i className="bi bi-tag" style={{ color: "var(--accent)", fontSize: "1rem", flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 600, fontSize: ".9rem" }}>{cat.name}</div>
                  <div style={{ fontFamily: "'Space Mono',monospace", fontSize: ".6rem", color: "var(--text-muted)", marginTop: ".15rem" }}>
                    slug: {cat.slug}
                  </div>
                </div>
                <div style={{ display: "flex", gap: ".35rem", flexShrink: 0 }}>
                  <button
                    className="dash-btn dash-btn-add dash-btn-sm"
                    onClick={() => { setEditingId(cat.id); setEditName(cat.name); }}
                    title="Rename"
                  >
                    <i className="bi bi-pencil" />
                  </button>
                  <button
                    className="dash-btn dash-btn-danger dash-btn-sm"
                    onClick={() => setDeletingId(cat.id)}
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
          {search ? "No categories match your search" : "No categories yet"}
        </div>
      )}

      {deletingId && (() => {
        const cat = items.find((c) => c.id === deletingId);
        return (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}
            onClick={() => setDeletingId(null)}>
            <div onClick={(e) => e.stopPropagation()} style={{
              background: "var(--bg-dark, #060c18)", border: "1px solid var(--border)", borderRadius: 12,
              padding: "2rem", maxWidth: 380, width: "90%", textAlign: "center",
            }}>
              <i className="bi bi-exclamation-triangle" style={{ fontSize: "2rem", color: "var(--danger)", display: "block", marginBottom: "1rem" }} />
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.2rem", letterSpacing: ".06em", marginBottom: ".5rem" }}>Delete Category?</div>
              <div style={{ color: "var(--text-muted)", fontSize: ".8rem", marginBottom: "1.5rem" }}>
                &quot;{cat?.name}&quot; will be removed from all projects. This action cannot be undone.
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
