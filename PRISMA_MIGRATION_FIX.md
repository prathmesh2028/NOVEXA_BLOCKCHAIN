# Prisma Migration Fix for Render Deployment

## Root Cause Analysis

**Error**: Prisma P3005 - "The database schema is not empty."

**Schema Mismatch Identified**:
- **Migration 0_init** created `AppRole` enum with: `ADMIN, NFT_CREATOR, TECHNICIAN, AUDITOR`
- **Migration 2_role_model_migration** added: `SYSTEM_ADMIN, PROCUREMENT_SUPPLY_CHAIN_OFFICER, QUALITY_INSPECTOR`
- **Current schema.prisma** defines: `SYSTEM_ADMIN, PROCUREMENT_SUPPLY_CHAIN_OFFICER, QUALITY_INSPECTOR, AUDITOR`
- **Missing**: The old values `ADMIN, NFT_CREATOR, TECHNICIAN` were removed from schema.prisma but no migration was created to drop them from the database

**Database State**:
- Neon PostgreSQL database likely has tables from a previous deployment
- The `_prisma_migrations` table is either missing or out of sync
- This causes `prisma migrate deploy` to fail

## Solution Strategy

Since we cannot access the remote Neon database to verify its state, we have two approaches:

### Option A: If Database Has All Migration Changes Applied (Safe Baseline)

If the database already has all tables and enum values from migrations 0_init, 1_supply_chain, and 2_role_model_migration, we can baseline them.

**Steps**:
1. Connect to Neon database using psql or Neon's SQL Editor
2. Check if `_prisma_migrations` table exists
3. If it doesn't exist or is empty, create it and mark migrations as applied

**Commands to run in Neon SQL Editor**:
```sql
-- Check if _prisma_migrations table exists
SELECT * FROM information_schema.tables WHERE table_name = '_prisma_migrations';

-- If it doesn't exist, create it
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

-- Mark existing migrations as applied (run these one by one)
INSERT INTO "_prisma_migrations" (migration_name, checksum, started_at, finished_at, applied_steps_count)
VALUES ('0_init', 'YOUR_CHECKSUM_HERE', NOW(), NOW(), 1);

INSERT INTO "_prisma_migrations" (migration_name, checksum, started_at, finished_at, applied_steps_count)
VALUES ('1_supply_chain', 'YOUR_CHECKSUM_HERE', NOW(), NOW(), 1);

INSERT INTO "_prisma_migrations" (migration_name, checksum, started_at, finished_at, applied_steps_count)
VALUES ('2_role_model_migration', 'YOUR_CHECKSUM_HERE', NOW(), NOW(), 1);
```

**Then apply the new migration**:
```bash
cd backend
pnpm prisma migrate deploy
```

### Option B: If Database Schema Mismatch (Reconciliation Required)

If the database schema doesn't match the expected migration state, we need to reconcile.

**Step 1: Check current database state in Neon SQL Editor**
```sql
-- Check current AppRole enum values
SELECT enumlabel FROM pg_enum WHERE enumtypid = 'AppRole'::regtype ORDER BY enumsortorder;

-- Check if all expected tables exist
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;
```

**Step 2: Based on the inspection, choose appropriate action**

**If database has old enum values (ADMIN, NFT_CREATOR, TECHNICIAN)**:
The new migration `3_align_enum_values` will handle this by:
1. Migrating existing data from old enum values to new values for backward compatibility
2. Creating new enum type with current values
3. Altering all columns using AppRole to use the new enum
4. Dropping old enum type
5. Renaming new enum to original name

This approach handles PostgreSQL's limitation on removing enum values directly.

**Step 3: Deploy with the new migration**
```bash
cd backend
pnpm prisma migrate deploy
```

### Option C: Fresh Start (Only if database can be reset)

**WARNING**: This will delete all data. Only use if data can be lost.

```bash
# Delete all tables in Neon SQL Editor
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;

# Then run full migration
cd backend
pnpm prisma migrate deploy
pnpm prisma seed
```

## Modified Render Configuration

**Note**: `render.yaml` has already been updated to use `preDeployCommand` instead of running migrations in `startCommand`.

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

## Recommended Action Plan

1. **Backup the Neon database** (use Neon's backup feature)
2. **Check database state** using Neon SQL Editor:
   - Check `_prisma_migrations` table
   - Check `AppRole` enum values
   - Check table list
3. **Choose appropriate option** (A, B, or C) based on database state
4. **Apply the fix**
5. **Test locally** with DATABASE_URL pointing to Neon
6. **Trigger Render deployment**

## Local Testing Commands

```bash
# Set DATABASE_URL to Neon (replace with actual URL)
export DATABASE_URL="postgresql://user:password@aws-0-ap-southeast-2.pooler.supabase.com:5432/dbname"

# Test migration
cd backend
pnpm prisma migrate deploy

# If successful, test application
pnpm start:prod
```

## Migration Files Summary

- `0_init/`: Creates initial schema with old AppRole enum (ADMIN, NFT_CREATOR, TECHNICIAN, AUDITOR)
- `1_supply_chain/`: Adds supply chain tables (suppliers, facilities, lots, shipments, custody_transfers)
- `2_role_model_migration/`: Adds new AppRole values (SYSTEM_ADMIN, PROCUREMENT_SUPPLY_CHAIN_OFFICER, QUALITY_INSPECTOR)
- `3_align_enum_values/`: **NEW** - Migrates data, drops old enum values, and aligns with current schema.prisma
  - Maps old role values to new values for backward compatibility
  - Creates new enum with only current values
  - Alters all columns to use new enum
  - Handles PostgreSQL enum limitation safely

## Verification Commands

After migration fix, verify:
```bash
# Check migration status
cd backend
pnpm prisma migrate status

# Generate Prisma client
pnpm prisma generate

# Test database connection
pnpm prisma db pull  # This should show current schema
```

## Important Notes

- **Never run `prisma migrate reset`** on production
- **Never run `prisma db push`** on production
- **Always backup before schema changes**
- **The new migration 3_align_enum_values handles enum alignment safely**
- **Seed data uses correct role names** (SYSTEM_ADMIN, PROCUREMENT_SUPPLY_CHAIN_OFFICER, QUALITY_INSPECTOR, AUDITOR)
