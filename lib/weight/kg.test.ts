import { describe, expect, it } from "vitest"

import { formatKg, roundKg } from "./kg"

describe("roundKg (nearest 0.05)", () => {
  it.each([
    [85.60013769692, 85.6],
    [85.64998, 85.65],
    [85.65, 85.65],
    [85.62, 85.6],
    [85.98, 86],
    [90.718474, 90.7],
    [86, 86],
  ])("%s → %s", (input, expected) => {
    expect(roundKg(input)).toBe(expected)
  })
})

describe("formatKg", () => {
  it.each([
    [86, "86.0"],
    [85.5, "85.5"],
    [85.6, "85.6"],
    [85.65, "85.65"],
    [85.64, "85.65"],
  ])("%s → %s", (input, expected) => {
    expect(formatKg(input)).toBe(expected)
  })
})
