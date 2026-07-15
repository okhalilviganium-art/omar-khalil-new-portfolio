"use server";

import { createClient } from "@/lib/supabase/server";
import type { DbProject, DbService, DbMediaFile, DbMessage, DbSiteSetting } from "@/types/supabase";

export interface SearchResult {
  type: "project" | "service" | "media" | "message" | "settings";
  id: string;
  title: string;
  subtitle: string;
  url: string;
  icon: string;
}

export async function globalSearch(query: string): Promise<SearchResult[]> {
  if (!query || query.length < 2) return [];
  const s = await createClient();
  const q = query.toLowerCase();
  const results: SearchResult[] = [];

  const { data: projects } = await s
    .from("projects").select("id, title, description, slug")
    .or(`title.ilike.%${q}%,description.ilike.%${q}%`)
    .limit(5);
  if (projects) {
    for (const p of projects as DbProject[]) {
      results.push({
        type: "project", id: p.id, title: p.title,
        subtitle: p.description?.slice(0, 80) || "Project",
        url: `/dashboard/portfolio/editor?id=${p.id}`, icon: "bi-folder",
      });
    }
  }

  const { data: services } = await s
    .from("services").select("id, name, description")
    .or(`name.ilike.%${q}%,description.ilike.%${q}%`)
    .limit(5);
  if (services) {
    for (const svc of services as DbService[]) {
      results.push({
        type: "service", id: svc.id, title: svc.name,
        subtitle: svc.description?.slice(0, 80) || "Service",
        url: "/dashboard/services", icon: "bi-lightning",
      });
    }
  }

  const { data: media } = await s
    .from("media_files").select("id, filename, mime_type, folder")
    .or(`filename.ilike.%${q}%,folder.ilike.%${q}%`)
    .limit(5);
  if (media) {
    for (const m of media as DbMediaFile[]) {
      results.push({
        type: "media", id: m.id, title: m.filename,
        subtitle: m.folder || "Media",
        url: "/dashboard/media", icon: "bi-collection",
      });
    }
  }

  const { data: messages } = await s
    .from("messages").select("id, name, subject, email")
    .or(`name.ilike.%${q}%,subject.ilike.%${q}%,email.ilike.%${q}%`)
    .limit(5);
  if (messages) {
    for (const m of messages as DbMessage[]) {
      results.push({
        type: "message", id: m.id, title: m.name,
        subtitle: m.subject || m.email,
        url: "/dashboard/messages", icon: "bi-chat-dots",
      });
    }
  }

  const settingsPages = [
    { key: "hero", label: "Hero Settings", url: "/dashboard/hero", icon: "bi-image" },
    { key: "about", label: "About Settings", url: "/dashboard/about", icon: "bi-person" },
    { key: "services", label: "Services Settings", url: "/dashboard/services", icon: "bi-lightning" },
    { key: "statistics", label: "Statistics", url: "/dashboard/statistics", icon: "bi-bar-chart" },
    { key: "social", label: "Social Links", url: "/dashboard/social-links", icon: "bi-share" },
    { key: "settings", label: "General Settings", url: "/dashboard/settings", icon: "bi-gear" },
    { key: "media", label: "Media Library", url: "/dashboard/media", icon: "bi-collection" },
    { key: "messages", label: "Messages", url: "/dashboard/messages", icon: "bi-chat-dots" },
  ];
  for (const sp of settingsPages) {
    if (sp.key.includes(q) || sp.label.toLowerCase().includes(q)) {
      results.push({
        type: "settings", id: sp.key, title: sp.label,
        subtitle: "Settings page",
        url: sp.url, icon: sp.icon,
      });
    }
  }

  return results.slice(0, 15);
}
