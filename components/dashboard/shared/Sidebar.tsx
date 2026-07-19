"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { logoutAction } from "@/lib/actions/auth";
import { useOverlay } from "./OverlayProvider";
import { useUnreadMessageCount } from "./useUnreadMessageCount";
import NotificationCenter from "./NotificationCenter";

const navItems = [
  { href: "/dashboard", icon: "bi-grid", label: "Overview", exact: true },
  { href: "/dashboard/hero", icon: "bi-image", label: "Hero" },
  { href: "/dashboard/about", icon: "bi-person", label: "About" },
  { href: "/dashboard/portfolio", icon: "bi-folder", label: "Portfolio" },
  { href: "/dashboard/portfolio/categories", icon: "bi-tags", label: "Categories", parent: "/dashboard/portfolio" },
  { href: "/dashboard/portfolio/tech-stack", icon: "bi-cpu", label: "Tech Stack", parent: "/dashboard/portfolio" },
  { href: "/dashboard/services", icon: "bi-lightning", label: "Services" },
  { href: "/dashboard/statistics", icon: "bi-bar-chart", label: "Statistics" },
  { href: "/dashboard/social-links", icon: "bi-share", label: "Social Links" },
  { href: "/dashboard/messages", icon: "bi-chat-dots", label: "Messages" },
  { href: "/dashboard/settings", icon: "bi-gear", label: "Settings" },
  { href: "/dashboard/media", icon: "bi-collection", label: "Media" },
  { href: "/dashboard/recycle-bin", icon: "bi-trash", label: "Recycle Bin" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [loggingOut, setLoggingOut] = useState(false);
  const { openSearch } = useOverlay();
  const unreadMessages = useUnreadMessageCount();

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  const isChildActive = (item: (typeof navItems)[number]) => {
    if ("parent" in item) return pathname === item.href;
    return false;
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    await logoutAction();
  };

  return (
    <aside className="dash-sidebar">
      <div className="dash-logo">
        <span className="dash-logo-icon">{"◈"}</span>
        <span className="dash-logo-text">Dashboard</span>
      </div>

      <button onClick={openSearch} aria-label="Search (Ctrl+K)" style={{
        display: "flex", alignItems: "center", gap: ".5rem",
        padding: ".5rem .75rem",
        margin: "0 .75rem .75rem", width: "calc(100% - 1.5rem)",
        background: "var(--bg-input)", border: "1px solid var(--border)", borderRadius: 8,
        color: "var(--text-muted)", cursor: "pointer", fontFamily: "'Space Mono',monospace", fontSize: ".7rem",
        transition: "border-color .2s",
      }}
        onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
        onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border)")}>
        <i className="bi bi-search" style={{ fontSize: ".7rem" }} />
        <span style={{ flex: 1, textAlign: "left" }}>Search...</span>
        <span style={{ fontSize: ".5rem", padding: ".1rem .3rem", background: "var(--bg-dark, #060c18)", borderRadius: 3, border: "1px solid var(--border)" }}>Ctrl+K</span>
      </button>

      <nav className="dash-nav">
        {navItems.map((item) => {
          const isChild = "parent" in item;
          const active = isChild ? isChildActive(item) : isActive(item.href, item.exact);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`dash-nav-item${active ? " active" : ""}`}
              data-nav-item
              style={isChild ? { paddingLeft: "2rem", fontSize: ".68rem" } : undefined}
            >
              <i className={`bi ${item.icon}`} /> <span>{item.label}</span>
              {item.href === "/dashboard/messages" && unreadMessages > 0 && (
                <span style={{
                  marginLeft: "auto", padding: "1px 6px", borderRadius: 10,
                  background: "var(--accent, #6c63ff)", color: "#fff",
                  fontSize: ".5rem", fontFamily: "'Space Mono',monospace",
                  fontWeight: 700, lineHeight: "16px", textAlign: "center",
                }}>
                  {unreadMessages > 99 ? "99+" : unreadMessages}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
      <div className="dash-sidebar-footer">
        <div style={{ display: "flex", gap: ".35rem", padding: "0 .75rem", marginBottom: ".5rem" }}>
          <NotificationCenter />
          <a href="/" className="dash-btn dash-btn-sm" target="_blank" rel="noopener noreferrer" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: ".35rem", textDecoration: "none" }}>
            <i className="bi bi-box-arrow-up-right" /> <span style={{ fontSize: ".65rem" }}>Site</span>
          </a>
        </div>
        <button
          className="dash-view-site"
          onClick={handleLogout}
          disabled={loggingOut}
          style={{
            width: "100%",
            background: "none",
            border: "none",
            cursor: loggingOut ? "not-allowed" : "pointer",
            opacity: loggingOut ? 0.5 : 1,
            fontFamily: "'Outfit', sans-serif",
          }}
        >
          {loggingOut ? (
            <>
              <span
                style={{
                  width: 12,
                  height: 12,
                  border: "2px solid rgba(255,255,255,0.3)",
                  borderTopColor: "#fff",
                  borderRadius: "50%",
                  animation: "spin 0.7s linear infinite",
                  display: "inline-block",
                  marginRight: 8,
                }}
              />
              Signing out...
            </>
          ) : (
            <>
              <i className="bi bi-box-arrow-left" /> <span>Logout</span>
            </>
          )}
        </button>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </aside>
  );
}
