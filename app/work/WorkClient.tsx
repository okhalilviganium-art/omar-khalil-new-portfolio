"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import type { Project } from "@/types";
import ImageWithFallback from "@/components/ui/ImageWithFallback";

interface Props {
  projects: Project[];
}

export default function WorkClient({ projects }: Props) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedYear, setSelectedYear] = useState("");

  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const p of projects) {
      if (p.categories?.length) p.categories.forEach((c) => set.add(c.name));
      else if (p.category) set.add(p.category);
    }
    return Array.from(set).sort();
  }, [projects]);

  const years = useMemo(() => {
    const set = new Set<string>();
    for (const p of projects) {
      if (p.year) set.add(p.year);
    }
    return Array.from(set).sort().reverse();
  }, [projects]);

  const filtered = useMemo(() => {
    return projects.filter((p) => {
      if (search) {
        const q = search.toLowerCase();
        if (!p.title.toLowerCase().includes(q)) return false;
      }
      if (selectedCategory) {
        const hasCat = p.categories?.some((c) => c.name === selectedCategory) || p.category === selectedCategory;
        if (!hasCat) return false;
      }
      if (selectedYear && p.year !== selectedYear) return false;
      return true;
    });
  }, [projects, search, selectedCategory, selectedYear]);

  return (
    <div className="work-page">
      <div className="work-page-grid-bg" />

      <nav className="work-nav" role="navigation" aria-label="Main navigation">
        <Link href="/" className="work-nav-logo" aria-label="Go to homepage">
          <span className="work-nav-logo-text">Omar Khalil</span>
        </Link>
        <Link href="/" className="work-nav-back">
          <i className="bi bi-arrow-left" /> Home
        </Link>
      </nav>

      <header className="work-hero" role="banner">
        <div className="work-hero-inner">
          <h1 className="work-hero-title">Selected Works</h1>
          <p className="work-hero-sub">
            A curated collection of branding, motion, web, AI and creative projects.
          </p>
        </div>
      </header>

      <section className="work-filters" aria-label="Filter projects">
        <div className="work-filters-inner">
          <div className="work-search-wrap">
            <i className="bi bi-search work-search-icon" aria-hidden="true" />
            <input
              type="search"
              className="work-search"
              placeholder="Search projects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search projects"
            />
          </div>

          <div className="work-filter-group" role="group" aria-label="Filter by category">
            <button
              className={`work-filter-btn ${selectedCategory === "" ? "active" : ""}`}
              onClick={() => setSelectedCategory("")}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                className={`work-filter-btn ${selectedCategory === cat ? "active" : ""}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          {years.length > 0 && (
            <div className="work-filter-group" role="group" aria-label="Filter by year">
              {years.map((y) => (
                <button
                  key={y}
                  className={`work-filter-btn work-filter-year ${selectedYear === y ? "active" : ""}`}
                  onClick={() => setSelectedYear(selectedYear === y ? "" : y)}
                >
                  {y}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      <main className="work-grid-section" role="main" id="main-content">
        <div className="work-grid">
          {filtered.length === 0 ? (
            <div className="work-empty">
              <i className="bi bi-search" aria-hidden="true" />
              <p>No projects match your filters.</p>
            </div>
          ) : (
            filtered.map((p, i) => {
              const catLabel = p.categories?.length
                ? p.categories[0].name
                : p.category || "";
              const thumb = p.img || "/images/placeholder.jpg";
              const hasVideo = p.gallery?.some((g) => g.mediaType === "video");

              return (
                <Link
                  key={p.id}
                  href={`/work/${p.slug}`}
                  className="work-card"
                  style={{ animationDelay: `${i * 0.06}s` }}
                  aria-label={`${p.title} — ${catLabel}`}
                >
                  <div className="work-card-img-wrap">
                    <ImageWithFallback
                      src={thumb}
                      alt={p.title}
                      loading="lazy"
                      className="work-card-img"
                    />
                    {hasVideo && (
                      <div className="work-video-badge">
                        <i className="bi bi-play-circle" /> Video
                      </div>
                    )}
                    <div className="work-card-overlay">
                      <span className="work-card-preview">
                        <i className="bi bi-arrow-up-right" /> Preview
                      </span>
                    </div>
                  </div>
                  <div className="work-card-body">
                    <div className="work-card-meta">
                      {catLabel && <span className="work-card-cat">{catLabel}</span>}
                      {p.year && <span className="work-card-year">{p.year}</span>}
                    </div>
                    <h2 className="work-card-title">{p.title}</h2>
                    {p.shortDescription && (
                      <p className="work-card-desc">
                        {p.shortDescription.length > 100
                          ? p.shortDescription.slice(0, 100) + "..."
                          : p.shortDescription}
                      </p>
                    )}
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </main>

      <footer className="work-footer" role="contentinfo">
        <Link href="/" className="work-footer-link">
          <i className="bi bi-arrow-left" /> Back to Home
        </Link>
      </footer>
    </div>
  );
}