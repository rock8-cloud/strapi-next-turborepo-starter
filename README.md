# Strapi + Next.js Turborepo Starter

A production-ready monorepo starter for content-driven websites — ships with a
fully wired **Strapi 5 + Next.js 16** stack and deploys to
[Rock8Cloud](https://rock8.cloud) in one push.

## Features

- **[Strapi 5](https://strapi.io)** (TypeScript) — headless CMS modelling a `Page` collection type, plus `Navbar` and `Footer` single types.
- **[Next.js 16](https://nextjs.org)** (App Router, Turbopack, standalone output) with **Tailwind CSS v4** + **[shadcn/ui](https://ui.shadcn.com)**.
- **Dynamic pages** — pages are composed from dynamic-zone blocks (`hero`, `features`, `rich text`, `image with text`, `call to action`).
- **Dynamic navigation** — `Navbar` and `Footer` are CMS single types; change a link or menu item in Strapi without redeploying.
- **Live preview** — press **Preview** in the admin to see unpublished drafts rendered by the real frontend (Next.js Draft Mode).
- **SEO** — per-page meta title, description, social image, canonical URL and robots directives, via `<head>` `generateMetadata`.
- **`sitemap.xml` + `robots.txt`** — generated from the published pages in Strapi.
- **Cache + ISR** — pages are cached and revalidated by a Strapi webhook on publish, with a 5-minute ISR safety net.
- **PostgreSQL** — locally via `docker-compose`, managed in deployment.
- **Media uploads** — local filesystem in development, S3-compatible storage in deployment (auto-switches on `S3_*`).
- **[Turborepo](https://turborepo.dev)** + **[bun](https://bun.sh)** workspaces.

## Quick start

Prerequisites: [bun](https://bun.sh) ≥ 1.2, Node.js ≥ 22, Docker.

```bash
bun install                # install all workspaces
docker compose up -d       # start PostgreSQL
bun dev                    # start Strapi (:1337) and Next.js (:3000)
```

On first start Strapi seeds a published **Home** page, a default **Navbar**
and **Footer**, and grants the public role read access to all of them — so
http://localhost:3000 works immediately. Create your admin user at
http://localhost:1337/admin.

> The scaffolded `apps/strapi/.env` contains generated dev secrets and works
> out of the box. For a fresh clone, copy the examples first:
> `cp apps/strapi/.env.example apps/strapi/.env` and
> `cp apps/web/.env.example apps/web/.env.local`.

## Project structure

```
apps/
  strapi/   # Strapi 5 CMS        → port 1337
  web/      # Next.js frontend    → port 3000
packages/
  typescript-config/   # shared tsconfig bases
```

```
apps/strapi/src/
  api/
    page/     content-types/page       # Page collection (blocks + seo)
    navbar/   content-types/navbar     # Navbar single type
    footer/   content-types/footer     # Footer single type
  components/
    blocks/         hero, features, rich-text, image-with-text, cta
    layout/         navbar-item
    elements/       footer-item
    utilities/      link, basic-image, image-with-link
    seo-utilities/  seo
apps/web/src/
  app/
    [[...slug]]/     page.tsx (catch-all renderer), not-found.tsx
    api/             preview, exit-preview, revalidate
    sitemap.ts, robots.ts
  components/
    blocks/          one React component per page block
    navbar/          StrapiNavbar + desktop/mobile nav
    footer/          StrapiFooter
    utilities/       StrapiLink, StrapiImageWithLink, StrapiBasicImage
  lib/
    strapi.ts        types, fetch + helpers (server)
    strapi-shared.ts client-safe link helpers (no next/headers)
```

## Content model

### `Page` (collection type, draft & publish)

| Field  | Type |
| ------ | ---- |
| title  | string |
| slug   | uid (`home` is served at `/`) |
| seo    | `seo-utilities.seo` (optional) |
| blocks | dynamic zone: `blocks.hero`, `blocks.features`, `blocks.rich-text`, `blocks.image-with-text`, `blocks.cta` |

### `Navbar` (single type)

| Field          | Type |
| -------------- | ---- |
| logoImage      | `utilities.image-with-link` |
| items          | repeatable `layout.navbar-item` (link + optional sub-items) |
| primaryButtons | repeatable `utilities.link` |

### `Footer` (single type)

| Field     | Type |
| --------- | ---- |
| logoImage | `utilities.image-with-link` |
| sections  | repeatable `elements.footer-item` (title + link list) |
| links     | repeatable `utilities.link` (bottom links) |
| copyright | string |

### `utilities.link` component

A link can point to an internal **Page** (resolved from the page slug, `home`
→ `/`) or an **external** URL, with an optional open-in-new-tab flag.

### Live preview

Open a page in **Content Manager**, edit it, and press **Preview**. Strapi
builds a signed URL to `web`'s `/api/preview` route, which enables Next.js
Draft Mode and renders the *draft* version of the page. A banner with an
"Exit preview" link is shown while draft mode is active.

Configured in:

- `apps/strapi/config/admin.ts` — the `preview` handler (signed URL, whitelist of previewable content types)
- `apps/web/src/app/api/preview/route.ts` — validates `PREVIEW_SECRET`, enables draft mode (with a `SameSite=None` cookie so it also works inside the admin's preview iframe)

### Cache revalidation webhook (recommended)

Add a webhook in Strapi (**Settings → Webhooks**) to purge the cache on
publish:

- URL: `http://localhost:3000/api/revalidate` (the web service URL in deployment)
- Header: `Authorization: bearer <REVALIDATE_SECRET>`
- Events: Entry publish, unpublish, update, delete

Without the webhook, pages still refresh every 5 minutes (ISR fallback). The
webhook clears the single `strapi` cache tag, which covers pages, the navbar
and the footer at once.

### Adding a block

1. Create the component JSON in `apps/strapi/src/components/blocks/`.
2. Add it to the `blocks` dynamic zone in `apps/strapi/src/api/page/content-types/page/schema.json`.
3. Regenerate Strapi types: `cd apps/strapi && bun strapi ts:generate-types`.
4. Add a React component in `apps/web/src/components/blocks/`.
5. Register it in `block-renderer.tsx` and add its populate entry to `POPULATE_BLOCKS` in `lib/strapi.ts`.

### Testing S3 uploads locally (optional)

Uncomment the `minio` services in `docker-compose.yml`, set the `S3_*` vars
in `apps/strapi/.env` (values are in the compose file comments) and restart.
Uploads then go to the local MinIO bucket instead of the filesystem.

## Environment variables

### `apps/strapi`

| Variable | Purpose | Local default |
| --- | --- | --- |
| `DATABASE_URL` | Postgres connection string (takes precedence) | – (uses discrete vars) |
| `DATABASE_HOST/PORT/NAME/USERNAME/PASSWORD/SSL` | Discrete Postgres config | docker-compose values |
| `S3_ENDPOINT`, `S3_BUCKET`, `S3_REGION`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`, `S3_PUBLIC_URL` | S3-compatible upload storage; unset → local filesystem | unset |
| `CLIENT_URL` | Public URL of the web app (preview links, allowed origins) | `http://localhost:3000` |
| `PREVIEW_SECRET` | Shared secret for preview URLs | dev value |
| `APP_KEYS`, `API_TOKEN_SALT`, `ADMIN_JWT_SECRET`, `JWT_SECRET`, `TRANSFER_TOKEN_SALT`, `ENCRYPTION_KEY` | Strapi secrets | generated |

### `apps/web`

| Variable | Purpose | Local default |
| --- | --- | --- |
| `STRAPI_URL` | Strapi URL used by the server | `http://localhost:1337` |
| `NEXT_PUBLIC_STRAPI_URL` | Strapi URL used by the browser (filesystem media) | `http://localhost:1337` |
| `NEXT_PUBLIC_SITE_URL` | Absolute public base URL of the site (canonical, OG, sitemap, robots). Empty in dev disables those. | unset |
| `STRAPI_API_TOKEN` | Optional read-only API token | empty (public role suffices) |
| `PREVIEW_SECRET` | Must match the Strapi value | dev value |
| `REVALIDATE_SECRET` | Secret for the revalidation webhook | dev value |

## Deploy on [Rock8Cloud](https://rock8.cloud/)

### connect MCP and Prompt agent
```
Deploy this to Rock8Cloud.
```
### or deploy via ui

Each app has a production `Dockerfile` that builds from the repository root.
Rock8Cloud auto-builds and deploys them; PostgreSQL and S3 storage are managed
services you add with one click.

1. **Push to GitHub** and create a project at [app.rock8.cloud](https://app.rock8.cloud).
2. **Add a PostgreSQL service** (managed database).
3. **Add an S3 Object Storage service** and enable public access (media must be publicly readable).
4. **Add the Strapi service**: Dockerfile path `apps/strapi/Dockerfile`, default build context (repository root), port **1337**. Environment:
   - Link the PostgreSQL `URL` variable to `DATABASE_URL`.
   - Link the storage's `S3_ENDPOINT`, `S3_BUCKET`, `S3_REGION`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`, `S3_PUBLIC_URL` (names already match).
   - Set the Strapi secrets (`APP_KEYS`, `API_TOKEN_SALT`, `ADMIN_JWT_SECRET`, `JWT_SECRET`, `TRANSFER_TOKEN_SALT`, `ENCRYPTION_KEY`) — generate each with `openssl rand -base64 16`.
   - Set `CLIENT_URL` to the web service's public URL and `PREVIEW_SECRET` to a random value.
5. **Add the web service**: Dockerfile path `apps/web/Dockerfile`, default build context, port **3000**. Environment:
   - `STRAPI_URL` and `NEXT_PUBLIC_STRAPI_URL` → the Strapi service's public URL.
   - `NEXT_PUBLIC_SITE_URL` → the web service's public URL (enables sitemap/robots/absolute meta URLs).
   - `PREVIEW_SECRET` → same value as in the Strapi service.
   - `REVALIDATE_SECRET` → a random value; then add the webhook in the Strapi admin (see above) pointing at `<web URL>/api/revalidate`.
6. Every push to `main` redeploys automatically.

Verify the images locally before deploying:

```bash
docker build -f apps/strapi/Dockerfile -t starter-strapi .
docker build -f apps/web/Dockerfile -t starter-web .
```

> The `EXPOSE`d ports (1337 / 3000) must match the port configured on each
> Rock8Cloud service, or health checks will fail.



## License

MIT — use it however you like.