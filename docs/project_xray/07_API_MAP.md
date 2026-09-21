# 07. Complete API Route Map

All backend routes are mounted with the global prefix: `http://localhost:8000/api/v1`.

---

## 1. PART A Routes: Identity, Access & Platform

| HTTP Method | Route | Handler Controller | Casbin Policy | Real / Mock / Fallback |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/login` | `AuthController.login` | Public | Real bcrypt + DB check; falls back to `FALLBACK_USERS` if `APP_ENV=demo` and DB offline |
| `GET` | `/api/v1/auth/me` | `AuthController.me` | Authenticated | Returns current user profile and assigned roles |
| `POST` | `/api/v1/auth/logout` | `AuthController.logout` | Authenticated | Invalidates session (client clears token) |
| `POST` | `/api/v1/auth/change-password`| `AuthController.changePassword`| Authenticated | Updates user password hash |
| `GET` | `/api/v1/users` | `UsersController.findAll` | `/api/v1/users` GET | List all users (supports query filters) |
| `POST` | `/api/v1/users` | `UsersController.create` | `/api/v1/users` POST | Create user and assign initial role |
| `GET` | `/api/v1/wallet` | `WalletController.getBindings`| Authenticated | Returns user's bound wallet addresses |
| `POST` | `/api/v1/wallet/challenge` | `WalletController.generateChallenge`| Authenticated | Creates a 5-min single-use nonce challenge |
| `POST` | `/api/v1/wallet/bind` | `WalletController.bindWallet` | Authenticated | Verifies EIP-191 signature via viem and binds address |
| `DELETE`| `/api/v1/wallet/:address` | `WalletController.unbindWallet`| Authenticated | Unbinds wallet address |
| `GET` | `/api/v1/notifications` | `NotificationsController.findAll`| Authenticated | Lists user/role notifications (supports unread filter)|
| `GET` | `/api/v1/notifications/unread-count`| `NotificationsController.unreadCount`| Authenticated | Returns integer count of unread alerts |
| `PATCH`| `/api/v1/notifications/:id/read`| `NotificationsController.markAsRead`| Authenticated | Marks specific notification as read |
| `POST` | `/api/v1/notifications/mark-all-read`| `NotificationsController.markAllRead`| Authenticated | Marks all notifications for user as read |
| `GET` | `/api/v1/dashboard/summary`| `DashboardController.getSummary`| Authenticated | Aggregated metrics (total assets, alerts, certs) |
| `GET` | `/api/v1/search` | `SearchController.search` | Authenticated | Global multi-entity search query |
| `GET` | `/api/v1/health` | `HealthController.health` | Public | System liveness probe |
| `GET` | `/api/v1/readiness` | `HealthController.readiness` | Public | DB and external service readiness probe |

---

## 2. PART B Routes: Asset Management, Trust & Verification

| HTTP Method | Route | Handler Controller | Casbin Policy | Real / Mock / Fallback |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/assets` | `AssetsController.findAll` | `/api/v1/assets*` GET | Lists assets with filtering & pagination |
| `POST` | `/api/v1/assets` | `AssetsController.create` | `/api/v1/assets` POST | Registers new asset under a batch |
| `GET` | `/api/v1/assets/eligible` | `AssetsController.findEligible`| `/api/v1/assets/eligible` GET| Assets ready for certification |
| `GET` | `/api/v1/assets/:id` | `AssetsController.findOne` | `/api/v1/assets*` GET | Detailed asset record with relations |
| `POST` | `/api/v1/lifecycle/transition`| `LifecycleController.transition`| Controlled | Executes validated state transition |
| `POST` | `/api/v1/lifecycle/detect-overdue`| `LifecycleController.detectOverdue`| Admin/Tech | Triggers overdue inspection scan |
| `GET` | `/api/v1/lifecycle/overdue` | `LifecycleController.getOverdue`| Authenticated | Returns assets currently overdue for inspection |
| `GET` | `/api/v1/inspections` | `InspectionsController.findAll`| Authenticated | Lists inspection records |
| `POST` | `/api/v1/inspections` | `InspectionsController.create` | Authenticated | Submits inspection result and links evidence |
| `GET` | `/api/v1/evidence` | `EvidenceController.findAll` | Authenticated | Lists evidence documents with SHA-256 hashes |
| `POST` | `/api/v1/evidence` | `EvidenceController.upload` | Authenticated | Multipart upload -> SHA-256 hash -> MinIO/Disk |
| `GET` | `/api/v1/evidence/:id` | `EvidenceController.findOne` | Authenticated | Evidence metadata and integrity status |
| `GET` | `/api/v1/evidence/:id/download`| `EvidenceController.download`| Authenticated | Streams file from MinIO or `storage/evidence` |
| `GET` | `/api/v1/approvals` | `ApprovalsController.findAll` | Authenticated | Lists approval requests |
| `POST` | `/api/v1/approvals` | `ApprovalsController.create` | `/api/v1/approvals` POST | Submits asset for QA/QC/Command approval |
| `PATCH`| `/api/v1/approvals/:id/decide`| `ApprovalsController.decide` | `/api/v1/approvals/:id/decide` PATCH | Approver decision (APPROVED/REJECTED) |
| `GET` | `/api/v1/technical-records`| `TechnicalRecordsController.findAll`| Authenticated | Classified technical records list |
| `POST` | `/api/v1/technical-records`| `TechnicalRecordsController.create` | Authenticated | Creates technical engineering specification |
| `GET` | `/api/v1/physical-bindings`| `PhysicalBindingsController.findAll`| Authenticated | Hardware bindings list (QR/RFID) |
| `POST` | `/api/v1/physical-bindings`| `PhysicalBindingsController.create`| Authenticated | Binds QR code or RFID tag to asset |
| `DELETE`| `/api/v1/physical-bindings/:id`| `PhysicalBindingsController.delete`| Authenticated | Removes hardware binding |
| `GET` | `/api/v1/certifications` | `CertificationsController.findAll`| Authenticated | Lists issued Soulbound Token passports |
| `GET` | `/api/v1/certifications/queue`| `CertificationsController.getQueue`| `/api/v1/certifications/queue` GET | Assets queued for minting |
| `GET` | `/api/v1/certifications/:id`| `CertificationsController.findOne`| Authenticated | Detailed passport information |
| `POST` | `/api/v1/certifications` | `CertificationsController.create` | `/api/v1/certifications` POST | Issues certification & queues outbox event |
| `GET` | `/api/v1/blockchain/transactions`| `BlockchainController.getTransactions`| Authenticated | Blockchain transaction ledger |
| `GET` | `/api/v1/blockchain/proof/:assetId`| `BlockchainController.getProof`| Authenticated | Returns on-chain proof linkage |
| `GET` | `/api/v1/blockchain/status`| `BlockchainController.getStatus`| Authenticated | RPC connection status and latest block |
| `GET` | `/api/v1/blockchain/network`| `BlockchainController.getNetwork`| Authenticated | Network metadata (Chain ID 1337, node info) |
| `GET` | `/api/v1/audit/events` | `AuditController.findAll` | Authenticated | Tamper-evident hash-chained audit log |
| `GET` | `/api/v1/verification/asset/:id`| `VerificationController.verifyAsset`| Public | 6-domain public cryptographic audit check |

---

## 3. Verification of the `/api/v1/api/v1` Prefix Bug

- **CHECKED AND CONFIRMED RESOLVED**:
  - `backend/src/main.ts` executes `app.setGlobalPrefix('api/v1')`.
  - All NestJS controllers declare bare relative paths (e.g. `@Controller('assets')`, `@Controller('auth')`).
  - Frontend `services/api.ts` sets `API_BASE_URL = 'http://localhost:8000/api/v1'`.
  - All frontend service calls pass clean sub-paths (e.g. `api.get('/assets')`, `api.post('/auth/login')`).
  - **Result**: Every request resolves strictly to `http://localhost:8000/api/v1/[endpoint]`. No duplicate prefix exists.