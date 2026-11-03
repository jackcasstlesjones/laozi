import { asc } from "drizzle-orm"
import { afterAll, beforeAll, describe, expect, it } from "vitest"

import { foodLog } from "@/db/schema"
import { testDb } from "@/tests/db"
import { decrementRecipe, incrementRecipe } from "./mutations"

let ctx: Awaited<ReturnType<typeof testDb>>
beforeAll(async () => {
  ctx = await testDb()
})
afterAll(() => ctx.pool.end())

const gyoza = { slug: "gyozas", name: "Assorted Gyozas", kcal: 40 }
const rows = () =>
  ctx.db
    .select({
      date: foodLog.date,
      quantity: foodLog.quantity,
      kcal: foodLog.kcal,
    })
    .from(foodLog)
    .orderBy(asc(foodLog.date))

describe("recipe counters", () => {
  it("creates a row, then increments it", async () => {
    await incrementRecipe(ctx.db, "2026-11-03", gyoza)
    await incrementRecipe(ctx.db, "2026-11-03", gyoza)
    expect(await rows()).toEqual([
      { date: "2026-11-03", quantity: 2, kcal: 40 },
    ])
  })
  it("keeps days separate (midnight starts a new count)", async () => {
    await incrementRecipe(ctx.db, "2026-11-04", gyoza)
    expect((await rows()).map((r) => [r.date, r.quantity])).toEqual([
      ["2026-11-03", 2],
      ["2026-11-04", 1],
    ])
  })
  it("refreshes the kcal snapshot on increment", async () => {
    await incrementRecipe(ctx.db, "2026-11-04", { ...gyoza, kcal: 45.4 })
    expect((await rows())[1]).toEqual({
      date: "2026-11-04",
      quantity: 2,
      kcal: 45,
    })
  })
  it("decrements and deletes at zero, and ignores missing rows", async () => {
    await decrementRecipe(ctx.db, "2026-11-03", "gyozas")
    expect((await rows())[0].quantity).toBe(1)
    await decrementRecipe(ctx.db, "2026-11-03", "gyozas")
    await decrementRecipe(ctx.db, "2026-11-03", "gyozas")
    await decrementRecipe(ctx.db, "2026-11-05", "nothing")
    expect((await rows()).map((r) => r.date)).toEqual(["2026-11-04"])
  })
})
