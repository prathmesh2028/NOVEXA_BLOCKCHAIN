# TARGETED REMEDIATION CHANGELOG

## Fix 1: Kill demo-mode synthetic blockchain success (Critical)

**Files touched:**
- `backend/src/trust/outbox/worker.service.ts`

**Old behavior:**
- Worker service checked `isDemo` flag and generated synthetic transaction hashes prefixed with `0xDEMO_...` when blockchain submission failed
- Fake receipt with blockNumber 999999 and gasUsed 21000 was simulated in demo mode
- Fake tokenId '9999' was returned without decoding actual event log
- Demo recipient address '0x70997970C51812dc3A010C7d01b50e0d17dc79C8' was used when no recipient resolved in demo mode
- Audit payload included `isSimulated: isDemo` flag

**New behavior:**
- All `isDemo` conditional blocks removed from blockchain submission path
- If blockchain submission fails, transaction is marked FAILED with error message and exception is thrown
- If receipt is unavailable, transaction returns PENDING_RECEIPT status for retry
- If recipient address cannot be resolved, error is thrown immediately
- Audit payload no longer includes simulation flag
- Blockchain confirmations only occur with real on-chain transactions

**Verification:**
- Zero matches for `isDemo` or `0xDEMO` in worker.service.ts
- Blockchain submission now fails closed when RPC unavailable

---

## Fix 2: Fix wallet service swallowing DB errors (Critical)

**Files touched:**
- `backend/src/identity/wallet/wallet.service.ts`

**Old behavior:**
- `generateChallenge()` had `.catch(() => {})` on deleteMany, silently ignoring DB errors
- Demo mode check in `generateChallenge()` logged warning and skipped DB persistence
- `verifySignatureAndBind()` skipped database verification entirely in demo mode and returned `{ success: true, verified: true }` without persisting
- `getWallets()` returned hardcoded fake wallet address `0x1234567890abcdef1234567890abcdef12345678` in demo mode
- `deleteWallet()` returned `{ success: true }` in demo mode without actually deleting

**New behavior:**
- All `.catch(() => {})` blocks removed - database errors now propagate
- All `APP_ENV === 'demo'` conditionals removed
- `generateChallenge()` always persists challenge to database or throws on failure
- `verifySignatureAndBind()` always performs database verification and persistence in transaction
- `getWallets()` always queries database, returns empty array if no bindings
- `deleteWallet()` always attempts database deletion or throws NotFoundException

**Verification:**
- Zero matches for `demo`, `DEMO`, or `.catch` in wallet.service.ts
- All wallet operations now fail closed when database unavailable

---

## Fix 3: Fix CertificationDetailPage using mock data (Critical)

**Files touched:**
- `frontend/f1/pages/certifications/CertificationDetailPage.tsx`

**Old behavior:**
- Imported `getCertificationById`, `CertificationRecord`, `CertificationStatus`, `CertVerificationStatus` from local `certificationData.ts`
- Used `useMemo` to call `getCertificationById(id)` returning static mock data from INITIAL_CERTIFICATIONS array
- No loading, error, or empty states - only single "not found" state
- Complex UI with mock data structure (authority, asset, document, proof, timeline)

**New behavior:**
- Removed import from `certificationData.ts`
- Added `useEffect` to call `certificationService.getCertification(id)` from backend API
- Added distinct loading state with "Loading certification..." message
- Added distinct error state with error message and retry button
- Added distinct empty state with "CERTIFICATION RECORD NOT FOUND" message
- Simplified UI to display real backend data structure (cert_id, asset_id, batch_id, token_id, tx_hash, block_number, status, issued_by, issued_at, confirmed_at, confirmations, network)
- Data displayed matches backend CertificationResponse interface

**Verification:**
- Zero matches for `certificationData` in CertificationDetailPage.tsx
- Page now makes real API call to `/certifications/:id`
- Loading/error/empty states are distinct

---

## Fix 4: Role migration sweep (High)

**Files touched:**
- `backend/src/asset-management/lifecycle/lifecycle.service.ts`
- `backend/src/asset-management/approvals/approvals.service.ts`
- `backend/src/asset-management/approvals/approvals.controller.ts`
- `backend/src/identity/auth/auth.service.ts`
- `backend/src/search/search.service.ts`
- `backend/src/asset-management/evidence/evidence.service.ts`
- `backend/src/asset-management/evidence/evidence.controller.ts`
- `backend/src/asset-management/assets/assets.service.ts`
- `backend/src/asset-management/assets/assets.controller.ts`
- `backend/src/asset-management/lifecycle/lifecycle.controller.ts`
- `backend/src/asset-management/physical-bindings/physical-bindings.controller.ts`
- `backend/src/asset-management/inspections/inspections.controller.ts`
- `backend/src/certification/certifications/certifications.controller.ts`
- `backend/src/certification/certifications/certifications.service.ts`
- `backend/src/identity/auth/guards/casbin.guard.ts`
- `frontend/f1/pages/users/UsersPage.tsx`
- `frontend/f1/pages/history/HistoryPage.tsx`
- `frontend/f1/pages/dashboard/DashboardPage.tsx`

**Old behavior:**
- Lifecycle TRANSITION_RULES referenced old roles: TECHNICIAN, ADMIN, SYSTEM
- Approval notifications hardcoded to NFT_CREATOR role
- Auth service had demo email aliases mapping demo/admin/nft@/tech@/auditor@ to real users
- Search service checked for 'ADMIN' role only
- UsersPage invite form defaulted to "TECHNICIAN" and listed TECHNICIAN, NFT_CREATOR, ADMIN options
- HistoryPage hardcoded certification role as "NFT_CREATOR"
- Evidence and Assets services checked for 'ADMIN' role in authorization
- Controllers had @RequireRoles decorators with old role names
- Comments referenced old role names
- Dashboard had TechnicianDashboard component

**New behavior:**
- Lifecycle TRANSITION_RULES updated to: QUALITY_INSPECTOR, SYSTEM_ADMIN, PROCUREMENT_SUPPLY_CHAIN_OFFICER (where appropriate)
- resolveResponsibleRecipient fallback changed from TECHNICIAN to QUALITY_INSPECTOR
- IDOR/BOLA check changed from ADMIN to SYSTEM_ADMIN
- Automated lifecycle transitions use SYSTEM_ADMIN instead of ADMIN
- Approval notifications sent to QUALITY_INSPECTOR instead of NFT_CREATOR
- Approval requestedByRole default changed to QUALITY_INSPECTOR
- Approval approverRole default changed to QUALITY_INSPECTOR
- Auth service demo email aliases completely removed
- Search service now checks for 'SYSTEM_ADMIN' only
- UsersPage invite form defaults to "quality-inspector"
- UsersPage dropdown lists: system-admin, procurement-supply-chain-officer, quality-inspector, auditor
- HistoryPage certification role changed to "quality-inspector"
- Evidence service authorization checks for SYSTEM_ADMIN instead of ADMIN
- Assets service authorization checks for SYSTEM_ADMIN instead of ADMIN
- All controller @RequireRoles decorators updated to new role names
- Comments updated to reference new role names
- Casbin guard comment updated
- TechnicianDashboard renamed to QualityInspectorDashboard
- Dashboard component updated to use "quality-inspector" role

**Verification:**
- Zero production code occurrences of NFT_CREATOR or TECHNICIAN in backend/src (excluding test fixtures .spec.ts)
- Zero production code occurrences of NFT_CREATOR or TECHNICIAN in frontend/f1
- Zero bare ADMIN role checks in production code (excluding test fixtures and comments)
- 26 occurrences remain in test fixture files (.spec.ts) - these are acceptable as they are isolated test data

---

## INCIDENTAL FIXES

The following Medium/Low findings from the original report were incidentally fixed during this pass:

### Finding #10: Code comments reference obsolete NFT_CREATOR role (Medium)
**Status:** RESOLVED
- Updated comments in certifications.controller.ts, certifications.service.ts, assets.controller.ts

### Finding #13: Evidence service checks for 'ADMIN' role (Medium)
**Status:** RESOLVED
- Updated to check for 'SYSTEM_ADMIN'

### Finding #14: Assets service checks for 'ADMIN' role (Medium)
**Status:** RESOLVED
- Updated to check for 'SYSTEM_ADMIN'

### Finding #19: DashboardPage contains hardcoded role-specific dashboard sections with old role names (Low)
**Status:** RESOLVED
- Renamed TechnicianDashboard to QualityInspectorDashboard

---

## STILL OPEN FINDINGS

The following Medium/Low findings from the original report remain open (not touched in this pass):

### Finding #11: LoginPage displays "ADMIN" badge hardcoded (Medium)
**Status:** STILL OPEN

### Finding #12: DashboardPage headers reference "ADMIN DASHBOARD" (Medium)
**Status:** STILL OPEN (may need further investigation beyond TechnicianDashboard)

### Finding #15: AuthService.login() silently ignores failed lastActive database updates (Medium)
**Status:** STILL OPEN

### Finding #16: OutboxService.claimPendingEvents() returns empty array on database failure (Medium)
**Status:** STILL OPEN

### Finding #17: Lifecycle service automated overdue scan skips errors in demo mode (Medium)
**Status:** STILL OPEN

### Finding #18: Lifecycle service has conditional auditService fallback (Medium)
**Status:** STILL OPEN

### Finding #20: Seed file variable names still reference old roles (Low)
**Status:** STILL OPEN

### Finding #21: Migration SQL comments reference old role names (Low)
**Status:** STILL OPEN

### Finding #22: Database documentation in docs/ references old UserRole enum values (Low)
**Status:** STILL OPEN

### Finding #23: Project structure documentation references old role display names (Low)
**Status:** STILL OPEN

### Finding #24: Test files (.spec.ts) contain mock data with old role names (Low)
**Status:** STILL OPEN (acceptable as test fixtures, documented above)
