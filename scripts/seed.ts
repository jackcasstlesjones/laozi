/**
 * Idempotent seed. Runs on every production build after migrations.
 * - goal_settings singleton row (never overwrites a goal the user has set)
 * - the single account, created only if it doesn't exist (a changed password survives)
 */
import { randomUUID } from "node:crypto"
import { hashPassword } from "better-auth/crypto"
import { eq } from "drizzle-orm"
import { drizzle } from "drizzle-orm/node-postgres"
import { Pool } from "pg"
import { z } from "zod"

import { normaliseDatabaseUrl } from "../db/url"
import { account, goalSettings, user } from "../db/schema"

const env = z
  .object({
    DATABASE_URL_UNPOOLED: z.url(),
    ADMIN_EMAIL: z.email(),
    ADMIN_PASSWORD: z.string().min(12),
  })
  .parse(process.env)

const pool = new Pool({
  connectionString: normaliseDatabaseUrl(env.DATABASE_URL_UNPOOLED),
  max: 1,
})
const db = drizzle({ client: pool })

async function main() {
  await db.insert(goalSettings).values({ id: 1 }).onConflictDoNothing()

  const email = env.ADMIN_EMAIL.toLowerCase()
  const [existing] = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.email, email))
  if (existing) {
    console.log("seed: account exists, left unchanged")
  } else {
    const id = randomUUID()
    const password = await hashPassword(env.ADMIN_PASSWORD)
    await db.transaction(async (tx) => {
      await tx
        .insert(user)
        .values({ id, name: "Jack", email, emailVerified: true })
      await tx.insert(account).values({
        id: randomUUID(),
        accountId: id,
        providerId: "credential",
        userId: id,
        password,
      })
    })
    console.log("seed: account created")
  }
  console.log("seed: done")
}

main()
  .catch((err) => {
    console.error(err)
    process.exitCode = 1
  })
  .finally(() => pool.end())
