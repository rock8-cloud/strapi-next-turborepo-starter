# Next.js frontend service — build from the REPO ROOT:
#   docker build -f apps/web/Dockerfile .
# On Rock8Cloud: keep the default build context (repository root).

# --- Build stage ---
FROM node:22-slim AS build
RUN npm install -g bun
WORKDIR /app

# Install workspace dependencies (layer cached on lockfile + manifests)
COPY package.json bun.lock turbo.json ./
COPY apps/web/package.json apps/web/package.json
COPY apps/strapi/package.json apps/strapi/package.json
COPY packages/typescript-config/package.json packages/typescript-config/package.json
RUN bun install --frozen-lockfile

# Build the Next.js app. Strapi is usually not reachable during the image
# build — pages fall back gracefully and render on first request instead.
COPY packages packages
COPY apps/web apps/web
RUN cd apps/web && bun run build

# --- Runtime stage (standalone output, no node_modules needed) ---
FROM node:22-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production HOSTNAME=0.0.0.0 PORT=3000

COPY --from=build /app/apps/web/.next/standalone ./
COPY --from=build /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=build /app/apps/web/public ./apps/web/public

EXPOSE 3000
CMD ["node", "apps/web/server.js"]
