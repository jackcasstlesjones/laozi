import "server-only"
import { z } from "zod"

const schema = z.object({
  DATABASE_URL: z.url(),
  BETTER_AUTH_SECRET: z.string().min(32),
  // Production domain. Undefined on previews: use `baseURL` from lib/auth.
  BETTER_AUTH_URL: z.url().optional(),
  VERCEL_ENV: z.enum(["production", "preview", "development"]).optional(),
  VERCEL_URL: z.string().optional(),
  VERCEL_BRANCH_URL: z.string().optional(),
  VERCEL_PROJECT_PRODUCTION_URL: z.string().optional(),
})

export const env = schema.parse(process.env)
