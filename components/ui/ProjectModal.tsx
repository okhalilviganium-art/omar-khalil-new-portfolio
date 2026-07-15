"use client";

import { useEffect, useCallback } from "react";
import type { Project } from "@/types";

interface ProjectModalProps {
  project: Project | null;
  onClose: () => void;
}

export default function ProjectModal({ project, onClose }: ProjectModalProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (project) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [project, handleKeyDown]);

  const isOpen = !!project;
  const tags = project ? (project.tags || "").split(",") : [];
  const imgSrc = project?.img || "/images/placeholder.jpg";

  return (
    <div
      id="proj-modal"
      role="dialog"
      aria-modal="true"
      className={isOpen ? "open" : ""}
    >
      <div className="modal-backdrop-blur" id="modal-backdrop" onClick={onClose} />
      <div className="modal-box">
        <div className="modal-img-wrap">
          {project && (
            <img
              id="modal-img"
              className="modal-hero-img"
              src={imgSrc}
              alt={project.title}
            />
          )}
          <div className="modal-img-gradient" />
          <button
            className="modal-close-btn"
            id="modal-close"
            aria-label="Close"
            onClick={onClose}
          >
            <i className="bi bi-x-lg" />
          </button>
        </div>
        <div className="modal-body-wrap">
          <div className="modal-tags-row" id="modal-chips">
            {tags.map((t, i) => (
              <span className="modal-chip" key={i}>{t.trim()}</span>
            ))}
          </div>
          <div className="modal-title" id="modal-title">{project?.title}</div>
          <p className="modal-desc" id="modal-desc">{project?.desc}</p>
          <div className="modal-meta-grid">
            <div className="modal-meta-item">
              <span className="modal-meta-label">My Role</span>
              <span className="modal-meta-val" id="modal-role">{project?.role}</span>
            </div>
            <div className="modal-meta-item">
              <span className="modal-meta-label">Year</span>
              <span className="modal-meta-val" id="modal-year">{project?.year}</span>
            </div>
            <div className="modal-meta-item">
              <span className="modal-meta-label">Tech Stack</span>
              <span className="modal-meta-val" id="modal-stack">{project?.stack}</span>
            </div>
          </div>
          <div className="modal-actions">
            <a
              id="modal-live"
              href={project?.live || "#"}
              className="mbtn-primary"
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="bi bi-box-arrow-up-right" /> Live Preview
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
