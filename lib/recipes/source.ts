import "server-only"
import { cache } from "react"
import { z } from "zod"

import { isRecipePath, parseRecipeFiles, type Recipe } from "./schema"

const REPO = "jackcasstlesjones/claude-recipes"
const REVALIDATE = 300 // seconds

const treeSchema = z.object({
  tree: z.array(z.object({ path: z.string(), type: z.string() })),
})

export type RecipesResult =
  | { ok: true; recipes: Recipe[]; skipped: number }
  | { ok: false; error: string }

/** One GitHub API call to list the repo tree, then one raw download per recipe file. Cached 5 min. */
export const getRecipes = cache(async (): Promise<RecipesResult> => {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${REPO}/git/trees/main?recursive=1`,
      {
        headers: {
          Accept: "application/vnd.github+json",
          "User-Agent": "laozi",
        },
        next: { revalidate: REVALIDATE },
      }
    )
    if (!res.ok) return { ok: false, error: `GitHub responded ${res.status}` }
    const paths = treeSchema
      .parse(await res.json())
      .tree.filter((f) => f.type === "blob" && isRecipePath(f.path))
      .map((f) => f.path)

    const texts = await Promise.all(
      paths.map(async (path) => {
        const r = await fetch(
          `https://raw.githubusercontent.com/${REPO}/main/${encodeURI(path)}`,
          { next: { revalidate: REVALIDATE } }
        )
        return { name: path, text: r.ok ? await r.text() : "" }
      })
    )
    return { ok: true, ...parseRecipeFiles(texts) }
  } catch {
    return { ok: false, error: "Couldn't reach GitHub" }
  }
})
