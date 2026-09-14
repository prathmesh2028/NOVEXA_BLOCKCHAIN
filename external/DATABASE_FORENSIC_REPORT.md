# DATABASE FORENSIC REPORT

## CURRENT database

| Item | Actual |
|---|---|
| Engine | SQLite **sync** SQLAlchemy 2.x |
| Config URL | `sqlite+aiosqlite:///./dev.db` (`backend/app/core/config.py`) |
| Runtime URL | `sqlite` after stripping `+aiosqlite` (`backend/app/core/database.py`) |
| File | `backend/dev.db` present in workspace |
| Async | **NOT used**. `aiosqlite` is a dependency; engine is sync |
| PostgreSQL | **MISSING** |
| Prisma | **MISSING** |
| RLS | **MISSING** |
| Migrations | `alembic` in `requirements.txt`; **no alembic/ folder**. Schema via `Base.metadata.create_all` on startup if `app_env==development` |

**Evidence:** `database.py` `_build_engine()`, `main.py` `on_startup()`.

**VERIFIED:** UNKNOWN whether `dev.db` currently contains seed rows (not queried in this extraction). Seed script exists.

---

## Migration mechanism

CURRENT: `create_all` (dev). INTENDED: Prisma migrate + PostgreSQL. CONFLICT.

Tests: `backend/tests/conftest.py` creates `./test_db.sqlite`, `create_all`, deletes users on teardown. Running tests **would write files**. Not executed in this extraction.

---

## Tables and columns

Timezone: `DateTime(timezone=True)` + `_utcnow()` using `datetime.now(timezone.utc)`. SQLite stores naive or ISO depending on SQLAlchemy; **naive vs aware at SQLite layer: PARTIAL**. POST evidence/cert uses `datetime.datetime.utcnow()` (naive UTC) vs model timezone-aware — **CONFLICT**.

### users

| Column | Type | Null | Default | Constraints |
|---|---|---|---|---|
| id | String(36) | no | uuid | PK |
| email | String(255) | no | — | unique, index |
| hashed_password | String(255) | no | — | |
| name | String(255) | no | — | |
| status | String(20) | no | ACTIVE | not enum |
| created_at | DateTime(tz) | no | utcnow | |
| updated_at | DateTime(tz) | no | utcnow onupdate | |

Rel: 1:1 Actor, 1:N UserRole. **No cascade** declared.

### actors

| Column | Type | Null | Default | Constraints |
|---|---|---|---|---|
| id | String(36) | no | uuid | PK |
| user_id | String(36) | no | — | FK users.id unique |
| did | String(255) | no | — | unique, index |
| credential_status | String(20) | no | ACTIVE | |
| wallet_address | String(255) | yes | null | |
| identity_status | String(20) | no | VERIFIED | |
| created_at / updated_at | DateTime(tz) | no | utcnow | |

DID CURRENT: synthetic string in DB (`did:ethr:sepolia:...` in seed). Not resolved, not signed, not did:web.

### roles / user_roles

roles: id, name unique, description nullable, created_at.  
user_roles: unique (user_id, role_id), assigned_at. FKs without ondelete cascade.

### batches

id, batch_id unique indexed, description, created_at. Rel 1:N assets.

### assets

| Column | Notes |
|---|---|
| id | UUID PK |
| asset_id | unique display ID |
| batch_id | FK batches.id **required** |
| type, model | required |
| serial_number | unique indexed |
| lifecycle_state | default UNREGISTERED indexed; **string not FK** |
| verification_status | default PENDING |
| evidence_count | Integer default 0 **denormalized; POST evidence does not increment** |
| evidence_status | default Processing |
| cert_status | default NOT_CERTIFIED |
| cert_id | nullable string **not FK to certifications** |
| supplier | required |
| description | nullable text |
| registered_by_actor_id | FK actors.id required |
| version | Integer default 1 **never incremented in APIs** |
| created_at / updated_at | tz |

### evidence

Required: evidence_id unique, asset_id FK, **filename**, **original_filename**, type, mime_type, size_bytes, sha256_hash indexed, status, event_type, uploaded_by_actor_id FK.  
Optional: blockchain_tx_hash. integrity_verified bool default False. version default 1.

**No file blob column. No storage_path column.**

### evidence_versions

evidence_id FK, version, sha256_hash, filename, size_bytes, uploaded_by_actor_id, created_at. Unused by API.

### lifecycle_events

asset_id, from_state, to_state, actor_id, audit_event_id nullable FK, timestamp indexed. Unused by API. **No state machine enforcement.**

### certifications

cert_id unique, asset_id FK, batch_id FK required, token_id unique nullable, contract_address, network, tx_hash unique nullable, block_number default 0, status default PENDING indexed, issued_by_actor_id, issued_at, confirmed_at nullable, confirmations default 0, timestamps.

### blockchain_transactions

tx_hash unique, network, block_number, status, action, asset_id nullable FK, cert_id nullable FK, confirmations, gas_used, from_address required, contract_address, token_id, timestamp, created_at. **Not written by BlockchainService.**

### blockchain_verifications

tx_hash, verified_at, status, chain_confirmed default UNKNOWN, block_number_verified, details, verified_by_actor_id. **No API.**

### audit_events

event_type indexed, actor_id nullable FK, actor_did, actor_role, action, resource_type, resource_id indexed, timestamp indexed, result default SUCCESS, details, blockchain_tx_hash, **payload_hash**, **previous_event_hash**, request_id. Comment claims append-oriented never deleted — **no DB trigger / no application write / no DELETE guard**. Hash fields unused.

---

## Transactions (critical ops)

SQLAlchemy Session: `autocommit=False`. Routes typically implicit commit on `db.commit()` only in POST evidence/cert.

| Operation | BEGIN/COMMIT | External | ROLLBACK |
|---|---|---|---|
| Asset create | **MISSING API** | — | — |
| Evidence POST | chain **first**, then `db.add`+`commit` | `anchor_evidence` | `except` returns error; **no explicit rollback**; chain not reversed |
| Inspection | **MISSING** | — | — |
| Lifecycle | **MISSING** | — | — |
| Certification POST | mint **first**, then commit | `mint_certification` | same: no rollback of chain |
| Login | read only | — | — |

No transactional outbox.

---

## Seed (`backend/scripts/seed_data.py`)

Creates tables, roles, 4 users (password hash of literal `password`), 3 batches, 5 assets, 2 evidence rows, 2 certs. **Does not seed** audit_events, lifecycle_events, blockchain_transactions, evidence_versions.

User IDs: `u1`–`u4` (not UUIDs). Actor IDs: `a_u1` etc.

Default password: shared demo secret (see SECURITY report; value not repeated beyond identifying it is the seed default).

---

## Indexes / FKs

Indexes: email, did, asset_id, serial_number, lifecycle_state, evidence asset_id/hash, cert_id/status, tx_hash/status, audit event_type/resource/timestamp/request_id.

No `ON DELETE CASCADE` on relationships. SQLite default NO ACTION.

---

## Target vs current

| Target | Current | Status |
|---|---|---|
| PostgreSQL | SQLite | CONFLICT |
| Prisma | SQLAlchemy | CONFLICT |
| RLS | none | MISSING |
| Alembic/Prisma migrations | create_all | CONFLICT |
