-- Role Model Migration: Add new enum values without removing old ones
-- This migration adds SYSTEM_ADMIN, PROCUREMENT_SUPPLY_CHAIN_OFFICER, QUALITY_INSPECTOR to AppRole enum
-- Old values (ADMIN, NFT_CREATOR, TECHNICIAN) remain for backward compatibility

-- Add new enum values to AppRole
ALTER TYPE "AppRole" ADD VALUE IF NOT EXISTS 'SYSTEM_ADMIN';
ALTER TYPE "AppRole" ADD VALUE IF NOT EXISTS 'PROCUREMENT_SUPPLY_CHAIN_OFFICER';
ALTER TYPE "AppRole" ADD VALUE IF NOT EXISTS 'QUALITY_INSPECTOR';

-- Note: The application schema now uses the new enum values, but old values remain in the database
-- for backward compatibility. Future migrations can handle data migration if needed.
