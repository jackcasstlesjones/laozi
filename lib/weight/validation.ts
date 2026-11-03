import { createInsertSchema } from "drizzle-orm/zod"
import { z } from "zod"

import { goalSettings, weighIn } from "@/db/schema"
import { MAX_KG, MIN_KG, roundKg } from "./kg"

export const WEIGHT_RANGE_MESSAGE = `Enter a weight between ${MIN_KG} and ${MAX_KG} kg`

const kg = z.coerce
  .number({ error: WEIGHT_RANGE_MESSAGE })
  .transform(roundKg)
  .pipe(
    z
      .number()
      .min(MIN_KG, WEIGHT_RANGE_MESSAGE)
      .max(MAX_KG, WEIGHT_RANGE_MESSAGE)
  )

const isoDate = z.iso.date({ error: "Enter a valid date" })

export const weighInInput = createInsertSchema(weighIn, {
  date: () => isoDate,
  weightKg: () => kg,
})
  .pick({ date: true, weightKg: true })
  .extend({
    /** The entry being edited, if any. */
    id: z.coerce.number().int().positive().optional(),
    /** Set after the user confirmed replacing the entry already on this date. */
    replace: z.boolean().default(false),
    /** The user's local "today", to reject future dates. */
    today: isoDate,
  })
  .refine((v) => v.date <= v.today, {
    message: "Future dates aren't allowed",
    path: ["date"],
  })

export const goalInput = createInsertSchema(goalSettings, {
  goalKg: () => kg.nullable(),
  rateKgPerWeek: () =>
    z.coerce
      .number({ error: "Enter a rate between 0.1 and 2 kg per week" })
      .min(0.1, "Enter a rate between 0.1 and 2 kg per week")
      .max(2, "Enter a rate between 0.1 and 2 kg per week"),
}).pick({ goalKg: true, rateKgPerWeek: true })
