# Frontend/Backend Compatibility Matrix

## Overview
The frontend currently relies heavily on `src/mockData` and simulated service delays. The backend API is built with FastAPI but is not fully wired into the frontend components. This matrix highlights the discrepancies between the frontend TypeScript models/responses and the actual FastAPI backend implementation.

## 1. Authentication / Users
| Feature | Frontend Expectation (`src/services/auth.ts`) | Backend Reality (`app/api/v1/auth.py`) | Status / Mismatch |
|---|---|---|---|
| Login Request | `email`, `password` | JSON `{"email", "password"}` | **MATCH**. Tests modified to send JSON payload. |
| Login Response | `token`, `user` object | `access_token`, `token_type` (JWT) | **MISMATCH**. Frontend expects user object in login response; backend only returns token. |
| Current User | `GET /auth/me` | `GET /api/v1/auth/me` | **MATCH**. Backend returns `UserMeResponse`. |
| Roles | `string` (e.g. "ADMIN") | `roles` list on User | **PARTIAL**. Frontend expects single role or specific enum, backend uses many-to-many roles table. |

## 2. Assets & Batches
| Feature | Frontend Expectation (`src/services/assets.ts`) | Backend Reality (`app/api/v1/assets.py`) | Status / Mismatch |
|---|---|---|---|
| Asset List | `Asset[]` with nested `history` | `GET /api/v1/assets` returns list of assets | **PARTIAL**. Backend does not eagerly load full nested history in list view to save bandwidth. |
| Asset IDs | `string` (UUID) | `String` (UUID) | **MATCH**. |
| Dates | ISO Strings | `datetime` objects serialized to ISO strings | **MATCH**. |

## 3. Evidence
| Feature | Frontend Expectation | Backend Reality (`app/api/v1/evidence.py`) | Status / Mismatch |
|---|---|---|---|
| Upload | Multipart form data | `POST /api/v1/evidence` | **MISMATCH**. Backend mocks storage; file is hashed but discarded. Metadata saved to DB. |
| File URLs | S3/MinIO URLs | Null / Mock string | **MISMATCH**. Frontend cannot render actual uploaded evidence images. |

## 4. Blockchain & Certifications
| Feature | Frontend Expectation | Backend Reality (`app/api/v1/certifications.py`) | Status / Mismatch |
|---|---|---|---|
| Mint Status | Polling / Async | Synchronous blocking call | **CRITICAL MISMATCH**. Frontend expects fast API response and async minting; backend blocks until Hardhat confirms tx. |
| Verification | `verifyAsset` | `GET /api/v1/blockchain/status` | **PARTIAL**. Backend has basic contract read, but full Merkle/Hash chain verification is absent. |

## 5. Summary of Actions Required
To achieve 100% compatibility:
1. Refactor frontend `src/services/*.ts` to use actual `fetch()` or `axios` against `http://localhost:8000`.
2. Strip `src/mockData` completely.
3. Update frontend Login hook to fetch `/auth/me` immediately after receiving the `access_token` from `/auth/login`.
4. Implement async polling on the frontend for Certification minting, and move backend minting to a Celery worker.
