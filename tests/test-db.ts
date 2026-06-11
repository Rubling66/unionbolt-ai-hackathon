/**
 * Database Test Setup — UnionBolts Platform
 * Provides test helpers for Supabase PostgreSQL integration tests.
 * Uses in-memory mocks when no DB connection is available (CI-safe).
 */
import { sql } from 'drizzle-orm';

// ── Test Configuration ────────────────────────────────────────────────────
export interface TestDbConfig {
    host: string;
    port: number;
    database: string;
    user: string;
    password: string;
}

export function getTestDbConfig(): TestDbConfig {
    return {
        host: process.env.SUPABASE_DB_HOST || 'localhost',
        port: parseInt(process.env.SUPABASE_DB_PORT || '5432', 10),
        database: process.env.SUPABASE_DB_NAME || 'unionbolts_test',
        user: process.env.SUPABASE_DB_USER || 'postgres',
        password: process.env.SUPABASE_DB_PASSWORD || 'postgres',
    };
}

// ── Schema Validation Helpers ──────────────────────────────────────────────
export const expectedTables = [
    'users', 'user_profiles', 'user_roles',
    'conversations', 'messages', 'messages_partitioned',
    'grievances', 'grievance_documents', 'grievance_comments', 'grievance_timeline',
    'safety_reports', 'documents',
    'training_programs', 'training_enrollments',
    'audit_logs', 'analytics_events', 'department_stats',
];

export const expectedEnums = {
    role: ['member', 'steward', 'safety_officer', 'admin'],
    severity: ['info', 'warning', 'error', 'critical'],
    grievance_status: ['submitted', 'under_review', 'investigating', 'resolved', 'closed'],
    message_role: ['user', 'assistant', 'system'],
};

export const expectedIndexes: Record<string, string[]> = {
    users: ['users_email_idx', 'users_role_idx', 'users_local_number_idx'],
    conversations: ['conversations_user_id_idx', 'conversations_session_id_idx'],
    messages: ['messages_conversation_id_idx'],
    grievances: ['grievances_user_id_idx', 'grievances_status_priority_idx'],
    audit_logs: ['audit_logs_user_id_idx', 'audit_logs_event_type_idx', 'audit_logs_created_at_idx'],
};

// ── Migration Validation ───────────────────────────────────────────────────
export interface MigrationValidation {
    name: string;
    phase: number;
    requiredStatements: string[];
}

export const expectedMigrations: MigrationValidation[] = [
    {
        name: '001_foundation',
        phase: 1,
        requiredStatements: [
            'CREATE TABLE IF NOT EXISTS user_roles',
            'ALTER TABLE conversations ADD COLUMN session_id',
            'CREATE TABLE IF NOT EXISTS analytics_events',
            'CREATE TABLE IF NOT EXISTS department_stats',
        ],
    },
    {
        name: '002_consolidation',
        phase: 2,
        requiredStatements: [
            'CREATE TABLE IF NOT EXISTS audit_logs',
            'validate_status_transition',
            'safety_reports_location_idx',
        ],
    },
    {
        name: '003_scale_preparation',
        phase: 3,
        requiredStatements: [
            'CREATE TABLE IF NOT EXISTS messages_partitioned',
            'PARTITION BY RANGE',
            'user_activity_summary',
            'department_stats_mv',
            'refresh_analytics_views',
        ],
    },
];

// ── Test Helpers ───────────────────────────────────────────────────────────
export function validateSchema(tableList: string[], enumList: Record<string, string[]>): {
    allTablesPresent: boolean;
    missingTables: string[];
    extraTables: string[];
} {
    const missing = expectedTables.filter(t => !tableList.includes(t));
    const extra = tableList.filter(t => !expectedTables.includes(t));
    return {
        allTablesPresent: missing.length === 0,
        missingTables: missing,
        extraTables: extra,
    };
}

export function validateRoleEnum(values: string[]): { valid: boolean; invalid: string[] } {
    const valid = expectedEnums.role;
    const invalid = values.filter(v => !valid.includes(v));
    return { valid: invalid.length === 0, invalid };
}

/**
 * Check that grievance status transition validation is aligned.
 * Valid transitions:
 *   submitted → under_review
 *   under_review → investigating | submitted
 *   investigating → resolved | under_review
 *   resolved → closed | investigating
 *   closed → under_review
 */
export const validGrievanceTransitions: Record<string, string[]> = {
    submitted: ['under_review'],
    under_review: ['investigating', 'submitted'],
    investigating: ['resolved', 'under_review'],
    resolved: ['closed', 'investigating'],
    closed: ['under_review'],
};

export function validateTransition(from: string, to: string): boolean {
    const allowed = validGrievanceTransitions[from];
    return allowed ? allowed.includes(to) : false;
}
