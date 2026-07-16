export interface DbMediaFile {
  id: string;
  filename: string;
  storage_path: string;
  public_url: string;
  mime_type: string;
  size: number;
  width: number | null;
  height: number | null;
  duration: number | null;
  folder: string;
  created_at: string;
}

export interface DbMediaFolder {
  id: string;
  name: string;
  path: string;
  created_at: string;
}

export interface DbProject {
  id: string;
  title: string;
  slug: string;
  img: string;
  tags: string;
  description: string;
  short_description: string;
  full_description: string;
  role: string;
  year: string;
  stack: string;
  live: string;
  overlay_tag: string;
  overlay_name: string;
  sort_order: number;
  created_at: string;
  updated_at: string | null;
  category: string;
  status: string;
  featured: boolean;
  published: boolean;
  client: string;
  thumbnail_media_id: string;
  cover_image_media_id: string;
  gallery_media_ids: string[] | string;
  technologies: string;
  seo_title: string;
  seo_description: string;
  services_text: string;
  cover_media_id: string;
  video_media_id: string;
  github_url: string;
  publish_status: string;
}

export interface DbCategory {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
  created_at: string;
}

export interface DbTechTag {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
  created_at: string;
}

export interface DbProjectGalleryItem {
  id: string;
  project_id: string;
  media_type: "image" | "video";
  media_id: string;
  url: string;
  caption: string;
  sort_order: number;
  created_at: string;
}

export interface DbProjectLink {
  id: string;
  project_id: string;
  title: string;
  url: string;
  sort_order: number;
  created_at: string;
}

export interface DbService {
  id: string;
  icon: string;
  name: string;
  description: string;
  category: string;
  active: boolean;
  sort_order: number;
  created_at: string;
}

export interface DbMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  date: string;
  status: "unread" | "read" | "replied" | "archived";
  is_read: boolean;
  created_at: string;
}

export interface DbSiteSetting {
  key: string;
  value: string;
  updated_at: string;
}

export interface DbSocialLink {
  id: string;
  icon: string;
  url: string;
  title: string;
  sort_order: number;
  created_at: string;
}

export interface DbStatistic {
  id: string;
  stat_type: "card" | "bar";
  name: string;
  number_val: number | null;
  pct: number | null;
  sort_order: number;
  created_at: string;
}

export interface DbActivityLog {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  entity_title: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface DbFavorite {
  id: string;
  entity_type: string;
  entity_id: string;
  entity_title: string | null;
  entity_url: string | null;
  created_at: string;
}

export interface DbNotification {
  id: string;
  title: string;
  message: string | null;
  type: string;
  read: boolean;
  entity_type: string | null;
  entity_id: string | null;
  created_at: string;
}

export interface DbVersion {
  id: string;
  version_number: number;
  entity_type: string;
  entity_id: string;
  snapshot: Record<string, unknown>;
  summary: string | null;
  created_at: string;
  created_by: string | null;
}

export interface DbRecycleBin {
  id: string;
  entity_type: string;
  entity_id: string;
  entity_title: string | null;
  snapshot: Record<string, unknown>;
  deleted_at: string;
  deleted_by: string | null;
  expires_at: string | null;
}
