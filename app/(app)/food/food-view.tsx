"use client"

import { Card, CardContent } from "@/components/ui/card"
import { recipeCounts, type LogEntry } from "@/lib/food/log"
import type { Recipe } from "@/lib/recipes/schema"
import { RecipeList } from "./recipe-list"
import { HistoryLink, TodaySummary } from "./today-items"
import { TodayPanel } from "./today-panel"
import { useFoodLog } from "./use-food-log"

export function FoodView({
  recipes,
  skipped,
  today,
  limit,
}: {
  recipes: Recipe[]
  skipped: number
  today: LogEntry[]
  limit: number | null
}) {
  const log = useFoodLog(today)

  return (
    <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 pb-24 md:grid-cols-[minmax(0,1fr)_20rem] md:items-start md:pb-0">
      <div className="flex min-w-0 flex-col gap-4">
        {log.error && (
          <p role="alert" className="text-sm text-destructive md:hidden">
            {log.error}
          </p>
        )}
        <RecipeList
          recipes={recipes}
          skipped={skipped}
          counts={recipeCounts(log.entries)}
          onAdjust={log.adjust}
        />
      </div>

      {/* Desktop: Today sits to the right and stays in view */}
      <aside className="sticky top-20 hidden min-w-0 flex-col gap-3 md:flex">
        <TodaySummary entries={log.entries} limit={limit} />
        <Card>
          <CardContent>
            <TodayPanel log={log} />
          </CardContent>
        </Card>
        <div className="self-end">
          <HistoryLink />
        </div>
      </aside>

      {/* Mobile: floating total that opens the Today screen */}
      <div className="fixed inset-x-0 bottom-0 z-20 px-4 pt-2 pb-[max(1rem,env(safe-area-inset-bottom))] md:hidden">
        <TodaySummary
          entries={log.entries}
          limit={limit}
          href="/food/today"
          className="mx-auto max-w-2xl shadow-lg transition-transform active:scale-[0.98]"
        />
      </div>
    </div>
  )
}
