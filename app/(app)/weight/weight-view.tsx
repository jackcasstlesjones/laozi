"use client"

import { ArrowDown, ArrowUp, Pencil, Plus, Trash2 } from "lucide-react"
import { useMemo, useState, useSyncExternalStore } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { cn } from "@/lib/utils"
import {
  changeOver,
  DEFAULT_RANGE,
  RANGE_LABELS,
  RANGES,
  type Range,
} from "@/lib/weight/chart"
import { formatEntryDate, localToday, toDay } from "@/lib/weight/dates"
import { formatKg } from "@/lib/weight/kg"
import type { Settings } from "@/lib/settings/queries"
import type { WeighInRow } from "@/lib/weight/queries"
import { DeleteDialog, ExportDialog, WeighInDialog } from "./weight-dialogs"
import { WeightChart } from "./weight-chart"

/** The device's calendar date; the server's UTC date during SSR. */
function useToday() {
  return useSyncExternalStore(
    () => () => {},
    () => localToday(),
    () => new Date().toISOString().slice(0, 10)
  )
}

type Editing = { mode: "new" } | { mode: "edit"; entry: WeighInRow } | null

export function WeightView({
  entries,
  goal,
}: {
  entries: WeighInRow[]
  goal: Settings
}) {
  const today = useToday()
  const [range, setRange] = useState<Range>(DEFAULT_RANGE)
  const [editing, setEditing] = useState<Editing>(null)
  const [deleting, setDeleting] = useState<WeighInRow | null>(null)

  const chartGoal = useMemo(
    () =>
      goal.goalKg === null
        ? null
        : { goalKg: goal.goalKg, rateKgPerWeek: goal.rateKgPerWeek },
    [goal]
  )
  const change = useMemo(
    () => changeOver(range, entries, toDay(today)),
    [range, entries, today]
  )

  const recordButton = (className?: string) => (
    <Button
      className={cn("h-10 px-3 text-base", className)}
      onClick={() => setEditing({ mode: "new" })}
    >
      <Plus data-icon="inline-start" />
      Record weight
    </Button>
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:items-start">
        <div className="flex flex-col gap-4">
          {entries.length > 0 && (
            <ToggleGroup
              value={[range]}
              onValueChange={(v) => v[0] && setRange(v[0] as Range)}
              size="sm"
              variant="outline"
              spacing={0}
              aria-label="Chart range"
              className="w-full"
            >
              {RANGES.map((r) => (
                <ToggleGroupItem key={r} value={r} className="flex-1 px-2.5">
                  {r}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          )}
          <Card>
            <CardHeader className="flex flex-wrap items-center justify-between gap-2">
              <CardTitle>Weight</CardTitle>
              {change !== null && (
                <p className="flex items-center gap-1 text-sm">
                  {change < 0 ? (
                    <ArrowDown className="size-4" aria-label="Down" />
                  ) : change > 0 ? (
                    <ArrowUp className="size-4" aria-label="Up" />
                  ) : null}
                  <span className="font-medium tabular-nums">
                    {change === 0
                      ? "No change"
                      : `${formatKg(Math.abs(change))} kg`}
                  </span>
                  <span className="text-muted-foreground">
                    {RANGE_LABELS[range]}
                  </span>
                </p>
              )}
            </CardHeader>
            <CardContent>
              {entries.length === 0 ? (
                <div className="flex h-56 flex-col items-center justify-center gap-4">
                  <p className="text-muted-foreground">No weigh-ins yet</p>
                  {recordButton()}
                </div>
              ) : (
                <WeightChart
                  entries={entries}
                  goal={chartGoal}
                  range={range}
                  today={today}
                />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Stacked: between the chart and the entries. Side by side: above both. */}
        {entries.length > 0 &&
          recordButton(
            "w-full lg:order-first lg:col-span-2 lg:w-auto lg:justify-self-start"
          )}

        <Card>
          <CardHeader className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle>Entries</CardTitle>
            <ExportDialog entries={entries} goal={goal} />
          </CardHeader>
          <CardContent>
            {entries.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Your weigh-ins will appear here.
              </p>
            ) : (
              <ul className="-my-2 divide-y lg:max-h-[30rem] lg:overflow-y-auto">
                {entries.map((e) => (
                  <li key={e.id} className="flex items-center gap-2 py-2">
                    <span className="text-sm">{formatEntryDate(e.date)}</span>
                    <span className="ml-auto font-medium tabular-nums">
                      {formatKg(e.weightKg)} kg
                    </span>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Edit ${formatEntryDate(e.date)}`}
                      onClick={() => setEditing({ mode: "edit", entry: e })}
                    >
                      <Pencil />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Delete ${formatEntryDate(e.date)}`}
                      onClick={() => setDeleting(e)}
                    >
                      <Trash2 />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {editing && (
        <WeighInDialog
          open
          entry={editing.mode === "edit" ? editing.entry : null}
          today={today}
          onClose={() => setEditing(null)}
        />
      )}
      <DeleteDialog entry={deleting} onClose={() => setDeleting(null)} />
    </div>
  )
}
