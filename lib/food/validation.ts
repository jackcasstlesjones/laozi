import { createInsertSchema } from "drizzle-orm/zod"
import { z } from "zod"

import { foodLog } from "@/db/schema"

export const customItemInput = createInsertSchema(foodLog, {
  name: () =>
    z
      .string()
      .trim()
      .min(1, "Enter a name")
      .max(100, "Keep the name under 100 characters"),
  kcal: () =>
    z.coerce
      .number({ error: "Enter kcal between 1 and 10,000" })
      .int("Enter a whole number of kcal")
      .min(1, "Enter kcal between 1 and 10,000")
      .max(10_000, "Enter kcal between 1 and 10,000"),
}).pick({ name: true, kcal: true })

export const adjustRecipeInput = z.object({
  slug: z.string().min(1),
  delta: z.union([z.literal(1), z.literal(-1)]),
})
