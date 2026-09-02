# RU Eats — System Design

## 1. Overview

RU Eats is a restaurant discovery and review app for the Rutgers New
Brunswick campus. Users browse/search real, currently-open restaurants
near campus, view reviews, and — once logged in — add, edit, or delete
their own reviews.

**Stack:** MongoDB · Express · React · Node · Tailwind CSS
**Live:** frontend on Vercel, API on Render, database on MongoDB Atlas.

## 2. Architecture

```
┌─────────────┐        HTTPS / JSON        ┌──────────────┐        ┌───────────────┐
│  React SPA   │ ───────────────────────▶ │  Express API  │ ─────▶ │ MongoDB Atlas │
│  (Vercel)    │ ◀─────────────────────── │  (Render)     │ ◀───── │  (M0 free)    │
└─────────────┘   Bearer-token JWT auth    └──────────────┘        └───────────────┘
```

Three-tier, stateless REST API, no server-side sessions. The frontend
and backend deploy to **different origins** (`*.vercel.app` /
`*.onrender.com`, no shared parent domain), which shaped two decisions
below: JWT-over-header instead of cookies, and an explicit CORS
allow-list instead of a wildcard.

## 3. Data model

- **`restaurants`**: `name`, `cuisine`, `address: {building, street,
  zipcode}`. Text index on `name` for search.
- **`reviews`**: `text`, `name` (denormalized author name), `user_id`,
  `restaurant_id`, `date`. **Not** embedded in the restaurant document —
  joined at read time via an aggregation `$lookup` in
  `getRestaurantByID`.
  - *Why normalized, not embedded:* an embedded reviews array on the
    restaurant document would mean every new review is a positional
    array update on a document shared by every visitor to that
    restaurant — more contention, and a real (if distant) risk of
    hitting MongoDB's 16MB document cap on a popular restaurant.
    Normalized reviews keep every write a cheap single-document
    insert/update scoped to just that review.
- **`users`**: `name`, `email` (unique index), `passwordHash` (bcrypt),
  `createdAt`. Password hashes never leave the server.

## 4. Auth design

- Register/login issue a JWT (7-day expiry) signed with a server-side
  secret. `POST /api/v1/users/register`, `POST /api/v1/users/login`.
- Client stores `{token, user}` in `localStorage`; an axios request
  interceptor attaches `Authorization: Bearer <token>` to every call.
- Server middleware (`backend/middleware/auth.js`) verifies the token
  and sets `req.user`. All review-mutating routes require it.
- **Identity is derived from the verified token, never trusted from
  the request body.** Earlier in this project's life, review
  create/update/delete read `user_id` straight from `req.body` —
  meaning any client could impersonate any user and edit or delete
  their reviews. Fixed by deriving `req.user.id` from the JWT and
  filtering every DB mutation by it (`{_id: reviewId, user_id:
  req.user.id}`), so ownership is enforced at the query level, not
  just hidden in the UI.

## 5. Restaurant data pipeline

Restaurant data isn't hand-entered — `backend/seed/fetchRestaurants.js`
pulls it live from the **Google Places API (New)**:

1. Runs several overlapping `textQuery` searches — by street (College
   Ave, Easton Ave, George St...) and by category (bagel shops, cafes,
   burgers...) — instead of one generic "restaurants in New Brunswick"
   query.
2. Dedupes results by Google place ID.
3. Filters to New Brunswick locality only (Places' fuzzy matching
   otherwise pulls in North Brunswick, Highland Park, Edison, etc.).
4. Drops permanently/temporarily closed listings and non-restaurant
   venues (liquor stores, event venues) by `primaryType`.
5. Derives a human-readable cuisine label from Google's `primaryType`
   taxonomy (`italian_restaurant` → "Italian").
6. Rewrites the `restaurants` collection and rebuilds the text index.

It's idempotent and rerunnable (`npm run seed`) — data can be refreshed
any time restaurants open, close, or get miscategorized, instead of
rotting as a hardcoded list.

## 6. Frontend design

- Create React App + Tailwind CSS (class-based dark mode), no
  component library — a small, minimal surface didn't justify one.
- React Router for client-side routing across list/detail/review/
  login/signup.
- `AuthContext` (React context + `localStorage`) for global auth
  state — the app is small enough that Redux/Zustand would be
  overhead without benefit.
- Theme preference persisted to `localStorage`, with a small
  pre-hydration `<script>` in `index.html` that applies the `dark`
  class before React mounts, avoiding a flash of the wrong theme.

## 7. Deployment topology

- **Frontend (Vercel):** static CRA build, root directory `frontend/`,
  auto-deploys on push to `main` via the connected GitHub repo.
  `REACT_APP_API_URL` is baked in at build time.
- **Backend (Render):** free web service (`render.yaml` blueprint),
  auto-deploys on push to `main`. Env vars (`RESTREVIEWS_DB_URI`,
  `RESTREVIEWS_NS`, `JWT_SECRET`, `FRONTEND_ORIGIN`) live in the
  Render dashboard, never in the repo.
- **Database (MongoDB Atlas):** free M0 cluster, network access open
  to `0.0.0.0/0` — Render's free tier has no static outbound IP to
  allowlist instead.
- **CORS:** explicit origin allow-list (the deployed frontend URL +
  `localhost:3000`), not a wildcard — once the API handles
  authenticated, user-owned data, a wildcard is more permissive than
  the app needs.

## 8. Key challenges and how they were resolved

- **Dead database cluster.** The original `.env`'s Mongo URI pointed
  at a hostname that didn't resolve in public DNS at all — confirmed
  against multiple public resolvers, so not a local/sandbox network
  issue. The cluster was simply gone; required provisioning a fresh
  Atlas cluster.
- **Trust-boundary bug in review ownership.** Covered in §4 — client-
  supplied `user_id` meant no real ownership enforcement. Fixed
  server-side, verified by actually attempting the attack (a second
  authenticated user trying to edit/delete a first user's review)
  against the live database with a headless browser, and confirmed
  the API returns `403`, not a silent fake-`200`.
- **Cross-origin auth without shared-domain cookies.** Frontend and
  backend have no common parent domain, which rules out simple
  `SameSite=Lax` cookie sessions without extra `SameSite=None; Secure`
  and credentialed-CORS complexity. Stateless Bearer-token JWT sidesteps
  that entirely.
- **Incomplete restaurant coverage from Google Places.** A single
  generic "restaurants in New Brunswick, NJ" query under-counts real
  restaurants — Places' relevance ranking deprioritizes venues Google
  categorizes narrowly (bagel shops, cafes, delis) even though a
  student would call them restaurants without hesitation. Solved with
  multiple category- and street-scoped queries, merged and deduped —
  took verified coverage from ~55 to ~92 real restaurants.
- **Inaccurate map links.** "View Map" originally encoded only street
  + zip with no city/state, so Google's geocoder fell back to an
  ambiguous point near campus instead of the actual business. Fixed
  by including the business name and full `City, State` in a proper
  `maps/search` URL.
- **Vercel monorepo build failure.** The repo has `frontend/` and
  `backend/` side by side; Vercel's git-based build clones the whole
  repo, and without an explicit **Root Directory** setting it built
  from the repo root, found no `package.json`, and failed with
  `react-scripts: command not found`. Fixed by setting Root Directory
  to `frontend/` in project settings.
- **Legacy tooling vs. modern ESM-only packages.** CRA 5's bundled
  Jest doesn't fully resolve modern packages' `exports` conditions, so
  importing `react-router-dom` v7 and `axios` broke `npm test` (while
  working fine in the actual browser build via webpack). Fixed by
  pinning `react-router-dom` to a v6 release — the app only used
  stable v6 APIs anyway — and adding a `transformIgnorePatterns`
  override so Babel transforms `axios` under Jest.
- **Render free-tier cold starts.** The API spins down after
  inactivity; the first request after a quiet period can take 50+
  seconds. Documented as an expected characteristic of free hosting,
  not something to engineer around at this scale.

## 9. Security posture

- Passwords: bcrypt-hashed (10 rounds), never returned to the client.
- Authorization: identity derived server-side from a verified JWT;
  every mutation is scoped by `user_id` at the database query level.
- Secrets: JWT secret, DB URI, and the Places API key live in
  gitignored `.env` files locally and platform environment-variable
  stores in production — never committed.
- CORS: explicit origin allow-list in production.

## 10. Known limitations / explicitly out of scope

- No rate limiting on auth endpoints.
- No email verification or password-reset flow.
- No refresh tokens or revocation — a compromised JWT is valid until
  it naturally expires (7 days).
- No pagination *UI* yet for the 92 restaurants (the API already
  supports `page`/`restaurantsPerPage`, just not wired to a control).
- No CI test gate before deploy — tests exist and pass, but Vercel/
  Render don't currently run them as a merge/deploy gate.
