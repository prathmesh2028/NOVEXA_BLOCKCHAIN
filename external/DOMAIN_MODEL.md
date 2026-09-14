# DOMAIN MODEL MAP

This document maps the business domain concepts from the frontend TypeScript definitions (`src/data/mockData.ts`) to their likely target database and API representations.

## 1. Identity & Auth Domain
### `User`
- **Business Meaning**: The physical person logging into the system.
- **Frontend TS (`User`)**: `id`, `name`, `email`, `role`, `did`, `status`, `identityStatus`, `lastActive`, `createdAt`.
- **Target DB Entity (Prisma)**: `User` table (auth, basic profile).
- **Target API Resource**: `/users`, `/auth`.

### `Actor`
- **Business Meaning**: The cryptographic identity representing the User on the blockchain/system.
- **Frontend TS**: Usually merged into `User` via `did`.
- **Target DB Entity**: `Actor` or `Identity` table linking a `User` to their `did:web`, PKI certs, and `wallet_address`.
- **Target API Resource**: `/actors`, `/identities`.

## 2. Asset & Traceability Domain
### `Asset`
- **Business Meaning**: The physical Defence asset (e.g., Electronic Fuze).
- **Frontend TS (`Asset`)**: `id`, `batchId`, `type`, `model`, `serialNumber`, `lifecycle`, `verification`, `evidenceCount`, `evidenceStatus`, `certStatus`, `certId`, `supplier`, `registeredBy`, `registeredAt`, `updatedAt`, `description`.
- **Target DB Entity**: `Asset` table.
- **Target API Resource**: `/assets`.

### `Batch`
- **Business Meaning**: A production run of assets.
- **Frontend TS**: Referenced via `batchId` string.
- **Target DB Entity**: `Batch` table (1-to-N with Asset).
- **Target API Resource**: `/batches`.

### `LifecycleState` (Enum)
- **Business Meaning**: The physical location and status of the asset in the supply chain.
- **Frontend TS Types**: `UNREGISTERED`, `SUPPLIER_DECLARED`, `RECEIVED`, `INSPECTION_RECORDED`, `ACCEPTED_FOR_ASSEMBLY`, `REJECTED_QUARANTINED`.
- **Target DB Entity**: PostgreSQL `ENUM` type or `LifecycleEvent` append-only table.

## 3. Trust & Verification Domain
### `Evidence`
- **Business Meaning**: Cryptographic proof (hashes of PDFs, images) that an inspection or event occurred.
- **Frontend TS (`Evidence`)**: `id`, `assetId`, `filename`, `type`, `size`, `hash`, `uploadedBy`, `uploadedAt`, `status`.
- **Target DB Entity**: `Evidence` table (contains object storage URL and SHA-256 hash).
- **Target API Resource**: `/evidence`.

### `Certification`
- **Business Meaning**: A non-transferable digital passport (SBT) confirming an asset's provenance.
- **Frontend TS (`Certification`)**: `id`, `assetId`, `batchId`, `issuedBy`, `issuedAt`, `txHash`, `status`, `expiresAt`.
- **Target DB Entity**: `Certification` table (maps DB record to `tokenId` and `txHash`).
- **Target API Resource**: `/certifications`.

## 4. Audit & Transparency Domain
### `AuditEvent`
- **Business Meaning**: Immutable log of who did what, when.
- **Frontend TS (`AuditEvent`)**: `id`, `actor`, `actorDid`, `actorRole`, `action`, `assetId`, `evidenceId`, `certId`, `timestamp`, `result`, `blockchainTx`, `details`.
- **Target DB Entity**: `AuditEvent` table (Must be hash-chained in the Target Architecture).
- **Target API Resource**: `/audit`.

### `BlockchainTx`
- **Business Meaning**: Record of an on-chain event.
- **Frontend TS (`BlockchainTx`)**: `hash`, `network`, `blockNumber`, `status`, `action`, `assetId`, `certId`, `confirmations`, `gasUsed`, `from`, `contractAddress`, `tokenId`, `timestamp`.
- **Target DB Entity**: `BlockchainTransaction` table (Polled and updated via Outbox/Worker).
- **Target API Resource**: `/blockchain/transactions`.
