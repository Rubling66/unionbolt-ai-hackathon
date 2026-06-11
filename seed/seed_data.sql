-- ============================================================================
-- UnionBolts Seed Data
-- Populates reference data and sample records for development/staging.
-- Run: psql -h $SUPABASE_DB_HOST -U $SUPABASE_DB_USER -d $SUPABASE_DB_NAME -f seed/seed_data.sql
-- ============================================================================

BEGIN;

-- ── Training Programs ─────────────────────────────────────────────────────
INSERT INTO training_programs (id, title, description, category, duration_minutes, is_required, version) VALUES
    ('a0000000-0000-0000-0000-000000000001', 'Workplace Safety Basics', 'Fundamental safety training covering OSHA standards, hazard recognition, and PPE requirements.', 'safety', 60, true, 1),
    ('a0000000-0000-0000-0000-000000000002', 'Hazard Communication', 'Understanding SDS sheets, chemical labeling, and hazard communication standards.', 'safety', 45, true, 1),
    ('a0000000-0000-0000-0000-000000000003', 'Grievance Filing Procedures', 'How to properly file and track union grievances through the platform.', 'union', 30, true, 1),
    ('a0000000-0000-0000-0000-000000000004', 'Steward Training — Level 1', 'Introduction to union steward responsibilities and member representation.', 'union', 120, false, 1),
    ('a0000000-0000-0000-0000-000000000005', 'Lockout/Tagout Procedures', 'Proper lockout/tagout procedures for hazardous energy control.', 'safety', 90, true, 1),
    ('a0000000-0000-0000-0000-000000000006', 'Contract Law for Union Members', 'Understanding collective bargaining agreements and contract enforcement.', 'union', 60, false, 1),
    ('a0000000-0000-0000-0000-000000000007', 'Emergency Response Planning', 'Emergency evacuation, first response, and incident reporting procedures.', 'safety', 45, true, 1),
    ('a0000000-0000-0000-0000-000000000008', 'AI Chat Assistant Training', 'How to use the UnionBolts AI chat for contract questions and grievance help.', 'platform', 20, false, 1)
ON CONFLICT (id) DO NOTHING;

-- ── Sample Users (for dev/staging only — not production PII) ──────────────
INSERT INTO users (id, email, first_name, last_name, role, local_number, created_at) VALUES
    ('b0000000-0000-0000-0000-000000000001', 'admin@unionbolts-staging.local', 'Admin', 'User', 'admin', 'LOCAL-100', NOW()),
    ('b0000000-0000-0000-0000-000000000002', 'steward@unionbolts-staging.local', 'Sarah', 'Steward', 'steward', 'LOCAL-200', NOW()),
    ('b0000000-0000-0000-0000-000000000003', 'safety@unionbolts-staging.local', 'Mike', 'Safety', 'safety_officer', 'LOCAL-300', NOW()),
    ('b0000000-0000-0000-0000-000000000004', 'member@unionbolts-staging.local', 'Jane', 'Member', 'member', 'LOCAL-400', NOW())
ON CONFLICT (id) DO NOTHING;

-- ── User Profiles ─────────────────────────────────────────────────────────
INSERT INTO user_profiles (id, user_id, role, department, position) VALUES
    ('c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'admin', 'IT', 'Platform Administrator'),
    ('c0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000002', 'steward', 'Assembly', 'Union Steward'),
    ('c0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000003', 'safety_officer', 'Safety', 'Safety Officer'),
    ('c0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000004', 'member', 'Assembly', 'Assembly Worker')
ON CONFLICT (id) DO NOTHING;

-- ── Sample Conversations ──────────────────────────────────────────────────
INSERT INTO conversations (id, user_id, session_id, title, created_at) VALUES
    ('d0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000004', 'sess_dev_001', 'Contract question — overtime pay', NOW() - INTERVAL '2 days'),
    ('d0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000004', 'sess_dev_002', 'Safety concern — machine guarding', NOW() - INTERVAL '1 day')
ON CONFLICT (id) DO NOTHING;

-- ── Sample Messages ───────────────────────────────────────────────────────
INSERT INTO messages (id, conversation_id, role, content, created_at) VALUES
    ('e0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'user', 'What are the overtime pay rules in our contract?', NOW() - INTERVAL '2 days'),
    ('e0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000001', 'assistant', 'According to your CBA Article 14, overtime is paid at 1.5x for hours over 40 per week and 2x for Sundays and holidays.', NOW() - INTERVAL '2 days' + INTERVAL '2 seconds'),
    ('e0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000002', 'user', 'The machine guard on Line 3 is loose and has been for weeks.', NOW() - INTERVAL '1 day'),
    ('e0000000-0000-0000-0000-000000000004', 'd0000000-0000-0000-0000-000000000002', 'assistant', 'This is a safety hazard. I recommend filing a safety report immediately. Would you like me to help you create one?', NOW() - INTERVAL '1 day' + INTERVAL '2 seconds')
ON CONFLICT (id) DO NOTHING;

-- ── Sample Grievance ──────────────────────────────────────────────────────
INSERT INTO grievances (id, user_id, title, description, status, priority, created_at) VALUES
    ('f0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000004', 'Unpaid overtime — Week of May 25', 'I worked 48 hours the week of May 25 but was only paid for 40. My timesheets show the extra hours.', 'submitted', 'high', NOW() - INTERVAL '3 days')
ON CONFLICT (id) DO NOTHING;

-- ── Audit log entry for seed data creation ────────────────────────────────
INSERT INTO audit_logs (user_id, event_type, resource_type, resource_id, action, details, severity)
VALUES ('b0000000-0000-0000-0000-000000000001', 'seed_data', 'system', 'b0000000-0000-0000-0000-000000000001', 'seed_data_loaded', '{"phase": "development", "description": "Seed data loaded for staging environment"}', 'info');

COMMIT;
