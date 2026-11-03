"use client"

import { ChevronLeft } from "lucide-react"
import Link from "next/link"

import { buttonVariants } from "@/components/ui/button"
import type { LogEntry } from "@/lib/food/log"
import { HistoryLink, TodaySummary } from "../today-items"
import { TodayPanel } from "../today-panel"
import { useFoodLog } from "../use-food-log"

export function TodayView({
  today,
  limit,
}: {
  today: LogEntry[]
  limit: number | null
}) {
  const log = useFoodLog(today)
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <div className="flex items-center justify-between">
        <Link
          href="/food"
          className={buttonVariants({ variant: "ghost", size: "sm" })}
        >
          <ChevronLeft data-icon="inline-start" />
          Food
        </Link>
        <HistoryLink />
      </div>
      <TodaySummary entries={log.entries} limit={limit} />
      <TodayPanel log={log} />
    </div>
  )
}
