# 19. Final Project X-Ray Synthesis

## 1. Executive Summary: What We Have

KavachTrust is an enterprise-grade digital asset trust platform designed for Bharat Electronics Limited (BEL).
The repository contains:
1. A fully structured **React 19 single-page dashboard** (`frontend/f1`) with 21 screens, dark-mode styling, and role-based navigation.
2. A robust **NestJS modular backend** (`backend/src`) featuring 18 feature modules, Casbin RBAC, JWT authentication, and transactional outbox.
3. A comprehensive **Prisma ORM schema** (`schema.prisma`) defining 17 relational tables for defence assets, inspections, approvals, evidence, and audit logs.
4. A compiled **Solidity Soulbound Token contract** (`KavachTrustSBT.sol`) enforcing non-transferable ERC-721 defence certifications.
5. Real cryptographic implementations: viem signature verification, SHA-256 evidence hashing, and tamper-evident audit hash-chaining with Merkle checkpoints.

---

## 2. What Actually Works

- **Authentication & Roles**: Users can authenticate, receive signed JWTs, and have their permissions enforced against `policy.csv`.
- **MetaMask Cryptographic Binding**: Officers can sign an EIP-191 challenge and cryptographically prove ownership of their Ethereum address.
- **Asset Lifecycle Management**: Assets are registered with unique serial numbers, allocated to batches, and stepped through a 7-stage compliance machine.
- **Inspection & Evidence Integrity**: Files uploaded have their exact SHA-256 hashes recorded, and files are stored safely on disk if MinIO is absent.
- **Transactional Outbox Engine**: Certification issuance and outbox event creation execute in atomic transactions, and a 5-second polling worker claims and processes tasks with duplicate prevention.
- **6-Domain Verification**: Any asset can be publicly audited across identity, evidence, inspection, lifecycle, certification, and blockchain anchors.

---

## 3. What is Only Demo / Mock

- **Database Fallback**: When PostgreSQL is not running and `APP_ENV=demo`, the backend returns static mock data from `fallback-data.ts`.
- **Blockchain Execution**: Because no local Besu/QBFT node is running in this environment, blockchain transactions return a simulated `0xDEMO-mocktx...` hash when demo mode is active.
- **MinIO Storage**: Because no MinIO container is running, files are stored on local disk in `storage/evidence/`.

---

## 4. What is Missing

1. **SUPPLY CHAIN DOMAIN**: Completely missing. There are no models, services, controllers, or UI screens for Suppliers, Facilities, Shipments, or Custody Transfers.
2. **LIVE BLOCKCHAIN NODE**: Hyperledger Besu container is not running locally.
3. **PRODUCTION SECRET MANAGEMENT**: JWT secrets and private keys are currently hardcoded in `.env`.

---

## 5. What is Broken or Misleading

- **Misleading Supply Chain Claims**: Past documentation claimed Supply Chain was partially done. Code proves it is 0% implemented.
- **Demo Mode Infiltration**: In demo mode, authentication bypasses password checks and blockchain transactions fake confirmation. This must be strictly disabled in production.

---

## 6. What Blockchain Really Does

The blockchain serves as a **permanent, immutable witness**. It does not store large files or daily asset updates. Instead, it records:
- Token ID
- Asset Display ID
- Batch ID
- SHA-256 Hash of the final inspection evidence
- Issuing officer timestamp

Because the token is an EIP-5192 Soulbound Token, it cannot be transferred, sold, or stolen.

---

## 7. What MetaMask Really Does

MetaMask provides **cryptographic non-repudiation** for military officers. When an officer binds a wallet or approves an asset, they sign a message using their private key. The backend verifies the signature with viem. This proves mathematically that a specific officer authorized the action.

---

## 8. What Supply Chain Really Is Right Now

Right now, Supply Chain is literally just a string attribute called `supplier` on the `Asset` and `Batch` tables. Nothing else exists.

---

## 9. How the Whole System Connects

```
[Officer / Technician]
         │
         ▼
[Frontend: frontend/f1] ───(JWT Bearer)───► [Backend: NestJS on :8000]
                                                  │
                            ┌─────────────────────┴─────────────────────┐
                            ▼                                           ▼
                   [PostgreSQL DB]                              [MinIO / Local Disk]
               (17 Relational Tables)                           (storage/evidence)
                            │
                            ▼
                    [outbox_events Table]
                            │
                            ▼
                  [WorkerService (5s poll)]
                            │
                            ▼
                  [BlockchainAdapter (viem)]
                            │
                            ▼
               [Hyperledger Besu (KavachTrustSBT.sol)]
```

---

## 10. Dependency-Based Next Steps

1. **Step 1: Deploy External Infrastructure**: Start PostgreSQL, MinIO, and Hyperledger Besu containers via `docker-compose.yml`.
2. **Step 2: Disable Demo Mode**: Set `APP_ENV=development` and verify that the app connects to the real PostgreSQL database and MinIO.
3. **Step 3: Deploy Smart Contract to Besu**: Run Hardhat deploy script to deploy `KavachTrustSBT.sol` to the local Besu node and update `CONTRACT_ADDRESS` in `.env`.
4. **Step 4: Design & Implement Supply Chain**: If required by the hackathon rubric, build the missing models (`Supplier`, `Facility`, `Shipment`, `CustodyTransfer`) in Part B.