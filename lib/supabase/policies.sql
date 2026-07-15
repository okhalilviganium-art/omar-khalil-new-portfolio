-- =============================================
-- PORTFOLIO SITE — Row Level Security Migration
-- Run this AFTER schema.sql in the Supabase SQL Editor.
-- Enables RLS on every table and creates policies.
-- This migration is idempotent — safe to run multiple times.
-- =============================================

-- =============================================
-- 1. ENABLE ROW LEVEL SECURITY
-- =============================================

ALTER TABLE projects     ENABLE ROW LEVEL SECURITY;
ALTER TABLE services     ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages     ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE statistics   ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_files  ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 2. ENABLE REALTIME ON MESSAGES
--    Required for Supabase Realtime subscriptions
--    (postgres_changes) to work.
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
-- Helper: create a policy only if it doesn't already exist.
-- Uses a DO block that drops + recreates, which is safe
-- for idempotent migrations.
-- =============================================

-- Helper function to drop policy if exists, then recreate
CREATE OR REPLACE FUNCTION _create_policy_if_not_exists(
  p_name text,
  p_table text,
  p_cmd text,
  p_grantee text,
  p_using text,
  p_with_check text DEFAULT NULL
) RETURNS void AS $fn$
BEGIN
  EXECUTE format('DROP POLICY IF EXISTS %I ON %I', p_name, p_table);

  IF p_with_check IS NOT NULL THEN
    EXECUTE format(
      'CREATE POLICY %I ON %I FOR %s TO %I USING (%s) WITH CHECK (%s)',
      p_name, p_table, p_cmd, p_grantee, p_using, p_with_check
    );
  ELSE
    EXECUTE format(
      'CREATE POLICY %I ON %I FOR %s TO %I USING (%s)',
      p_name, p_table, p_cmd, p_grantee, p_using
    );
  END IF;
END;
$fn$ LANGUAGE plpgsql;

-- =============================================
-- 3. PUBLIC (ANON) POLICIES
--    Public users can READ the public tables
--    and INSERT into messages only.
--    Anon SELECT on messages is required for
--    Supabase Realtime (postgres_changes).
-- =============================================

SELECT _create_policy_if_not_exists(
  'Public can read projects', 'projects', 'SELECT', 'anon', 'true');
SELECT _create_policy_if_not_exists(
  'Public can read services', 'services', 'SELECT', 'anon', 'true');
SELECT _create_policy_if_not_exists(
  'Public can read site_settings', 'site_settings', 'SELECT', 'anon', 'true');
SELECT _create_policy_if_not_exists(
  'Public can read social_links', 'social_links', 'SELECT', 'anon', 'true');
SELECT _create_policy_if_not_exists(
  'Public can read statistics', 'statistics', 'SELECT', 'anon', 'true');
SELECT _create_policy_if_not_exists(
  'Public can read media_files', 'media_files', 'SELECT', 'anon', 'true');
SELECT _create_policy_if_not_exists(
  'Public can read messages', 'messages', 'SELECT', 'anon', 'true');

SELECT _create_policy_if_not_exists(
  'Public can insert messages', 'messages', 'INSERT', 'anon',
  '(status = ''unread'' OR status IS NULL) AND (is_read = false OR is_read IS NULL)',
  '(status = ''unread'' OR status IS NULL) AND (is_read = false OR is_read IS NULL)'
);

-- =============================================
-- 4. AUTHENTICATED (ADMIN) POLICIES
--    Full CRUD on all tables.
-- =============================================

SELECT _create_policy_if_not_exists(
  'Admin full access on projects', 'projects', 'ALL', 'authenticated', 'true', 'true');
SELECT _create_policy_if_not_exists(
  'Admin full access on services', 'services', 'ALL', 'authenticated', 'true', 'true');
SELECT _create_policy_if_not_exists(
  'Admin full access on messages', 'messages', 'ALL', 'authenticated', 'true', 'true');
SELECT _create_policy_if_not_exists(
  'Admin full access on site_settings', 'site_settings', 'ALL', 'authenticated', 'true', 'true');
SELECT _create_policy_if_not_exists(
  'Admin full access on social_links', 'social_links', 'ALL', 'authenticated', 'true', 'true');
SELECT _create_policy_if_not_exists(
  'Admin full access on statistics', 'statistics', 'ALL', 'authenticated', 'true', 'true');
SELECT _create_policy_if_not_exists(
  'Admin full access on media_files', 'media_files', 'ALL', 'authenticated', 'true', 'true');

-- =============================================
-- 5. SUPABASE STORAGE — Media bucket
-- =============================================

INSERT INTO storage.buckets (id, name, public) VALUES ('media', 'media', true) ON CONFLICT DO NOTHING;

SELECT _create_policy_if_not_exists(
  'Public read access to media', 'storage.objects', 'SELECT', 'anon', 'bucket_id = ''media''');
SELECT _create_policy_if_not_exists(
  'Admin full access on media', 'storage.objects', 'ALL', 'authenticated',
  'bucket_id = ''media''', 'bucket_id = ''media''');

-- storage: service_role bypasses RLS — no policy needed

-- =============================================
-- 6. CLEANUP helper function (optional, safe to keep)
-- =============================================
DROP FUNCTION _create_policy_if_not_exists(text, text, text, text, text, text);
