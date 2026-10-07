# KavachTrust deployment: Vercel + Render

This guide deploys the active application in this repository:

- Frontend: React 19 + Vite in `frontend/f1`, deployed to Vercel
- Backend: NestJS + Prisma in `backend`, deployed to Render
- Database: Render PostgreSQL
- Evidence files: an external S3-compatible object store (recommended) or another
  reachable MinIO/S3 service
- Blockchain: an externally reachable EVM JSON-RPC endpoint

Do not deploy the local `besu/` network, local PostgreSQL, or local MinIO
configuration to production. Those are development services.

## 1. Before deploying

1. Push the repository to GitHub.
2. Create production credentials:
   - a long random `JWT_SECRET` (at least 16 characters; 64 random bytes is
     recommended);
   - a dedicated PostgreSQL database/user;
   - dedicated object-storage credentials and a private bucket;
   - a blockchain signing key funded only for the required operations.
3. Decide the public domains:
   - Vercel frontend, for example `https://kavachtrust.vercel.app`;
   - Render API, for example `https://kavachtrust-api.onrender.com`.
4. Do not commit `backend/.env`, private keys, database URLs, or object-storage
   secrets. Add them only in the platform secret managers.

## 2. Use the existing Render PostgreSQL database

1. Open the existing Render PostgreSQL service linked to this application.
2. Copy its **Internal Database URL** and set it manually as the backend
   `DATABASE_URL`. Do not use a Supabase URL and do not commit the URL.
3. Use the internal URL when the API is also on Render; it avoids routing
   database traffic over the public internet.
4. Back up the database before production migrations and enable Render's backup
   option where available.

The repository includes [`backend/.env.example`](../backend/.env.example) as a
safe checklist. It contains placeholders only; `backend/.env` is ignored and
must never be committed.

## 3. Create the Render backend web service

Create **New > Web Service**, connect the repository, and use these settings:

| Setting | Value |
| --- | --- |
| Root Directory | `backend` |
| Runtime | Node |
| Build Command | `corepack enable && corepack prepare pnpm@9.15.4 --activate && pnpm install --frozen-lockfile && pnpm prisma generate && pnpm build` |
| Start Command | `pnpm prisma migrate deploy && pnpm start:prod` |
| Health Check Path | `/health` |
| Auto-deploy | Enabled for the production branch |

Render provides the `PORT` variable. The application listens on that value, so
do not hard-code a different port in the start command.

### Required Render environment variables

Set these under the Render service's **Environment** tab. Values below are
examples or placeholders; replace every placeholder with a production value.

```ini
NODE_ENV=production
APP_ENV=production
LOG_LEVEL=info
API_PREFIX=/api/v1

DATABASE_URL=<Render Internal Database URL>
JWT_SECRET=<long random production secret>
JWT_ISSUER=kavachtrust
JWT_AUDIENCE=kavachtrust-api
JWT_EXPIRY=8h

# Comma-separated browser origins. Add the final Vercel custom domain too.
CORS_ORIGINS=https://kavachtrust.vercel.app

# S3-compatible evidence storage. Do not use localhost or local MinIO in Render.
MINIO_ENDPOINT=<S3-compatible host>
MINIO_PORT=443
MINIO_USE_SSL=true
MINIO_ACCESS_KEY=<object-storage access key>
MINIO_SECRET_KEY=<object-storage secret>
MINIO_BUCKET=kavachtrust-evidence

# Blockchain configuration
BLOCKCHAIN_MODE=real
BLOCKCHAIN_RPC_URL=<external EVM JSON-RPC URL>
BLOCKCHAIN_CHAIN_ID=<network chain ID>
BLOCKCHAIN_PRIVATE_KEY=<dedicated signer private key>
CONTRACT_ADDRESS=<deployed KavachTrustSBT address>
BLOCKCHAIN_NETWORK_NAME=<network name>
BLOCKCHAIN_CONFIRMATIONS_REQUIRED=1

# Set these only when the corresponding feature is configured.
OIDC_ISSUER_URL=
OIDC_CLIENT_ID=
OIDC_CLIENT_SECRET=
AES_KEY=
SENTRY_DSN=
DEFAULT_NFT_RECIPIENT=
WEBAUTHN_RP_NAME=KavachTrust
WEBAUTHN_RP_ID=kavachtrust.vercel.app
WEBAUTHN_ORIGIN=https://kavachtrust.vercel.app
```

`PORT` is optional because Render injects it and the backend defaults to `10000`.
Do not use `prisma db push` or run the demo seed from the Render start command:
restarts must apply committed migrations only and must not overwrite production
records.
The backend's environment validation also requires `MINIO_ACCESS_KEY`,
`MINIO_SECRET_KEY`, and `BLOCKCHAIN_PRIVATE_KEY`, even if a feature is not yet
being used. Use real secret values rather than local development defaults.

### Render deployment checks

After the first deploy, check:

```text
https://<render-service>.onrender.com/health
https://<render-service>.onrender.com/readiness
```

`/health` should return HTTP 200. `/readiness` should report a connected
database. The API routes are under `/api/v1`, for example:

```text
https://<render-service>.onrender.com/api/v1/auth/login
```

If the service fails during boot, inspect the deploy logs first. Common causes
are a missing `APP_ENV`, a missing required secret, an invalid `DATABASE_URL`,
or a database migration failure.

## 4. Create the Vercel frontend project

1. In Vercel, choose **Add New > Project** and import the same GitHub
   repository.
2. Set **Root Directory** to `frontend/f1`.
3. Set the Vercel project **Root Directory** to `frontend/f1`. The committed
   [`vercel.json`](../frontend/f1/vercel.json) provides the Vite framework,
   pnpm install command, build command, output directory, and SPA rewrite.
   If Vercel shows these fields in the dashboard, they should be:

   | Setting | Value |
   | --- | --- |
   | Framework Preset | Vite |
   | Build Command | `pnpm build` |
   | Output Directory | `dist` |
   | Install Command | `pnpm install --frozen-lockfile` |

   The committed `frontend/f1/vercel.json` rewrites client-side routes to
   `index.html`; this is required for refreshing routes such as
   `/app/dashboard` directly.

4. Add this Vercel environment variable for **Production**:

   ```ini
   VITE_API_URL=https://<render-service>.onrender.com
   ```

   The frontend automatically appends `/api/v1`. A value that already ends in
   `/api/v1` is also accepted, but using the API origin avoids duplicate-path
   mistakes.
5. Deploy the project.

Vite embeds `VITE_*` values into the browser bundle. Never put JWT secrets,
database credentials, object-storage secrets, or blockchain private keys in
Vercel environment variables.

## 5. Connect CORS and custom domains

1. Copy the final Vercel deployment URL or custom domain.
2. Update Render's `CORS_ORIGINS` to that exact origin, including `https://` and
   without a trailing slash. For multiple origins, separate them with commas:

   ```ini
   CORS_ORIGINS=https://kavachtrust.vercel.app,https://app.example.com
   ```

3. Redeploy the Render service after changing CORS.
4. If using a custom frontend domain, update `WEBAUTHN_RP_ID` and
   `WEBAUTHN_ORIGIN` to the custom domain as well.

## 6. Optional Render worker

The backend contains a separate outbox worker entry point:
`pnpm start:worker`. If blockchain publication must continue independently of
web requests, create a second Render **Background Worker** using the same
repository and environment variables:

| Setting | Value |
| --- | --- |
| Root Directory | `backend` |
| Build Command | `corepack enable && pnpm install --frozen-lockfile && pnpm prisma generate && pnpm build` |
| Start Command | `pnpm start:worker` |

Run migrations from only one service (the web service's start command above),
not from both the web service and worker.

## 7. Smoke-test the production deployment

1. Open the Vercel URL and hard-refresh a nested route.
2. In browser developer tools, confirm API requests go to the Render URL and
   not `localhost`.
3. Log in with a production account.
4. Verify:
   - dashboard and asset list load;
   - an authenticated API request includes its bearer token;
   - evidence upload/download works;
   - database-backed readiness is healthy;
   - blockchain verification or publication works only when the configured RPC,
     chain ID, contract address, and signer are correct.
5. Review Render logs and database records after the smoke test.

## 8. Troubleshooting

| Symptom | Check |
| --- | --- |
| Vercel shows 404 after refreshing a route | Confirm `frontend/f1/vercel.json` is deployed and the Vercel root directory is `frontend/f1`. |
| Browser reports CORS failure | `CORS_ORIGINS` must exactly match the Vercel origin; redeploy Render after changing it. |
| Frontend calls localhost | Set Vercel `VITE_API_URL`, then create a new deployment because Vite values are build-time. |
| Render exits during startup | Check every required environment variable, especially `APP_ENV`, `DATABASE_URL`, MinIO credentials, and `BLOCKCHAIN_PRIVATE_KEY`. |
| `/readiness` is not ready | Verify the Render internal database URL, database availability, and that `prisma migrate deploy` completed. |
| Evidence upload fails | Verify the external S3-compatible endpoint, TLS/port, bucket, credentials, and bucket permissions. |
| Blockchain actions fail | Verify RPC reachability, chain ID, contract address, signer permissions/funds, and `BLOCKCHAIN_MODE`. |
