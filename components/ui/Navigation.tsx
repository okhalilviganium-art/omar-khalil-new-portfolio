"use client";

interface NavigationProps {
  goTo: (idx: number) => void;
}

const labels = ["Home", "About", "Work", "Skills", "Services", "Contact"];

export default function Navigation({ goTo }: NavigationProps) {
  return (
    <nav id="main-nav" role="navigation" aria-label="Section navigation">
      {labels.map((label, i) => (
        <button
          key={i}
          className={`nav-dot${i === 0 ? " active" : ""}`}
          data-section={i}
          data-label={label}
          onClick={() => goTo(i)}
          aria-label={`Go to ${label} section`}
          aria-current={i === 0 ? "true" : undefined}
          tabIndex={0}
          type="button"
        />
      ))}
    </nav>
  );
}
