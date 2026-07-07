# CLAUDE.md

**All project guidance lives in [AGENTS.md](AGENTS.md). Read it before making
changes.** It is the single source of truth — keep it updated rather than
duplicating content here.

## The one rule that overrides everything

**Content structure changes are full-stack.** Strapi owns the shape of all
content; the frontend only renders it. If a UI change needs a field, a nesting
level or an item type the Strapi schema doesn't already define, you must change
the schema JSON, regenerate types, update the `POPULATE_*` query, update the
hand-written interfaces and *then* the React component — in the same piece of
work. A frontend-only structural change produces no migration, no column and no
data: the field is `undefined` at runtime and the app renders empty or breaks.
See RULE 0 in AGENTS.md for the file-by-file chain and a worked example.

Quick orientation:

- Monorepo: `apps/strapi` (Strapi 5 CMS, :1337) + `apps/web` (Next.js 16, :3000),
  bun workspaces driven by Turbo.
- `bun dev` runs both; `docker compose up -d` must be running first for PostgreSQL.
- There is no test suite. Verify with `bun run lint` and `bun run check-types`,
  then exercise the running apps.
- The three things that most often break: forgetting a `POPULATE_*` entry in
  `apps/web/src/lib/strapi.ts`, importing `@/lib/strapi` from a client component,
  and letting the hand-written TS types drift from the Strapi schemas. AGENTS.md
  explains each.
