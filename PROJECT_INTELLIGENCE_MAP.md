# PROJECT INTELLIGENCE MAP

## 1. Project Purpose
**Project:** BEL-DEFENCE-ASSET-TRUST / KavachTrust
**Context:** SIH 2026, Bharat Electronics Limited (BEL).
**Problem:** Blockchain-Based Secure Platform for Identity, Access Control, and Digital Asset Management.
**Scope:** Synthetic proof-of-concept using Electronic Fuze as Proof Stock Component (PSC).

## 2. Frontend
**Current Implementation:** React 19 + Vite 8 + TypeScript + Tailwind CSS v4 + React Router.
**Status:** Highly functional UI, but heavily dependent on mock data (`src/data/mockData.ts`).
**Routing:** Client-side via React Router. Includes Admin, NFT Creator, Technician, and Auditor dashboards based on mock roles.
**API Integration:** Partially wired to backend via `src/services/api.ts` (configured with dynamic host for LAN access), but many components still read directly from `mockData.ts`.

## 3. Current Backend (Legacy)
**Implementation:** Python 3.12 + FastAPI.
**Architecture:** Monolithic REST API.
**Status:** Functional but classified as "Legacy" in relation to the target architecture.
**Key Features:** SQLite database, synchronous Web3.py integration (Hardhat), simple JWT authentication.

## 4. Smart Contracts
**Implementation:** Solidity (`KavachTrustSBT.sol`).
**Standard:** ERC-721 modified to be non-transferable (Soulbound Token - SBT), preventing transfers via `_update` override.
**Network:** Local Hardhat node.

## 5. Database
**Current:** SQLite (`test_db.sqlite` / `dev.db`).
**ORM:** SQLAlchemy.
**Migrations:** Alembic is not heavily utilized; tables are often auto-created (`Base.metadata.create_all()`).

## 6. Data Model
**Core Entities:** User, Actor (Identity), Asset, Batch, Evidence, Certification, AuditEvent, LifecycleEvent, BlockchainTransaction.
**State:** Currently spread between FastAPI SQLAlchemy models and frontend mock interfaces.

## 7. APIs
**Current Backend:** RESTful. Endpoints exist for Auth (`/api/v1/auth`), Assets, Evidence, and Certifications.
**Status:** Lacks comprehensive RBAC guards on most endpoints. Evidence upload discards files. Certification endpoint is synchronous and blocking.

## 8. Authentication
**Current:** Simple Email/Password -> JWT (HS256) implementation in FastAPI.
**Status:** Basic. Hardcoded secret key. No OIDC, no WebAuthn.

## 9. Authorization
**Current:** Roles exist in database/frontend mocks, but backend API routes lack explicit permission checks (no Casbin/ABAC).
**Target:** Casbin RBAC + ABAC.

## 10. Identity
**Current:** `Actor` table contains a DID string and wallet address.
**Status:** Synthetic. Not utilizing real `did:web` resolution or PKI/X.509.

## 11. Evidence
**Current:** Frontend simulates upload. Backend endpoint computes SHA-256 hash but discards the binary payload.
**Status:** Mocked storage. Needs MinIO/S3.

## 12. Audit
**Current:** `AuditEvent` table in SQLite.
**Status:** Ordinary logs. Not Merkle committed or hash-chained in the current implementation.

## 13. Merkle
**Current:** MISSING.
**Target:** Custom SHA-256 Merkle module.

## 14. Blockchain
**Current:** Hardhat (local node) + Web3.py.
**Target:** Hyperledger Besu + QBFT.

## 15. Certification
**Current:** Handled via `KavachTrustSBT`. Minted synchronously on API call.
**Status:** Minting blocks the HTTP thread.

## 16. Verification
**Current:** Basic contract read endpoints exist.
**Status:** Does not perform comprehensive off-chain Merkle/hash verification.

## 17. Deployment
**Current:** Local scripts (`npm run dev`, `uvicorn`). No comprehensive Docker Compose for the entire stack.
**Target:** Docker Compose + GitHub Actions.

## 18. Testing
**Current:** Pytest for backend (tests passed).
**Target:** Vitest + Supertest + Testcontainers + OWASP ZAP + Slither/Foundry.

## 19. Observability
**Current:** Standard Uvicorn/Vite terminal output.
**Target:** Pino + Prometheus + Grafana + OpenTelemetry + Sentry.

## 20. Security
**Current:** Secrets (JWT secret, Web3 private keys) are hardcoded in `app/core/config.py`. SQLite is unencrypted.
**Target:** PostgreSQL RLS, mTLS, robust secret management.

## 21. Target Architecture
**Backend:** NestJS + Prisma + PostgreSQL.
**Identity:** OIDC + WebAuthn + PKI/X.509 + did:web.
**Blockchain:** Besu + Solidity (ERC-5192 style) + viem.

## 22. Current→Target Migration Map
- FastAPI -> NestJS
- SQLAlchemy -> Prisma
- SQLite -> PostgreSQL
- Web3.py -> viem + Blockchain Adapter
- Synchronous Web3 -> Transactional Outbox + Worker
- Hardhat -> Besu (QBFT)

## 23. Known Gaps
- Complete lack of asynchronous task workers (Celery/BullMQ).
- Evidence files are not actually stored.
- Missing cryptographic Merkle tree implementation for audit logs.
- Missing robust RBAC/Casbin integration on API endpoints.

## 24. Dependencies
- **Frontend:** React, Vite, Tailwind v4.
- **Backend:** FastAPI, SQLAlchemy, Web3.py.
- **Smart Contracts:** OpenZeppelin Contracts.

## 25. Demo Flow
1. **Technician:** Registers Asset -> Uploads Evidence (Mocked storage).
2. **Auditor:** Verifies Evidence -> Approves Inspection.
3. **NFT Creator:** Mints Certification -> SBT issued on Hardhat.
4. **Admin:** Views Dashboard metrics.
*(Note: Most of this flow in the frontend currently relies on `mockData.ts` rather than the FastAPI backend).*
