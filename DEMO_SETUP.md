# KAVACHTRUST DEMO DATA SETUP

**Purpose:** Deterministic, reproducible demo data for SIH demonstration

---

## Overview

The KavachTrust system includes a deterministic seed mechanism via Prisma that creates synthetic/demo data for demonstration purposes.

---

## Demo Data Characteristics

### Fixed Users
- **System Admin:** `a.mehta@bel-defence.in` / `password`
- **Procurement Officer:** `p.sharma@bel-defence.in` / `password`
- **Quality Inspector:** `r.kumar@bel-defence.in` / `password`
- **Auditor:** `d.nair@bel-defence.in` / `password`

### Fixed Canonical Roles
- SYSTEM_ADMIN
- PROCUREMENT_SUPPLY_CHAIN_OFFICER
- QUALITY_INSPECTOR
- AUDITOR

### Fixed Assets
- EF-2026-00421: Electronic Fuze (ACCEPTED_FOR_ASSEMBLY, CONFIRMED)
- EF-2026-00422: Electronic Fuze (ACCEPTED_FOR_ASSEMBLY, REVOKED)
- EF-2026-00423: Electronic Fuze (REJECTED_QUARANTINED, NOT_CERTIFIED)
- PT-2026-00105: Pressure Transducer (RECEIVED, NOT_CERTIFIED)
- IG-2026-00210: Ignition Module (SUPPLIER_DECLARED, NOT_CERTIFIED)

### Fixed Evidence
- Inspection reports
- Supplier declarations
- Receipt confirmations
- QA approvals

### Fixed Supply Chain Records
- Suppliers: BEL Synthetic Procurement Div., HAL Avionics Precision Components
- Facilities: BEL Bangalore Integrated Defense Complex, BEL Hyderabad Missile Electronics Facility
- Lots: LOT-2026-EF-001
- Shipments: SHP-2026-0091

### Fixed Certification Scenario
- CERT-2026-00089: CONFIRMED certification for EF-2026-00421
- Historical blockchain transaction evidence

---

## How to Reset Demo Data

### Warning: This Will Reset All Data

**DO NOT run this on production database.**

### Reset Procedure

1. **Stop the backend application** to prevent conflicts
2. **Backup current data** (if you need to preserve anything):
   ```bash
   cd backend
   npx prisma db pull  # To capture current schema
   ```

3. **Reset database with seed data**:
   ```bash
   cd backend
   npx prisma migrate reset
   ```

   This will:
   - Drop all tables
   - Re-run all migrations
   - Run the seed script (`prisma/seed.ts`)

4. **Restart the backend**:
   ```bash
   npm run start:dev
   ```

---

## Demo Mode Isolation

### Current State
The seed script uses `upsert` operations, which means:
- If data exists, it is preserved
- If data does not exist, it is created
- This allows incremental seeding without full reset

### Production vs Demo
**Important:** The current system does not have separate production/demo databases.

To safely isolate demo data:
1. Use a separate Supabase project for demo
2. Configure separate `DATABASE_URL` for demo environment
3. Never run `prisma migrate reset` on production database

---

## Demo Data Verification

### Verify Users
```bash
curl http://localhost:8000/api/v1/users \
  -H "Authorization: Bearer <admin-token>"
```

### Verify Assets
```bash
curl http://localhost:8000/api/v1/assets \
  -H "Authorization: Bearer <admin-token>"
```

### Verify Certifications
```bash
curl http://localhost:8000/api/v1/certifications \
  -H "Authorization: Bearer <admin-token>"
```

---

## Golden Demo Flow

### Login
1. Navigate to `http://localhost:8443`
2. Login as `a.mehta@bel-defence.in` / `password`
3. Verify dashboard loads

### View Asset
1. Navigate to Assets
2. Click on EF-2026-00421
3. Verify asset details show:
   - ACCEPTED_FOR_ASSEMBLY status
   - CERT-2026-00089 certification
   - Evidence records

### Verify Certification
1. Click on certification CERT-2026-00089
2. Verify blockchain transaction hash is displayed
3. Verify transaction exists on Besu

### Verification Center
1. Navigate to Verification Center
2. Enter asset ID: EF-2026-00421
3. Verify all checks pass
4. Verify blockchain verification shows on-chain transaction

---

## Customizing Demo Data

### To Add New Demo Assets
Edit `backend/prisma/seed.ts` and add new asset entries in the `assetData` array.

### To Add New Demo Users
Edit `backend/prisma/seed.ts` and add new user entries with upsert.

### To Add New Demo Certifications
Edit `backend/prisma/seed.ts` and add new certification entries.

After changes, re-run:
```bash
cd backend
npx prisma db seed
```

---

## Safety Notes

### Never Commit Real Secrets
- Seed data uses synthetic passwords (`password`)
- Never use real production credentials in seed
- Never commit real private keys

### Never Reset Production
- `prisma migrate reset` is destructive
- Only use on demo/staging databases
- Always backup before reset

### Audit Trail
- Seed data creates audit events with hash chains
- Audit trail is preserved across restarts
- Resetting database clears audit history

---

## Troubleshooting

### Seed Fails
1. Check database connection in `.env`
2. Check Supabase is accessible
3. Check Prisma client is generated: `npx prisma generate`

### Data Not Appearing
1. Check seed script ran successfully
2. Check for upsert conflicts (existing data with same IDs)
3. Reset database if needed: `npx prisma migrate reset`

### Certification Not Minting
1. Check Besu is running
2. Check contract address in `.env`
3. Check worker is processing events
4. Check blockchain transaction records

---

**Demo Setup Version:** 1.0
**Last Updated:** 2026-09-29
