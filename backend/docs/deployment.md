# KavachTrust Backend — Deployment & Operational Guide

## 1. System Requirements
- Linux (Ubuntu 22.04 LTS or RHEL 9 recommended) or Windows Server
- 4 vCPUs, 8 GB RAM minimum
- 50 GB SSD storage
- Docker Engine >= 24.0 and Docker Compose >= 2.20
- Node.js runtime >= 20.x

---

## 2. Production Environment Configuration
Set production environment variables in `/etc/kavachtrust/backend.env` or `.env`:

```ini
PORT=3001
NODE_ENV=production
DATABASE_URL=postgresql://kavach:<STRONG_PASSWORD>@postgres.internal:5432/kavachtrust?sslmode=require
JWT_SECRET=<STRONG_64_CHAR_HEX_KEY>
JWT_EXPIRY=8h
JWT_ISSUER=kavachtrust-auth-authority
JWT_AUDIENCE=kavachtrust-app
BLOCKCHAIN_RPC_URL=https://besu-node-1.internal:8545
BLOCKCHAIN_CHAIN_ID=1337
BLOCKCHAIN_PRIVATE_KEY=<SECURE_KEYSTORE_REF>
S3_ENDPOINT=minio.internal
S3_PORT=9000
S3_ACCESS_KEY=<MINIO_ACCESS_KEY>
S3_SECRET_KEY=<MINIO_SECRET_KEY>
S3_BUCKET=kavachtrust-evidence
```

---

## 3. Database Deployment & Migrations
Before starting the backend service, deploy database migrations:

```bash
# Run migrations
npx prisma migrate deploy

# Seed baseline roles & reference data (if initial bootstrap)
npx tsx prisma/seed.ts
```

---

## 4. Running via Docker Compose
The provided `docker-compose.yml` launches PostgreSQL and MinIO for local and staging environments:

```bash
docker compose up -d
```

To run the backend in a containerized environment, build the production image:
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate && npm run build

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
EXPOSE 3001
CMD ["node", "dist/main.js"]
```

---

## 5. Health & Monitoring
- **Liveness Probe**: `GET /health` (HTTP 200)
- **Readiness Probe**: `GET /health/ready` (Verifies database connectivity)
- **Prometheus Metrics**: Available for ingestion at standard monitoring endpoints.
- **Structured Logs**: JSON logs emitted to stdout via Pino, easily aggregated by Fluentd, Promtail, or Datadog.
