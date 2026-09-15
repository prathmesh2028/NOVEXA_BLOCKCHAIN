# KAVACHTRUST / BEL-DEFENCE-ASSET-TRUST — Backend

Backend for the **KavachTrust / BEL Defence Asset Trust** platform.

This is a production-ready, enterprise-grade backend developed with **NestJS**, **Prisma ORM**, and **PostgreSQL**, engineered strictly to preserve compatibility with the frozen frontend while providing hardened security, real authentication, Casbin RBAC, cryptographic audit logging, Merkle tree verification, and an asynchronous transactional outbox worker.

> **Note**: The legacy Python/FastAPI backend implementation is preserved in the `legacy/` subdirectory for reference purposes.

---

## 🏛️ Architecture Overview

```
Frozen Frontend (React/Vite)
        │  HTTP / REST
        ▼
   NestJS Backend
  ┌─────────────────────────────────────────────────────────────┐
  │  Middleware & Guards:                                       │
  │    • RequestIdMiddleware (UUID tracking)                    │
  │    • Helmet, CORS, Global ValidationPipe                    │
  │    • JwtAuthGuard (JWT Bearer Token verification)           │
  │    • CasbinRbacGuard (Attribute & Role Based Access)        │
  ├─────────────────────────────────────────────────────────────┤
  │  Domain Modules:                                            │
  │    • Auth & Users (bcrypt, JWT, Casbin)                     │
  │    • Assets & Batches                                       │
  │    • Evidence (SHA-256 integrity check, MinIO/S3 ready)    │
  │    • Lifecycle State Machine (strict transition invariants) │
  │    • Inspections (QA compliance, PASS/FAIL gating)          │
  │    • Audit (SHA-256 sequential hash-chain, tamper detect)   │
  │    • Merkle Tree (deterministic pair-hash, proofs & roots)  │
  │    • Certifications (idempotent minting, blockchain anchor) │
  │    • Identity (did:web prototype, W3C VC 2.0 credentials)   │
  │    • Outbox & Worker (reliable asynchronous dispatch)       │
  │    • Cross-domain Search & Dashboard Metrics                │
  │    • Health & Readiness probes                              │
  └─────────────────────────────────────────────────────────────┘
        │                                 │
        ▼                                 ▼
   PostgreSQL (via Prisma)         Ethereum / EVM QBFT Nodes
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js >= 20
- npm >= 10
- PostgreSQL 16 (or Docker Desktop)

### 1. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Default development settings:
- `PORT=3001`
- `DATABASE_URL=postgresql://kavach:kavach_dev_2026@localhost:5432/kavachtrust?schema=public`
- `JWT_SECRET=kavach_super_secret_jwt_key_defence_trust_2026`

### 2. Start PostgreSQL (Docker)
```bash
docker compose up -d
```

### 3. Database Migration & Seed
```bash
npx prisma migrate dev
npx tsx prisma/seed.ts
```
*Note: The seed script populates all standard BEL roles, defense components (Radar, Optical Sensors, Batteries), batches, and audit records with password `password`.*

### 4. Build and Run
```bash
# Type check
npm run typecheck

# Run unit tests
npm test

# Build application
npm run build

# Start in development mode
npm run start:dev
```

---

## 🧪 Testing

Comprehensive unit tests cover cryptographic services, state machine transitions, and verification:
```bash
npm run test
```
Test suites include:
- `src/merkle/merkle.service.spec.ts` — Tree construction, deterministic pair ordering, root generation, proof verification, tamper rejection.
- `src/audit/audit.service.spec.ts` — Genesis hash chaining, continuous chain validation, tamper detection.
- `src/lifecycle/lifecycle.service.spec.ts` — Enforcing valid transition rules, role-based rejection, evidence gating, idempotency.
- `src/identity/identity.service.spec.ts` — `did:web` resolution format, W3C VC 2.0 credential creation.
- `src/verification/verification.service.spec.ts` — Comprehensive cross-domain validation checks (identity, evidence, inspection, lifecycle, blockchain).

---

## 🔒 Security & Access Control (Casbin RBAC)

Role hierarchy:
1. **ADMIN**: Full administration, user provisioning, batch approvals.
2. **TECHNICIAN**: State transitions (declaring, receiving, inspecting), evidence upload.
3. **INSPECTOR**: Recording QA inspections, certifying assets.
4. **AUDITOR**: Read-only verification, audit trail inspection, Merkle proof validation.
5. **SUPPLIER**: Declaring components and attaching manufacturer certificates.
6. **OPERATOR**: Querying dashboard metrics and tracking component location.

---

## 📦 API Endpoints Summary

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/login` | Authenticate and obtain JWT Bearer Token |
| `GET` | `/api/auth/me` | Fetch authenticated actor profile and permissions |
| `GET` | `/api/assets` | Paginated listing of defense components |
| `POST` | `/api/assets` | Register a new asset |
| `POST` | `/api/evidence/upload` | Upload & digest evidence payload |
| `POST` | `/api/lifecycle/transition` | Execute state machine transition |
| `POST` | `/api/inspections` | Record technical QA inspection |
| `GET` | `/api/audit` | Paginated cryptographic audit log |
| `GET` | `/api/audit/verify` | Verify integrity of audit hash chain |
| `POST` | `/api/certifications/mint` | Idempotent digital passport minting |
| `GET` | `/api/verification/:assetId` | Cross-domain verification check |
| `GET` | `/api/search` | Unified search across assets, batches, evidence |
| `GET` | `/api/dashboard/summary` | Real-time counts and compliance ratios |
| `GET` | `/health` | Liveness & database readiness check |


