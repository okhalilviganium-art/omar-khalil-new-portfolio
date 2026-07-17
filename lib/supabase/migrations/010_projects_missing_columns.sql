-- =============================================
-- 010_projects_missing_columns.sql
-- Adds every column the application code requires
-- on the projects table that does not yet exist.
--
-- Idempotent: safe to run multiple times.
-- Does NOT recreate tables or modify existing columns.
-- =============================================

-- Add every missing column. Each is guarded with
-- EXCEPTION WHEN duplicate_column so re-runs are no-ops.

DO $$ BEGIN
  ALTER TABLE projects ADD COLUMN slug TEXT NOT NULL DEFAULT '';
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE projects ADD COLUMN short_description TEXT NOT NULL DEFAULT '';
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE projects ADD COLUMN full_description TEXT NOT NULL DEFAULT '';
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE projects ADD COLUMN updated_at TIMESTAMPTZ DEFAULT now();
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE projects ADD COLUMN thumbnail_media_id TEXT NOT NULL DEFAULT '';
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE projects ADD COLUMN cover_image_media_id TEXT NOT NULL DEFAULT '';
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE projects ADD COLUMN gallery_media_ids JSONB NOT NULL DEFAULT '[]'::jsonb;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE projects ADD COLUMN video_media_id TEXT NOT NULL DEFAULT '';
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE projects ADD COLUMN github_url TEXT NOT NULL DEFAULT '';
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;


-- =============================================
-- Backfill
-- =============================================

-- slug from title (only where slug is still empty)
UPDATE projects
SET slug = LOWER(
  REGEXP_REPLACE(
    REGEXP_REPLACE(
      REGEXP_REPLACE(TRIM(title), '[^a-zA-Z0-9 ]', '', 'g'),
      '\s+', '-', 'g'
    ),
    '^-+|-+$', '', 'g'
  )
)
WHERE (slug IS NULL OR slug = '') AND title IS NOT NULL AND title != '';

-- full_description from description (only where empty)
UPDATE projects
SET full_description = description
WHERE (full_description IS NULL OR full_description = '')
  AND description IS NOT NULL AND description != '';

-- updated_at from created_at (only where NULL)
UPDATE projects
SET updated_at = created_at
WHERE updated_at IS NULL;


-- =============================================
-- Indexes
-- =============================================

CREATE INDEX IF NOT EXISTS idx_projects_slug     ON projects (slug);
CREATE INDEX IF NOT EXISTS idx_projects_category ON projects (category);
CREATE INDEX IF NOT EXISTS idx_projects_sort     ON projects (sort_order);
CREATE INDEX IF NOT EXISTS idx_projects_status   ON projects (status);
