-- Sprint 6: Versioning & Recovery
-- Idempotent: safe to run multiple times

-- Version history table
CREATE TABLE IF NOT EXISTS versions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  version_number INTEGER NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  snapshot JSONB NOT NULL DEFAULT '{}',
  summary TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT
);

CREATE INDEX IF NOT EXISTS idx_versions_entity ON versions(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_versions_created_at ON versions(created_at DESC);

-- Recycle bin for soft deletes
CREATE TABLE IF NOT EXISTS recycle_bin (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  entity_title TEXT,
  snapshot JSONB NOT NULL DEFAULT '{}',
  deleted_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_by TEXT,
  expires_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_recycle_bin_entity ON recycle_bin(entity_type);
CREATE INDEX IF NOT EXISTS idx_recycle_bin_expires ON recycle_bin(expires_at);

-- Add publish_status to projects if not exists
DO $$ BEGIN
  ALTER TABLE projects ADD COLUMN IF NOT EXISTS publish_status TEXT DEFAULT 'published';
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- Enable RLS
ALTER TABLE versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE recycle_bin ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "versions_admin_all" ON versions;
CREATE POLICY "versions_admin_all" ON versions
  FOR ALL USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "versions_anon_read" ON versions;
CREATE POLICY "versions_anon_read" ON versions
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "recycle_bin_admin_all" ON recycle_bin;
CREATE POLICY "recycle_bin_admin_all" ON recycle_bin
  FOR ALL USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "recycle_bin_anon_read" ON recycle_bin;
CREATE POLICY "recycle_bin_anon_read" ON recycle_bin
  FOR SELECT USING (true);
