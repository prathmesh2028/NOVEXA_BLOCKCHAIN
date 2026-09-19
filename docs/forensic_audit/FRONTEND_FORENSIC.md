# Frontend Forensic Audit

## Routing
- `frontend/main.tsx` strictly imports `frontend/f1/main`.
- `f2` and `f3` are dead code and should be ignored/deleted.

## State
- Authentication uses a standard JWT token stored in localStorage.
- Wallet connection uses `window.ethereum` and `viem`.

## Mocks
- In `f1/data/mockData.ts`, various mock data objects exist.
- API calls fall back to mock behavior when the backend returns 404 or fails, or when the backend itself is running in demo mode.
