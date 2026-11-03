# Laozi — Spec

Laozi is a personal replacement for the two Lose It features Jack actually uses: weight tracking with a chart, and a recipe list. Single user. Responsive web app.

## Navigation

Two tabs: **Food** and **Weight**. Food is the landing page. Account settings are reached from the header.

## Weight tab

### Weigh-ins

- An entry is a date plus a weight in kg, to the nearest 0.05 kg (e.g. 85.6 or 85.65).
- One entry per date. Recording a weight on a date that already has one replaces it, after a confirmation.
- The date defaults to today. Future dates are not allowed.
- The weight must be between 30 and 300 kg. Otherwise show "Enter a weight between 30 and 300 kg".
- Entries are listed newest first, showing the date (e.g. "Tue, Nov 3, 2026") and the weight (e.g. "85.6 kg").
- **Precision:** weights and the goal are stored to the nearest 0.05 kg and shown exactly as stored, with at least one decimal: "86.0 kg", "85.6 kg", "85.65 kg".
- Each entry can be edited or deleted. Deleting asks for confirmation.

### Chart

- Line chart of weight over time. The y-axis labels are on the right, the date labels along the bottom.
- Range selector: 1W, 1M, 3M, 6M, 1Y, All. Defaults to 6M.
- The y-axis scales to the visible entries plus the goal weight, with some padding.
- Switching range animates (500 ms): the same line slides and stretches to the new window and y-scale, the axis labels move with it and fade in or out, and the projection follows. With the reduced-motion setting on, it switches at once.
- Hovering (desktop) or tapping (mobile) shows the nearest entry's date and weight.
- The latest entry gets a hollow circle marker.
- Goal line: a dashed horizontal line at the goal weight, with its value labelled in bold on the axis.
- Projection line: a dashed line from the latest entry heading toward the goal at the target weekly rate. It is cut off at the edge of the visible range. On the All range, the range extends to the date the projection reaches the goal.
- Empty state (no entries): "No weigh-ins yet" with the record button.
- One entry: a single point, no line.

### Importing Lose It history

- A one-off import of Lose It's CSV export, run once when the app is set up. There is no import screen in the app.
- It reads each row's date and weight. Weights recorded in lb are converted to kg, and all weights are rounded to the nearest 0.05 kg.
- Where several rows share a date, the last one wins. If an entry already exists for a date, the import skips that row.
- `--refresh` also restores precision on existing entries whose value is within 0.05 kg of the CSV's. Entries edited further away than that are left alone.
- When it finishes, it reports how many entries were imported, how many were skipped, and the row numbers of any rows it couldn't read.

### Goal settings

- Set on the Settings page (from the header), not the Weight tab: goal weight (kg) and target rate (kg per week, default 0.5).
- With no goal set, there is no goal line or projection line.

## Food tab

### Weight trend

- A compact version of the weight chart (72 px tall) always sits in a card across the top of the tab, showing the last 14 days: the line, a dot per weigh-in, the hollow latest marker and both axes' labels (fewer of them than the full chart), with the y-scale ending on the ticks around the data so the plot sits tight against the date labels. It has no goal or projection lines, so the recent trend fills the height. Clicking or tapping it opens the Weight tab.
- If there is an entry from before the 14 days, the line comes in from the left edge heading toward the first entry inside them.

### Source

- The source of truth is the public GitHub repo `jackcasstlesjones/claude-recipes`: one JSON file per recipe.
- The app's server lists the repo's files with one call to GitHub's public API, then downloads each file from `raw.githubusercontent.com`. It caches the results and refreshes them every 5 minutes. No GitHub token is needed while the repo is public. If the repo goes private, add a read-only fine-grained token on the server only.
- A file that is invalid JSON or doesn't match the schema is skipped. The app shows how many files were skipped.

### Schema (to be documented in the repo's CLAUDE.md)

```json
{
  "name": "Tuna Egg Hash",
  "kcal": 575,
  "serving": "1 portion",
  "macros": { "protein_g": 75, "carbs_g": 8, "fat_g": 25 },
  "ingredients": [{ "item": "Tuna in brine (2 tins)", "kcal": 220 }],
  "notes": "optional",
  "tags": ["optional"]
}
```

- `kcal` is for one `serving`. For per-item foods like gyozas, use `"serving": "1 gyoza"`, so the app can always show one calorie figure.
- The existing files get migrated to this schema once. The legacy gyoza file moves to `legacy/`. The app reads only `.json` files in the repo root.

### Browsing

- A searchable list of recipes, each showing its name and kcal per serving. Macros are hidden by default; a **Macros** toggle shows them in the list (not remembered between visits).
- Sort by name or by kcal.
- Opening a recipe shows its ingredients with calories for each, macros, notes and tags.
- The app has no add, edit or delete for recipes.

### Calorie counting

- Each recipe row in the list has − and + buttons with today's count between them. + adds one serving to today; − removes one (not below zero).
- **Desktop (768 px and up):** Today sits in a column to the right of the recipe list and stays in view while scrolling: the amber total bar (`--chart-2`; "Today · 3 items · 880 kcal"), then today's items ("2 × Assorted Gyozas · 80 kcal"), each removable, the custom-item form and a History link.
- **Mobile (under 768 px):** the same amber total bar floats at the bottom of the screen ("Today · 3 items · 880 kcal"). Tapping it opens the Today screen (`/food/today`) with the items, the remove buttons and the custom-item form. The recipe list has bottom padding so the bar never covers it.
- **Custom items:** a name and kcal (whole number, 1–10,000), e.g. "Sausage and mash, 800". They are saved against today only and never become recipes.
- With a daily calorie limit set, the total bar reads "880 / 2,000 kcal" and has a horizontal progress bar (no animation). Over the limit the bar is full and red, and "120 kcal over" replaces the item count. Without a limit it shows the total only.
- "Today" is the calendar date in the browser's time zone. At midnight the total starts again from 0; the previous day's entries stay as that day's record. No background job is involved.
- Each entry stores the name and kcal per serving at the time it was added, so editing or deleting a recipe later doesn't change history.
- **History** (`/food/history`): every day with entries, newest first, with its total and items. Read-only.

## LLM access

- **Recipes:** Claude adds, edits and removes recipes by committing JSON files to the repo, following the schema in CLAUDE.md. This works from Claude Code and from Claude chats that have repo access. Claude Desktop needs GitHub's official MCP server to do it.
- **Weights:** an "Export" action produces markdown and offers a Copy button. The markdown includes the goal weight, target rate, the latest entry and every weigh-in:
  ```
  # Weight log (kg)
  Goal: 80.0 (0.5 kg/week)
  | Date | kg |
  |---|---|
  | 2026-11-03 | 85.6 |
  ```
- There is no API or MCP server for v1. If Claude later needs to write weights, add a small authenticated API then.

## General

- Theme: Jack's shadcn theme tokens (orange primary), with light and dark modes following the system setting.
- Responsive: one column on mobile. On wide screens the chart and the entries list sit side by side.
- Weights are stored in the app's own database.

## Account

- Single user. Log in with email and password. There is no sign-up page: the one account is created at deploy time.
- Wrong email or password shows "Incorrect email or password". It doesn't reveal which one was wrong.
- There is no forgot-password or reset-by-email flow.
- The Settings page (`/account`, from the header) has: **Goal** (see Goal settings), **Daily calorie limit** (whole kcal, 500–10,000; empty for none), and **Change password** (current password, new password with a minimum of 12 characters, confirm new password). Changing the password logs out every other session.
- Sessions last 30 days.

## Non-goals (v1)

- Barcode scanning, exercise, macro totals, editing past days' calorie logs. Multiple users or sign-up. Recipe editing in the app. An API or MCP server.

## Information architecture

- `/login` — email + password.
- `/` → redirects to `/food`.
- `/weight` — chart + entries list (side by side on wide screens). Record button above them on wide screens; full width between the chart and the list when stacked. Export at the top right of the entries card.
- `/food` — weight trend, Today card, searchable, sortable recipe list with +/− counters. `/food/[slug]` — recipe detail. `/food/today` — today's items (the mobile bar opens it). `/food/history` — past days.
- `/account` — Settings (from the header): goal, daily calorie limit, change password.
- `/api/auth/*` — Better Auth. `/api/health` — DB ping.

## Design system

- shadcn/ui `base-nova` style on Base UI, Tailwind 4 `@theme` tokens in `app/globals.css` (Jack's theme, neutral base; `--primary` and `--accent` are amber-orange `oklch(0.76 0.17 62)` with dark-brown text on it, changed from the original burnt orange on 2026-11-03 at Jack's request). Light/dark follow the system (`next-themes`, `defaultTheme="system"`).
- Type: Inter (`--font-sans`), Geist Mono (`--font-mono`) for numbers in tables where alignment matters.
- Chart colours from tokens only: line `--primary`, goal and projection lines `--muted-foreground`, dashed.
- Banned: gradients; hard-coded colours outside `globals.css`, a second component library, and styling the same thing twice (extend `components/ui` instead).

## Technical architecture

- **Stack:** Next.js 16.4 (App Router, Turbopack, no Cache Components), React 19.3, TypeScript strict, pnpm. Postgres 17 (Docker locally, Neon in production) via Drizzle ORM **1.0.0-rc.5 (pinned)** + `pg`. Zod 4 with `drizzle-orm/zod`. Better Auth 1.7. Vitest.
- **Layout (no `src/`):** `app/` routes; `components/` (`ui/` = shadcn); `lib/` (env, auth, domain logic); `db/` (schema, relations, client, migrations); `scripts/` (seed, gates, import); `tests/` helpers.
- **Data model:** `weigh_in(id, date unique, weight_kg numeric(4,1) check 30–300)`; `goal_settings` singleton (`id = 1`, `goal_kg` nullable, `rate_kg_per_week` default 0.5, `daily_kcal_limit` nullable 500–10,000); `food_log(id, date, recipe_slug nullable, name, kcal per serving, quantity ≥ 1)`, unique on `(date, recipe_slug)` for recipe rows; Better Auth `user`, `session`, `account`, `verification`, `rate_limit`.
- **Auth:** Better Auth email/password, sign-up disabled, min password 12, 30-day database sessions, database rate limiting. The account is created by the seed from `ADMIN_EMAIL`/`ADMIN_PASSWORD` only if it doesn't exist.
- **Recipes:** fetched server-side from GitHub (contents API listing + raw downloads), cached with a 300 s revalidate; validated per file with Zod.
- **Env vars:** `DATABASE_URL` (pooled), `DATABASE_URL_UNPOOLED` (migrations/seed), `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` (production only), `ADMIN_EMAIL`, `ADMIN_PASSWORD`; locally also `TEST_DATABASE_URL`.
- **Deployment:** GitHub `jackcasstlesjones/laozi` (public) → Vercel project `laozi`, region `lhr1`, Neon `aws-eu-west-2` via the Vercel Marketplace. Every push to `main` deploys production; the build runs `db:migrate && db:seed && build`. No previews.

## Quality bar

- Gates (`pnpm gates`: typecheck, lint, test, build) pass before every commit.
- Pure logic (chart scales, projection, CSV import parsing, recipe parsing, export markdown) is unit-tested against hand-computed fixtures. Every DB constraint has an integration test.

## Decisions

- 2026-11-03: Kept the existing shadcn scaffold at the repo root instead of `src/`.
- 2026-11-03: Drizzle pinned to `1.0.0-rc.5` for `drizzle-orm/zod`; Better Auth 1.7 supports it.
- 2026-11-03: Weights stored as `numeric(4,1)` read as JS numbers; dates as `date` strings (`YYYY-MM-DD`), "today" is the user's local date sent from the browser.
- 2026-11-03: Weights display rounded to the nearest 0.25 kg (Jack's request); storage stays at one decimal, so nothing is lost. The markdown export uses the stored values.
- 2026-11-03: Weights and the goal are now stored as `numeric(5,2)` to the nearest 0.05 kg and shown as stored (Jack's request), replacing the one-decimal storage and 0.25 kg display rounding above. The goal shares the weight validator, so it moved too.
- 2026-11-03: Rows marked `Deleted=true` in the Lose It export are not imported; the import reports them alongside the skipped rows.
- 2026-11-03: Single-user app: app tables have no `user_id`.
- 2026-11-03: No Cache Components; recipes use `unstable_cache`/fetch revalidate (300 s).
- 2026-11-03: On 1W–1Y the chart window ends today plus a quarter of the window's length when a goal is set, so the projection has room; on All it runs from the first entry to the day the projection reaches the goal (capped at 3 years).
- 2026-11-03: Future dates are checked against the browser's local date (sent with each save).
- 2026-11-03: The chart is hand-built SVG (no chart library).
- 2026-11-03: Calorie counting groups entries by local calendar date (time zone from a `tz` cookie set by the browser); midnight "reset" is just a new date, not a job.
- 2026-11-03: Food log entries snapshot name and kcal, so recipes can stay in GitHub without breaking history.
- 2026-11-03: Installable PWA: `app/manifest.ts` (standalone, start `/`, dark splash `#0a0a0a`), PNG icons generated from the brand mark by `scripts/generate-icons.mjs`; the proxy lets the manifest and icons through unauthenticated.
- 2026-11-03: Local Postgres on port 5442 (`laozi` and `laozi_test` databases).
- 2026-11-03: Production domain is `laoziloss.vercel.app`; `BETTER_AUTH_URL` set to it. (`laozi-bay.vercel.app` also still resolves.)
