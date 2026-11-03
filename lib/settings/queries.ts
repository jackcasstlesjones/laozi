import "server-only"

import { db } from "@/db"
import { goalSettings } from "@/db/schema"

const DEFAULTS = { goalKg: null, rateKgPerWeek: 0.5, dailyKcalLimit: null }

export async function getSettings() {
  const [row] = await db
    .select({
      goalKg: goalSettings.goalKg,
      rateKgPerWeek: goalSettings.rateKgPerWeek,
      dailyKcalLimit: goalSettings.dailyKcalLimit,
    })
    .from(goalSettings)
  return row ?? DEFAULTS
}

export type Settings = Awaited<ReturnType<typeof getSettings>>
