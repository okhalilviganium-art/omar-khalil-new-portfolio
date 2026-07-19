-- Migration 012: Add thumbnail_url to project_gallery for video thumbnails
-- Safe: adds optional column with default empty string

ALTER TABLE project_gallery
  ADD COLUMN IF NOT EXISTS thumbnail_url TEXT DEFAULT '';

-- Existing rows get empty thumbnail_url (null → empty string handled in queries)
UPDATE project_gallery SET thumbnail_url = '' WHERE thumbnail_url IS NULL;
