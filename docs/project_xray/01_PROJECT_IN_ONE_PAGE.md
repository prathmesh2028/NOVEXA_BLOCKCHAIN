# 01. KavachTrust in One Page

## 1. The 60-Second Answer: What is KavachTrust?

1. KavachTrust is a defence asset certification and tracking web application developed for Bharat Electronics Limited (BEL).
2. The frontend is a React + Vite + Tailwind CSS dashboard (`frontend/f1`) where military and technical operators log in.
3. The backend is a NestJS modular monolithic REST API (`backend/src`) running on Node.js.
4. The database is PostgreSQL running via Prisma ORM (`backend/prisma/schema.prisma`) with 17 operational relational models.
5. Operators register critical defence assets (such as an "Electronic Fuze" or "Radar Transmitter") under specific manufacturing batches.
6. Technicians record multi-stage inspections and upload digital evidence files (calibration logs, test sheets, X-ray scans).
7. Evidence files are cryptographically hashed using SHA-256 and stored on MinIO (S3-compatible object storage) or a local filesystem fallback.
8. Multi-stage approvals (QA Review, QC Sign-off, Command Clearance) validate assets before they can be certified.
9. When certified, an asynchronous transactional Outbox pattern queues a minting event to prevent dual-write failures.
10. A background polling worker picks up the outbox event and formats a call to an Ethereum-compatible smart contract (`KavachTrustSBT.sol`).
11. The smart contract mints an ERC-721 Soulbound Token (non-transferable NFT, adhering to IERC5192) locking the asset ID and evidence hash forever.
12. MetaMask wallet integration allows defence officers to cryptographically sign an authentication challenge using their private key to bind their wallet address.
13. Supply Chain (suppliers, facilities, shipments, chain-of-custody transfer events) is currently **NOT IMPLEMENTED**; only basic batch and asset supplier string attributes exist.
14. Anyone with an asset display ID or QR code can run a 6-point cryptographic verification check across identity, evidence, inspection, lifecycle, certification, and blockchain anchors.
15. If external infrastructure (PostgreSQL, MinIO, or the Besu blockchain node) is offline, the backend contains an in-memory `APP_ENV=demo` fallback mode (`fallback-data.ts`) to permit local demonstrations.

---

## 2. Component Status Table

| Component | Exists? | Actually Used? | Real? | Mock/Demo? | Working? | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Frontend (`frontend/f1`)** | YES | YES | YES | Real UI / Mock API fallback when offline | YES | 🟢 Active, served by Vite on port 8443 / 5173 |
| **Frontend (`f2`, `f3`)** | NO | NO | NO | Dead code (removed/cleaned from branch) | N/A | ⚪ Completely absent in current branch |
| **Backend (`backend/src`)** | YES | YES | YES | Has `APP_ENV=demo` fallback | YES | 🟢 Active NestJS API on port 8000 |
| **PostgreSQL** | YES (config) | NO (local runtime) | YES | Fallback to in-memory `fallback-data.ts` | UNVERIFIED | 🟡 Configured via Prisma; requires external PostgreSQL instance |
| **Prisma ORM** | YES | YES | YES | Real client generated (`@prisma/client`) | YES | 🟢 17 models, complete relations, migrations exist |
| **Authentication** | YES | YES | YES | Mock bypass if `APP_ENV=demo` and DB down | YES | 🟢 JWT Bearer token + bcrypt + demo fallback |
| **Authorization (Casbin)** | YES | YES | YES | RBAC rules in `policy.csv` | YES | 🟢 Enforced via `@CasbinPolicy` decorator and CasbinGuard |
| **MetaMask Wallet Binding** | YES | YES | YES | Bypasses challenge persistence in demo | YES | 🟢 Real viem cryptographic `verifyMessage` |
| **Assets Domain** | YES | YES | YES | Fallback assets in demo mode | YES | 🟢 CRUD, serial uniqueness, batch relation |
| **Batch Domain** | YES | YES | YES | Managed inside Prisma & seed | YES | 🟢 Real relation to assets and certifications |
| **Inspections** | YES | YES | YES | Linked to assets & evidence | YES | 🟢 PASS/FAIL/CONDITIONAL results recorded |
| **Approvals** | YES | YES | YES | 4-stage pipeline with role sign-off | YES | 🟢 Injects `NOTIFICATION_PORT` for alerts |
| **Lifecycle State Machine** | YES | YES | YES | 7 states; automated overdue scanner | YES | 🟢 Strict transition validation & audit logging |
| **Evidence Domain** | YES | YES | YES | SHA-256 calculation & versioning | YES | 🟢 Real buffer hashing & integrity check |
| **MinIO Storage** | YES | NO (local runtime) | YES | Local disk fallback (`storage/evidence`) | YES | 🟢 Graceful automatic fallback to disk |
| **Technical Records** | YES | YES | YES | Classified JSON document storage | YES | 🟢 Classification levels (PUBLIC to RESTRICTED) |
| **Physical Bindings** | YES | YES | YES | QR / Data Matrix / RFID / Hardware ID | YES | 🟢 UUID/display mapping with uniqueness |
| **Audit Log (Hash Chain)** | YES | YES | YES | Cryptographic SHA-256 hash chaining | YES | 🟢 Every action writes an AuditEvent with previousHash |
| **Merkle Tree Service** | YES | YES | YES | Real pairwise SHA-256 Merkle root | YES | 🟢 Generates roots for batch audit checkpoints |
| **Certification (Passport)** | YES | YES | YES | Mint request tracking with idempotency | YES | 🟢 Connects asset, batch, evidence hash, and token |
| **Transactional Outbox** | YES | YES | YES | Row-level locking & attempt counting | YES | 🟢 Ensures atomicity between DB and blockchain |
| **Worker Service** | YES | YES | YES | Polls every 5s; handles minting events | YES | 🟢 Idempotent minting via logical lock |
| **Blockchain Adapter** | YES | YES | YES | Returns `0xDEMO-mocktx...` in demo | YES | 🟢 Uses viem; fails cleanly when offline in real mode |
| **Smart Contract (`SBT.sol`)** | YES | UNVERIFIED (node) | YES | Solady/OpenZeppelin ERC721 + IERC5192 | YES | 🟢 Compiled, non-transferable Soulbound Token |
| **Hyperledger Besu / QBFT** | NO (node) | NO | TARGET | Not running in workspace | 🔴 OFFLINE | Target architecture; no local node active |
| **Ethereum Sepolia** | NO (node) | NO | TARGET | Configurable via RPC URL | ⚪ NOT USED | Alternative target network |
| **Supply Chain** | NO | NO | NO | None | 🔴 MISSING | Zero models, zero controllers, zero routes |
| **QR / Data Matrix** | YES | YES | YES | Generated from asset display IDs | YES | 🟢 Client-side SVG rendering & scanner route |
| **Verification Center** | YES | YES | YES | 6-domain comprehensive audit check | YES | 🟢 Evaluates identity, evidence, inspect, cert, chain |
| **Notifications** | YES | YES | YES | Decoupled via `NOTIFICATION_PORT` | YES | 🟢 In-app alerts, unread counts, role targeting |

---

## 3. High-Level Architecture Diagram

```
                              OPERATOR / USER
                                     │
                                     ▼
                   FRONTEND APPLICATION (React + Vite)
                     [frontend/f1 — Port 8443 / 5173]
                                     │
                              REST API calls
                        (Bearer JWT + X-Request-ID)
                                     ▼
                      BACKEND API (NestJS Monolith)
                     [backend/src — Port 8000/api/v1]
        ┌────────────────────────────┴────────────────────────────┐
        ▼                                                         ▼
   [PART A DOMAIN]                                           [PART B DOMAIN]
• Identity & Auth (JWT/Bcrypt)                             • Assets & Batches
• Casbin RBAC (policy.csv)                                 • Inspections & Approvals
• MetaMask Binding (Viem)                                  • Lifecycle State Machine
• In-App Notifications (Port)                              • Evidence & SHA-256 Hashing
• Unified Search & Dashboard                               • Audit Log & Merkle Tree
        │                                                  • Certification Engine
        └────────────────────────────┬────────────────────────────┘
                                     │
                     Prisma ORM Database Client
                                     ▼
                        POSTGRESQL DATABASE (17 Models)
                                     +
                    STORAGE: MinIO / Local Disk Fallback
                                     │
                   DB Transaction creates Outbox Event
                                     ▼
                        TRANSACTIONAL OUTBOX TABLE
                        (status: PENDING, retry < 5)
                                     │
                          Worker Polls Every 5s
                                     ▼
                         BACKGROUND WORKER SERVICE
                                     │
                           viem RPC Client Call
                                     ▼
                        BLOCKCHAIN ADAPTER (Viem)
                                     │
            ┌────────────────────────┴────────────────────────┐
            ▼                                                 ▼
     [REAL BLOCKCHAIN]                                [DEMO MODE / OFFLINE]
   Hyperledger Besu (QBFT)                           Returns simulated hash
   Target RPC: http://localhost:8545                 0xDEMO-mocktx[timestamp]
   Contract: KavachTrustSBT.sol                      (Fails cleanly if real mode)
```