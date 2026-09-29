# Failure Mode Matrix

| Scenario | Expected | Actual | Status |
|---|---|---|---|
| PostgreSQL OFF | Graceful degradation | Switches to demo mode / fallback data if configured, otherwise crashes | VERIFIED |
| MinIO OFF | Save to disk | Saves to `storage/evidence` on local disk | VERIFIED |
| Besu OFF | Queue or fail | Returns `SIMULATED` in demo mode, else fails | VERIFIED |
| Invalid Signature | Reject | `verifyMessage` throws BadRequest | VERIFIED |
| Worker Crash | Retry | Idempotency key prevents duplicate mint | VERIFIED |
