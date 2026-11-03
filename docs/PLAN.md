# Laozi — Plan

## Where we are

- **2026-11-03:** M0–M6 features built and live at https://laoziloss.vercel.app: login, Weight (chart, entries, goal, export, 157 imported weigh-ins), Food (recipes from GitHub), Account. Next: polish (loading/error states, icon) and anything Jack finds while testing.
- **Open questions for Jack:** none.

## M0 Foundations

- [x] Env validation, Docker Postgres, Drizzle client + config, gates script
- [x] Schema: weigh-ins, goal settings, Better Auth tables + constraint tests
- [x] Better Auth (sign-up disabled, 30-day sessions, DB rate limit) + idempotent seed of the single account
- [x] GitHub repo, Vercel project (lhr1), Neon via Marketplace, production secrets
- [x] First production deploy runs migrate → seed → build; `/api/health` green

## M1 Design system and shell

- [x] App shell: header (title, account link, sign out), Weight/Food tabs, responsive container; system light/dark
- [x] Login page ("Incorrect email or password"), proxy redirect for signed-out users, session check in the data layer

## M2 Walking skeleton: weigh-ins

- [x] Record a weigh-in (date defaults to today, no future dates, 30–300 validation + message, replace-with-confirmation)
- [x] Entries list newest first ("Tue, Nov 3, 2026", "85.6 kg"), edit, delete with confirmation

## M3 Chart engine, then chart

- [x] Pure functions: range windows (1W…All), y-domain with goal + padding, projection line + All-range extension, nearest-point lookup — tested
- [x] Chart UI: right y-axis, date axis, hover/tap tooltip, hollow latest marker, dashed goal line with bold label, projection, empty and single-point states
- [x] Goal settings (goal kg, target rate default 0.5)
- [x] Export markdown + Copy

## M4 Lose It import

- [x] Pure CSV parser (lb→kg, last row per date wins, deleted rows ignored, unreadable row numbers) — tested
- [x] `pnpm import:loseit <file>` script: skips existing dates, reports imported/skipped/unreadable (local run: 157 imported, 4 deleted rows ignored)
- [x] Ran the import against production 2026-11-03: 157 imported, 4 deleted rows ignored, none unreadable

## M5 Food

- [x] Recipe schema (Zod) + GitHub fetcher with 5-minute cache, skipped-file count — tested
- [x] Recipe list: search, sort by name/kcal, kcal + macros; recipe detail
- [x] `claude-recipes`: schema in its CLAUDE.md, files migrated, legacy gyoza file moved to `legacy/` (done by Jack)

## M6 Account and polish

- [x] Change password (current, new ≥12, confirm; revokes other sessions)
- [ ] Polish pass: loading/error states, metadata, favicon
