# ✨ Wishly — Your Dream Sanctuary

A warm, private web app (PWA) for dreamers to capture life wishes, reflect on their "why", and celebrate every dream they live.

## Stack
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS + Framer Motion
- **Backend**: Node.js + Fastify + TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: Google OAuth 2.0 + JWT
- **AI**: OpenAI gpt-4o-mini (auto-category + smart tags)
- **Storage**: Cloudflare R2 (image uploads)
- **Push**: Web Push API (browser notifications)

---

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL running locally

### 1. Clone & install

```bash
# Frontend
cd frontend
npm install

# Backend
cd ../backend
npm install
```

### 2. Configure environment

```bash
# Backend
cp .env.example .env
# Fill in DATABASE_URL, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, JWT_SECRET
```

### 3. Set up database

```bash
cd backend
npx prisma migrate dev --name init
npx prisma generate
```

### 4. Run both servers

```bash
# Terminal 1 — Backend (port 3001)
cd backend
npm run dev

# Terminal 2 — Frontend (port 5173)
cd frontend
npm run dev
```

Open http://localhost:5173

---

## Google OAuth Setup

1. Go to https://console.cloud.google.com
2. Create a new project → "APIs & Services" → "OAuth 2.0 Client IDs"
3. Application type: **Web application**
4. Authorized redirect URIs: `http://localhost:3001/api/v1/auth/google/callback`
5. Copy Client ID and Client Secret into `backend/.env`

---

## Environment Variables

### Backend (`backend/.env`)
| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret for access tokens |
| `JWT_REFRESH_SECRET` | Secret for refresh tokens |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `GOOGLE_CALLBACK_URL` | OAuth callback URL |
| `FRONTEND_URL` | Frontend URL (for redirects) |
| `OPENAI_API_KEY` | Optional — enables AI suggestions |
| `R2_ACCOUNT_ID` | Cloudflare R2 account ID |
| `R2_ACCESS_KEY_ID` | R2 access key |
| `R2_SECRET_ACCESS_KEY` | R2 secret key |
| `R2_BUCKET_NAME` | R2 bucket name |
| `R2_PUBLIC_URL` | R2 public base URL |
| `VAPID_PUBLIC_KEY` | Web push VAPID public key |
| `VAPID_PRIVATE_KEY` | Web push VAPID private key |

---

## Features
- ✅ Google OAuth sign-in (no passwords)
- ✅ Multiple wishlists with cover images
- ✅ Wish items with title, "why", image, category, tags, priority, target date
- ✅ AI auto-suggests category + tags as you type
- ✅ Status flow: Dream → In Progress → Lived It ✨
- ✅ Memory capsule with confetti on completion
- ✅ Emotional dashboard with progress stats
- ✅ PWA — installable, offline capable
- ✅ Browser push notification reminders
- ✅ Share wishlist via read-only public link
- ✅ PDF memory book export
- ✅ GDPR — data export + full account deletion
- ✅ WCAG 2.1 AA accessible
- ✅ Mobile-first responsive design

---

## Deployment

### Frontend → Vercel
```bash
# Connect GitHub repo to Vercel, set env vars, deploy
```

### Backend + DB → Railway
```bash
# Create Railway project, add PostgreSQL plugin
# Set all env vars, deploy from GitHub
```
