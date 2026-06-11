-- ============================================================================
-- Phase 3: Scale Preparation — Partition messages, PgBouncer prep, read replicas
-- Migration: 003_scale_preparation
-- Created: 2026-06-05 by dconsult (re-execution of t_799d020e)
-- Rollback: 003_scale_preparation_rollback.sql
-- ⚠  HIGH-RISK: This migration recreates the messages table. Back up first.
-- Strategy: dual-write cutover — app writes to both old + partitioned during transition
-- ============================================================================

BEGIN;

-- ── 3.1 Create partitioned messages table ──────────────────────────────────
CREATE TABLE IF NOT EXISTS messages_partitioned (
    id UUID DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);

-- Create partitions for current + next 3 months
-- June 2026
CREATE TABLE IF NOT EXISTS messages_2026_06 PARTITION OF messages_partitioned
    FOR VALUES FROM ('2026-06-01') TO ('2026-07-01');

-- July 2026
CREATE TABLE IF NOT EXISTS messages_2026_07 PARTITION OF messages_partitioned
    FOR VALUES FROM ('2026-07-01') TO ('2026-08-01');

-- August 2026
CREATE TABLE IF NOT EXISTS messages_2026_08 PARTITION OF messages_partitioned
    FOR VALUES FROM ('2026-08-01') TO ('2026-09-01');

-- September 2026
CREATE TABLE IF NOT EXISTS messages_2026_09 PARTITION OF messages_partitioned
    FOR VALUES FROM ('2026-09-01') TO ('2026-10-01');

-- ── 3.2 Index partitioned table ───────────────────────────────────────────
CREATE INDEX IF NOT EXISTS messages_part_conv_idx ON messages_partitioned (conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS messages_part_role_idx ON messages_partitioned (role, created_at DESC);
CREATE INDEX IF NOT EXISTS messages_part_content_idx ON messages_partitioned USING GIN (to_tsvector('english', content));

-- ── 3.3 Migrate existing messages to partitioned table ────────────────────
INSERT INTO messages_partitioned (id, conversation_id, role, content, metadata, created_at)
SELECT id, conversation_id, role, content, COALESCE(metadata, '{}'), created_at
FROM messages
ON CONFLICT DO NOTHING;

-- ── 3.4 Create analytics materialized views ───────────────────────────────
-- User activity summary
DROP MATERIALIZED VIEW IF EXISTS user_activity_summary;
CREATE MATERIALIZED VIEW user_activity_summary AS
SELECT
    u.id AS user_id,
    u.email,
    up.department,
    COUNT(DISTINCT c.id) AS total_conversations,
    COUNT(DISTINCT g.id) AS total_grievances,
    COUNT(DISTINCT sr.id) AS total_safety_reports,
    COUNT(DISTINCT te.id) AS enrolled_trainings,
    MAX(ae.timestamp) AS last_activity
FROM users u
LEFT JOIN user_profiles up ON up.user_id = u.id
LEFT JOIN conversations c ON c.user_id = u.id
LEFT JOIN grievances g ON g.user_id = u.id
LEFT JOIN safety_reports sr ON sr.user_id = u.id
LEFT JOIN training_enrollments te ON te.user_id = u.id
LEFT JOIN analytics_events ae ON ae.user_id = u.id
GROUP BY u.id, u.email, up.department;

CREATE UNIQUE INDEX IF NOT EXISTS user_activity_summary_user_id_idx ON user_activity_summary (user_id);

-- Department stats (materialized)
DROP MATERIALIZED VIEW IF EXISTS department_stats_mv;
CREATE MATERIALIZED VIEW department_stats_mv AS
SELECT
    COALESCE(up.department, 'Unassigned') AS department,
    COUNT(DISTINCT u.id) AS member_count,
    COUNT(DISTINCT g.id) FILTER (WHERE g.status IN ('submitted', 'under_review', 'investigating')) AS active_grievances,
    COUNT(DISTINCT sr.id) FILTER (WHERE sr.status = 'reported') AS safety_incidents,
    ROUND(
        COUNT(DISTINCT te.id) FILTER (WHERE te.status = 'completed')::numeric
        / NULLIF(COUNT(DISTINCT te.id), 0) * 100, 2
    ) AS training_compliance,
    NOW() AS last_updated
FROM users u
LEFT JOIN user_profiles up ON up.user_id = u.id
LEFT JOIN grievances g ON g.user_id = u.id
LEFT JOIN safety_reports sr ON sr.user_id = u.id
LEFT JOIN training_enrollments te ON te.user_id = u.id
GROUP BY up.department;

CREATE UNIQUE INDEX IF NOT EXISTS department_stats_mv_department_idx ON department_stats_mv (department);

-- ── 3.5 Refresh function for analytics ────────────────────────────────────
CREATE OR REPLACE FUNCTION refresh_analytics_views()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY user_activity_summary;
    REFRESH MATERIALIZED VIEW CONCURRENTLY department_stats_mv;
END;
$$ LANGUAGE plpgsql;

-- ── 3.6 PgBouncer preparation — statement_timeout safety ──────────────────
-- Set reasonable timeouts for pooled connections
ALTER DATABASE postgres SET statement_timeout = '30s';
ALTER DATABASE postgres SET idle_in_transaction_session_timeout = '60s';

-- ── 3.7 Connection pooling note ───────────────────────────────────────────
-- PgBouncer must be enabled in Supabase Dashboard → Database → Connection Pooling
-- Mode: Transaction
-- Pool size: 25-50 connections

COMMIT;
