# 🚀 Wishly Production Deployment Guide

Wishly is configured for modern, free cloud deployment:
* **Database**: Supabase (PostgreSQL) — *Already active & connected!*
* **Media Storage**: Cloudinary — *Already active & connected!*
* **Backend API**: Render (or Railway / Fly.io) — *Free*
* **Frontend Web App**: Vercel (or Netlify) — *Free*

---

## Part 1: Deploy Backend to Render (Free)

1. Go to **[render.com](https://render.com)** and sign in with your GitHub account.
2. Click **New +** → **Web Service**.
3. Select your repository: **`firaol20/wishly`**.
4. Configure the service:
   * **Name**: `wishly-api`
   * **Root Directory**: `backend`
   * **Runtime**: `Node`
   * **Build Command**: `npm install --include=dev && npm run build`
   * **Start Command**: `npm run start`
   * **Instance Type**: `Free`
5. Click **Advanced** → **Add Environment Variable** and add:
   * `NODE_ENV` = `production`
   * `PORT` = `3001`
   * `DATABASE_URL` = `postgresql://postgres.loquslihaertkilgimdz:Firaolbashex123%40@aws-0-eu-west-1.pooler.supabase.com:5432/postgres?sslmode=require`
   * `JWT_SECRET` = *(click "Generate" or type a secret key)*
   * `JWT_REFRESH_SECRET` = *(click "Generate" or type a secret key)*
   * `CLOUDINARY_CLOUD_NAME` = `xqyzgifj`
   * `CLOUDINARY_API_KEY` = `893313511673197`
   * `CLOUDINARY_API_SECRET` = `15l7DU3YVxSGJ-FlnIB5pBKgqHA`
   * `FRONTEND_URL` = *(We will paste your Vercel URL here in Part 2)*
6. Click **Create Web Service**.
7. Once deployed, copy your backend URL (e.g., `https://wishly-api.onrender.com`).

---

## Part 2: Deploy Frontend to Vercel (Free)

1. Go to **[vercel.com](https://vercel.com)** and sign in with GitHub.
2. Click **Add New...** → **Project**.
3. Import your repository: **`wishly`**.
4. In project configuration:
   * **Framework Preset**: `Vite`
   * **Root Directory**: click **Edit** and choose `frontend`
5. Open **Environment Variables** and add:
   * `VITE_API_URL` = `https://your-backend-url.onrender.com` *(from Part 1)*
6. Click **Deploy**!
7. Copy your live frontend domain (e.g., `https://wishly.vercel.app`).

---

## Part 3: Final Link (20 seconds)

1. Go back to your **Render** dashboard for `wishly-api`.
2. Go to **Environment** and update:
   * `FRONTEND_URL` = `https://your-frontend.vercel.app` *(from Part 2)*
3. Click **Save Changes** (Render will automatically redeploy).

---

## Part 4: Google OAuth (When you want Google Sign-In in production)

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials).
2. Under **Authorized redirect URIs**, add:
   * `https://your-backend.onrender.com/api/v1/auth/google/callback`
3. Under **Authorized JavaScript origins**, add:
   * `https://your-frontend.vercel.app`
4. Add `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` to your Render environment variables.

---

🎉 **Your Wishly app is now 100% production-ready and live worldwide!**
