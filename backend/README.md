# Ethara Backend (Express API)

Standalone REST API for Ethara AI, split out of the original Next.js monolith.
Stack: **Express 5 · Mongoose · JWT (HttpOnly cookies) · Nodemailer + React Email · Zod**.

Runs under [`tsx`](https://github.com/privatenumber/tsx) so the JSX email templates work
without a separate build step.

## Run

```bash
pnpm install
cp .env.example .env     # then edit values (Mongo URI, TOKEN_SECRET, SMTP)
pnpm dev                 # http://localhost:5000  (auto-reload)
# or: pnpm start         # no watch
```

Health check: `GET http://localhost:5000/api/health`.

## Layout

```
src/
├── index.js              # Express app: CORS, cookie-parser, route mounting, bootstrap
├── config/db.js          # Mongoose connection (PROD_DATABASE_URL)
├── logger/logger.js      # Winston logger
├── middleware/auth.js    # requireAuth, requireAdmin, requireAdminOrFlag
├── models/               # User, Session, Task, Project, Team, Message
├── schema/               # Zod: login / register / verify-email
├── templates/            # React Email templates (.jsx)
├── utils/
│   ├── mailer.js         # Nodemailer + React Email render
│   └── cookies.js        # shared cookie options + max-age constants
└── routes/               # auth, users, tasks, projects, teams, messages,
                          # search, dashboard, admin (progress), member
scripts/                  # one-off DB maintenance scripts (run with `node`/`tsx`)
```

## Auth model

- `requireAuth` reads the JWT from the `token` cookie (or `Authorization: Bearer`),
  verifies it with `TOKEN_SECRET`, loads the user, and sets `req.auth` (decoded) + `req.user`.
  Any failure returns **401** so the frontend can trigger `/auth/refresh`.
- `requireAdmin` → `user.role === "admin"`.
- `requireAdminOrFlag` → `user.role === "admin" || user.isAdmin`.

## CORS / cookies

`FRONTEND_URL` (and `DOMAIN_URL`) are the allowed credentialed origins. Cookies are
`HttpOnly`, `SameSite=strict`, and `Secure` when `NODE_ENV !== "development"`.

## Maintenance scripts

```bash
node scripts/verify_users.js      # mark all users verified
node scripts/fix_admins.js        # set isAdmin=true for role:admin users
# (others: check_admin, check_user, force_admin, reset_pass — edit the hard-coded
#  email/username inside before running)
```

They read the connection string from `PROD_DATABASE_URL` (falling back to `MONGODB_URI`).
