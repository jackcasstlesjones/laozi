---
paths:
  - "lib/auth*.ts"
  - "lib/base-url.ts"
  - "app/api/auth/**"
  - "proxy.ts"
  - "app/login/**"
  - "app/account/**"
---

# Auth rules

- Sign-up stays disabled; the only account comes from the seed.
- Login errors always say "Incorrect email or password", never which one was wrong.
- Rate limiting uses database storage (serverless has no shared memory).
- Use `baseURL` from `lib/auth.ts`; never read `BETTER_AUTH_URL` directly.
