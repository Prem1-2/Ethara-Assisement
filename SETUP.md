# Ethara AI — Frontend / Backend Split

This project was originally a **single Next.js 16 full‑stack app** (UI + API routes + database
in one process). It has been split into two independently runnable apps:

```
ETHARA-PROJECT-TASK-MANAGER-FINAL-main/
├── frontend/     # Next.js 16 app (UI only). Talks to the backend over HTTP.
└── backend/      # Standalone Express API server + MongoDB (Mongoose).
```

> The original feature documentation lives in [`README.md`](README.md). Note that its
> "System Architecture" section describes the **old monolith**; the runtime layout is now
> the two apps above. The Docker files at the repo root (`Dockerfile`, `docker-compose.yml`,
> `README.Docker.md`) also target the old monolith and are **not** wired up for the split.

---

## What moved where

| Concern | Old location (monolith) | New location |
| --- | --- | --- |
| UI pages & components | `src/app/(admin\|auth\|member)`, `src/components` | `frontend/src/...` |
| API endpoints | `src/app/api/**/route.js` | `backend/src/routes/*.routes.js` |
| Mongoose models | `src/models` | `backend/src/models` |
| DB connection | `src/config/db_config.js` | `backend/src/config/db.js` |
| Mailer + email templates | `src/utils/mailer.js`, `src/template` | `backend/src/utils/mailer.js`, `backend/src/templates` |
| Zod schemas | `src/schema` | `backend/src/schema` |
| Auth (per-route, inline) | each `route.js` | `backend/src/middleware/auth.js` |
| Route-guard middleware | `src/proxy.js` (queried the DB) | `frontend/src/proxy.js` (verifies JWT only) |
| DB maintenance scripts | repo root `*.js` | `backend/scripts/*.js` |

---

## Prerequisites

- **Node.js 18+** (developed on Node 24)
- **pnpm** — install once with `npm install -g pnpm`
- **MongoDB** — a local `mongod` or a MongoDB Atlas connection string

---

## 1. Configure environment variables

Two `.env` files drive the apps. They are pre-created with local defaults; **edit the values**.

**`backend/.env`**

```ini
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
PROD_DATABASE_URL=mongodb://127.0.0.1:27017/ethara   # <-- your MongoDB URI
TOKEN_SECRET=dev-only-change-me-to-a-long-random-string
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SENDER_EMAIL=no-reply@ethara.ai
DOMAIN_URL=http://localhost:3000     # base URL used in email links (the frontend)
LOG_LEVEL=info
```

**`frontend/.env.local`**

```ini
NEXT_PUBLIC_API_URL=http://localhost:5000/api
TOKEN_SECRET=dev-only-change-me-to-a-long-random-string
```

> ⚠️ **`TOKEN_SECRET` must be identical in both files.** The backend signs the JWT cookies;
> the frontend middleware verifies them for route guarding.

---

## 2. Install dependencies

```bash
pnpm -C backend install
pnpm -C frontend install
```

(Dependencies are already installed if you received this project with `node_modules/` present.)

---

## 3. Run (two terminals)

**Terminal 1 — backend (port 5000):**

```bash
pnpm -C backend dev      # tsx watch (auto-reload).  Use `pnpm -C backend start` for no-watch.
```

**Terminal 2 — frontend (port 3000):**

```bash
pnpm -C frontend dev
```

Open <http://localhost:3000>.

Quick backend check:

```bash
curl http://localhost:5000/api/health     # -> {"status":"ok","service":"ethara-backend"}
```

---

## How the two apps talk to each other

- The browser loads the **frontend** at `http://localhost:3000`.
- All data calls go through `frontend/src/utils/axiosInstance.js`, whose `baseURL` is
  `NEXT_PUBLIC_API_URL` (`http://localhost:5000/api`) and which sends cookies
  (`withCredentials: true`).
- On login the **backend** sets three HttpOnly cookies: `token` (1d), `refreshToken` (5d),
  `sessionId` (5d). On a `401` the axios interceptor calls `POST /auth/refresh` and retries.
- The **frontend middleware** (`src/proxy.js`) reads the `token` cookie and verifies it with
  `TOKEN_SECRET` (no DB access) to guard `/admin/*` and `/member/*` routes. The backend
  independently re-verifies on every API request.

**Why cookies work across ports:** `localhost:3000` and `localhost:5000` are the *same site*
(cookies aren't scoped by port), so the `SameSite=strict` cookies set by the backend are sent
on requests from the frontend, and the Next.js middleware can read them.

---

## Production notes

- The cookies are `Secure` when `NODE_ENV !== "development"`, which requires **HTTPS**.
- If you deploy the frontend and backend on **different domains** (not just different ports),
  browsers will treat cookies as cross-site. You'll then need `SameSite=None; Secure` cookies
  (and matching CORS), or move to `Authorization: Bearer` tokens — the backend's `requireAuth`
  already accepts a `Bearer` header as a fallback.
- Set `FRONTEND_URL` (backend) to the deployed frontend origin so CORS allows it.

---

## Endpoint reference (mounted under `/api`)

```
POST   /auth/login            POST   /auth/logout         POST  /auth/refresh
POST   /auth/register         POST   /auth/verify_admin
GET    /auth/user_profile     PATCH  /auth/update_profile
GET    /auth/session          DELETE /auth/session

GET    /users                 POST   /users               DELETE /users/:id   PATCH /users/:id
GET    /tasks                 POST   /tasks               GET/PATCH/DELETE /tasks/:id
GET    /projects              POST   /projects            GET/PATCH/DELETE /projects/:id
GET    /teams                 POST   /teams               GET/PATCH/DELETE /teams/:id
GET    /messages             POST   /messages
GET    /search?q=
GET    /dashboard                        # admin stats
GET    /admin/progress                   # admin progress (?projectId / ?memberId)
GET    /member/dashboard      GET /member/projects        GET /member/team
GET    /member/tasks          GET/PATCH /member/tasks/:id
```

> The original `/auth/forget_password` and `/auth/reset_pass_email` route files were **empty
> stubs** in the monolith and were not ported. Password-reset emails are still generated by
> `backend/src/utils/mailer.js` (`emailType: "RESET"`).
