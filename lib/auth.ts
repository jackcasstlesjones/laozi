import "server-only"
import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { nextCookies } from "better-auth/next-js"

import { db } from "@/db"
import * as schema from "@/db/schema"
import { resolveBaseUrl, resolveTrustedOrigins } from "@/lib/base-url"
import { env } from "@/lib/env"

export const baseURL = resolveBaseUrl(env)

const THIRTY_DAYS = 60 * 60 * 24 * 30

export const auth = betterAuth({
  baseURL,
  secret: env.BETTER_AUTH_SECRET,
  trustedOrigins: resolveTrustedOrigins(env),
  database: drizzleAdapter(db, { provider: "pg", schema }),
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
    minPasswordLength: 12,
  },
  session: {
    expiresIn: THIRTY_DAYS,
  },
  rateLimit: {
    enabled: true,
    storage: "database",
  },
  plugins: [nextCookies()],
})
