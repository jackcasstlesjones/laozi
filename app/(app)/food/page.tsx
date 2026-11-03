import type { Metadata } from "next"

import { listDay } from "@/lib/food/queries"
import { getToday } from "@/lib/food/today"
import { getRecipes } from "@/lib/recipes/source"
import { getSettings } from "@/lib/settings/queries"
import { requireSession } from "@/lib/session"
import { FoodView } from "./food-view"

export const metadata: Metadata = { title: "Food · Laozi" }

export default async function FoodPage() {
  await requireSession()
  const [result, today, settings] = await Promise.all([
    getRecipes(),
    getToday().then(listDay),
    getSettings(),
  ])
  if (!result.ok) {
    return (
      <p className="py-12 text-center text-muted-foreground">
        Couldn&apos;t load recipes ({result.error}). Try again in a minute.
      </p>
    )
  }
  return (
    <FoodView
      recipes={result.recipes}
      skipped={result.skipped}
      today={today}
      limit={settings.dailyKcalLimit}
    />
  )
}
