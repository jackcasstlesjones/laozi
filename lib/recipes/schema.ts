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

export type Recipe = z.infer<typeof recipeSchema> & {
  slug: string
  /** The folder a recipe with variants lives in, e.g. "smashes/sesame-salmon"; null for root files. */
  group: string | null
  /** The variant's file name, e.g. "basic" or "full"; null for root files. */
  variant: string | null
}

/** `name` is the file's path in the repo, e.g. "gyozas.json" or "smashes/ham-egg/basic.json". */
export type RecipeFile = { name: string; text: string }

/** Recipe files: every .json in the repo, except under folders starting with "_" or ".". */
export function isRecipePath(path: string): boolean {
  return (
    path.toLowerCase().endsWith(".json") &&
    !path
      .split("/")
      .slice(0, -1)
      .some((dir) => dir.startsWith("_") || dir.startsWith("."))
  )
}

/** Root files are plain recipes. Every .json file in a folder is one variant of that folder's recipe. */
function locate(path: string): Pick<Recipe, "slug" | "group" | "variant"> {
  const parts = path.replace(/\.json$/i, "").split("/")
  const variant = parts.pop()!
  if (parts.length === 0) return { slug: variant, group: null, variant: null }
  return {
    slug: [...parts, variant].join("-"),
    group: parts.join("/"),
    variant,
  }
}

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
    recipes.push({ ...parsed.data, ...locate(file.name) })
  }
  return { recipes, skipped }
}

/** The other variants of the same recipe, including itself, sorted by variant name. */
export function variantsOf(recipes: Recipe[], recipe: Recipe): Recipe[] {
  if (!recipe.group) return [recipe]
  return recipes
    .filter((r) => r.group === recipe.group)
    .sort((a, b) => a.variant!.localeCompare(b.variant!))
}

/** Every variant name in use, sorted, e.g. ["basic", "full"]. */
export function variantNames(recipes: Recipe[]): string[] {
  return [
    ...new Set(recipes.flatMap((r) => (r.variant ? [r.variant] : []))),
  ].sort()
}

/** One recipe per group: the preferred variant, or the first one the group has. */
export function pickVariant(recipes: Recipe[], preferred: string): Recipe[] {
  const rank = (r: Recipe) => `${r.variant === preferred ? 0 : 1}${r.variant}`
  const picked = new Map<string, Recipe>()
  const out: Recipe[] = []
  for (const r of recipes) {
    if (!r.group) {
      out.push(r)
      continue
    }
    const current = picked.get(r.group)
    if (!current || rank(r) < rank(current)) picked.set(r.group, r)
  }
  return [...out, ...picked.values()]
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
