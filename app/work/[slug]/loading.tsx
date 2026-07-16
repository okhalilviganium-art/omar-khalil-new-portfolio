export default function Loading() {
  return (
    <div className="pd-page pd-loading">
      <div className="pd-page-grid-bg" />
      <nav className="pd-nav">
        <div className="pd-nav-logo">
          <span className="pd-nav-logo-text">Omar Khalil</span>
        </div>
      </nav>
      <div className="pd-loading-content">
        <div className="pd-skeleton pd-skeleton-tag" />
        <div className="pd-skeleton pd-skeleton-title" />
        <div className="pd-skeleton pd-skeleton-sub" />
        <div className="pd-skeleton pd-skeleton-img" />
      </div>
    </div>
  );
}
