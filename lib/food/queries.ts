import "server-only"
import { asc, desc, eq } from "drizzle-orm"

import { db } from "@/db"
import { foodLog } from "@/db/schema"

const columns = {
  id: foodLog.id,
  date: foodLog.date,
  recipeSlug: foodLog.recipeSlug,
  name: foodLog.name,
  kcal: foodLog.kcal,
  quantity: foodLog.quantity,
}

export function listDay(date: string) {
  return db
    .select(columns)
    .from(foodLog)
    .where(eq(foodLog.date, date))
    .orderBy(asc(foodLog.id))
}

export function listAll() {
  return db
    .select(columns)
    .from(foodLog)
    .orderBy(desc(foodLog.date), asc(foodLog.id))
}
