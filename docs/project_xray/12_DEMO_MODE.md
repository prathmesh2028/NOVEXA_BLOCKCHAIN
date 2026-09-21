# 12. Demo Mode & Simulation Mechanics

## 1. Where Demo Mode is Activated

Demo mode is controlled by the environment variable `APP_ENV=demo` (or `NODE_ENV=demo` / `BLOCKCHAIN_MODE=demo`).

It is referenced across **14 distinct source files** in `backend/src`:
1. `core/database/prisma.service.ts`: Swallows DB connection failure on boot and logs: `Running without database connection (Development/Demo mode)`.
2. `identity/auth/auth.service.ts`: If DB query fails or demo mode is on, falls back to in-memory `FALLBACK_USERS` without bcrypt check.
3. `identity/users/users.service.ts`: Returns `FALLBACK_USERS` array.
4. `identity/wallet/wallet.service.ts`: Bypasses challenge storage and binding persistence in the database.
5. `dashboard/dashboard.service.ts`: Returns hardcoded dashboard statistics from `FALLBACK_ASSETS`.
6. `search/search.service.ts`: Performs in-memory substring filtering on fallback arrays.
7. `notifications/notifications.service.ts`: Returns in-memory notification items from `FALLBACK_NOTIFICATIONS`.
8. `asset-management/assets/assets.service.ts`: Returns mock asset records from `FALLBACK_ASSETS`.
9. `asset-management/approvals/approvals.service.ts`: Returns mock approval items from `FALLBACK_APPROVALS_ITEMS`.
10. `asset-management/lifecycle/lifecycle.service.ts`: Skips background automated overdue inspection scan.
11. `asset-management/evidence/evidence.service.ts`: Returns mock evidence records from `FALLBACK_EVIDENCE`.
12. `asset-management/technical-records/technical-records.service.ts`: Returns mock technical records.
13. `asset-management/audit/audit.service.ts`: Returns mock audit events from `FALLBACK_AUDIT_EVENTS`.
14. `trust/blockchain/blockchain.adapter.ts`: When RPC is unreachable, returns `{ txHash: '0xDEMO-mocktx...', status: 'SIMULATED' }`.
15. `verification/verification.service.ts`: Synthesizes 6-point verification results from in-memory fallback arrays.

---

## 2. Complete Demo Mode Execution Flow

```
HTTP REQUEST (e.g. GET /api/v1/assets)
              │
              ▼
    Service queries PostgreSQL via Prisma
              │
         DB Offline?
        ┌─────┴─────┐
     YES│           │NO
        ▼           ▼
  Is APP_ENV=demo?  Executes real SQL query via Prisma
  ┌─────┴─────┐
  │YES        │NO
  ▼           ▼
Loads from    Throws PrismaClientInitializationError
fallback-data (500 Internal Server Error)
Returns 200 OK
```

---

## 3. Could Demo Mode Accidentally Make Production Look Successful?

**YES, ABSOLUTELY.** If `APP_ENV=demo` is accidentally deployed to staging or production:
1. **False Authentication**: Anyone could log in with demo emails without a real database.
2. **Fabricated Blockchain Confirmation**: The UI would show assets as "Certified" with a fake `0xDEMO-...` hash even if no blockchain node exists.
3. **Missing Data Persistence**: Any asset registered or approval granted would disappear the moment the Node process restarts.

**SAFETY RULE**: The environment validator (`core/config/env.validation.ts`) must enforce that `APP_ENV=production` strictly disallows demo mode fallbacks.