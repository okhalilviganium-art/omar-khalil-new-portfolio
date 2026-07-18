"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { relativeTimeFromMs } from "@/lib/utils/time";

interface RecentItem {
  type: string;
  id: string;
  title: string;
  url: string;
  timestamp: number;
}

const STORAGE_KEY = "dashboard_recent_items";
const MAX_ITEMS = 10;

export function addRecentItem(type: string, id: string, title: string, url: string) {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const items: RecentItem[] = raw ? JSON.parse(raw) : [];
    const filtered = items.filter((i) => !(i.type === type && i.id === id));
    filtered.unshift({ type, id, title, url, timestamp: Date.now() });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered.slice(0, MAX_ITEMS)));
  } catch {}
}

export function getRecentItems(): RecentItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function entityIcon(type: string): string {
  switch (type) {
    case "project": return "bi-folder";
    case "media": return "bi-collection";
    case "service": return "bi-lightning";
    case "settings": return "bi-gear";
    case "hero": return "bi-image";
    case "about": return "bi-person";
    default: return "bi-circle";
  }
}

export default function RecentItems() {
  const [items, setItems] = useState<RecentItem[]>([]);

  useEffect(() => { const id = requestAnimationFrame(() => { setItems(getRecentItems()); }); return () => cancelAnimationFrame(id); }, []);

  if (items.length === 0) return null;

  return (
    <div className="dash-card" style={{ padding: "1.2rem" }}>
      <div className="dash-card-header">
        <div className="dash-card-title">Recently Edited</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: ".35rem" }}>
        {items.slice(0, 6).map((item) => (
          <Link key={item.type + item.id} href={item.url}
            style={{ display: "flex", alignItems: "center", gap: ".65rem", padding: ".5rem .6rem", borderRadius: 6, background: "transparent", textDecoration: "none", color: "var(--text)", transition: "background .15s" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-input)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
            <i className={`bi ${entityIcon(item.type)}`} style={{ fontSize: ".75rem", color: "var(--accent)", width: 18, textAlign: "center" }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: ".8rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.title}</div>
            </div>
            <span style={{ fontFamily: "'Space Mono',monospace", fontSize: ".5rem", color: "var(--text-muted)", flexShrink: 0 }}>{relativeTimeFromMs(item.timestamp)}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
