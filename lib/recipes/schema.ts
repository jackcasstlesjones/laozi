import { z } from "zod"

/** Mirrors the schema documented in claude-recipes/CLAUDE.md. Unknown fields are ignored. */
export const recipeSchema = z.object({
  name: z.string().trim().min(1),
  kcal: z.number().nonnegative(),
  serving: z.string().trim().min(1),
  macros: z.object({
    protein_g: z.number().nonnegative(),
    carbs_g: z.number().nonnegative(),
    fat_g: z.number().nonnegative(),
  }),
  ingredients: z
    .array(
      z.object({
        item: z.string().trim().min(1),
        kcal: z.number().nonnegative(),
      })
    )
    .optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
})

export type Recipe = z.infer<typeof recipeSchema> & { slug: string }

export type RecipeFile = { name: string; text: string }

/** Parse every file; invalid JSON or schema mismatches are counted as skipped. */
export function parseRecipeFiles(files: RecipeFile[]): {
  recipes: Recipe[]
  skipped: number
} {
  const recipes: Recipe[] = []
  let skipped = 0
  for (const file of files) {
    let json: unknown
    try {
      json = JSON.parse(file.text)
    } catch {
      skipped++
      continue
    }
    const parsed = recipeSchema.safeParse(json)
    if (!parsed.success) {
      skipped++
      continue
    }
    recipes.push({ ...parsed.data, slug: file.name.replace(/\.json$/i, "") })
  }
  return { recipes, skipped }
}

export type RecipeSort = "name" | "kcal"

export function filterAndSort(
  recipes: Recipe[],
  query: string,
  sort: RecipeSort
): Recipe[] {
  const q = query.trim().toLowerCase()
  const matches = q
    ? recipes.filter((r) =>
        [
          r.name,
          ...(r.tags ?? []),
          ...(r.ingredients ?? []).map((i) => i.item),
        ].some((s) => s.toLowerCase().includes(q))
      )
    : recipes
  return [...matches].sort((a, b) =>
    sort === "kcal"
      ? a.kcal - b.kcal || a.name.localeCompare(b.name)
      : a.name.localeCompare(b.name)
  )
}
