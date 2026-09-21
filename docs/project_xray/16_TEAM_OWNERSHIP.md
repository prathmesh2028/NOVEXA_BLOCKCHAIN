# 16. Team Ownership & Conflict Map

## 1. Safe Independent Work Zones

### Developer A (Part A Owner) Can Safely Modify:
- `backend/src/identity/**` (Auth, Users, Wallet, DIDs)
- `backend/src/core/casbin/**` (RBAC policy rules)
- `backend/src/notifications/**` (Internal notification persistence and controllers)
- `backend/src/dashboard/**` (Dashboard aggregation logic)
- `backend/src/search/**` (Search indexers)
- `frontend/f1/pages/auth/**`, `pages/users/**`, `pages/roles/**`, `pages/settings/**`

### Developer B (Part B Owner) Can Safely Modify:
- `backend/src/asset-management/**` (Assets, Batches, Lifecycle, Inspections, Approvals, Evidence, Tech Records, Bindings, Audit)
- `backend/src/certification/**` (Passport issuance and queue)
- `backend/src/trust/**` (Outbox, Worker, BlockchainAdapter)
- `backend/src/verification/**` (6-point verification service)
- `contracts/**` (Solidity smart contracts and Hardhat deploy scripts)
- `frontend/f1/pages/assets/**`, `pages/evidence/**`, `pages/certifications/**`, `pages/blockchain/**`, `pages/verification/**`, `pages/audit/**`

---

## 2. High Conflict Files & Shared Touchpoints

These files require explicit coordination because both developers share them:

1. **`backend/prisma/schema.prisma`**:
   - Contains both Part A models (`User`, `UserRole`, `WalletBinding`, `WalletChallenge`) and Part B models (`Asset`, `Evidence`, `Inspection`, `Certification`, `OutboxEvent`).
   - Any migration requires synchronizing schema changes.
2. **`backend/src/app.module.ts`**:
   - Central registry where all feature modules are imported. Changes to module lists cause merge conflicts.
3. **`backend/src/core/common/fallback-data.ts`**:
   - Contains shared demo datasets for users, assets, certifications, and notifications.
4. **`backend/src/notifications/notification.port.ts`**:
   - The contract boundary. Developer A maintains the implementation; Developer B depends on the interface.
5. **`frontend/f1/routes.tsx`**:
   - Central router registering all page components.

---

## 3. Merge Conflict Mitigation Rules

1. **Never edit each other's domain services**: Developer B must inject `NOTIFICATION_PORT`, not `NotificationsService`.
2. **Prisma migrations**: Agree on schema edits before running `prisma migrate dev`.
3. **Keep routes organized**: In `routes.tsx`, group Part A and Part B routes in designated sections.