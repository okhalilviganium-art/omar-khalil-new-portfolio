import type { ServicesData } from "@/types";

interface ServicesProps {
  data: ServicesData;
}

export default function Services({ data }: ServicesProps) {
  return (
    <section className="section" id="sec-4" aria-label="Services">
      <div className="section-content services-wrap">
        <div className="section-label" id="dyn-svc-label">{data.label}</div>
        <div className="section-title" id="dyn-svc-title">{data.title}</div>
        {data.cards.length > 0 ? (
          <div className="services-grid" id="dyn-svc-cards">
            {data.cards.map((s, i) => (
              <div className="service-card" key={i}>
                <div className="service-icon">
                  {s.icon.startsWith("bi-") ? (
                    <i className={`bi ${s.icon}`} style={{ fontSize: "1.3rem" }} aria-hidden="true" />
                  ) : (
                    s.icon
                  )}
                </div>
                <div className="service-name">{s.name}</div>
                <div className="service-desc">{s.desc}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">
              <i className="bi bi-briefcase" />
            </div>
            <div className="empty-state-title">No Services Yet</div>
            <p className="empty-state-desc">
              Add your services from the dashboard to let visitors know what you offer.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
