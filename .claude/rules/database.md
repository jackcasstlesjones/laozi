---
paths:
  - "db/**"
  - "scripts/**"
  - "drizzle.config.ts"
---

# Database rules

- Change `db/schema.ts`, then `pnpm db:generate`; never hand-write or edit pushed migrations.
- Add, backfill, remove later: a migration must work with the previous deploy still running.
- Every constraint gets an integration test in `db/*.test.ts` using `testDb()` from `tests/db.ts`.
- Derive validation from tables with `drizzle-orm/zod` (`createInsertSchema` etc.), never retype shapes.
- The seed is idempotent and must never overwrite user data (goal, password).
