"use client"

import { Plus } from "lucide-react"
import { useRef } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { EntryList } from "./today-items"
import type { useFoodLog } from "./use-food-log"

/** Today's removable items, the custom-item form and any error. */
export function TodayPanel({ log }: { log: ReturnType<typeof useFoodLog> }) {
  const formRef = useRef<HTMLFormElement>(null)

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const name = String(form.get("name") ?? "").trim()
    const kcal = Number(form.get("kcal"))
    if (!name) return log.setError("Enter a name")
    if (!Number.isInteger(kcal) || kcal < 1 || kcal > 10_000)
      return log.setError("Enter kcal between 1 and 10,000")
    log.add(name, kcal)
    formRef.current?.reset()
  }

  return (
    <div className="flex flex-col gap-4">
      {log.entries.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Nothing logged yet today.
        </p>
      ) : (
        <EntryList entries={log.entries} onRemove={log.remove} />
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
      {log.error && (
        <p role="alert" className="text-sm text-destructive">
          {log.error}
        </p>
      )}
    </div>
  )
}
