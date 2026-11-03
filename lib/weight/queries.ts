import "server-only"
import { desc } from "drizzle-orm"

import { db } from "@/db"
import { goalSettings, weighIn } from "@/db/schema"

export async function listWeighIns() {
  return db
    .select({ id: weighIn.id, date: weighIn.date, weightKg: weighIn.weightKg })
    .from(weighIn)
    .orderBy(desc(weighIn.date))
}

export async function getGoal() {
  const [row] = await db
    .select({
      goalKg: goalSettings.goalKg,
      rateKgPerWeek: goalSettings.rateKgPerWeek,
    })
    .from(goalSettings)
  return row ?? { goalKg: null, rateKgPerWeek: 0.5 }
}

export type WeighInRow = Awaited<ReturnType<typeof listWeighIns>>[number]
export type GoalRow = Awaited<ReturnType<typeof getGoal>>
