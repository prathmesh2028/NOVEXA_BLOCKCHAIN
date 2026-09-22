-- Role Model Migration: Change from ADMIN/NFT_CREATOR/TECHNICIAN/AUDITOR to SYSTEM_ADMIN/PROCUREMENT_SUPPLY_CHAIN_OFFICER/QUALITY_INSPECTOR/AUDITOR

-- Step 1: Add new enum values
ALTER TYPE "AppRole" ADD VALUE IF NOT EXISTS 'SYSTEM_ADMIN';
ALTER TYPE "AppRole" ADD VALUE IF NOT EXISTS 'PROCUREMENT_SUPPLY_CHAIN_OFFICER';
ALTER TYPE "AppRole" ADD VALUE IF NOT EXISTS 'QUALITY_INSPECTOR';

-- Step 2: Update existing user_roles to new values
UPDATE "user_roles" SET role = 'SYSTEM_ADMIN' WHERE role = 'ADMIN';
UPDATE "user_roles" SET role = 'PROCUREMENT_SUPPLY_CHAIN_OFFICER' WHERE role = 'NFT_CREATOR';
UPDATE "user_roles" SET role = 'QUALITY_INSPECTOR' WHERE role = 'TECHNICIAN';
-- AUDITOR remains the same

-- Step 3: Update expected_transitions that reference old roles
UPDATE "expected_transitions" SET "allowedRole" = 'QUALITY_INSPECTOR' WHERE "allowedRole" = 'TECHNICIAN';

-- Step 4: Update approval.approver_role if it references old roles
UPDATE "approvals" SET "approverRole" = 'SYSTEM_ADMIN' WHERE "approverRole" = 'ADMIN';
UPDATE "approvals" SET "approverRole" = 'PROCUREMENT_SUPPLY_CHAIN_OFFICER' WHERE "approverRole" = 'NFT_CREATOR';
UPDATE "approvals" SET "approverRole" = 'QUALITY_INSPECTOR' WHERE "approverRole" = 'TECHNICIAN';

-- Note: PostgreSQL doesn't allow dropping enum values directly. 
-- The old values (ADMIN, NFT_CREATOR, TECHNICIAN) will remain in the enum type 
-- but won't be used by the application after this migration.
