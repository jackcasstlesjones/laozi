/**
 * One-off import of Lose It's weight CSV export.
 *   pnpm import:loseit <file.csv>                 → local database
 *   pnpm import:loseit <file.csv> --production   → required for any non-local database
 */
import { readFileSync } from "node:fs"
import { inArray } from "drizzle-orm"
import { drizzle } from "drizzle-orm/node-postgres"
import { Pool } from "pg"

import { normaliseDatabaseUrl } from "../db/url"
import { weighIn } from "../db/schema"
import { parseLoseItCsv, planImport } from "../lib/weight/loseit-csv"

const args = process.argv.slice(2)
const file = args.find((a) => !a.startsWith("--"))
if (!file)
  throw new Error("usage: pnpm import:loseit <file.csv> [--production]")

const url = process.env.DATABASE_URL_UNPOOLED
if (!url) throw new Error("DATABASE_URL_UNPOOLED is not set")
const host = new URL(url).hostname
const isLocal = host === "localhost" || host === "127.0.0.1"
if (!isLocal && !args.includes("--production")) {
  throw new Error(
    `Refusing to write to non-local host ${host} without --production`
  )
}

const parsed = parseLoseItCsv(readFileSync(file, "utf8"))
const pool = new Pool({ connectionString: normaliseDatabaseUrl(url), max: 1 })
const db = drizzle({ client: pool })

async function main() {
  const dates = parsed.entries.map((e) => e.date)
  const existing = dates.length
    ? await db
        .select({ date: weighIn.date })
        .from(weighIn)
        .where(inArray(weighIn.date, dates))
    : []
  const plan = planImport(parsed.entries, new Set(existing.map((r) => r.date)))
  if (plan.toInsert.length) {
    await db
      .insert(weighIn)
      .values(plan.toInsert)
      .onConflictDoNothing({ target: weighIn.date })
  }

  console.log(`target: ${isLocal ? "local" : host}`)
  console.log(`imported: ${plan.toInsert.length}`)
  console.log(`skipped (date already had an entry): ${plan.skippedExisting}`)
  console.log(
    `skipped (deleted in Lose It): ${parsed.deletedRows.length}${parsed.deletedRows.length ? ` (rows ${parsed.deletedRows.join(", ")})` : ""}`
  )
  console.log(
    `skipped (same date, later row won): ${parsed.supersededRows.length}`
  )
  console.log(
    `unreadable rows: ${parsed.unreadableRows.length ? parsed.unreadableRows.join(", ") : "none"}`
  )
}

main()
  .catch((err) => {
    console.error(err)
    process.exitCode = 1
  })
  .finally(() => pool.end())
