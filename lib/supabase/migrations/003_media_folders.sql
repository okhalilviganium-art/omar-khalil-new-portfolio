-- =============================================
-- MEDIA FOLDERS
-- Tracks user-created folders for media organization.
-- Run AFTER 001_media_files.sql.
-- =============================================

CREATE TABLE IF NOT EXISTS media_folders (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  path       TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE media_folders ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Public can read media_folders' AND tablename = 'media_folders'
  ) THEN
    CREATE POLICY "Public can read media_folders" ON media_folders FOR SELECT USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Admin full access on media_folders' AND tablename = 'media_folders'
  ) THEN
    CREATE POLICY "Admin full access on media_folders" ON media_folders FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;
