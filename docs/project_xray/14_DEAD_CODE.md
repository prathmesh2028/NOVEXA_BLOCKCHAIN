# 14. Dead Code & Duplication Audit

## 1. Inventory of Duplicate & Obsolete Artifacts

| Artifact Path | What It Is | Status in Current Repo | Recommendation |
| :--- | :--- | :--- | :--- |
| `frontend/f2`, `frontend/f3` | Historical alternate frontend scaffolds | **DEAD / ABSENT** (Not present in branch filesystem) | Ignore; `f1` is canonical. |
| `update_controllers.cjs` | Legacy migration script in workspace root | **DEAD** (Used during earlier prefix refactoring) | Remove later. |
| `update_imports.cjs` | Legacy script for import rewriting | **DEAD** (One-off helper script) | Remove later. |
| `test_auth.js` | Standalone script testing old auth endpoints | **DEAD** (Hardcoded localhost test) | Remove later. |
| `contracts/test/` | Basic Hardhat contract tests | **ACTIVE** (Valid contract unit tests) | Keep with contracts. |
| `frontend/main.tsx` | One-line proxy importing `./f1/main` | **ACTIVE SHIM** (Allows root vite to resolve) | Keep until path unification. |
| `backend/src/notifications/notification.port.ts` | Decoupling port interface for Part B | **ACTIVE** (Required for Part A/Part B separation) | Keep. |

---

## 2. Merkle Implementation Check

- **Is Merkle duplicated?**: NO.
  - Only **one** Merkle service exists in the backend: `backend/src/asset-management/audit/merkle.service.ts`.
  - Frontend only renders a display badge for the root string (`EvidenceIntegrityPage.tsx`).

---

## 3. Blockchain Adapter Check

- **Is Blockchain Adapter duplicated?**: NO.
  - Only **one** active adapter exists: `backend/src/trust/blockchain/blockchain.adapter.ts`.
  - Used cleanly by `WorkerService` and `BlockchainService`.