# 08. MetaMask & Cryptographic Identity Explained

## 1. Why are we using MetaMask in a Defence System?

In military defence procurement, digital accountability requires **cryptographic non-repudiation**. Traditional database passwords can be reset by database administrators, leaving no mathematical proof of who authorized an action.

By pairing defence officer credentials with an Ethereum private key (via MetaMask or hardware security modules), officer approvals and wallet bindings are signed cryptographically using elliptic-curve cryptography (secp256k1).

---

## 2. The Actual MetaMask Flow (Step-by-Step)

```
OFFICER BROWSER (MetaMask)                      BACKEND API (WalletService)
       │                                                    │
       │ 1. Clicks "Connect Wallet"                         │
       │    window.ethereum.request({ eth_requestAccounts })│
       │    Returns address: 0x2ae5b0...                    │
       │                                                    │
       │ 2. POST /api/v1/wallet/challenge                   │
       │    Body: { address: "0x2ae5b0..." }                │
       ────────────────────────────────────────────────────►│
       │                                                    │ 3. Generates UUID nonce
       │                                                    │    Saves to WalletChallenge table
       │                                                    │    (expires in 5 minutes)
       │ 4. Returns { nonce, message }                      │
       │◄───────────────────────────────────────────────────│
       │                                                    │
       │ 5. Prompts MetaMask personal_sign:                 │
       │    "KavachTrust wallet verification                │
       │     Verify ownership of wallet: 0x2ae5b0...        │
       │     Nonce: [uuid]"                                 │
       │    Officer signs with private key                  │
       │    Produces hex signature 0x8f3c...                │
       │                                                    │
       │ 6. POST /api/v1/wallet/bind                        │
       │    Body: { address, signature, nonce }             │
       ────────────────────────────────────────────────────►│
       │                                                    │ 7. Cryptographic Verification:
       │                                                    │    viem.verifyMessage({
       │                                                    │      address, message, signature
       │                                                    │    })
       │                                                    │
       │                                                    │ 8. Database Transaction:
       │                                                    │    - Checks challenge exists & not expired
       │                                                    │    - Checks challenge.consumed == false
       │                                                    │    - Marks challenge.consumed = true
       │                                                    │    - Upserts WalletBinding record
       │ 9. Returns { success: true, verified: true }       │
       │◄───────────────────────────────────────────────────│
```

---

## 3. Code Breakdown & Security Properties

- **Signature Verification**: Implemented in `backend/src/identity/wallet/wallet.service.ts` line 76 using `viem` library:
  ```typescript
  isValid = await verifyMessage({
    address: address as `0x${string}`,
    message,
    signature: signature as `0x${string}`
  });
  ```
- **Replay Attack Prevention**:
  - The challenge table records `consumed: Boolean`.
  - In `wallet.service.ts` line 110, if `challenge.consumed === true`, it throws `BadRequestException('Challenge already consumed')`.
  - Once verified, the challenge is immediately updated to `consumed = true`.
- **Identity Tying**: The challenge explicitly checks `challenge.userId === userId`. An attacker cannot sign a challenge intended for User A and bind it to User B.
- **TTL Expiry**: Nonces expire in 5 minutes (`expiresAt = new Date(Date.now() + 5 * 60 * 1000)`). Expired challenges are rejected.

---

## 4. Behavior in Demo Mode

In `wallet.service.ts` lines 35-39 and 90-93:
- If `process.env.APP_ENV === 'demo'` and the database is offline:
  - `generateChallenge` skips database write and logs: `Generating fake challenge for 0x... (DEMO mode)`.
  - `verifySignatureAndBind` still performs cryptographic signature verification via viem, but skips database persistence, returning `{ success: true, verified: true }`.
- **CRITICAL AUDIT NOTE**: In production, `APP_ENV` must **never** be set to `demo`, or nonces will not be persisted.