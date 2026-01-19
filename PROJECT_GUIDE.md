# BloodConnect — Project Guide

> An interactive run guide for the BloodConnect MERN app (Blood Donation Management Platform).

## Quick Start (local dev)

### 1) Prerequisites

- Node.js **18.x** (recommended; see `package.json` engines)
- MongoDB (local or MongoDB Atlas)
- Git

### 2) Configure env

- Copy the example env file:

```bash
cp .env.example .env
```

- Edit `.env` (do **not** commit it). Key variables:

| Variable            | Used by           | Example                                       |
| ------------------- | ----------------- | --------------------------------------------- |
| `PORT`              | Server            | `5000`                                        |
| `MONGODB_URI`       | Server            | `mongodb://localhost:27017/blood_donation_db` |
| `JWT_SECRET`        | Server            | `change-me`                                   |
| `CLIENT_URL`        | Server (CORS)     | `http://localhost:3000`                       |
| `REACT_APP_API_URL` | Client (optional) | `http://localhost:5000/api`                   |

> Note: `REACT_APP_API_URL` is optional; the client defaults to `http://localhost:5000/api`.

### 3) Install dependencies

From the project root:

```bash
npm install
cd client
npm install
cd ..
```

### 4) Run in development

From the project root:

```bash
npm run dev
```

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5000/api`
- Health check: `http://localhost:5000/api/health`

---

## Interactive: Common Tasks

<details>
<summary><strong>Run (Windows PowerShell)</strong></summary>

Use `Set-Location` (PowerShell) instead of `cd /d` (CMD):

```powershell
Set-Location "D:\Desktop\CODE\AARchi_project\BABY'S-Project\blood-donation-platform"
npm run dev
```

</details>

<details>
<summary><strong>Run Server Only</strong></summary>

```bash
npm run server
```

Server entry: `server/index.js`

</details>

<details>
<summary><strong>Run Client Only</strong></summary>

```bash
npm run client
```

</details>

<details>
<summary><strong>Build Frontend (production build)</strong></summary>

```bash
npm run build
```

Output: `client/build/`

</details>

<details>
<summary><strong>Troubleshooting</strong></summary>

- **CORS errors**: ensure `CLIENT_URL=http://localhost:3000` in `.env`.
- **Mongo connection fails**: verify `MONGODB_URI` and that MongoDB is running.
- **Login issues**: ensure the API base URL is correct (client uses `REACT_APP_API_URL` or defaults).
- **Port in use**: change `PORT` in `.env` and update client proxy if needed (`client/package.json`).

</details>

---

## What’s in the project?

### Backend (Express + MongoDB)

- API base path: `/api`
- Key routes:
  - `/api/auth` (login/register/me/password)
  - `/api/donors`
  - `/api/requests`
  - `/api/hospitals`
  - `/api/admin`
  - `/api/notifications`
  - `/api/schedules`

See the live endpoint index at: `GET /api`

### Frontend (React)

- React Router v6
- Tailwind CSS
- Axios API wrapper in `client/src/services/api.js`

---

## Deployment notes (high level)

- Set `NODE_ENV=production`
- Provide production values for:
  - `MONGODB_URI`, `JWT_SECRET`, SMTP/Twilio keys if used
  - `CLIENT_URL` (the deployed frontend origin)
- Build the client and serve it via the server (`server/index.js` serves `client/build` in production)

---

## Security / Git hygiene

- `.env` is ignored by `.gitignore`.
- Use `.env.example` for sharing required configuration.
