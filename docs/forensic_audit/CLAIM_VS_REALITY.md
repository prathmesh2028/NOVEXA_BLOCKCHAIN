# Claim vs Reality

| Claim | Reality | Status |
|---|---|---|
| "MetaMask cryptographically verifies identity" | `verifyMessage` is used, so crypto verification is real. | VERIFIED |
| "Blockchain integration complete" | No Besu/QBFT node running. Adapter simulates txs. | TARGET ARCHITECTURE ONLY |
| "Evidence stored on MinIO" | Falls back to local disk if MinIO is down. | CONDITIONALLY TRUE |
| "Supply Chain is implemented" | No models, no services. | FALSE / NOT IMPLEMENTED |
| "Worker is idempotent" | DB unique constraints enforce exactly-once. | VERIFIED |
