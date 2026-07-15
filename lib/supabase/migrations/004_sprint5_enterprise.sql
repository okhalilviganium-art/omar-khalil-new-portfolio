-- Sprint 5: Activity Log + Favorites tables
-- Idempotent: safe to run multiple times

-- Activity log for tracking all CMS mutations
CREATE TABLE IF NOT EXISTS activity_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  entity_title TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_log_created_at ON activity_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_log_entity_type ON activity_log(entity_type);

-- Favorites for pinning projects, media, folders
CREATE TABLE IF NOT EXISTS favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  entity_title TEXT,
  entity_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(entity_type, entity_id)
);

-- Notifications table for persistent notification history
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT,
  type TEXT DEFAULT 'info',
  read BOOLEAN DEFAULT FALSE,
  entity_type TEXT,
  entity_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- Enable RLS
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Activity log: admin full access, anon read
DROP POLICY IF EXISTS "activity_log_admin_all" ON activity_log;
CREATE POLICY "activity_log_admin_all" ON activity_log
  FOR ALL USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "activity_log_anon_read" ON activity_log;
CREATE POLICY "activity_log_anon_read" ON activity_log
  FOR SELECT USING (true);

-- Favorites: admin full access, anon read
DROP POLICY IF EXISTS "favorites_admin_all" ON favorites;
CREATE POLICY "favorites_admin_all" ON favorites
  FOR ALL USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "favorites_anon_read" ON favorites;
CREATE POLICY "favorites_anon_read" ON favorites
  FOR SELECT USING (true);

-- Notifications: admin full access, anon read
DROP POLICY IF EXISTS "notifications_admin_all" ON notifications;
CREATE POLICY "notifications_admin_all" ON notifications
  FOR ALL USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "notifications_anon_read" ON notifications;
CREATE POLICY "notifications_anon_read" ON notifications
  FOR SELECT USING (true);
