"use client"

import { History, Plus, X } from "lucide-react"
import Link from "next/link"
import { useOptimistic, useRef, useState, useTransition } from "react"

import { Button, buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  dayTotal,
  entryTotal,
  recipeCounts,
  type LogEntry,
} from "@/lib/food/log"
import type { Recipe } from "@/lib/recipes/schema"
import { addCustomItem, adjustRecipe, removeEntry } from "./actions"
import { RecipeList } from "./recipe-list"

type Change =
  | { type: "adjust"; recipe: Recipe; delta: 1 | -1 }
  | { type: "add"; name: string; kcal: number }
  | { type: "remove"; id: number }

function applyChange(entries: LogEntry[], change: Change): LogEntry[] {
  switch (change.type) {
    case "adjust": {
      const { recipe, delta } = change
      const row = entries.find((e) => e.recipeSlug === recipe.slug)
      if (!row) {
        if (delta === -1) return entries
        const kcal = Math.round(recipe.kcal)
        return [
          ...entries,
          {
            id: -Date.now(),
            date: "",
            recipeSlug: recipe.slug,
            name: recipe.name,
            kcal,
            quantity: 1,
          },
        ]
      }
      const quantity = row.quantity + delta
      return quantity <= 0
        ? entries.filter((e) => e !== row)
        : entries.map((e) => (e === row ? { ...e, quantity } : e))
    }
    case "add":
      return [
        ...entries,
        {
          id: -Date.now(),
          date: "",
          recipeSlug: null,
          name: change.name,
          kcal: change.kcal,
          quantity: 1,
        },
      ]
    case "remove":
      return entries.filter((e) => e.id !== change.id)
  }
}

export function FoodView({
  recipes,
  skipped,
  today,
}: {
  recipes: Recipe[]
  skipped: number
  today: LogEntry[]
}) {
  const [entries, apply] = useOptimistic(today, applyChange)
  const [, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function run(
    change: Change,
    action: () => Promise<{ ok: boolean; error?: string }>
  ) {
    setError(null)
    startTransition(async () => {
      apply(change)
      const res = await action()
      if (!res.ok) setError(res.error ?? "Something went wrong")
    })
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <TodayCard
        entries={entries}
        error={error}
        onRemove={(id) => run({ type: "remove", id }, () => removeEntry(id))}
        onAdd={(name, kcal) =>
          run({ type: "add", name, kcal }, () => addCustomItem({ name, kcal }))
        }
        onError={setError}
      />
      <RecipeList
        recipes={recipes}
        skipped={skipped}
        counts={recipeCounts(entries)}
        onAdjust={(recipe, delta) =>
          run({ type: "adjust", recipe, delta }, () =>
            adjustRecipe({ slug: recipe.slug, delta })
          )
        }
      />
    </div>
  )
}

function TodayCard({
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
    <Card>
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
        <p className="text-3xl font-semibold tabular-nums">
          {dayTotal(entries).toLocaleString("en-GB")}{" "}
          <span className="text-base font-normal text-muted-foreground">
            kcal
          </span>
        </p>

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
                  {entryTotal(e).toLocaleString("en-GB")} kcal
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
      </CardContent>
    </Card>
  )
}
