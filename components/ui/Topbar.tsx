interface TopbarProps {
  logo: string;
  status: string;
}

export default function Topbar({ logo }: TopbarProps) {
  return (
    <div id="topbar">
      <div className="logo-text" id="dyn-logo">{logo}</div>
    </div>
  );
}
