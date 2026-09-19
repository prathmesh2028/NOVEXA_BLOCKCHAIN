# Backend Forensic Audit

## Startup
- `main.ts` -> `AppModule`.
- Runs on NestJS. 
- Utilizes `PrismaService` for database connections.

## Modules
- **Identity/Auth**: JWT based, Casbin for RBAC.
- **Asset Management**: Basic CRUD for Assets and Batches.
- **Trust**: Contains `blockchain` and `outbox` modules.
- **Notifications**: Uses an injection token `NotificationPort`.

## Missing
- **Supply Chain**: No backend module exists.
