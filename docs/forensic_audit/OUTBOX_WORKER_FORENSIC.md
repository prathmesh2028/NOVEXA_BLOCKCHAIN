# Outbox & Worker Forensics

## Execution
- `WorkerService` polls `OutboxService` every 5 seconds.
- Uses `idempotencyKey` on `BlockchainTransaction` (`MINT:${payload.certificationId}`).

## Exactly Once Guarantees
- The `P2002` Prisma unique constraint error on `idempotencyKey` prevents duplicate transaction submissions if two workers process the same event simultaneously.
- State is tracked (`SUBMITTED`, `PENDING`, `MINED`, `FAILED`).
- Crash recovery is robust as long as the database is online.
