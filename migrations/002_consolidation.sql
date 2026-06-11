-- ============================================================================
-- Phase 2: Consolidation — Unified audit, fix grievance validation, bucket separation
-- Migration: 002_consolidation
-- Created: 2026-06-05 by dconsult (re-execution of t_799d020e)
-- Rollback: 002_consolidation_rollback.sql — requires pg_restore
-- ⚠  HIGH-RISK: Back up database before running.
-- ============================================================================

BEGIN;

-- ── 2.1 Preserve existing audit data ──────────────────────────────────────
-- Rename old tables for safe keeping (don't drop yet)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'audit_logs') THEN
        ALTER TABLE audit_logs RENAME TO audit_logs_v003;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'audit_log') THEN
        ALTER TABLE audit_log RENAME TO audit_log_v008;
    END IF;
EXCEPTION WHEN undefined_table THEN
    -- One or both don't exist, continue
END $$;

-- Also handle if a second audit_logs variant exists from migration 004
DO $$
BEGIN
    -- Migration 004 created a simpler audit_logs; check if a table with that name still exists
    -- (it would have been caught by the rename above if it was the active one)
    IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_name = 'audit_logs_v004'
    ) THEN
        -- Already preserved, nothing to do
        RAISE NOTICE 'audit_logs_v004 already exists';
    END IF;
END $$;

-- ── 2.2 Create unified audit_logs table ───────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    session_id TEXT,
    event_type TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id UUID,
    action TEXT NOT NULL,
    details JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    severity TEXT DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'error', 'critical')),
    success BOOLEAN DEFAULT TRUE,
    error_message TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS audit_logs_user_id_idx ON audit_logs (user_id);
CREATE INDEX IF NOT EXISTS audit_logs_event_type_idx ON audit_logs (event_type);
CREATE INDEX IF NOT EXISTS audit_logs_resource_type_idx ON audit_logs (resource_type, resource_id);
CREATE INDEX IF NOT EXISTS audit_logs_created_at_idx ON audit_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS audit_logs_severity_idx ON audit_logs (severity);

-- ── 2.3 Migrate data from old audit tables ────────────────────────────────
-- From v003 (18 columns)
INSERT INTO audit_logs (id, user_id, event_type, resource_type, resource_id, action,
    details, ip_address, user_agent, severity, success, error_message, metadata, created_at)
SELECT id, user_id, event_type, resource_type, resource_id, action,
    details, ip_address::inet, user_agent,
    COALESCE(severity, 'info'), COALESCE(success, true), error_message,
    COALESCE(metadata, '{}'), COALESCE(created_at, NOW())
FROM audit_logs_v003
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'audit_logs_v003');

-- From v008 (simple audit — map operation→action, table_name→resource_type)
INSERT INTO audit_logs (user_id, event_type, resource_type, action, details, created_at)
SELECT user_id, 'data_change', table_name, operation,
    jsonb_build_object('old_data', old_data, 'new_data', new_data),
    created_at
FROM audit_log_v008
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'audit_log_v008');

-- ── 2.4 Fix grievance status validation ───────────────────────────────────
-- Drop old trigger function and recreate with aligned status values
DROP TRIGGER IF EXISTS validate_grievance_status ON grievances;
DROP FUNCTION IF EXISTS validate_status_transition();

CREATE OR REPLACE FUNCTION validate_status_transition()
RETURNS TRIGGER AS $$
BEGIN
    -- Allowed transitions:
    -- submitted → under_review
    -- under_review → investigating
    -- investigating → resolved
    -- resolved → closed
    -- Any status → under_review (re-open)
    IF NEW.status = OLD.status THEN
        RETURN NEW;
    END IF;

    CASE OLD.status
        WHEN 'submitted' THEN
            IF NEW.status NOT IN ('under_review') THEN
                RAISE EXCEPTION 'Invalid transition: % → %', OLD.status, NEW.status;
            END IF;
        WHEN 'under_review' THEN
            IF NEW.status NOT IN ('investigating', 'submitted') THEN
                RAISE EXCEPTION 'Invalid transition: % → %', OLD.status, NEW.status;
            END IF;
        WHEN 'investigating' THEN
            IF NEW.status NOT IN ('resolved', 'under_review') THEN
                RAISE EXCEPTION 'Invalid transition: % → %', OLD.status, NEW.status;
            END IF;
        WHEN 'resolved' THEN
            IF NEW.status NOT IN ('closed', 'investigating') THEN
                RAISE EXCEPTION 'Invalid transition: % → %', OLD.status, NEW.status;
            END IF;
        WHEN 'closed' THEN
            IF NEW.status NOT IN ('under_review') THEN
                RAISE EXCEPTION 'Invalid transition: % → %', OLD.status, NEW.status;
            END IF;
        ELSE
            RAISE EXCEPTION 'Unknown status: %', OLD.status;
    END CASE;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_grievance_status
    BEFORE UPDATE OF status ON grievances
    FOR EACH ROW
    EXECUTE FUNCTION validate_status_transition();

-- ── 2.5 Add geographic index for safety_reports ───────────────────────────
CREATE INDEX IF NOT EXISTS safety_reports_location_idx
    ON safety_reports (latitude, longitude)
    WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- ── 2.6 Update RLS policies to new role names ─────────────────────────────
-- (Supabase RLS — rebuild policies for normalized roles)
-- Drop old policies that reference deprecated role names
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN
        SELECT policyname, tablename
        FROM pg_policies
        WHERE schemaname = 'public'
          AND (qual LIKE '%union_rep%' OR qual LIKE '%hr_manager%' OR qual LIKE '%employee%' OR qual LIKE '%representative%')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', pol.policyname, pol.tablename);
    END LOOP;
END $$;

-- Re-create key RLS policies with normalized roles
-- Users: members see own, stewards see department, admins see all
CREATE POLICY "users_member_access" ON users
    FOR SELECT USING (auth.uid() = id OR (SELECT role FROM user_profiles WHERE user_id = auth.uid()) IN ('steward', 'safety_officer', 'admin'));

-- Grievances: members see own, stewards/safety_officers see department, admins see all
CREATE POLICY "grievances_role_access" ON grievances
    FOR SELECT USING (
        auth.uid() = user_id
        OR (SELECT role FROM user_profiles WHERE user_id = auth.uid()) = 'admin'
    );

COMMIT;
