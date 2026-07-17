-- =============================================
-- 008_portfolio_fix.sql
-- Safe migration for current portfolio system
-- =============================================

-- -------------------------------------------------
-- Projects columns
-- -------------------------------------------------

ALTER TABLE projects ADD COLUMN IF NOT EXISTS slug TEXT DEFAULT '';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS short_description TEXT DEFAULT '';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS full_description TEXT DEFAULT '';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS client TEXT DEFAULT '';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS thumbnail_media_id TEXT DEFAULT '';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS cover_image_media_id TEXT DEFAULT '';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- -------------------------------------------------
-- Categories
-- -------------------------------------------------

CREATE TABLE IF NOT EXISTS portfolio_categories (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    slug text UNIQUE NOT NULL,
    sort_order integer DEFAULT 0,
    created_at timestamptz DEFAULT now()
);

-- -------------------------------------------------
-- Tech Tags
-- -------------------------------------------------

CREATE TABLE IF NOT EXISTS portfolio_tech_tags (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    slug text UNIQUE NOT NULL,
    sort_order integer DEFAULT 0,
    created_at timestamptz DEFAULT now()
);

-- -------------------------------------------------
-- Project Categories
-- -------------------------------------------------

CREATE TABLE IF NOT EXISTS project_categories (
    project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    category_id uuid NOT NULL REFERENCES portfolio_categories(id) ON DELETE CASCADE,
    PRIMARY KEY(project_id, category_id)
);

-- -------------------------------------------------
-- Project Tech Tags
-- -------------------------------------------------

CREATE TABLE IF NOT EXISTS project_tech_tags (
    project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    tag_id uuid NOT NULL REFERENCES portfolio_tech_tags(id) ON DELETE CASCADE,
    PRIMARY KEY(project_id, tag_id)
);

-- -------------------------------------------------
-- Gallery
-- -------------------------------------------------

CREATE TABLE IF NOT EXISTS project_gallery (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    media_type text DEFAULT 'image',
    media_id text DEFAULT '',
    url text DEFAULT '',
    caption text DEFAULT '',
    sort_order integer DEFAULT 0,
    created_at timestamptz DEFAULT now()
);

-- -------------------------------------------------
-- Links
-- -------------------------------------------------

CREATE TABLE IF NOT EXISTS project_links (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title text DEFAULT '',
    url text DEFAULT '',
    sort_order integer DEFAULT 0,
    created_at timestamptz DEFAULT now()
);

-- -------------------------------------------------
-- Enable RLS
-- -------------------------------------------------

ALTER TABLE portfolio_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_tech_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_tech_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_links ENABLE ROW LEVEL SECURITY;

-- -------------------------------------------------
-- Policies (safe)
-- -------------------------------------------------

DO $$
BEGIN
IF NOT EXISTS (
SELECT 1 FROM pg_policies
WHERE schemaname='public'
AND tablename='portfolio_categories'
AND policyname='portfolio_categories_read'
)
THEN
CREATE POLICY portfolio_categories_read
ON portfolio_categories
FOR SELECT
USING (true);
END IF;
END $$;

DO $$
BEGIN
IF NOT EXISTS (
SELECT 1 FROM pg_policies
WHERE schemaname='public'
AND tablename='portfolio_categories'
AND policyname='portfolio_categories_all'
)
THEN
CREATE POLICY portfolio_categories_all
ON portfolio_categories
FOR ALL
USING (true);
END IF;
END $$;

DO $$
DECLARE
    t text;
BEGIN
    FOREACH t IN ARRAY ARRAY[
        'portfolio_tech_tags',
        'project_categories',
        'project_tech_tags',
        'project_gallery',
        'project_links'
    ]
    LOOP

        EXECUTE format(
        'CREATE POLICY IF NOT EXISTS %I_read ON %I FOR SELECT USING (true)',
        t,
        t
        );

        EXECUTE format(
        'CREATE POLICY IF NOT EXISTS %I_all ON %I FOR ALL USING (true)',
        t,
        t
        );

    END LOOP;
END $$;

-- -------------------------------------------------
-- Seed categories
-- -------------------------------------------------

INSERT INTO portfolio_categories(name,slug,sort_order)
VALUES
('Brand Identity','brand-identity',0),
('Motion Design','motion-design',1),
('Video Editing','video-editing',2),
('3D','3d',3),
('CGI','cgi',4),
('AI','ai',5),
('UI/UX','ui-ux',6),
('Web','web',7)
ON CONFLICT(slug) DO NOTHING;

-- -------------------------------------------------
-- Seed tech
-- -------------------------------------------------

INSERT INTO portfolio_tech_tags(name,slug,sort_order)
VALUES
('Photoshop','photoshop',0),
('Illustrator','illustrator',1),
('After Effects','after-effects',2),
('Premiere Pro','premiere-pro',3),
('DaVinci Resolve','davinci-resolve',4),
('Blender','blender',5),
('Next.js','nextjs',6),
('Supabase','supabase',7)
ON CONFLICT(slug) DO NOTHING;

-- -------------------------------------------------
-- Generate slugs
-- -------------------------------------------------

UPDATE projects
SET slug =
lower(
regexp_replace(
regexp_replace(title,'[^a-zA-Z0-9 ]','','g'),
'\s+','-','g'
)
)
WHERE slug='' OR slug IS NULL;

UPDATE projects
SET full_description=description
WHERE full_description='' OR full_description IS NULL;

UPDATE projects
SET updated_at=now()
WHERE updated_at IS NULL;s