# Render Deployment Fix - Executive Summary

## Problem
Render deployment fails with Prisma P3005 error: "The database schema is not empty."

## Root Cause
Schema drift between migration history and current schema.prisma:
- Migration 0_init created AppRole enum with: `ADMIN, NFT_CREATOR, TECHNICIAN, AUDITOR`
- Current schema.prisma defines: `SYSTEM_ADMIN, PROCUREMENT_SUPPLY_CHAIN_OFFICER, QUALITY_INSPECTOR, AUDITOR`
- Old enum values were removed from schema but no migration exists to drop them from database
- Neon database has tables but _prisma_migrations table is out of sync

## Changes Made

### 1. Created New Migration
**File**: `backend/prisma/migrations/3_align_enum_values/migration.sql`

This migration safely:
- Migrates existing data from old enum values (ADMIN, NFT_CREATOR, TECHNICIAN) to new values (SYSTEM_ADMIN, PROCUREMENT_SUPPLY_CHAIN_OFFICER, QUALITY_INSPECTOR)
- Creates new enum type with current values
- Alters all columns using AppRole to use the new enum
- Drops old enum type
- Renames new enum to original name

This approach handles PostgreSQL's limitation on removing enum values directly.

### 2. Updated Render Configuration
**File**: `render.yaml`

Changed from:
```yaml
startCommand: pnpm prisma migrate deploy && pnpm start:prod
```

To:
```yaml
preDeployCommand: pnpm prisma migrate deploy
startCommand: pnpm start:prod
```

This separates migration from application startup, following Render best practices.

## Exact Commands to Run

### Step 1: Backup Neon Database
Use Neon's dashboard to create a backup before proceeding.

### Step 2: Check Database State (Neon SQL Editor)
```sql
-- Check _prisma_migrations table
SELECT * FROM information_schema.tables WHERE table_name = '_prisma_migrations';

-- Check current AppRole enum values
SELECT enumlabel FROM pg_enum WHERE enumtypid = 'AppRole'::regtype ORDER BY enumsortorder;

-- Check table list
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;
```

### Step 3A: If _prisma_migrations Table Missing or Empty

Run this in Neon SQL Editor:
```sql
CREATE TABLE "_prisma_migrations" (
    "id" SERIAL PRIMARY KEY,
    "checksum" TEXT NOT NULL,
    "finished_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "migration_name" TEXT NOT NULL,
    "logs" TEXT,
    "rolled_back_at" TIMESTAMP(3),
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "applied_steps_count" INTEGER NOT NULL DEFAULT 0
);

-- Mark migrations as applied (replace YOUR_CHECKSUM with actual values from migration files)
INSERT INTO "_prisma_migrations" (migration_name, checksum, started_at, finished_at, applied_steps_count)
VALUES ('0_init', 'YOUR_CHECKSUM', NOW(), NOW(), 1);

INSERT INTO "_prisma_migrations" (migration_name, checksum, started_at, finished_at, applied_steps_count)
VALUES ('1_supply_chain', 'YOUR_CHECKSUM', NOW(), NOW(), 1);

INSERT INTO "_prisma_migrations" (migration_name, checksum, started_at, finished_at, applied_steps_count)
VALUES ('2_role_model_migration', 'YOUR_CHECKSUM', NOW(), NOW(), 1);
```

### Step 3B: If Database Has Old Enum Values

The new migration 3_align_enum_values will handle this automatically. No manual SQL needed.

### Step 4: Deploy to Render
```bash
git add backend/prisma/migrations/3_align_enum_values/
git add render.yaml
git commit -m "Fix Prisma migration: align AppRole enum with current schema"
git push
```

Render will automatically:
1. Run `preDeployCommand: pnpm prisma migrate deploy`
2. Apply migration 3_align_enum_values
3. Start the application

### Step 5: Verify Deployment
Check Render logs to ensure:
- Migration succeeded
- Application started without errors
- Health check passed

## What Not To Do

❌ **Never run**: `pnpm prisma migrate reset` (deletes all data)
❌ **Never run**: `pnpm prisma db push` on production (bypasses migration history)
❌ **Never manually edit** _prisma_migrations table without understanding the consequences
❌ **Never delete** migration files

## Verification

After successful deployment, verify locally:
```bash
cd backend
export DATABASE_URL="your_neon_database_url"
pnpm prisma migrate status
```

Should show: "All migrations applied"

## Rollback Plan

If migration fails:
1. Restore from backup created in Step 1
2. Revert the commit
3. Investigate the specific error in Render logs
4. Apply alternative fix based on error

## Status

- ✅ New migration created: `3_align_enum_values`
- ✅ Render configuration updated to use `preDeployCommand`
- ✅ Documentation created: `PRISMA_MIGRATION_FIX.md`
- ⏳ Awaiting: Database state verification and deployment

## Files Modified

1. `backend/prisma/migrations/3_align_enum_values/migration.sql` (NEW)
2. `render.yaml` (MODIFIED)
3. `PRISMA_MIGRATION_FIX.md` (NEW)
4. `DEPLOYMENT_FIX_SUMMARY.md` (NEW - this file)
