# Test Coverage Gap Matrix

## Overview
The backend uses `pytest` and `httpx` (`TestClient`) for integration testing. Currently, only foundational modules have been tested to prove out the DB, Fixture, and Security architecture. There are significant gaps in business logic coverage.

## Current Test Files
1. `backend/tests/test_auth.py`
2. `backend/tests/test_assets.py`
3. `backend/tests/conftest.py` (Fixtures: DB, Client, Auth Headers)

## Gap Matrix

| Domain | Tested Scenarios | Missing Coverage | Risk Level |
|---|---|---|---|
| **Authentication** | Login Success, Login Failure, Current User (`/me`) | Token expiration, Role extraction edge cases | LOW |
| **Assets & Batches** | Unauthorized access block, Empty list retrieval | Asset creation, Batch lifecycle transition, Nested history loading | HIGH |
| **Evidence** | *None* | File upload simulation, DB hash saving, Status verification | HIGH |
| **Certifications** | *None* | Issuance limits, Evidence-requirement assertions | CRITICAL |
| **Blockchain** | *None* | Synchronous Web3 mock interactions, Event parsing, Contract read fallbacks | CRITICAL |
| **Audit / Logs** | *None* | Append-only verification, Immutability checks | MEDIUM |
| **Role-Based Access** | *None* | Verifying `TECHNICIAN` cannot mint certifications, etc. | HIGH |

## Recommendations for Next AI
1. **Immediate**: Add `test_evidence.py` to test the Evidence API endpoint (even with the storage mock).
2. **Immediate**: Add `test_certifications.py` using `unittest.mock.patch` on the Web3 provider to simulate successful SBT minting without requiring Hardhat in CI.
3. **Setup**: Add a `coverage` or `pytest-cov` integration to block PRs if coverage drops below 70%.
