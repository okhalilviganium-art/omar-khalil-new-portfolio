"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import type { Project, ProjectGalleryItem } from "@/types";

interface NavProject {
  slug: string | null;
  title: string;
}

interface Props {
  project: Project;
  prevProject: NavProject | null;
  nextProject: NavProject | null;
  relatedProjects: Project[];
}

export default function ProjectDetailClient({
  project,
  prevProject,
  nextProject,
  relatedProjects,
}: Props) {
  const gallery: ProjectGalleryItem[] = project.gallery ?? [];
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [imgTransition, setImgTransition] = useState(false);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  const openLightbox = useCallback((index: number) => setLightboxIndex(index), []);
  const closeLightbox = useCallback(() => setLightboxIndex(null), []);

  const goPrev = useCallback(() => {
    setLightboxIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : prev));
  }, []);

  const goNext = useCallback(() => {
    setLightboxIndex((prev) => (prev !== null && prev < gallery.length - 1 ? prev + 1 : prev));
  }, [gallery.length]);

  const navigateTo = useCallback((target: number) => {
    setImgTransition(true);
    setTimeout(() => {
      setLightboxIndex(target);
      setTimeout(() => setImgTransition(false), 50);
    }, 100);
  }, []);

  const goPrevAnimated = useCallback(() => {
    if (lightboxIndex === null || lightboxIndex <= 0) return;
    navigateTo(lightboxIndex - 1);
  }, [lightboxIndex, navigateTo]);

  const goNextAnimated = useCallback(() => {
    if (lightboxIndex === null || lightboxIndex >= gallery.length - 1) return;
    navigateTo(lightboxIndex + 1);
  }, [lightboxIndex, gallery.length, navigateTo]);

  useEffect(() => {
    if (lightboxIndex === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") goPrevAnimated();
      if (e.key === "ArrowRight") goNextAnimated();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightboxIndex, closeLightbox, goPrevAnimated, goNextAnimated]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
      if (dx > 0) goPrevAnimated();
      else goNextAnimated();
    }
  }, [goPrevAnimated, goNextAnimated]);

  const lightboxItem = lightboxIndex !== null ? gallery[lightboxIndex] : null;

  useEffect(() => {
    if (lightboxIndex === null) return;
    const preload = (idx: number) => {
      if (idx >= 0 && idx < gallery.length) {
        const img = new Image();
        img.src = gallery[idx].url;
      }
    };
    preload(lightboxIndex - 1);
    preload(lightboxIndex + 1);
  }, [lightboxIndex, gallery]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [project.slug]);

  const catLabel =
    project.categories?.length
      ? project.categories.map((c) => c.name).join(", ")
      : project.category || "";
  const techTags = project.techStack?.length ? project.techStack.map((t) => t.name) : [];

  return (
    <div className="pd-page" id="main-content">
      <div className="pd-page-grid-bg" />

      {/* Lightbox */}
      {lightboxIndex !== null && lightboxItem && (
        <div
          className="pd-lightbox"
          onClick={closeLightbox}
          role="dialog"
          aria-label="Image lightbox"
          aria-modal="true"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <button className="pd-lightbox-close" onClick={closeLightbox} aria-label="Close lightbox">
            <i className="bi bi-x-lg" />
          </button>

          {lightboxIndex > 0 && (
            <button
              className="pd-lightbox-nav pd-lightbox-prev"
              onClick={(e) => { e.stopPropagation(); goPrevAnimated(); }}
              aria-label="Previous image"
            >
              <i className="bi bi-chevron-left" />
            </button>
          )}

          <img
            src={lightboxItem.url}
            alt={lightboxItem.caption || "Enlarged view"}
            className="pd-lightbox-img"
            style={{ opacity: imgTransition ? 0 : 1, transition: "opacity .15s ease" }}
          />

          {lightboxIndex < gallery.length - 1 && (
            <button
              className="pd-lightbox-nav pd-lightbox-next"
              onClick={(e) => { e.stopPropagation(); goNextAnimated(); }}
              aria-label="Next image"
            >
              <i className="bi bi-chevron-right" />
            </button>
          )}
        </div>
      )}

      {/* Nav */}
      <nav className="pd-nav" role="navigation" aria-label="Main navigation">
        <Link href="/" className="pd-nav-logo" aria-label="Go to homepage">
          <span className="pd-nav-logo-text">Omar Khalil</span>
        </Link>
        <Link href="/work" className="pd-nav-back">
          <i className="bi bi-arrow-left" /> All Works
        </Link>
      </nav>

      {/* Hero */}
      <header className="pd-hero" role="banner">
        {project.img && (
          <div className="pd-hero-img-wrap">
            <img
              src={project.img}
              alt={project.title}
              className="pd-hero-img"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />
            <div className="pd-hero-img-gradient" />
          </div>
        )}
        <div className="pd-hero-content">
          <div className="pd-hero-tags">
            {catLabel &&
              catLabel.split(", ").map((c) => (
                <span key={c} className="pd-tag">
                  {c}
                </span>
              ))}
            {project.year && <span className="pd-tag pd-tag-dim">{project.year}</span>}
          </div>
          <h1 className="pd-hero-title">{project.title}</h1>
          {project.shortDescription && (
            <p className="pd-hero-sub">{project.shortDescription}</p>
          )}
          <div className="pd-hero-meta">
            {project.client && (
              <div className="pd-meta-item">
                <span className="pd-meta-label">Client</span>
                <span className="pd-meta-val">{project.client}</span>
              </div>
            )}
            {project.year && (
              <div className="pd-meta-item">
                <span className="pd-meta-label">Year</span>
                <span className="pd-meta-val">{project.year}</span>
              </div>
            )}
            {project.category && (
              <div className="pd-meta-item">
                <span className="pd-meta-label">Service</span>
                <span className="pd-meta-val">{project.category}</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Overview */}
      {project.fullDescription && (
        <section className="pd-section" aria-label="Project overview">
          <div className="pd-section-inner">
            <h2 className="pd-section-title">Overview</h2>
            <div className="pd-overview-text">
              {project.fullDescription.split("\n").map((para, i) =>
                para.trim() ? <p key={i}>{para}</p> : null
              )}
            </div>
          </div>
        </section>
      )}

      {/* Gallery */}
      {project.gallery && project.gallery.length > 0 && (
        <section className="pd-section" aria-label="Project gallery">
          <div className="pd-section-inner">
            <h2 className="pd-section-title">Gallery</h2>
            <div className="pd-gallery-grid">
              {project.gallery.map((item, i) => (
                <button
                  key={i}
                  className="pd-gallery-item"
                  onClick={() => openLightbox(i)}
                  aria-label={`View ${item.caption || "image ${i + 1}"}`}
                >
                  {item.mediaType === "video" ? (
                    <video
                      src={item.url}
                      className="pd-gallery-img"
                      preload="metadata"
                      muted
                      playsInline
                      onError={(e) => {
                        const v = e.currentTarget as HTMLVideoElement;
                        v.style.display = "none";
                      }}
                      onMouseEnter={(e) => (e.currentTarget as HTMLVideoElement).play()}
                      onMouseLeave={(e) => {
                        const v = e.currentTarget as HTMLVideoElement;
                        v.pause();
                        v.currentTime = 0;
                      }}
                    />
                  ) : (
                    <img
                      src={item.url}
                      alt={item.caption || project.title}
                      className="pd-gallery-img"
                      loading="lazy"
                    />
                  )}
                  {item.caption && <span className="pd-gallery-caption">{item.caption}</span>}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Tech Stack */}
      {techTags.length > 0 && (
        <section className="pd-section" aria-label="Technology stack">
          <div className="pd-section-inner">
            <h2 className="pd-section-title">Tech Stack</h2>
            <div className="pd-tech-grid">
              {techTags.map((tag) => (
                <span key={tag} className="pd-tech-chip">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Links */}
      {project.links && project.links.length > 0 && (
        <section className="pd-section" aria-label="Project links">
          <div className="pd-section-inner">
            <h2 className="pd-section-title">Links</h2>
            <div className="pd-links-grid">
              {project.links.map((link, i) => (
                <a
                  key={i}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pd-link-card"
                  aria-label={`Open ${link.title}`}
                >
                  <span className="pd-link-icon">
                    <i className="bi bi-box-arrow-up-right" />
                  </span>
                  <span className="pd-link-label">{link.title}</span>
                  <i className="bi bi-arrow-up-right pd-link-arrow" />
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Prev / Next Nav */}
      {(prevProject || nextProject) && (
        <section className="pd-section pd-nav-section" aria-label="Previous and next projects">
          <div className="pd-section-inner pd-nav-grid">
            {prevProject && prevProject.slug ? (
              <Link
                href={`/work/${prevProject.slug}`}
                className="pd-nav-card pd-nav-prev"
                aria-label={`Previous project: ${prevProject.title}`}
              >
                <span className="pd-nav-card-label">
                  <i className="bi bi-arrow-left" /> Previous
                </span>
                <span className="pd-nav-card-title">{prevProject.title}</span>
              </Link>
            ) : (
              <div />
            )}
            {nextProject && nextProject.slug ? (
              <Link
                href={`/work/${nextProject.slug}`}
                className="pd-nav-card pd-nav-next"
                aria-label={`Next project: ${nextProject.title}`}
              >
                <span className="pd-nav-card-label">
                  Next <i className="bi bi-arrow-right" />
                </span>
                <span className="pd-nav-card-title">{nextProject.title}</span>
              </Link>
            ) : (
              <div />
            )}
          </div>
        </section>
      )}

      {/* Related */}
      {relatedProjects.length > 0 && (
        <section className="pd-section pd-related" aria-label="Related projects">
          <div className="pd-section-inner">
            <h2 className="pd-section-title">Related Work</h2>
            <div className="pd-related-grid">
              {relatedProjects.map((rp) => {
                const rpCat = rp.categories?.length
                  ? rp.categories[0].name
                  : rp.category || "";
                return (
                  <Link
                    key={rp.id}
                    href={`/work/${rp.slug}`}
                    className="pd-related-card"
                    aria-label={`${rp.title} — ${rpCat}`}
                  >
                    <div className="pd-related-img-wrap">
                      <img
                        src={rp.img || "/images/placeholder.jpg"}
                        alt={rp.title}
                        className="pd-related-img"
                        loading="lazy"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src =
                            "/images/placeholder.jpg";
                        }}
                      />
                    </div>
                    <div className="pd-related-body">
                      {rpCat && <span className="pd-related-cat">{rpCat}</span>}
                      <h3 className="pd-related-title">{rp.title}</h3>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      <footer className="pd-footer" role="contentinfo">
        <Link href="/work" className="pd-footer-link">
          <i className="bi bi-arrow-left" /> Back to All Works
        </Link>
      </footer>
    </div>
  );
}
