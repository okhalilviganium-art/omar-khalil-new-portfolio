"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/dashboard/shared/ToastProvider";
import { useUnsavedChanges, UnsavedChangesPrompt } from "@/components/dashboard/shared/UnsavedChangesGuard";
import { addRecentItem } from "@/components/dashboard/shared/RecentItems";
import { FavoriteButton } from "@/components/dashboard/shared/FavoritesPanel";
import { updateProject } from "@/lib/actions/projects";
import ImageUpload from "@/components/dashboard/shared/ImageUpload";
import GalleryUpload from "@/components/dashboard/shared/GalleryUpload";
import HistoryPanel from "@/components/dashboard/shared/HistoryPanel";

interface Props {
  project: {
    id: string;
    title: string;
    img: string;
    tags: string;
    description: string;
    role: string;
    year: string;
    stack: string;
    live: string;
    overlay_tag: string;
    overlay_name: string;
    gallery_images: string;
    featured: boolean;
    github_url: string;
    slug: string;
    category: string;
    client: string;
    published: boolean;
    gallery_media_ids: string;
    cover_media_id: string;
    video_media_id: string;
    seo_title: string;
    seo_description: string;
    technologies: string;
    services_text: string;
    publish_status: string;
  };
}

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export default function ProjectEditor({ project }: Props) {
  const router = useRouter();
  const { toast } = useToast();

  const [title, setTitle] = useState(project.title);
  const [slug, setSlug] = useState(project.slug || slugify(project.title));
  const [category, setCategory] = useState(project.category);
  const [client, setClient] = useState(project.client);
  const [year, setYear] = useState(project.year);
  const [published, setPublished] = useState(project.published);
  const [featured, setFeatured] = useState(project.featured);
  const [slugEdited, setSlugEdited] = useState(!!project.slug);

  const [description, setDescription] = useState(project.description);
  const [role, setRole] = useState(project.role);
  const [tags, setTags] = useState(project.tags);
  const [stack, setStack] = useState(project.stack);
  const [technologies, setTechnologies] = useState(project.technologies);
  const [servicesText, setServicesText] = useState(project.services_text);
  const [publishStatus, setPublishStatus] = useState(project.publish_status || "published");

  const [img, setImg] = useState(project.img);
  const [coverMediaId, setCoverMediaId] = useState(project.cover_media_id);
  const [galleryImages, setGalleryImages] = useState<string[]>(() => {
    try { return JSON.parse(project.gallery_images || "[]"); } catch { return []; }
  });
  const [galleryMediaIds, setGalleryMediaIds] = useState<string[]>(() => {
    try {
      const parsed = JSON.parse(project.gallery_media_ids || "[]");
      return Array.isArray(parsed) ? parsed : [];
    } catch { return []; }
  });
  const [videoMediaId, setVideoMediaId] = useState(project.video_media_id);
  const [videoUrl, setVideoUrl] = useState("");

  const [live, setLive] = useState(project.live);
  const [githubUrl, setGithubUrl] = useState(project.github_url);

  const [seoTitle, setSeoTitle] = useState(project.seo_title);
  const [seoDescription, setSeoDescription] = useState(project.seo_description);

  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { showPrompt, confirmNavigation, handleConfirm, handleCancel } = useUnsavedChanges(hasChanges);

  const buildFormData = useCallback((): FormData => {
    const fd = new FormData();
    fd.append("title", title);
    fd.append("slug", slug);
    fd.append("category", category);
    fd.append("client", client);
    fd.append("year", year);
    fd.append("published", String(published));
    fd.append("featured", String(featured));
    fd.append("description", description);
    fd.append("role", role);
    fd.append("tags", tags);
    fd.append("stack", stack);
    fd.append("technologies", technologies);
    fd.append("services_text", servicesText);
    fd.append("publish_status", publishStatus);
    fd.append("img", img);
    fd.append("cover_media_id", coverMediaId);
    fd.append("gallery_images", JSON.stringify(galleryImages));
    fd.append("gallery_media_ids", JSON.stringify(galleryMediaIds));
    fd.append("video_media_id", videoMediaId);
    fd.append("live", live);
    fd.append("github_url", githubUrl);
    fd.append("seo_title", seoTitle);
    fd.append("seo_description", seoDescription);
    fd.append("overlay_tag", tags.split(",").slice(0, 2).join(" · "));
    fd.append("overlay_name", title);
    return fd;
  }, [title, slug, category, client, year, published, featured, description, role, tags, stack, technologies, servicesText, img, coverMediaId, galleryImages, galleryMediaIds, videoMediaId, live, githubUrl, seoTitle, seoDescription]);

  const doSave = useCallback(async () => {
    setSaving(true);
    const fd = buildFormData();
    const res = await updateProject(project.id, fd);
    setSaving(false);
    if (res.success) {
      setLastSaved(new Date());
      setHasChanges(false);
      addRecentItem("project", project.id, title, `/dashboard/portfolio/editor?id=${project.id}`);
    } else {
      toast(res.error || "Save failed", "error");
    }
  }, [buildFormData, project.id, toast]);

  useEffect(() => {
    setHasChanges(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => doSave(), 1500);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [title, slug, category, client, year, published, featured, description, role, tags, stack, technologies, servicesText, img, coverMediaId, galleryImages, galleryMediaIds, videoMediaId, live, githubUrl, seoTitle, seoDescription, doSave]);

  const autoSlug = (val: string) => {
    setTitle(val);
    if (!slugEdited) setSlug(slugify(val));
  };

  const previewData = {
    title, tags, desc: description, role, year, stack, live,
    img: img || "/images/placeholder.jpg",
    overlayTag: tags.split(",").slice(0, 2).map((s) => s.trim()).join(" · "),
  };

  return (
    <div className="dash-content" style={{ padding: "2rem" }}>
      <UnsavedChangesPrompt show={showPrompt} onConfirm={handleConfirm} onCancel={handleCancel} />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <button className="dash-btn dash-btn-sm" onClick={() => { if (!hasChanges || confirm("Leave without saving?")) router.push("/dashboard/portfolio"); }}>
            <i className="bi bi-arrow-left" /> Back
          </button>
          <div className="dash-section-title" style={{ margin: 0, border: 0, padding: 0 }}>
            {title || "Untitled Project"}
          </div>
          <FavoriteButton entityType="project" entityId={project.id} entityTitle={title} entityUrl={`/dashboard/portfolio/editor?id=${project.id}`} />
        </div>
        <div style={{ fontFamily: "'Space Mono',monospace", fontSize: ".55rem", letterSpacing: ".08em", color: saving ? "var(--accent2)" : "var(--text-muted)", display: "flex", alignItems: "center", gap: 6 }}>
          {saving ? (
            <><span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent2)", animation: "pulse 1s infinite" }} /> Saving...</>
          ) : lastSaved ? (
            <><i className="bi bi-check-lg" /> Saved {lastSaved.toLocaleTimeString()}</>
          ) : (
            <><i className="bi bi-check-lg" /> Editing</>
          )}
        </div>
      </div>

      {/* GENERAL */}
      <div className="dash-section" style={{ marginBottom: "1.5rem" }}>
        <div className="dash-section-title">General</div>
        <div className="dash-grid dash-grid-2" style={{ marginTop: "1rem" }}>
          <div className="dash-field">
            <label>Title</label>
            <input value={title} onChange={(e) => autoSlug(e.target.value)} placeholder="Project title" />
          </div>
          <div className="dash-field">
            <label>Slug</label>
            <input value={slug} onChange={(e) => { setSlug(e.target.value); setSlugEdited(true); }}
              placeholder="project-slug" />
          </div>
          <div className="dash-field">
            <label>Category</label>
            <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. UI/UX, Web App, Mobile" />
          </div>
          <div className="dash-field">
            <label>Client</label>
            <input value={client} onChange={(e) => setClient(e.target.value)} placeholder="Client name" />
          </div>
          <div className="dash-field">
            <label>Year</label>
            <input value={year} onChange={(e) => setYear(e.target.value)} placeholder="2025" />
          </div>
          <div className="dash-field">
            <label>Status</label>
            <select value={publishStatus} onChange={(e) => setPublishStatus(e.target.value)}
              style={{ padding: ".5rem .75rem", background: "var(--bg-input)", border: "1px solid var(--border)", borderRadius: 6, color: "var(--text)", fontFamily: "'Space Mono',monospace", fontSize: ".75rem" }}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="scheduled">Scheduled</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          <div className="dash-field" style={{ display: "flex", gap: "1.5rem", alignItems: "flex-end", paddingBottom: ".35rem" }}>
            <label style={{ display: "flex", alignItems: "center", gap: ".5rem", cursor: "pointer" }}>
              <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} style={{ accentColor: "var(--accent)" }} />
              Published
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: ".5rem", cursor: "pointer" }}>
              <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} style={{ accentColor: "var(--accent)" }} />
              Featured
            </label>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="dash-section" style={{ marginBottom: "1.5rem" }}>
        <div className="dash-section-title">Content</div>
        <div className="dash-field" style={{ marginTop: "1rem" }}>
          <label>Description</label>
          <textarea rows={5} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Full project description..." />
        </div>
        <div className="dash-grid dash-grid-2" style={{ marginTop: "1rem" }}>
          <div className="dash-field">
            <label>Role</label>
            <input value={role} onChange={(e) => setRole(e.target.value)} placeholder="Your role" />
          </div>
          <div className="dash-field">
            <label>Tags (comma separated)</label>
            <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="UI/UX,Branding,Figma" />
          </div>
          <div className="dash-field">
            <label>Tech Stack</label>
            <input value={stack} onChange={(e) => setStack(e.target.value)} placeholder="React · Figma · Tailwind" />
          </div>
          <div className="dash-field">
            <label>Technologies</label>
            <input value={technologies} onChange={(e) => setTechnologies(e.target.value)} placeholder="Detailed technologies used" />
          </div>
        </div>
        <div className="dash-field" style={{ marginTop: "1rem" }}>
          <label>Services Provided</label>
          <textarea rows={2} value={servicesText} onChange={(e) => setServicesText(e.target.value)} placeholder="Services delivered for this project" />
        </div>
      </div>

      {/* MEDIA */}
      <div className="dash-section" style={{ marginBottom: "1.5rem" }}>
        <div className="dash-section-title">Media</div>
        <div style={{ marginTop: "1rem" }}>
          <ImageUpload name="img" label="Cover Image" value={img} mediaId={coverMediaId} folder="projects"
            onUpload={(url, mid) => { setImg(url); setCoverMediaId(mid); }} />
        </div>
        <div style={{ marginTop: "1rem" }}>
          <GalleryUpload name="gallery_images" label="Gallery" values={galleryImages} mediaIds={galleryMediaIds} folder="projects/gallery" />
        </div>
        <div style={{ marginTop: "1rem" }}>
          <ImageUpload name="video_media_id" label="Video (upload video file or paste URL below)" value={videoUrl} mediaId={videoMediaId} folder="projects/video"
            accept="video/*"
            onUpload={(url, mid) => { setVideoUrl(url); setVideoMediaId(mid); }} />
        </div>
      </div>

      {/* LINKS */}
      <div className="dash-section" style={{ marginBottom: "1.5rem" }}>
        <div className="dash-section-title">Links</div>
        <div className="dash-grid dash-grid-2" style={{ marginTop: "1rem" }}>
          <div className="dash-field">
            <label>Live URL</label>
            <input value={live} onChange={(e) => setLive(e.target.value)} placeholder="https://..." />
          </div>
          <div className="dash-field">
            <label>GitHub URL</label>
            <input value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} placeholder="https://github.com/..." />
          </div>
        </div>
      </div>

      {/* SEO */}
      <div className="dash-section" style={{ marginBottom: "1.5rem" }}>
        <div className="dash-section-title">SEO</div>
        <div className="dash-field" style={{ marginTop: "1rem" }}>
          <label>SEO Title</label>
          <input value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} placeholder={title || "SEO title"} />
        </div>
        <div className="dash-field" style={{ marginTop: "1rem" }}>
          <label>SEO Description</label>
          <textarea rows={2} value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} placeholder="Meta description for search engines" />
        </div>
      </div>

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
              <img src={previewData.img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }}
                onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/images/placeholder.jpg"; }} />
              {previewData.overlayTag && (
                <div style={{ position: "absolute", bottom: 12, left: 12, padding: "4px 12px", background: "rgba(108,99,255,.9)", borderRadius: 4, fontFamily: "'Space Mono',monospace", fontSize: ".55rem", color: "#fff", letterSpacing: ".06em" }}>
                  {previewData.overlayTag}
                </div>
              )}
            </div>
            <div style={{ padding: "1.25rem" }}>
              <div style={{ fontFamily: "'Space Mono',monospace", fontSize: ".5rem", color: "var(--accent2)", letterSpacing: ".15em", textTransform: "uppercase", marginBottom: ".25rem" }}>
                {previewData.year}
              </div>
              <h3 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "1.6rem", color: "#fff", margin: "0 0 .3rem", lineHeight: 1 }}>
                {previewData.title || "Project Title"}
              </h3>
              <p style={{ fontFamily: "'Outfit',sans-serif", fontSize: ".7rem", color: "var(--text-muted)", marginBottom: ".5rem", lineHeight: 1.4 }}>
                {previewData.desc || "Description goes here"}
              </p>
              {previewData.stack && (
                <div style={{ fontFamily: "'Space Mono',monospace", fontSize: ".5rem", color: "var(--accent)", letterSpacing: ".06em" }}>
                  {previewData.stack}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <HistoryPanel entityType="project" entityId={project.id} currentSnapshot={{ title, slug, category, client, year, description, role, tags, stack, technologies, servicesText, img, published, featured }} onRestore={() => router.refresh()} />

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.3} }`}</style>
    </div>
  );
}
