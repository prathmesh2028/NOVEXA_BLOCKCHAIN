# 04. Backend Architecture Explained

## 1. NestJS Modular Monolith Architecture

The backend is organized as a clean modular monolith in `backend/src`.

```
main.ts
  │
  ▼
AppModule (app.module.ts)
  │
  ├── Core Infra Modules
  │     ├── ConfigModule (Zod env validation)
  │     ├── PrismaModule (Database connection & ORM)
  │     ├── CasbinModule (RBAC policy enforcement via policy.csv)
  │     └── HealthModule (Liveness & readiness probes)
  │
  ├── Identity & Access Modules [PART A]
  │     ├── AuthModule (JWT login, bcrypt, Passport strategy)
  │     ├── UsersModule (User CRUD & role assignment)
  │     └── WalletModule (MetaMask challenge & viem verifyMessage)
  │
  ├── Platform Support Modules [PART A]
  │     ├── DashboardModule (Aggregated metrics & summary)
  │     ├── SearchModule (Cross-entity search)
  │     └── NotificationsModule (In-app alerts & NOTIFICATION_PORT)
  │
  ├── Asset Management Modules [PART B]
  │     ├── AssetsModule (Asset lifecycle & batch management)
  │     ├── InspectionsModule (Technician inspection records)
  │     ├── ApprovalsModule (4-stage multi-role sign-off pipeline)
  │     ├── LifecycleModule (State machine & automated overdue scanner)
  │     ├── EvidenceModule (File upload, SHA-256, MinIO/Disk storage)
  │     ├── TechnicalRecordsModule (Classified engineering specifications)
  │     ├── PhysicalBindingsModule (Hardware identifiers & QR codes)
  │     └── AuditModule (Hash-chained audit log & MerkleService)
  │
  ├── Trust & Blockchain Modules [PART B]
  │     ├── CertificationsModule (Passport creation & queue management)
  │     ├── OutboxModule (PostgreSQL transactional outbox table)
  │     ├── WorkerModule / WorkerService (Background polling & dispatch)
  │     └── BlockchainModule (BlockchainAdapter viem integration)
  │
  └── Verification Module [PART B]
        └── VerificationModule (6-point public integrity verification)
```

---

## 2. Module Directory Guide (1-2 Sentences Each)

1. **`core/config`**: Loads environment variables from `.env` and validates them strictly using Zod schemas to ensure valid ports, secrets, and URLs.
2. **`core/database`**: Manages the singleton `PrismaService` connection pool to PostgreSQL with connection retry and graceful shutdown.
3. **`core/casbin`**: Enforces attribute and role-based access control rules loaded from `policy.csv` using Casbin enforcer.
4. **`core/common`**: Provides `fallback-data.ts`, an in-memory repository of demo users, assets, and certifications used when PostgreSQL is offline.
5. **`identity/auth`**: Issues signed JWT tokens on login, validates password hashes with bcrypt, and provides authentication guards.
6. **`identity/users`**: Handles user profile retrieval, directory listings, and administrative role grants.
7. **`identity/wallet`**: Generates single-use nonces and verifies EIP-191 personal signatures from MetaMask via viem.
8. **`notifications`**: Stores in-app alerts and provides the decoupled `NOTIFICATION_PORT` for domain services.
9. **`dashboard`**: Aggregates counts of assets, certifications, pending approvals, and active alerts into a single summary payload.
10. **`search`**: Executes indexed fuzzy queries across assets, serial numbers, certifications, and audit events.
11. **`asset-management/assets`**: Handles asset lifecycle registration, serial number uniqueness, and batch linkage.
12. **`asset-management/inspections`**: Stores technician quality evaluations (PASS, FAIL, CONDITIONAL) and attaches supporting evidence.
13. **`asset-management/approvals`**: Tracks multi-step officer sign-offs (QA, QC, Command) required before asset assembly or certification.
14. **`asset-management/lifecycle`**: Enforces strict state transitions according to defence compliance rules and scans periodically for overdue inspections.
15. **`asset-management/evidence`**: Hashes uploaded binary files with SHA-256, tracks versions, and stores files in MinIO or local disk.
16. **`asset-management/technical-records`**: Manages classified technical specifications (PUBLIC, INTERNAL, SENSITIVE, RESTRICTED) for defence equipment.
17. **`asset-management/physical-bindings`**: Associates assets with physical identifiers like QR codes, Data Matrix codes, and RFID tags.
18. **`asset-management/audit`**: Maintains a tamper-evident SHA-256 hash-chained log of every system mutation and computes Merkle roots.
19. **`certification/certifications`**: Issues Digital Product Passports and queues them for smart contract minting.
20. **`trust/outbox`**: Implements the Transactional Outbox pattern to ensure guaranteed event delivery without distributed transactions.
21. **`trust/blockchain`**: Houses the viem `BlockchainAdapter`, managing contract interactions, wallet accounts, and receipt decoding.
22. **`verification`**: Aggregates integrity checks across six distinct domains into a unified verification report for any asset.