"use client";

interface NavigationProps {
  goTo: (idx: number) => void;
}

const labels = ["Home", "About", "Work", "Skills", "Services", "Contact"];

export default function Navigation({ goTo }: NavigationProps) {
  return (
    <nav id="main-nav">
      {labels.map((label, i) => (
        <div
          key={i}
          className={`nav-dot${i === 0 ? " active" : ""}`}
          data-section={i}
          data-label={label}
          onClick={() => goTo(i)}
        />
      ))}
    </nav>
  );
}
