import { ChevronLeft } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"

import { buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { entryTotal, summariseDays } from "@/lib/food/log"
import { listAll } from "@/lib/food/queries"
import { getToday } from "@/lib/food/today"
import { requireSession } from "@/lib/session"
import { formatEntryDate } from "@/lib/weight/dates"

export const metadata: Metadata = { title: "Calorie history · Laozi" }

export default async function HistoryPage() {
  await requireSession()
  const [days, today] = await Promise.all([
    listAll().then(summariseDays),
    getToday(),
  ])

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <Link
        href="/food"
        className={buttonVariants({
          variant: "ghost",
          size: "sm",
          className: "self-start",
        })}
      >
        <ChevronLeft data-icon="inline-start" />
        Food
      </Link>
      <h1 className="font-heading text-2xl font-semibold tracking-tight">
        Calorie history
      </h1>

      {days.length === 0 ? (
        <p className="py-12 text-center text-muted-foreground">
          Nothing logged yet
        </p>
      ) : (
        days.map((day) => (
          <Card key={day.date}>
            <CardHeader>
              <CardTitle>
                {day.date === today ? "Today" : formatEntryDate(day.date)}
              </CardTitle>
              <CardAction className="font-semibold tabular-nums">
                {day.total.toLocaleString("en-GB")} kcal
              </CardAction>
            </CardHeader>
            <CardContent>
              <ul className="-my-1 divide-y text-sm">
                {day.entries.map((e) => (
                  <li key={e.id} className="flex items-center gap-2 py-1.5">
                    <span className="min-w-0 flex-1 truncate">
                      {e.quantity > 1 && (
                        <span className="text-muted-foreground tabular-nums">
                          {e.quantity} ×{" "}
                        </span>
                      )}
                      {e.name}
                    </span>
                    <span className="text-muted-foreground tabular-nums">
                      {entryTotal(e).toLocaleString("en-GB")} kcal
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}
