"use server"

import { and, eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

import { db } from "@/db"
import { foodLog } from "@/db/schema"
import { decrementRecipe, incrementRecipe } from "@/lib/food/mutations"
import { getToday } from "@/lib/food/today"
import { adjustRecipeInput, customItemInput } from "@/lib/food/validation"
import { getRecipes } from "@/lib/recipes/source"
import { requireSession } from "@/lib/session"

export type FoodActionResult = { ok: true } | { ok: false; error: string }

function done(): FoodActionResult {
  revalidatePath("/food", "layout")
  return { ok: true }
}

/** +1 or −1 serving of a recipe for today. */
export async function adjustRecipe(input: unknown): Promise<FoodActionResult> {
  await requireSession()
  const parsed = adjustRecipeInput.safeParse(input)
  if (!parsed.success) return { ok: false, error: "Invalid request" }
  const { slug, delta } = parsed.data
  const date = await getToday()

  if (delta === -1) {
    await decrementRecipe(db, date, slug)
    return done()
  }

  const recipes = await getRecipes()
  const recipe = recipes.ok
    ? recipes.recipes.find((r) => r.slug === slug)
    : undefined
  if (!recipe)
    return { ok: false, error: "That recipe isn't available right now" }
  await incrementRecipe(db, date, recipe)
  return done()
}

export async function addCustomItem(input: unknown): Promise<FoodActionResult> {
  await requireSession()
  const parsed = customItemInput.safeParse(input)
  if (!parsed.success)
    return { ok: false, error: parsed.error.issues[0].message }
  await db.insert(foodLog).values({ date: await getToday(), ...parsed.data })
  return done()
}

/** Remove a whole entry from today (past days are read-only). */
export async function removeEntry(id: number): Promise<FoodActionResult> {
  await requireSession()
  await db
    .delete(foodLog)
    .where(and(eq(foodLog.id, id), eq(foodLog.date, await getToday())))
  return done()
}
