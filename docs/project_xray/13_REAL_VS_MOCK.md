# 13. Real vs Mock vs Simulated Code Breakdown

## 1. Granular Reality Matrix

| Feature / Subsystem | What is REAL Code | What is MOCK / SIMULATED |
| :--- | :--- | :--- |
| **Authentication** | Real JWT token signing via `@nestjs/jwt`; real bcrypt password hashing; real HTTP Bearer extraction. | In-memory `FALLBACK_USERS` in `core/common/fallback-data.ts` used if DB is offline and `APP_ENV=demo`. |
| **RBAC Authorization** | Real Casbin engine loading rules from `policy.csv`; real `@CasbinPolicy` decorator enforcing path & method rules. | None (Casbin runs fully in memory using the real CSV policy rules). |
| **MetaMask Wallet Binding** | Real cryptographic signature verification using viem's `verifyMessage` against secp256k1 curve. | When DB is offline in demo mode, nonces and bindings are not stored in PostgreSQL. |
| **Asset State Machine** | Real validation logic in `lifecycle.service.ts` checking from/to state transitions against allowed rules. | In demo mode, reads and returns static assets from `fallback-data.ts`. |
| **Evidence Hashing** | Real SHA-256 buffer hashing using Node.js native `crypto.createHash('sha256')`. | None. When files are uploaded, their actual bytes are genuinely hashed. |
| **Evidence Storage** | Real local disk writing in `backend/storage/evidence` using `fs.promises.writeFile`. | When MinIO container is not running, files are stored on local disk instead of S3. |
| **Audit Log Hash Chain** | Real SHA-256 canonical JSON serialization and parent hashing (`previousHash + payloadHash`). | In demo mode, reads static audit events from `fallback-data.ts`. |
| **Merkle Tree Engine** | Real pairwise recursive SHA-256 Merkle root computation in `merkle.service.ts`. | None. Algorithm is fully functional Node.js crypto. |
| **Transactional Outbox** | Real PostgreSQL transactions combining business mutations and outbox rows. Real worker polling loop. | If PostgreSQL is offline, outbox events cannot be persisted. |
| **Blockchain Transactions** | Real contract ABI encoding (`KavachTrustSBT.sol`), real viem client initialization. | Transaction submission returns `0xDEMO-mocktx...` if node is offline in demo mode. |
| **Smart Contract** | Real Solidity 0.8.20 ERC-721 Soulbound Token with EIP-5192 locked status and event emission. | Not deployed to a live testnet in current local environment. |
| **Verification Engine** | Real multi-domain rules evaluating identity, evidence hashes, inspections, and lifecycle states. | If DB is offline in demo mode, synthesizes checks using fallback data. |
| **Supply Chain** | **NOTHING IS REAL**. | Entirely missing; only plain string fields exist on Asset and Batch. |

---

## 2. Summary of Cryptographic Authenticity

- **GENUINE CRYPTOGRAPHY**:
  - SHA-256 hashing of evidence files (`crypto.createHash`).
  - Viem EIP-191 personal signature verification.
  - Audit trail SHA-256 hash chaining.
  - Pairwise Merkle root generation.
- **SIMULATED INFRASTRUCTURE**:
  - Live Besu blockchain execution (simulated via adapter in demo mode).
  - MinIO distributed S3 storage (falls back to local filesystem folder).
  - PostgreSQL database (falls back to in-memory datasets when offline in demo mode).