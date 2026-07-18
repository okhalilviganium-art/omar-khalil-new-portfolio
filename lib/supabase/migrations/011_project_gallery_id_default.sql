-- Migration 011: Add DEFAULT gen_random_uuid() to project_gallery.id
-- The column is UUID NOT NULL but has no default, causing inserts to fail
-- when the application does not explicitly supply an id.

-- Ensure pgcrypto is available (idempotent)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Set the default so the DB generates UUIDs automatically
ALTER TABLE project_gallery
  ALTER COLUMN id SET DEFAULT gen_random_uuid();
