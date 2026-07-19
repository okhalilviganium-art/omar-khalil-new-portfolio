"use client";

import Link from "next/link";
import type { Project } from "@/types";
import ImageWithFallback from "@/components/ui/ImageWithFallback";

interface PortfolioProps {
  projects: Project[];
}

export default function Portfolio({ projects }: PortfolioProps) {
  const displayProjects = projects.slice(0, 6);

  return (
    <section className="section" id="sec-2" aria-label="Portfolio">
      <div className="section-content work-wrap">
        <div className="section-label">Portfolio</div>
        <div className="section-title">Selected Work</div>
        {displayProjects.length > 0 ? (
          <div className="projects-grid" id="dyn-projects">
            {displayProjects.map((p) => {
              const categoryLabel = p.categories?.length
                ? p.categories[0].name
                : p.category || "";
              const thumbSrc = p.img || "/images/placeholder.jpg";
              const hasVideo = p.gallery?.some((g) => g.mediaType === "video");

              return (
                <Link
                  key={p.id}
                  href={p.slug ? `/work/${p.slug}` : "#"}
                  className="project-card"
                  aria-label={`${p.title} — ${categoryLabel}`}
                >
                  <ImageWithFallback
                    src={thumbSrc}
                    alt={p.title}
                    loading="lazy"
                    className="project-card-img"
                  />
                  {hasVideo && (
                    <div className="project-video-badge">
                      <i className="bi bi-play-circle" /> Video
                    </div>
                  )}
                  <div className="project-overlay">
                    {categoryLabel && (
                      <div className="project-tag">{categoryLabel}</div>
                    )}
                    <div className="project-name">{p.title}</div>
                    <div className="project-meta">
                      {p.year && <span className="project-year">{p.year}</span>}
                      {p.shortDescription && (
                        <span className="project-desc">
                          {p.shortDescription.length > 80
                            ? p.shortDescription.slice(0, 80) + "..."
                            : p.shortDescription}
                        </span>
                      )}
                    </div>
                    <span className="project-link">
                      <i className="bi bi-arrow-up-right" aria-hidden="true" /> Preview
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">
              <i className="bi bi-grid" />
            </div>
            <div className="empty-state-title">No Projects Yet</div>
            <p className="empty-state-desc">
              Add and publish projects from the dashboard to showcase your work here.
            </p>
          </div>
        )}
        {displayProjects.length > 0 && (
          <div className="view-all-wrap">
            <Link href="/work" className="btn-outline-glow">
              View All Selected Works <i className="bi bi-arrow-right" aria-hidden="true" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}