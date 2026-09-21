# 06. Database Architecture Explained

## 1. Schema Overview

The database layer is managed by Prisma ORM connected to PostgreSQL (`backend/prisma/schema.prisma`). It defines **17 relational models** across 7 domain modules.

---

## 2. Comprehensive Model Catalog

| Model Name | Table Name | Purpose & Data Stored | Primary Relations | Primary Users / Services |
| :--- | :--- | :--- | :--- | :--- |
| **`User`** | `users` | System user credentials, email, passwordHash, status (`ACTIVE`, `DISABLED`, `PENDING`), lastActive | `UserRole`, `Actor`, `WalletBinding`, `WalletChallenge`, `AuditEvent` | `AuthService`, `UsersService` |
| **`UserRole`** | `user_roles` | Role mapping table (`ADMIN`, `NFT_CREATOR`, `TECHNICIAN`, `AUDITOR`) | `User` | `AuthService`, `CasbinService` |
| **`Actor`** | `actors` | Decentralized Identity (DID) profile, public key, DID string | `User`, `DIDDocument`, `Credential` | `IdentityService`, `UsersService` |
| **`DIDDocument`** | `did_documents` | W3C compliant DID document JSON payload | `Actor` | `IdentityService` |
| **`Credential`** | `credentials` | Verifiable Credential JSON payload, issuer, subject, validity period | `Actor` | `IdentityService` |
| **`Batch`** | `batches` | Manufacturing lot/batch display ID (`EF-BATCH-2026-017`), supplier, receivedAt | `Asset[]`, `Certification[]` | `AssetsService`, `CertificationsService` |
| **`Asset`** | `assets` | Physical defence equipment record, display ID (`EF-2026-00421`), serialNumber, model, lifecycleState, certStatus | `Batch`, `Evidence[]`, `Inspection[]`, `Approval[]`, `Certification[]`, `TechnicalRecord[]` | `AssetsService`, `LifecycleService` |
| **`PhysicalBinding`**| `physical_bindings` | Links physical identifiers (QR, Data Matrix, RFID, Hardware MAC) to an asset | `Asset` | `PhysicalBindingsService` |
| **`TechnicalRecord`**| `technical_records` | Classified engineering specifications, schematics, telemetry JSON | `Asset` | `TechnicalRecordsService` |
| **`Evidence`** | `evidence` | Uploaded document metadata, SHA-256 hash, objectKey (MinIO path), file size, MIME type | `Asset`, `EvidenceVersion[]` | `EvidenceService`, `MinioService` |
| **`EvidenceVersion`**| `evidence_versions`| Immutable historical version tracking of evidence files and previous hashes | `Evidence` | `EvidenceService` |
| **`Inspection`** | `inspections` | Quality check evaluation (PASS, FAIL, CONDITIONAL), inspector ID, attached evidence IDs | `Asset` | `InspectionsService` |
| **`LifecycleEvent`**| `lifecycle_events` | Immutable log of state transitions (e.g. `SUPPLIER_DECLARED` -> `RECEIVED`), idempotencyKey | `Asset` | `LifecycleService` |
| **`ExpectedTransition`**| `expected_transitions`| Hardcoded compliance state machine transition rules and required permissions | None (static reference) | `LifecycleService` (via seed) |
| **`Certification`** | `certifications` | Digital Product Passport record, certId (`CERT-2026-00089`), status (`CONFIRMED`, `PENDING`), txHash, tokenId | `Asset`, `Batch` | `CertificationsService`, `WorkerService` |
| **`BlockchainTransaction`**| `blockchain_transactions`| Full audit log of submitted on-chain transactions, gasUsed, confirmations, receipt status | `Asset?` | `BlockchainService`, `WorkerService` |
| **`BlockchainVerification`**| `blockchain_verifications`| Record of verification checks performed on specific txHashes and tokens | None | `VerificationService` |
| **`AuditEvent`** | `audit_events` | Append-only cryptographically chained event log (`payloadHash`, `previousHash`), requestId | `User?` | `AuditService` |
| **`Checkpoint`** | `checkpoints` | Periodic Merkle root snapshot over a range of audit events | None | `AuditService`, `MerkleService` |
| **`OutboxEvent`** | `outbox_events` | Guaranteed event dispatch table (status: `PENDING`, `CLAIMED`, `COMPLETED`, `FAILED`), attemptCount | None | `OutboxService`, `WorkerService` |
| **`WalletBinding`** | `wallet_bindings` | Cryptographically verified mapping between a User ID and an Ethereum address | `User` | `WalletService` |
| **`WalletChallenge`**| `wallet_challenges`| Single-use cryptographic nonce with 5-minute expiry for MetaMask signature verification | `User` | `WalletService` |
| **`Notification`** | `notifications` | In-app alerts, read status, severity (`INFO`, `WARNING`, `CRITICAL`), target role/user | None | `NotificationsService` |

---

## 3. What Information is Stored in PostgreSQL?

1. **User Identity & Security**: Password hashes (bcrypt), user roles, wallet bindings, active cryptographic nonces.
2. **Asset Registry & Traceability**: Physical identifiers, serial numbers, models, operational states, batch associations.
3. **Quality & Compliance History**: Inspection records, evidence metadata and cryptographic hashes, multi-stage approval signatures.
4. **Blockchain State Reflections**: Transaction hashes, minted Soulbound Token IDs, block numbers, gas usage, confirmation counters.
5. **System Assurance & Integrity**: The complete, append-only hash chain of all system activity (`AuditEvent` table) and Merkle checkpoints.
6. **Async Job Queue**: The `OutboxEvent` table acting as an ACID-compliant job queue.