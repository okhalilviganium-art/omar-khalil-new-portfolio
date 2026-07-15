interface TopbarProps {
  logo: string;
  status: string;
}

export default function Topbar({ logo, status }: TopbarProps) {
  return (
    <div id="topbar">
      <div className="logo-text" id="dyn-logo">{logo}</div>
      <div className="status-badge">
        <div className="status-dot" />
        <span id="dyn-status">{status}</span>
      </div>
    </div>
  );
}
