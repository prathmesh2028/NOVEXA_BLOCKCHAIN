# KavachTrust Backend — API Reference

All endpoints are served under the base prefix `/api` unless specified otherwise.
Protected endpoints require an `Authorization: Bearer <JWT_TOKEN>` header.

---

## 1. Authentication (`/api/auth`)

### `POST /api/auth/login`
Authenticates a user and issues a JWT token.
- **Request Body**:
  ```json
  {
    "username": "bel_admin",
    "password": "password"
  }
  ```
- **Response**: `200 OK`
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "usr-uuid-1",
      "username": "bel_admin",
      "role": "ADMIN",
      "name": "BEL Chief Administrator",
      "did": "did:web:kavachtrust.bel.in:actor:admin01"
    }
  }
  ```

### `GET /api/auth/me`
Retrieves current authenticated actor profile and permissions.
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `200 OK`

---

## 2. Asset Management (`/api/assets`)

### `GET /api/assets`
Returns paginated list of assets.
- **Query Params**:
  - `page` (default: 1)
  - `limit` (default: 20)
  - `status` (e.g. `ACCEPTED_FOR_ASSEMBLY`, `RECEIVED`)
  - `search` (text search by name or serial number)
- **Response**: `200 OK`
  ```json
  {
    "items": [...],
    "total": 42,
    "page": 1,
    "limit": 20
  }
  ```

### `POST /api/assets`
Registers a new defense asset.
- **Request Body**:
  ```json
  {
    "assetId": "BEL-RADAR-2026-004",
    "name": "L-Band AESA Radar Module",
    "category": "RADAR_MODULE",
    "partNumber": "BEL-AESA-L01",
    "serialNumber": "SN-98234-A",
    "batchId": "optional-batch-uuid"
  }
  ```

---

## 3. Evidence Management (`/api/evidence`)

### `POST /api/evidence/upload`
Uploads and hashes technical evidence (inspection certificates, spectrometry scans, calibration logs).
- **Request Body**:
  ```json
  {
    "assetId": "ast-uuid-1",
    "fileName": "xray_spectral_scan.pdf",
    "fileType": "application/pdf",
    "fileSize": 1048576,
    "sha256": "3a4f6...",
    "category": "NDT_XRAY"
  }
  ```

---

## 4. Lifecycle State Machine (`/api/lifecycle`)

### `POST /api/lifecycle/transition`
Triggers an atomic state transition on an asset.
- **Allowed Transitions**:
  - `UNREGISTERED` → `SUPPLIER_DECLARED`
  - `SUPPLIER_DECLARED` → `RECEIVED`
  - `RECEIVED` → `INSPECTION_RECORDED` (requires evidence & inspection)
  - `INSPECTION_RECORDED` → `ACCEPTED_FOR_ASSEMBLY`
  - `INSPECTION_RECORDED` → `REJECTED_QUARANTINED`
- **Request Body**:
  ```json
  {
    "assetId": "ast-uuid-1",
    "toState": "RECEIVED",
    "reason": "Delivered to Bangalore BEL receiving dock",
    "evidenceIds": ["ev-uuid-1"],
    "idempotencyKey": "tx-20260915-001"
  }
  ```

---

## 5. Inspections (`/api/inspections`)

### `POST /api/inspections`
Records a formal QA/QC technical inspection.
- **Request Body**:
  ```json
  {
    "assetId": "ast-uuid-1",
    "type": "VISUAL_AND_SPECTRAL",
    "result": "PASS",
    "notes": "All tolerances within MIL-STD-810H specification",
    "measurements": {
      "dimensionalVarianceMm": 0.02,
      "opticalPurityPct": 99.98
    }
  }
  ```

---

## 6. Audit & Tamper Verification (`/api/audit`)

### `GET /api/audit`
Returns paginated cryptographic audit events.

### `GET /api/audit/verify`
Verifies the cryptographic integrity of the SHA-256 hash chain from genesis to head.
- **Response**:
  ```json
  {
    "valid": true,
    "checked": 142,
    "brokenAt": null
  }
  ```

---

## 7. Certifications & Passports (`/api/certifications`)

### `POST /api/certifications/mint`
Idempotently mints a digital passport for an asset in `ACCEPTED_FOR_ASSEMBLY` state.
- **Request Body**:
  ```json
  {
    "assetId": "ast-uuid-1",
    "idempotencyKey": "mint-pass-001"
  }
  ```

---

## 8. Verification Engine (`/api/verification`)

### `GET /api/verification/:assetId`
Performs multi-dimensional verification checks across Identity, Evidence, Inspections, Lifecycle, Certification, and Blockchain anchor.
- **Response**:
  ```json
  {
    "asset_id": "BEL-RADAR-2026-001",
    "overall": "VALID",
    "checks": [
      { "domain": "identity", "status": "VALID", "reason": "Registered by identified actor" },
      { "domain": "evidence", "status": "VALID", "reason": "2/2 evidence items verified" },
      { "domain": "inspection", "status": "VALID", "reason": "1 inspection(s) recorded" },
      { "domain": "lifecycle", "status": "VALID", "reason": "Current state: ACCEPTED_FOR_ASSEMBLY" },
      { "domain": "certification", "status": "VALID", "reason": "Certified: CERT-BEL-2026-001" },
      { "domain": "blockchain", "status": "VALID", "reason": "On-chain: 0x93f..." }
    ]
  }
  ```

---

## 9. Search & Dashboard

### `GET /api/search?q=<query>`
Cross-domain search across assets, serial numbers, batches, and evidence.

### `GET /api/dashboard/summary`
Returns live system metrics, including total assets, inspection pass rates, quarantine counts, and blockchain anchor status.

---

## 10. Health & Readiness (`/health`)

### `GET /health`
Liveness probe.

### `GET /health/ready`
Readiness probe verifying active PostgreSQL database connectivity.
