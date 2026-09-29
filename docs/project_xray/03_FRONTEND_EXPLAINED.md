# 03. Frontend Architecture Explained

## 1. Active vs Dead Frontend Code

### THE ABSOLUTE TRUTH: `frontend/f1` IS THE ONLY ACTIVE FRONTEND
Multiple earlier discussions mentioned `f1`, `f2`, and `f3`. The current source code confirms:
1. `index.html` (line 14) explicitly loads:
   ```html
   <script type="module" src="/frontend/f1/main.tsx"></script>
   ```
2. `vite.config.ts` (lines 28-34) explicitly configures aliases pointing directly to `f1`:
   ```typescript
   resolve: {
     alias: {
       '@': path.resolve(import.meta.dirname, 'frontend/f1'),
       '/frontend': path.resolve(import.meta.dirname, 'frontend'),
       '/src': path.resolve(import.meta.dirname, 'frontend/f1'),
     },
   },
   ```
3. `frontend/main.tsx` is literally a one-line proxy:
   ```typescript
   import './f1/main';
   ```
4. Directories `frontend/f2` and `frontend/f3` **do not exist** in the filesystem on this branch (`list_dir` on `frontend/` returns only `f1` and `main.tsx`). Any references to `f2` or `f3` are historical dead references.

---

## 2. Frontend Entrypoint & Providers

- **Entrypoint**: `frontend/f1/main.tsx` imports `index.css`, initializes React 19 `createRoot`, and mounts `<App />` into `#root`.
- **Root Provider Tree** (`frontend/f1/App.tsx`):
  ```tsx
  <AuthProvider>
    <WalletProvider>
      <RouterProvider router={router} />
    </WalletProvider>
  </AuthProvider>
  ```
- **Authentication State** (`frontend/f1/context/AuthContext.tsx`):
  - Manages `user`, `token`, `isAuthenticated`, `isLoading`, and `role`.
  - Persists token in browser `localStorage.getItem('kavach_token')`.
  - On mount, calls `GET /api/v1/auth/me` to validate session and hydrate permissions.
- **Wallet State** (`frontend/f1/context/WalletContext.tsx`):
  - Wraps browser `window.ethereum` (MetaMask).
  - Tracks `address`, `isConnected`, `isVerified`, `chainId`.
  - Handles connect, account change, and the 2-step challenge-signature binding flow.

---

## 3. Router & Page Map

The application router is defined in `frontend/f1/routes.tsx` using React Router v7 (`createBrowserRouter`).

| Route Path | Page Component | Functional Purpose |
| :--- | :--- | :--- |
| `/` | `HomePage` | Public landing page / portal overview |
| `/login` | `LoginPage` | Authentication form (supports quick demo-login presets) |
| `/app` | `AppShell` | Protected layout with Navbar, Sidebar, and notification badge |
| `/app/dashboard` | `DashboardPage` | Metrics summary, lifecycle breakdown, alerts, recent activity |
| `/app/assets` | `AssetsPage` | Filterable, searchable table of all registered defence assets |
| `/app/assets/:id` | `AssetDetailPage` | Asset timeline, technical specs, attached evidence, QR code |
| `/app/register` | `RegisterAssetPage` | Form to register a new defence asset under a batch |
| `/app/my-assets` | `MyAssetsPage` | Assets registered by or assigned to current user |
| `/app/eligible-assets` | `EligibleAssetsPage` | Assets that meet criteria for certification minting |
| `/app/certifications` | `CertificationsPage` | Issued Soulbound Token certificates list |
| `/app/certifications/:id`| `CertificationDetailPage`| Full Digital Product Passport view, SBT metadata, block link |
| `/app/certification-queue`| `CertificationQueuePage`| Pending certification requests waiting for minting |
| `/app/inspections` | `InspectionsPage` | Technical inspection records and quality sign-offs |
| `/app/lifecycle` | `LifecyclePage` | Asset lifecycle transition manager with state machine rules |
| `/app/evidence` | `EvidencePage` | Vault of uploaded technical files, SHA-256 hashes, status |
| `/app/evidence/:id` | `EvidenceDetailPage` | Evidence integrity details, preview, download link |
| `/app/evidence-integrity` | `EvidenceIntegrityPage` | Cryptographic batch hash verification and Merkle root checker |
| `/app/technical-records`| `TechnicalRecordsPage` | Classified engineering specifications and telemetry records |
| `/app/blockchain` | `BlockchainPage` | On-chain transaction ledger, block explorer simulator |
| `/app/blockchain-proof` | `BlockchainProofPage` | Cryptographic proof viewer linking asset to SBT |
| `/app/audit` | `AuditPage` | Hash-chained tamper-evident audit event stream |
| `/app/audit-trail` | `AuditPage` | Alias to system activity audit trail |
| `/app/verification` | `VerificationCenterPage`| Public asset verification portal (enter Asset ID or scan QR) |
| `/app/users` | `UsersPage` | User directory and role assignment (Admin only) |
| `/app/roles` | `RolesPage` | Casbin role permission matrix viewer |
| `/app/search` | `SearchPage` | Universal search across assets, certs, evidence, and audit |
| `/app/settings` | `SettingsPage` | User preferences, theme, and system environment info |
| `/app/history` | `StubPage` | Informational timeline stub |

---

## 4. What a Real User Can Actually Click and Do

1. **Sign In**: User visits `/login`, selects an account (e.g. Admin `admin@kavachtrust.gov.in` or Technician `tech@kavachtrust.gov.in`) or types credentials, and signs in.
2. **Explore Dashboard**: Views operational metrics: Total Assets, In-Service count, Pending Inspections, Confirmed Certifications, and critical alerts.
3. **Register New Asset**: Enters Asset ID (e.g. `EF-2026-00999`), Model, Type, Serial Number, Batch, and Supplier. Submits to `POST /api/v1/assets`.
4. **Transition Lifecycle**: Moves asset from `SUPPLIER_DECLARED` to `RECEIVED`.
5. **Upload Evidence**: Uploads calibration PDF. Frontend sends `POST /api/v1/evidence`, receives computed SHA-256 hash.
6. **Record Inspection**: Enters inspection details (PASS), links evidence, and transitions lifecycle to `INSPECTION_RECORDED`.
7. **Request Approval**: Submits asset for QA Review / QC Sign-off.
8. **Approve (as Officer)**: Approver reviews checklist, provides comments, clicks "Approve". Lifecycle moves to `ACCEPTED_FOR_ASSEMBLY`.
9. **Issue Certification (as NFT Creator)**: Enters Certification Queue, clicks "Mint Certification". Backend commits Certification and queues Outbox event.
10. **Verify Physical Asset**: Anyone navigates to `/app/verification`, enters `EF-2026-00999`, and inspects the 6-point cryptographic badge showing verification status.