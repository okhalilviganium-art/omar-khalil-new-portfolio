import type { StatsData } from "@/types";

interface StatsProps {
  data: StatsData;
}

export default function Stats({ data }: StatsProps) {
  const hasCards = data.cards.length > 0;
  const hasBars = data.bars.length > 0;

  return (
    <section className="section" id="sec-3" aria-label="Statistics">
      <div className="section-content stats-wrap">
        <div className="section-label" id="dyn-stats-label">{data.label}</div>
        <div className="section-title" id="dyn-stats-title">{data.title}</div>
        {hasCards && (
          <div className="stats-grid about-stats" id="dyn-stats-cards">
            {data.cards.map((c, i) => (
              <div className="stat-card" key={i}>
                <div className="stat-num">{c.number}</div>
                <div className="stat-label">{c.label}</div>
              </div>
            ))}
          </div>
        )}
        {hasBars && (
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
        )}
        {!hasCards && !hasBars && (
          <div className="empty-state">
            <div className="empty-state-icon">
              <i className="bi bi-bar-chart" />
            </div>
            <div className="empty-state-title">No Stats Yet</div>
            <p className="empty-state-desc">
              Add statistics and skill bars from the dashboard to showcase your expertise.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
