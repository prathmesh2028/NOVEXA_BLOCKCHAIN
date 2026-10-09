# Neon/Render Database Verification - Required SQL Queries

## Purpose
To determine the actual state of the Render/Neon database and resolve the P3005 deployment error.

## Instructions
1. Access the Render dashboard for the kavachtrust-backend service
2. Navigate to the PostgreSQL database service
3. Open the SQL Editor (or equivalent database access tool)
4. Run the following queries in order
5. Report the results to continue the fix

## Verification Queries

### Query 1: Check Database Name and Schema
```sql
SELECT current_database(), current_schema;
```

### Query 2: Check if _prisma_migrations Table Exists
```sql
SELECT table_name, table_schema
FROM information_schema.tables
WHERE table_name = '_prisma_migrations';
```

### Query 3: If _prisma_migrations Exists, Check Its Contents
```sql
SELECT migration_name, checksum, finished_at, applied_steps_count, started_at
FROM "_prisma_migrations"
ORDER BY started_at;
```

### Query 4: Check All Tables in Public Schema
```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

### Query 5: Check Current AppRole Enum Values
```sql
SELECT enumlabel, enumsortorder
FROM pg_enum
WHERE enumtypid = 'AppRole'::regtype
ORDER BY enumsortorder;
```

### Query 6: Check All Enum Types
```sql
SELECT typname
FROM pg_type
WHERE typtype = 'e'
ORDER BY typname;
```

### Query 7: Check for Data Using AppRole
```sql
-- Only run this if AppRole enum exists
SELECT 'user_roles' as table_name, COUNT(*) as count, ARRAY_AGG(DISTINCT role) as roles
FROM user_roles
GROUP BY 'user_roles'

UNION ALL

SELECT 'expected_transitions' as table_name, COUNT(*) as count, ARRAY_AGG(DISTINCT allowed_role) as roles
FROM expected_transitions
GROUP BY 'expected_transitions'

UNION ALL

SELECT 'approvals' as table_name, COUNT(*) as count, ARRAY_AGG(DISTINCT approver_role) as roles
FROM approvals
WHERE approver_role IS NOT NULL
GROUP BY 'approvals'

UNION ALL

SELECT 'notifications' as table_name, COUNT(*) as count, ARRAY_AGG(DISTINCT recipient_role) as roles
FROM notifications
WHERE recipient_role IS NOT NULL
GROUP BY 'notifications';
```

### Query 8: Check if Database is Empty
```sql
SELECT COUNT(*) as table_count
FROM information_schema.tables
WHERE table_schema = 'public';
```

### Query 9: Check for Expected Tables from Migration 0_init
```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
  'users', 'user_roles', 'actors', 'did_documents', 'credentials',
  'batches', 'assets', 'physical_bindings', 'technical_records',
  'evidence', 'evidence_versions', 'inspections', 'lifecycle_events',
  'expected_transitions', 'certifications', 'blockchain_transactions',
  'blockchain_verifications', 'audit_events', 'checkpoints',
  'outbox_events', 'wallet_bindings', 'wallet_challenges',
  'approvals', 'notifications'
)
ORDER BY table_name;
```

### Query 10: Check for Expected Tables from Migration 1_supply_chain
```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
  'suppliers', 'facilities', 'lots', 'shipments',
  'custody_transfers', 'supply_chain_events'
)
ORDER BY table_name;
```

## Expected Results Interpretation

### Scenario A: Database is Empty
- Query 8 returns: table_count = 0 or 1 (only _prisma_migrations)
- Query 4 returns: No tables or only _prisma_migrations
- **Fix**: Run `prisma migrate deploy` - it will create all tables

### Scenario B: Database Has Tables but No _prisma_migrations
- Query 2 returns: No rows (table doesn't exist)
- Query 4 returns: Multiple tables exist
- Query 9/10 return: Tables matching migrations 0_init and 1_supply_chain
- **Fix**: Baseline with `prisma migrate resolve --applied` for each migration

### Scenario C: Database Has Tables and _prisma_migrations but Out of Sync
- Query 2 returns: Table exists
- Query 3 returns: Missing some migrations or different state
- **Fix**: Baseline missing migrations or resolve failed ones

### Scenario D: Database Schema Doesn't Match Migrations
- Query 4 returns: Tables exist but don't match expected migration output
- Query 9/10 return: Missing or different tables
- **Fix**: Use `prisma db pull` to sync schema.prisma, then baseline

### Scenario E: AppRole Enum Mismatch
- Query 5 returns: 7 enum values (ADMIN, NFT_CREATOR, TECHNICIAN, AUDITOR, SYSTEM_ADMIN, PROCUREMENT_SUPPLY_CHAIN_OFFICER, QUALITY_INSPECTOR)
- Current schema.prisma expects: 4 values (SYSTEM_ADMIN, PROCUREMENT_SUPPLY_CHAIN_OFFICER, QUALITY_INSPECTOR, AUDITOR)
- **Fix**: Separate issue - address after P3005 is resolved

## Next Steps After Verification

Provide the results of these queries to determine:
1. Which scenario applies (A, B, C, D, or E)
2. The exact fix strategy to implement
3. Whether enum migration is also required

## Important Notes

- Do NOT run any DDL statements (CREATE, ALTER, DROP)
- Do NOT run any DML statements (INSERT, UPDATE, DELETE)
- These are READ-ONLY queries for investigation only
- Do not modify the database based on these results
