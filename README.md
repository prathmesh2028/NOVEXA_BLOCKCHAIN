# KavachTrust

KavachTrust is a defense-asset traceability platform for registering assets, collecting technical evidence, recording inspections, managing lifecycle state, and producing tamper-evident verification proofs. This repository contains the web application, NestJS API, PostgreSQL data model, object-storage integration, and EVM smart-contract layer.

## Repository Layout

```text
frontend/f1/       React 19 + Vite application
backend/           NestJS API, Prisma schema, workers, and tests
contracts/         Hardhat project and KavachTrustSBT contract
besu/              Local Hyperledger Besu network configuration
docs/              Current and historical project documentation
e2e/               Playwright API/end-to-end tests
docker-compose.yml PostgreSQL, MinIO, and Besu development services
```

## What Is Implemented

- Asset registration, search, lifecycle transitions, inspections, and technical records
- Evidence metadata and integrity workflows backed by MinIO-compatible object storage
- Certifications and digital asset passports
- Audit events, hash-chain verification, and integrity views
- JWT authentication and Casbin-based role authorization
- Wallet and blockchain verification flows using Viem
- Transactional outbox support for reliable blockchain publication
- Supply-chain, dashboard, notification, and verification API modules
- A Solidity `KavachTrustSBT` contract project with Hardhat compilation and deployment scripts

The frontend is the active product surface under `frontend/f1`. The API is the source of truth for runtime behavior; older audit documents in `docs/archive` are historical and may describe earlier implementations.

## Prerequisites

- Node.js 20 or newer
- pnpm 9 or newer
- Docker Desktop with Docker Compose
- A funded/local EVM account only when exercising blockchain writes

## Quick Start

Install dependencies in the root, backend, and contracts workspaces:

```bash
pnpm install
pnpm --dir backend install
pnpm --dir contracts install
```

Start local PostgreSQL, MinIO, and Besu:

```bash
docker compose up -d
```

Configure the backend in `backend/.env`. At minimum, provide `DATABASE_URL`, `JWT_SECRET`, and the service connection settings required by your workflow. Do not commit secrets.

Generate Prisma Client, apply migrations, and optionally seed reference data:

```bash
pnpm --dir backend prisma:generate
pnpm --dir backend prisma:migrate:deploy
pnpm --dir backend prisma:seed
```

Run the frontend and API in separate terminals:

```bash
pnpm dev:frontend
pnpm dev:backend
```

The Vite UI is normally available at `http://localhost:5173`. The API commonly listens at `http://localhost:3001`; its global prefix is controlled by backend configuration. In development, Swagger is exposed at `/docs`.

## Useful Commands

```bash
# Frontend
pnpm build:frontend
pnpm format

# Backend
pnpm --dir backend build
pnpm --dir backend typecheck
pnpm --dir backend test
pnpm --dir backend test:cov

# Smart contracts
pnpm --dir contracts compile
pnpm --dir contracts node
pnpm --dir contracts deploy

# End-to-end tests
pnpm exec playwright test
```

## Local Services

| Service | Default address | Purpose |
| --- | --- | --- |
| PostgreSQL | `localhost:5432` | Persistent application data |
| MinIO API | `localhost:9000` | Evidence/object storage |
| MinIO console | `localhost:9001` | Local storage administration |
| Besu JSON-RPC | `localhost:8545` | Private EVM network |

Stop services with `docker compose down`. Use `docker compose down -v` only when intentionally resetting local data.

## Architecture

The backend writes domain state and outbox events in PostgreSQL. A worker can publish pending events to the EVM network and record transaction results. Evidence files are stored outside PostgreSQL while their metadata and hashes remain queryable through the API. The frontend consumes the API and provides role-specific routes for administrators, quality inspectors, procurement users, and auditors.

## Documentation

- [Documentation index](docs/README.md)
- [Backend API reference](backend/docs/api.md)
- [Backend architecture](backend/docs/architecture.md)
- [Deployment guide](backend/docs/deployment.md)
- [Backend security notes](backend/docs/security.md)
- [Smart-contract source](contracts/contracts/KavachTrustSBT.sol)

Historical forensic reports and previous implementation snapshots are kept under `docs/archive`, `docs/forensic_audit`, and `docs/project_xray`. They are useful for provenance, but they are not current implementation specifications.

## Security Notes

Never commit private keys, JWT secrets, production database credentials, or MinIO credentials. Use separate credentials for local development and deployment. Review and rotate all default development secrets before exposing any service beyond localhost.

## License

This repository currently declares the backend and contract packages as private/unlicensed. Add the project license and contribution policy before publishing it as an open-source package.
