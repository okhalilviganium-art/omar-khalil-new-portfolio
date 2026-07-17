-- =============================================
-- 009_schema_reconciliation.sql
-- =============================================
-- Brings the actual database in sync with the
-- current application code.
--
-- Safe to run on:
--   A) Fresh DB (schema.sql + policies.sql only)
--   B) Partially migrated (some of 001-008)
--   C) Fully migrated (all of 001-008)
--   D) Current production (per user audit)
--
-- Every DDL statement is guarded with
-- IF NOT EXISTS / EXCEPTION handling.
-- No user data is dropped.
-- =============================================


-- =============================================
-- SECTION 1: projects — add all missing columns
-- =============================================
-- The base schema only has 16 columns. The code
-- needs up to 34. Every ADD COLUMN is guarded.

DO $$ BEGIN
  ALTER TABLE projects ADD COLUMN slug TEXT NOT NULL DEFAULT '';
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE projects ADD COLUMN category TEXT NOT NULL DEFAULT '';
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE projects ADD COLUMN client TEXT NOT NULL DEFAULT '';
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE projects ADD COLUMN published BOOLEAN NOT NULL DEFAULT true;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE projects ADD COLUMN gallery_media_ids JSONB NOT NULL DEFAULT '[]'::jsonb;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE projects ADD COLUMN cover_media_id TEXT NOT NULL DEFAULT '';
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE projects ADD COLUMN video_media_id TEXT NOT NULL DEFAULT '';
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE projects ADD COLUMN seo_title TEXT NOT NULL DEFAULT '';
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE projects ADD COLUMN seo_description TEXT NOT NULL DEFAULT '';
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE projects ADD COLUMN technologies TEXT NOT NULL DEFAULT '';
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE projects ADD COLUMN services_text TEXT NOT NULL DEFAULT '';
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE projects ADD COLUMN publish_status TEXT DEFAULT 'published';
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
  ALTER TABLE projects ADD COLUMN thumbnail_media_id TEXT NOT NULL DEFAULT '';
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE projects ADD COLUMN cover_image_media_id TEXT NOT NULL DEFAULT '';
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE projects ADD COLUMN updated_at TIMESTAMPTZ DEFAULT now();
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE projects ADD COLUMN status TEXT NOT NULL DEFAULT 'published';
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;


-- =============================================
-- SECTION 2: projects — backfill derived columns
-- =============================================
-- Slug from title, full_description from description,
-- updated_at for any NULLs. Safe: only touches empty rows.

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

UPDATE projects
SET full_description = description
WHERE (full_description IS NULL OR full_description = '') AND description IS NOT NULL AND description != '';

UPDATE projects
SET updated_at = created_at
WHERE updated_at IS NULL;


-- =============================================
-- SECTION 3: projects — indexes
-- =============================================

CREATE INDEX IF NOT EXISTS idx_projects_slug     ON projects (slug);
CREATE INDEX IF NOT EXISTS idx_projects_category ON projects (category);
CREATE INDEX IF NOT EXISTS idx_projects_sort     ON projects (sort_order);

CREATE INDEX IF NOT EXISTS idx_projects_published ON projects (published);


-- =============================================
-- SECTION 4: portfolio_categories table
-- =============================================

CREATE TABLE IF NOT EXISTS portfolio_categories (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  slug       TEXT NOT NULL UNIQUE,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE portfolio_categories ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'portfolio_categories'
      AND policyname = 'portfolio_categories_anon_read'
  ) THEN
    CREATE POLICY "portfolio_categories_anon_read"
      ON portfolio_categories FOR SELECT USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'portfolio_categories'
      AND policyname = 'portfolio_categories_authenticated_all'
  ) THEN
    CREATE POLICY "portfolio_categories_authenticated_all"
      ON portfolio_categories FOR ALL
      USING (auth.role() = 'authenticated');
  END IF;
END $$;


-- =============================================
-- SECTION 5: portfolio_tech_tags table
-- =============================================

CREATE TABLE IF NOT EXISTS portfolio_tech_tags (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  slug       TEXT NOT NULL UNIQUE,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE portfolio_tech_tags ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'portfolio_tech_tags'
      AND policyname = 'portfolio_tech_tags_anon_read'
  ) THEN
    CREATE POLICY "portfolio_tech_tags_anon_read"
      ON portfolio_tech_tags FOR SELECT USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'portfolio_tech_tags'
      AND policyname = 'portfolio_tech_tags_authenticated_all'
  ) THEN
    CREATE POLICY "portfolio_tech_tags_authenticated_all"
      ON portfolio_tech_tags FOR ALL
      USING (auth.role() = 'authenticated');
  END IF;
END $$;


-- =============================================
-- SECTION 6: project_categories junction table
-- =============================================
-- FK: project_id -> projects(id) CASCADE
-- FK: category_id -> portfolio_categories(id) CASCADE

CREATE TABLE IF NOT EXISTS project_categories (
  project_id  UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES portfolio_categories(id) ON DELETE CASCADE,
  PRIMARY KEY (project_id, category_id)
);

ALTER TABLE project_categories ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'project_categories'
      AND policyname = 'project_categories_anon_read'
  ) THEN
    CREATE POLICY "project_categories_anon_read"
      ON project_categories FOR SELECT USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'project_categories'
      AND policyname = 'project_categories_authenticated_all'
  ) THEN
    CREATE POLICY "project_categories_authenticated_all"
      ON project_categories FOR ALL
      USING (auth.role() = 'authenticated');
  END IF;
END $$;


-- =============================================
-- SECTION 7: project_tech_tags junction table
-- =============================================
-- FK: project_id -> projects(id) CASCADE
-- FK: tag_id -> portfolio_tech_tags(id) CASCADE

CREATE TABLE IF NOT EXISTS project_tech_tags (
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  tag_id     UUID NOT NULL REFERENCES portfolio_tech_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (project_id, tag_id)
);

ALTER TABLE project_tech_tags ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'project_tech_tags'
      AND policyname = 'project_tech_tags_anon_read'
  ) THEN
    CREATE POLICY "project_tech_tags_anon_read"
      ON project_tech_tags FOR SELECT USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'project_tech_tags'
      AND policyname = 'project_tech_tags_authenticated_all'
  ) THEN
    CREATE POLICY "project_tech_tags_authenticated_all"
      ON project_tech_tags FOR ALL
      USING (auth.role() = 'authenticated');
  END IF;
END $$;


-- =============================================
-- SECTION 8: project_gallery table
-- =============================================
-- FK: project_id -> projects(id) CASCADE

CREATE TABLE IF NOT EXISTS project_gallery (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  media_type TEXT NOT NULL DEFAULT 'image' CHECK (media_type IN ('image', 'video')),
  media_id   TEXT NOT NULL DEFAULT '',
  url        TEXT NOT NULL DEFAULT '',
  caption    TEXT NOT NULL DEFAULT '',
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE project_gallery ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'project_gallery'
      AND policyname = 'project_gallery_anon_read'
  ) THEN
    CREATE POLICY "project_gallery_anon_read"
      ON project_gallery FOR SELECT USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'project_gallery'
      AND policyname = 'project_gallery_authenticated_all'
  ) THEN
    CREATE POLICY "project_gallery_authenticated_all"
      ON project_gallery FOR ALL
      USING (auth.role() = 'authenticated');
  END IF;
END $$;


-- =============================================
-- SECTION 9: project_links table
-- =============================================
-- FK: project_id -> projects(id) CASCADE

CREATE TABLE IF NOT EXISTS project_links (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title      TEXT NOT NULL DEFAULT '',
  url        TEXT NOT NULL DEFAULT '',
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE project_links ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'project_links'
      AND policyname = 'project_links_anon_read'
  ) THEN
    CREATE POLICY "project_links_anon_read"
      ON project_links FOR SELECT USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'project_links'
      AND policyname = 'project_links_authenticated_all'
  ) THEN
    CREATE POLICY "project_links_authenticated_all"
      ON project_links FOR ALL
      USING (auth.role() = 'authenticated');
  END IF;
END $$;


-- =============================================
-- SECTION 10: Seed default categories
-- =============================================

INSERT INTO portfolio_categories (name, slug, sort_order) VALUES
  ('Brand Identity',    'brand-identity',    0),
  ('Motion Design',     'motion-design',     1),
  ('Video Editing',     'video-editing',     2),
  ('3D',                '3d',                3),
  ('CGI',               'cgi',               4),
  ('AI',                'ai',                5),
  ('UI/UX',             'ui-ux',             6),
  ('Web',               'web',               7)
ON CONFLICT (slug) DO NOTHING;


-- =============================================
-- SECTION 11: Seed default tech tags
-- =============================================

INSERT INTO portfolio_tech_tags (name, slug, sort_order) VALUES
  ('Photoshop',      'photoshop',       0),
  ('Illustrator',    'illustrator',     1),
  ('After Effects',  'after-effects',   2),
  ('Premiere Pro',   'premiere-pro',    3),
  ('DaVinci Resolve','davinci-resolve', 4),
  ('Blender',        'blender',         5),
  ('Next.js',        'nextjs',          6),
  ('Supabase',       'supabase',        7)
ON CONFLICT (slug) DO NOTHING;


-- =============================================
-- SECTION 12: media_folders — ensure created_at
-- =============================================

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'media_folders'
  ) THEN
    ALTER TABLE media_folders ADD COLUMN created_at TIMESTAMPTZ NOT NULL DEFAULT now();
  END IF;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;


-- =============================================
-- SECTION 13: RLS for tables from 004/005
-- =============================================
-- These tables may or may not exist. Guard all.

-- activity_log
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'activity_log'
  ) THEN
    ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

    IF NOT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE tablename = 'activity_log'
        AND policyname = 'activity_log_authenticated_all'
    ) THEN
      CREATE POLICY "activity_log_authenticated_all"
        ON activity_log FOR ALL
        USING (auth.role() = 'authenticated');
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE tablename = 'activity_log'
        AND policyname = 'activity_log_anon_read'
    ) THEN
      CREATE POLICY "activity_log_anon_read"
        ON activity_log FOR SELECT USING (true);
    END IF;
  END IF;
END $$;

-- favorites
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'favorites'
  ) THEN
    ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

    IF NOT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE tablename = 'favorites'
        AND policyname = 'favorites_authenticated_all'
    ) THEN
      CREATE POLICY "favorites_authenticated_all"
        ON favorites FOR ALL
        USING (auth.role() = 'authenticated');
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE tablename = 'favorites'
        AND policyname = 'favorites_anon_read'
    ) THEN
      CREATE POLICY "favorites_anon_read"
        ON favorites FOR SELECT USING (true);
    END IF;
  END IF;
END $$;

-- notifications
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'notifications'
  ) THEN
    ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

    IF NOT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE tablename = 'notifications'
        AND policyname = 'notifications_authenticated_all'
    ) THEN
      CREATE POLICY "notifications_authenticated_all"
        ON notifications FOR ALL
        USING (auth.role() = 'authenticated');
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE tablename = 'notifications'
        AND policyname = 'notifications_anon_read'
    ) THEN
      CREATE POLICY "notifications_anon_read"
        ON notifications FOR SELECT USING (true);
    END IF;
  END IF;
END $$;

-- versions
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'versions'
  ) THEN
    ALTER TABLE versions ENABLE ROW LEVEL SECURITY;

    IF NOT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE tablename = 'versions'
        AND policyname = 'versions_authenticated_all'
    ) THEN
      CREATE POLICY "versions_authenticated_all"
        ON versions FOR ALL
        USING (auth.role() = 'authenticated');
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE tablename = 'versions'
        AND policyname = 'versions_anon_read'
    ) THEN
      CREATE POLICY "versions_anon_read"
        ON versions FOR SELECT USING (true);
    END IF;
  END IF;
END $$;

-- recycle_bin
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'recycle_bin'
  ) THEN
    ALTER TABLE recycle_bin ENABLE ROW LEVEL SECURITY;

    IF NOT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE tablename = 'recycle_bin'
        AND policyname = 'recycle_bin_authenticated_all'
    ) THEN
      CREATE POLICY "recycle_bin_authenticated_all"
        ON recycle_bin FOR ALL
        USING (auth.role() = 'authenticated');
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE tablename = 'recycle_bin'
        AND policyname = 'recycle_bin_anon_read'
    ) THEN
      CREATE POLICY "recycle_bin_anon_read"
        ON recycle_bin FOR SELECT USING (true);
    END IF;
  END IF;
END $$;


-- =============================================
-- SECTION 14: Messages — ensure realtime
-- =============================================

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE messages;
  END IF;
END $$;


-- =============================================
-- DONE
-- =============================================
-- After running this migration, the database has:
--
-- projects:    34 columns (all code expects them)
-- portfolio_categories:  5 columns + RLS
-- portfolio_tech_tags:   5 columns + RLS
-- project_categories:    composite PK + 2 FKs + RLS
-- project_tech_tags:     composite PK + 2 FKs + RLS
-- project_gallery:       8 columns + FK + RLS
-- project_links:         6 columns + FK + RLS
--
-- All indexes, seeds, backfills, and RLS policies
-- are in place. Idempotent on every run.
-- =============================================
