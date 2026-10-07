# Security Policy & Architecture

## Security Policy

The **KavachTrust** platform provides sovereign, tamper-evident traceability for critical defense and aerospace assets. Security, non-repudiation, and cryptographic integrity are foundational to every layer of our stack.

We take the security of our software and supply chain ecosystem seriously. This document outlines our vulnerability disclosure policy, security architecture, data classification rules, and defensive controls.

---

## Supported Versions

Only the latest active development release branch receives active security updates and vulnerability patches.

| Version | Status | Supported |
| :--- | :--- | :--- |
| `2.x.x` (Current / Monorepo) | Active Development | :white_check_mark: |
| `1.x.x` (Legacy Python / Prototype) | Deprecated | :x: |

---

## Reporting a Vulnerability

If you discover a security vulnerability within KavachTrust, please adhere to responsible disclosure guidelines. **Do not create public GitHub issues for security vulnerabilities.**

### Reporting Procedure

1. **Email Submission**: Send an encrypted or detailed report to:
   - **Email**: `security@kavachtrust.gov.in` (or repository maintainer contact)
   - **Subject**: `[SECURITY VULNERABILITY] <Component> - <Brief Summary>`
2. **Include in your report**:
   - Component affected (Backend NestJS, Smart Contract, Frontend React, or Besu node configuration).
   - Step-by-step reproduction instructions or a minimal Proof of Concept (PoC).
   - Potential impact (e.g., privilege escalation, tampering with audit chains, unauthorized SBT minting).
   - Any recommended remediation or patches.

### Response Timelines & SLA

| Phase | Target Timeline |
| :--- | :--- |
| **Initial Acknowledgment** | Within 24 hours |
| **Triage & Severity Classification** | Within 48 hours |
| **Fix Development & Testing** | Within 7 business days (High/Critical) |
| **Public Advisory & Patch Release** | Coordinated post-deployment |

---

## Defense-in-Depth Security Model

KavachTrust implements a multi-tier, zero-trust security architecture across identity, storage, transit, and consensus layers.

```
       ┌────────────────────────────────────────────────────────┐
       │                Zero-Trust Frontend Client              │
       │    (HTTPS, CSP, Strict Input Sanitization, Viem EIP)   │
       └───────────────────────────┬────────────────────────────┘
                                   │ TLS 1.3 / Strict CORS
                                   ▼
       ┌────────────────────────────────────────────────────────┐
       │                   NestJS API Gateway                   │
       │   • Helmet Security Headers (HSTS, CSP, Frameguard)    │
       │   • UUID Request Correlation Tracking                  │
       │   • Global DTO Validation (Mass Assignment Protection) │
       │   • JWT Bearer Verification & Casbin RBAC Guard        │
       └──────────────┬───────────────────────────┬─────────────┘
                      │                           │
          PostgreSQL Database           MinIO Object Storage
       • Parameterized Prisma ORM      • SHA-256 Content-Addressable
       • Tamper-evident Hash Chain     • Presigned Upload/Download URLs
       • Transactional Outbox Queue    • AES-GCM Envelope Encryption
                      │
                      ▼
         Transactional Outbox Worker
                      │
                      ▼ EIP-155 JSON-RPC (Private Subnet)
       ┌────────────────────────────────────────────────────────┐
       │             Hyperledger Besu (QBFT EVM)                │
       │   • KavachTrustSBT (ERC-721 + IERC5192 Soulbound)      │
       │   • Strict Ownable Access Control (Backend Minters)    │
       │   • Reentrancy & Transfer Blocking Guards              │
       └────────────────────────────────────────────────────────┘
```

---

## Core Security Controls

### 1. Identity & Access Control (IAM)
- **Authentication**: Stateless JSON Web Tokens (JWT) signed with HMAC-SHA256, validated on every privileged request. Passwords hashed using `bcrypt` with work factor 12.
- **Role-Based Access Control (RBAC)**: Powered by Casbin with strict policy models. Least-privilege separation of duties across 4 core defense roles:
  - `SYSTEM_ADMIN`: Platform operations, user onboarding, role provisioning.
  - `PROCUREMENT_SUPPLY_CHAIN_OFFICER`: Component declarations, shipment custody, batch receipt.
  - `QUALITY_INSPECTOR`: Physical inspection, QA pass/fail determination, technical evidence recording.
  - `AUDITOR`: Independent read-only verification, cryptographic audit chain inspection, Merkle proof evaluation.
- **Web3 Wallet Binding**: Challenge-response nonce signing (EIP-191 / EIP-712) binds Ethereum wallet addresses to verified user accounts for cryptographic non-repudiation.

### 2. Cryptographic Data Integrity
- **Tamper-Evident Hash Chain**: Audit events form an unbroken cryptographic chain. Each record computes:
  $$\text{Hash}_n = \text{SHA-256}(\text{Hash}_{n-1} \parallel \text{CanonicalJSON}(\text{Payload}_n))$$
  Any alteration to historic database records invalidates all subsequent hashes, detectable in real-time by the verification engine.
- **Merkle Checkpoints**: Periodic snapshots aggregate thousands of audit records into a deterministic Merkle Root stored on-chain, proving historical state without exposing sensitive payload details.
- **Evidence Immutability**: All evidence files (schematics, test logs, X-rays) are hashed upon receipt using SHA-256. Hashes are permanently recorded before storage in MinIO.

### 3. Smart Contract & Blockchain Hardening
- **Soulbound Tokens (SBT)**: Implements `ERC-721` combined with `IERC5192` (Minimal Soulbound Token standard). The internal `_update` method reverts on any attempt to transfer tokens between addresses, ensuring certification credentials remain bound to the designated defense asset.
- **Minter Authorization**: Only the verified contract owner (the secure backend outbox relayer) has permission to invoke `mintCertification` and `revokeCertification`.
- **Idempotency & Replay Prevention**: Mint requests require unique idempotency keys mapped in PostgreSQL and smart contract events, eliminating duplicate token minting.

### 4. Storage & Secret Management
- **Data Classification**: Supports 4 classifications: `PUBLIC`, `INTERNAL`, `SENSITIVE`, and `RESTRICTED`. Classified records utilize AES-GCM envelope encryption keys.
- **Environment Isolation**: Production secrets (JWT secrets, private keys, database credentials) are injected exclusively via environment variables or secret vaults. No keys or fallback passwords are permitted in version control.

---

## Security Best Practices for Operators

1. **Rotate Development Keys**: Never deploy default keys from `.env.example` in production or staging.
2. **Isolate Besu RPC**: Ensure JSON-RPC port `8545` is accessible only to backend worker nodes and not exposed to the public internet.
3. **Enforce HTTPS / TLS**: Terminate TLS at the reverse proxy (Nginx, Traefik, or Cloudflare) with modern ciphers (TLS 1.3 preferred).
4. **Regular Dependency Audits**: Run `pnpm audit` periodically to scan for supply chain vulnerabilities in third-party packages.
