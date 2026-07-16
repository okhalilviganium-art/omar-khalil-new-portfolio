-- =============================================
-- Phase 5: Professional Portfolio System
-- =============================================

-- 1. Add new columns to projects
ALTER TABLE projects ADD COLUMN IF NOT EXISTS slug                TEXT NOT NULL DEFAULT '';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS short_description  TEXT NOT NULL DEFAULT '';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS full_description   TEXT NOT NULL DEFAULT '';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS client             TEXT NOT NULL DEFAULT '';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS thumbnail_media_id TEXT NOT NULL DEFAULT '';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS cover_image_media_id TEXT NOT NULL DEFAULT '';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS updated_at         TIMESTAMPTZ DEFAULT now();

-- 2. Categories lookup table
CREATE TABLE IF NOT EXISTS portfolio_categories (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  slug       TEXT NOT NULL UNIQUE,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE portfolio_categories ENABLE ROW LEVEL SECURITY;

-- 3. Tech tags lookup table
CREATE TABLE IF NOT EXISTS portfolio_tech_tags (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  slug       TEXT NOT NULL UNIQUE,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE portfolio_tech_tags ENABLE ROW LEVEL SECURITY;

-- 4. Junction: project <-> categories
CREATE TABLE IF NOT EXISTS project_categories (
  project_id  UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES portfolio_categories(id) ON DELETE CASCADE,
  PRIMARY KEY (project_id, category_id)
);
ALTER TABLE project_categories ENABLE ROW LEVEL SECURITY;

-- 5. Junction: project <-> tech tags
CREATE TABLE IF NOT EXISTS project_tech_tags (
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  tag_id     UUID NOT NULL REFERENCES portfolio_tech_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (project_id, tag_id)
);
ALTER TABLE project_tech_tags ENABLE ROW LEVEL SECURITY;

-- 6. Gallery items
CREATE TABLE IF NOT EXISTS project_gallery (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  media_type TEXT NOT NULL CHECK (media_type IN ('image','video')),
  media_id   TEXT NOT NULL DEFAULT '',
  url        TEXT NOT NULL DEFAULT '',
  caption    TEXT NOT NULL DEFAULT '',
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE project_gallery ENABLE ROW LEVEL SECURITY;

-- 7. External links
CREATE TABLE IF NOT EXISTS project_links (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title      TEXT NOT NULL DEFAULT '',
  url        TEXT NOT NULL DEFAULT '',
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE project_links ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS Policies (anon read, admin full access)
-- =============================================

CREATE POLICY "anon_read" ON portfolio_categories FOR SELECT USING (true);
CREATE POLICY "admin_all" ON portfolio_categories FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "anon_read" ON portfolio_tech_tags FOR SELECT USING (true);
CREATE POLICY "admin_all" ON portfolio_tech_tags FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "anon_read" ON project_categories FOR SELECT USING (true);
CREATE POLICY "admin_all" ON project_categories FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "anon_read" ON project_tech_tags FOR SELECT USING (true);
CREATE POLICY "admin_all" ON project_tech_tags FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "anon_read" ON project_gallery FOR SELECT USING (true);
CREATE POLICY "admin_all" ON project_gallery FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "anon_read" ON project_links FOR SELECT USING (true);
CREATE POLICY "admin_all" ON project_links FOR ALL USING (auth.role() = 'authenticated');

-- =============================================
-- Seed default categories
-- =============================================

INSERT INTO portfolio_categories (name, slug, sort_order) VALUES
  ('Brand Identity', 'brand-identity', 0),
  ('Motion Design', 'motion-design', 1),
  ('Video Editing', 'video-editing', 2),
  ('3D', '3d', 3),
  ('CGI', 'cgi', 4),
  ('AI', 'ai', 5),
  ('UI/UX', 'ui-ux', 6),
  ('Web', 'web', 7),
  ('Advertising', 'advertising', 8),
  ('Creative Direction', 'creative-direction', 9)
ON CONFLICT (slug) DO NOTHING;

-- =============================================
-- Seed default tech tags
-- =============================================

INSERT INTO portfolio_tech_tags (name, slug, sort_order) VALUES
  ('Photoshop', 'photoshop', 0),
  ('Illustrator', 'illustrator', 1),
  ('Premiere Pro', 'premiere-pro', 2),
  ('After Effects', 'after-effects', 3),
  ('DaVinci Resolve', 'davinci-resolve', 4),
  ('Blender', 'blender', 5),
  ('Cinema4D', 'cinema4d', 6),
  ('React', 'react', 7),
  ('Next.js', 'nextjs', 8),
  ('TailwindCSS', 'tailwindcss', 9),
  ('Framer Motion', 'framer-motion', 10),
  ('Supabase', 'supabase', 11)
ON CONFLICT (slug) DO NOTHING;

-- =============================================
-- Migrate existing data
-- =============================================

-- Generate slugs from titles for existing projects
UPDATE projects SET slug = LOWER(
  REGEXP_REPLACE(
    REGEXP_REPLACE(
      REGEXP_REPLACE(TRIM(title), '[^a-zA-Z0-9\s-]', '', 'g'),
      '\s+', '-', 'g'
    ),
    '^-+|-+$', '', 'g'
  )
) WHERE slug = '' AND title != '';

-- Copy description -> full_description where empty
UPDATE projects SET full_description = description WHERE full_description = '' AND description != '';

-- Migrate existing category text -> junction table entries
DO $$
DECLARE
  proj RECORD;
  cat RECORD;
  cat_slug TEXT;
BEGIN
  FOR proj IN SELECT id, category FROM projects WHERE category != '' LOOP
    cat_slug := LOWER(REGEXP_REPLACE(REGEXP_REPLACE(TRIM(proj.category), '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g'));
    SELECT id INTO cat FROM portfolio_categories WHERE slug = cat_slug;
    IF cat IS NULL AND cat_slug != '' THEN
      INSERT INTO portfolio_categories (name, slug, sort_order)
      VALUES (proj.category, cat_slug, (SELECT COALESCE(MAX(sort_order),-1)+1 FROM portfolio_categories))
      RETURNING id INTO cat;
    END IF;
    IF cat IS NOT NULL THEN
      INSERT INTO project_categories (project_id, category_id) VALUES (proj.id, cat)
      ON CONFLICT DO NOTHING;
    END IF;
  END LOOP;
END $$;

-- Migrate existing technologies text -> junction table entries
DO $$
DECLARE
  proj RECORD;
  tech TEXT;
  tag RECORD;
  tag_slug TEXT;
BEGIN
  FOR proj IN SELECT id, technologies FROM projects WHERE technologies != '' LOOP
    FOR tech IN SELECT UNNEST(STRING_TO_ARRAY(proj.technologies, ',')) LOOP
      tech := TRIM(tech);
      IF tech = '' THEN CONTINUE; END IF;
      tag_slug := LOWER(REGEXP_REPLACE(REGEXP_REPLACE(tech, '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g'));
      SELECT id INTO tag FROM portfolio_tech_tags WHERE slug = tag_slug;
      IF tag IS NULL THEN
        INSERT INTO portfolio_tech_tags (name, slug, sort_order)
        VALUES (tech, tag_slug, (SELECT COALESCE(MAX(sort_order),-1)+1 FROM portfolio_tech_tags))
        RETURNING id INTO tag;
      END IF;
      INSERT INTO project_tech_tags (project_id, tag_id) VALUES (proj.id, tag)
      ON CONFLICT DO NOTHING;
    END LOOP;
  END LOOP;
END $$;

-- Migrate existing gallery_media_ids -> project_gallery entries
DO $$
DECLARE
  proj RECORD;
  gid TEXT;
  idx INT;
  media_url TEXT;
BEGIN
  FOR proj IN SELECT id, gallery_media_ids FROM projects LOOP
    idx := 0;
    IF proj.gallery_media_ids IS NOT NULL THEN
      FOR gid IN SELECT UNNEST(ARRAY(SELECT JSONB_ARRAY_ELEMENTS_TEXT(proj.gallery_media_ids))) LOOP
        IF gid IS NULL OR gid = '' THEN CONTINUE; END IF;
        SELECT public_url INTO media_url FROM media_files WHERE id = gid;
        INSERT INTO project_gallery (project_id, media_type, media_id, url, sort_order)
        VALUES (proj.id, 'image', gid, COALESCE(media_url, ''), idx);
        idx := idx + 1;
      END LOOP;
    END IF;
  END LOOP;
END $$;

-- Migrate live URL -> project_links
DO $$
DECLARE
  proj RECORD;
BEGIN
  FOR proj IN SELECT id, live FROM projects WHERE live != '' AND live != '#' LOOP
    INSERT INTO project_links (project_id, title, url, sort_order)
    VALUES (proj.id, 'Preview', proj.live, 0)
    ON CONFLICT DO NOTHING;
  END LOOP;
END $$;

-- Migrate github_url -> project_links
DO $$
DECLARE
  proj RECORD;
BEGIN
  FOR proj IN SELECT id, github_url FROM projects WHERE github_url != '' LOOP
    INSERT INTO project_links (project_id, title, url, sort_order)
    VALUES (proj.id, 'GitHub', proj.github_url, 1)
    ON CONFLICT DO NOTHING;
  END LOOP;
END $$;
