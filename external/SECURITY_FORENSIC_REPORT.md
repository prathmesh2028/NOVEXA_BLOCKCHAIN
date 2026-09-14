# SECURITY FORENSIC REPORT

## 1. Secrets & Credentials Management
**Status: BROKEN / HIGH RISK**
The legacy backend hardcodes critical security credentials directly in the source code.

- **File**: `backend/app/core/config.py`
  - `SECRET_KEY = "supersecretkey"` (Used for JWT signing)
  - `BLOCKCHAIN_PRIVATE_KEY` (Used for signing Hardhat transactions - currently set to a default Hardhat account key).
- **Target Mitigation**: Move all secrets to `.env` files managed by `dotenv` in the new NestJS backend, and ultimately a secret manager (e.g., HashiCorp Vault or AWS Secrets Manager) in production.

## 2. Authentication
**Status: PARTIAL / LOW SECURITY**
- **Current Mitigation**: API validates email/password hashes (Argon2 via passlib) and issues a JWT (HS256).
- **Missing Mitigation**: No refresh tokens. No OIDC integration. No WebAuthn (FIDO2) integration for privileged actions as required by the Target Architecture.
- **Severity**: MEDIUM.

## 3. Authorization (RBAC/ABAC)
**Status: MISSING**
- **Current Mitigation**: None. The `get_current_user` dependency verifies token validity, but endpoints (like `/certifications` or `/evidence`) do not verify if the user actually holds the required role (e.g., `NFT_CREATOR` or `TECHNICIAN`).
- **Missing Mitigation**: Casbin RBAC/ABAC integration on all API controllers.
- **Severity**: HIGH. Any authenticated user can potentially trigger a certification mint if they know the endpoint.

## 4. Database Security
**Status: MISSING**
- **Current Mitigation**: Basic SQL injection protection provided naturally by SQLAlchemy ORM.
- **Missing Mitigation**: SQLite is unencrypted. The Target Architecture requires PostgreSQL with Row Level Security (RLS) to enforce tenant/role isolation at the database level.
- **Severity**: HIGH for production, acceptable for local POC.

## 5. Threat Model Analysis
| Threat | Current Mitigation | Missing Mitigation | Severity |
|---|---|---|---|
| **Auth Bypass** | JWT Verification | WebAuthn for critical actions | HIGH |
| **Role Manipulation** | DB Schema constraints | Casbin RBAC Guards on API | HIGH |
| **Evidence Tampering** | SHA-256 Hash recorded | Hash chaining in Audit Log | MEDIUM |
| **Blockchain Spoofing** | Hardhat Local Node | Besu QBFT + mTLS | HIGH |
| **Private Key Theft** | None (Hardcoded) | HSM / KMS / env vars | CRITICAL |

## 6. Cryptographic Primitives
- **JWT**: Currently HS256. (Target: RS256/ES256 with PKI).
- **Hashing**: SHA-256 used for Evidence.
- **Passwords**: Argon2 used via `passlib`.
- **Signatures**: ECDSA/secp256k1 used by Web3.py. (Target requires Ed25519 for application signatures).
