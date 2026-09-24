import {
  pgTable, uuid, text, varchar, timestamp, boolean, jsonb,
  integer, inet, pgEnum, foreignKey, uniqueIndex, index,
  serial, bigint, date, numeric, check
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// ── Enums ──────────────────────────────────────────────────────────────────
export const roleEnum = pgEnum('role', ['member', 'steward', 'safety_officer', 'admin']);
export const severityEnum = pgEnum('severity', ['info', 'warning', 'error', 'critical']);
export const grievanceStatusEnum = pgEnum('grievance_status', [
  'submitted', 'under_review', 'investigating', 'resolved', 'closed'
]);
export const messageRoleEnum = pgEnum('message_role', ['user', 'assistant', 'system']);

// ── Lookup Tables ─────────────────────────────────────────────────────────
export const userRoles = pgTable('user_roles', {
  id: uuid('id').defaultRandom().primaryKey(),
  code: varchar('code', { length: 50 }).notNull().unique(),
  displayName: varchar('display_name', { length: 100 }).notNull(),
  description: text('description'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// ── Core Tables ────────────────────────────────────────────────────────────
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  firstName: varchar('first_name', { length: 100 }),
  lastName: varchar('last_name', { length: 100 }),
  phone: varchar('phone', { length: 20 }),
  role: roleEnum('role').default('member').notNull(),
  localNumber: varchar('local_number', { length: 50 }),
  avatarUrl: text('avatar_url'),
  lastSignInAt: timestamp('last_sign_in_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  emailIdx: uniqueIndex('users_email_idx').on(table.email),
  roleIdx: index('users_role_idx').on(table.role),
  localNumberIdx: index('users_local_number_idx').on(table.localNumber),
}));

export const userProfiles = pgTable('user_profiles', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  role: roleEnum('role').default('member').notNull(),
  department: varchar('department', { length: 100 }),
  position: varchar('position', { length: 100 }),
  hireDate: date('hire_date'),
  bio: text('bio'),
  metadata: jsonb('metadata').default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  userIdIdx: uniqueIndex('user_profiles_user_id_idx').on(table.userId),
  roleIdx: index('user_profiles_role_idx').on(table.role),
  departmentIdx: index('user_profiles_department_idx').on(table.department),
}));

export const conversations = pgTable('conversations', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  sessionId: text('session_id').notNull().default(''),
  title: varchar('title', { length: 255 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('conversations_user_id_idx').on(table.userId),
  sessionIdIdx: index('conversations_session_id_idx').on(table.sessionId),
  titleSearchIdx: index('conversations_title_search_idx').using('gin', table.title),
}));

// Messages — target table for Phase 3 partitioning
export const messages = pgTable('messages', {
  id: uuid('id').defaultRandom().primaryKey(),
  conversationId: uuid('conversation_id').notNull().references(() => conversations.id, { onDelete: 'cascade' }),
  role: messageRoleEnum('role').notNull(),
  content: text('content').notNull(),
  metadata: jsonb('metadata').default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  conversationIdx: index('messages_conversation_id_idx').on(table.conversationId),
  roleCreatedIdx: compositeIndex('messages_role_created_idx', table.role, table.createdAt),
  contentSearchIdx: index('messages_content_search_idx').using('gin', table.content),
}));

export const grievances = pgTable('grievances', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 500 }).notNull(),
  description: text('description').notNull(),
  status: grievanceStatusEnum('status').default('submitted').notNull(),
  priority: varchar('priority', { length: 20 }).default('medium'),
  assignedTo: uuid('assigned_to').references(() => users.id),
  resolution: text('resolution'),
  resolvedAt: timestamp('resolved_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('grievances_user_id_idx').on(table.userId),
  statusPriorityIdx: index('grievances_status_priority_idx').on(table.status, table.priority),
  assignedToIdx: index('grievances_assigned_to_idx').on(table.assignedTo).where(sql`${table.assignedTo} IS NOT NULL`),
  titleSearchIdx: index('grievances_title_search_idx').using('gin', table.title, table.description),
}));

export const grievanceDocuments = pgTable('grievance_documents', {
  id: uuid('id').defaultRandom().primaryKey(),
  grievanceId: uuid('grievance_id').notNull().references(() => grievances.id, { onDelete: 'cascade' }),
  fileName: varchar('file_name', { length: 500 }).notNull(),
  fileSize: bigint('file_size', { mode: 'number' }).notNull(),
  fileType: varchar('file_type', { length: 100 }).notNull(),
  storagePath: text('storage_path').notNull(),
  uploadedBy: uuid('uploaded_by').notNull().references(() => users.id),
  uploadedAt: timestamp('uploaded_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  grievanceIdIdx: index('grievance_docs_grievance_id_idx').on(table.grievanceId),
}));

export const grievanceComments = pgTable('grievance_comments', {
  id: uuid('id').defaultRandom().primaryKey(),
  grievanceId: uuid('grievance_id').notNull().references(() => grievances.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  isInternal: boolean('is_internal').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  grievanceIdIdx: index('grievance_comments_grievance_id_idx').on(table.grievanceId),
}));

export const grievanceTimeline = pgTable('grievance_timeline', {
  id: uuid('id').defaultRandom().primaryKey(),
  grievanceId: uuid('grievance_id').notNull().references(() => grievances.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  fromStatus: grievanceStatusEnum('from_status'),
  toStatus: grievanceStatusEnum('to_status').notNull(),
  note: text('note'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  grievanceIdIdx: index('grievance_timeline_grievance_id_idx').on(table.grievanceId),
}));

export const safetyReports = pgTable('safety_reports', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 500 }).notNull(),
  description: text('description').notNull(),
  severity: severityEnum('severity').default('info').notNull(),
  location: text('location'),
  latitude: numeric('latitude'),
  longitude: numeric('longitude'),
  status: varchar('status', { length: 50 }).default('reported'),
  reportedAt: timestamp('reported_at', { withTimezone: true }).defaultNow().notNull(),
  resolvedAt: timestamp('resolved_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('safety_reports_user_id_idx').on(table.userId),
  statusIdx: index('safety_reports_status_idx').on(table.status),
  locationIdx: index('safety_reports_location_idx').on(table.latitude, table.longitude),
}));

export const documents = pgTable('documents', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  fileName: varchar('file_name', { length: 500 }).notNull(),
  fileSize: bigint('file_size', { mode: 'number' }).notNull(),
  fileType: varchar('file_type', { length: 100 }).notNull(),
  storagePath: text('storage_path').notNull(),
  category: varchar('category', { length: 100 }),
  tags: jsonb('tags').default([]),
  isPublic: boolean('is_public').default(false),
  uploadedAt: timestamp('uploaded_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  userIdCategoryIdx: index('documents_user_category_idx', table.userId, table.category, table.uploadedAt.desc()),
  tagsIdx: index('documents_tags_idx').using('gin', table.tags),
}));

export const trainingPrograms = pgTable('training_programs', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: varchar('title', { length: 500 }).notNull(),
  description: text('description'),
  category: varchar('category', { length: 100 }),
  durationMinutes: integer('duration_minutes'),
  isRequired: boolean('is_required').default(false),
  version: integer('version').default(1).notNull(),
  contentUrl: text('content_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const trainingEnrollments = pgTable('training_enrollments', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  programId: uuid('program_id').notNull().references(() => trainingPrograms.id, { onDelete: 'cascade' }),
  status: varchar('status', { length: 50 }).default('enrolled'),
  progressPercent: integer('progress_percent').default(0),
  startedAt: timestamp('started_at', { withTimezone: true }),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('training_enrollments_user_id_idx').on(table.userId),
  programIdIdx: index('training_enrollments_program_id_idx').on(table.programId),
  completedAtIdx: index('training_enrollments_completed_idx', table.completedAt).where(sql`${table.completedAt} IS NOT NULL`),
}));

// ── Unified Audit ─────────────────────────────────────────────────────────
export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  sessionId: text('session_id'),
  eventType: text('event_type').notNull(),
  resourceType: text('resource_type').notNull(),
  resourceId: uuid('resource_id'),
  action: text('action').notNull(),
  details: jsonb('details').default({}),
  ipAddress: inet('ip_address'),
  userAgent: text('user_agent'),
  severity: severityEnum('severity').default('info').notNull(),
  success: boolean('success').default(true),
  errorMessage: text('error_message'),
  metadata: jsonb('metadata').default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('audit_logs_user_id_idx').on(table.userId),
  eventTypeIdx: index('audit_logs_event_type_idx').on(table.eventType),
  resourceTypeIdx: index('audit_logs_resource_type_idx').on(table.resourceType, table.resourceId),
  createdAtIdx: index('audit_logs_created_at_idx', table.createdAt.desc()),
  severityIdx: index('audit_logs_severity_idx').on(table.severity),
}));

// ── Analytics (replaces in-memory stubs) ───────────────────────────────────
export const analyticsEvents = pgTable('analytics_events', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  eventName: varchar('event_name', { length: 100 }).notNull(),
  eventCategory: varchar('event_category', { length: 50 }),
  properties: jsonb('properties').default({}),
  sessionId: text('session_id'),
  timestamp: timestamp('timestamp', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('analytics_user_id_idx').on(table.userId),
  eventNameIdx: index('analytics_event_name_idx').on(table.eventName),
  timestampIdx: index('analytics_timestamp_idx', table.timestamp.desc()),
}));

export const departmentStats = pgTable('department_stats', {
  id: uuid('id').defaultRandom().primaryKey(),
  department: varchar('department', { length: 100 }).notNull(),
  memberCount: integer('member_count').default(0),
  activeGrievances: integer('active_grievances').default(0),
  safetyIncidents: integer('safety_incidents').default(0),
  trainingCompliance: numeric('training_compliance', { precision: 5, scale: 2 }).default('0'),
  lastUpdated: timestamp('last_updated', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  departmentIdx: uniqueIndex('department_stats_department_idx').on(table.department),
}));

// ── Helper composite index ────────────────────────────────────────────────
function compositeIndex(name: string, ...columns: any[]) {
  return index(name).on(...columns);
}

// ── Type exports ──────────────────────────────────────────────────────────
export type User = typeof users.$inferSelect;
export type UserProfile = typeof userProfiles.$inferSelect;
export type Conversation = typeof conversations.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type Grievance = typeof grievances.$inferSelect;
export type SafetyReport = typeof safetyReports.$inferSelect;
export type Document = typeof documents.$inferSelect;
export type AuditLog = typeof auditLogs.$inferSelect;

// ── Table registry (for migration introspect) ─────────────────────────────
export const allTables = {
  users, userProfiles, userRoles,
  conversations, messages,
  grievances, grievanceDocuments, grievanceComments, grievanceTimeline,
  safetyReports, documents,
  trainingPrograms, trainingEnrollments,
  auditLogs, analyticsEvents, departmentStats,
};
