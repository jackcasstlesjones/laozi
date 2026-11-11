import { ArrowDown, ArrowUp } from "lucide-react"
import Link from "next/link"

import { Card, CardContent } from "@/components/ui/card"
import {
  changeOver,
  RANGE_LABELS,
  TREND_RANGE,
  type Entry,
} from "@/lib/weight/chart"
import { toDay } from "@/lib/weight/dates"
import { formatKg } from "@/lib/weight/kg"
import { WeightChart } from "../weight/weight-chart"

export function WeightTrend({
  entries,
  today,
}: {
  entries: Entry[]
  today: string
}) {
  const change = changeOver(TREND_RANGE, entries, toDay(today))
  return (
    <Link
      href="/weight"
      aria-label="Weight over the last 2 weeks. Open the Weight tab"
      className="mb-4 block rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Card size="sm" className="py-2">
        <CardContent className="flex items-center gap-3">
          {change !== null && (
            <div className="shrink-0 border-r pr-3">
              <p className="flex items-center gap-0.5 text-sm font-medium tabular-nums">
                {change < 0 ? (
                  <ArrowDown className="size-4" aria-label="Down" />
                ) : change > 0 ? (
                  <ArrowUp className="size-4" aria-label="Up" />
                ) : null}
                {change === 0
                  ? "No change"
                  : `${formatKg(Math.abs(change))} kg`}
              </p>
              <p className="text-xs text-muted-foreground">
                {RANGE_LABELS[TREND_RANGE].replace("past ", "")}
              </p>
            </div>
          )}
          <div className="min-w-0 flex-1">
            <WeightChart
              entries={entries}
              goal={null}
              range={TREND_RANGE}
              today={today}
              size="compact"
            />
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
