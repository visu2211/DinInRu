# RU Eats — Rutgers Restaurant Reviews

Find and review restaurants around the Rutgers New Brunswick campus.

**Stack:** MongoDB · Express · React · Node · Tailwind CSS
**Live:** frontend on Vercel, API on Render, database on MongoDB Atlas.

## Project structure

```
backend/    Express API (JWT auth, restaurants + reviews)
frontend/   React + Tailwind CSS client
```

## Local development

### 1. Backend

```
cd backend
npm install
cp .env.example .env   # fill in RESTREVIEWS_DB_URI, RESTREVIEWS_NS, JWT_SECRET
npm run seed            # one-time: populates real New Brunswick restaurants
npm start                # http://localhost:8000
```

### 2. Frontend

```
cd frontend
npm install
npm start                # http://localhost:3000
```

`frontend/.env` should point `REACT_APP_API_URL` at the backend
(`http://localhost:8000/api/v1` locally, the Render URL in production).

## Deployment

- **Backend (Render)**: web service rooted at `backend/`, build `npm install`,
  start `npm start`. Env vars: `RESTREVIEWS_DB_URI`, `RESTREVIEWS_NS`,
  `JWT_SECRET`, `FRONTEND_ORIGIN` (the deployed Vercel URL, for CORS).
  See `render.yaml`.
- **Frontend (Vercel)**: root directory `frontend/`, standard CRA build.
  Env var: `REACT_APP_API_URL` set to the live Render API URL + `/api/v1`.
- **Database (MongoDB Atlas)**: free M0 cluster, network access open to
  `0.0.0.0/0` (Render's free tier has no static outbound IP).
