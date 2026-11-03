import { describe, expect, it } from "vitest"

import { adjustRecipeInput, customItemInput } from "./validation"

describe("customItemInput", () => {
  it("trims the name and coerces kcal", () => {
    expect(
      customItemInput.parse({ name: "  Sausage and mash ", kcal: "800" })
    ).toEqual({
      name: "Sausage and mash",
      kcal: 800,
    })
  })
  it.each([
    [{ name: "", kcal: 800 }, "Enter a name"],
    [{ name: "x", kcal: 0 }, "Enter kcal between 1 and 10,000"],
    [{ name: "x", kcal: 10_001 }, "Enter kcal between 1 and 10,000"],
    [{ name: "x", kcal: 12.5 }, "Enter a whole number of kcal"],
  ])("rejects %j", (input, message) => {
    expect(customItemInput.safeParse(input).error?.issues[0].message).toBe(
      message
    )
  })
})

describe("adjustRecipeInput", () => {
  it("only allows +1 or -1", () => {
    expect(
      adjustRecipeInput.safeParse({ slug: "gyozas", delta: 1 }).success
    ).toBe(true)
    expect(
      adjustRecipeInput.safeParse({ slug: "gyozas", delta: 2 }).success
    ).toBe(false)
  })
})
