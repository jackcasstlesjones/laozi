import "server-only"

import { db } from "@/db"
import { goalSettings } from "@/db/schema"
import { orderTabs, TAB_IDS } from "@/lib/tabs"

const DEFAULTS = {
  goalKg: null,
  rateKgPerWeek: 0.5,
  dailyKcalLimit: null,
  tabOrder: [...TAB_IDS],
}

export async function getSettings() {
  const [row] = await db
    .select({
      goalKg: goalSettings.goalKg,
      rateKgPerWeek: goalSettings.rateKgPerWeek,
      dailyKcalLimit: goalSettings.dailyKcalLimit,
      tabOrder: goalSettings.tabOrder,
    })
    .from(goalSettings)
  return row ? { ...row, tabOrder: orderTabs(row.tabOrder) } : DEFAULTS
}

export type Settings = Awaited<ReturnType<typeof getSettings>>
