# KAVACHTRUST OPERATIONS RUNBOOK

**Version:** 2.0.0
**Date:** 2026-09-29
**System:** KavachTrust Asset Trust & Certification Platform

---

## 1. Prerequisites

### Software Requirements
- Node.js: 18.x or higher
- pnpm or npm package manager
- Docker (for MinIO and Besu containers)
- PostgreSQL client (for direct database access if needed)
- Git

### Infrastructure Requirements
- Supabase PostgreSQL database (remote)
- Hyperledger Besu QBFT network (local Docker)
- MinIO S3-compatible storage (local Docker)
- Backend API server (Node.js/NestJS)
- Frontend application (React/Vite)

---

## 2. Environment Variables Required

### Backend (`backend/.env`)
```bash
# Database
DATABASE_URL="postgresql://user:password@host:port/database"

# Application
NODE_ENV=development
APP_ENV=development
PORT=8000

# JWT
JWT_SECRET=<your-jwt-secret>
JWT_EXPIRES_IN=7d

# MinIO/S3
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=<your-access-key>
MINIO_SECRET_KEY=<your-secret-key>
MINIO_USE_SSL=false
MINIO_BUCKET=kavachtrust-evidence

# Blockchain
BLOCKCHAIN_RPC_URL=http://localhost:8545
BLOCKCHAIN_CHAIN_ID=31337
CONTRACT_ADDRESS=0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9
BLOCKCHAIN_CONFIRMATIONS_REQUIRED=1
BLOCKCHAIN_PRIVATE_KEY=<your-private-key>
DEFAULT_NFT_RECIPIENT=0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266

# CORS
FRONTEND_URL=http://localhost:5173
```

### Frontend
Frontend uses Vite and reads configuration from environment variables during build time:
- `VITE_API_URL=http://localhost:8000/api/v1`
- `VITE_DEMO_MODE=false` (set to `true` for demo mode)

---

## 3. Supabase Configuration

### Connection
- Database URL configured in `DATABASE_URL`
- Connection pooling via PgBouncer (transaction-pool mode)

### Schema
- Tables managed via Prisma migrations
- Do not manually modify schema in Supabase dashboard without corresponding Prisma migration

### Seeding
- Run seed data: `cd backend && npx prisma db seed`
- Seed file: `backend/prisma/seed.ts`
- Creates users, roles, assets, evidence, certifications, and audit events

### Backup
- Supabase provides automated backups
- For manual backup: use Supabase dashboard or `pg_dump`

---

## 4. Backend Startup

### Development Mode
```bash
cd backend
npm run start:dev
```

### Production Mode
```bash
cd backend
npm run build
npm run start:prod
```

### Health Check
```bash
curl http://localhost:8000/api/v1/health
```

Expected response:
```json
{
  "status": "ok",
  "service": "kavachtrust-api",
  "version": "2.0.0"
}
```

---

## 5. Frontend Startup

### Development Mode
```bash
cd frontend
npm run dev
```

Access at: `http://localhost:8443`

### Production Build
```bash
cd frontend
npm run build
npm run preview
```

### Health Check
Access the base URL in browser: `http://localhost:8443`

---

## 6. Worker Startup

The worker is embedded in the backend application and starts automatically when the backend starts.

### Worker Behavior
- Polls for outbox events every 5 seconds
- Runs reconciliation for stranded transactions every 60 seconds
- Uses worker ID for logging and event claiming

### Worker Logs
Look for `[WorkerService]` log entries in backend logs:
```
[WorkerService] Worker worker-<id> started
[WorkerService] Running reconciliation for stranded transactions...
[WorkerService] Mint request for certification <cert-id>: asset <asset-id>
```

---

## 7. Besu Startup

### Docker Compose
```bash
cd docker/besu  # or wherever Besu compose file is located
docker-compose up -d
```

### Verification
```bash
curl -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
```

Expected response:
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": "0x<block-hex>"
}
```

### Current Contract
- Address: `0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9`
- Network: BEL-TRUST-CHAIN
- Chain ID: 31337

---

## 8. MinIO Startup

### Docker Compose
```bash
cd docker/minio  # or wherever MinIO compose file is located
docker-compose up -d
```

### Access
- Console: `http://localhost:9001`
- API: `http://localhost:9000`
- Default credentials (change in production):
  - Username: `minioadmin`
  - Password: `minioadmin`

### Bucket
- Bucket name: `kavachtrust-evidence`
- Created automatically on first use

---

## 9. Contract Configuration

### Current Deployment
- **Contract Address:** `0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9`
- **Network:** Hyperledger Besu QBFT
- **Chain ID:** 31337
- **RPC:** `http://localhost:8545`

### Contract ABI
Located at: `contracts/artifacts/contracts/KavachTrustSBT.sol/KavachTrustSBT.json`

### Key Functions
- `mintCertification(address to, string assetId, string batchId, string evidenceHash)`
- `getCertification(uint256 tokenId)`
- `ownerOf(uint256 tokenId)`

### Events
- `CertificationMinted(uint256 indexed tokenId, string assetId, string batchId, string evidenceHash, uint256 issuedAt)`
- `Locked(uint256 tokenId)`

---

## 10. Health Checks

### Backend Health
```bash
curl http://localhost:8000/api/v1/health
```

### Database Health
Backend health check includes database connectivity. Verify:
```bash
curl http://localhost:8000/api/v1/health
```

### Besu Health
```bash
curl -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
```

### MinIO Health
Access MinIO console: `http://localhost:9001`

---

## 11. Blockchain Connectivity Verification

### RPC Test
```bash
curl -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
```

### Contract Read Test
Use `contracts/verify-deployment.js` or similar script to verify contract exists:
```bash
cd contracts
node verify-deployment.js
```

### Transaction Test
Create a certification through the API and verify it appears on-chain.

---

## 12. MinIO Verification

### List Bucket Contents
```bash
mc ls local/kavachtrust-evidence
```

### Upload Test
Upload evidence through the application UI and verify it appears in MinIO.

### Integrity Test
Verify SHA-256 hash matches between upload and retrieval.

---

## 13. Database Verification

### Check Connection
```bash
cd backend
npx prisma db push --accept-data-loss  # DANGEROUS - only for schema sync
```

### View Data
Use Prisma Studio:
```bash
cd backend
npx prisma studio
```

### Check Certifications
```bash
curl http://localhost:8000/api/v1/certifications \
  -H "Authorization: Bearer <token>"
```

---

## 14. Worker/Outbox Troubleshooting

### Check Worker Status
Look for worker logs in backend output:
```
[WorkerService] Worker worker-<id> started
```

### Check Pending Events
Query database directly or add API endpoint to view outbox events.

### Common Issues

#### Events Not Processing
1. Check worker is running (logs show started)
2. Check Besu RPC is accessible
3. Check contract address is correct in `.env`
4. Check recipient address resolution (user wallet bindings)

#### Events Stuck in PROCESSING
Worker reconciliation resets events stuck in PROCESSING for >5 minutes to PENDING.

#### Transaction Failed
Check blockchain transaction records for error messages:
```bash
curl http://localhost:8000/api/v1/blockchain/transactions \
  -H "Authorization: Bearer <token>"
```

---

## 15. Besu Recovery/Restart

### Restart Besu
```bash
cd docker/besu
docker-compose restart
```

### Reset Besu (DANGEROUS)
```bash
cd docker/besu
docker-compose down -v
docker-compose up -d
```

This will clear all blockchain data.

### Check Logs
```bash
docker-compose logs -f besu
```

---

## 16. MinIO Recovery

### Restart MinIO
```bash
cd docker/minio
docker-compose restart
```

### Reset MinIO (DANGEROUS)
```bash
cd docker/minio
docker-compose down -v
docker-compose up -d
```

This will delete all stored evidence.

---

## 17. Common Failures

### Backend Won't Start
1. Check DATABASE_URL is correct
2. Check Supabase is accessible
3. Check port 8000 is not in use
4. Check `.env` file exists

### Worker Not Processing
1. Check Besu RPC is accessible
2. Check contract address in `.env`
3. Check blockchain private key is valid
4. Check DEFAULT_NFT_RECIPIENT is valid

### Evidence Upload Fails
1. Check MinIO is running
2. Check MINIO credentials are correct
3. Check bucket exists
4. Check file size limits

### Certification Mint Fails
1. Check Besu is accessible
2. Check contract is deployed
3. Check worker is running
4. Check recipient address is valid

---

## 18. Safe Recovery Procedures

### Database Schema Drift
If schema is out of sync:
```bash
cd backend
npx prisma migrate reset  # DANGEROUS - clears data
```

Or for non-destructive sync:
```bash
cd backend
npx prisma db push  # May fail with data loss
```

### Stuck Certification
If certification is stuck in PENDING:
1. Check worker logs for errors
2. Check blockchain transaction record
3. If no transaction exists, revoke and recreate certification
4. If transaction exists, let reconciliation process it

### Besu Chain Stuck
If Besu is not producing blocks:
1. Check validator nodes are running
2. Check network connectivity
2. Restart Besu if necessary
3. Last resort: reset chain (DANGEROUS)

---

## 19. Demo Startup Sequence

### Start Order
1. Start MinIO: `docker-compose up -d` (in MinIO directory)
2. Start Besu: `docker-compose up -d` (in Besu directory)
3. Wait for Besu to produce blocks (check via RPC)
4. Start backend: `cd backend && npm run start:dev`
5. Wait for backend health check to pass
6. Start frontend: `cd frontend && npm run dev`
7. Access application at `http://localhost:8443`

### Demo Mode
Set `VITE_DEMO_MODE=true` in frontend environment or configure via UI if available.

### Seed Demo Data
```bash
cd backend
npx prisma db seed
```

---

## 20. Stop/Shutdown Procedure

### Stop Order (Reverse of Startup)
1. Stop frontend: Ctrl+C in frontend terminal
2. Stop backend: Ctrl+C in backend terminal
3. Stop MinIO: `docker-compose down` (in MinIO directory)
4. Stop Besu: `docker-compose down` (in Besu directory)

### Verify All Stopped
Check processes:
```bash
# Check for Node.js processes
ps aux | grep node

# Check for Docker containers
docker ps
```

---

## 21. Security Notes

### Never Commit
- `.env` files with real secrets
- Private keys
- Database passwords
- JWT secrets

### Rotate Secrets
- JWT_SECRET: rotate periodically
- BLOCKCHAIN_PRIVATE_KEY: rotate periodically
- MINIO credentials: rotate periodically

### Access Control
- Backend API requires JWT authentication
- RBAC enforced via Casbin
- CORS configured to allow only specific origins

---

## 22. Monitoring and Logging

### Backend Logs
Development mode logs to console:
```
npm run start:dev
```

### Worker Logs
Worker logs are prefixed with `[WorkerService]`

### Database Logs
Check Supabase dashboard for database logs

### Besu Logs
```bash
docker-compose logs -f besu
```

### MinIO Logs
```bash
docker-compose logs -f minio
```

---

## 23. Performance Tuning

### Database Connection Pool
- Prisma uses connection pooling via PgBouncer
- Adjust pool size in DATABASE_URL if needed

### Worker Polling
- Default: poll every 5 seconds
- Adjust in `worker.service.ts` if needed

### Blockchain Confirmations
- Default: 1 confirmation required
- Adjust via `BLOCKCHAIN_CONFIRMATIONS_REQUIRED` environment variable

---

## 24. Backup and Restore

### Database Backup
Use Supabase dashboard backup feature or:
```bash
pg_dump DATABASE_URL > backup.sql
```

### Database Restore
```bash
psql DATABASE_URL < backup.sql
```

### Evidence Backup
MinIO data is stored in Docker volume. Backup volume:
```bash
docker run --rm -v minio_data:/data -v $(pwd):/backup alpine tar czf /backup/minio-backup.tar.gz /data
```

---

## 25. Troubleshooting Checklist

When something doesn't work:

1. Check all services are running (backend, frontend, Besu, MinIO)
2. Check environment variables are correct
3. Check logs for error messages
4. Check health endpoints
5. Check network connectivity
6. Check database connectivity
7. Check blockchain connectivity
8. Check file permissions
9. Check port availability
10. Check for recent changes

---

**Runbook Version:** 1.0
**Last Updated:** 2026-09-29
**Maintainer:** KavachTrust Team
