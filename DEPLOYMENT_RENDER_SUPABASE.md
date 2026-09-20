# 🚀 Deployment Guide: Render (Backend) + Supabase (PostgreSQL)

This guide walks you through deploying the **KavachTrust / Novexa** backend on **Render** and database on **Supabase**, and connecting the frontend to it.

---

## 1. Supabase Setup (Database)

1. Go to [supabase.com](https://supabase.com) and create a new project.
2. In the project dashboard, go to **Project Settings** (gear icon) → **Database**.
3. Under **Connection String**, select the **URI** tab.
4. Choose **Mode: Session** (port `5432`) or **Mode: Transaction** (port `6543`).
   Example:
   ```text
   postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true
   ```
   *(Replace `[YOUR-PASSWORD]` with your actual database password).*

---

## 2. Render Setup (Backend Web Service)

1. Go to [render.com](https://render.com) and click **New +** → **Web Service**.
2. Connect your GitHub repository (`NOVEXA_BLOCKCHAIN`).
3. Set the following service settings:
   - **Name**: `kavachtrust-backend` (or any preferred name)
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**:
     ```bash
     pnpm install && pnpm prisma generate && pnpm prisma migrate deploy && pnpm run build
     ```
   - **Start Command**:
     ```bash
     node dist/main
     ```
   - **Instance Type**: Free (or Starter)

4. Scroll down to **Environment Variables** and add the keys from [`backend/.env.render.example`](file:///c:/Users/dhira/Downloads/NOVEXA_BLOCKCHAIN/backend/.env.render.example):

| Key | Example Value | Description |
|---|---|---|
| `NODE_ENV` | `production` | Production environment flag |
| `APP_ENV` | `production` | App mode |
| `PORT` | `8000` | Port listened by the server |
| `API_PREFIX` | `/api/v1` | Base API routing prefix |
| `DATABASE_URL` | `postgresql://postgres.[REF]:[PASS]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true` | Supabase Postgres URL |
| `JWT_SECRET` | `kavach_super_secret_jwt_key_defence_trust_2026_prod` | 32+ character secret string |
| `CORS_ORIGINS` | `http://localhost:8443,http://localhost:5173,https://your-frontend.vercel.app` | Allowed frontend domains |
| `BLOCKCHAIN_MODE` | `demo` | Safe fallback if no live RPC node is running |
| `BLOCKCHAIN_PRIVATE_KEY` | `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80` | Required key format |
| `MINIO_ACCESS_KEY` | `kavach_minio_access` | Storage fallback key |
| `MINIO_SECRET_KEY` | `kavach_minio_secret` | Storage fallback secret |

5. Click **Deploy Web Service**.
6. When deployment finishes, copy your Render service URL (e.g., `https://kavachtrust-backend.onrender.com`).

---

## 3. Frontend Connection Setup

1. Open your local frontend environment file [`frontend/f1/.env`](file:///c:/Users/dhira/Downloads/NOVEXA_BLOCKCHAIN/frontend/f1/.env) and [`.env`](file:///c:/Users/dhira/Downloads/NOVEXA_BLOCKCHAIN/.env).
2. Set `VITE_API_URL` to your Render backend URL:
   ```ini
   VITE_API_URL=https://kavachtrust-backend.onrender.com
   ```
   *(Do **not** add `/api/v1` at the end — the code adds it automatically).*
3. If deploying frontend to **Vercel**, **Netlify**, or **Cloudflare Pages**:
   - Add the environment variable `VITE_API_URL = https://kavachtrust-backend.onrender.com` in their dashboard settings.
   - Build Command: `pnpm run build:frontend`
   - Output Directory: `dist`

---

## 4. Health Check Verification
After deployment, verify your backend is healthy by visiting:
```text
https://your-backend-service.onrender.com/api/v1/health
```
It should return:
```json
{"status":"ok","timestamp":"..."}
```
