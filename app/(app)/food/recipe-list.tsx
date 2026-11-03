"use client"

import { Search } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Toggle } from "@/components/ui/toggle"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  filterAndSort,
  type Recipe,
  type RecipeSort,
} from "@/lib/recipes/schema"
import { Counter } from "./counter"
import { Macros } from "./macros"

export function RecipeList({
  recipes,
  skipped,
  counts,
  onAdjust,
}: {
  recipes: Recipe[]
  skipped: number
  counts: Record<string, number>
  onAdjust: (recipe: Recipe, delta: 1 | -1) => void
}) {
  const [query, setQuery] = useState("")
  const [sort, setSort] = useState<RecipeSort>("name")
  const [showMacros, setShowMacros] = useState(false)
  const shown = filterAndSort(recipes, query, sort)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search recipes"
            aria-label="Search recipes"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        <ToggleGroup
          value={[sort]}
          onValueChange={(v) => v[0] && setSort(v[0] as RecipeSort)}
          variant="outline"
          size="sm"
          spacing={0}
          aria-label="Sort by"
        >
          <ToggleGroupItem value="name" className="px-3">
            Name
          </ToggleGroupItem>
          <ToggleGroupItem value="kcal" className="px-3">
            kcal
          </ToggleGroupItem>
        </ToggleGroup>
        <Toggle
          variant="outline"
          size="sm"
          pressed={showMacros}
          onPressedChange={setShowMacros}
          className="px-3"
        >
          Macros
        </Toggle>
      </div>

      {skipped > 0 && (
        <p className="text-sm text-muted-foreground">
          {skipped} {skipped === 1 ? "file was" : "files were"} skipped because{" "}
          {skipped === 1 ? "it isn't" : "they aren't"} valid recipes.
        </p>
      )}

      {shown.length === 0 ? (
        <p className="py-12 text-center text-muted-foreground">
          {recipes.length === 0
            ? "No recipes yet"
            : "No recipes match your search"}
        </p>
      ) : (
        <Card className="gap-0 py-0">
          <ul className="divide-y">
            {shown.map((r) => (
              <li
                key={r.slug}
                className="flex items-center gap-4 py-3 pr-3 pl-4"
              >
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/food/${r.slug}`}
                    className="inline-block max-w-full truncate align-top font-medium underline decoration-muted-foreground/50 underline-offset-4 hover:decoration-foreground"
                  >
                    {r.name}
                  </Link>
                  {showMacros && (
                    <Macros
                      macros={r.macros}
                      className="block text-sm text-muted-foreground tabular-nums"
                    />
                  )}
                </div>
                <div className="text-right whitespace-nowrap">
                  <div className="font-semibold tabular-nums">
                    {r.kcal} kcal
                  </div>
                  <div className="text-xs text-muted-foreground">
                    per {r.serving}
                  </div>
                </div>
                <Counter
                  count={counts[r.slug] ?? 0}
                  name={r.name}
                  onAdjust={(delta) => onAdjust(r, delta)}
                />
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  )
}
