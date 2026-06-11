# UnionBolts Database — Drizzle ORM Schema

## Overview
This directory contains the Drizzle ORM schema for the UnionBolts platform database.
The schema models 17 tables across the Supabase PostgreSQL instance, plus analytics and partitioning.

## Architecture
- **ORM:** Drizzle ORM (drizzle-orm + drizzle-kit)
- **Database:** Supabase PostgreSQL 15
- **Pooling:** PgBouncer (transaction mode, port 6543)
- **Caching:** Redis (Upstash) for hot queries
- **Vector:** Pinecone for AI embeddings

## Schema

| # | Table | Purpose | Est. Scale |
|---|-------|---------|------------|
| 1 | users | Union member profiles | 14M |
| 2 | user_profiles | Extended profile data | 14M |
| 3 | user_roles | Role taxonomy lookup | 4 |
| 4 | conversations | AI chat sessions | 50M |
| 5 | messages | Chat messages | 500M+ |
| 6 | messages_partitioned | Partitioned messages (Phase 3) | 500M+ |
| 7 | grievances | Union grievance tracking | 5M |
| 8 | grievance_documents | Grievance evidence/files | 1M |
| 9 | grievance_comments | Grievance discussion | 10M |
| 10 | grievance_timeline | Status change log | 15M |
| 11 | safety_reports | Safety incident reports | 2M |
| 12 | documents | General file metadata | 10M |
| 13 | training_programs | Training catalog | 100+ |
| 14 | training_enrollments | Enrollment tracking | 3M |
| 15 | audit_logs | Unified activity audit | 100M |
| 16 | analytics_events | Event tracking | Variable |
| 17 | department_stats | Department analytics | ~100 |

## Role Taxonomy

| Role | Code | Access Level |
|------|------|-------------|
| Member | member | Own data only |
| Steward | steward | Department-level + grievance |
| Safety Officer | safety_officer | Safety + incident mgmt |
| Admin | admin | All data, all features |

## Migrations

Migrations live in `../migrations/` and follow a 3-phase approach:

1. **Phase 1 (001_foundation.sql):** Role normalization, session_id, analytics tables
2. **Phase 2 (002_consolidation.sql):** Audit consolidation, grievance validation fix
3. **Phase 3 (003_scale_preparation.sql):** Message partitioning, materialized views

## Commands

```bash
# Generate migrations from schema changes
npx drizzle-kit generate

# Apply migrations
npx drizzle-kit migrate

# Introspect existing database
npx drizzle-kit introspect

# Studio (GUI)
npx drizzle-kit studio
```

## Backup & Rollback

```bash
# Backup before migration
./scripts/backup.sh --phase 2

# Rollback if needed
./scripts/rollback.sh backups/unionbolts_full_20260605_120000.dump
```
