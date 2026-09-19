# Blockchain Forensic Audit

## Reality Check
There is currently **NO RUNNING BESU/QBFT NODE**.

## Evidence
1. `blockchain.adapter.ts` attempts to connect via RPC. If it fails, it sets `connected = false`.
2. If `connected = false` and mode is `demo`, `submitTransaction` returns a synthetic `0xDEMO-mocktx...` hash.
3. `getAssetProof` explicitly returns: `[PROPOSED PILOT DESIGN] Besu/QBFT node not reachable — proof sourced from DB records only`.

## Conclusion
The blockchain integration is merely a target architecture. Actual validation is simulated.
