import Link from "next/link"

import { Card, CardContent } from "@/components/ui/card"
import { TREND_RANGE, type Entry } from "@/lib/weight/chart"
import { WeightChart } from "../weight/weight-chart"

export function WeightTrend({
  entries,
  today,
}: {
  entries: Entry[]
  today: string
}) {
  return (
    <Link
      href="/weight"
      aria-label="Weight over the last 2 weeks. Open the Weight tab"
      className="mb-4 block rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Card size="sm" className="py-2">
        <CardContent>
          <WeightChart
            entries={entries}
            goal={null}
            range={TREND_RANGE}
            today={today}
            size="compact"
          />
        </CardContent>
      </Card>
    </Link>
  )
}
