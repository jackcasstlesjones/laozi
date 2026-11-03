import "server-only"
import { desc } from "drizzle-orm"

import { db } from "@/db"
import { weighIn } from "@/db/schema"

export async function listWeighIns() {
  return db
    .select({ id: weighIn.id, date: weighIn.date, weightKg: weighIn.weightKg })
    .from(weighIn)
    .orderBy(desc(weighIn.date))
}

export type WeighInRow = Awaited<ReturnType<typeof listWeighIns>>[number]
