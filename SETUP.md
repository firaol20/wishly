# Wishly — Local Development Setup

## Prerequisites
- Node.js 18+
- PostgreSQL (local or Docker)

---

## Step 1 — Database

### Option A: Docker (easiest)
```bash
docker run --name wishly-db -e POSTGRES_USER=wishly -e POSTGRES_PASSWORD=wishly -e POSTGRES_DB=wishly -p 5432:5432 -d postgres:16
```

### Option B: Local PostgreSQL
Create a database called `wishly` and note your connection string.

---

## Step 2 — Backend setup

```bash
cd backend

# Copy environment file
copy .env.example .env
```

Edit `backend/.env` — at minimum fill in:
```
DATABASE_URL="postgresql://wishly:wishly@localhost:5432/wishly"
JWT_SECRET="any-random-string-here"
JWT_REFRESH_SECRET="another-random-string"
GOOGLE_CLIENT_ID="from-google-console"
GOOGLE_CLIENT_SECRET="from-google-console"
GOOGLE_CALLBACK_URL="http://localhost:3001/api/v1/auth/google/callback"
FRONTEND_URL="http://localhost:5173"
```

### Google OAuth setup
1. Go to https://console.cloud.google.com
2. New project → APIs & Services → Credentials → Create OAuth 2.0 Client ID
3. Application type: Web application
4. Authorized redirect URIs: `http://localhost:3001/api/v1/auth/google/callback`
5. Copy Client ID and Secret into `.env`

### Run migrations & start
```bash
npx prisma migrate dev --name init
npx prisma generate
npm run dev
```

Backend runs on http://localhost:3001
Health check: http://localhost:3001/health

---

## Step 3 — Frontend setup

```bash
cd frontend
npm run dev
```

Frontend runs on http://localhost:5173

---

## Optional — AI suggestions (OpenAI)
Add to `backend/.env`:
```
OPENAI_API_KEY="sk-..."
```
Without this, a smart rule-based fallback handles suggestions.

---

## Optional — Image uploads (Cloudflare R2)
Add to `backend/.env`:
```
R2_ACCOUNT_ID="your-account-id"
R2_ACCESS_KEY_ID="your-key"
R2_SECRET_ACCESS_KEY="your-secret"
R2_BUCKET_NAME="wishly-uploads"
R2_PUBLIC_URL="https://pub-xxx.r2.dev"
```
Without this, image upload shows an error but the app works fine.

---

## Optional — Push notifications (VAPID)
Generate VAPID keys:
```bash
npx web-push generate-vapid-keys
```
Add to `backend/.env`:
```
VAPID_PUBLIC_KEY="..."
VAPID_PRIVATE_KEY="..."
VAPID_EMAIL="mailto:you@example.com"
```

---

## Production build

```bash
# Frontend
cd frontend && npm run build   # outputs to frontend/dist/

# Backend
cd backend && npm run build    # outputs to backend/dist/
```
