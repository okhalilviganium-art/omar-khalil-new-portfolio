"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/dashboard/shared/ToastProvider";
import {
  createProject,
  deleteProject,
  duplicateProject,
  reorderProjects,
  updateProjectField,
} from "@/lib/actions/portfolio";
import type { DbProject } from "@/types/supabase";

interface Props {
  projects: DbProject[];
}

type ViewMode = "grid" | "list";
type FilterTab = "all" | "published" | "draft" | "featured";

export default function PortfolioList({ projects: initial }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [projects, setProjects] = useState(initial);
  const [view, setView] = useState<ViewMode>("grid");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterTab>("all");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [creating, setCreating] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const categories = Array.from(new Set(projects.map((p) => p.category).filter(Boolean)));

  const isPublished = (p: DbProject) => p.status !== "draft";

  const filtered = projects.filter((p) => {
    if (search) {
      const q = search.toLowerCase();
      if (
        !p.title.toLowerCase().includes(q) &&
        !p.category.toLowerCase().includes(q) &&
        !p.tags.toLowerCase().includes(q)
      ) return false;
    }
    if (filter === "published" && !isPublished(p)) return false;
    if (filter === "draft" && isPublished(p)) return false;
    if (filter === "featured" && !p.featured) return false;
    if (categoryFilter && p.category !== categoryFilter) return false;
    return true;
  });

  const handleCreate = async () => {
    setCreating(true);
    const fd = new FormData();
    fd.append("title", "Untitled Project");
    const res = await createProject(fd);
    setCreating(false);
    if (res.success && res.id) {
      toast("Project created");
      router.push(`/dashboard/portfolio/editor?id=${res.id}`);
    } else {
      toast(("error" in res ? res.error : null) || "Failed", "error");
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"?`)) return;
    const res = await deleteProject(id);
    if (res.success) {
      setProjects((prev) => prev.filter((p) => p.id !== id));
      toast("Project deleted");
    } else {
      toast(res.error || "Failed", "error");
    }
  };

  const handleDuplicate = async (id: string) => {
    const res = await duplicateProject(id);
    if (res.success) {
      toast("Project duplicated");
      router.refresh();
    } else {
      toast(res.error || "Failed", "error");
    }
  };

  const handleToggle = async (id: string, field: "published" | "featured") => {
    const proj = projects.find((p) => p.id === id);
    if (!proj) return;
    if (field === "published") {
      const newStatus = isPublished(proj) ? "draft" : "published";
      setTogglingId(id);
      setProjects((prev) => prev.map((p) => p.id === id ? { ...p, status: newStatus } : p));
      const res = await updateProjectField(id, "published", newStatus !== "draft");
      setTogglingId(null);
      if (res.success) {
        toast(`Published ${newStatus !== "draft" ? "on" : "off"}`);
      } else {
        setProjects((prev) => prev.map((p) => p.id === id ? { ...p, status: proj.status } : p));
        toast(res.error || "Failed", "error");
      }
    } else {
      const newVal = !proj.featured;
      setTogglingId(id);
      setProjects((prev) => prev.map((p) => p.id === id ? { ...p, featured: newVal } : p));
      const res = await updateProjectField(id, "featured", newVal);
      setTogglingId(null);
      if (res.success) {
        toast(`Featured ${newVal ? "on" : "off"}`);
      } else {
        setProjects((prev) => prev.map((p) => p.id === id ? { ...p, featured: !newVal } : p));
        toast(res.error || "Failed", "error");
      }
    }
  };

  const startRename = (id: string, title: string) => {
    setRenamingId(id);
    setRenameValue(title);
  };

  const commitRename = async (id: string) => {
    if (!renameValue.trim()) { setRenamingId(null); return; }
    const old = projects.find((p) => p.id === id)?.title;
    setProjects((prev) => prev.map((p) => p.id === id ? { ...p, title: renameValue.trim() } : p));
    setRenamingId(null);
    const res = await updateProjectField(id, "title", renameValue.trim());
    if (!res.success && old) {
      setProjects((prev) => prev.map((p) => p.id === id ? { ...p, title: old } : p));
      toast(res.error || "Failed", "error");
    }
  };

  const handleDragStart = (id: string) => setDragId(id);
  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    setDragOverId(id);
  };
  const handleDrop = async (targetId: string) => {
    if (!dragId || dragId === targetId) { setDragId(null); setDragOverId(null); return; }
    const ids = projects.map((p) => p.id);
    const fromIdx = ids.indexOf(dragId);
    const toIdx = ids.indexOf(targetId);
    if (fromIdx === -1 || toIdx === -1) { setDragId(null); setDragOverId(null); return; }
    const reordered = [...ids];
    reordered.splice(fromIdx, 1);
    reordered.splice(toIdx, 0, dragId);
    const newProjects = reordered.map((id) => projects.find((p) => p.id === id)!).filter(Boolean);
    setProjects(newProjects);
    setDragId(null);
    setDragOverId(null);
    const res = await reorderProjects(reordered);
    if (!res.success) {
      setProjects(initial);
      toast("Reorder failed", "error");
    }
  };

  const getThumb = (p: DbProject) => p.img || "/images/placeholder.jpg";

  const statusBadge = (p: DbProject) => {
    const s = p.status || "published";
    if (s === "draft") return <span style={{ padding: "2px 8px", background: "rgba(255,170,0,.85)", color: "#000", borderRadius: 4, fontSize: ".55rem", fontFamily: "'Space Mono',monospace", letterSpacing: ".06em", fontWeight: 600 }}>DRAFT</span>;
    if (s === "archived") return <span style={{ padding: "2px 8px", background: "rgba(128,128,128,.85)", color: "#fff", borderRadius: 4, fontSize: ".55rem", fontFamily: "'Space Mono',monospace", letterSpacing: ".06em", fontWeight: 600 }}>ARCHIVED</span>;
    return null;
  };

  return (
    <div className="dash-content" style={{ padding: "2rem" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
        <div className="dash-section-title" style={{ margin: 0, border: 0, padding: 0 }}>
          Portfolio ({projects.length})
        </div>
        <button className="dash-btn dash-btn-add" onClick={handleCreate} disabled={creating}>
          <i className="bi bi-plus-lg" /> {creating ? "Creating..." : "New Project"}
        </button>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: ".75rem", marginBottom: "1.25rem", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: "1 1 200px", maxWidth: "320px" }}>
          <i className="bi bi-search" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", fontSize: ".8rem" }} />
          <input
            value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects..."
            style={{ width: "100%", padding: "0.5rem .75rem .5rem 2rem", background: "var(--bg-input)", border: "1px solid var(--border)", borderRadius: 6, color: "var(--text)", fontFamily: "'Space Mono',monospace", fontSize: ".8rem" }}
          />
        </div>

        {(["all", "published", "draft", "featured"] as FilterTab[]).map((f) => (
          <button key={f} className={`dash-btn dash-btn-sm ${filter === f ? "dash-btn-add" : ""}`}
            style={{ textTransform: "capitalize" }}
            onClick={() => setFilter(f)}>
            {f}
          </button>
        ))}

        {categories.length > 0 && (
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}
            style={{ padding: ".4rem .6rem", background: "var(--bg-input)", border: "1px solid var(--border)", borderRadius: 6, color: "var(--text)", fontFamily: "'Space Mono',monospace", fontSize: ".75rem" }}>
            <option value="">All categories</option>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        )}

        <div style={{ marginLeft: "auto", display: "flex", gap: ".25rem" }}>
          <button className={`dash-btn dash-btn-sm ${view === "grid" ? "dash-btn-add" : ""}`}
            onClick={() => setView("grid")}><i className="bi bi-grid-3x3-gap" /></button>
          <button className={`dash-btn dash-btn-sm ${view === "list" ? "dash-btn-add" : ""}`}
            onClick={() => setView("list")}><i className="bi bi-list-ul" /></button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="dash-card" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>
          <div style={{ fontSize: "2rem", marginBottom: ".75rem" }}>{search || filter !== "all" || categoryFilter ? "\ud83d\udd0d" : "\ud83c\udfa8"}</div>
          <p style={{ fontFamily: "'Outfit',sans-serif", fontSize: ".9rem" }}>
            {search || filter !== "all" || categoryFilter ? "No matching projects" : "No projects yet"}
          </p>
          {!search && filter === "all" && !categoryFilter && (
            <button className="dash-btn dash-btn-add" style={{ marginTop: ".75rem" }} onClick={handleCreate}>
              <i className="bi bi-plus-lg" /> Create your first project
            </button>
          )}
        </div>
      ) : view === "grid" ? (
        <div className="dash-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
          {filtered.map((p) => (
            <div key={p.id}
              draggable onDragStart={() => handleDragStart(p.id)}
              onDragOver={(e) => handleDragOver(e, p.id)}
              onDrop={() => handleDrop(p.id)} onDragEnd={() => { setDragId(null); setDragOverId(null); }}
              style={{
                background: "var(--bg-card)", border: `1px solid ${dragOverId === p.id ? "var(--accent)" : "var(--border)"}`,
                borderRadius: 10, overflow: "hidden", opacity: dragId === p.id ? 0.5 : 1,
                transition: "border-color .15s, opacity .15s", cursor: "grab",
              }}
              className="dash-card"
            >
              <div style={{ height: 160, background: "var(--bg-dark, #060c18)", overflow: "hidden", position: "relative" }}>
                <img src={getThumb(p)} alt={p.title}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/images/placeholder.jpg"; }} />
                <div style={{ position: "absolute", top: 8, left: 8, display: "flex", gap: 4, flexWrap: "wrap" }}>
                  {statusBadge(p)}
                  {p.featured && (
                    <span style={{ padding: "2px 8px", background: "rgba(108,99,255,.9)", color: "#fff", borderRadius: 4, fontSize: ".55rem", fontFamily: "'Space Mono',monospace", letterSpacing: ".06em", fontWeight: 600 }}>FEATURED</span>
                  )}
                </div>
              </div>

              <div style={{ padding: "0.85rem" }}>
                {renamingId === p.id ? (
                  <input autoFocus value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onBlur={() => commitRename(p.id)}
                    onKeyDown={(e) => { if (e.key === "Enter") commitRename(p.id); if (e.key === "Escape") setRenamingId(null); }}
                    style={{ width: "100%", padding: "0.25rem .4rem", background: "var(--bg-input)", border: "1px solid var(--accent)", borderRadius: 4, color: "var(--text)", fontFamily: "'Outfit',sans-serif", fontSize: ".9rem", fontWeight: 600, marginBottom: ".35rem" }}
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: ".95rem", fontWeight: 600, color: "var(--text)", marginBottom: ".35rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {p.title}
                  </div>
                )}
                <div style={{ fontFamily: "'Space Mono',monospace", fontSize: ".6rem", color: "var(--text-muted)", letterSpacing: ".04em", display: "flex", gap: ".5rem", flexWrap: "wrap" }}>
                  {p.category && <span>{p.category}</span>}
                  {p.year && <span>{p.year}</span>}
                </div>
              </div>

              <div style={{ padding: "0 .85rem .85rem", display: "flex", gap: ".3rem", flexWrap: "wrap" }}>
                <button className="dash-btn dash-btn-sm" style={{ flex: 1, fontSize: ".65rem", justifyContent: "center" }}
                  onClick={(e) => { e.stopPropagation(); router.push(`/dashboard/portfolio/editor?id=${p.id}`); }}>
                  <i className="bi bi-pencil" /> Edit
                </button>
                <button className={`dash-btn dash-btn-sm ${isPublished(p) ? "dash-btn-add" : ""}`}
                  style={{ fontSize: ".65rem" }} disabled={togglingId === p.id}
                  onClick={(e) => { e.stopPropagation(); handleToggle(p.id, "published"); }}>
                  <i className={isPublished(p) ? "bi bi-eye" : "bi bi-eye-slash"} />
                </button>
                <button className={`dash-btn dash-btn-sm ${p.featured ? "dash-btn-add" : ""}`}
                  style={{ fontSize: ".65rem" }}
                  onClick={(e) => { e.stopPropagation(); handleToggle(p.id, "featured"); }}>
                  <i className="bi bi-star-fill" />
                </button>
                <button className="dash-btn dash-btn-sm" style={{ fontSize: ".65rem" }}
                  onClick={(e) => { e.stopPropagation(); startRename(p.id, p.title); }}>
                  <i className="bi bi-pencil-square" />
                </button>
                <button className="dash-btn dash-btn-sm" style={{ fontSize: ".65rem" }}
                  onClick={(e) => { e.stopPropagation(); handleDuplicate(p.id); }}>
                  <i className="bi bi-copy" />
                </button>
                <button className="dash-btn dash-btn-danger dash-btn-sm" style={{ fontSize: ".65rem" }}
                  onClick={(e) => { e.stopPropagation(); handleDelete(p.id, p.title); }}>
                  <i className="bi bi-trash" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: ".35rem", minWidth: 700 }}>
          <div style={{ display: "grid", gridTemplateColumns: "44px 1fr 120px 100px 100px 80px 140px", gap: ".5rem", padding: ".5rem .75rem", fontFamily: "'Space Mono',monospace", fontSize: ".6rem", color: "var(--text-muted)", letterSpacing: ".08em", textTransform: "uppercase", borderBottom: "1px solid var(--border)" }}>
            <span></span><span>Title</span><span>Category</span><span>Year</span><span>Status</span><span>Feat</span><span>Actions</span>
          </div>
          {filtered.map((p) => (
            <div key={p.id}
              draggable onDragStart={() => handleDragStart(p.id)}
              onDragOver={(e) => handleDragOver(e, p.id)}
              onDrop={() => handleDrop(p.id)} onDragEnd={() => { setDragId(null); setDragOverId(null); }}
              style={{
                display: "grid", gridTemplateColumns: "44px 1fr 120px 100px 100px 80px 140px", gap: ".5rem", padding: ".5rem .75rem",
                alignItems: "center", background: "var(--bg-card)",
                border: `1px solid ${dragOverId === p.id ? "var(--accent)" : "var(--border)"}`,
                borderRadius: 8, opacity: dragId === p.id ? 0.5 : 1,
                transition: "border-color .15s, opacity .15s", cursor: "grab",
              }}
              className="dash-card"
            >
              <img src={getThumb(p)} alt="" style={{ width: 36, height: 36, borderRadius: 6, objectFit: "cover" }}
                onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/images/placeholder.jpg"; }} />
              <div style={{ minWidth: 0 }}>
                {renamingId === p.id ? (
                  <input autoFocus value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onBlur={() => commitRename(p.id)}
                    onKeyDown={(e) => { if (e.key === "Enter") commitRename(p.id); if (e.key === "Escape") setRenamingId(null); }}
                    style={{ width: "100%", padding: "0.2rem .4rem", background: "var(--bg-input)", border: "1px solid var(--accent)", borderRadius: 4, color: "var(--text)", fontFamily: "'Outfit',sans-serif", fontSize: ".85rem" }}
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: ".85rem", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", cursor: "pointer" }}
                    onClick={() => router.push(`/dashboard/portfolio/editor?id=${p.id}`)}>
                    {p.title}
                  </div>
                )}
              </div>
              <span style={{ fontFamily: "'Space Mono',monospace", fontSize: ".7rem", color: "var(--text-muted)" }}>{p.category || "-"}</span>
              <span style={{ fontFamily: "'Space Mono',monospace", fontSize: ".7rem", color: "var(--text-muted)" }}>{p.year || "-"}</span>
              <span style={{ padding: "2px 8px", background: p.status === "draft" ? "rgba(255,170,0,.85)" : p.status === "archived" ? "rgba(128,128,128,.85)" : "rgba(45,255,179,.85)", color: p.status === "archived" ? "#fff" : "#000", borderRadius: 4, fontSize: ".55rem", fontFamily: "'Space Mono',monospace", letterSpacing: ".06em", fontWeight: 600, textAlign: "center", textTransform: "uppercase" }}>{p.status || "published"}</span>
              <button className={`dash-btn dash-btn-sm`} style={{ fontSize: ".6rem" }}
                onClick={() => handleToggle(p.id, "featured")}>
                <i className={p.featured ? "bi bi-star-fill" : "bi bi-star"} style={{ color: p.featured ? "#ffcc00" : "var(--text-muted)" }} />
              </button>
              <div style={{ display: "flex", gap: ".2rem" }}>
                <button className="dash-btn dash-btn-sm" style={{ fontSize: ".6rem" }}
                  onClick={() => router.push(`/dashboard/portfolio/editor?id=${p.id}`)}><i className="bi bi-pencil" /></button>
                <button className="dash-btn dash-btn-sm" style={{ fontSize: ".6rem" }}
                  onClick={() => startRename(p.id, p.title)}><i className="bi bi-pencil-square" /></button>
                <button className="dash-btn dash-btn-sm" style={{ fontSize: ".6rem" }}
                  onClick={() => handleDuplicate(p.id)}><i className="bi bi-copy" /></button>
                <button className="dash-btn dash-btn-danger dash-btn-sm" style={{ fontSize: ".6rem" }}
                  onClick={() => handleDelete(p.id, p.title)}><i className="bi bi-trash" /></button>
              </div>
            </div>
          ))}
        </div>
        </div>
      )}
    </div>
  );
}
