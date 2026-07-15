import type { AboutData } from "@/types";

interface AboutProps {
  data: AboutData;
}

export default function About({ data }: AboutProps) {
  const visibleStats = data.stats.filter((s) => s.value);
  const hasTools = data.tools && data.tools.length > 0;

  return (
    <section className="section" id="sec-1">
      <div className="section-content">
        <div className="about-grid">
          <div className="about-img-wrap">
            <div className="about-img-frame">
              <img id="dyn-about-img" src={data.image || "/images/placeholder.jpg"} alt="Portrait" />
            </div>
            <div className="about-img-deco" />
            <div className="about-badge">
              <div style={{ fontSize: ".9rem", fontWeight: 700 }} id="dyn-about-exp">
                {data.experience}
              </div>
              <div style={{ color: "rgba(255,255,255,.7)" }}>Experience</div>
            </div>
          </div>
          <div>
            <div className="section-label" id="dyn-about-label">{data.label}</div>
            <div
              className="about-title"
              id="dyn-about-title"
              dangerouslySetInnerHTML={{ __html: data.title }}
            />
            <p className="about-desc" id="dyn-about-desc">
              {data.description.split("\n").map((line, i) => (
                <span key={i}>
                  {line}
                  {i < data.description.split("\n").length - 1 && <br />}
                </span>
              ))}
            </p>
            <div className="skill-pills" id="dyn-about-skills">
              {data.skills.map((skill) => (
                <span className="skill-pill" key={skill}>{skill}</span>
              ))}
            </div>
            {hasTools && (
              <div className="skill-pills" id="dyn-about-tools" style={{ marginTop: ".75rem" }}>
                {data.tools.map((tool) => (
                  <span className="skill-pill" key={tool} style={{ borderColor: "var(--accent2)", opacity: 0.8 }}>{tool}</span>
                ))}
              </div>
            )}
          </div>
        </div>
        {visibleStats.length > 0 && (
          <div className="stats-grid about-stats" id="dyn-about-stats">
            {visibleStats.map((s, i) => (
              <div className="stat-card" key={i}>
                <div className="stat-num">{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
