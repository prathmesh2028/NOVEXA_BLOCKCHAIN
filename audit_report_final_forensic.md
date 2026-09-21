# NOVEXA_BLOCKCHAIN / KavachTrust Forensic Audit Report (Final)

Date: 2026-09-21
Scope: Observational forensic audit only. No code changes, no refactors, no deletions, no package installs, no runtime mutation beyond passive inspection.

## 1. Audit objective and method

This audit was performed to answer one question: before cleanup or repair work begins, what in the current codebase is broken, dummy, duplicate, dead, unused, or safe to remove?

The review was limited to static evidence and code-path tracing, with emphasis on:

- frontend route and page analysis
- auth and role behavior
- mock-data and fallback-data usage
- backend service/controller coverage
- mismatch between UI actions and backend APIs
- dead/duplicate code and orphaned features
- demo-mode risk in production

The findings below are based on code inspection and path tracing, not on a claim that the application is fully runtime-correct.

## 2. Executive summary

The project is a hybrid demo-production codebase that appears to contain significant placeholder logic, silent fallback behavior, and a number of dead or disconnected UI actions.

At a high level:

- the frontend has a rich route structure and many pages, but not all actions are wired to real handlers
- the auth layer can silently create a local demo user when API calls fail
- mock and fallback data are deeply integrated into both frontend and backend
- several mutation APIs are either absent or diverge from frontend expectations
- some code is duplicated or intentionally unreachable (for example stub history route and unmounted role provider)
- the backend is not consistently enforcing real persistence or true blockchain behavior when infrastructure is unavailable

The system should be treated as a demo-capable platform with significant cleanup needs before being considered production-ready.

## 3. Architecture snapshot

### Frontend

Canonical frontend entry:
- `frontend/f1/main.tsx`
- `frontend/f1/App.tsx`
- `frontend/f1/routes.tsx`

Critical runtime context chain:
- `AuthProvider`
- `WalletProvider`
- `RouterProvider`

Notably absent in the mounted stack:
- `RoleProvider` exists, but is not mounted in `App.tsx`; therefore it is functionally dead in the active runtime path.

### Backend

Main backend entry points:
- `backend/src/app.module.ts`
- `backend/src/main.ts`

Key conventions observed:
- NestJS modular structure
- multiple services with fallback/demo branches
- centralized fallback dataset in `backend/src/core/common/fallback-data.ts`
- Prisma schema with many models and some backend-only features that may not be clearly surfaced in the UI

## 4. Route inventory and status

The frontend route table shows many pages but also a few non-functional or duplicate routes. The major pattern is that the app is broad but not consistently coherent.

Observed route-level issues:

- `/app/history` is a stub page (`StubPage`) and explicitly non-functional
- `/app/audit`, `/app/audit-trail`, and `/app/system-activity` all point to the same `AuditPage` component
- several pages exist with actions that do not call a real handler or navigate to a valid target
- route surface is broad, but some pages appear scaffolded rather than finished

This indicates a frontend that has been assembled as a feature matrix rather than a clean, fully connected product flow.

## 5. Frontend dead and broken control paths

The clearest non-functional UI issues identified are:

1. `MyAssetsPage.tsx`
   - `+ Register New Asset` button has no actionable handler or navigation target
   - This is a visible broken control, not a hidden feature or future placeholder

2. `TechnicalRecordsPage.tsx`
   - row action button lacks a real event handler
   - this makes the table row action effectively non-functional

3. `UsersPage.tsx`
   - row action button lacks a real event handler
   - repeated pattern suggests missing UI wiring rather than isolated defect

Additional observations:

- some pages and components likely render but do not execute real backend workflows
- not all buttons are dead, but enough are clearly unhooked to undermine trust in the UI

## 6. Auth and demo-mode behavior

This is one of the most important findings of the audit.

Observed auth logic in `frontend/f1/context/AuthContext.tsx`:

- default admin-style user exists in code
- if no password is supplied, the system creates a simulated local user
- if the API login call fails, the catch path creates a simulated local user
- role labels are inferred by email patterns such as:
  - `tech` => technician
  - `nft` => NFT creator
  - `audit` => auditor
  - otherwise => admin

This means that a failed API call can silently degrade into a local-only demo mode. In practical terms, the app appears to prefer a demo fallback over explicit failure. That is a serious risk because a production deployment could show the application as working while it is actually running on fake credentials and fake data.

## 7. Mock data and fallback-data inventory

### Frontend mock data

Central dataset:
- `frontend/f1/data/mockData.ts`

Evidence from audit:
- 15 frontend files import or depend on this dataset
- pages use mock fallback data when API calls fail or when a detail page is absent
- the mock dataset covers assets, evidence, certifications, audit events, and blockchain transactions

### Backend fallback data

Central dataset:
- `backend/src/core/common/fallback-data.ts`

This file appears to synthesize records for roughly 10 entity types. It is not just a test fixture; it is part of the application’s runtime behavior when infrastructure is unavailable.

The backend service layer appears to read or mutate fallback data in multiple modules, including:
- assets
- evidence
- approvals
- certifications
- blockchain
- wallet
- notifications
- dashboard
- verification
- inspections
- technical records

There is a strong pattern of backend “demo mode” behavior being intentionally normalized into runtime responses.

## 8. API-to-UI contract mismatches

The biggest issue in the application is not necessarily missing endpoints alone, but mismatches between frontend assumptions and backend reality.

Examples identified:

- Frontend certification queue calls a mint action, but backend certification controller does not expose the expected mutation set
- frontend inspections page hits a direct `/inspections` mutation path, while the controller appears to offer `/inspections/record` instead
- lifecycle page calls a direct route that may not match the service wrapper pattern used elsewhere
- blockchain proof verification page calls an endpoint that does not have a matching backend service method

This creates a split-brain architecture:
- the UI expects one API contract
- the backend implements another
- fallback logic masks the inconsistency during demo execution

## 9. Missing mutation endpoints and feature gaps

Key backend gaps identified from static review:

- `certifications.controller` lacks clear mint/approve/revoke/issue mutation endpoints
- `inspections.controller` exposes a record-specific mutation but not a direct `POST /inspections` route expected by the frontend
- some Prisma models were identified without obvious dedicated mutation endpoints, including:
  - `UserRole`
  - `EvidenceVersion`
  - `BlockchainVerification`
  - `Checkpoint`
  - `CustodyTransfer`
  - `SupplyChainEvent`

This suggests either a partial backend implementation or a feature layer that is not fully wired to front-end and persistence workflows.

## 10. Demo/backend fallback behavior by service

The most important backend patterns observed are fallback behaviors that effectively substitute for real data access:

- Assets service: fallback to synthetic asset collections when DB operations fail
- Evidence service: returns fallback evidence in demo mode
- Certifications service: fallback read and in-memory mutation behavior
- Approvals service: creates or updates fallback objects without a durable persistence layer
- Blockchain service: returns simulated transaction/proof data
- Wallet service: generates fake challenge and success responses without a true database write path
- Notifications service: reads and mutates fallback objects without persistence
- Dashboard service: returns hardcoded summary data
- Verification service: verifies asset/evidence/certification using synthetic fallback data
- Search service: returns empty or restricted results for short queries
- Inspections service: uses in-memory fallback list behavior
- Technical records service: uses demo-responses and non-persistent operations

This indicates the backend is intentionally resilient in offline environments, but the fallback logic should be treated as a demo layer, not as production truth.

## 11. Supply-chain feature status

The repo includes recently added supply-chain-related models and modules, such as:

- Supplier
- Facility
- Lot
- Shipment
- CustodyTransfer
- SupplyChainEvent

There is a `SupplyChainController` and `SupplyChainService`, but no strong evidence from this audit that there is a fully connected frontend experience for them. This likely means one of two things:

1. the backend feature exists but the frontend is not complete, or
2. the feature is backend-only and not yet fully integrated into the user journey

Either way, it is an unfinished area and should be treated as partial implementation until proven otherwise.

## 12. Dead code and orphaned features

The codebase contains multiple examples of code that appears to exist but has no active runtime role.

Examples:

- `RoleContext.tsx` is a dead or effectively unmounted provider with hardcoded mock users
- `RoleProvider` is not mounted in the main app tree
- `/app/history` is a stub route and not a real feature
- duplicated CSS definitions for `.btn-primary` and `.btn-secondary` appear in `frontend/index.css`
- unused or stale context values in wallet-related code may no longer be used

This is classic “scaffolded but not fully pruned” behavior: the app contains components for features that were introduced during development but never fully integrated or later abandoned.

## 13. Duplicate logic, repeated patterns, and route duplication

Observed duplication:

- `/app/audit`, `/app/audit-trail`, and `/app/system-activity` route to the same component
- multiple frontend and backend data stores carry overlapping synthetic records
- the project appears to have both frontend mock data and backend fallback data, both representing the same information model in different layers
- CSS styles are repeated rather than centralized or theme-driven

This is a high-quality cleanup candidate because duplication increases maintenance cost and makes it harder to tell what is real, what is stubbed, and what is intentionally demo-only.

## 14. Security and authorization observations

The most positive finding is that the major auth risk has been corrected in the codebase: a fail-open authorization pattern was fixed to fail-closed.

However, there are still concerns:

- silent fallback authentication is a trust and security problem
- demo mode can mask real failures and create false confidence
- if environment or config checks are wrong, the application may behave as if it is in production while still serving synthetic data
- backend response shapes may not clearly signal whether data is real or fallback-derived

The product should not assume that “working in demo mode” means “safe to ship.”

## 15. Production-readiness verdict

This project is not a clean, production-grade implementation yet. It is better described as:

- a feature-rich demo application
- with a partially connected backend
- running on synthetic data when infrastructure is unavailable
- and with several UI actions and endpoints that are not fully consistent

That means the project is suitable for demo, exploration, and internal testing, but not for reliability-sensitive production scenario or confidence-critical stakeholder use without a hard cleanup and validation pass.

## 16. Safe to remove or prune

The following types of content appear safe to remove or flag for cleanup once a project decision is made:

- stub route components with no real behavior
- unmounted, inactive provider code
- duplicated route aliases pointing to the same page
- repeated CSS definitions or style dead zones
- unused role-context scaffolding
- fallback data blocks that are not explicitly required for demo mode
- non-functional UI buttons that have no handlers or navigation targets

These are not all necessarily dead in the sense of “unused everywhere,” but they are high-confidence cleanup candidates.

## 17. Delete-after-review candidates

The following items are likely stale but may be intentionally retained for future features:

- supply-chain models and modules that are not fully surfaced in the frontend
- route-level placeholder pages
- some orphaned service methods or partial controller mutations
- demo-only wallet and blockchain logic still present while real chain integration remains incomplete
- unused mock data sets after feature consolidation

These need review before deletion because they may represent partially completed work or future roadmap functionality.

## 18. Do-not-delete items

These appear structurally important and should not be removed without clear product and architecture review:

- auth and middleware infrastructure
- main asset lifecycle and verification modules
- core Prisma schema for actual domain entities
- backend route and controller contracts that are used by the app
- policy/security infrastructure
- real evidence and certification domain logic

The point is not to delete everything that looks stale; it is to separate genuine architecture from scaffolded noise and demo placeholders.

## 19. Usability and functionality scorecard

This is a best-effort scorecard based on static forensic review.

| Category | Count / Status |
|---|---:|
| total frontend routes | ~32 active routes |
| total pages/features reviewed | ~23 major pages |
| fully functional UI flows | low to moderate |
| partially functional flows | several |
| clearly broken controls | 3+ visible broken actions |
| demo-backed flows | many |
| stub or placeholder routes | at least 1 explicit |
| duplicate route aliases | at least 3 |
| major mock fallback layers | frontend + backend |
| security risk items fixed | 1 major fix |
| unresolved risk areas | several |

This is not a production confidence score; it is a risk and functionality score based on the evidence available.

## 20. Top 25 prioritized repair and cleanup tasks

Priority order matters. The first items are the ones most likely to affect correctness, trust, or operational risk.

1. Remove or gate all silent auth fallback to local demo user logic when backend auth fails.
2. Distinguish real data from fallback data in all API responses.
3. Fix the three clearly broken UI actions: My Assets, Technical Records row action, Users row action.
4. Reconcile frontend and backend certification mutation contracts.
5. Add or restore missing certification mutation endpoints and service methods.
6. Reconcile inspection path mismatch (`/inspections` vs `/inspections/record`).
7. Replace or remove stub `/app/history` route.
8. Remove or mount `RoleProvider` correctly if it is still intended to be used.
9. Eliminate unmounted/unused role logic that is no longer part of the runtime flow.
10. Audit all stateful frontend pages that rely on mock data fallback.
11. Review all backend services that return fake data without explicit mode labeling.
12. Ensure blockchain responses clearly indicate demo or offline status instead of looking real.
13. Consolidate duplicate route definitions for audit views.
14. Remove duplicate CSS definitions and centralize shared button styles.
15. Review `mockData.ts` usage and decide which pages should be fully API-backed.
16. Decide if supply-chain modules are production features or work-in-progress.
17. Map every Prisma model to a real controller and API flow.
18. Add explicit backend mode metadata for demo vs production data responses.
19. Review all wallet and notifications flows for persistence assumptions.
20. Audit all approval workflows for non-persistent fallback behavior.
21. Add lifecycle rules and validation for all mutation actions.
22. Eliminate dead code in the role and context layers.
23. Normalize naming and route patterns across frontend page modules.
24. Build a real end-to-end validation pass for the most critical workflows before release.
25. Create a staged cleanup plan: P0 blockers, P1 functionality, P2 dead code, P3 polish.

## 21. Cleanup matrices

### Safe delete candidates

These are the highest-confidence cleanup candidates:

- explicit stub route and associated page component(s)
- unused role context/provider code that is not mounted
- duplicate route aliases to the same page
- repeated CSS definitions / dead utility classes
- orphaned placeholder buttons without action handlers

### Delete-after-review candidates

These may be legitimate partial features but need confirmation before deletion:

- supply-chain modules not surfaced in UI
- unused or partially complete service methods
- old mock datasets after migration to real APIs
- redundant route aliases created during rapid feature iteration

### Do-not-delete candidates

These should be retained until architecture is explicitly redefined:

- real auth layer
- asset lifecycle and verification modules
- evidence integrity logic
- certification and approval domain functions
- security policy primitives
- core Prisma schema and data model

## 22. Risk register summary

| Risk | Severity | Evidence |
|---|---|---|
| silent demo fallback in auth | Critical | login fallback in `AuthContext.tsx` |
| fake data masking backend failure | Critical | backend fallback data and offline mode |
| uncoupled frontend/backend API contracts | High | mismatched routes and missing mutation endpoints |
| dead UI actions | High | non-functional register and row actions |
| duplicate route behavior | Medium | multiple audit routes pointed to same component |
| dead code / stale providers | Medium | RoleProvider not mounted |
| partial feature coverage | Medium | supply-chain modules without frontend completion |
| environment risk in production | High | demo-mode branches across services |

## 23. What is actually safe to remove right now

If the goal is a cleanup pre-pass with minimal risk, the safest items to remove are:

- stubs and dead route pages
- unmounted providers
- duplicate CSS and unused utility classes
- dead button handlers and route aliases
- clearly orphaned placeholder code

These do not appear to represent the business-critical domain logic of the application.

## 24. Final recommendation

The project should be treated as a partially functional demo platform with real domain structure but unstable product-level wiring. The next phase should not be “production hardening” in the usual sense; it should be:

1. separate real product flows from demo flows
2. remove or gate silent fallbacks
3. fix the broken UI and endpoint mismatches
4. prove each major action against the actual backend contract
5. prune dead code and duplicate routes
6. only then proceed to hardening and production readiness work

In short: the codebase contains real business logic, but it also contains a significant amount of demo scaffolding and dead-path code. The cleanup work should begin by removing the fake runtime paths and reconnecting real API flows before any large feature or deployment push.

---

Prepared as a forensic audit artifact only. No application source was modified during this review.
