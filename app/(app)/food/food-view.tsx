"use client"

import { ChevronRight, History } from "lucide-react"
import Link from "next/link"

import { buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { dayTotal, recipeCounts, type LogEntry } from "@/lib/food/log"
import type { Recipe } from "@/lib/recipes/schema"
import { RecipeList } from "./recipe-list"
import { formatKcal, TodayItems, TodayTotal } from "./today-items"
import { useFoodLog } from "./use-food-log"

export function FoodView({
  recipes,
  skipped,
  today,
}: {
  recipes: Recipe[]
  skipped: number
  today: LogEntry[]
}) {
  const log = useFoodLog(today)
  const itemCount = log.entries.reduce((n, e) => n + e.quantity, 0)

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4 pb-24 md:pb-0">
      {/* Desktop/tablet: inline Today card */}
      <Card className="hidden md:flex">
        <CardHeader>
          <CardTitle>Today</CardTitle>
          <CardAction>
            <Link
              href="/food/history"
              className={buttonVariants({ variant: "ghost", size: "sm" })}
            >
              <History data-icon="inline-start" />
              History
            </Link>
          </CardAction>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <TodayTotal entries={log.entries} />
          <TodayItems
            entries={log.entries}
            error={log.error}
            onRemove={log.remove}
            onAdd={log.add}
            onError={log.setError}
          />
        </CardContent>
      </Card>

      {/* Mobile: errors from the counters still need to show somewhere */}
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

      {/* Mobile: floating total, opens the Today screen */}
      <div className="fixed inset-x-0 bottom-0 z-20 px-4 pt-2 pb-[max(1rem,env(safe-area-inset-bottom))] md:hidden">
        <Link
          href="/food/today"
          className="mx-auto flex h-14 max-w-2xl items-center gap-3 rounded-2xl bg-yellow-300 px-4 text-primary-foreground shadow-lg transition-transform active:scale-[0.98]"
        >
          <span className="font-medium">Today</span>
          <span className="text-sm opacity-80">
            {itemCount} {itemCount === 1 ? "item" : "items"}
          </span>
          <span className="ml-auto text-lg font-semibold tabular-nums">
            {formatKcal(dayTotal(log.entries))} kcal
          </span>
          <ChevronRight className="size-5" />
        </Link>
      </div>
    </div>
  )
}
