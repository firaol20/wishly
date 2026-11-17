# 🌾 Wishly — Your Dream Sanctuary

> *"Every person has a wish waiting to be lived."*

Wishly is a warm, private sanctuary and social dream-sharing platform. It gives people a mindful space to capture life aspirations, reflect on their "why", connect with fellow dreamers, and celebrate every dream they turn into reality.

[![Live Demo](https://img.shields.io/badge/Demo-wishly--space.vercel.app-d97706?style=for-the-badge&logo=vercel)](https://wishly-space.vercel.app)
[![Backend API](https://img.shields.io/badge/API-Render-10b981?style=for-the-badge&logo=render)](https://wishly-api-1ha4.onrender.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![Fastify](https://img.shields.io/badge/Fastify-5.4-000000?style=for-the-badge&logo=fastify)](https://fastify.dev/)

---

## ✨ Highlights & Features

### 🌟 Frictionless Dream Journaling ("I wish")
* **Flat Feed Experience:** No cumbersome folders or collection management needed — all your dreams are front and center in a clean, unified feed.
* **Smart Search & Filters:** Filter instantaneously by life category (*Travel, Health, Career, Family, Education, Fun, Other*) or progress status.
* **Reflect on the "Why":** Deepen your commitment by recording why each dream matters to you.

### 🌍 Public Dream Sharing & Discovery
* **Individual Visibility Controls:** Keep personal dreams strictly private, or toggle individual wishes to **Public** with a single click.
* **Community Discover Stream:** Explore dreams shared by people around the world, find inspiration, and discover shared human aspirations.

### ✈️ Telegram Collaboration Integration
* **Turn Dreams into Reality:** When you choose to share a dream publicly, an optional Telegram contact button lets supporters, mentors, and fellow dreamers reach out to collaborate and help turn it into reality.
* **Privacy First:** Telegram contact information is only exposed on dreams you explicitly choose to make public.

### 🎯 Lifecycle Progression & Memory Capsules
* **Three-Stage Progression:** Track each wish from `💭 Dream` ➔ `🔥 In Progress` ➔ `✅ Lived It!`.
* **Memory Capsules:** When you live a dream, seal it forever with reflection notes, memorable photos, and celebratory confetti.
* **Aesthetic Dashboard:** Visual progress rings, yearly completion metrics, and upcoming target dates.

### 🎨 Warm Aesthetic & Sensory Design
* **Interactive 3D Dandelion Field:** Custom Three.js floating dandelion field optimized for both desktop and mobile screens.
* **Mindful Color Palette:** Soft cream backgrounds (`#FFFBF0`), golden amber accents, and editorial typography (Playfair Display).
* **AI-Assisted Inspiration:** Intelligent category and tag suggestions as you type, powered by OpenAI.

---

## 🛠️ Tech Stack

### Frontend
* **Framework:** React 18 + TypeScript + Vite
* **Styling:** Tailwind CSS v4 + PostCSS
* **3D Background:** Three.js + custom floating seed shaders
* **Animations:** Framer Motion
* **State & Data Fetching:** TanStack React Query v5
* **Routing:** React Router v6
* **Icons:** Lucide React

### Backend & Database
* **Server:** Node.js + Fastify 5 (TypeScript)
* **ORM:** Prisma v6
* **Database:** PostgreSQL (Hosted on Supabase)
* **Authentication:** Google OAuth 2.0 + JSON Web Tokens (JWT) + secure cookies
* **Validation:** Zod schemas
* **Push Notifications:** Web Push API (VAPID)

### Deployment & Infrastructure
* **Frontend:** [Vercel](https://vercel.com) (Continuous deployment from `main`)
* **Backend:** [Render](https://render.com) (Continuous deployment from `main`)
* **Database:** [Supabase](https://supabase.com) (PostgreSQL pooler)

---

## 🚀 Getting Started

### Prerequisites
* **Node.js** 18+ installed
* **PostgreSQL** database (or Supabase project)
* **Google Cloud Console** OAuth 2.0 credentials

### 1. Clone Repository
```bash
git clone https://github.com/firaol20/wishly.git
cd wishly
```

### 2. Configure Backend
```bash
cd backend
cp .env.example .env
```
Fill in the required `.env` variables:
```env
PORT=3001
DATABASE_URL="postgresql://user:password@host:5432/dbname"
JWT_SECRET="your-jwt-secret"
JWT_REFRESH_SECRET="your-refresh-secret"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GOOGLE_CALLBACK_URL="http://localhost:3001/api/v1/auth/google/callback"
FRONTEND_URL="http://localhost:5173"
OPENAI_API_KEY="optional-openai-key"
```

Install backend dependencies and run database push:
```bash
npm install
npm run db:push
npm run dev
```

### 3. Configure Frontend
```bash
cd ../frontend
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🔑 Environment Variables Reference

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret key for JWT access tokens |
| `JWT_REFRESH_SECRET` | Secret key for JWT refresh tokens |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret |
| `GOOGLE_CALLBACK_URL` | OAuth redirect callback URL |
| `FRONTEND_URL` | Allowed CORS origin and client redirect base |
| `OPENAI_API_KEY` | *(Optional)* Enables AI category & tag suggestions |
| `VAPID_PUBLIC_KEY` | *(Optional)* Browser push notification public key |
| `VAPID_PRIVATE_KEY` | *(Optional)* Browser push notification private key |

---

## 🔮 Version 2.0 & Future Roadmap

Wishly is continuously evolving. Explore [ROADMAP.md](ROADMAP.md) for planned features and architecture improvements:
* **Community Cheers & "I Can Help" Reactions**
* **Dream Matchmaker (AI semantic goal pairing)**
* **Dream Milestones (Stepping stones from wish to reality)**
* **Interactive "Release a Wish" 3D Dandelion Animation**
* **Annual Dream Capsule ("Wishly Wrapped")**
* **Sanctuary Ambient Audio & Soundscapes**

---

## 📄 License
Released under the [MIT License](LICENSE).
