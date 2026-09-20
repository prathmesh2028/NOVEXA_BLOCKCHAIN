# 05. Part A vs Part B Ownership Boundaries

## 1. Defined Boundaries

The project architecture divides ownership between two functional partitions:

### PART A: Platform Core, Identity, Access & Platform Infrastructure
- **Identity & Authentication**: User login, JWT token lifecycle, bcrypt hashing, password change (`identity/auth`).
- **User Management**: User profiles, directory listings, role assignments (`identity/users`).
- **Authorization Infrastructure**: Casbin RBAC engine, `policy.csv`, `@CasbinPolicy` decorator, `CasbinGuard` (`core/casbin`).
- **MetaMask Wallet Binding**: Challenge generation, nonce validation, viem signature verification (`identity/wallet`).
- **Notifications Infrastructure**: Notification data model, notifications controller, notification delivery engine (`notifications/notifications.service.ts`).
- **Shared Platform UI & Services**: Universal search service (`search`), Dashboard summary aggregation (`dashboard`), Health checks (`health`).
- **Core Infrastructure Kernel**: Zod environment validation (`core/config`), Request ID middleware (`core/middleware`), Prisma service wrapper (`core/database`).

### PART B: Defence Asset Domain, Trust, Certification & Verification
- **Asset Lifecycle**: Asset registration, batch allocation, serial number indexing (`asset-management/assets`).
- **Inspections & Quality**: Quality evaluation records, technician sign-offs (`asset-management/inspections`).
- **Approvals Pipeline**: Multi-stage approval requests and officer decisions (`asset-management/approvals`).
- **Lifecycle State Machine**: Enforcing legal state transitions, automated overdue inspection detection timer (`asset-management/lifecycle`).
- **Evidence Management**: Binary upload, SHA-256 hashing, MinIO upload with local filesystem fallback (`asset-management/evidence`).
- **Technical Records & Bindings**: Classified technical documents, physical QR/RFID bindings (`technical-records`, `physical-bindings`).
- **Audit & Merkle**: Tamper-evident hash-chained audit logging, pairwise Merkle root calculations (`asset-management/audit`).
- **Certifications & Passports**: Digital Product Passport issuance and queue management (`certification/certifications`).
- **Transactional Outbox & Worker**: Outbox table, 5-second polling worker, row-level locking, event handling (`trust/outbox`).
- **Blockchain Adapter & Smart Contracts**: Viem blockchain adapter, Soulbound Token contract (`trust/blockchain`, `contracts/`).
- **Public Verification**: 6-domain cryptographic verification engine (`verification`).

---

## 2. The Decoupling Interface: `NOTIFICATION_PORT`

To prevent Part B domain services from having tight dependencies on Part A's notification internals, Part A exported an injectable abstraction:
- **Port Definition**: `backend/src/notifications/notification.port.ts` defines `INotificationPort` and the injection token `NOTIFICATION_PORT`:
  ```typescript
  export interface INotificationPort {
    createNotification(data: CreateNotificationData): Promise<any>;
  }
  export const NOTIFICATION_PORT = 'NotificationPort';
  ```
- **Part B Consumers**:
  1. `ApprovalsService` (`backend/src/asset-management/approvals/approvals.service.ts`)
  2. `LifecycleService` (`backend/src/asset-management/lifecycle/lifecycle.service.ts`)
  3. `WorkerService` (`backend/src/trust/outbox/worker.service.ts`)
- All three Part B services inject `@Inject(NOTIFICATION_PORT) private readonly notificationsService: INotificationPort`.

---

## 3. Boundary Evaluation: Expected vs Actual

| Domain / Component | Expected Owner | Actual Code Location | Status | Boundary Verdict |
| :--- | :--- | :--- | :--- | :--- |
| Auth & JWT | Part A | `backend/src/identity/auth` | Clean | 🟢 Perfect match |
| Users & Roles | Part A | `backend/src/identity/users` | Clean | 🟢 Perfect match |
| Casbin RBAC | Part A | `backend/src/core/casbin` | Clean | 🟢 Perfect match |
| Wallet Binding | Part A | `backend/src/identity/wallet` | Clean | 🟢 Perfect match |
| Notifications Engine | Part A | `backend/src/notifications` | Clean | 🟢 Decoupled via `NOTIFICATION_PORT` |
| Search & Dashboard | Part A | `backend/src/search`, `dashboard` | Clean | 🟢 Read-only queries across Part B models |
| Asset Management | Part B | `backend/src/asset-management` | Clean | 🟢 Perfect match |
| Evidence & Storage | Part B | `backend/src/asset-management/evidence` | Clean | 🟢 Perfect match |
| Audit & Merkle | Part B | `backend/src/asset-management/audit` | Clean | 🟢 Perfect match |
| Certification & Passports | Part B | `backend/src/certification` | Clean | 🟢 Perfect match |
| Outbox & Worker | Part B | `backend/src/trust/outbox` | Clean | 🟢 Perfect match |
| Blockchain Adapter | Part B | `backend/src/trust/blockchain` | Clean | 🟢 Perfect match |
| Contracts | Part B | `contracts/contracts/KavachTrustSBT.sol`| Clean | 🟢 Perfect match |
| Verification Engine | Part B | `backend/src/verification` | Clean | 🟢 Perfect match |
| Supply Chain | Part B | **DOES NOT EXIST** | N/A | 🔴 UNIMPLEMENTED |