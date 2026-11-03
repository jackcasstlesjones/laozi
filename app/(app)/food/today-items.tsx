import { ChevronRight, History, X } from "lucide-react"
import Link from "next/link"

import { Button, buttonVariants } from "@/components/ui/button"
import {
  dayTotal,
  entryTotal,
  limitProgress,
  type LogEntry,
} from "@/lib/food/log"
import { cn } from "@/lib/utils"

export function formatKcal(n: number) {
  return n.toLocaleString("en-GB")
}

const SUMMARY_CLASS =
  "flex flex-col justify-center gap-2 rounded-2xl bg-chart-2 px-4 py-3 text-primary-foreground"

/**
 * The amber (--chart-2) "Today · total / limit" bar with a progress bar when a
 * daily limit is set. A link when `href` is given (mobile floating bar),
 * otherwise a static header (desktop, Today screen). No animations.
 */
export function TodaySummary({
  entries,
  limit,
  href,
  className,
}: {
  entries: LogEntry[]
  limit: number | null
  href?: string
  className?: string
}) {
  const total = dayTotal(entries)
  const items = entries.reduce((n, e) => n + e.quantity, 0)
  const progress = limitProgress(total, limit)
  const content = (
    <>
      <div className="flex items-center gap-3">
        <span className="font-medium">Today</span>
        <span className="text-sm opacity-80">
          {progress?.over
            ? `${formatKcal(progress.over)} kcal over`
            : `${items} ${items === 1 ? "item" : "items"}`}
        </span>
        <span className="ml-auto text-lg font-semibold tabular-nums">
          {formatKcal(total)}
          {limit && (
            <span className="font-normal opacity-70">
              {" "}
              / {formatKcal(limit)}
            </span>
          )}{" "}
          kcal
        </span>
        {href && <ChevronRight className="size-5" />}
      </div>
      {progress && limit && (
        <div
          role="progressbar"
          aria-label="Today's calories against your daily limit"
          aria-valuemin={0}
          aria-valuemax={limit}
          aria-valuenow={total}
          className="h-2 overflow-hidden rounded-full bg-primary-foreground/15"
        >
          <div
            className={cn(
              "h-full rounded-full",
              progress.over ? "bg-destructive" : "bg-primary-foreground"
            )}
            style={{ width: `${progress.percent}%` }}
          />
        </div>
      )}
    </>
  )
  return href ? (
    <Link href={href} className={cn(SUMMARY_CLASS, className)}>
      {content}
    </Link>
  ) : (
    <div className={cn(SUMMARY_CLASS, className)}>{content}</div>
  )
}

export function HistoryLink() {
  return (
    <Link
      href="/food/history"
      className={buttonVariants({ variant: "ghost", size: "sm" })}
    >
      <History data-icon="inline-start" />
      History
    </Link>
  )
}

/** "2 × Assorted Gyozas · 80 kcal", with an optional remove button. */
export function EntryRow({
  entry,
  onRemove,
}: {
  entry: LogEntry
  onRemove?: (id: number) => void
}) {
  return (
    <li className="flex items-center gap-2 py-1.5">
      <span className="min-w-0 flex-1 truncate">
        {entry.quantity > 1 && (
          <span className="text-muted-foreground tabular-nums">
            {entry.quantity} ×{" "}
          </span>
        )}
        {entry.name}
      </span>
      <span className="text-muted-foreground tabular-nums">
        {formatKcal(entryTotal(entry))} kcal
      </span>
      {onRemove && (
        <Button
          variant="ghost"
          size="icon-xs"
          aria-label={`Remove ${entry.name}`}
          disabled={entry.id < 0}
          onClick={() => onRemove(entry.id)}
        >
          <X />
        </Button>
      )}
    </li>
  )
}

export function EntryList({
  entries,
  onRemove,
}: {
  entries: LogEntry[]
  onRemove?: (id: number) => void
}) {
  return (
    <ul className="-my-1 divide-y text-sm">
      {entries.map((e) => (
        <EntryRow key={e.id} entry={e} onRemove={onRemove} />
      ))}
    </ul>
  )
}
