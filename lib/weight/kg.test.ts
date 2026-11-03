import { describe, expect, it } from "vitest"

import { displayKg, formatKg, roundKg } from "./kg"

describe("roundKg (storage, 1 dp)", () => {
  it.each([
    [85.60013769692, 85.6],
    [86.39982104523, 86.4],
    [90.718474, 90.7],
    [86, 86],
  ])("%s → %s", (input, expected) => {
    expect(roundKg(input)).toBe(expected)
  })
})

describe("displayKg (UI, nearest 0.25)", () => {
  it.each([
    [85.6, 85.5],
    [85.7, 85.75],
    [85.9, 86],
    [85.1, 85],
    [85.2, 85.25],
    [86.4, 86.5],
    [86, 86],
  ])("%s → %s", (input, expected) => {
    expect(displayKg(input)).toBe(expected)
  })
})

describe("formatKg", () => {
  it.each([
    [86, "86.0"],
    [85.5, "85.5"],
    [85.7, "85.75"],
    [85.2, "85.25"],
    [85.6, "85.5"],
  ])("%s → %s", (input, expected) => {
    expect(formatKg(input)).toBe(expected)
  })
})
