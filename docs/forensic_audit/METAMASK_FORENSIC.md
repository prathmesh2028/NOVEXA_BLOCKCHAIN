# MetaMask Forensic Audit

## Execution Path
1. Frontend calls `walletApi.getChallenge`.
2. Backend generates nonce.
3. Frontend signs nonce via `viem`.
4. Backend `verifySignatureAndBind` uses `viem.verifyMessage`.

## Findings
- **Real Cryptography**: The backend DOES perform actual signature verification using `viem`.
- **Demo Mode Flaw**: If `APP_ENV=demo`, the backend skips database persistence of the challenge and binding, and returns success immediately after signature verification.
