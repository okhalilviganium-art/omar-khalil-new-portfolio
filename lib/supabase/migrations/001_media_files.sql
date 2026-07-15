-- =============================================
-- MEDIA FILES TABLE
-- Tracks every file uploaded to Supabase Storage.
-- Run AFTER schema.sql and policies.sql.
-- =============================================

CREATE TABLE IF NOT EXISTS media_files (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename     TEXT NOT NULL DEFAULT '',
  storage_path TEXT NOT NULL DEFAULT '',
  public_url   TEXT NOT NULL DEFAULT '',
  mime_type    TEXT NOT NULL DEFAULT '',
  size         BIGINT NOT NULL DEFAULT 0,
  width        INT,
  height       INT,
  duration     INT,
  folder       TEXT NOT NULL DEFAULT '',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE media_files ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_media_files_folder ON media_files (folder);
CREATE INDEX IF NOT EXISTS idx_media_files_storage_path ON media_files (storage_path);
