"use server"

import { revalidatePath } from "next/cache"
import type { z } from "zod"

import { db } from "@/db"
import { goalSettings } from "@/db/schema"
import { requireSession } from "@/lib/session"
import { calorieLimitInput, goalInput } from "@/lib/settings/validation"

export type SettingsResult = { ok: true } | { ok: false; error: string }

async function saveSettings<
  T extends z.ZodType<Partial<typeof goalSettings.$inferInsert>>,
>(schema: T, input: unknown): Promise<SettingsResult> {
  await requireSession()
  const parsed = schema.safeParse(input)
  if (!parsed.success)
    return { ok: false, error: parsed.error.issues[0].message }
  await db
    .insert(goalSettings)
    .values({ id: 1, ...parsed.data })
    .onConflictDoUpdate({ target: goalSettings.id, set: parsed.data })
  revalidatePath("/", "layout")
  return { ok: true }
}

export async function saveGoal(input: unknown) {
  return saveSettings(goalInput, input)
}

export async function saveCalorieLimit(input: unknown) {
  return saveSettings(calorieLimitInput, input)
}
