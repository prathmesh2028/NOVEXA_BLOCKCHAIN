# IMPLEMENTATION BLUEPRINT
## KavachTrust / BEL-Defence-Asset-Trust — Backend

**Document Version**: 1.0  
**Date**: 2026-09-15  
**Status**: BASELINE FOR RE-AUDIT  
**Branch**: main

---

## EXECUTIVE SUMMARY

This blueprint documents the **CURRENT** state of Backend implementation against the **TARGET** architecture defined in the master prompt and forensic documentation.

**Critical Understanding**:
- Frontend is **FROZEN** — no modifications allowed
- Legacy FastAPI backend is **REFERENCE ONLY** — not to be extended
- Backend (NestJS + Prisma + PostgreSQL) is the **TARGET IMPLEMENTATION**
- Infrastructure (PostgreSQL/MinIO/Besu) **NOT RUNNING** during this audit
- Unit tests **PASS** (20/20)
- Integration tests require infrastructure

---

## 1. CURRENT ARCHITECTURE

### 1.1 Technology Stack Alignment

| Component | Target | Current Implementation | Status |
|---|---|---|---|
| **Runtime** | Node.js + TypeScript | Node.js + TypeScript | ✓ MATCH |
| **Framework** | NestJS Modular Monolith | NestJS with 17 modules | ✓ MATCH |
| **API Style** | REST + OpenAPI 3.1 | REST with Swagger | ✓ MATCH |
| **Validation** | Zod | Class-validator (NestJS standard) | PARTIAL |
| **Database** | PostgreSQL | Prisma schema defined | REQUIRES VERIFICATION |
| **ORM** | Prisma | Prisma 6.x | ✓ MATCH |
| **Auth (Password)** | OIDC + JWT | JWT with bcrypt | PARTIAL |
| **Auth (Privileged)** | WebAuthn | NOT IMPLEMENTED | MISSING |
| **Service Auth** | mTLS | NOT IMPLEMENTED | MISSING |
| **Authorization** | Casbin RBAC+ABAC | Casbin + RolesGuard | REQUIRES VERIFICATION |
| **RLS** | PostgreSQL RLS | Schema supports, not verified | REQUIRES VERIFICATION |
| **Identity** | X.509 / PKI | NOT IMPLEMENTED | MISSING |
| **DID** | did:web | Identity module exists | REQUIRES VERIFICATION |
| **Credentials** | W3C VC 2.0 JSON | Identity module exists | REQUIRES VERIFICATION |
| **Hashing** | SHA-256 | crypto.createHash('sha256') | ✓ MATCH |
| **App Signatures** | Ed25519 | NOT IMPLEMENTED | MISSING |
| **Chain Signatures** | ECDSA secp256k1 | Viem configured | REQUIRES VERIFICATION |
| **Encryption** | AES-256-GCM | NOT IMPLEMENTED | MISSING |
| **Storage** | MinIO/S3 | MinIO client dependency | REQUIRES VERIFICATION |
| **Audit** | SHA-256 hash chain | Implemented + tested | ✓ VERIFIED |
| **Merkle** | Custom SHA-256 | Implemented + tested | ✓ VERIFIED |
| **Blockchain** | Hyperledger Besu | Adapter exists | REQUIRES VERIFICATION |
| **Consensus** | QBFT | Not verified | REQUIRES VERIFICATION |
| **Contract Lang** | Solidity | KavachTrustSBT.sol exists | REQUIRES VERIFICATION |
| **Contract Base** | OpenZeppelin | Uses OZ ERC721 | ✓ MATCH |
| **Contract Test** | Foundry | Hardhat (legacy) | CONFLICT |
| **Security Scan** | Slither | NOT RUN | MISSING |
| **Chain Client** | viem | Viem 2.x | ✓ MATCH |
| **Blockchain Pattern** | Adapter + Outbox + Worker | Implemented | REQUIRES VERIFICATION |
| **Outbox** | PostgreSQL-backed | Implemented | REQUIRES VERIFICATION |
| **Worker** | Separate process | Code exists | REQUIRES VERIFICATION |
| **Unit Tests** | Vitest | Vitest with 20 passing tests | ✓ VERIFIED |
| **Integration Tests** | Supertest + Testcontainers | NOT RUN | REQUIRES VERIFICATION |
| **E2E Tests** | Vitest E2E config | NOT RUN | REQUIRES VERIFICATION |
| **Security Tests** | OWASP ZAP | NOT RUN | MISSING |
| **Logging** | Pino | Pino configured | REQUIRES VERIFICATION |
| **Metrics** | Prometheus | prom-client dependency | REQUIRES VERIFICATION |
| **Tracing** | OpenTelemetry | NOT IMPLEMENTED | MISSING |
| **Error Tracking** | Sentry | NOT IMPLEMENTED | MISSING |
| **Container** | Docker Compose | docker-compose.yml exists | REQUIRES VERIFICATION |
| **CI/CD** | GitHub Actions | Workflow exists | REQUIRES VERIFICATION |

### 1.2 Module Structure

Backend is organized as a NestJS modular monolith with the following modules:

```
src/
├── app.module.ts          # Root module orchestrator
├── main.ts                # Bootstrap with Helmet, CORS, Swagger
├── auth/                  # JWT authentication + guards
├── users/                 # User management
├── assets/                # Asset + batch domain
├── evidence/              # Evidence storage + integrity
├── lifecycle/             # State machine enforcement
├── inspections/           # QA/QC inspections
├── certifications/        # Certification + minting
├── blockchain/            # Blockchain adapter
├── audit/                 # Hash-chained audit log
├── merkle/                # Merkle tree service
├── outbox/                # Transactional outbox
├── verification/          # Cross-domain verification
├── search/                # Unified search
├── dashboard/             # Metrics aggregation
├── health/                # Liveness + readiness
├── identity/              # DID + VC
├── prisma/                # Database client module
├── config/                # Environment configuration
└── common/                # Shared middleware + utilities
```

**Critical Finding**: All domain modules exist as per target architecture.

---

## 2. TARGET ARCHITECTURE

### 2.1 Exact Role Definitions

The master prompt defines **ONLY** these four user-facing application roles:

| Role | Responsibilities |
|---|---|
| **ADMIN** | User administration, role governance, system configuration, security/audit oversight |
| **NFT_CREATOR** | Certification review, certification issuance, passport mint workflow, authorized revocation |
| **TECHNICIAN** | Asset registration, batch registration, evidence upload, inspection recording, lifecycle transitions |
| **AUDITOR** | Search, verification, evidence integrity review, lifecycle review, certification review, blockchain review, audit review (READ-ONLY) |

**Critical Rule**: NO additional user-facing roles (INSPECTOR, SUPPLIER, OPERATOR, etc.) unless explicitly reconciled with master prompt.

Current implementation: Prisma schema defines `AppRole` enum with exactly these 4 roles. ✓ COMPLIANT

### 2.2 Domain Model Verification

Required entities per master prompt:

#### Identity Domain
- ✓ User
- ✓ UserRole  
- ✓ Actor
- ✓ DIDDocument
- ✓ Credential

#### Asset Domain
- ✓ Asset
- ✓ Batch
- ✓ PhysicalBinding
- ✓ TechnicalRecord

#### Evidence Domain
- ✓ Evidence
- ✓ EvidenceVersion

#### Lifecycle Domain
- ✓ Inspection
- ✓ LifecycleEvent
- ✓ ExpectedTransition

#### Certification Domain
- ✓ Certification (passport/NFT mapping)

#### Blockchain Domain
- ✓ BlockchainTransaction
- ✓ BlockchainVerification

#### Audit Domain
- ✓ AuditEvent
- ✓ Checkpoint (for Merkle roots)

#### Outbox Domain
- ✓ OutboxEvent

**Finding**: All required entities present in Prisma schema.

### 2.3 Lifecycle State Machine

**Required States** (master prompt section 10):
```
UNREGISTERED
→ SUPPLIER_DECLARED
→ RECEIVED
→ INSPECTION_RECORDED
→ ACCEPTED_FOR_ASSEMBLY

OR (rejection path):
INSPECTION_RECORDED
→ REJECTED_QUARANTINED

Exception state:
INSPECTION_OVERDUE
```

Current Prisma schema:
```prisma
enum LifecycleState {
  UNREGISTERED
  SUPPLIER_DECLARED
  RECEIVED
  INSPECTION_RECORDED
  ACCEPTED_FOR_ASSEMBLY
  REJECTED_QUARANTINED
  INSPECTION_OVERDUE
}
```

✓ **COMPLIANT** — All required states present.

### 2.4 Domain Invariants (Master Prompt Section 9)

Critical invariants that MUST be enforced:

1. **Certification requires eligible batch state** — Implementation status: REQUIRES VERIFICATION
2. **Acceptance requires required inspection** — Implementation status: REQUIRES VERIFICATION
3. **Revoked credentials cannot authorize protected operations** — Implementation status: REQUIRES VERIFICATION
4. **Auditor cannot perform operational mutations** — Implementation status: REQUIRES VERIFICATION (RolesGuard exists)
5. **Unauthorized actors cannot bypass lifecycle rules** — Implementation status: REQUIRES VERIFICATION
6. **Evidence versions cannot be silently overwritten** — Schema enforces unique (evidenceId, version)
7. **Blockchain confirmation cannot come solely from frontend claims** — Implementation status: REQUIRES VERIFICATION
8. **Passport cannot transfer** — Contract requirement: REQUIRES VERIFICATION
9. **Critical audit history cannot be modified normally** — Implementation status: REQUIRES VERIFICATION
10. **Duplicate logical transitions are prevented** — idempotencyKey unique constraint exists
11. **Concurrent critical transitions are safe** — Database transaction level: REQUIRES VERIFICATION
12. **A certification cannot produce multiple logical mint operations** — mintRequestId unique constraint exists

---

## 3. DEPENDENCY BOUNDARIES

### 3.1 Frontend → Backend Contract

**Critical Constraint**: Frontend is FROZEN. Backend must adapt to frontend expectations.

**Frontend Expectations** (from FRONTEND_BACKEND_COMPATIBILITY.md):
- **Field naming**: Mix of camelCase (frontend) and snake_case (backend API)
- **Authentication**: POST /api/v1/auth/login → {access_token, token_type}, then GET /api/v1/auth/me
- **Pagination**: query params `page`, `page_size` (or `limit`)
- **Assets**: GET /api/v1/assets with lifecycle filtering
- **Evidence**: POST /api/v1/evidence with multipart OR JSON
- **Certifications**: GET /api/v1/certifications with status filtering
- **Audit**: GET /api/v1/audit with timeline format
- **Blockchain**: GET /api/v1/blockchain/transactions
- **Search**: GET /api/v1/search with specific result shape
- **Dashboard**: GET /api/v1/dashboard/summary

**Current Backend Prefix**: `/api` (main.ts sets `config.apiPrefix`)

**Finding**: Potential mismatch — frontend expects `/api/v1`, backend serves `/api`. REQUIRES VERIFICATION.

### 3.2 Backend → Database Contract

- PostgreSQL connection string from `DATABASE_URL` env var
- Prisma Client generated from schema.prisma
- Migrations via `prisma migrate dev` / `prisma migrate deploy`
- Seed script at `prisma/seed.ts`

### 3.3 Backend → Blockchain Contract

- Blockchain adapter abstraction in `blockchain/` module
- Viem for EVM interaction
- Contract address from environment
- Separate worker process for async transaction submission

### 3.4 Backend → Storage Contract

- MinIO client configured (dependency present)
- Object storage for evidence files
- SHA-256 hash stored in DB
- S3-compatible API

---

## 4. MIGRATION BOUNDARIES

### 4.1 What to Preserve from Legacy Backend

**Domain Semantics** (from FastAPI reference):
- 6 lifecycle states and their meanings
- 4 user roles (ADMIN, NFT_CREATOR, TECHNICIAN, AUDITOR)
- Asset/Batch/Evidence/Certification entity relationships
- Non-transferable SBT concept
- Certification eligibility logic

**Do NOT Preserve**:
- FastAPI implementation details
- SQLite database
- SQLAlchemy ORM patterns
- Web3.py blockchain calls
- Synchronous blockchain minting
- Hardcoded secrets
- Missing RBAC enforcement

### 4.2 What is New in the Current Backend

- NestJS modular architecture
- PostgreSQL with Prisma
- Hash-chained audit log (not in legacy)
- Merkle tree implementation (not in legacy)
- Transactional outbox pattern (not in legacy)
- Separate worker process (not in legacy)
- Casbin RBAC enforcement (not in legacy)
- DID + VC infrastructure (not in legacy)
- Evidence versioning (not in legacy)
- ExpectedTransition rules (not in legacy)
- Comprehensive verification engine (not in legacy)

---

## 5. IMPLEMENTATION ORDER

Based on dependency analysis:

### Phase 1: Foundation (COMPLETED)
- [x] NestJS project scaffold
- [x] Prisma schema definition
- [x] Environment configuration
- [x] PrismaModule + ConfigModule
- [x] RequestIdMiddleware

### Phase 2: Authentication & Authorization (PARTIAL)
- [x] JWT authentication
- [x] JwtAuthGuard
- [x] RolesGuard
- [x] User/Actor models
- [ ] Casbin policy enforcement verification
- [ ] WebAuthn for privileged operations
- [ ] mTLS for service authentication

### Phase 3: Core Domain (PARTIAL)
- [x] Assets module + controller
- [x] Batches (via Asset relation)
- [x] Evidence module + controller
- [x] Inspection module
- [x] Lifecycle module + state machine
- [x] Audit module + hash chain
- [x] Merkle module
- [ ] MinIO integration verification
- [ ] Evidence encryption for SENSITIVE/RESTRICTED

### Phase 4: Certification & Blockchain (PARTIAL)
- [x] Certification module
- [x] Blockchain adapter module
- [x] Outbox module
- [ ] Worker implementation verification
- [ ] Smart contract audit
- [ ] Besu network setup

### Phase 5: Identity & Verification (PARTIAL)
- [x] Identity module structure
- [x] Verification module structure
- [ ] did:web resolver
- [ ] W3C VC 2.0 issuance
- [ ] Ed25519 signatures
- [ ] X.509/PKI integration

### Phase 6: API Completion (PARTIAL)
- [x] Search module
- [x] Dashboard module
- [x] Health module
- [ ] OpenAPI 3.1 spec generation
- [ ] API prefix verification (/api vs /api/v1)
- [ ] Frontend compatibility testing

### Phase 7: Infrastructure & Deployment (INCOMPLETE)
- [x] Docker Compose file
- [ ] PostgreSQL verification
- [ ] MinIO verification
- [ ] Besu network verification
- [ ] GitHub Actions CI verification

### Phase 8: Security & Testing (INCOMPLETE)
- [x] Unit tests (20 passing)
- [ ] Integration tests
- [ ] E2E tests
- [ ] Security scan (OWASP ZAP)
- [ ] Contract tests (Foundry)
- [ ] Slither analysis

---

## 6. RISKS & BLOCKERS

### 6.1 Infrastructure Risks

| Risk | Impact | Status |
|---|---|---|
| Docker not running | Cannot verify PostgreSQL/MinIO/Besu | **BLOCKING** integration tests |
| PostgreSQL not available | Cannot run migrations or seed | **BLOCKING** runtime verification |
| MinIO not available | Evidence storage untested | **BLOCKING** evidence upload |
| Besu network not configured | Blockchain integration untested | **BLOCKING** minting workflow |

### 6.2 Frontend Integration Risks

| Risk | Impact | Mitigation |
|---|---|---|
| API prefix mismatch (/api vs /api/v1) | Frontend cannot reach endpoints | Verify actual frontend API calls |
| Field name mismatches (camelCase vs snake_case) | Data parsing errors | DTO mapping in controllers |
| StubPage routes (11 identified) | Features appear working but are not | Document as BLOCKED BY FROZEN FRONTEND |
| mockData still in use | Frontend not consuming real APIs | Cannot modify frontend to fix |

### 6.3 Implementation Risks

| Risk | Impact | Status |
|---|---|---|
| Casbin policies not loaded | Authorization bypass | REQUIRES VERIFICATION |
| RLS policies not applied | Data isolation failure | REQUIRES VERIFICATION |
| Worker not running | Minting never completes | REQUIRES VERIFICATION |
| Smart contract not audited | Security vulnerabilities | REQUIRES VERIFICATION |
| Transfer blocking not tested | Passport transferability | REQUIRES VERIFICATION |

---

## 7. PHASE GATES

Each phase has acceptance criteria that must be met before marking COMPLETE:

### Gate 1: Foundation
- [x] TypeScript compilation succeeds
- [x] NestJS starts without errors
- [x] Prisma client generates

### Gate 2: Authentication
- [ ] All 4 demo users can login
- [ ] JWT tokens validate correctly
- [ ] /auth/me returns correct user data
- [ ] Wrong credentials rejected

### Gate 3: Authorization
- [ ] ADMIN can access all endpoints
- [ ] TECHNICIAN can create assets, not certifications
- [ ] NFT_CREATOR can create certifications
- [ ] AUDITOR gets 403 on mutations
- [ ] Casbin policies verified

### Gate 4: Asset Domain
- [ ] POST /api/v1/assets creates asset
- [ ] Asset lifecycle state initializes correctly
- [ ] Batch relationships work
- [ ] Evidence can be uploaded (with infrastructure)
- [ ] Evidence SHA-256 computed server-side

### Gate 5: Lifecycle
- [ ] Valid transitions succeed
- [ ] Invalid transitions rejected
- [ ] Role checks enforced
- [ ] Idempotency works
- [ ] Concurrent transitions safe

### Gate 6: Audit & Integrity
- [ ] Audit events created
- [ ] Hash chain verified
- [ ] Tampering detected
- [ ] Merkle tree builds correctly
- [ ] Proofs verify

### Gate 7: Certification
- [ ] Eligibility checked
- [ ] Certification creates outbox event
- [ ] Worker processes event (with infrastructure)
- [ ] Blockchain transaction submitted (with infrastructure)
- [ ] Passport recorded in DB

### Gate 8: Verification
- [ ] Identity verification works
- [ ] Evidence integrity verified
- [ ] Lifecycle verification works
- [ ] Blockchain verification works (with infrastructure)
- [ ] Combined report accurate

### Gate 9: Security
- [ ] No secrets in code
- [ ] JWT validation robust
- [ ] RBAC enforced
- [ ] Rate limiting works
- [ ] Input validation works

### Gate 10: Integration
- [ ] Frontend can login
- [ ] Frontend can list assets
- [ ] Frontend can view certifications
- [ ] API responses match frontend expectations
- [ ] Error handling works

---

## 8. ACCEPTANCE CRITERIA

A feature is marked **COMPLETE** only when ALL of the following are true:

1. **Implementation exists** — Code is written and committed
2. **Tests pass** — Unit + integration tests verify behavior
3. **Security verified** — No obvious vulnerabilities, RBAC enforced
4. **Integration works** — API can be called and returns expected data
5. **Documentation exists** — Endpoint documented, behavior explained
6. **Infrastructure verified** — Dependent services (DB, storage, blockchain) confirmed working OR explicitly documented as unavailable

A feature is marked **BLOCKED** when:
- Required infrastructure is unavailable and cannot be started
- Frontend is frozen and cannot be modified to complete integration
- External dependencies are missing

A feature is marked **PARTIAL** when:
- Code exists but tests are incomplete
- Tests pass but integration is unverified
- Implementation exists but security controls are unverified

A feature is **NEVER** marked COMPLETE when:
- A file exists but functionality is not verified
- Tests pass but behavior is mocked/stubbed
- Infrastructure is in fallback mode
- Frontend displays stub page

---

## 9. BLOCKERS

### Current Blockers (2026-09-15)

1. **Docker Desktop not running**
   - Impact: Cannot start PostgreSQL, MinIO, Besu
   - Resolution: User must start Docker Desktop
   - Workaround: None — infrastructure is required

2. **Frontend frozen**
   - Impact: Cannot modify frontend to consume new APIs
   - Resolution: None — per master prompt rules
   - Mitigation: Backend must adapt to frontend expectations

3. **11 StubPage routes identified**
   - Impact: Routes render but have no functionality
   - Resolution: Backend can implement APIs, but frontend cannot consume them
   - Status: BLOCKED BY FROZEN FRONTEND for UI integration

4. **API prefix unclear** (/api vs /api/v1)
   - Impact: Frontend may not reach endpoints
   - Resolution: Verify actual frontend API calls
   - Priority: HIGH

### Resolved Blockers

None yet.

---

## 10. SUCCESS METRICS

### Code Quality
- ✓ TypeScript compilation: PASS
- ✓ Linting: Not run
- ✓ Unit tests: 20/20 PASS
- ⚠ Integration tests: NOT RUN (infrastructure required)
- ⚠ E2E tests: NOT RUN
- ⚠ Security scan: NOT RUN

### Domain Coverage
- ✓ All required entities in schema
- ✓ All required modules created
- ⚠ All required endpoints: REQUIRES VERIFICATION
- ⚠ All required invariants: REQUIRES VERIFICATION

### Security Coverage
- ✓ JWT authentication: CODE EXISTS
- ⚠ RBAC enforcement: REQUIRES VERIFICATION
- ✗ WebAuthn: NOT IMPLEMENTED
- ✗ mTLS: NOT IMPLEMENTED
- ✗ RLS: NOT VERIFIED
- ✗ Ed25519 signatures: NOT IMPLEMENTED
- ✗ AES-256-GCM: NOT IMPLEMENTED

### Integration Coverage
- ✗ Frontend login: NOT VERIFIED
- ✗ Frontend API calls: NOT VERIFIED
- ✗ PostgreSQL: NOT VERIFIED (Docker not running)
- ✗ MinIO: NOT VERIFIED (Docker not running)
- ✗ Besu: NOT VERIFIED (not configured)

---

## NEXT STEPS

1. **Verify API prefix** — Check if frontend expects /api/v1 or /api
2. **Start Docker** — Required for all integration verification
3. **Run migrations** — Set up PostgreSQL schema
4. **Run seed** — Create demo users
5. **Start backend** — Verify endpoints respond
6. **Test authentication** — Verify all 4 demo users
7. **Test authorization** — Verify RBAC enforcement
8. **Frontend route audit** — Classify all 29 routes
9. **API contract audit** — Verify frontend expectations
10. **Document gaps** — Create requirements traceability matrix

---

**END OF IMPLEMENTATION BLUEPRINT**
