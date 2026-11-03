"use client"

import { useOptimistic, useState, useTransition } from "react"

import type { LogEntry } from "@/lib/food/log"
import type { Recipe } from "@/lib/recipes/schema"
import {
  addCustomItem,
  adjustRecipe,
  removeEntry,
  type FoodActionResult,
} from "./actions"

type Change =
  | { type: "adjust"; recipe: Recipe; delta: 1 | -1 }
  | { type: "add"; name: string; kcal: number }
  | { type: "remove"; id: number }

const pending = (p: Omit<LogEntry, "id" | "date">): LogEntry => ({
  id: -Date.now(),
  date: "",
  ...p,
})

function applyChange(entries: LogEntry[], change: Change): LogEntry[] {
  switch (change.type) {
    case "adjust": {
      const { recipe, delta } = change
      const row = entries.find((e) => e.recipeSlug === recipe.slug)
      if (!row) {
        if (delta === -1) return entries
        return [
          ...entries,
          pending({
            recipeSlug: recipe.slug,
            name: recipe.name,
            kcal: Math.round(recipe.kcal),
            quantity: 1,
          }),
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
        pending({
          recipeSlug: null,
          name: change.name,
          kcal: change.kcal,
          quantity: 1,
        }),
      ]
    case "remove":
      return entries.filter((e) => e.id !== change.id)
  }
}

/** Today's log with optimistic updates, shared by the Food list and the Today screen. */
export function useFoodLog(today: LogEntry[]) {
  const [entries, apply] = useOptimistic(today, applyChange)
  const [, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function run(change: Change, action: () => Promise<FoodActionResult>) {
    setError(null)
    startTransition(async () => {
      apply(change)
      const res = await action()
      if (!res.ok) setError(res.error)
    })
  }

  return {
    entries,
    error,
    setError,
    adjust: (recipe: Recipe, delta: 1 | -1) =>
      run({ type: "adjust", recipe, delta }, () =>
        adjustRecipe({ slug: recipe.slug, delta })
      ),
    add: (name: string, kcal: number) =>
      run({ type: "add", name, kcal }, () => addCustomItem({ name, kcal })),
    remove: (id: number) => run({ type: "remove", id }, () => removeEntry(id)),
  }
}
