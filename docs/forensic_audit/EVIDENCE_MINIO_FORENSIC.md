# Evidence & MinIO Forensics

## Findings
- **Implementation**: `minio.service.ts` attempts to connect to MinIO.
- **Fallback**: If MinIO is unreachable, it falls back to real local filesystem storage at `storage/evidence`.
- **Conclusion**: Evidence persistence is real, but may end up on local disk rather than an object store depending on infrastructure availability.
