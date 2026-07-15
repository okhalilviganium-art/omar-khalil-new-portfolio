"use client";

import type { Project } from "@/types";

interface PortfolioProps {
  projects: Project[];
  onOpenModal: (project: Project) => void;
}

export default function Portfolio({ projects, onOpenModal }: PortfolioProps) {
  return (
    <section className="section" id="sec-2">
      <div className="section-content work-wrap">
        <div className="section-label">Portfolio</div>
        <div className="section-title">Selected Work</div>
        <div className="projects-grid" id="dyn-projects">
          {projects.map((p) => {
            const tagsArr = (p.tags || "").split(",");
            const overlayTag =
              p.overlayTag ||
              (tagsArr[0] || "").trim() +
                (tagsArr[1] ? " \u00b7 " + tagsArr[1].trim() : "");

            return (
              <div
                key={p.id}
                className="project-card"
                data-title={p.title}
                data-img={p.img}
                data-tags={p.tags}
                data-desc={p.desc}
                data-role={p.role}
                data-year={p.year}
                data-stack={p.stack}
                data-live={p.live}
                onClick={() => onOpenModal(p)}
              >
                <img src={p.img || "/images/placeholder.jpg"} alt={p.title} />
                <div className="project-overlay">
                  <div className="project-tag">{overlayTag}</div>
                  <div className="project-name">{p.title}</div>
                  <span className="project-link">
                    <i className="bi bi-arrow-up-right" /> View Details
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
