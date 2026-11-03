import { existsSync } from "node:fs"
import { defineConfig } from "drizzle-kit"

if (existsSync(".env.local")) process.loadEnvFile(".env.local")

const url = process.env.DATABASE_URL_UNPOOLED
if (!url) throw new Error("DATABASE_URL_UNPOOLED is not set")

// DDL goes over the direct connection, never through PgBouncer.
export default defineConfig({
  dialect: "postgresql",
  schema: "./db/schema.ts",
  out: "./db/migrations",
  dbCredentials: {
    url: url.replace(/sslmode=require\b/, "sslmode=verify-full"),
  },
})
