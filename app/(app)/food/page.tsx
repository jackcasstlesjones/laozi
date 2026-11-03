import type { Metadata } from "next"

import { listDay } from "@/lib/food/queries"
import { getToday } from "@/lib/food/today"
import { getRecipes } from "@/lib/recipes/source"
import { getSettings } from "@/lib/settings/queries"
import { requireSession } from "@/lib/session"
import { listWeighInsForTrend } from "@/lib/weight/queries"
import { fromDay, toDay } from "@/lib/weight/dates"
import { FoodView } from "./food-view"
import { WeightTrend } from "./weight-trend"

export const metadata: Metadata = { title: "Food · Laozi" }

export default async function FoodPage() {
  await requireSession()
  const date = await getToday()
  const [result, today, settings, weighIns] = await Promise.all([
    getRecipes(),
    listDay(date),
    getSettings(),
    listWeighInsForTrend(fromDay(toDay(date) - 14)),
  ])
  if (!result.ok) {
    return (
      <p className="py-12 text-center text-muted-foreground">
        Couldn&apos;t load recipes ({result.error}). Try again in a minute.
      </p>
    )
  }
  return (
    <div className="mx-auto max-w-5xl">
      <WeightTrend entries={weighIns} today={date} />
      <FoodView
        recipes={result.recipes}
        skipped={result.skipped}
        today={today}
        limit={settings.dailyKcalLimit}
      />
    </div>
  )
}
