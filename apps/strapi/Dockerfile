# Strapi CMS service — build from the REPO ROOT:
#   docker build -f apps/strapi/Dockerfile .
# On Rock8Cloud: keep the default build context (repository root).

# --- Build stage ---
FROM node:22-slim AS build
RUN npm install -g bun
WORKDIR /app

# Install workspace dependencies (layer cached on lockfile + manifests)
COPY package.json bun.lock turbo.json ./
COPY apps/strapi/package.json apps/strapi/package.json
COPY apps/web/package.json apps/web/package.json
COPY packages/typescript-config/package.json packages/typescript-config/package.json
RUN bun install --frozen-lockfile

# Build the Strapi admin panel
COPY packages packages
COPY apps/strapi apps/strapi
ENV NODE_ENV=production
RUN cd apps/strapi && bun run build

# --- Runtime stage ---
FROM node:22-slim AS runtime
RUN npm install -g bun
WORKDIR /app
ENV NODE_ENV=production HOST=0.0.0.0 PORT=1337

COPY --from=build /app/package.json /app/bun.lock /app/turbo.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/packages ./packages
COPY --from=build /app/apps/strapi ./apps/strapi

WORKDIR /app/apps/strapi
EXPOSE 1337
CMD ["bun", "run", "start"]
