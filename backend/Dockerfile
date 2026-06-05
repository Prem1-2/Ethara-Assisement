# ============================================================================
# Ethara backend (Express API) — container image for Render / any Docker host.
#
# IMPORTANT (Render): set the service's "Root Directory" to `backend` so this
# Dockerfile and its build context are this folder. The app listens on $PORT
# (Render injects it) and falls back to 5000 locally.
# ============================================================================

ARG NODE_VERSION=24.13.0-slim

# ── Base ────────────────────────────────────────────────────────────────────
FROM node:${NODE_VERSION} AS base
WORKDIR /app
RUN corepack enable

# ── Dependencies ────────────────────────────────────────────────────────────
# pnpm-workspace.yaml carries `allowBuilds` so esbuild (needed by tsx) builds.
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN --mount=type=cache,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

# ── Runner ──────────────────────────────────────────────────────────────────
FROM base AS runner
ENV NODE_ENV=production
COPY --from=deps --chown=node:node /app/node_modules ./node_modules
COPY --chown=node:node . .
USER node

# Documentation only — Render provides $PORT at runtime and the app reads it.
EXPOSE 5000

CMD ["pnpm", "start"]
