# BloodConnect Deployment Guide

## Current Architecture

- Frontend: React app in `client/`, already deployed on Vercel
- Backend: Node.js + Express API in `server/`
- Database: MongoDB via Mongoose
- Realtime: Socket.io on the same backend service

## Important Render Constraint

Render's free managed data services are not a match for this app's MongoDB/Mongoose backend. To stay on the free tier without rewriting the backend, deploy:

- frontend on Vercel
- backend web service on Render
- MongoDB on an external provider such as MongoDB Atlas

If you want to use a Render-managed database instead, the backend would need a database migration away from MongoDB.

## Required Environment Variables

### Render backend

- `NODE_ENV=production`
- `MONGODB_URI=<your mongodb connection string>`
- `JWT_SECRET=<strong random secret>`
- `JWT_EXPIRE=7d`
- `CLIENT_URL=https://client-7pr8igkwy-pawankr16123114-gmailcoms-projects.vercel.app`
- `CLIENT_URLS=https://client-7pr8igkwy-pawankr16123114-gmailcoms-projects.vercel.app`

Optional:

- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_PHONE_NUMBER`
- `MAPBOX_ACCESS_TOKEN`
- `MAX_FILE_SIZE`
- `UPLOAD_PATH`

### Vercel frontend

- `REACT_APP_API_URL=https://<your-render-service>.onrender.com/api`
- `REACT_APP_SOCKET_URL=https://<your-render-service>.onrender.com`

## Render Deployment Steps

1. Push `BloodConnect` to GitHub.
2. In Render, choose `New` -> `Blueprint`.
3. Select the repo that contains this project's root `render.yaml`.
4. Confirm the service name, build command, and start command from `render.yaml`.
5. Add the required environment variables.
6. Deploy.
7. Open `https://<your-render-service>.onrender.com/api/health`.

Expected healthy response:

```json
{
  "status": "ok"
}
```

## Vercel Update Steps

After the Render backend is live:

1. Open your Vercel project settings.
2. Set `REACT_APP_API_URL` to the Render backend URL ending in `/api`.
3. Set `REACT_APP_SOCKET_URL` to the same Render backend URL without `/api`.
4. Redeploy the frontend.

## Post-Deploy Smoke Checks

1. Load the frontend and confirm login/register requests reach Render.
2. Open the browser network tab and verify requests go to `onrender.com/api`.
3. Log in and confirm the Socket.io connection succeeds.
4. Open `https://<your-render-service>.onrender.com/api`.
5. Open `https://<your-render-service>.onrender.com/api/health`.

## If Deployment Fails

- `MONGODB_URI is not set`: add the database connection string in Render.
- CORS error from Vercel: make sure `CLIENT_URL` and `CLIENT_URLS` include the exact Vercel origin.
- Socket connection fails: make sure `REACT_APP_SOCKET_URL` is set in Vercel and the frontend was redeployed after adding it.
- Render service sleeps on free tier: first request after inactivity can be slow.
