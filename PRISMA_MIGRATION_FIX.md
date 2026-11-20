# Fix Prisma P3005 on Render

`P3005` means Prisma found existing database objects but cannot safely start
the migration history from the beginning. It is not a missing HTTP route. The
backend already serves `/` and `/health`; if startup exits during
`prisma migrate deploy`, Render has no running server to route requests to.

Do not run `prisma migrate reset`, `prisma db push`, manually create
`_prisma_migrations`, or insert made-up migration checksums on a database with
data you need.

## Configure the database URLs

Set both variables in the Render backend service:

- `DATABASE_URL`: application connection URL; a pooled Neon URL is suitable
  for app traffic.
- `DIRECT_URL`: direct, non-pooled PostgreSQL URL for Prisma migrations. For
  Neon, its hostname must not contain `-pooler`.

The Prisma datasource uses `DIRECT_URL` for migration operations. Back up the
database before inspecting or changing its migration history.

## Inspect before baselining

From `backend`, compare the live database with the checked-in Prisma schema
using the direct URL. Keep the URL in an environment variable; do not paste it
into source files or commit it.

```sh
pnpm exec prisma migrate diff \
  --from-url "$DIRECT_URL" \
  --to-schema-datamodel prisma/schema.prisma \
  --script
```

Review the entire output. Only an empty diff confirms that the database schema
matches the current Prisma schema. If Prisma reports SQL, or if you cannot
confirm that every existing migration's changes are already present, stop and
reconcile the schema and data first. This repository's historical `AppRole`
enum changes make that check especially important; do not assume the database
matches merely because its tables exist.

## Record a verified baseline

Only when the database already contains the effects of all three checked-in
migrations (`0_init`, `1_supply_chain`, and `2_role_model_migration`), record
them through Prisma from `backend`:

```sh
pnpm exec prisma migrate resolve --applied 0_init
pnpm exec prisma migrate resolve --applied 1_supply_chain
pnpm exec prisma migrate resolve --applied 2_role_model_migration
pnpm exec prisma migrate deploy
```

Run these commands once against the correct production database, using the
same migration files as the deployment. If some migrations are already
recorded in `_prisma_migrations`, do not resolve those again; inspect
`pnpm exec prisma migrate status` and handle only the confirmed missing
entries. `migrate resolve` records history; it does not apply the migration's
SQL.

Once the baseline is correct, the Render start command can remain:

```sh
pnpm prisma migrate deploy && pnpm start:prod
```

After startup succeeds, verify the Render service's actual domain at `GET /`
and the API status route at `GET /api/v1/`. Configure the frontend's
`VITE_API_URL` to the Render service origin (without `/api/v1`); the frontend
adds that prefix automatically.
