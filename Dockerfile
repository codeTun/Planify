
# ── Stage 1 : base ─────────────────────────────────────────────────────
FROM node:20-alpine AS base

# Install pnpm globally
RUN corepack enable && corepack prepare pnpm@latest --activate

# libc6-compat is needed for some native Node modules on Alpine
RUN apk add --no-cache libc6-compat


# ── Stage 2 : deps ─────────────────────────────────────────────────────
#    Install ALL dependencies (dev + prod) for the build step
FROM base AS deps

WORKDIR /app

# Copy lockfile + manifests first (better layer cache)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml* ./

# Install every dependency
RUN pnpm install --frozen-lockfile


# ── Stage 3 : builder ─────────────────────────────────────────────────
#    Build the Next.js application (standalone output)
FROM base AS builder

WORKDIR /app

# Bring in node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy full source tree
COPY . .

# Generate Prisma Client for the linux-musl runtime inside the container
RUN npx prisma generate

# Build-time env vars (non-secret, needed by Next.js at compile time)
# DATABASE_URL and REDIS_URL are only used at runtime, but Next.js
# needs a placeholder during build to avoid errors.
ENV NEXT_TELEMETRY_DISABLED=1
ENV DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder"
ENV REDIS_URL="redis://localhost:6379"

RUN pnpm build


# ── Stage 4 : runner ──────────────────────────────────────────────────
#    Minimal production image (~120 MB instead of ~1 GB)
FROM node:20-alpine AS runner

WORKDIR /app

# Security: run as non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser  --system --uid 1001 nextjs

# Set production env
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Copy only what's needed to run
# 1. Public assets
COPY --from=builder /app/public ./public

# 2. Next.js standalone server + node_modules (tiny)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
# 3. Static files (.next/static -> .next/static)
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# 4. Prisma schema + migrations (needed for prisma migrate deploy at startup)
COPY --from=builder /app/prisma ./prisma

# 5. Prisma Client engine and binaries
# pnpm stores packages in node_modules/.pnpm, we need to copy the entire tree
COPY --from=builder /app/node_modules/.pnpm ./node_modules/.pnpm
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/prisma  ./node_modules/prisma

# 6. Entrypoint script (runs migrations, then starts server)
COPY --chown=nextjs:nodejs entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

USER nextjs

EXPOSE 3000

# Run migrations then start the app
CMD ["./entrypoint.sh"]
