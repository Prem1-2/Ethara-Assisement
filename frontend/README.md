# Ethara Frontend (Next.js)

The UI for Ethara AI. **No database access and no API routes** — all data comes from the
[backend](../backend) over HTTP.

Stack: **Next.js 16 (App Router) · React 19 · Tailwind v4 · shadcn/ui · Recharts**.

## Run

```bash
pnpm install
# .env.local already exists; make sure TOKEN_SECRET matches the backend
pnpm dev          # http://localhost:3000
```

Start the [backend](../backend) first (port 5000) so API calls succeed.

## Environment (`.env.local`)

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | Backend base URL incl. `/api` (e.g. `http://localhost:5000/api`). Used by `src/utils/axiosInstance.js`. |
| `TOKEN_SECRET` | Used **server-side** by `src/proxy.js` (middleware) to verify the JWT cookie. Must equal the backend's `TOKEN_SECRET`. |

## How it differs from the monolith

- `src/app/api/**` (API routes), `src/models`, `src/config`, `src/schema`, `src/template`,
  and the server-only `src/utils` helpers were removed — they now live in the backend.
- `src/proxy.js` (Next.js middleware) no longer queries MongoDB. It verifies the JWT cookie
  and reads `role` / `isAdmin` straight from the token to guard `/admin/*` and `/member/*`.
- `src/utils/axiosInstance.js` points at the backend and sends cookies (`withCredentials`),
  refreshing the access token on `401`.

## Scripts

```bash
pnpm dev        # dev server
pnpm build      # production build
pnpm start      # serve the production build
pnpm lint       # biome check
```
