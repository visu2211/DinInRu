# RU Eats — Rutgers Restaurant Reviews

Find and review restaurants around the Rutgers New Brunswick campus.

**Stack:** MongoDB · Express · React · Node · Tailwind CSS
**Live site:** https://frontend-five-peach-68.vercel.app
**Live API:** https://rutgers-restaurant-review-api.onrender.com

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
cp .env.example .env   # fill in RESTREVIEWS_DB_URI, RESTREVIEWS_NS, JWT_SECRET, GOOGLE_PLACES_API_KEY
npm run seed            # fetches live restaurant data from Google Places and reseeds MongoDB
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
- `GOOGLE_PLACES_API_KEY` is only needed locally to (re)run `npm run seed` —
  the deployed API doesn't call Google Places itself, so it's not a Render
  env var.
- Render's free tier spins the backend down after inactivity — the first
  request after a quiet period can take 50+ seconds while it wakes back up.
