# KavachTrust — Backend API & Services

[![NestJS](https://img.shields.io/badge/NestJS-10.x-E0234E?style=flat-square&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=flat-square&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![MinIO](https://img.shields.io/badge/MinIO-S3_Storage-C72C48?style=flat-square&logo=minio&logoColor=white)](https://min.io/)
[![Security](https://img.shields.io/badge/Security-Casbin_RBAC%20%2B%20JWT-informational?style=flat-square)](../SECURITY.md)

The **KavachTrust Backend** is an enterprise-grade, defense-compliant REST API service built with **NestJS**, **Prisma ORM**, and **PostgreSQL**. It delivers high-assurance asset lifecycle enforcement, cryptographic audit trails, Merkle tree checkpoints, MinIO-backed evidence vaults, and transactional outbox integration with the Hyperledger Besu private EVM network.

---

## Architecture Overview

```
Frontend Web Client (React 19 / Viem)
       │  HTTP / REST (TLS 1.3)
       ▼
  NestJS API Gateway
 ┌─────────────────────────────────────────────────────────────┐
 │  Middleware & Interceptors:                                 │
 │    • RequestIdMiddleware (UUID tracking & log correlation)  │
 │    • Helmet Security Headers & Strict CORS                  │
 │    • Global ValidationPipe (DTO whitelist & type coercion)  │
 │    • JwtAuthGuard (Stateless Bearer token validation)       │
 │    • CasbinRbacGuard (Attribute & Role-Based Access)        │
 ├─────────────────────────────────────────────────────────────┤
 │  Core Domain Modules:                                       │
 │    • Identity & Auth (bcrypt, JWT, DID/VC, Wallet Binding)  │
 │    • Asset Management (Serial numbers, Batches, Bindings)   │
 │    • Evidence Vault (SHA-256 integrity, MinIO S3 engine)   │
 │    • Lifecycle State Machine (Transition invariants)        │
 │    • QA Inspections (Pass/fail gating, checklists)          │
 │    • Trust & Audit (Sequential SHA-256 hash chaining)       │
 │    • Merkle Service (Deterministic pair-hashing & proofs)   │
 │    • Certification Engine (Idempotent Soulbound minting)    │
 │    • Supply Chain (Facilities, lots, custody transfers)     │
 │    • Cross-Domain Verification (Multi-tier compliance check)│
 │    • Outbox Relayer Worker (Reliable blockchain dispatcher) │
 │    • Search & Dashboard Analytics                           │
 └──────────────────────────────┬──────────────────────────────┘
                                │
               ┌────────────────┴────────────────┐
               ▼                                 ▼
      PostgreSQL Database            MinIO Object Storage
    (Prisma ORM, Audit Chain)       (Evidence Blobs & Reports)
               │
               ▼
    Transactional Outbox Worker
               │ EIP-155 JSON-RPC
               ▼
     Hyperledger Besu (EVM)
   (KavachTrustSBT Soulbound)
```

---

## Directory Layout

```
backend/
├── prisma/
│   ├── schema.prisma            # Comprehensive PostgreSQL domain schema
│   ├── migrations/              # Database migration history
│   └── seed.ts                  # Reference data seeder (users, roles, components)
├── src/
│   ├── app.module.ts            # Root module registering domain subsystems
│   ├── main.ts                  # NestJS bootstrap, Helmet, Pipes, Swagger
│   ├── asset-management/        # Assets, Batches, Physical Bindings, Records
│   ├── certification/           # Digital asset passports, SBT minting logic
│   ├── core/                    # Config, Prisma service, Casbin RBAC, Guards
│   ├── dashboard/               # Operational analytics and metrics endpoints
│   ├── health/                  # Terminus liveness and readiness probes
│   ├── identity/                # Authentication, DID docs, W3C credentials
│   ├── notifications/           # System alerts and critical notification feeds
│   ├── search/                  # Cross-entity unified search engine
│   ├── supply-chain/            # Suppliers, facilities, lots, shipments, custody
│   ├── trust/                   # Audit hash chains, Merkle trees, Outbox worker
│   └── verification/            # Holistic cross-domain verification engine
├── docs/                        # Architectural specifications and API notes
├── test/                        # Integration and end-to-end test suites
└── vitest.config.ts             # Vitest test configuration
```

---

## Prerequisites

- **Node.js**: `>= 20.0.0`
- **pnpm**: `>= 9.0.0`
- **Docker & Docker Compose**: (for local PostgreSQL, MinIO, and Besu)

---

## Quick Start

### 1. Environment Configuration
Copy the sample configuration file and configure credentials:
```bash
cp .env.example .env
```

Key environment settings:
```ini
PORT=3001
NODE_ENV=development
DATABASE_URL=postgresql://kavach:kavach_dev_2026@localhost:5432/kavachtrust?schema=public
JWT_SECRET=your_secure_development_jwt_secret_here
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ACCESS_KEY=kavach_minio_dev
MINIO_SECRET_KEY=kavach_minio_secret_dev
MINIO_BUCKET_NAME=kavachtrust-evidence
BLOCKCHAIN_RPC_URL=http://localhost:8545
SBT_CONTRACT_ADDRESS=0x...
```

### 2. Start Supporting Infrastructure
From the repository root:
```bash
docker compose up -d
```

### 3. Apply Migrations & Seed Data
```bash
pnpm prisma:generate
pnpm prisma:migrate:deploy
pnpm prisma:seed
```

### 4. Run Development Server
```bash
# Type check code
pnpm typecheck

# Start development server with hot-reload
pnpm start:dev
```
The API listens on **`http://localhost:3001`**. In development mode, the interactive Swagger documentation is available at **`http://localhost:3001/docs`**.

---

## Role-Based Access Control (Casbin RBAC)

KavachTrust strictly enforces least-privilege role separation:

| Role | Domain Scope & Permissions |
| :--- | :--- |
| **`SYSTEM_ADMIN`** | Platform administration, user provisioning, role assignments, system-level audits. |
| **`PROCUREMENT_SUPPLY_CHAIN_OFFICER`** | Supplier declaration, receiving shipments, lot tracking, custody handoff verification. |
| **`QUALITY_INSPECTOR`** | Physical & technical asset inspections, QA checklist logging, pass/fail gating, SBT clearance. |
| **`AUDITOR`** | Read-only compliance review, cryptographic hash chain inspection, Merkle proof evaluation. |

---

## Key REST API Endpoints

| Method | Route | Description | Required Role |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Authenticate user & issue JWT | Public |
| `GET` | `/api/auth/me` | Fetch active user profile & roles | Authenticated |
| `GET` | `/api/assets` | Query paginated asset catalog | Authenticated |
| `POST` | `/api/assets` | Register a new defense asset | Admin / Inspector |
| `POST` | `/api/evidence/upload` | Upload & SHA-256 hash evidence file | Authorized roles |
| `POST` | `/api/lifecycle/transition`| Execute validated lifecycle transition | Role-gated |
| `POST` | `/api/inspections` | Record technical QA inspection | Quality Inspector |
| `GET` | `/api/audit` | Fetch paginated audit event trail | Admin / Auditor |
| `GET` | `/api/audit/verify` | Verify unbroken cryptographic hash chain | Admin / Auditor |
| `POST` | `/api/certifications/mint` | Idempotent digital passport minting | Inspector / Admin |
| `GET` | `/api/verification/:assetId` | Cross-domain verification inspection | All Authenticated |
| `GET` | `/api/supply-chain/summary`| Fetch supply chain metrics & shipments | Supply Chain / Admin |
| `GET` | `/api/search` | Unified multi-domain search | All Authenticated |
| `GET` | `/health` | Service liveness & database readiness | Public |

---

## Cryptographic Guarantees

1. **Hash Chain Integrity**: Every audit event links to the preceding event's hash (`previousHash`). Any direct tampering with PostgreSQL records invalidates all subsequent hashes.
2. **Deterministic Merkle Roots**: Periodic checkpoints bundle audit blocks into a cryptographic root verifiable against zero-knowledge or on-chain anchors.
3. **Transactional Outbox**: Blockchain state updates are written atomically to PostgreSQL first within an outbox table. A resilient background worker pushes events to Hyperledger Besu with exponential backoff and idempotency protection.

---

## Testing & Verification

Run the automated test suites using Vitest:
```bash
# Run unit & module tests
pnpm test

# Run tests with code coverage report
pnpm test:cov
```
Test suites validate:
- Hash chain genesis, continuity, and tamper detection (`trust/audit`)
- Deterministic Merkle pair hashing and proof verification (`trust/merkle`)
- Lifecycle state transitions and permission gating (`asset-management/lifecycle`)
- Multi-tier cross-domain verification logic (`verification`)
