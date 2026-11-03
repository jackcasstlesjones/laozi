import { describe, expect, it } from "vitest"

import { calorieLimitInput, goalInput } from "./validation"

describe("goalInput", () => {
  it("allows clearing the goal", () => {
    expect(goalInput.parse({ goalKg: null, rateKgPerWeek: 0.5 })).toEqual({
      goalKg: null,
      rateKgPerWeek: 0.5,
    })
  })
  it("rounds the goal and validates the rate", () => {
    expect(
      goalInput.parse({ goalKg: "80.04", rateKgPerWeek: "0.5" }).goalKg
    ).toBe(80.05)
    expect(goalInput.safeParse({ goalKg: 80, rateKgPerWeek: 0 }).success).toBe(
      false
    )
  })
})

describe("calorieLimitInput", () => {
  it("accepts a whole number in range, or null", () => {
    expect(calorieLimitInput.parse({ dailyKcalLimit: "2000" })).toEqual({
      dailyKcalLimit: 2000,
    })
    expect(calorieLimitInput.parse({ dailyKcalLimit: null })).toEqual({
      dailyKcalLimit: null,
    })
  })
  it.each([
    [499, "Enter a limit between 500 and 10,000 kcal"],
    [10_001, "Enter a limit between 500 and 10,000 kcal"],
    [1800.5, "Enter a whole number of kcal"],
  ])("rejects %s", (v, message) => {
    expect(
      calorieLimitInput.safeParse({ dailyKcalLimit: v }).error?.issues[0]
        .message
    ).toBe(message)
  })
})
