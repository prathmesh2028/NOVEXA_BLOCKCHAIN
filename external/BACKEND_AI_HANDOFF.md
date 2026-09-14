# KavachTrust - Backend AI Handoff

## 1. Product Understanding
KavachTrust is an asset tracking and certification platform with a Web3/Blockchain foundation. The backend API supports tracking "batches" of assets, managing "evidence" (documents/images) uploaded by roles (e.g. Technician, Auditor), issuing "certifications", and minting corresponding non-transferable Soulbound Tokens (SBT) on a blockchain as an immutable receipt.

## 2. Architecture & Tech Stack
This backend is **NOT** a Node.js/NestJS application. It is a **Python FastAPI** application.
- **Framework**: FastAPI (Python 3.12)
- **Database ORM**: SQLAlchemy
- **Database**: SQLite (currently `dev.db` for local dev), compatible with PostgreSQL.
- **Authentication**: JWT via `python-jose`, passwords via `passlib[argon2]`
- **Blockchain**: `web3.py` interacting with a local Hardhat node (`http://127.0.0.1:8545`).
- **Tests**: `pytest` and `httpx`.

## 3. Module Map
The `app/` directory is structured as follows:
- `api/v1/`: Contains FastAPI APIRouters (`auth.py`, `assets.py`, `evidence.py`, `blockchain.py`, etc.)
- `core/`: Core configurations, DB setup (`database.py`), JWT security (`security.py`), and FastAPI dependencies (`dependencies.py`).
- `models/`: SQLAlchemy ORM models (`user.py`, `asset.py`, `evidence.py`, `certification.py`, `audit.py`, `blockchain.py`, `lifecycle.py`).
- `services/`: Business logic, mainly `blockchain.py` for Web3 interactions.
- `main.py`: Application entry point.

## 4. Database Schema
- **Users & Identity**: `users`, `actors` (DID/Wallet), `roles`, `user_roles`.
- **Assets**: `batches`, `assets`.
- **Evidence & Certifications**: `evidence`, `evidence_versions`, `certifications`.
- **Audit & Blockchain**: `audit_events`, `lifecycle_events`, `blockchain_transactions`, `blockchain_verifications`.

## 5. Auth & Identity
- **Login**: `POST /api/v1/auth/login` expects JSON `{"email", "password"}` and returns a JWT Bearer token.
- **Identity**: Mapped to the `Actor` table which tracks `did` (Decentralized Identifier) and `wallet_address`.

## 6. Blockchain & Smart Contracts
- **Contract**: KavachTrustSBT (ERC-721 Soulbound Token).
- **Service**: `app.services.blockchain` uses Web3.py to interact with the contract.
- **Integration**: The backend currently calls the smart contract synchronously upon certification/evidence anchoring.

## 7. Known Issues & Unfinished Features
- **Outbox/Workers**: No transactional outbox or async workers (like Celery/Redis) are implemented. Blockchain transactions are synchronous.
- **Storage**: Evidence files are mocked. There is no MinIO/S3 implementation. Metadata is just stored in DB.
- **RBAC**: A roles table exists, but FastAPI endpoints only check for `CurrentUser` and do not assert specific Casbin/RBAC rules yet.
- **WebAuthn / OIDC**: Not present. Authentication is simple Email/Password.

## 8. Exact Next Tasks for the AI Agent
1. **Implement RBAC Guards**: Add specific role checks (e.g., `@require_role('TECHNICIAN')`) on endpoints.
2. **Async Blockchain Worker**: Move Web3 minting/anchoring into a Celery worker to avoid blocking API requests.
3. **Storage Integration**: Connect the Evidence upload endpoints to AWS S3 or MinIO.
4. **Environment Variables**: Move hardcoded blockchain private keys from `core/config.py` to `.env`.
