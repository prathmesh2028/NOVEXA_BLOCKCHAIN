# FRONTEND_BACKEND_COMPATIBILITY.md

Keep CURRENT frontend vs CURRENT FastAPI separate from TARGET NestJS.

Existing `FRONTEND_BACKEND_COMPATIBILITY_MATRIX.md` is **stale** (claims frontend login expects user object in login response; current `auth.ts` expects `access_token` then `/me`). This document supersedes it for extraction.

---

## Auth / User / Role

| Topic | Frontend | Backend | Status |
|---|---|---|---|
| Login body | `{email, password}` | `{email, password}` | MATCH |
| Login response | `access_token`, `token_type` | same | MATCH |
| Session | `/auth/me` after login | `UserMeResponse` | MATCH |
| Password | always `"password"` | seed Argon2 of that password | MATCH (demo) |
| Role display | kebab `nft-creator` | `NFT_CREATOR` | MATCH via first-role replace |
| Multiple roles | uses `roles[0]` only | many-to-many | PARTIAL |
| User list | `roles: string[]`, `did` | same | MATCH |
| User list filter | query `role` | query `role_filter` | **MISMATCH** |
| Invite user | button only | no API | MISSING |
| Names/emails | Login uses seed emails; mock USERS_LIST uses bel-defence.in | seed kavachtrust.bel.in | **CONFLICT datasets** |

---

## Asset

| Field FE mock | Field FE API | Field BE | Notes |
|---|---|---|---|
| `id` (display) | `asset_id` + uuid `id` | both | List page uses API `asset_id`; **detail page looks up mock `ASSETS` by route id** — if list links `/assets/${asset_id}` mock may match EF- ids; seed types still differ |
| `batchId` | `batch_id` | display batch_id in JSON | MATCH naming on API |
| `lifecycle` | `lifecycle_state` | lifecycle_state | MATCH on list |
| `verification` | `verification_status` | same | MATCH |
| `serialNumber` | `serial_number` | same | MATCH |
| `registeredBy` name | `registered_by_name` always null in list | FK actor | **GAP** |
| `registeredAt` | `created_at` | created_at | MATCH-ish |
| Create asset | Stub `/app/register` | no POST | MISSING |

Enums: lifecycle names MATCH between mock and dashboard breakdown. cert_status `NOT_CERTIFIED` on assets vs CertStatus union.

---

## Evidence

| Topic | Frontend | Backend | Status |
|---|---|---|---|
| List | `evidenceService` snake_case | snake + size_kb, hash | MATCH list |
| Detail | mock `EVD-2026-001` | seed `EV-9982-1` / uuid | **CONFLICT** |
| `event_type` filter | client sends | backend ignores (uses status_filter) | MISMATCH |
| Upload | button; no client POST | JSON POST broken vs model | BROKEN / UNUSED |
| Hash | truncated in mock | full 64 hex in seed (empty-hash NIST vector on ev1) | CONFLICT |
| `uploadedBy` | name+role in mock | not in list JSON | GAP |

---

## Certification

| Topic | Frontend | Backend | Status |
|---|---|---|---|
| List | API | API | MATCH |
| Detail page | mock CERT-2026-* | seed CERT-8842-A | **CONFLICT** |
| Status | CONFIRMED/PENDING | seed CONFIRMED; POST writes ACTIVE | **MISMATCH** |
| `issued_by` | name + DID in mock | DID only | PARTIAL |
| Mint API client | none | POST exists | GAP |
| Queue / eligible | StubPages | no API | MISSING |

---

## Blockchain

| Topic | Frontend | Backend | Status |
|---|---|---|---|
| List | API `tx_hash` | API | MATCH |
| Filter status | query `status` | `status_filter` | MISMATCH |
| Verify | mock VerificationCenter | no verify route | MISSING |
| Network label | BEL-TRUST-CHAIN | seed “Ethereum Sepolia”; POST “BEL-TRUST-CHAIN” | CONFLICT |

---

## Audit

| Topic | Frontend | Backend | Status |
|---|---|---|---|
| List fetch | API | API | MATCH |
| Timeline props | `AuditEvent` (actor, actorDid, actorRole, assetId, details, blockchainTx) | mapped `{actor: actor_did, role, resource, txHash}` | **SHAPE MISMATCH** — AuditTimeline will miss labels |
| Writes | n/a | none | empty unless DB prefilled |
| Tamper-evident copy | claimed in UI | not implemented | FALSE CLAIM |

---

## Dashboard / Search / Settings

| Topic | Frontend | Backend | Status |
|---|---|---|---|
| Admin metrics | API summary | COUNT | MATCH |
| Banner “847 assets” | hardcoded | not from API | MOCK |
| Attention items | hardcoded EF-2026-00423 | not API | MOCK |
| NFT/Tech/Auditor dashboards | mock ASSETS/AUDIT | — | MOCK |
| Search results schema | title/url/relevance/time_ms; types user, blockchain_tx | label/match_reason; identity, blockchain | **MISMATCH** |
| SearchPage `submitted` | used, never declared | — | **BROKEN** |
| Settings 2FA | UI “Enabled” | no 2FA | MOCK |
| Settings `RoleBadge` named import | `{ RoleBadge }` | file is default export | **BROKEN** |

---

## Compatibility by entity (summary)

| Entity | Field names | Types | Nullability | Enums | IDs | Timestamps | Nested | Overall |
|---|---|---|---|---|---|---|---|---|
| Asset | PARTIAL (camel vs snake) | PARTIAL | PARTIAL | MATCH names | CONFLICT mock vs seed meaning | ISO | no history in API | PARTIAL |
| Batch | FE has no type | — | — | — | display string | — | — | PARTIAL |
| Evidence | PARTIAL | sizeKb vs size_kb | — | Title Case vs mixed | CONFLICT | ISO | versions unused | PARTIAL |
| Lifecycle | UI stepper only | — | — | MATCH names | no events API | — | — | MISSING API |
| Certification | PARTIAL | status ACTIVE vs CONFIRMED | token nullable | CONFLICT | CONFLICT datasets | ISO | — | PARTIAL |
| Audit | MISMATCH to timeline | — | — | SUCCESS/WARNING/FAILED | — | ISO | hash omitted | PARTIAL |
| Blockchain | PARTIAL query params | — | — | — | mock hashes in seed | ISO | — | PARTIAL |
| User | MATCH list | roles[] | did null | status strings | seed vs mock users | ISO | actor on /me | PARTIAL |
| Role | kebab vs SCREAMING | — | — | 4 roles MATCH | — | — | — | PARTIAL |

---

## File-level evidence

| FILE | WHAT IT PROVES |
|---|---|
| `src/services/auth.ts` | token login matches backend |
| `src/pages/assets/AssetsPage.tsx` | list from API |
| `src/pages/assets/AssetDetailPage.tsx` | detail from mockData |
| `src/pages/search/SearchPage.tsx` | expected SearchResult vs backend search.py |
| `backend/scripts/seed_data.py` vs `src/data/mockData.ts` | two synthetic worlds |
