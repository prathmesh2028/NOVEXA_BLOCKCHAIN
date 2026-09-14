# FINAL AI PROJECT HANDOFF

## A. WHAT THIS PROJECT IS
BEL-DEFENCE-ASSET-TRUST (KavachTrust) is a SIH 2026 project for Bharat Electronics Limited. It is a Blockchain-Based Secure Platform for Identity, Access Control, and Digital Asset Management, initially focusing on a synthetic proof-of-concept for an Electronic Fuze (Proof Stock Component).

## B. WHAT CURRENTLY EXISTS
1. **Frontend**: React + Vite + TS UI. It is visually complete but heavily relies on mocked data.
2. **Legacy Backend**: Python FastAPI monolithic API connected to a local SQLite database.
3. **Smart Contracts**: `KavachTrustSBT.sol`, a Soulbound ERC-721 token deployed on a local Hardhat node.

## C. WHAT CURRENTLY WORKS
- The frontend Vite dev server builds and serves the UI successfully.
- The FastAPI backend starts, connects to SQLite, and serves basic endpoints (Auth, Assets, Evidence).
- Hardhat node can compile and deploy the SBT.
- API can perform a basic JWT login and mint an SBT on the local Hardhat network.

## D. WHAT IS MOCKED
- **Frontend Data**: Almost the entire frontend state reads from `src/data/mockData.ts` rather than the FastAPI backend.
- **Evidence Storage**: The FastAPI `/api/v1/evidence` endpoint computes a hash but discards the uploaded file.
- **Identity**: DIDs are just synthetic strings in the database; there is no real DID resolution or PKI/X.509 verification.

## E. WHAT IS BROKEN
- **Frontend/Backend Drift**: The frontend expects robust data structures (nested histories, file URLs) that the FastAPI backend does not fully provide.
- **Synchronous Minting**: The backend mints SBTs synchronously on the main thread, which will cause timeouts and race conditions in production.
- **Security**: Hardcoded secrets (JWT keys, private keys) exist in `backend/app/core/config.py`.

## F. LEGACY BACKEND ARCHITECTURE
- Python 3.12 + FastAPI + SQLAlchemy + SQLite.
- JWT Authentication (HS256).
- Web3.py for blockchain interactions.

## G. FRONTEND ARCHITECTURE
- React 19 + TypeScript.
- Tailwind CSS v4.
- React Router (client-side routing).
- Uses a mock data layer (`src/data/mockData.ts`) and a simulated delay API (`src/services`).

## H. DOMAIN MODEL
- **User/Actor**: Identity layer.
- **Asset/Batch**: Physical defence assets.
- **Evidence**: Hashes of inspection/quality documents.
- **Certification**: The SBT representation of a verified asset.
- **AuditEvent**: Log of system actions.

## I. CURRENT API
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`
- `GET /api/v1/assets`
- `POST /api/v1/evidence`
- `POST /api/v1/certifications`
- `GET /api/v1/blockchain/status`

## J. CURRENT DATABASE
- SQLite (`dev.db`).
- Tables: `users`, `actors`, `assets`, `batches`, `evidence`, `certifications`, `audit_events`, `lifecycle_events`, `blockchain_transactions`.

## K. CURRENT BLOCKCHAIN
- Hardhat local node.
- HTTP RPC provider (`http://127.0.0.1:8545`).

## L. SMART CONTRACT
- `KavachTrustSBT.sol`: ERC-721 modified to reject standard transfers (`_update` override reverts if `from != address(0)` and `to != address(0)`).

## M. SECURITY STATE
- **Vulnerable**. Secrets are hardcoded in source.
- SQLite is unencrypted.
- Role-Based Access Control (RBAC) is stubbed/missing on backend routes.

## N. TARGET ARCHITECTURE (FROZEN)
- **Runtime**: Node.js + TypeScript
- **Framework**: NestJS
- **ORM/DB**: Prisma + PostgreSQL
- **Blockchain**: Hyperledger Besu (QBFT) + viem
- **Auth**: OIDC + WebAuthn + mTLS + Casbin RBAC/ABAC
- **Storage**: MinIO/S3

## O. CURRENT → TARGET MIGRATION
- The entire backend must be rewritten from FastAPI (Python) to NestJS (TypeScript).
- SQLite schemas must be ported to Prisma schemas.
- Web3.py synchronous calls must become viem calls managed by a Transactional Outbox + Worker.

## P. PRESERVE
- The Domain Field Meanings (Asset Lifecycle states, Evidence structures).
- The SBT concept (Non-transferability logic in the contract).
- The rich Frontend UI layout and component structure.

## Q. REPLACE
- Python FastAPI must be completely replaced by NestJS.
- SQLite must be replaced by PostgreSQL.
- Hardcoded secrets must be replaced by environment variables / secret managers.
- Mock data in the frontend must be replaced by actual API calls to the new NestJS backend.

## R. DO NOT REPEAT
- Do NOT implement synchronous blockchain transactions in HTTP request handlers.
- Do NOT implement fake file storage; use MinIO/S3.
- Do NOT hardcode private keys in the repository.

## S. KNOWN RISKS
- The frontend is deeply coupled to `mockData.ts`. Detaching it to use real APIs will expose significant data structure mismatches.
- Implementing a robust Merkle-tree audit log is complex and entirely missing from the current proof-of-concept.

## T. NEXT AGENT INSTRUCTIONS
You are the new AI Engineering Agent.
1. DO NOT try to "fix" the FastAPI backend. It is legacy.
2. Your primary objective is to build the TARGET architecture (NestJS + Prisma + PostgreSQL).
3. Review this document and the associated forensic artifacts before writing any code.
4. Begin by scaffolding the NestJS application and defining the Prisma schema based on the current Domain Model.
