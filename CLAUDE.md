@AGENTS.md

# Laozi

Personal weight tracker + recipe browser for one user. Spec: `docs/SPEC.md` (source of truth). Plan and status: `docs/PLAN.md`.

## Stack

Next.js 16 App Router (root layout, no `src/`), React 19, TS strict, pnpm · Postgres 17 (Docker locally on :5442, Neon in prod) · Drizzle 1.0.0-rc.5 (pinned) + `pg` · Zod 4 + `drizzle-orm/zod` · Better Auth · Tailwind 4 + shadcn (base-nova) · Vitest. Deployed on Vercel (`lhr1`); every push to `main` is a production deploy.

## Commands

- `pnpm db:up` start Postgres · `pnpm db:generate` / `db:migrate` / `db:seed`
- `pnpm dev` · `pnpm gates` (typecheck, lint, test, build → `PASS` or `FAIL: <step>`)

## Layers

`db/` schema → `drizzle-orm/zod` schemas → `lib/` domain logic (pure, tested) → server actions / route handlers (auth check) → `app/` Server Components → client components only where interaction needs it.

## Hard rules

- Never print, commit or read out secrets or `.env*` files (except `.env.example`). The repo is **public**.
- Never point local work or tests at Neon. Tests use `TEST_DATABASE_URL` (local only).
- Never edit a migration that has been pushed; migrations must be backward-compatible with the deploy still serving.
- Every server action and data read checks the session; proxy redirects are only optimistic.
- Never read `env.BETTER_AUTH_URL` directly; use `baseURL` from `lib/auth.ts`.
- Batch pushes to `main`; run `pnpm gates` before every commit.
