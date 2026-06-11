-- ============================================================================
-- Phase 1: Foundation — Normalize role system, add session_id, introspect base
-- Migration: 001_foundation
-- Created: 2026-06-05 by dconsult (re-execution of t_799d020e)
-- Rollback: 001_foundation_rollback.sql
-- ============================================================================

BEGIN;

-- ── 1.1 User Roles Lookup Table ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Seed standard roles
INSERT INTO user_roles (code, display_name, description) VALUES
    ('member', 'Union Member', 'Rank-and-file union member with access to own data'),
    ('steward', 'Union Steward', 'Union steward/representative with department-level access'),
    ('safety_officer', 'Safety Officer', 'Safety specialist with incident management access'),
    ('admin', 'Platform Administrator', 'Full platform access, all features')
ON CONFLICT (code) DO NOTHING;

-- ── 1.2 Add session_id to conversations ───────────────────────────────────
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'conversations' AND column_name = 'session_id'
    ) THEN
        ALTER TABLE conversations ADD COLUMN session_id TEXT NOT NULL DEFAULT '';
    END IF;
END $$;

-- ── 1.3 Normalize Role System ─────────────────────────────────────────────
-- Update users.role CHECK constraint
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check
    CHECK (role IN ('member', 'steward', 'safety_officer', 'admin'));

-- Update user_profiles.role CHECK constraint
ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_role_check;
ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_role_check
    CHECK (role IN ('member', 'steward', 'safety_officer', 'admin'));

-- Migrate existing role data
UPDATE users SET role = 'member' WHERE role NOT IN ('member', 'steward', 'safety_officer', 'admin');
UPDATE user_profiles SET role = 'member' WHERE role NOT IN ('member', 'steward', 'safety_officer', 'admin');

-- ── 1.4 Add index on conversations.session_id ─────────────────────────────
CREATE INDEX IF NOT EXISTS conversations_session_id_idx ON conversations (session_id);

-- ── 1.5 Create analytics_events table (replaces in-memory stubs) ──────────
CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    event_name VARCHAR(100) NOT NULL,
    event_category VARCHAR(50),
    properties JSONB DEFAULT '{}',
    session_id TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS analytics_user_id_idx ON analytics_events (user_id);
CREATE INDEX IF NOT EXISTS analytics_event_name_idx ON analytics_events (event_name);
CREATE INDEX IF NOT EXISTS analytics_timestamp_idx ON analytics_events (timestamp DESC);

-- ── 1.6 Create department_stats table ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS department_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    department VARCHAR(100) NOT NULL,
    member_count INTEGER DEFAULT 0,
    active_grievances INTEGER DEFAULT 0,
    safety_incidents INTEGER DEFAULT 0,
    training_compliance NUMERIC(5,2) DEFAULT 0,
    last_updated TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS department_stats_department_idx ON department_stats (department);

COMMIT;
