"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { getFavorites, removeFavorite } from "@/lib/actions/favorites";
import type { DbFavorite } from "@/types/supabase";
import { useToast } from "./ToastProvider";

function entityIcon(type: string): string {
  switch (type) {
    case "project": return "bi-folder";
    case "media": return "bi-collection";
    case "folder": return "bi-folder2";
    case "media_folder": return "bi-folder2";
    default: return "bi-star";
  }
}

export default function FavoritesPanel() {
  const { toast } = useToast();
  const [favorites, setFavorites] = useState<DbFavorite[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try { const f = await getFavorites(); setFavorites(f); } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { const id = requestAnimationFrame(() => { refresh(); }); return () => cancelAnimationFrame(id); }, [refresh]);

  const handleRemove = async (type: string, id: string) => {
    try {
      await removeFavorite(type, id);
      setFavorites((prev) => prev.filter((f) => !(f.entity_type === type && f.entity_id === id)));
      toast("Removed from favorites");
    } catch {
      toast("Failed to remove favorite", "error");
    }
  };

  if (loading || favorites.length === 0) return null;

  return (
    <div className="dash-card" style={{ padding: "1.2rem" }}>
      <div className="dash-card-header">
        <div className="dash-card-title"><i className="bi bi-star-fill" style={{ color: "#fbbf24", fontSize: ".7rem", marginRight: ".4rem" }} /> Favorites</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: ".35rem" }}>
        {favorites.map((fav) => (
          <div key={fav.id} style={{ display: "flex", alignItems: "center", gap: ".65rem", padding: ".5rem .6rem", borderRadius: 6 }}>
            <i className={`bi ${entityIcon(fav.entity_type)}`} style={{ fontSize: ".75rem", color: "var(--accent)", width: 18, textAlign: "center" }} />
            <Link href={fav.entity_url || "#"} style={{ flex: 1, minWidth: 0, textDecoration: "none", color: "var(--text)" }}>
              <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: ".8rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{fav.entity_title || fav.entity_id}</div>
            </Link>
            <button onClick={() => handleRemove(fav.entity_type, fav.entity_id)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: ".6rem", padding: 2 }} title="Remove favorite">
              <i className="bi bi-x" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export function FavoriteButton({ entityType, entityId, entityTitle, entityUrl }: { entityType: string; entityId: string; entityTitle?: string; entityUrl?: string }) {
  const { toast } = useToast();
  const [active, setActive] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    import("@/lib/actions/favorites").then(({ isFavorited }) => {
      isFavorited(entityType, entityId).then(setActive).finally(() => setLoading(false));
    });
  }, [entityType, entityId]);

  const toggle = async () => {
    try {
      if (active) {
        await removeFavorite(entityType, entityId);
        setActive(false);
        toast("Removed from favorites");
      } else {
        const { addFavorite } = await import("@/lib/actions/favorites");
        await addFavorite(entityType, entityId, entityTitle, entityUrl);
        setActive(true);
        toast("Added to favorites");
      }
    } catch {
      toast("Failed to update favorite", "error");
    }
  };

  if (loading) return null;

  return (
    <button onClick={toggle} className="dash-btn dash-btn-sm" title={active ? "Remove from favorites" : "Add to favorites"}>
      <i className={`bi ${active ? "bi-star-fill" : "bi-star"}`} style={{ color: active ? "#fbbf24" : undefined }} />
    </button>
  );
}
