"use client"

import { Plus, X } from "lucide-react"
import { useRef } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { dayTotal, entryTotal, type LogEntry } from "@/lib/food/log"

export function formatKcal(n: number) {
  return n.toLocaleString("en-GB")
}

export function TodayTotal({ entries }: { entries: LogEntry[] }) {
  return (
    <p className="text-3xl font-semibold tabular-nums">
      {formatKcal(dayTotal(entries))}{" "}
      <span className="text-base font-normal text-muted-foreground">kcal</span>
    </p>
  )
}

/** Today's items, each removable, plus the custom-item form. */
export function TodayItems({
  entries,
  error,
  onRemove,
  onAdd,
  onError,
}: {
  entries: LogEntry[]
  error: string | null
  onRemove: (id: number) => void
  onAdd: (name: string, kcal: number) => void
  onError: (message: string) => void
}) {
  const formRef = useRef<HTMLFormElement>(null)

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const name = String(form.get("name") ?? "").trim()
    const kcal = Number(form.get("kcal"))
    if (!name) return onError("Enter a name")
    if (!Number.isInteger(kcal) || kcal < 1 || kcal > 10_000)
      return onError("Enter kcal between 1 and 10,000")
    onAdd(name, kcal)
    formRef.current?.reset()
  }

  return (
    <div className="flex flex-col gap-4">
      {entries.length > 0 && (
        <ul className="-my-1 divide-y text-sm">
          {entries.map((e) => (
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
                {formatKcal(entryTotal(e))} kcal
              </span>
              <Button
                variant="ghost"
                size="icon-xs"
                aria-label={`Remove ${e.name}`}
                disabled={e.id < 0}
                onClick={() => onRemove(e.id)}
              >
                <X />
              </Button>
            </li>
          ))}
        </ul>
      )}

      <form ref={formRef} onSubmit={submit} className="flex gap-2">
        <Input
          name="name"
          placeholder="Custom item, e.g. Sausage and mash"
          aria-label="Custom item name"
          className="min-w-0 flex-1"
        />
        <Input
          name="kcal"
          type="number"
          inputMode="numeric"
          min={1}
          max={10000}
          step={1}
          placeholder="kcal"
          aria-label="Custom item kcal"
          className="w-20"
        />
        <Button type="submit" variant="outline" aria-label="Add custom item">
          <Plus />
        </Button>
      </form>

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}
