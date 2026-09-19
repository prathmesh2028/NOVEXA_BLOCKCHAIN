# Test Forensic Audit

## Findings
- Vitest and Playwright are configured.
- Many tests rely on mock data or demo mode.
- E2E tests in Playwright test the UI against the mock backend state.
- **False Confidence**: Passing tests do not guarantee production readiness because database and blockchain persistence are frequently bypassed in demo/test environments.
