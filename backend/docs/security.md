# KavachTrust Backend — Security Architecture & Threat Model

## 1. Threat Model & Mitigations

| Threat Vector | Potential Impact | Backend Mitigation |
|---|---|---|
| **Unauthorized Lifecycle Transition** | Unqualified supplier accepts defective parts | Strict state machine rules enforced in a single atomic database transaction; unauthorized transitions reject with `403 Forbidden` / `400 Bad Request`. |
| **Audit Log Tampering** | Malicious actor modifies historical inspection results | Immutable SHA-256 forward hash-chain. Any modified row invalidates `previousHash` on subsequent records. Detectable via `/api/audit/verify`. |
| **Credential Forgery / Impersonation** | Attacker spoofs inspector identity | Ed25519-structured signatures in W3C VC 2.0 documents, bcrypt-hashed passwords (cost factor 10), and signed JWT access tokens with strict expiration. |
| **Replay Attacks** | Repeated submission of transitions or mint actions | `idempotencyKey` uniqueness constraint enforced at database schema level. |
| **Double Spend / Outbox Failure** | Blockchain node timeout causes inconsistent state | Transactional outbox pattern: state changes commit locally first, worker handles asynchronous EVM broadcast with retry counters. |

---

## 2. Authentication & Session Management
- **Password Hashing**: Bcrypt with salt rounds = 10.
- **Tokens**: Signed HMAC-SHA256 JWT tokens with configurable TTL (default: 24 hours).
- **Issuer & Audience**: Validated against `jwtIssuer` and `jwtAudience` environment configurations.

---

## 3. Authorization (Casbin RBAC)
Access control policies are evaluated per endpoint using Casbin:
- Sub (Subject): Authenticated User ID and Role.
- Obj (Object / Resource): Asset, Evidence, Inspection, Audit, Certification.
- Act (Action): Read, Write, Transition, Mint, Verify.

---

## 4. Evidence Storage & Integrity
- All uploaded evidence artifacts have their SHA-256 checksum calculated prior to storage.
- File references stored in the database include byte size, MIME type, and cryptographic digest.
- Verification checks confirm file digest matching to prevent file swapping or tampering in object storage.
