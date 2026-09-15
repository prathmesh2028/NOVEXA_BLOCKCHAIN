# Backend Implementation Handoff

This document provides exact, code-level details of the Python FastAPI implementation for the KavachTrust platform. Do not assume the existence of any framework (e.g. NestJS) other than what is explicitly documented here.

## 1. Complete Database Field Map
**ORM**: SQLAlchemy (`backend/app/models/`)

### `User`
- `id` (String, PK, default UUID)
- `email` (String, Unique, Index)
- `hashed_password` (String)
- `name` (String)
- `status` (String, default "ACTIVE")
- `created_at` (DateTime)
- `updated_at` (DateTime)

### `Actor` (Identity)
- `id` (String, PK, default UUID)
- `user_id` (String, FK `users.id`)
- `did` (String, Unique, Index) -> Note: Mocked DID string.
- `credential_status` (String, default "ACTIVE")
- `identity_status` (String, default "ACTIVE")
- `wallet_address` (String, nullable)

### `Asset`
- `id` (String, PK, default UUID)
- `batch_id` (String, FK `batches.id`)
- `name` (String)
- `serial_number` (String, Unique, Index)
- `current_lifecycle_stage` (String)

*(Other Models: `Batch`, `Evidence`, `EvidenceVersion`, `Certification`, `AuditEvent`, `LifecycleEvent`, `BlockchainTransaction`, `BlockchainVerification` exist with standard UUID PKs and relational FKs).*

## 2. Complete API Contract
**Router Base**: `/api/v1`

### Authentication (`app/api/v1/auth.py`)
- **`POST /auth/login`**: Expects `{"email", "password"}`. Returns `{"access_token", "token_type"}`. No RBAC.
- **`GET /auth/me`**: Expects JWT. Returns `UserMeResponse` with nested `ActorResponse`.

### Assets (`app/api/v1/assets.py`)
- **`GET /assets`**: Expects JWT. Returns list of Assets. Queries `db.query(Asset).all()`.

### Evidence (`app/api/v1/evidence.py`)
- **`POST /evidence`**: Expects `UploadFile` (multipart/form-data). Computes SHA-256 hash. Storage is mocked (file discarded). Returns `EvidenceResponse`.
- **`GET /evidence/{evidence_id}`**: Expects JWT. Returns Evidence metadata.

### Certifications (`app/api/v1/certifications.py`)
- **`POST /certifications`**: Expects `{"asset_id", "issued_by"}`. Synchronously blocks, calls Web3 `mint_sbt(wallet_address, uri)`, waits for receipt, saves `Certification` to DB.

### Blockchain (`app/api/v1/blockchain.py`)
- **`GET /blockchain/status`**: Unprotected. Returns current Web3 block number and connection status.

## 3. Exact Secret Map
**WARNING**: Secrets are currently hardcoded in source code!
- **JWT Secret**: `app/core/config.py` (`SECRET_KEY = "supersecretkey"`)
- **Web3 RPC URL**: `app/core/config.py` (`WEB3_PROVIDER_URI = "http://127.0.0.1:8545"`)
- **Web3 Private Key**: `app/core/config.py` (`BLOCKCHAIN_PRIVATE_KEY` for Hardhat Account #0)
- **Contract Address**: `app/core/config.py` (`KAVACH_TRUST_SBT_ADDRESS`)

## 4. Exact Blockchain Flow (Minting SBT)
1. **API**: `POST /api/v1/certifications` is called.
2. **Controller**: `app.api.v1.certifications.create_certification()` runs.
3. **Validation**: Checks if `Asset` exists and `Actor` (Issuer) has a valid `wallet_address`.
4. **Service**: Calls `mint_sbt(wallet_address, metadata_uri)` in `app.services.blockchain`.
5. **Web3.py**: Constructs transaction:
   ```python
   tx = contract.functions.mintSBT(to_address, uri).build_transaction({
       'from': admin_account.address,
       'nonce': web3.eth.get_transaction_count(admin_account.address),
       'gas': 2000000,
       'gasPrice': web3.to_wei('20', 'gwei')
   })
   ```
6. **Signer**: Signed locally with `BLOCKCHAIN_PRIVATE_KEY`.
7. **Transaction**: Sent via `web3.eth.send_raw_transaction`.
8. **Receipt**: Server blocks via `web3.eth.wait_for_transaction_receipt(tx_hash)`.
9. **DB Write**: `Certification` and `BlockchainTransaction` records are inserted into SQLite and committed.

## 5. Actual Runnability (Commands)
```bash
# Setup
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt

# Database (SQLite auto-created on run)
python scripts/seed_data.py

# Blockchain (Separate Terminal)
npx hardhat node
npx hardhat run scripts/deploy.ts --network localhost
# (Update config.py with resulting contract address)

# Start API
uvicorn app.main:app --reload

# Tests
pytest tests/ -v
```

## 6. Real / Mock / Partial Matrix
| Feature | Implementation | Status | Evidence |
|---|---|---|---|
| JWT | `python-jose` | REAL + INTEGRATED | `core/security.py` |
| Database | SQLite | REAL + INTEGRATED | `core/database.py` |
| Evidence Storage | None | MOCK | `api/v1/evidence.py` |
| Audit Merkle Tree | None | NOT PRESENT | `models/audit.py` |
| Blockchain | `web3.py` + Hardhat | REAL + INTEGRATED | `services/blockchain.py` |
| Smart Contract | Solidity SBT | REAL + INTEGRATED | `backend-blockchain/contracts/` |
| Outbox Worker | None | NOT PRESENT | Blocking APIs in `certifications.py` |
| RBAC Guards | None | STUB | Roles table exists, unused in API. |

## 7. Next AI Agent Tasks
1. Extract secrets from `app/core/config.py` into `python-dotenv`.
2. Migrate `mintSBT` in `certifications.py` to an asynchronous Celery worker task.
3. Replace the evidence storage mock in `evidence.py` with `boto3` for AWS S3.
4. Implement specific Role Dependency checks (e.g., `Depends(require_role('ADMIN'))`).
