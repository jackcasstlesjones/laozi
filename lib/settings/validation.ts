import { createInsertSchema } from "drizzle-orm/zod"
import { z } from "zod"

import { goalSettings } from "@/db/schema"
import { kg } from "@/lib/weight/validation"

const RATE_MESSAGE = "Enter a rate between 0.1 and 2 kg per week"
const LIMIT_MESSAGE = "Enter a limit between 500 and 10,000 kcal"

export const goalInput = createInsertSchema(goalSettings, {
  goalKg: () => kg.nullable(),
  rateKgPerWeek: () =>
    z.coerce
      .number({ error: RATE_MESSAGE })
      .min(0.1, RATE_MESSAGE)
      .max(2, RATE_MESSAGE),
}).pick({ goalKg: true, rateKgPerWeek: true })

export const calorieLimitInput = createInsertSchema(goalSettings, {
  dailyKcalLimit: () =>
    z.coerce
      .number({ error: LIMIT_MESSAGE })
      .int("Enter a whole number of kcal")
      .min(500, LIMIT_MESSAGE)
      .max(10_000, LIMIT_MESSAGE)
      .nullable(),
}).pick({ dailyKcalLimit: true })
