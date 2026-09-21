# Team Conflict Audit

## High Conflict Files
- `backend/prisma/schema.prisma`: Both Part A (Identity/Auth) and Part B (Assets/Certifications) share this single file.
- `backend/src/app.module.ts`: Shared entry point.
- `frontend/package.json`: Shared dependencies.

## Conclusion
Developers cannot work truly independently as long as they share a monolithic Prisma schema and a single NestJS application.
