import type { Metadata } from "next"

import { getRecipes } from "@/lib/recipes/source"
import { requireSession } from "@/lib/session"
import { RecipeList } from "./recipe-list"

export const metadata: Metadata = { title: "Food · Laozi" }

export default async function FoodPage() {
  await requireSession()
  const result = await getRecipes()
  if (!result.ok) {
    return (
      <p className="py-12 text-center text-muted-foreground">
        Couldn&apos;t load recipes ({result.error}). Try again in a minute.
      </p>
    )
  }
  return <RecipeList recipes={result.recipes} skipped={result.skipped} />
}
