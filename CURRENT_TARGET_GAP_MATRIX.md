# CURRENT_TARGET_GAP_MATRIX.md

Frozen TARGET stack vs CURRENT repository. Status vocabulary: **MATCH | PARTIAL | MISSING | CONFLICT | UNKNOWN**.

Implementation status in the master matrix uses: REAL | PARTIAL | MOCK | SIMULATED | PROPOSED | MISSING | BROKEN | UNKNOWN.

---

## A. Technology gap (target vs current)

| TARGET | CURRENT | STATUS |
|---|---|---|
| Node.js + TypeScript runtime (backend) | Python FastAPI backend; Node only for Vite + Hardhat | CONFLICT |
| NestJS modular monolith | FastAPI routers, almost no service layer except blockchain.py | CONFLICT |
| REST + OpenAPI 3.1 | REST + FastAPI-generated OpenAPI 3.x (version not pinned as 3.1 artifact) | PARTIAL |
| Zod | Pydantic v2 on backend; no Zod | MISSING |
| PostgreSQL | SQLite | CONFLICT |
| Prisma | SQLAlchemy 2 | CONFLICT |
| OIDC + JWT | Password + HS256 JWT | CONFLICT |
| WebAuthn | none (Settings shows fake 2FA) | MISSING |
| mTLS | none | MISSING |
| Casbin RBAC+ABAC | ad hoc require_role on one route | CONFLICT |
| PostgreSQL RLS | none | MISSING |
| X.509 / PKI | none | MISSING |
| did:web | DID strings in DB (`did:ethr:sepolia:...` / UI `did:bel:...`) | CONFLICT |
| W3C VC 2.0-shaped JSON | Actor.credential_status string only | MISSING |
| SHA-256 | Field exists; **not computed on server for uploads** | PARTIAL |
| Ed25519 app signatures | none | MISSING |
| ECDSA secp256k1 chain sigs | Hardhat/geth accounts if node up | PARTIAL |
| AES-256-GCM | none | MISSING |
| MinIO / S3 | unused `storage_provider=local`; no files | MISSING |
| Custom SHA-256 Merkle | none | MISSING |
| Hyperledger Besu | Hardhat | CONFLICT |
| QBFT | Hardhat default | CONFLICT |
| Solidity | KavachTrustSBT.sol | MATCH (language) |
| OpenZeppelin | ERC721 + Ownable | PARTIAL (no 5192) |
| ERC-5192-style passport | custom `_update` soulbound | PARTIAL |
| Foundry | Hardhat only | CONFLICT |
| Slither | none | MISSING |
| viem | web3.py (+ ethers in Hardhat) | CONFLICT |
| Blockchain Adapter | BlockchainService mixed in request path | CONFLICT |
| Transactional Outbox + worker | sync wait_for_receipt | CONFLICT |
| Message broker none | none | MATCH (prototype constraint) |
| Append-only hash-chained PG audit | SQLite table, unused chain columns, no writers | PARTIAL (schema idea only) |
| Vitest + Supertest + Testcontainers | pytest + TestClient; sqlite file | CONFLICT |
| OWASP ZAP | none | MISSING |
| Pino | structlog (request middleware) | CONFLICT |
| Prometheus + Grafana | none | MISSING |
| OpenTelemetry | none | MISSING |
| Sentry | none | MISSING |
| Docker Compose | none | MISSING |
| GitHub Actions | none | MISSING |

---

## B. Master feature matrix

| FEATURE | CURRENT IMPLEMENTATION | STATUS | VERIFIED? | TARGET REQUIREMENT | GAP |
|---|---|---|---|---|---|
| Frontend | React 19 + Vite 8 + TS 5.7 + Tailwind 4 + React Router 8 | REAL | UNKNOWN (no FE tests) | keep as current FE | Wire to Nest API; remove dual mock |
| Authentication | Role-picker + shared password + JWT localStorage | PARTIAL | pytest login exists, not run here | OIDC+JWT+WebAuthn | Replace demo login |
| Authorization | Sidebar hide + 1 admin endpoint | PARTIAL | UNKNOWN | Casbin RBAC+ABAC + RLS | Almost all APIs open to any user |
| DID | DB/UI strings | MOCK | n/a | did:web | Resolver + docs |
| VC | credential_status field | MOCK | n/a | VC 2.0 JSON | Issue/verify |
| PKI | none | MISSING | n/a | X.509 | All |
| Evidence | metadata API; POST broken; no bytes | BROKEN / MOCK | n/a | MinIO + server SHA-256 | Storage + hash + versioning API |
| Storage | unused ./uploads | MISSING | n/a | MinIO | All |
| Audit | GET empty-capable table; UI lies about crypto | MOCK / PARTIAL | n/a | append-only hash chain | Writers + immutability |
| Merkle | none | MISSING | n/a | custom SHA-256 Merkle | All |
| Outbox | none | MISSING | n/a | transactional outbox | All |
| Worker | none | MISSING | n/a | worker | All |
| Database | SQLite create_all | REAL (legacy) | UNKNOWN | PostgreSQL+Prisma | Replace engine |
| Blockchain | Hardhat optional + mock fallback | SIMULATED / PARTIAL | UNKNOWN | Besu QBFT + adapter | Replace network + SDK |
| Consensus | Hardhat | SIMULATED | n/a | QBFT | Replace |
| Smart Contract | OZ ERC721 soulbound custom | REAL (code) | UNKNOWN (no tests) | ERC-5192-style + Foundry/Slither | Interface + tests + security |
| Certification | GET list; POST mint no gates | PARTIAL | UNKNOWN | gated mint via adapter/outbox | Prerequisites + roles |
| Verification | mock VerificationCenter | MOCK | n/a | real recompute + chain read | All |
| Observability | structlog request id | PARTIAL | n/a | Pino OTel Prom Sentry | Replace |
| Deployment | local uvicorn + vite :8443 | LOCAL ONLY | n/a | Docker Compose | All |
| CI/CD | none | MISSING | n/a | GitHub Actions | All |
| Testing | 6 pytest cases auth/assets | PARTIAL | UNKNOWN this run | Vitest/Supertest/Testcontainers + Foundry + ZAP | Expand + retarget |

---

## C. Conflicts that matter

| CURRENT | TARGET | WHY IT MATTERS |
|---|---|---|
| FastAPI/Python | NestJS/TS | Next agent must not extend FastAPI as destination |
| SQLite/SQLAlchemy | PostgreSQL/Prisma | Types, RLS, migrations |
| Hardhat/web3.py | Besu/viem adapter | Trust, consensus, SDK |
| Sync mint in HTTP | Outbox + worker | Timeouts, consistency |
| Fake role login | OIDC/WebAuthn | Real identity |
| No files | MinIO | Evidence trust |
| Unused hash columns | Hash-chained audit + Merkle | Do not claim tamper-evidence |
| DID strings | did:web | Interop |
| HS256 shared secret | enterprise JWT/OIDC | Crypto design |
| Custom SBT | keep semantics, add 5192-style completeness | Preserve non-transferability |

---

## D. Preserve vs replace (pointer)

See `FINAL_AI_PROJECT_HANDOFF.md` sections P–R. Semantics of 6 lifecycle states, 4 roles, SBT non-transfer, PSC Electronic Fuze **story**, REST resource names: **PRESERVE**. FastAPI/SQLite/Hardhat-in-request/demo password: **REPLACE**.
