import "server-only"
import { desc, gte, lt } from "drizzle-orm"

import { db } from "@/db"
import { weighIn } from "@/db/schema"

export async function listWeighIns() {
  return db
    .select({ id: weighIn.id, date: weighIn.date, weightKg: weighIn.weightKg })
    .from(weighIn)
    .orderBy(desc(weighIn.date))
}

/** Entries from `date` on, plus the latest one before it. */
export async function listWeighInsForTrend(date: string) {
  const columns = { date: weighIn.date, weightKg: weighIn.weightKg }
  const [inside, before] = await Promise.all([
    db.select(columns).from(weighIn).where(gte(weighIn.date, date)),
    db
      .select(columns)
      .from(weighIn)
      .where(lt(weighIn.date, date))
      .orderBy(desc(weighIn.date))
      .limit(1),
  ])
  return [...before, ...inside]
}

export type WeighInRow = Awaited<ReturnType<typeof listWeighIns>>[number]
