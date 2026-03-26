# BloodConnect

BloodConnect is a MERN platform that connects donors, receivers, hospitals, and admins for blood donation workflows.

## Tech Stack

- Backend: Node.js, Express, MongoDB, Mongoose, Socket.io
- Frontend: React (CRA), Tailwind CSS
- Auth: JWT + role-based route protection

## Monorepo Layout

- `server/`: backend API and socket server
- `client/`: React web app
- `server/scripts/`: utility scripts (seed, smoke tests, index repair)

## Local Setup

### 1. Install dependencies

```bash
npm install
cd client && npm install
```

### 2. Configure environment files

```bash
cp .env.example .env
cp client/.env.example client/.env
```

Set local values:

- `.env`:
  - `NODE_ENV=development`
  - `PORT=5000`
  - `MONGODB_URI=mongodb://localhost:27017/blood_donation_db`
  - `JWT_SECRET=your_local_secret`
  - `CLIENT_URL=http://localhost:3000`
  - `CLIENT_URLS=http://localhost:3000`
- `client/.env`:
  - `REACT_APP_API_URL=http://localhost:5000/api`
  - `REACT_APP_SOCKET_URL=http://localhost:5000`

### 3. Run app

```bash
npm run dev
```

Frontend: http://localhost:3000
Backend: http://localhost:5000/api
Health: http://localhost:5000/api/health

## Runtime Validation Scripts

Run backend on port 5000, then execute:

```bash
node server/scripts/hospitalSmokeTest.js
node server/scripts/platformSmokeTest.js
```

If upgrading from older DB schemas, run once:

```bash
npm run db:fix-indexes

Seed sample data:

```bash
npm run db:seed
```

Seed or refresh only the 10 Kolkata hospital accounts and stock without wiping the rest of the database:

```bash
npm run db:seed:hospitals
```
```

## One-Click Deployment

### Backend on Render (via `render.yaml`)

This repo includes `render.yaml` for Blueprint deploy.

Important: this backend uses MongoDB via Mongoose. Render's free managed datastore options do not include MongoDB, so on the free tier you should keep using an external MongoDB URI such as MongoDB Atlas. The Render service itself can still run on the free web-service plan.

1. Push this repository to GitHub.
2. In Render: New -> Blueprint -> select this repo.
3. Render auto-detects `render.yaml` and creates `bloodconnect-api`.
4. Fill required env vars in Render dashboard:
   - `MONGODB_URI`
   - `CLIENT_URL` (your primary Vercel domain)
   - `CLIENT_URLS` (comma-separated list if you want production + preview domains)
   - `SMTP_*` and `TWILIO_*` if you use those features.
5. Deploy and verify:
   - `https://<your-render-service>.onrender.com/api/health`

### Frontend on Vercel (Dashboard)

This repo includes `client/vercel.json` for SPA routing.

1. In Vercel: Add New Project -> import this repo.
2. Configure project:
   - Root Directory: `client`
   - Build Command: `npm run build`
   - Output Directory: `build`
3. Add env var:
   - `REACT_APP_API_URL=https://<your-render-service>.onrender.com/api`
   - `REACT_APP_SOCKET_URL=https://<your-render-service>.onrender.com`
4. Deploy.

### Frontend on Vercel CLI

From project root:

```bash
cd client
npm i -g vercel
vercel
```

When prompted:

- Set up and deploy: `Y`
- Link to existing project: choose as needed
- Build command: keep detected `npm run build`
- Output directory: keep detected `build`

Set production env var and redeploy:

```bash
vercel env add REACT_APP_API_URL production
vercel env add REACT_APP_SOCKET_URL production
vercel --prod
```

Use your Render API URL value for `REACT_APP_API_URL` (ending in `/api`) and the base Render URL for `REACT_APP_SOCKET_URL`.

## GitHub Push Commands

```bash
git add .
git commit -m "chore: production deployment configs and cleanup"
git push origin main
```

## Production Environment Templates

- Backend template: `.env.example`
- Frontend template: `client/.env.example`

Copy these to actual env files in each environment and fill real secrets.

## Notes

- Backend runs in API-only mode if `client/build` is not present on the server.
- Keep `JWT_SECRET` strong and unique in production.
- For free hosting reliability, recommended combo is Vercel + Render + MongoDB Atlas.
- If your frontend uses a Vercel preview URL, include it in `CLIENT_URLS` so API calls and Socket.io are allowed from both origins.
