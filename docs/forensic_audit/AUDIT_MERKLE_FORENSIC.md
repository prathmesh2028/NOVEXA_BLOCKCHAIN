# Audit Trail & Merkle Forensics

## Findings
- `audit.service.ts` and `merkle.service.ts` exist.
- Audit events are written to the `AuditEvent` Prisma model.
- Hash chaining is implemented on digital payloads.
