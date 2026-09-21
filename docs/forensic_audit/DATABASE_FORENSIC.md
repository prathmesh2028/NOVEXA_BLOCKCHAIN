# Database Forensics

## Prisma Schema Analysis
- **Source of Truth**: `backend/prisma/schema.prisma`
- **Implemented Models**: `User`, `Asset`, `Batch`, `Evidence`, `Certification`, `BlockchainTransaction`, `OutboxEvent`, `WalletBinding`, `WalletChallenge`.
- **Missing Models**: `Supplier`, `Facility`, `Shipment`, `CustodyTransfer`, `SupplyChainEvent`.

## Demo Mode Bypass
If `APP_ENV=demo` is set, the backend catches Prisma errors and serves data from `backend/src/core/common/fallback-data.ts`.
