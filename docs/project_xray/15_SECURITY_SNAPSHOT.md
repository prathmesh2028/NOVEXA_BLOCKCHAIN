# 15. Security & Risk Snapshot

## 1. High-Impact Security Findings

### 1. Hardcoded Development Secrets in `.env`
- **Location**: `backend/.env`
- **Details**:
  - `JWT_SECRET=kavach_super_secret_jwt_key_defence_trust_2026`
  - `BLOCKCHAIN_PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80` (Standard Hardhat Account #0 test private key)
- **Impact**: In production, anyone with repository access could forge valid military JWT tokens or sign transactions as the contract owner.
- **Remediation Required**: Must use cloud KMS, HashiCorp Vault, or environment injection in deployment.

### 2. Demo Mode Authentication Bypass
- **Location**: `backend/src/identity/auth/auth.service.ts` line 58
- **Details**: When `APP_ENV=demo` and PostgreSQL is unreachable, `AuthService.login` matches against `FALLBACK_USERS` without verifying the password hash with bcrypt.
- **Impact**: Any user can log in as Admin simply by submitting the email with any password.
- **Remediation Required**: Disable demo fallback entirely when `NODE_ENV=production`.

### 3. Fake Blockchain Confirmation in Demo Mode
- **Location**: `backend/src/trust/blockchain/blockchain.adapter.ts` line 84
- **Details**: Returns synthetic `0xDEMO-mocktx...` when node is offline in demo mode.
- **Impact**: Operators could believe defence assets are permanently certified on-chain when in fact no distributed ledger record exists.
- **Status**: Outside demo mode, the adapter correctly returns `FAILED`.

### 4. Path Traversal Safeguards in Evidence Storage
- **Location**: `backend/src/asset-management/evidence/minio.service.ts` lines 52 & 76
- **Details**: Contains explicit path traversal guard:
  ```typescript
  if (!localFilePath.startsWith(this.localStorageDir)) {
    throw new Error('Path traversal attempt detected');
  }
  ```
- **Status**: 🟢 **VERIFIED PROTECTED**.

### 5. Non-Transferable Soulbound Token Guarantee
- **Location**: `contracts/contracts/KavachTrustSBT.sol` line 81
- **Details**: Explicitly reverts transfers between non-zero addresses in `_update`.
- **Status**: 🟢 **VERIFIED PROTECTED**. Tokens cannot be transferred, stolen, or sold.