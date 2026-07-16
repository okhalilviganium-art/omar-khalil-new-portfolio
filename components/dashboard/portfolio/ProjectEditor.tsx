"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/dashboard/shared/ToastProvider";
import { useUnsavedChanges, UnsavedChangesPrompt } from "@/components/dashboard/shared/UnsavedChangesGuard";
import { addRecentItem } from "@/components/dashboard/shared/RecentItems";
import { FavoriteButton } from "@/components/dashboard/shared/FavoritesPanel";
import { updateProject } from "@/lib/actions/portfolio";
import { uploadFileAction } from "@/lib/actions/storage";
import HistoryPanel from "@/components/dashboard/shared/HistoryPanel";
import { useDraft } from "@/hooks/useDraft";
import type { DbCategory, DbTechTag } from "@/types/supabase";

interface Props {
  project: {
    id: string;
    title: string;
    slug: string;
    shortDescription: string;
    fullDescription: string;
    client: string;
    year: string;
    role: string;
    img: string;
    tags: string;
    stack: string;
    live: string;
    category: string;
    categories: { id: string; name: string; slug: string }[];
    techStack: { id: string; name: string; slug: string }[];
    gallery: { id: string; mediaType: string; mediaId: string; url: string; caption: string; orderIndex: number }[];
    links: { id: string; title: string; url: string; orderIndex: number }[];
    featured: boolean;
    published: boolean;
    publishStatus: string;
    orderIndex: number;
    thumbnailMediaId: string;
    coverImageMediaId: string;
  };
  allCategories: DbCategory[];
  allTechTags: DbTechTag[];
}

type Tab = "general" | "media" | "categories" | "techstack" | "links" | "publishing";

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: "general", label: "General", icon: "bi-pencil" },
  { key: "media", label: "Media", icon: "bi-image" },
  { key: "categories", label: "Categories", icon: "bi-tags" },
  { key: "techstack", label: "Tech Stack", icon: "bi-cpu" },
  { key: "links", label: "Links", icon: "bi-link-45deg" },
  { key: "publishing", label: "Publishing", icon: "bi-globe" },
];

export default function ProjectEditor({ project, allCategories, allTechTags }: Props) {
  const router = useRouter();
  const { toast } = useToast();

  const defaults = {
    title: project.title,
    slug: project.slug,
    shortDescription: project.shortDescription,
    fullDescription: project.fullDescription,
    client: project.client,
    year: project.year,
    role: project.role,
    img: project.img,
    tags: project.tags,
    stack: project.stack,
    live: project.live,
    category: project.category,
    featured: project.featured,
    published: project.published,
    publishStatus: project.publishStatus,
    orderIndex: project.orderIndex,
    thumbnailMediaId: project.thumbnailMediaId,
    coverImageMediaId: project.coverImageMediaId,
  };

  const { values, setValue, setAll, clearDraft, hasDraft, isStale, restoreSnapshot } = useDraft("project:" + project.id, defaults);
  const [saving, setSaving] = useState(false);
  const { showPrompt, handleConfirm, handleCancel } = useUnsavedChanges(hasDraft);
  const [activeTab, setActiveTab] = useState<Tab>("general");

  const [selectedCatIds, setSelectedCatIds] = useState<string[]>(
    project.categories.map((c) => c.id)
  );
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(
    project.techStack.map((t) => t.id)
  );
  const [gallery, setGallery] = useState<{ id: string; mediaType: string; mediaId: string; url: string; caption: string; orderIndex: number }[]>(
    project.gallery
  );
  const [links, setLinks] = useState<{ id: string; title: string; url: string; orderIndex: number }[]>(
    project.links
  );
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const galleryRef = useRef<HTMLInputElement>(null);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  const buildFormData = useCallback((): FormData => {
    const fd = new FormData();
    fd.append("title", values.title);
    fd.append("slug", values.slug);
    fd.append("short_description", values.shortDescription);
    fd.append("full_description", values.fullDescription);
    fd.append("client", values.client);
    fd.append("year", values.year);
    fd.append("role", values.role);
    fd.append("img", values.img);
    fd.append("tags", values.tags);
    fd.append("stack", values.stack);
    fd.append("live", values.live);
    fd.append("category", values.category);
    fd.append("overlay_tag", values.tags.split(",").slice(0, 2).join(" · "));
    fd.append("overlay_name", values.title);
    fd.append("featured", String(values.featured));
    fd.append("published", values.published ? "true" : "false");
    fd.append("sort_order", String(values.orderIndex));
    fd.append("thumbnail_media_id", values.thumbnailMediaId);
    fd.append("cover_image_media_id", values.coverImageMediaId);
    fd.append("category_ids", JSON.stringify(selectedCatIds));
    fd.append("tech_tag_ids", JSON.stringify(selectedTagIds));
    fd.append("gallery", JSON.stringify(gallery.map((g, i) => ({
      media_type: g.mediaType,
      media_id: g.mediaId,
      url: g.url,
      caption: g.caption,
      sort_order: i,
    }))));
    fd.append("links", JSON.stringify(links.map((l, i) => ({
      title: l.title,
      url: l.url,
      sort_order: i,
    }))));
    return fd;
  }, [values, selectedCatIds, selectedTagIds, gallery, links]);

  const doSave = useCallback(async () => {
    setSaving(true);
    const fd = buildFormData();
    const res = await updateProject(project.id, fd);
    setSaving(false);
    if (res.success) {
      clearDraft();
      addRecentItem("project", project.id, values.title, `/dashboard/portfolio/editor?id=${project.id}`);
      toast("Project saved");
    } else {
      toast(res.error || "Save failed", "error");
    }
  }, [buildFormData, project.id, clearDraft, values.title, toast]);

  const toggleCat = (catId: string) => {
    setSelectedCatIds((prev) =>
      prev.includes(catId) ? prev.filter((id) => id !== catId) : [...prev, catId]
    );
  };

  const toggleTag = (tagId: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  const handleGalleryUpload = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploadingGallery(true);
    const newItems = [...gallery];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "projects/gallery");
      const res = await uploadFileAction(fd);
      if (res.success) {
        const isVideo = file.type.startsWith("video/");
        newItems.push({
          id: crypto.randomUUID(),
          mediaType: isVideo ? "video" : "image",
          mediaId: res.mediaId,
          url: res.url,
          caption: "",
          orderIndex: newItems.length,
        });
      }
    }
    setGallery(newItems);
    setUploadingGallery(false);
  }, [gallery]);

  const removeGalleryItem = (idx: number) => {
    setGallery((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateGalleryCaption = (idx: number, caption: string) => {
    setGallery((prev) => prev.map((g, i) => (i === idx ? { ...g, caption } : g)));
  };

  const moveGalleryItem = (fromIdx: number, toIdx: number) => {
    setGallery((prev) => {
      const arr = [...prev];
      const [item] = arr.splice(fromIdx, 1);
      arr.splice(toIdx, 0, item);
      return arr;
    });
  };

  const addLink = () => {
    setLinks((prev) => [...prev, { id: crypto.randomUUID(), title: "", url: "", orderIndex: prev.length }]);
  };

  const updateLink = (idx: number, field: "title" | "url", value: string) => {
    setLinks((prev) => prev.map((l, i) => (i === idx ? { ...l, [field]: value } : l)));
  };

  const removeLink = (idx: number) => {
    setLinks((prev) => prev.filter((_, i) => i !== idx));
  };

  const moveLink = (fromIdx: number, toIdx: number) => {
    setLinks((prev) => {
      const arr = [...prev];
      const [item] = arr.splice(fromIdx, 1);
      arr.splice(toIdx, 0, item);
      return arr;
    });
  };

  const generateSlug = () => {
    const slug = values.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/^-+|-+$/g, "");
    setValue("slug", slug);
  };

  return (
    <div className="dash-content" style={{ padding: "2rem" }}>
      <UnsavedChangesPrompt show={showPrompt} onConfirm={handleConfirm} onCancel={handleCancel} />

      {hasDraft && isStale && (
        <div style={{ display: "flex", alignItems: "center", gap: ".5rem", padding: ".6rem 1rem", marginBottom: "1.5rem", borderRadius: 8, background: "rgba(255,183,77,.08)", border: "1px solid rgba(255,183,77,.25)", fontFamily: "'Space Mono',monospace", fontSize: ".65rem", letterSpacing: ".04em", color: "#ffb74d" }}>
          <i className="bi bi-info-circle" />
          The published version has changed since your last edit. Your draft is preserved.
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem", flexWrap: "wrap", gap: ".75rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
          <button className="dash-btn dash-btn-sm" onClick={() => { if (!hasDraft || confirm("Leave without saving?")) router.push("/dashboard/portfolio"); }}>
            <i className="bi bi-arrow-left" /> Back
          </button>
          <div className="dash-section-title" style={{ margin: 0, border: 0, padding: 0 }}>
            {values.title || "Untitled Project"}
          </div>
          <FavoriteButton entityType="project" entityId={project.id} entityTitle={values.title} entityUrl={`/dashboard/portfolio/editor?id=${project.id}`} />
        </div>
        <button className="dash-btn dash-btn-save" data-shortcut="save" onClick={doSave} disabled={saving} style={{
          fontFamily: "'Space Mono',monospace", fontSize: ".65rem", letterSpacing: ".08em",
          display: "flex", alignItems: "center", gap: 6,
        }}>
          {saving ? (
            <><span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--accent2)", animation: "pulse 1s infinite" }} /> Saving...</>
          ) : (
            <><i className="bi bi-check-lg" /> Save</>
          )}
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: ".25rem", marginBottom: "1.5rem", overflowX: "auto", WebkitOverflowScrolling: "touch", paddingBottom: ".25rem" }}>
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: ".5rem 1rem",
              background: activeTab === tab.key ? "var(--accent)" : "transparent",
              color: activeTab === tab.key ? "#fff" : "var(--text-muted)",
              border: `1px solid ${activeTab === tab.key ? "var(--accent)" : "var(--border)"}`,
              borderRadius: 6,
              fontFamily: "'Space Mono',monospace",
              fontSize: ".7rem",
              letterSpacing: ".06em",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: ".4rem",
              whiteSpace: "nowrap",
              transition: "all .15s",
            }}
          >
            <i className={`bi ${tab.icon}`} /> {tab.label}
          </button>
        ))}
      </div>

      {/* TAB: General */}
      {activeTab === "general" && (
        <div className="dash-section" style={{ marginBottom: "1.5rem" }}>
          <div className="dash-section-title">General Information</div>
          <div className="dash-grid dash-grid-2" style={{ marginTop: "1rem" }}>
            <div className="dash-field" style={{ gridColumn: "1 / -1" }}>
              <label>Title</label>
              <input value={values.title} onChange={(e) => setValue("title", e.target.value)} placeholder="Project title" />
            </div>
            <div className="dash-field">
              <label>Slug</label>
              <div style={{ display: "flex", gap: ".5rem" }}>
                <input value={values.slug} onChange={(e) => setValue("slug", e.target.value)} placeholder="project-slug" style={{ flex: 1 }} />
                <button className="dash-btn dash-btn-sm" onClick={generateSlug} type="button" style={{ whiteSpace: "nowrap" }}>
                  <i className="bi bi-magic" /> Generate
                </button>
              </div>
            </div>
            <div className="dash-field">
              <label>Client</label>
              <input value={values.client} onChange={(e) => setValue("client", e.target.value)} placeholder="Client name (optional)" />
            </div>
            <div className="dash-field">
              <label>Year</label>
              <input value={values.year} onChange={(e) => setValue("year", e.target.value)} placeholder="2025" />
            </div>
            <div className="dash-field">
              <label>Role</label>
              <input value={values.role} onChange={(e) => setValue("role", e.target.value)} placeholder="Your role" />
            </div>
          </div>
          <div className="dash-field" style={{ marginTop: "1rem" }}>
            <label>Short Description</label>
            <textarea rows={2} value={values.shortDescription} onChange={(e) => setValue("shortDescription", e.target.value)} placeholder="Brief one-liner for project cards..." style={{ resize: "vertical" }} />
          </div>
          <div className="dash-field" style={{ marginTop: "1rem" }}>
            <label>Full Description</label>
            <textarea rows={8} value={values.fullDescription} onChange={(e) => setValue("fullDescription", e.target.value)} placeholder="Detailed project description..." style={{ resize: "vertical" }} />
          </div>
        </div>
      )}

      {/* TAB: Media */}
      {activeTab === "media" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div className="dash-section" style={{ marginBottom: 0 }}>
            <div className="dash-section-title">Cover Image</div>
            <div style={{ marginTop: "1rem" }}>
              <CoverImageUpload
                value={values.img}
                onUpload={(url, mid) => setAll({ img: url, thumbnailMediaId: mid })}
              />
            </div>
          </div>

          <div className="dash-section" style={{ marginBottom: 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <div className="dash-section-title" style={{ margin: 0, border: 0, padding: 0 }}>
                Gallery ({gallery.length})
              </div>
              <div style={{ display: "flex", gap: ".5rem" }}>
                <input
                  ref={galleryRef}
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  style={{ display: "none" }}
                  onChange={(e) => handleGalleryUpload(e.target.files)}
                />
                <button className="dash-btn dash-btn-sm dash-btn-add" onClick={() => galleryRef.current?.click()} disabled={uploadingGallery}>
                  <i className="bi bi-plus-lg" /> {uploadingGallery ? "Uploading..." : "Add Media"}
                </button>
              </div>
            </div>

            {gallery.length === 0 && (
              <div style={{ padding: "2rem", border: "1px dashed var(--border)", borderRadius: 8, textAlign: "center", color: "var(--text-muted)" }}>
                <i className="bi bi-images" style={{ fontSize: "1.5rem", display: "block", marginBottom: ".5rem", opacity: .3 }} />
                <div style={{ fontFamily: "'Space Mono',monospace", fontSize: ".75rem" }}>No gallery items yet</div>
                <div style={{ fontFamily: "'Space Mono',monospace", fontSize: ".6rem", marginTop: ".25rem" }}>Click &quot;Add Media&quot; to upload images or videos</div>
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: ".75rem" }}>
              {gallery.map((item, idx) => (
                <div
                  key={item.id}
                  draggable
                  onDragStart={() => setDragIdx(idx)}
                  onDragOver={(e) => { e.preventDefault(); setDragOverIdx(idx); }}
                  onDrop={() => {
                    if (dragIdx !== null && dragOverIdx !== null && dragIdx !== dragOverIdx) {
                      moveGalleryItem(dragIdx, dragOverIdx);
                    }
                    setDragIdx(null);
                    setDragOverIdx(null);
                  }}
                  onDragEnd={() => { setDragIdx(null); setDragOverIdx(null); }}
                  style={{
                    background: "var(--bg-card)",
                    border: `1px solid ${dragOverIdx === idx ? "var(--accent)" : "var(--border)"}`,
                    borderRadius: 8,
                    overflow: "hidden",
                    opacity: dragIdx === idx ? 0.5 : 1,
                    cursor: "grab",
                  }}
                >
                  <div style={{ position: "relative", paddingBottom: "65%", background: "#060c18" }}>
                    {item.mediaType === "video" ? (
                      <video src={item.url} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} muted />
                    ) : (
                      <img src={item.url} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
                        loading="lazy" onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/images/placeholder.jpg"; }} />
                    )}
                    <button onClick={() => removeGalleryItem(idx)}
                      style={{ position: "absolute", top: 4, right: 4, width: 22, height: 22, borderRadius: "50%", background: "rgba(0,0,0,.7)", color: "#fff", border: "none", cursor: "pointer", fontSize: ".6rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <i className="bi bi-trash" />
                    </button>
                    <span style={{ position: "absolute", top: 4, left: 4, padding: "2px 6px", background: item.mediaType === "video" ? "rgba(0,212,255,.9)" : "rgba(108,99,255,.9)", borderRadius: 3, fontFamily: "'Space Mono',monospace", fontSize: ".5rem", color: "#fff", textTransform: "uppercase" }}>
                      {item.mediaType}
                    </span>
                    <div style={{ position: "absolute", bottom: 4, left: 4, right: 4, display: "flex", gap: ".25rem" }}>
                      {idx > 0 && (
                        <button onClick={(e) => { e.stopPropagation(); moveGalleryItem(idx, idx - 1); }}
                          style={{ width: 20, height: 20, borderRadius: 4, background: "rgba(0,0,0,.7)", color: "#fff", border: "none", cursor: "pointer", fontSize: ".5rem" }}>
                          <i className="bi bi-chevron-left" />
                        </button>
                      )}
                      {idx < gallery.length - 1 && (
                        <button onClick={(e) => { e.stopPropagation(); moveGalleryItem(idx, idx + 1); }}
                          style={{ width: 20, height: 20, borderRadius: 4, background: "rgba(0,0,0,.7)", color: "#fff", border: "none", cursor: "pointer", fontSize: ".5rem" }}>
                          <i className="bi bi-chevron-right" />
                        </button>
                      )}
                    </div>
                  </div>
                  <div style={{ padding: ".5rem" }}>
                    <input
                      value={item.caption}
                      onChange={(e) => updateGalleryCaption(idx, e.target.value)}
                      placeholder="Caption (optional)"
                      style={{ width: "100%", padding: ".3rem .5rem", background: "var(--bg-input)", border: "1px solid var(--border)", borderRadius: 4, color: "var(--text)", fontFamily: "'Space Mono',monospace", fontSize: ".6rem" }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB: Categories */}
      {activeTab === "categories" && (
        <div className="dash-section" style={{ marginBottom: "1.5rem" }}>
          <div className="dash-section-title">Categories</div>
          <div style={{ fontFamily: "'Space Mono',monospace", fontSize: ".65rem", color: "var(--text-muted)", marginBottom: "1rem" }}>
            Select one or more categories for this project.
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: ".5rem" }}>
            {allCategories.map((cat) => {
              const isSelected = selectedCatIds.includes(cat.id);
              return (
                <button
                  key={cat.id}
                  onClick={() => toggleCat(cat.id)}
                  style={{
                    padding: ".4rem .8rem",
                    background: isSelected ? "var(--accent)" : "transparent",
                    color: isSelected ? "#fff" : "var(--text-muted)",
                    border: `1px solid ${isSelected ? "var(--accent)" : "var(--border)"}`,
                    borderRadius: 6,
                    fontFamily: "'Space Mono',monospace",
                    fontSize: ".7rem",
                    cursor: "pointer",
                    transition: "all .15s",
                  }}
                >
                  {isSelected && <i className="bi bi-check-lg" style={{ marginRight: ".3rem" }} />}
                  {cat.name}
                </button>
              );
            })}
          </div>
          {selectedCatIds.length > 0 && (
            <div style={{ marginTop: "1rem", fontFamily: "'Space Mono',monospace", fontSize: ".6rem", color: "var(--accent)" }}>
              {selectedCatIds.length} categor{selectedCatIds.length === 1 ? "y" : "ies"} selected
            </div>
          )}
        </div>
      )}

      {/* TAB: Tech Stack */}
      {activeTab === "techstack" && (
        <div className="dash-section" style={{ marginBottom: "1.5rem" }}>
          <div className="dash-section-title">Tech Stack</div>
          <div style={{ fontFamily: "'Space Mono',monospace", fontSize: ".65rem", color: "var(--text-muted)", marginBottom: "1rem" }}>
            Select the tools and technologies used in this project.
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: ".5rem" }}>
            {allTechTags.map((tag) => {
              const isSelected = selectedTagIds.includes(tag.id);
              return (
                <button
                  key={tag.id}
                  onClick={() => toggleTag(tag.id)}
                  style={{
                    padding: ".4rem .8rem",
                    background: isSelected ? "rgba(0,212,255,.15)" : "transparent",
                    color: isSelected ? "var(--accent2)" : "var(--text-muted)",
                    border: `1px solid ${isSelected ? "var(--accent2)" : "var(--border)"}`,
                    borderRadius: 6,
                    fontFamily: "'Space Mono',monospace",
                    fontSize: ".7rem",
                    cursor: "pointer",
                    transition: "all .15s",
                  }}
                >
                  {isSelected && <i className="bi bi-check-lg" style={{ marginRight: ".3rem" }} />}
                  {tag.name}
                </button>
              );
            })}
          </div>
          {selectedTagIds.length > 0 && (
            <div style={{ marginTop: "1rem", fontFamily: "'Space Mono',monospace", fontSize: ".6rem", color: "var(--accent2)" }}>
              {selectedTagIds.length} tag{selectedTagIds.length === 1 ? "" : "s"} selected
            </div>
          )}
        </div>
      )}

      {/* TAB: Links */}
      {activeTab === "links" && (
        <div className="dash-section" style={{ marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <div className="dash-section-title" style={{ margin: 0, border: 0, padding: 0 }}>External Links</div>
            <button className="dash-btn dash-btn-sm dash-btn-add" onClick={addLink}>
              <i className="bi bi-plus-lg" /> Add Link
            </button>
          </div>

          {links.length === 0 && (
            <div style={{ padding: "2rem", border: "1px dashed var(--border)", borderRadius: 8, textAlign: "center", color: "var(--text-muted)" }}>
              <i className="bi bi-link-45deg" style={{ fontSize: "1.5rem", display: "block", marginBottom: ".5rem", opacity: .3 }} />
              <div style={{ fontFamily: "'Space Mono',monospace", fontSize: ".75rem" }}>No links yet</div>
              <div style={{ fontFamily: "'Space Mono',monospace", fontSize: ".6rem", marginTop: ".25rem" }}>Add links to live previews, Behance, Dribbble, GitHub, etc.</div>
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: ".5rem" }}>
            {links.map((link, idx) => (
              <div key={link.id} style={{ display: "flex", alignItems: "center", gap: ".5rem", padding: ".75rem", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 8 }}>
                <div style={{ display: "flex", gap: ".25rem" }}>
                  <button className="dash-btn dash-btn-sm" disabled={idx === 0} onClick={() => moveLink(idx, idx - 1)} style={{ fontSize: ".6rem" }}>
                    <i className="bi bi-chevron-up" />
                  </button>
                  <button className="dash-btn dash-btn-sm" disabled={idx === links.length - 1} onClick={() => moveLink(idx, idx + 1)} style={{ fontSize: ".6rem" }}>
                    <i className="bi bi-chevron-down" />
                  </button>
                </div>
                <input
                  value={link.title}
                  onChange={(e) => updateLink(idx, "title", e.target.value)}
                  placeholder="Title (e.g. Preview, Behance)"
                  style={{ width: 160, padding: ".4rem .6rem", background: "var(--bg-input)", border: "1px solid var(--border)", borderRadius: 4, color: "var(--text)", fontFamily: "'Space Mono',monospace", fontSize: ".7rem" }}
                />
                <input
                  value={link.url}
                  onChange={(e) => updateLink(idx, "url", e.target.value)}
                  placeholder="https://..."
                  style={{ flex: 1, padding: ".4rem .6rem", background: "var(--bg-input)", border: "1px solid var(--border)", borderRadius: 4, color: "var(--text)", fontFamily: "'Space Mono',monospace", fontSize: ".7rem" }}
                />
                <button className="dash-btn dash-btn-danger dash-btn-sm" onClick={() => removeLink(idx)} style={{ fontSize: ".6rem" }}>
                  <i className="bi bi-trash" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: Publishing */}
      {activeTab === "publishing" && (
        <div className="dash-section" style={{ marginBottom: "1.5rem" }}>
          <div className="dash-section-title">Publishing</div>
          <div className="dash-grid dash-grid-2" style={{ marginTop: "1rem" }}>
            <div className="dash-field" style={{ display: "flex", gap: "1.5rem", alignItems: "flex-end", paddingBottom: ".35rem" }}>
              <label style={{ display: "flex", alignItems: "center", gap: ".5rem", cursor: "pointer" }}>
                <input type="checkbox" checked={values.published} onChange={(e) => setValue("published", e.target.checked)} style={{ accentColor: "var(--accent)" }} />
                Published
              </label>
            </div>
            <div className="dash-field" style={{ display: "flex", gap: "1.5rem", alignItems: "flex-end", paddingBottom: ".35rem" }}>
              <label style={{ display: "flex", alignItems: "center", gap: ".5rem", cursor: "pointer" }}>
                <input type="checkbox" checked={values.featured} onChange={(e) => setValue("featured", e.target.checked)} style={{ accentColor: "var(--accent2)" }} />
                Featured on Homepage
              </label>
            </div>
            <div className="dash-field">
              <label>Display Order</label>
              <input type="number" value={values.orderIndex} onChange={(e) => setValue("orderIndex", parseInt(e.target.value) || 0)} min={0} />
            </div>
            <div className="dash-field">
              <label>Status</label>
              <select value={values.publishStatus} onChange={(e) => setValue("publishStatus", e.target.value)}
                style={{ padding: ".5rem .75rem", background: "var(--bg-input)", border: "1px solid var(--border)", borderRadius: 6, color: "var(--text)", fontFamily: "'Space Mono',monospace", fontSize: ".75rem" }}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>
          <div style={{ marginTop: "1rem", padding: "1rem", background: "rgba(108,99,255,.05)", borderRadius: 8, border: "1px solid rgba(108,99,255,.15)" }}>
            <div style={{ fontFamily: "'Space Mono',monospace", fontSize: ".65rem", color: "var(--text-muted)" }}>
              <i className="bi bi-info-circle" style={{ marginRight: ".3rem" }} />
              Slug: <span style={{ color: "var(--accent)" }}>{values.slug || "(auto-generated from title)"}</span>
            </div>
            <div style={{ fontFamily: "'Space Mono',monospace", fontSize: ".65rem", color: "var(--text-muted)", marginTop: ".35rem" }}>
              <i className="bi bi-link-45deg" style={{ marginRight: ".3rem" }} />
              URL: /work/{values.slug || "project-slug"}
            </div>
          </div>
        </div>
      )}

      {/* PREVIEW */}
      <div className="dash-section" style={{ marginBottom: "1.5rem" }}>
        <div className="dash-section-title">Preview</div>
        <div style={{
          transform: "scale(0.55)", transformOrigin: "top left",
          width: "182%", marginBottom: "-40%",
          pointerEvents: "none", opacity: 0.95,
        }}>
          <div style={{ background: "#020409", borderRadius: 10, overflow: "hidden", border: "1px solid var(--border)" }}>
            <div style={{ height: 220, background: "#060c18", overflow: "hidden", position: "relative" }}>
              <img src={values.img || "/images/placeholder.jpg"} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }}
                onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/images/placeholder.jpg"; }} />
              {values.tags && (
                <div style={{ position: "absolute", bottom: 12, left: 12, padding: "4px 12px", background: "rgba(108,99,255,.9)", borderRadius: 4, fontFamily: "'Space Mono',monospace", fontSize: ".55rem", color: "#fff", letterSpacing: ".06em" }}>
                  {values.tags.split(",").slice(0, 2).join(" · ")}
                </div>
              )}
            </div>
            <div style={{ padding: "1.25rem" }}>
              <div style={{ fontFamily: "'Space Mono',monospace", fontSize: ".5rem", color: "var(--accent2)", letterSpacing: ".15em", textTransform: "uppercase", marginBottom: ".25rem" }}>
                {values.year}
              </div>
              <h3 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "1.6rem", color: "#fff", margin: "0 0 .3rem", lineHeight: 1 }}>
                {values.title || "Project Title"}
              </h3>
              <p style={{ fontFamily: "'Outfit',sans-serif", fontSize: ".7rem", color: "var(--text-muted)", marginBottom: ".5rem", lineHeight: 1.4 }}>
                {values.shortDescription || values.fullDescription || "Description goes here"}
              </p>
              {values.client && (
                <div style={{ fontFamily: "'Space Mono',monospace", fontSize: ".5rem", color: "var(--accent)", letterSpacing: ".06em" }}>
                  Client: {values.client}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <HistoryPanel
        entityType="project"
        entityId={project.id}
        currentSnapshot={values}
        localOnly
        onRestore={(snap) => restoreSnapshot(snap as typeof defaults)}
      />

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.3} }`}</style>
    </div>
  );
}

function CoverImageUpload({ value, onUpload }: { value: string; onUpload: (url: string, mid: string) => void }) {
  const [uploading, setUploading] = useState(false);
  const ref = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFile = useCallback(async (file: File) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "projects/covers");
      const res = await uploadFileAction(fd);
      if (res.success) {
        onUpload(res.url, res.mediaId);
      } else {
        toast(res.error, "error");
      }
    } catch {
      toast("Upload failed", "error");
    } finally {
      setUploading(false);
    }
  }, [toast, onUpload]);

  const handleClear = useCallback(() => {
    onUpload("", "");
  }, [onUpload]);

  return (
    <div>
      <div style={{ display: "flex", gap: ".75rem", alignItems: "flex-start" }}>
        {value && (
          <div style={{ position: "relative", flexShrink: 0 }}>
            <img src={value} alt="" style={{ width: 160, height: 100, objectFit: "cover", borderRadius: 8, border: "1px solid var(--border)" }} />
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
              <span style={{ color: "var(--text-muted)", fontSize: ".8rem" }}>Click to upload cover image</span>
            </>
          )}
        </div>
        <input ref={ref} type="file" accept="image/*" style={{ display: "none" }}
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }} />
      </div>
    </div>
  );
}
