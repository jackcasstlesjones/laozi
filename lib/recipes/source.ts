import "server-only"
import { cache } from "react"
import { z } from "zod"

import { parseRecipeFiles, type Recipe } from "./schema"

const REPO = "jackcasstlesjones/claude-recipes"
const REVALIDATE = 300 // seconds

const listingSchema = z.array(
  z.object({
    name: z.string(),
    type: z.string(),
    download_url: z.string().nullable(),
  })
)

export type RecipesResult =
  | { ok: true; recipes: Recipe[]; skipped: number }
  | { ok: false; error: string }

/** One GitHub API call to list the repo root, then one raw download per .json file. Cached 5 min. */
export const getRecipes = cache(async (): Promise<RecipesResult> => {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${REPO}/contents?ref=main`,
      {
        headers: {
          Accept: "application/vnd.github+json",
          "User-Agent": "laozi",
        },
        next: { revalidate: REVALIDATE },
      }
    )
    if (!res.ok) return { ok: false, error: `GitHub responded ${res.status}` }
    const files = listingSchema
      .parse(await res.json())
      .filter(
        (f) =>
          f.type === "file" &&
          f.name.toLowerCase().endsWith(".json") &&
          f.download_url
      )

    const texts = await Promise.all(
      files.map(async (f) => {
        const r = await fetch(f.download_url!, {
          next: { revalidate: REVALIDATE },
        })
        return { name: f.name, text: r.ok ? await r.text() : "" }
      })
    )
    return { ok: true, ...parseRecipeFiles(texts) }
  } catch {
    return { ok: false, error: "Couldn't reach GitHub" }
  }
})
