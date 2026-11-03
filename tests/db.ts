import { existsSync } from "node:fs"
import { drizzle } from "drizzle-orm/node-postgres"
import { migrate } from "drizzle-orm/node-postgres/migrator"
import { Pool } from "pg"

if (existsSync(".env.local")) process.loadEnvFile(".env.local")

/** Fresh, migrated test database (never Neon). */
export async function testDb() {
  const url = process.env.TEST_DATABASE_URL
  if (!url || !/localhost|127\.0\.0\.1/.test(url))
    throw new Error("TEST_DATABASE_URL must be a local database")
  const pool = new Pool({ connectionString: url, max: 2 })
  await pool.query(
    "drop schema if exists public cascade; drop schema if exists drizzle cascade; create schema public;"
  )
  const db = drizzle({ client: pool })
  await migrate(db, { migrationsFolder: "./db/migrations" })
  return { db, pool }
}
