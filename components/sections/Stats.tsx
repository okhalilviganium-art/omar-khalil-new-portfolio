import type { StatsData } from "@/types";

interface StatsProps {
  data: StatsData;
}

export default function Stats({ data }: StatsProps) {
  return (
    <section className="section" id="sec-3">
      <div className="section-content stats-wrap">
        <div className="section-label" id="dyn-stats-label">{data.label}</div>
        <div className="section-title" id="dyn-stats-title">{data.title}</div>
        <div className="stats-grid" id="dyn-stats-cards">
          {data.cards.map((c, i) => (
            <div className="stat-card" key={i}>
              <div className="stat-num counter" data-target={c.number}>
                0
              </div>
              <div className="stat-label">{c.label}</div>
            </div>
          ))}
        </div>
        <div className="skills-bars" id="dyn-stats-bars">
          {data.bars.map((b, i) => (
            <div className="skill-bar-wrap" key={i}>
              <div className="skill-bar-label">
                <span>{b.name}</span>
                <span>{b.pct}%</span>
              </div>
              <div className="skill-bar-track">
                <div className="skill-bar-fill" data-width={b.pct} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
