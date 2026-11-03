"use server"

import { and, eq, ne } from "drizzle-orm"
import { revalidatePath } from "next/cache"

import { db } from "@/db"
import { goalSettings, weighIn } from "@/db/schema"
import { requireSession } from "@/lib/session"
import { goalInput, weighInInput } from "@/lib/weight/validation"

export type ActionResult =
  | { ok: true }
  | { ok: false; error: string }
  | { ok: false; conflict: { date: string; weightKg: number } }

export async function saveWeighIn(input: unknown): Promise<ActionResult> {
  await requireSession()
  const parsed = weighInInput.safeParse(input)
  if (!parsed.success)
    return { ok: false, error: parsed.error.issues[0].message }
  const { id, date, weightKg, replace } = parsed.data

  const [clash] = await db
    .select({ id: weighIn.id, weightKg: weighIn.weightKg })
    .from(weighIn)
    .where(
      id
        ? and(eq(weighIn.date, date), ne(weighIn.id, id))
        : eq(weighIn.date, date)
    )
  if (clash && !replace)
    return { ok: false, conflict: { date, weightKg: clash.weightKg } }

  await db.transaction(async (tx) => {
    if (clash) await tx.delete(weighIn).where(eq(weighIn.id, clash.id))
    if (id)
      await tx.update(weighIn).set({ date, weightKg }).where(eq(weighIn.id, id))
    else await tx.insert(weighIn).values({ date, weightKg })
  })
  revalidatePath("/weight")
  return { ok: true }
}

export async function deleteWeighIn(id: number): Promise<ActionResult> {
  await requireSession()
  await db.delete(weighIn).where(eq(weighIn.id, id))
  revalidatePath("/weight")
  return { ok: true }
}

export async function saveGoal(input: unknown): Promise<ActionResult> {
  await requireSession()
  const parsed = goalInput.safeParse(input)
  if (!parsed.success)
    return { ok: false, error: parsed.error.issues[0].message }
  await db
    .insert(goalSettings)
    .values({ id: 1, ...parsed.data })
    .onConflictDoUpdate({ target: goalSettings.id, set: parsed.data })
  revalidatePath("/weight")
  return { ok: true }
}
