"use client"

import { ChevronLeft, History } from "lucide-react"
import Link from "next/link"

import { buttonVariants } from "@/components/ui/button"
import type { LogEntry } from "@/lib/food/log"
import { TodayItems, TodayTotal } from "../today-items"
import { useFoodLog } from "../use-food-log"

export function TodayView({ today }: { today: LogEntry[] }) {
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
        <Link
          href="/food/history"
          className={buttonVariants({ variant: "ghost", size: "sm" })}
        >
          <History data-icon="inline-start" />
          History
        </Link>
      </div>
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Today
        </h1>
        <TodayTotal entries={log.entries} />
      </div>
      {log.entries.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Nothing logged yet today.
        </p>
      )}
      <TodayItems
        entries={log.entries}
        error={log.error}
        onRemove={log.remove}
        onAdd={log.add}
        onError={log.setError}
      />
    </div>
  )
}
