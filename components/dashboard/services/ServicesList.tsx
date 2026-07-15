"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/dashboard/shared/ToastProvider";
import {
  createService, updateService, deleteService,
  reorderServices, toggleServiceActive,
} from "@/lib/actions/services";
import IconPicker from "@/components/dashboard/shared/IconPicker";
import HistoryPanel from "@/components/dashboard/shared/HistoryPanel";
import Services from "@/components/sections/Services";
import type { DbService } from "@/types/supabase";

type Filter = "all" | "active" | "hidden";

export default function ServicesList({ services: initial }: { services: DbService[] }) {
  const [services, setServices] = useState(initial);
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [historyId, setHistoryId] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const filtered = services.filter((s) => {
    if (filter === "active" && !s.active) return false;
    if (filter === "hidden" && s.active) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return s.name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        (s.category || "").toLowerCase().includes(q);
    }
    return true;
  });

  const counts = {
    all: services.length,
    active: services.filter((s) => s.active).length,
    hidden: services.filter((s) => !s.active).length,
  };

  const sync = useCallback((next: DbService[]) => {
    setServices(next);
    router.refresh();
  }, [router]);

  /* ── CREATE ── */
  const handleCreate = useCallback(async (fd: FormData) => {
    const tempId = "temp-" + Date.now();
    const optimistic: DbService = {
      id: tempId,
      icon: (fd.get("icon") as string) || "bi-stars",
      name: (fd.get("name") as string) || "New Service",
      description: (fd.get("description") as string) || "",
      category: (fd.get("category") as string) || "",
      active: fd.get("active") !== "false",
      sort_order: services.length,
      created_at: new Date().toISOString(),
    };
    sync([optimistic, ...services]);
    setShowCreate(false);
    const res = await createService(fd);
    if (res.success) { toast("Service created"); router.refresh(); }
    else { toast(res.error || "Failed", "error"); sync(services); }
  }, [services, sync, toast, router]);

  /* ── UPDATE ── */
  const handleUpdate = useCallback(async (id: string, fd: FormData) => {
    const prev = [...services];
    const idx = services.findIndex((s) => s.id === id);
    if (idx === -1) return;
    const patched = [...services];
    patched[idx] = {
      ...patched[idx],
      icon: (fd.get("icon") as string) || patched[idx].icon,
      name: (fd.get("name") as string) || patched[idx].name,
      description: (fd.get("description") as string) || patched[idx].description,
      category: (fd.get("category") as string) || patched[idx].category,
      active: fd.get("active") !== "false",
    };
    sync(patched);
    setEditingId(null);
    const res = await updateService(id, fd);
    if (res.success) { toast("Service updated"); router.refresh(); }
    else { toast(res.error || "Failed", "error"); sync(prev); }
  }, [services, sync, toast, router]);

  /* ── TOGGLE ACTIVE ── */
  const handleToggle = useCallback(async (id: string, currentActive: boolean) => {
    const prev = [...services];
    sync(services.map((s) => s.id === id ? { ...s, active: !currentActive } : s));
    const res = await toggleServiceActive(id, !currentActive);
    if (res.success) { toast(currentActive ? "Service hidden" : "Service activated"); router.refresh(); }
    else { toast(res.error || "Failed", "error"); sync(prev); }
  }, [services, sync, toast, router]);

  /* ── DELETE ── */
  const handleDelete = useCallback(async (id: string) => {
    const prev = [...services];
    sync(services.filter((s) => s.id !== id));
    setDeletingId(null);
    const res = await deleteService(id);
    if (res.success) { toast("Service deleted"); router.refresh(); }
    else { toast(res.error || "Failed", "error"); sync(prev); }
  }, [services, sync, toast, router]);

  /* ── DRAG & DROP REORDER ── */
  const handleDragStart = useCallback((idx: number) => setDragIdx(idx), []);
  const handleDragOver = useCallback((e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (dragIdx === null || dragIdx === idx) return;
    const next = [...services];
    const [moved] = next.splice(dragIdx, 1);
    next.splice(idx, 0, moved);
    setServices(next);
    setDragIdx(idx);
  }, [dragIdx, services]);
  const handleDragEnd = useCallback(async () => {
    setDragIdx(null);
    const ids = services.map((s) => s.id!);
    const res = await reorderServices(ids);
    if (res.success) { toast("Order saved"); router.refresh(); }
    else toast("Reorder failed", "error");
  }, [services, toast, router]);

  /* ── AUTO-EDIT STATE ── */
  const [editIcon, setEditIcon] = useState("");
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editActive, setEditActive] = useState(true);
  const editTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startEdit = useCallback((s: DbService) => {
    setEditingId(s.id);
    setEditIcon(s.icon);
    setEditName(s.name);
    setEditDesc(s.description);
    setEditCategory(s.category || "");
    setEditActive(s.active !== false);
  }, []);

  useEffect(() => {
    if (!editingId) return;
    if (editTimerRef.current) clearTimeout(editTimerRef.current);
    editTimerRef.current = setTimeout(() => {
      const fd = new FormData();
      fd.append("icon", editIcon);
      fd.append("name", editName);
      fd.append("description", editDesc);
      fd.append("category", editCategory);
      fd.append("active", String(editActive));
      handleUpdate(editingId, fd);
    }, 1200);
    return () => { if (editTimerRef.current) clearTimeout(editTimerRef.current); };
  }, [editIcon, editName, editDesc, editCategory, editActive, editingId]);

  /* ── CREATE FORM STATE ── */
  const [cIcon, setcIcon] = useState("bi-stars");
  const [cName, setcName] = useState("");
  const [cDesc, setcDesc] = useState("");
  const [cCategory, setcCategory] = useState("");
  const [cActive, setCActive] = useState(true);

  const submitCreate = () => {
    const fd = new FormData();
    fd.append("icon", cIcon);
    fd.append("name", cName || "New Service");
    fd.append("description", cDesc);
    fd.append("category", cCategory);
    fd.append("active", String(cActive));
    handleCreate(fd);
    setcIcon("bi-stars"); setcName(""); setcDesc(""); setcCategory(""); setCActive(true);
  };

  const previewData = {
    label: "What I Do",
    title: "Capabilities",
    cards: services.filter((s) => s.active).map((s) => ({
      icon: s.icon,
      name: s.name,
      desc: s.description,
      category: s.category || "",
      active: true,
    })),
  };

  return (
    <div className="dash-content" style={{ padding: "2rem" }}>
      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: ".75rem" }}>
        <div className="dash-section-title" style={{ margin: 0, border: 0, padding: 0 }}>
          Services ({counts.active} active / {counts.all} total)
        </div>
        <div style={{ display: "flex", gap: ".5rem" }}>
          <button className="dash-btn dash-btn-add" onClick={() => setShowPreview(!showPreview)}>
            <i className={`bi bi-${showPreview ? "pencil" : "eye"}`} /> {showPreview ? "Edit" : "Preview"}
          </button>
          <button className="dash-btn dash-btn-save" onClick={() => setShowCreate(!showCreate)}>
            <i className={`bi bi-${showCreate ? "x-lg" : "plus-lg"}`} /> {showCreate ? "Cancel" : "Add Service"}
          </button>
        </div>
      </div>

      {/* LIVE PREVIEW */}
      {showPreview && (
        <div className="dash-section" style={{ marginBottom: "1.5rem" }}>
          <div className="dash-section-title">Live Preview</div>
          <div style={{ transform: "scale(0.5)", transformOrigin: "top left", width: "200%", marginBottom: "-45%", pointerEvents: "none", opacity: 0.95 }}>
            <Services data={previewData} />
          </div>
        </div>
      )}

      {/* SEARCH + FILTER */}
      <div style={{ display: "flex", gap: ".75rem", marginBottom: "1.5rem", flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ position: "relative", flex: "1 1 200px" }}>
          <i className="bi bi-search" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", fontSize: ".75rem" }} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search services..."
            style={{ width: "100%", padding: ".6rem .8rem .6rem 2rem", background: "var(--bg-input)", border: "1px solid var(--border)", borderRadius: 6, color: "var(--text)", fontFamily: "'Outfit', sans-serif", fontSize: ".8rem", outline: "none" }} />
        </div>
        <div style={{ display: "flex", gap: 0, border: "1px solid var(--border)", borderRadius: 6, overflow: "hidden" }}>
          {(["all", "active", "hidden"] as Filter[]).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              style={{ padding: ".5rem 1rem", background: filter === f ? "var(--accent)" : "transparent", color: filter === f ? "#fff" : "var(--text-muted)", border: "none", borderRight: "1px solid var(--border)", cursor: "pointer", fontFamily: "'Space Mono', monospace", fontSize: ".6rem", letterSpacing: ".1em", textTransform: "uppercase", transition: "all .2s" }}>
              {f} ({counts[f]})
            </button>
          ))}
        </div>
      </div>

      {/* CREATE FORM */}
      {showCreate && (
        <div style={{ marginBottom: "1.5rem", border: "1px solid var(--accent)", borderRadius: 12, padding: "1.5rem", background: "rgba(108,99,255,.05)" }}>
          <div className="dash-section-title">New Service</div>
          <div style={{ display: "grid", gridTemplateColumns: "auto 1fr 1fr", gap: "1rem", marginTop: "1rem", alignItems: "start" }}>
            <IconPicker value={cIcon} onChange={setcIcon} />
            <div className="dash-field">
              <label>Title</label>
              <input value={cName} onChange={(e) => setcName(e.target.value)} placeholder="Service name" />
            </div>
            <div className="dash-field">
              <label>Category</label>
              <input value={cCategory} onChange={(e) => setcCategory(e.target.value)} placeholder="e.g. Design, Video, AI" />
            </div>
          </div>
          <div className="dash-field" style={{ marginTop: ".75rem" }}>
            <label>Description</label>
            <textarea rows={2} value={cDesc} onChange={(e) => setcDesc(e.target.value)} placeholder="What this service covers..." />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginTop: ".75rem" }}>
            <label style={{ display: "flex", alignItems: "center", gap: ".4rem", cursor: "pointer", fontFamily: "'Space Mono', monospace", fontSize: ".6rem", color: "var(--text-muted)", letterSpacing: ".1em", textTransform: "uppercase" }}>
              <input type="checkbox" checked={cActive} onChange={(e) => setCActive(e.target.checked)} style={{ accentColor: "var(--accent)" }} /> Active
            </label>
            <button className="dash-btn dash-btn-save" onClick={submitCreate}><i className="bi bi-plus-lg" /> Create Service</button>
          </div>
        </div>
      )}

      {/* SERVICE CARDS */}
      <div style={{ display: "flex", flexDirection: "column", gap: ".6rem" }}>
        {filtered.map((s, idx) => (
          <div key={s.id} draggable onDragStart={() => handleDragStart(idx)} onDragOver={(e) => handleDragOver(e, idx)} onDragEnd={handleDragEnd}
            style={{
              background: "var(--bg-card)", border: `1px solid ${dragIdx === idx ? "var(--accent)" : "var(--border)"}`,
              borderRadius: 10, padding: "1rem", display: "flex", alignItems: "center", gap: "1rem",
              cursor: "grab", transition: "border-color .2s, opacity .2s", opacity: dragIdx !== null && dragIdx !== idx ? 0.6 : 1,
            }}>
            <i className="bi bi-grip-vertical" style={{ color: "var(--text-muted)", fontSize: ".9rem", cursor: "grab", flexShrink: 0 }} />

            {editingId === s.id ? (
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: ".6rem" }}>
                <div style={{ display: "grid", gridTemplateColumns: "auto 1fr 1fr 1fr", gap: ".75rem", alignItems: "start" }}>
                  <IconPicker value={editIcon} onChange={setEditIcon} />
                  <div className="dash-field">
                    <label>Title</label>
                    <input value={editName} onChange={(e) => setEditName(e.target.value)} />
                  </div>
                  <div className="dash-field">
                    <label>Category</label>
                    <input value={editCategory} onChange={(e) => setEditCategory(e.target.value)} />
                  </div>
                  <div className="dash-field">
                    <label>Description</label>
                    <input value={editDesc} onChange={(e) => setEditDesc(e.target.value)} />
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: ".4rem", cursor: "pointer", fontFamily: "'Space Mono', monospace", fontSize: ".55rem", color: "var(--text-muted)", letterSpacing: ".1em", textTransform: "uppercase" }}>
                    <input type="checkbox" checked={editActive} onChange={(e) => setEditActive(e.target.checked)} style={{ accentColor: "var(--accent)" }} /> Active
                  </label>
                  <span style={{ fontFamily: "'Space Mono', monospace", fontSize: ".55rem", color: "var(--accent2)", letterSpacing: ".1em" }}>
                    <i className="bi bi-clock-history" /> Autosaving...
                  </span>
                </div>
              </div>
            ) : (
              <>
                <div style={{ fontSize: "1.3rem", color: "var(--accent)", flexShrink: 0, width: 36, textAlign: "center" }}>
                  <i className={`bi ${s.icon}`} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: ".5rem" }}>
                    <span style={{ fontWeight: 600, fontSize: ".9rem" }}>{s.name}</span>
                    <span style={{
                      padding: ".15rem .5rem", borderRadius: 100, fontSize: ".5rem",
                      fontFamily: "'Space Mono', monospace", letterSpacing: ".1em", textTransform: "uppercase",
                      background: s.active ? "rgba(45,255,179,.1)" : "rgba(255,107,107,.1)",
                      color: s.active ? "var(--success)" : "var(--danger)",
                      border: `1px solid ${s.active ? "rgba(45,255,179,.2)" : "rgba(255,107,107,.2)"}`,
                    }}>
                      {s.active ? "Active" : "Hidden"}
                    </span>
                    {s.category && (
                      <span style={{
                        padding: ".15rem .5rem", borderRadius: 100, fontSize: ".5rem",
                        fontFamily: "'Space Mono', monospace", letterSpacing: ".1em", textTransform: "uppercase",
                        background: "rgba(108,99,255,.1)", color: "var(--accent)",
                        border: "1px solid rgba(108,99,255,.2)",
                      }}>
                        {s.category}
                      </span>
                    )}
                  </div>
                  <div style={{ color: "var(--text-muted)", fontSize: ".75rem", marginTop: ".2rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.description}</div>
                </div>
                <div style={{ display: "flex", gap: ".4rem", flexShrink: 0 }}>
                  <button className="dash-btn dash-btn-add dash-btn-sm" onClick={() => startEdit(s)} title="Edit">
                    <i className="bi bi-pencil" />
                  </button>
                  <button className="dash-btn dash-btn-sm" onClick={() => setHistoryId(s.id!)} title="Version History">
                    <i className="bi bi-clock-history" />
                  </button>
                  <button className="dash-btn dash-btn-sm"
                    onClick={() => handleToggle(s.id!, s.active)}
                    title={s.active ? "Hide" : "Show"}
                    style={{ background: s.active ? "rgba(255,107,107,.08)" : "rgba(45,255,179,.08)", color: s.active ? "var(--danger)" : "var(--success)", border: `1px solid ${s.active ? "rgba(255,107,107,.2)" : "rgba(45,255,179,.2)"}` }}>
                    <i className={`bi bi-${s.active ? "eye-slash" : "eye"}`} />
                  </button>
                  <button className="dash-btn dash-btn-danger dash-btn-sm" onClick={() => setDeletingId(s.id!)} title="Delete">
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
          {search ? "No services match your search" : "No services yet"}
        </div>
      )}

      {/* VERSION HISTORY PANEL */}
      {historyId && (() => {
        const svc = services.find((s) => s.id === historyId);
        if (!svc) return null;
        const snapshot: Record<string, unknown> = { icon: svc.icon, name: svc.name, description: svc.description, category: svc.category || "", active: svc.active };
        return (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}
            onClick={() => setHistoryId(null)}>
            <div onClick={(e) => e.stopPropagation()} style={{ background: "var(--bg-dark, #060c18)", border: "1px solid var(--border)", borderRadius: 12, padding: "1.5rem", maxWidth: 560, width: "95%", maxHeight: "80vh", overflow: "auto" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1rem", letterSpacing: ".06em" }}>Version History — {svc.name}</div>
                <button className="dash-btn dash-btn-sm" onClick={() => setHistoryId(null)}><i className="bi bi-x-lg" /></button>
              </div>
              <HistoryPanel entityType="service" entityId={svc.id!} currentSnapshot={snapshot} />
            </div>
          </div>
        );
      })()}

      {/* DELETE CONFIRMATION DIALOG */}
      {deletingId && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}
          onClick={() => setDeletingId(null)}>
          <div onClick={(e) => e.stopPropagation()} style={{
            background: "var(--bg-dark, #060c18)", border: "1px solid var(--border)", borderRadius: 12,
            padding: "2rem", maxWidth: 380, width: "90%", textAlign: "center",
          }}>
            <i className="bi bi-exclamation-triangle" style={{ fontSize: "2rem", color: "var(--danger)", display: "block", marginBottom: "1rem" }} />
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.2rem", letterSpacing: ".06em", marginBottom: ".5rem" }}>Delete Service?</div>
            <div style={{ color: "var(--text-muted)", fontSize: ".8rem", marginBottom: "1.5rem" }}>
              This action cannot be undone. The service will be permanently removed.
            </div>
            <div style={{ display: "flex", gap: ".75rem", justifyContent: "center" }}>
              <button className="dash-btn dash-btn-danger" onClick={() => handleDelete(deletingId)}>
                <i className="bi bi-trash" /> Delete
              </button>
              <button className="dash-btn dash-btn-add" onClick={() => setDeletingId(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
