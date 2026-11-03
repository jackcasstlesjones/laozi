import { afterAll, beforeAll, describe, expect, it } from "vitest"

import { testDb } from "@/tests/db"
import { foodLog, goalSettings, weighIn } from "./schema"

let ctx: Awaited<ReturnType<typeof testDb>>
beforeAll(async () => {
  ctx = await testDb()
})
afterAll(() => ctx.pool.end())

describe("weigh_in constraints", () => {
  it("allows one entry per date", async () => {
    await ctx.db.insert(weighIn).values({ date: "2026-11-01", weightKg: 85.6 })
    await expect(
      ctx.db.insert(weighIn).values({ date: "2026-11-01", weightKg: 85.0 })
    ).rejects.toThrow()
  })
  it("rejects weights outside 30–300 kg", async () => {
    await expect(
      ctx.db.insert(weighIn).values({ date: "2026-11-02", weightKg: 29.9 })
    ).rejects.toThrow()
    await expect(
      ctx.db.insert(weighIn).values({ date: "2026-11-02", weightKg: 300.1 })
    ).rejects.toThrow()
    await ctx.db.insert(weighIn).values({ date: "2026-11-02", weightKg: 300 })
  })
  it("stores one decimal place", async () => {
    const [row] = await ctx.db
      .insert(weighIn)
      .values({ date: "2026-11-03", weightKg: 85.64 })
      .returning()
    expect(row.weightKg).toBe(85.6)
  })
})

describe("goal_settings constraints", () => {
  it("is a singleton", async () => {
    await ctx.db.insert(goalSettings).values({ id: 1 })
    await expect(
      ctx.db.insert(goalSettings).values({ id: 2 })
    ).rejects.toThrow()
  })
  it("defaults the rate to 0.5 kg/week", async () => {
    const [row] = await ctx.db.select().from(goalSettings)
    expect(row.rateKgPerWeek).toBe(0.5)
    expect(row.goalKg).toBeNull()
  })
})

describe("food_log constraints", () => {
  it("allows one recipe row per date", async () => {
    await ctx.db.insert(foodLog).values({
      date: "2026-11-03",
      recipeSlug: "gyozas",
      name: "Gyozas",
      kcal: 40,
    })
    await expect(
      ctx.db.insert(foodLog).values({
        date: "2026-11-03",
        recipeSlug: "gyozas",
        name: "Gyozas",
        kcal: 40,
      })
    ).rejects.toThrow()
    await ctx.db.insert(foodLog).values({
      date: "2026-11-04",
      recipeSlug: "gyozas",
      name: "Gyozas",
      kcal: 40,
    })
  })
  it("allows many custom rows per date, even with the same name", async () => {
    await ctx.db
      .insert(foodLog)
      .values({ date: "2026-11-03", name: "Sausage and mash", kcal: 800 })
    await ctx.db
      .insert(foodLog)
      .values({ date: "2026-11-03", name: "Sausage and mash", kcal: 800 })
  })
  it("rejects bad kcal, quantity and blank names", async () => {
    await expect(
      ctx.db.insert(foodLog).values({ date: "2026-11-03", name: "x", kcal: -1 })
    ).rejects.toThrow()
    await expect(
      ctx.db
        .insert(foodLog)
        .values({ date: "2026-11-03", name: "x", kcal: 10001 })
    ).rejects.toThrow()
    await expect(
      ctx.db
        .insert(foodLog)
        .values({ date: "2026-11-03", name: "x", kcal: 1, quantity: 0 })
    ).rejects.toThrow()
    await expect(
      ctx.db.insert(foodLog).values({ date: "2026-11-03", name: "  ", kcal: 1 })
    ).rejects.toThrow()
  })
})
