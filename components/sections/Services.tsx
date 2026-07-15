import type { ServicesData } from "@/types";

interface ServicesProps {
  data: ServicesData;
}

export default function Services({ data }: ServicesProps) {
  return (
    <section className="section" id="sec-4">
      <div className="section-content services-wrap">
        <div className="section-label" id="dyn-svc-label">{data.label}</div>
        <div className="section-title" id="dyn-svc-title">{data.title}</div>
        <div className="services-grid" id="dyn-svc-cards">
          {data.cards.map((s, i) => (
            <div className="service-card" key={i}>
              <div className="service-icon">
                {s.icon.startsWith("bi-") ? (
                  <i className={`bi ${s.icon}`} style={{ fontSize: "1.3rem" }} />
                ) : (
                  s.icon
                )}
              </div>
              <div className="service-name">{s.name}</div>
              <div className="service-desc">{s.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
