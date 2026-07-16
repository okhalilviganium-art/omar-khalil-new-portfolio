"use client";

import type { HomeData } from "@/types";

interface HeroProps {
  data: HomeData;
  goTo: (idx: number) => void;
}

export default function Hero({ data, goTo }: HeroProps) {
  const socials = data.socials || {};
  const hasSocials = socials.linkedin || socials.behance || socials.github || socials.instagram || socials.x;

  return (
    <section
      className="section active"
      id="sec-0"
      aria-label="Hero"
      style={data.bg ? {
        backgroundImage: `url(${data.bg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      } : undefined}
    >
      <div className="section-content home-content">
        {data.status && (
          <div className="home-status">
            <span style={{
              width: "var(--space-1-5)",
              height: "var(--space-1-5)",
              borderRadius: "var(--radius-full)",
              background: "var(--success, #2dffb3)",
              boxShadow: "0 0 12px rgba(45,255,179,.6), inset 0 0 8px rgba(255,255,255,.2)",
              animation: "pulse 2s infinite",
            }} />
            <span style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: ".7rem",
              letterSpacing: ".15em",
              color: "var(--success, #2dffb3)",
              textTransform: "uppercase",
            }}>
              {data.status}
            </span>
          </div>
        )}

        <div className="home-pre" id="dyn-home-pre">{data.pre}</div>

        <div className="glitch-wrap" data-text={data.name}>
          <h1 className="home-name" id="dyn-home-name">{data.name}</h1>
        </div>

        <p
          className="home-role"
          id="dyn-home-role"
          dangerouslySetInnerHTML={{ __html: data.role }}
        />

        {data.subtitle && (
          <p className="home-subtitle" id="dyn-home-subtitle">
            {data.subtitle}
          </p>
        )}

        <div className="home-cta">
          {data.cta1?.text && (
            <a
              className={data.cta1.style === "outline" ? "btn-outline-glow" : "btn-glow"}
              href={data.cta1.url || "#"}
              onClick={(e) => {
                if (data.cta1.url?.startsWith("#")) {
                  e.preventDefault();
                  const idx = sectionIndexFromHash(data.cta1.url);
                  if (idx !== null) goTo(idx);
                }
              }}
              style={{ cursor: "pointer" }}
            >
              {data.cta1.text}
            </a>
          )}
          {data.cta2?.text && (
            <a
              className={data.cta2.style === "outline" ? "btn-outline-glow" : "btn-glow"}
              href={data.cta2.url || "#"}
              onClick={(e) => {
                if (data.cta2.url?.startsWith("#")) {
                  e.preventDefault();
                  const idx = sectionIndexFromHash(data.cta2.url);
                  if (idx !== null) goTo(idx);
                }
              }}
              style={{ cursor: "pointer" }}
            >
              {data.cta2.text}
            </a>
          )}
        </div>

        {data.portrait && (
          <div className="hero-portrait">
            <img
              src={data.portrait}
              alt={data.name}
              style={{
                width: 180,
                height: 180,
                borderRadius: "var(--radius-full)",
                objectFit: "cover",
                border: "2px solid var(--border)",
                boxShadow: "0 8px 24px rgba(108,99,255,.25), 0 0 0 1px var(--accent)",
              }}
            />
          </div>
        )}

        {hasSocials && (
          <div className="hero-socials">
            {socials.linkedin && (
              <a href={socials.linkedin} target="_blank" rel="noopener noreferrer" style={{ color: "var(--text-muted)", fontSize: "1.2rem", transition: "color .2s" }}>
                <i className="bi bi-linkedin" />
              </a>
            )}
            {socials.behance && (
              <a href={socials.behance} target="_blank" rel="noopener noreferrer" style={{ color: "var(--text-muted)", fontSize: "1.2rem", transition: "color .2s" }}>
                <i className="bi bi-behance" />
              </a>
            )}
            {socials.github && (
              <a href={socials.github} target="_blank" rel="noopener noreferrer" style={{ color: "var(--text-muted)", fontSize: "1.2rem", transition: "color .2s" }}>
                <i className="bi bi-github" />
              </a>
            )}
            {socials.instagram && (
              <a href={socials.instagram} target="_blank" rel="noopener noreferrer" style={{ color: "var(--text-muted)", fontSize: "1.2rem", transition: "color .2s" }}>
                <i className="bi bi-instagram" />
              </a>
            )}
            {socials.x && (
              <a href={socials.x} target="_blank" rel="noopener noreferrer" style={{ color: "var(--text-muted)", fontSize: "1.2rem", transition: "color .2s" }}>
                <i className="bi bi-twitter-x" />
              </a>
            )}
          </div>
        )}

      </div>
    </section>
  );
}

const SECTION_MAP: Record<string, number> = {
  "#portfolio": 2,
  "#about": 1,
  "#services": 4,
  "#contact": 5,
  "#stats": 3,
};

function sectionIndexFromHash(hash: string): number | null {
  return SECTION_MAP[hash] ?? null;
}