import { and, eq, sql } from "drizzle-orm"
import type { NodePgDatabase } from "drizzle-orm/node-postgres"

import { foodLog } from "@/db/schema"

// Accepts any node-postgres drizzle instance (app client or test client).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Db = NodePgDatabase<any>

/** One more serving of a recipe on `date`; refreshes the name/kcal snapshot. */
export async function incrementRecipe(
  db: Db,
  date: string,
  recipe: { slug: string; name: string; kcal: number }
) {
  const kcal = Math.round(recipe.kcal)
  await db
    .insert(foodLog)
    .values({
      date,
      recipeSlug: recipe.slug,
      name: recipe.name,
      kcal,
      quantity: 1,
    })
    .onConflictDoUpdate({
      target: [foodLog.date, foodLog.recipeSlug],
      targetWhere: sql`${foodLog.recipeSlug} is not null`,
      set: { quantity: sql`${foodLog.quantity} + 1`, name: recipe.name, kcal },
    })
}

/** One fewer serving; deletes the row when it reaches zero. No-op if absent. */
export async function decrementRecipe(db: Db, date: string, slug: string) {
  await db.transaction(async (tx) => {
    const [row] = await tx
      .select({ id: foodLog.id, quantity: foodLog.quantity })
      .from(foodLog)
      .where(and(eq(foodLog.date, date), eq(foodLog.recipeSlug, slug)))
      .for("update")
    if (!row) return
    if (row.quantity <= 1)
      await tx.delete(foodLog).where(eq(foodLog.id, row.id))
    else
      await tx
        .update(foodLog)
        .set({ quantity: row.quantity - 1 })
        .where(eq(foodLog.id, row.id))
  })
}
