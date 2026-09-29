# Demo Mode Matrix

| Component | Demo Behavior | Real Behavior |
|---|---|---|
| Database | Reads `fallback-data.ts` | Reads PostgreSQL |
| Wallet Challenge | Skips DB save | Saves to `WalletChallenge` |
| Wallet Binding | Skips DB save | Upserts `WalletBinding` |
| Blockchain | Returns `0xDEMO-mocktx...` | Submits viem transaction |
