# Phase 5: Quality (Tests, Security, & Documentation)

This phase ensures the KavachTrust backend is reliable, secure, and well-documented. We will add Pytest integration tests for key endpoints, lock down API security via dependencies, and add comprehensive backend documentation.

## Proposed Changes

### 1. Tests & Validation
Add integration testing for the FastAPI application using `pytest` and `httpx`.

#### [NEW] `backend/tests/conftest.py`
*   Set up a `TestClient` and an in-memory SQLite database (`sqlite:///:memory:`) for isolated test runs.
*   Create standard fixtures (`test_db`, `client`, `auth_headers`).

#### [NEW] `backend/tests/test_auth.py`
*   Test successful login (yielding JWT token).
*   Test failed login (invalid credentials).

#### [NEW] `backend/tests/test_assets.py`
*   Test retrieving assets with an authenticated client.
*   Test unauthorized access (no token).

### 2. Security Hardening
*   **Verify JWT settings**: Ensure `get_settings().access_token_expire_minutes` is properly used.
*   **Rate Limiting / Origin Headers**: Check `CORSMiddleware` in `main.py` is locked down using `settings.cors_origin_list` instead of open `["*"]` in production contexts. (Already implemented mostly).
*   **Dependency Injection**: Confirm all authenticated endpoints use `Depends(get_current_user)`.

### 3. Documentation
*   Ensure all endpoints have robust docstrings and `response_model` annotations.
*   **[NEW] `backend/README.md`**: Add instructions on how to run the backend, create the local `dev.db`, interact with the Hardhat blockchain node, and run tests.

## Verification Plan
1. Run `pytest backend/tests/ -v` to ensure all integration tests pass with 100% success.
2. Check the swagger UI (`/docs`) to ensure metadata and response schemas are clear.
3. Validate standard endpoints return `401 Unauthorized` without a token.
