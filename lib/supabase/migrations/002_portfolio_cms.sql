-- =============================================
-- PORTFOLIO CMS — New Columns
-- Run AFTER schema.sql and 001_media_files.sql.
-- All columns are backward-compatible.
-- =============================================

ALTER TABLE projects ADD COLUMN IF NOT EXISTS slug            TEXT NOT NULL DEFAULT '';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS category        TEXT NOT NULL DEFAULT '';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS client          TEXT NOT NULL DEFAULT '';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS published       BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS gallery_media_ids JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS cover_media_id  TEXT NOT NULL DEFAULT '';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS video_media_id  TEXT NOT NULL DEFAULT '';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS seo_title       TEXT NOT NULL DEFAULT '';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS seo_description TEXT NOT NULL DEFAULT '';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS technologies    TEXT NOT NULL DEFAULT '';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS services_text   TEXT NOT NULL DEFAULT '';

CREATE INDEX IF NOT EXISTS idx_projects_slug      ON projects (slug);
CREATE INDEX IF NOT EXISTS idx_projects_category  ON projects (category);
CREATE INDEX IF NOT EXISTS idx_projects_published ON projects (published);
CREATE INDEX IF NOT EXISTS idx_projects_sort      ON projects (sort_order);
