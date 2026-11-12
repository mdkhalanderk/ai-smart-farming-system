# Production Deployment Guide — Krishi Drishti Platform

This project supports three production deployment strategies:
1. **Docker Compose** (Single VPS / Cloud VM — recommended for simplest full-stack hosting)
2. **Vercel / Netlify (Frontend) + Render / Railway (Backend)**
3. **Render Blueprint** (`render.yaml`)

---

## Option 1: Docker Compose (VPS / Cloud Server)

The root [`docker-compose.prod.yml`](./docker-compose.prod.yml) builds both the FastAPI ML backend (with VMamba, Mandi RF, and Yield models) and the Nginx-served React frontend with automatic `/api/` and `/uploads/` proxying.

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

- Frontend & Reverse Proxy: `http://<your-server-ip>:80`
- Backend Health Check: `http://<your-server-ip>:8000/health`
- Persistent Database & Uploads Volume: `krishi_storage:/app/storage` (`APP_DATA_DIR=/app/storage`)

---

## Option 2: Split Deployment (Vercel Frontend + Render/Railway Backend)

### Step A — Deploy Backend (Render / Railway)
1. Connect your repository and select **Docker** runtime using root [`Dockerfile`](./Dockerfile).
2. Mount a persistent disk at `/app/storage`.
3. Set environment variables:
   - `APP_DATA_DIR=/app/storage`
   - `PORT=8000`
   - `ALLOWED_ORIGINS=https://your-frontend-domain.vercel.app`
4. Verify deployment at `https://your-backend-url/health` (should return `{"status": "healthy", "model_loaded": true}`).

### Step B — Deploy Frontend (Vercel / Netlify)
1. Set **Root Directory** to `frontend`.
2. Build Command: `npm ci && npm run build` | Output Directory: `dist`.
3. Set environment variable:
   - `VITE_API_BASE_URL=https://your-backend-url` *(without trailing slash)*
4. SPA routing is preconfigured via [`frontend/vercel.json`](./frontend/vercel.json) and [`frontend/public/_redirects`](./frontend/public/_redirects).

---

## Option 3: Render Blueprint

Push this repo to GitHub and click **New → Blueprint** in Render. [`render.yaml`](./render.yaml) provisions both `krishi-drishti-api` (with persistent 2 GB disk at `/app/storage`) and `krishi-drishti-web`.

After deployment:
- Copy `krishi-drishti-api` URL into `krishi-drishti-web` → `VITE_API_BASE_URL`.
- Copy `krishi-drishti-web` URL into `krishi-drishti-api` → `ALLOWED_ORIGINS`.

