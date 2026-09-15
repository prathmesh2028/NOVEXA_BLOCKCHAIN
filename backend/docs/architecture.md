# KavachTrust Backend — Architecture Specification

## 1. Executive Summary

KavachTrust Backend provides a hardened, tamper-evident backend service for defense asset traceability, provenance verification, and digital passport issuance.

The architecture strictly adheres to three core tenets:
1. **Frontend Contract Compatibility**: The frontend React/Vite application is frozen. All REST endpoints conform to the existing frontend data structures, naming conventions, and query parameters.
2. **Cryptographic Integrity**: Every state transition and lifecycle change is sequentially chained using SHA-256 hash chains and Merkle trees, enabling proof generation and third-party verification.
3. **Defense-Grade Reliability**: Transactional outbox pattern decouples database transactions from external blockchain node network latencies, preventing failed or stalling transactions.

---

## 2. Core Components

### 2.1 Web Layer (NestJS)
- **Global Pipes**: Class-validator with automatic transformation and whitelisting.
- **Global Middleware**: Request ID injection (`X-Request-ID`) using UUID v4 for end-to-end request tracing.
- **Global Filters**: Structured error response formatting with error codes and contextual messages.
- **Guards**:
  - `JwtAuthGuard`: Enforces token validity, expiration, and issuer verification.
  - `CasbinRbacGuard`: Fine-grained role-based policy evaluation.

### 2.2 Data Layer (Prisma + PostgreSQL)
The PostgreSQL database serves as the persistent system of record with schemas covering:
- **Actors & Credentials**: Users, roles, public keys, DIDs, W3C Verifiable Credentials.
- **Assets & Batches**: Defense components, serial numbers, military specifications, batch groupings.
- **Evidence & Files**: SHA-256 hashes, file metadata, S3/MinIO pointers, verified flags.
- **Lifecycle & Inspections**: Finite state machine audit logs, inspection criteria (optical, environmental, electrical).
- **Certifications & Passports**: Digitally signed asset certificates with on-chain transaction hashes.
- **Audit & Checkpoints**: Immutable hash-chained audit events and Merkle root checkpoints.
- **Outbox**: Transactional outbox queue for reliable message and blockchain event delivery.

### 2.3 Cryptography & Integrity
- **Audit Hash Chain**:
  Each audit log entry computes:
  $$\text{hash}_n = \text{SHA-256}(\text{canonical}(\text{event}_n) + \text{hash}_{n-1})$$
  Genesis hash is initialized to 64 zeros. Any modification to a past event breaks all subsequent hash pointers.
- **Merkle Tree**:
  Implements standard RFC 6962-style deterministic Merkle trees:
  - Leaves are sorted pairs before hashing to prevent second-preimage ambiguities.
  - Odd-numbered levels duplicate the final node.
  - Generates compact cryptographic inclusion proofs of size $O(\log N)$.

### 2.4 Transactional Outbox Worker
To avoid distributed dual-write inconsistencies between PostgreSQL and the EVM blockchain:
1. Domain service writes asset state change + an `OutboxEvent` record in a single atomic SQL transaction.
2. The Outbox processor picks up `PENDING` events with exponential backoff and retry limits.
3. Transactions are broadcast to the EVM network via `Viem`.
4. Upon confirmation, the outbox record is marked `CONFIRMED` with block number and transaction hash.

### 2.5 Identity & Verifiable Credentials
- **DID Scheme**: `did:web:kavachtrust.bel.in:actor:<actor_prefix>`
- **VC 2.0**: JSON-LD conformant structure with credential subjects containing actor qualifications, clearance level, and digital signatures.
