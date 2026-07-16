-- Add missing columns to services table that the application expects.
-- Idempotent: safe to run multiple times.

ALTER TABLE services ADD COLUMN IF NOT EXISTS active   BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE services ADD COLUMN IF NOT EXISTS category TEXT    NOT NULL DEFAULT '';
