# 02. Current Repository Structure

## 1. Actual Repository File Tree (Grouped Logically)

```
NOVEXA_BLOCKCHAIN/
├── .figma/                     # Figma Make integration metadata
├── contracts/                  # Hardhat Solidity smart contract project
│   ├── contracts/
│   │   ├── IERC5192.sol        # EIP-5192 Minimal Soulbound Token interface
│   │   └── KavachTrustSBT.sol  # Non-transferable ERC-721 Defence Certification contract
│   ├── hardhat.config.ts       # Hardhat configuration (Solidity 0.8.20)
│   ├── package.json            # Contract project dependencies (OpenZeppelin, Hardhat)
│   └── test/                   # Hardhat test suite
│
├── frontend/                   # Frontend applications root
│   ├── main.tsx                # Single re-export proxy: `import './f1/main';`
│   └── f1/                     # THE ONLY ACTIVE FRONTEND APPLICATION
│       ├── App.tsx             # Root component with Providers
│       ├── main.tsx            # React 19 entrypoint mounting #root
│       ├── routes.tsx          # React Router v7 route definitions (27 routes)
│       ├── index.css           # Global Tailwind CSS and design system variables
│       ├── components/         # Shared UI components (layout, nav, modals, tables)
│       │   ├── layout/         # AppShell, Navbar, Sidebar
│       │   └── common/         # StatusBadge, Modal, EmptyState, DataTable
│       ├── context/            # Global state (AuthContext, WalletContext)
│       ├── features/           # Feature components (wallet binding modal, QR generator)
│       ├── pages/              # 21 Page views (dashboard, assets, certifications, etc.)
│       └── services/           # Typed API clients calling http://localhost:8000/api/v1
│
├── backend/                    # NestJS Backend API (Monolithic Modular Architecture)
│   ├── prisma/
│   │   ├── schema.prisma       # 17 Relational Models, Enums, and Mapping
│   │   └── seed.ts             # Comprehensive database seeder with realistic defence data
│   ├── storage/evidence/       # Local disk filesystem storage (automatic MinIO fallback)
│   ├── src/
│   │   ├── main.ts             # Application bootstrap, Swagger setup, CORS, Helmet
│   │   ├── app.module.ts       # Root module importing all 18 feature modules
│   │   ├── core/               # Shared kernel infra
│   │   │   ├── config/         # ConfigService, Zod env validation
│   │   │   ├── database/       # PrismaService, PrismaModule
│   │   │   ├── casbin/         # RBAC policy enforcement (policy.csv)
│   │   │   ├── common/         # fallback-data.ts (in-memory demo dataset)
│   │   │   └── middleware/     # RequestIdMiddleware (UUID tracking)
│   │   ├── identity/           # [PART A] Authentication, Users, Wallet, DIDs
│   │   │   ├── auth/           # JWT strategy, login, logout, password change
│   │   │   ├── users/          # User management, role assignment
│   │   │   └── wallet/         # MetaMask challenge generation & viem verifyMessage
│   │   ├── notifications/      # [PART A] In-app alerts and decoupled NotificationPort
│   │   ├── dashboard/          # [PART A] Aggregated metrics and system summary
│   │   ├── search/             # [PART A] Global multi-entity search endpoint
│   │   ├── asset-management/   # [PART B] Core physical asset tracking
│   │   │   ├── assets/         # Asset CRUD, serial uniqueness, batch linking
│   │   │   ├── approvals/      # 4-stage QA/QC/Command approval pipeline
│   │   │   ├── lifecycle/      # 7-state lifecycle machine & automated overdue scanner
│   │   │   ├── inspections/    # Technician inspection records (PASS/FAIL)
│   │   │   ├── evidence/       # File upload, SHA-256 hashing, MinIO/Disk storage
│   │   │   ├── technical-records/# Classified engineering records (PUBLIC -> RESTRICTED)
│   │   │   ├── physical-bindings/# QR/Data Matrix/RFID hardware binding
│   │   │   └── audit/          # Hash-chained AuditEvent log & MerkleService
│   │   ├── certification/      # [PART B] Passport issuance & verification
│   │   ├── trust/              # [PART B] Blockchain and Async Dispatch
│   │   │   ├── outbox/         # PostgreSQL Transactional Outbox + Polling Worker
│   │   │   └── blockchain/     # BlockchainAdapter (viem) & transaction tracking
│   │   └── verification/       # [PART B] 6-domain public verification engine
│   └── package.json            # Backend dependencies (NestJS 11, Prisma 6, Viem 2)
│
├── docs/                       # Project documentation & audit reports
│   └── project_xray/           # THIS COMPREHENSIVE REPOSITORY X-RAY AUDIT
├── index.html                  # Root Vite HTML shell pointing to /frontend/f1/main.tsx
├── vite.config.ts              # Root Vite config configured with '@' -> 'frontend/f1'
├── docker-compose.yml          # Infrastructure orchestration (Postgres, MinIO, Besu)
└── package.json                # Root package workspace scripts
```

---

## 2. Architectural Role Breakdown

### WHAT THE USER SEES
The operator sees a single-page defence portal styled in dark tactical theme (slate/navy/amber).
- Top navigation shows active role badge (`ADMIN`, `TECHNICIAN`, `NFT_CREATOR`, `AUDITOR`), wallet binding indicator, unread notifications bell, and global search bar.
- Sidebar provides quick access to Dashboard, Assets Registry, Batch Explorer, Evidence Vault, Lifecycle Management, Approvals Inbox, Certifications Queue, Blockchain Ledger, Audit Trail, and Verification Center.

### WHAT THE FRONTEND DOES
- Manages routing via React Router v7 in `frontend/f1/routes.tsx`.
- Intercepts API requests in `frontend/f1/services/api.ts` to inject the JWT `Bearer` token stored in `localStorage`.
- Connects to browser MetaMask extension via `window.ethereum` in `WalletContext.tsx`.
- Renders client-side QR codes for physical defence components.
- Handles optimistic UI updates and displays cryptographic verification badges.

### WHAT THE BACKEND DOES
- Validates all incoming payloads using Zod / NestJS class-validators.
- Checks user identity via JWT passport strategy and evaluates endpoint authorization against Casbin RBAC policies (`policy.csv`).
- Enforces state transition legality (e.g. preventing an uninspected asset from becoming `ACCEPTED_FOR_ASSEMBLY`).
- Computes SHA-256 checksums of all uploaded binary evidence.
- Writes immutable, hash-chained `AuditEvent` rows with `previousHash` linking.
- Commits business records and Outbox events together in atomic database transactions.

### WHAT THE DATABASE DOES
- Persists 17 distinct relational tables in PostgreSQL via Prisma ORM.
- Enforces relational foreign keys (e.g. Asset belongs to Batch; Evidence belongs to Asset).
- Maintains strict uniqueness constraints (unique serial numbers, unique display IDs, unique nonces, unique transaction idempotency keys).
- Acts as the transactional persistence medium for Outbox events.

### WHAT THE BLOCKCHAIN LAYER DOES
- Serves as the ultimate tamper-proof anchor for defence certifications.
- Implements an ERC-721 Soulbound Token (`KavachTrustSBT.sol`) where token transfer between non-zero addresses is disabled by reverting in `_update`.
- Records on-chain mapping of `tokenId => { assetId, batchId, evidenceHash, issuedAt }`.
- Fires `CertificationMinted` and `Locked` events when minted.
- When live node is absent, adapter simulates transactions in demo mode or fails loudly in production mode.

### WHAT SUPPORTING INFRASTRUCTURE DOES
- **MinIO**: Object storage for large binary inspection files and evidence.
- **Local Disk (`storage/evidence`)**: Automatic, built-in fallback directory when MinIO container is offline.
- **Docker Compose**: Prepares multi-container stack for PostgreSQL (5432), MinIO (9000), and Hyperledger Besu (8545).