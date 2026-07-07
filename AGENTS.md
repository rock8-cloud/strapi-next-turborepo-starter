# AGENTS.md

Guidance for AI coding agents working in this repository.

## What this is

A Turborepo monorepo starter for content-driven sites: **Strapi 5 headless CMS +
Next.js 16 frontend**, deployable to [Rock8Cloud](https://rock8.cloud). Every
page, the navbar and the footer are CMS data — there are no hardcoded content
pages in the frontend.

```
apps/strapi/   Strapi 5.50 CMS         :1337   (PostgreSQL, S3-compatible uploads)
apps/web/      Next.js 16 App Router   :3000   (Tailwind v4 + shadcn/ui)
packages/typescript-config/            shared tsconfig bases (@repo/typescript-config)
```

Package manager is **bun** (1.3.14), orchestrated by **Turbo**. Node ≥ 22.

## RULE 0 — Content structure changes are full-stack. Always.

**This rule overrides every other instruction in this file. Read it before
touching any component that renders Strapi data.**

Strapi owns the shape of all content. The frontend only *renders* that shape —
it can never invent it. If a UI change needs a field, a nested level, or a new
kind of item that the Strapi schema does not already define, then the schema,
the generated types, the populate query, the TypeScript interfaces and the React
component **must all change together, in the same piece of work**.

Never ship a frontend-only structural change. The data will simply not be there:
Strapi returns `undefined` (or silently omits the field when the populate query
wasn't updated), the app renders empty or crashes, and no migration exists to
back it. Strapi generates its database tables from the schema JSON — if you did
not edit the schema, **there is no migration, no column, and no data**, no
matter how correct the React code looks.

### Before writing any frontend change, ask:

> Does the data I'm about to render already exist in the Strapi schema, and is
> it already in the populate query?

If the answer to either half is no, do the Strapi side first.

### The full chain (every structural change touches all of it)

| # | Layer | File |
| - | ----- | ---- |
| 1 | Strapi component / content-type schema | `apps/strapi/src/components/**/*.json`, `apps/strapi/src/api/*/content-types/*/schema.json` |
| 2 | Generated Strapi types | `cd apps/strapi && bun strapi ts:generate-types` |
| 3 | Populate query (else the field arrives empty) | `POPULATE_*` in `apps/web/src/lib/strapi.ts` |
| 4 | Hand-written frontend interfaces | `apps/web/src/lib/strapi.ts` (or `strapi-shared.ts` if client-safe) |
| 5 | React component | `apps/web/src/components/**` |
| 6 | Restart Strapi so the schema syncs to the database | `bun dev` |
| 7 | Enter real content in the admin and verify it renders | http://localhost:1337/admin |

Skipping **3** is the most common failure: types compile, the build passes, and
the field is `undefined` at runtime.

### Worked example — a second level of navbar sub-items

Say the UI should render sub-items *inside* sub-items (a third level). Today
`layout.navbar-item` has `label`, `link` and a flat repeatable `subItems` of
`utilities.link` — links have no children, so a nested dropdown is **not**
expressible. A frontend-only attempt at `subItem.subItems.map(...)` would type-
error at best and render nothing at worst.

The correct change:

1. Create `apps/strapi/src/components/layout/navbar-sub-item.json` — a `link`
   plus its own repeatable `subItems` of `utilities.link`.
2. Point `subItems` in `layout/navbar-item.json` at `layout.navbar-sub-item`
   instead of `utilities.link`.
3. `bun strapi ts:generate-types`.
4. Extend `POPULATE_NAVBAR` in `lib/strapi.ts` so the new depth is populated:
   `populate[items][populate][subItems][populate][subItems][populate]=page`.
   Without this line the nested items come back empty even though the schema is
   correct.
5. Update the `NavbarItem` interface in `lib/strapi.ts` with the new sub-item type.
6. Update `DesktopNavigation.tsx` / `MobileNavigation.tsx` to render the level.
7. Restart Strapi, add a nested item in the admin, confirm it appears.

### Changes that are NOT structural

Pure presentation — styling, layout, animation, reordering, copy in the design
fallbacks — touches only `apps/web` and does not require a Strapi change. The
test is whether the component reads a field that didn't exist before.

### Removing or renaming fields

Same chain in reverse, plus a warning: removing an attribute from a schema
**drops its column and its content** on the next Strapi start, and renaming is
a drop-plus-create (the old data does not migrate). Say so explicitly before
doing it, and prefer adding a new optional field over renaming one that holds
production content.

## Commands

Run from the repo root unless noted:

```bash
bun install              # install all workspaces
docker compose up -d     # start local PostgreSQL (port 5432)
bun dev                  # turbo: Strapi :1337 + Next.js :3000
bun run build            # turbo build (both apps)
bun run lint             # turbo lint (eslint in apps/web)
bun run check-types      # turbo tsc --noEmit
bun run format           # prettier over **/*.{ts,tsx,md}
```

Strapi-specific (from `apps/strapi/`):

```bash
bun strapi ts:generate-types    # regenerate types/generated/*.d.ts after schema changes
bun strapi console
```

There is **no test suite** in this repo. Verify changes by running the apps.

Verify Docker images build (both build from the repo root):

```bash
docker build -f apps/strapi/Dockerfile -t starter-strapi .
docker build -f apps/web/Dockerfile -t starter-web .
```

## How it works end to end

1. Content is authored in Strapi. A `Page` has a **dynamic zone** `blocks`.
2. Next.js serves every page from a single catch-all route,
   `apps/web/src/app/[[...slug]]/page.tsx`. The slug `home` is served at `/`.
3. `apps/web/src/lib/strapi.ts` fetches from the Strapi REST API and
   `block-renderer.tsx` switches on `__component` to pick a React component.
4. The navbar and footer are fetched in `app/layout.tsx` by async server
   components (`StrapiNavbar`, `StrapiFooter`), each with a hardcoded fallback
   if Strapi is unreachable.
5. Published responses are cached under the single cache tag `strapi` with a
   30-second revalidate. A Strapi webhook hitting `/api/revalidate` purges it.

## Content model

`apps/strapi/src/api/*/content-types/*/schema.json`

- **`Page`** — collection type, `draftAndPublish: true`. Fields: `title`,
  `slug` (uid from title), `seo` (`seo-utilities.seo`), `blocks` (dynamic zone).
- **`Navbar`** — single type, no draft/publish. `logoImage`, `items`
  (repeatable `layout.navbar-item`), `primaryButtons` (repeatable `utilities.link`).
- **`Footer`** — single type, no draft/publish. `logoImage`, `sections`
  (repeatable `elements.footer-item`), `links`, `copyright`.

Components live in `apps/strapi/src/components/`:

| Category | Components |
| --- | --- |
| `blocks/` | `hero`, `features` (+ `feature`), `rich-text`, `image-with-text`, `cta` |
| `layout/` | `navbar-item` (label + link + subItems) |
| `elements/` | `footer-item` (title + links) |
| `utilities/` | `link`, `basic-image`, `image-with-link` |
| `seo-utilities/` | `seo` (metaTitle, metaDescription, metaImage, canonicalUrl, metaRobots) |

**`utilities.link` is the central abstraction.** A link is either
`type: "page"` (a relation to a `Page`, resolved via its slug) or
`type: "external"` (a raw `href`), plus a `newTab` flag. Always resolve it with
`getLinkHref()` from `@/lib/strapi-shared` — never read `.href` directly.

## Critical conventions

These are the mechanics behind [RULE 0](#rule-0--content-structure-changes-are-full-stack-always).

### 1. Populate strings are manual — update them or media comes back empty

`apps/web/src/lib/strapi.ts` builds Strapi 5 populate queries by hand
(`POPULATE_BLOCKS`, `POPULATE_NAVBAR`, `POPULATE_FOOTER`) using the `on`
fragment syntax for the dynamic zone. Strapi does **not** deep-populate by
default. If you add a block or a nested component and forget its populate
entry, the field silently arrives as `undefined`. This is the most common bug
in this codebase.

### 2. `strapi.ts` is server-only; `strapi-shared.ts` is not

`lib/strapi.ts` calls `draftMode()` from `next/headers`, so it can never be
imported by a client component. Pure types and helpers (`Link`, `StrapiPageRef`,
`getLinkHref`) live in `lib/strapi-shared.ts`, which **must not import
`next/headers` or any server-only API**. `strapi.ts` re-exports them so server
code can keep a single import path.

- Server component → import from `@/lib/strapi`
- Client component (`"use client"`) → import from `@/lib/strapi-shared`

### 3. Types are hand-written and must be kept in sync

The interfaces in `lib/strapi.ts` mirror the Strapi schemas by hand; they are
not generated. `apps/strapi/types/generated/*.d.ts` is generated but only used
inside Strapi. Change a schema → update both.

### 4. Use plain `<img>`, not `next/image`

Media hosts (S3) are only known at runtime, so `remotePatterns` can't be
configured at build time. All image rendering goes through `mediaUrl()` from
`@/lib/strapi`, which prefixes relative `/uploads/...` paths with
`NEXT_PUBLIC_STRAPI_URL` and passes absolute (S3) URLs through unchanged.
Existing call sites carry an `// eslint-disable-next-line @next/next/no-img-element`
comment — keep that pattern.

### 5. Never hardcode content in the frontend

Copy, links and nav items belong in Strapi. The only hardcoded strings are the
deliberate fallbacks in `StrapiNavbar` / `StrapiFooter` (used when Strapi is
unreachable) and `not-found.tsx`.

## Adding a new block (the full checklist)

A worked instance of RULE 0 — note that it starts in Strapi, not in React.

1. Create the component JSON in `apps/strapi/src/components/blocks/<name>.json`.
2. Add `"blocks.<name>"` to the `blocks` dynamic zone in
   `apps/strapi/src/api/page/content-types/page/schema.json`.
3. `cd apps/strapi && bun strapi ts:generate-types`.
4. Add the block interface to the `PageBlock` union in `apps/web/src/lib/strapi.ts`.
5. **Add its populate entry to `POPULATE_BLOCKS`** in the same file
   (`populate[blocks][on][blocks.<name>][populate]=<mediaField>`, or `=true` if
   it has no media/nested components).
6. Create the React component in `apps/web/src/components/blocks/<name>.tsx`.
7. Register it in the `switch` in `apps/web/src/components/blocks/block-renderer.tsx`.

## Caching, ISR and preview

- **Published fetches**: `next: { revalidate: 30, tags: ["strapi"] }`.
  The literal `export const revalidate = 30` in `[[...slug]]/page.tsx` must stay
  in sync with `PUBLISHED_REVALIDATE` in `lib/strapi.ts` (Next requires a static
  literal, so it cannot reference the constant).
- **Draft fetches**: `cache: "no-store"` plus `&status=draft` on the query.
- **`/api/revalidate`**: Strapi webhook target. Auth header
  `Authorization: bearer <REVALIDATE_SECRET>`; calls
  `revalidateTag("strapi", "max")`. One tag covers pages, navbar and footer.
  The webhook must be created manually in Strapi → Settings → Webhooks.
- **`/api/preview`**: target of the Strapi Preview button. Validates
  `PREVIEW_SECRET`, validates the slug against `SLUG_PATTERN` (open-redirect
  guard — do not remove), enables Draft Mode, then **rewrites the
  `__prerender_bypass` cookie to `SameSite=None; Secure`** so it survives the
  admin's cross-origin iframe. The Strapi half is the `preview.handler` in
  `apps/strapi/config/admin.ts`, gated by the `PREVIEWABLE_CONTENT_TYPES`
  whitelist.
- **`/api/exit-preview`**: linked with a raw `<a>` in `layout.tsx`, deliberately
  not `<Link>`, so Next never prefetches and silently exits draft mode.
- Rendering draft content also needs `STRAPI_API_TOKEN` in `apps/web/.env`;
  without it preview falls back to published data.

## Strapi configuration

- `config/database.ts` — `DATABASE_CLIENT` selects postgres/mysql/sqlite.
  For postgres, `DATABASE_URL` takes precedence over the discrete
  `DATABASE_HOST/PORT/NAME/USERNAME/PASSWORD` vars. Throws on unknown clients.
- `config/plugins.ts` — the upload provider **auto-switches to `aws-s3` the
  moment `S3_ENDPOINT` is set**; otherwise files go to `public/uploads`.
  `forcePathStyle: true` is required by Rock8Cloud storage and MinIO. Also
  defines the upload mimetype allowlist and executable denylist.
- `config/middlewares.ts` — CSP: `frame-src` includes `CLIENT_URL` (for the
  preview iframe) and `img-src`/`media-src` include the S3 hosts (for admin
  thumbnails). Adding a new media host means updating this.
- `config/server.ts` — `PUBLIC_URL` is the instance's own public URL, used by
  the seeded "CMS Admin" navbar link.
- `config/api.ts` — `strictParams: true`, `defaultLimit: 25`, `maxLimit: 100`.
  Note the 100 cap: `getAllPages()` requests `pagination[pageSize]=100` and does
  not paginate, so sitemap/`generateStaticParams` silently cap at 100 pages.

## Seeding / first run

`apps/strapi/src/index.ts` `bootstrap()` runs on every start and is idempotent
(guarded by count checks):

1. `grantPublicReadOnPages` — grants the public users-permissions role
   `find`/`findOne` on page, navbar and footer, so the frontend works with **no
   API token**. Add new public content types here.
2. `seedHomePage` — if zero pages exist, uploads the SVGs in
   `apps/strapi/seed-assets/` through the configured upload provider and creates
   a published `home` page.
3. `seedNavbar` / `seedFooter` — default navigation.

Deleting all pages in the admin will cause the home page to be re-seeded on the
next restart.

## Environment variables

`apps/strapi/.env` (template: `.env.example`)

| Variable | Purpose |
| --- | --- |
| `APP_KEYS`, `API_TOKEN_SALT`, `ADMIN_JWT_SECRET`, `JWT_SECRET`, `TRANSFER_TOKEN_SALT`, `ENCRYPTION_KEY` | Strapi secrets (`openssl rand -base64 16`) |
| `DATABASE_URL` or `DATABASE_HOST/PORT/NAME/USERNAME/PASSWORD/SSL` | PostgreSQL |
| `S3_ENDPOINT`, `S3_BUCKET`, `S3_REGION`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`, `S3_PUBLIC_URL` | Unset → local filesystem uploads |
| `CLIENT_URL` | Public URL of the web app (preview links, CSP frame-src) |
| `PUBLIC_URL` | Public URL of Strapi itself |
| `PREVIEW_SECRET` | Must match the web app's value |

`apps/web/.env` / `.env.local`

| Variable | Purpose |
| --- | --- |
| `STRAPI_URL` | Strapi URL used server-side |
| `NEXT_PUBLIC_STRAPI_URL` | Strapi URL used by the browser (filesystem media) |
| `NEXT_PUBLIC_SITE_URL` | Absolute public base URL. **Empty disables sitemap.xml and absolute canonical/OG URLs** |
| `STRAPI_API_TOKEN` | Read-only token; required to preview drafts |
| `PREVIEW_SECRET` | Must match Strapi |
| `REVALIDATE_SECRET` | Auth for the `/api/revalidate` webhook |

Any new variable must also be added to `globalEnv` in `turbo.json`, or Turbo
will cache builds across differing env values.

## Styling

Tailwind **v4**, CSS-first configuration — there is no `tailwind.config.js`.
The theme lives in `@theme inline` / `:root` in `apps/web/src/app/globals.css`.
shadcn/ui is configured in `components.json` (style `radix-nova`, lucide icons,
RSC on); generated primitives go to `src/components/ui/`.

The design is a deliberate **editorial/print** look: warm paper background, ink
foreground, vermilion primary, oklch colors, small radius (`0.25rem`), Fraunces
(display serif) + Instrument Sans + JetBrains Mono, and custom `halftone`,
`plate`, `dropcap` and `reveal` utilities. Match it when adding blocks — eyebrow
labels in uppercase mono, `Fig. —` captions, rotated image "plates".

## Deployment

Both apps have a production `Dockerfile` that **builds from the repository
root** (`docker build -f apps/web/Dockerfile .`). Web uses Next's
`output: "standalone"`; `next.config.ts` pins `outputFileTracingRoot` and
`turbopack.root` to the monorepo root. Strapi builds the admin panel then ships
the workspace. The `EXPOSE`d ports (1337 / 3000) must match the ports configured
on the Rock8Cloud services or health checks fail. Push to `main` redeploys.

Strapi may be unreachable during the Docker build — the fetch helpers catch and
return `null`/`[]` so the build succeeds and pages render on first request.
Preserve that behaviour when touching `lib/strapi.ts`.

## Known drift (fix if you touch these areas)

- `apps/web/.env.example` **does not exist**, but `README.md` instructs
  `cp apps/web/.env.example apps/web/.env.local`.
- `README.md` says "5-minute ISR safety net" in two places; the code uses 30
  seconds.
- The local `apps/strapi/.env` comment references PostgreSQL on port 6500 while
  `docker-compose.yml` publishes 5432.
- `apps/strapi/public/uploads/` contains duplicate seed SVGs from repeated
  database resets.
