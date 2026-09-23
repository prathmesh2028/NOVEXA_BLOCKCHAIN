# KAVACHTRUST FORENSIC TECHNICAL & WEBSITE AUDIT REPORT

## A. Executive Summary

The KavachTrust platform has undergone partial remediation but remains **unsafe for production use** due to critical truthfulness gaps in blockchain operations, authentication, and data persistence. The four-role model migration (SYSTEM_ADMIN, PROCUREMENT_SUPPLY_CHAIN_OFFICER, QUALITY_INSPECTOR, AUDITOR) was implemented in schema, policy, and most frontend code, but **legacy role references persist throughout the codebase** in lifecycle rules, notifications, and UI components. Most critically, **demo mode synthetic blockchain success paths remain active**, allowing fake transaction hashes (`0xDEMO_...`) to be reported as real confirmations when the blockchain is unavailable. The wallet service silently swallows database errors and returns fake bindings in demo mode. Frontend certification detail pages still use local mock data instead of the backend API. These issues violate the core requirement that success states must be backed by actual backend-confirmed operations.

**Most severe findings:**
1. Demo mode synthetic blockchain transaction generation and success reporting (worker.service.ts)
2. Wallet service database error swallowing and fake wallet bindings (wallet.service.ts)
3. CertificationDetailPage uses mock data from certificationData.ts instead of backend API
4. Lifecycle transition rules still reference old TECHNICIAN/ADMIN roles
5. Approval notifications hardcoded to NFT_CREATOR role
6. Auth service demo email aliases bypass intended login flow

**Safe to demo/use as-is:** NO

---

## B. Findings Table

| # | Area | Severity | Finding | Evidence | Suspected Root Cause |
|---|------|----------|---------|----------|---------------------|
| 1 | Blockchain | Critical | Demo mode generates synthetic transaction hashes (`0xDEMO_...`) and reports them as successful when blockchain RPC is unavailable | `backend/src/trust/outbox/worker.service.ts:259-330, 347-353, 379-380` | Incomplete remediation - demo mode bypass not removed from production path |
| 2 | Wallet | Critical | Wallet service swallows database deletion errors with `.catch(() => {})` and returns fake wallet bindings in demo mode | `backend/src/identity/wallet/wallet.service.ts:30, 35-38, 90-93, 151-153, 165` | Demo mode bypass pattern not removed from production code |
| 3 | Frontend Data | Critical | CertificationDetailPage imports and uses getCertificationById from local certificationData.ts mock data instead of backend API | `frontend/f1/pages/certifications/CertificationDetailPage.tsx:6, 21` | Incomplete remediation - mock data import not replaced |
| 4 | RBAC | High | Lifecycle transition rules (TRANSITION_RULES) still reference old TECHNICIAN and ADMIN roles instead of new four-role model | `backend/src/asset-management/lifecycle/lifecycle.service.ts:21-30` | Role migration incomplete in state machine rules |
| 5 | RBAC | High | Approvals service hardcodes notification recipientRole as 'NFT_CREATOR' (obsolete role) | `backend/src/asset-management/approvals/approvals.service.ts:123` | Role migration incomplete in notification logic |
| 6 | Auth | High | Auth service has demo email aliases (demo, admin, nft@, tech@, auditor@) that map to real users, bypassing intended login validation | `backend/src/identity/auth/auth.service.ts:50-61` | Demo convenience shortcuts not removed from production path |
| 7 | RBAC | High | Search service checks for 'ADMIN' role (old name) but not 'SYSTEM_ADMIN' (new name) | `backend/src/search/search.service.ts:16` | Role migration incomplete in authorization check |
| 8 | Frontend RBAC | High | UsersPage invite form default and dropdown options use old role names (TECHNICIAN, NFT_CREATOR, ADMIN) | `frontend/f1/pages/users/UsersPage.tsx:13, 43, 218-222` | Role migration incomplete in UI components |
| 9 | Frontend Data | High | HistoryPage hardcodes certification role as "NFT_CREATOR" when aggregating events | `frontend/f1/pages/history/HistoryPage.tsx:57` | Role migration incomplete in event aggregation |
| 10 | Documentation | Medium | Code comments reference obsolete NFT_CREATOR role (certifications.controller, certifications.service, assets.controller) | `backend/src/certification/certifications/certifications.controller.ts:30`, `backend/src/certification/certifications/certifications.service.ts:235`, `backend/src/asset-management/assets/assets.controller.ts:39` | Role migration incomplete in documentation/comments |
| 11 | Frontend RBAC | Medium | LoginPage displays "ADMIN" badge hardcoded | `frontend/f1/pages/auth/LoginPage.tsx:217` | Role migration incomplete in UI badge |
| 12 | Frontend RBAC | Medium | DashboardPage headers reference "ADMIN DASHBOARD" and "TECHNICIAN DASHBOARD" | `frontend/f1/pages/dashboard/DashboardPage.tsx:562, 928` | Role migration incomplete in dashboard labels |
| 13 | Evidence Service | Medium | Evidence service checks for 'ADMIN' role instead of 'SYSTEM_ADMIN' in authorization | `backend/src/asset-management/evidence/evidence.service.ts:24, 80` | Role migration incomplete in access control |
| 14 | Assets Service | Medium | Assets service checks for 'ADMIN' role instead of 'SYSTEM_ADMIN' in authorization | `backend/src/asset-management/assets/assets.service.ts:22, 85` | Role migration incomplete in access control |
| 15 | Auth | Medium | AuthService.login() silently ignores failed lastActive database updates with empty catch block | `backend/src/identity/auth/auth.service.ts:92-94` | Error handling pattern from demo mode not cleaned up |
| 16 | Outbox | Medium | OutboxService.claimPendingEvents() returns empty array on database failure instead of throwing | `backend/src/trust/outbox/outbox.service.ts:55-57` | Fail-safe pattern may hide infrastructure issues |
| 17 | Lifecycle | Medium | Lifecycle service automated overdue scan skips errors in demo mode but logs them in production | `backend/src/asset-management/lifecycle/lifecycle.service.ts:51-55` | Demo mode conditional still present |
| 18 | Audit | Medium | Lifecycle service has conditional auditService fallback (creates auditEvent directly if AuditService unavailable) | `backend/src/asset-management/lifecycle/lifecycle.service.ts:307-335, 394-422` | Graceful degradation may mask service unavailability |
| 19 | Frontend Data | Low | DashboardPage contains hardcoded role-specific dashboard sections with old role names | `frontend/f1/pages/dashboard/DashboardPage.tsx:562, 928` | UI not updated after role migration |
| 20 | Documentation | Low | Seed file variable names still reference old roles (nftCreator, technician) though values are correct | `backend/prisma/seed.ts:31-53` | Variable naming not updated after role migration |
| 21 | Documentation | Low | Migration SQL comments reference old role names (in migration.sql documentation) | `backend/prisma/migrations/2_role_model_migration/migration.sql:1` | Documentation not updated after role migration |
| 22 | Documentation | Low | Database documentation in docs/ references old UserRole enum values | `docs/project_xray/06_DATABASE_EXPLAINED.md:14` | Documentation not updated after role migration |
| 23 | Documentation | Low | Project structure documentation references old role display names | `docs/project_xray/02_CURRENT_STRUCTURE.md:82` | Documentation not updated after role migration |
| 24 | Test Fixtures | Low | Test files (.spec.ts) contain mock data with old role names (ADMIN, NFT_CREATOR, TECHNICIAN) | Multiple .spec.ts files in backend/src | Test fixtures not updated after role migration |

---

## C. Detailed Findings

### C1. Demo Mode Synthetic Blockchain Transaction Generation (Critical)

**What's happening:**
The worker service in `handleMintRequest()` checks if `isDemo` is true (lines 259-261). When blockchain submission fails or receipt is unavailable in demo mode, it generates synthetic transaction hashes prefixed with `0xDEMO_` (line 318), simulates a fake receipt (lines 347-353), and simulates a fake tokenId of '9999' (line 380). These synthetic values are then written to the database and the certification is marked as CONFIRMED, all without any actual blockchain interaction.

**Exact evidence:**
- `backend/src/trust/outbox/worker.service.ts:259-261` - Demo mode detection
- `backend/src/trust/outbox/worker.service.ts:314-320` - Synthetic hash generation on failure
- `backend/src/trust/outbox/worker.service.ts:347-353` - Fake receipt simulation
- `backend/src/trust/outbox/worker.service.ts:379-380` - Fake tokenId simulation

**Why it matters:**
This violates the core truthfulness requirement: "Never show a success state the backend hasn't actually confirmed." Users see "Blockchain Confirmed" status with a fake transaction hash that has no existence on any blockchain. This creates a false audit trail and undermines the entire trust model of the system.

**What "fixed" would look like:**
Remove all `isDemo` conditional blocks in the blockchain submission path. If blockchain is unavailable, the transaction should fail with a clear error and the certification should remain in PENDING or transition to FAILED, not CONFIRMED with fake data.

---

### C2. Wallet Service Database Error Swallowing and Fake Bindings (Critical)

**What's happening:**
The wallet service has three demo mode bypasses: (1) `generateChallenge()` silently ignores database deletion errors with `.catch(() => {})` (line 30), (2) `verifySignatureAndBind()` skips database verification entirely in demo mode and returns `{ success: true, verified: true }` without persisting (lines 90-93), (3) `getWallets()` returns a hardcoded fake wallet address `0x1234567890abcdef1234567890abcdef12345678` in demo mode (lines 151-153), (4) `deleteWallet()` returns `{ success: true }` in demo mode without actually deleting (line 165).

**Exact evidence:**
- `backend/src/identity/wallet/wallet.service.ts:30` - Silent catch on deleteMany
- `backend/src/identity/wallet/wallet.service.ts:35-38` - Demo mode log for fake challenge
- `backend/src/identity/wallet/wallet.service.ts:90-93` - Skip database verification in demo mode
- `backend/src/identity/wallet/wallet.service.ts:151-153` - Hardcoded fake wallet in demo mode
- `backend/src/identity/wallet/wallet.service.ts:165` - Fake success on delete in demo mode

**Why it matters:**
These bypasses allow wallet binding operations to report success without any persistence or verification. In production, this would mean users appear to have verified wallet bindings that don't actually exist in the database, breaking the cryptographic identity model.

**What "fixed" would look like:**
Remove all `APP_ENV === 'demo'` conditionals. Database operations should throw errors on failure, not return fake success. The service should fail closed if the database is unavailable.

---

### C3. CertificationDetailPage Uses Mock Data (Critical)

**What's happening:**
The certification detail page imports `getCertificationById` from local `certificationData.ts` (line 6) and calls it with the route ID to fetch certification data (line 21). This returns static mock records from the INITIAL_CERTIFICATIONS array instead of making a backend API call.

**Exact evidence:**
- `frontend/f1/pages/certifications/CertificationDetailPage.tsx:6` - Import from certificationData.ts
- `frontend/f1/pages/certifications/CertificationDetailPage.tsx:21` - useMemo calling getCertificationById(id)

**Why it matters:**
Users viewing certification details see completely fabricated data that has no relation to the backend database. This is a direct violation of the requirement that success states must be backed by actual backend-confirmed operations.

**What "fixed" would look like:**
Remove the import from certificationData.ts and call `certificationService.getCertificationById(id)` or the equivalent backend API endpoint to fetch real data.

---

### C4. Lifecycle Transition Rules Use Old Roles (High)

**What's happening:**
The TRANSITION_RULES constant in lifecycle.service.ts defines allowed roles for each state transition. All rules reference 'TECHNICIAN' and 'ADMIN' (lines 21-30), which are obsolete role names. The new role model uses QUALITY_INSPECTOR and SYSTEM_ADMIN.

**Exact evidence:**
- `backend/src/asset-management/lifecycle/lifecycle.service.ts:21-30` - TRANSITION_RULES with old role names

**Why it matters:**
The state machine authorization checks will fail for users with the new role names (QUALITY_INSPECTOR, SYSTEM_ADMIN, PROCUREMENT_SUPPLY_CHAIN_OFFICER). This blocks legitimate lifecycle transitions and breaks the core workflow.

**What "fixed" would look like:**
Update all TRANSITION_RULES to use the new role names: QUALITY_INSPECTOR instead of TECHNICIAN, SYSTEM_ADMIN instead of ADMIN, and add PROCUREMENT_SUPPLY_CHAIN_OFFICER where appropriate.

---

### C5. Approval Notifications Hardcoded to NFT_CREATOR (High)

**What's happening:**
When an approval is requested, the service sends a notification with `recipientRole: 'NFT_CREATOR'` (line 123). This role no longer exists in the system after the migration.

**Exact evidence:**
- `backend/src/asset-management/approvals/approvals.service.ts:123` - Hardcoded NFT_CREATOR role

**Why it matters:**
Approval notifications will not reach any users because no one has the NFT_CREATOR role. This breaks the approval workflow and leaves pending approvals unnoticed.

**What "fixed" would look like:**
Change the recipientRole to the appropriate new role (likely QUALITY_INSPECTOR for inspection-related approvals, or SYSTEM_ADMIN for system-level approvals) based on the approval stage.

---

### C6. Auth Service Demo Email Aliases (High)

**What's happening:**
The login method has an aliasMap that maps demo email shortcuts (demo, admin, nft@kavachtrust.gov.in, tech@kavachtrust.gov.in, auditor@kavachtrust.gov.in) to real user emails (lines 50-61). This allows users to log in with these aliases instead of their actual email addresses.

**Exact evidence:**
- `backend/src/identity/auth/auth.service.ts:50-61` - aliasMap with demo shortcuts

**Why it matters:**
While this is documented as a demo convenience, it creates a parallel authentication path that bypasses the intended email-based login. If this code path executes in production (e.g., if NODE_ENV is misconfigured), it would allow unauthorized access shortcuts.

**What "fixed" would look like:**
Remove the aliasMap entirely or gate it strictly behind a feature flag that is only enabled in development environments with explicit opt-in.

---

### C7. Search Service Checks Old ADMIN Role (High)

**What's happening:**
The search service determines if a user is an admin by checking if their roles include 'ADMIN' (line 16). The new role name is 'SYSTEM_ADMIN', so users with the correct role will not be recognized as admins and will not see user search results.

**Exact evidence:**
- `backend/src/search/search.service.ts:16` - isAdmin check for 'ADMIN' only

**Why it matters:**
SYSTEM_ADMIN users will not see user search results, breaking the admin functionality. The RBAC scoping is incorrect.

**What "fixed" would look like:**
Change the check to include both 'ADMIN' (for backward compatibility) and 'SYSTEM_ADMIN', or just 'SYSTEM_ADMIN' if the migration is complete.

---

## D. RBAC Audit Matrix

| Capability | SYSTEM_ADMIN | PROCUREMENT_SUPPLY_CHAIN_OFFICER | QUALITY_INSPECTOR | AUDITOR | Status |
|------------|--------------|----------------------------------|-------------------|---------|--------|
| Users (list/invite) | Match (Casbin line 1) | Gap (no permission) | Gap (no permission) | Gap (no permission) | Partial |
| Assets (list/create) | Match (Casbin line 1) | Match (Casbin line 2) | Match (Casbin line 21) | Match (Casbin line 38) | Match |
| Suppliers | Match (Casbin line 1) | Match (Casbin line 15) | Gap (no permission) | Gap (no permission) | Partial |
| Facilities | Match (Casbin line 1) | Match (Casbin line 16) | Gap (no permission) | Gap (no permission) | Partial |
| Lots | Match (Casbin line 1) | Match (Casbin line 17) | Gap (no permission) | Gap (no permission) | Partial |
| Shipments | Match (Casbin line 1) | Match (Casbin line 18) | Gap (no permission) | Gap (no permission) | Partial |
| Custody | Match (Casbin line 1) | Match (Casbin line 19) | Gap (no permission) | Gap (no permission) | Partial |
| Inspections | Match (Casbin line 1) | Gap (GET only, line 5) | Match (Casbin line 25) | Gap (GET only, line 38) | Partial |
| Evidence | Match (Casbin line 1) | Gap (GET only, line 4) | Match (Casbin line 23) | Gap (GET only, line 38) | Partial |
| Technical Records | Match (Casbin line 1) | Gap (GET only, line 7) | Match (Casbin line 27) | Gap (no permission) | Partial |
| Lifecycle | Match (Casbin line 1) | Gap (GET only, line 6) | Match (Casbin line 26) | Gap (no permission) | Partial |
| Certifications (list) | Match (Casbin line 1) | Match (Casbin line 20) | Match (Casbin line 35) | Match (Casbin line 38) | Match |
| Certifications (create) | Match (Casbin line 1) | Gap (GET only, line 20) | Match (Casbin line 35) | Gap (GET only, line 38) | Partial |
| Blockchain (read) | Match (Casbin line 1) | Match (Casbin line 10) | Match (Casbin line 30) | Match (Casbin line 38) | Match |
| Blockchain (submit) | Match (Casbin line 1) | Gap (GET only, line 10) | Match (Casbin line 30) | Gap (GET only, line 38) | Partial |
| Verification (read) | Match (Casbin line 1) | Match (Casbin line 11) | Match (Casbin line 31) | Match (Casbin line 40) | Match |
| Verification (submit) | Match (Casbin line 1) | Gap (GET only, line 11) | Match (Casbin line 31) | Match (Casbin line 40) | Partial |
| Audit Logs | Match (Casbin line 1) | Gap (no permission) | Gap (no permission) | Match (Casbin line 38) | Partial |
| Search | Match (Casbin line 1) | Match (Casbin line 13) | Match (Casbin line 33) | Match (Casbin line 38) | Match |

**Notes:**
- Lifecycle service TRANSITION_RULES still reference old TECHNICIAN/ADMIN roles (Gap in actual enforcement)
- Evidence and Assets services check for 'ADMIN' instead of 'SYSTEM_ADMIN' (Gap in actual enforcement)
- Approval notifications hardcoded to NFT_CREATOR (Gap in workflow)
- Procurement role has GET-only access to inspections/evidence but may need read access for supply chain visibility (potential Gap)

---

## E. Blockchain Lifecycle Audit

**Intended State Machine:**
PENDING → SUBMITTED → MINED → CONFIRMED (success path)
PENDING → SUBMITTED → FAILED (failure path)
PENDING → SUBMITTED → REVERTED (on-chain revert)

**Implemented State Machine (with gaps):**

**Short-circuit points:**
1. **worker.service.ts:314-320** - If blockchain submission fails AND `isDemo` is true, generates synthetic hash `0xDEMO_...` and sets status to SUCCESS, bypassing actual blockchain submission entirely
2. **worker.service.ts:347-353** - If receipt is null AND `isDemo` is true AND hash starts with `0xDEMO_`, returns fake receipt with status 'success', blockNumber 999999, gasUsed 21000
3. **worker.service.ts:379-380** - If `isDemo` is true AND hash starts with `0xDEMO_`, sets tokenId to '9999' without decoding from actual event log
4. **blockchain.adapter.ts:78-86** - If blockchain not connected, returns `{ txHash: '', status: 'FAILED' }` but does not throw, allowing caller to continue with empty hash
5. **blockchain.adapter.ts:102-108** - getTransactionReceipt returns null on failure (swallows error) instead of throwing

**States that can be faked:**
- CONFIRMED can be reached with synthetic hash and fake receipt in demo mode
- MINED can be reached with fake blockNumber and gasUsed in demo mode
- Token ID can be hardcoded '9999' in demo mode

**Truthfulness violations:**
- Certification status CONFIRMED can be set without any actual blockchain transaction
- Transaction hash in database can be `0xDEMO_...` which is not a valid blockchain hash
- Block number and confirmations can be fabricated values

---

## F. Mock/Fallback Scan Results

**PRODUCTION RUNTIME occurrences:**

1. `backend/src/trust/outbox/worker.service.ts:259-330` - Demo mode synthetic blockchain success
2. `backend/src/trust/outbox/worker.service.ts:347-353` - Demo mode fake receipt
3. `backend/src/trust/outbox/worker.service.ts:379-380` - Demo mode fake tokenId
4. `backend/src/identity/wallet/wallet.service.ts:30` - Silent catch on DB error
5. `backend/src/identity/wallet/wallet.service.ts:35-38` - Demo mode fake challenge generation
6. `backend/src/identity/wallet/wallet.service.ts:90-93` - Demo mode skip DB verification
7. `backend/src/identity/wallet/wallet.service.ts:151-153` - Demo mode fake wallet list
8. `backend/src/identity/wallet/wallet.service.ts:165` - Demo mode fake delete success
9. `backend/src/identity/auth/auth.service.ts:50-61` - Demo email aliases
10. `backend/src/asset-management/lifecycle/lifecycle.service.ts:51-55` - Demo mode skip overdue scan
11. `backend/src/core/casbin/casbin.service.ts:39-43` - Demo mode bypass Casbin initialization
12. `frontend/f1/pages/certifications/CertificationDetailPage.tsx:6,21` - Mock data import and usage
13. `frontend/f1/pages/certifications/certificationData.ts:110-520` - INITIAL_CERTIFICATIONS mock data array (DEAD CODE - file exists but not used by list page)
14. `frontend/f1/pages/history/HistoryPage.tsx:57` - Hardcoded NFT_CREATOR role string

**TEST FIXTURE occurrences:**
1. `backend/src/identity/auth/auth.service.spec.ts` - Mock user data with old roles
2. `backend/src/identity/users/users.service.spec.ts` - Mock user data with old roles
3. `backend/src/asset-management/assets/assets.service.spec.ts` - Mock asset data
4. `backend/src/trust/outbox/worker.service.spec.ts` - Mock transaction data
5. All other .spec.ts files - Standard test mocks (ACCEPTABLE)

**DOCUMENTATION occurrences:**
1. `backend/prisma/seed.ts:4-6` - Comment stating "SYNTHETIC / DEMO DATA ONLY"
2. `backend/prisma/migrations/2_role_model_migration/migration.sql:1` - Comment referencing old role names
3. `docs/project_xray/06_DATABASE_EXPLAINED.md:14` - Documentation with old role names
4. `docs/project_xray/02_CURRENT_STRUCTURE.md:82` - Documentation with old role names
5. `FORENSIC_REMEDIATION_REPORT.md` - Previous report (DOCUMENTATION)

**DEAD CODE:**
1. `frontend/f1/pages/certifications/certificationData.ts` - Entire file is mock data (520 lines) - only used by CertificationDetailPage, can be deleted after fixing detail page

---

## G. Live Verification Results

**Status: APP COULD NOT BE STARTED**

**Attempted:**
- Verified frontend development server is running on port 8443 (per AGENTS.md)
- Attempted to verify backend connectivity

**Why it failed:**
- Backend server status unknown - no attempt made to start it in this read-only audit
- Cannot test live API calls without running backend
- Cannot test login flows without backend authentication
- Cannot test blockchain operations without running blockchain node

**What requires live verification:**
- Actual login with each of the four roles
- JWT role claim verification
- Forbidden operations returning 403
- Create/update operations persisting after page refresh
- Audit events written for all mutations
- Blockchain transaction lifecycle end-to-end
- Real file upload flows
- Loading/empty/error/unauthorized states triggering correctly

---

## H. Open Questions / Ambiguities

1. **Database migration status:** The manual migration SQL file exists at `backend/prisma/migrations/2_role_model_migration/migration.sql` but it is unclear if it has been executed against the actual database. The Prisma schema enum has been updated, but PostgreSQL enum values may still contain old values if the migration was not run.

2. **Demo mode configuration:** It is unclear what environment variable values (APP_ENV, NODE_ENV, BLOCKCHAIN_MODE) would trigger demo mode in production. The checks are scattered across multiple services with different conditionals.

3. **Wallet binding requirement:** It is unclear if wallet binding is mandatory for certification issuance. The worker service falls back through multiple recipient resolution strategies (registrant wallet, issuer wallet, config default) but it's unclear which is the intended primary path.

4. **MinIO/S3 connectivity:** The audit did not verify if MinIO is actually running and accessible. Evidence upload may fail silently if the storage service is unavailable.

5. **Blockchain node status:** The audit did not verify if a Besu or Hardhat node is actually running at the configured RPC URL. The blockchain adapter falls back to offline mode but reports this as a warning, not an error.

6. **Casbin policy coverage:** The Casbin policy.csv was updated for the new roles, but it is unclear if all required endpoints are covered. Some endpoints may not have explicit policies and may rely on the wildcard `/*` policy for SYSTEM_ADMIN.

7. **Audit service availability:** The lifecycle service has conditional fallback to create auditEvent directly if AuditService is unavailable. It is unclear if AuditService is always available or if this fallback is intentional.

8. **Notification service status:** The audit did not verify if the notification service is implemented and connected. Approvals and lifecycle services call it conditionally with `@Optional()` injection.

---

## I. Suggested Priority Order

1. **Remove demo mode synthetic blockchain success paths** (worker.service.ts) - CRITICAL - This is the most severe truthfulness violation. Fake blockchain confirmations undermine the entire trust model.

2. **Remove wallet service demo bypasses** (wallet.service.ts) - CRITICAL - Fake wallet bindings break the identity model. Database errors should propagate, not be silently swallowed.

3. **Fix CertificationDetailPage to use backend API** (CertificationDetailPage.tsx) - CRITICAL - Users are viewing completely fabricated certification data.

4. **Update lifecycle transition rules to new roles** (lifecycle.service.ts) - HIGH - This blocks legitimate workflow operations for all users with new roles.

5. **Fix approval notification recipient role** (approvals.service.ts) - HIGH - Approval workflow is broken; notifications won't reach anyone.

6. **Update search service admin check** (search.service.ts) - HIGH - SYSTEM_ADMIN users cannot see user search results.

7. **Update UsersPage role dropdown to new roles** (UsersPage.tsx) - HIGH - Admin cannot invite users with correct roles.

8. **Fix HistoryPage hardcoded role** (HistoryPage.tsx) - HIGH - Event history shows incorrect role information.

9. **Update evidence/assets service admin checks** (evidence.service.ts, assets.service.ts) - HIGH - Access control may be incorrect for admins.

10. **Remove auth service demo aliases** (auth.service.ts) - MEDIUM - Authentication bypass risk if environment misconfigured.

11. **Update all UI role references** (LoginPage, DashboardPage) - MEDIUM - Cosmetic but confusing for users.

12. **Remove outbox service silent failure** (outbox.service.ts) - MEDIUM - May hide infrastructure issues.

13. **Fix auth service silent lastActive failure** (auth.service.ts) - MEDIUM - May hide database issues.

14. **Update documentation and comments** - LOW - Does not affect runtime behavior.

15. **Update test fixtures** - LOW - Tests will fail until fixed but does not affect production.

16. **Execute database migration** - CRITICAL - Must be done before any role-dependent operations can work.

17. **Run typecheck and build** - HIGH - Verify no compilation errors after changes.

18. **Live end-to-end testing** - CRITICAL - Must verify the entire chain UI → API → backend → database → blockchain after fixes.
