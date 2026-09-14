# COMPLETE API INVENTORY

This document lists the actual endpoints implemented in the Legacy FastAPI backend (`backend/app/api/v1/`).

## 1. Authentication (`auth.py`)
- **`POST /api/v1/auth/login`**
  - **Auth**: None (Public).
  - **Request**: `OAuth2PasswordRequestForm` or JSON `{"email", "password"}`.
  - **Response**: `{"access_token", "token_type"}`.
  - **Errors**: 400 Bad Request, 401 Unauthorized (Invalid credentials).
  - **Effect**: Queries user, hashes password, generates JWT.

- **`GET /api/v1/auth/me`**
  - **Auth**: Requires JWT (Bearer).
  - **Request**: None.
  - **Response**: `UserMeResponse` (Includes `email`, `name`, `roles`, nested `actor`).
  - **Errors**: 401 Unauthorized, 404 Not Found.
  - **Effect**: Reads `current_user` from token claims.

## 2. Assets (`assets.py`)
- **`GET /api/v1/assets`**
  - **Auth**: Requires JWT.
  - **Request**: Optional pagination query params (not fully implemented).
  - **Response**: `List[AssetResponse]`.
  - **Errors**: 401 Unauthorized.
  - **Effect**: `db.query(Asset).all()`. Does not eagerly load all relationships.

- **`GET /api/v1/assets/{asset_id}`** (Assumed present based on REST patterns)
  - **Auth**: Requires JWT.
  - **Response**: Single `AssetResponse`.

## 3. Evidence (`evidence.py`)
- **`POST /api/v1/evidence`**
  - **Auth**: Requires JWT.
  - **Request**: `multipart/form-data` (`asset_id`, `file`).
  - **Response**: `EvidenceResponse`.
  - **Errors**: 401 Unauthorized, 404 Asset Not Found.
  - **Effect**: Computes SHA-256 hash of the uploaded file. **DISCARDS FILE PAYLOAD (MOCK)**. Saves hash and metadata to DB.

- **`GET /api/v1/evidence/{evidence_id}`**
  - **Auth**: Requires JWT.
  - **Response**: `EvidenceResponse`.

## 4. Certifications (`certifications.py`)
- **`POST /api/v1/certifications`**
  - **Auth**: Requires JWT.
  - **Request**: `{"asset_id", "issued_by"}`.
  - **Response**: `CertificationResponse`.
  - **Errors**: 400 Bad Request (Already certified), 401 Unauthorized, 404 Not Found.
  - **Effect**: **CRITICAL BLOCKING**. Validates asset, calls Web3 `mintSBT` synchronously, blocks until Hardhat confirms tx, then inserts DB record.

- **`GET /api/v1/certifications/{cert_id}`**
  - **Auth**: Requires JWT.
  - **Response**: `CertificationResponse`.

## 5. Blockchain (`blockchain.py`)
- **`GET /api/v1/blockchain/status`**
  - **Auth**: None (Public).
  - **Request**: None.
  - **Response**: `{"connected": bool, "latest_block": int}`.
  - **Effect**: Reads directly from local Hardhat RPC.

## Target Architecture Gap
- **RBAC**: None of these routes enforce Casbin or explicit role checks beyond requiring a valid JWT.
- **Async**: Blockchain minting MUST be moved to a transactional outbox + worker pattern.
- **REST standards**: Endpoints use mixed schemas (Pydantic). Need to migrate to NestJS controllers with Zod validation.
