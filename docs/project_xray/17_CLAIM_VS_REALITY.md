# 17. Claims vs Reality

| System Claim | Actual Code Reality | Verified Status | Concrete Evidence |
| :--- | :--- | :--- | :--- |
| **"Blockchain is Integrated"** | Smart contract and viem adapter are fully written; but no local Besu node is running. Runs in simulated mode when offline in demo. | 🟡 PARTIALLY TRUE | `BlockchainAdapter.submitTransaction` in `backend/src/trust/blockchain/blockchain.adapter.ts`. |
| **"MetaMask is Verified"** | Real cryptographic verification using viem's `verifyMessage` with challenge-response nonces. Bypasses DB in demo mode. | 🟢 VERIFIED | `WalletService.verifySignatureAndBind` in `backend/src/identity/wallet/wallet.service.ts` line 76. |
| **"Supply Chain is Implemented"** | Zero supply chain models, services, or routes exist. Only `supplier` string fields on Asset and Batch. | 🔴 COMPLETELY FALSE | Complete absence of `Supplier`, `Facility`, `Shipment`, `CustodyTransfer` in `schema.prisma`. |
| **"Worker is Idempotent"** | Worker uses logical DB locks (`MINT:<certId>`) and row-level locking on outbox claims. | 🟢 VERIFIED | Unique constraint on `BlockchainTransaction.idempotencyKey` in `worker.service.ts` line 198. |
| **"Evidence Stored on MinIO"** | Code integrates MinIO client, but gracefully falls back to local disk (`storage/evidence`) when MinIO is down. | 🟢 VERIFIED | `MinioService.uploadFile` in `backend/src/asset-management/evidence/minio.service.ts` line 50. |
| **"NFT Minting Works"** | Solidity ERC-721 contract is compiled and ready; worker logic formats mint transactions. Fails cleanly if node is offline. | 🟡 PARTIALLY TRUE | Ready in code, but requires live Besu node to execute on-chain. |
| **"Verification Works"** | 6-domain audit check evaluates identity, evidence, inspection, lifecycle, and certification. | 🟢 VERIFIED | `VerificationService.verifyAsset` in `backend/src/verification/verification.service.ts`. |
| **"Production Ready"** | Core application logic is solid, but relies on hardcoded `.env` secrets and demo mode fallbacks when DB/node are offline. | 🟡 NOT PRODUCTION READY | Requires real external PostgreSQL, MinIO, and Besu nodes + secret management. |