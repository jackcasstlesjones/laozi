# Laozi — Plan

## Where we are

- **2026-11-03:** M0 in progress. Local stack, auth and the DB are working; next is GitHub + Vercel + Neon and the first live deploy.
- **Open questions for Jack:** where the Lose It CSV export lives (needed for M4); go-ahead to migrate the `claude-recipes` repo files to the new schema (M5).

## M0 Foundations

- [x] Env validation, Docker Postgres, Drizzle client + config, gates script
- [x] Schema: weigh-ins, goal settings, Better Auth tables + constraint tests
- [x] Better Auth (sign-up disabled, 30-day sessions, DB rate limit) + idempotent seed of the single account
- [ ] GitHub repo, Vercel project (lhr1), Neon via Marketplace, production secrets
- [ ] First production deploy runs migrate → seed → build; `/api/health` green

## M1 Design system and shell

- [ ] App shell: header (title, account link, sign out), Weight/Food tabs, responsive container; system light/dark
- [ ] Login page ("Incorrect email or password"), proxy redirect for signed-out users, session check in the data layer

## M2 Walking skeleton: weigh-ins

- [ ] Record a weigh-in (date defaults to today, no future dates, 30–300 validation + message, replace-with-confirmation)
- [ ] Entries list newest first ("Tue, Nov 3, 2026", "85.6 kg"), edit, delete with confirmation

## M3 Chart engine, then chart

- [ ] Pure functions: range windows (1W…All), y-domain with goal + padding, projection line + All-range extension, nearest-point lookup — tested
- [ ] Chart UI: right y-axis, date axis, hover/tap tooltip, hollow latest marker, dashed goal line with bold label, projection, empty and single-point states
- [ ] Goal settings (goal kg, target rate default 0.5)
- [ ] Export markdown + Copy

## M4 Lose It import

- [ ] Pure CSV parser (lb→kg, last row per date wins, unreadable row numbers) — tested
- [ ] `pnpm import:loseit <file>` script: skips existing dates, reports imported/skipped/unreadable; run once against production with approval

## M5 Food

- [ ] Recipe schema (Zod) + GitHub fetcher with 5-minute cache, skipped-file count — tested
- [ ] Recipe list: search, sort by name/kcal, kcal + macros; recipe detail
- [ ] `claude-recipes`: document schema in its CLAUDE.md, migrate files, delete legacy gyoza file (needs Jack's go-ahead)

## M6 Account and polish

- [ ] Change password (current, new ≥12, confirm; revokes other sessions)
- [ ] Polish pass: loading/error states, metadata, favicon
