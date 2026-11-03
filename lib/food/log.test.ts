import { describe, expect, it } from "vitest"

import {
  dateInTimeZone,
  dayTotal,
  isValidTimeZone,
  recipeCounts,
  summariseDays,
  type LogEntry,
} from "./log"

const e = (p: Partial<LogEntry>): LogEntry => ({
  id: 1,
  date: "2026-11-03",
  recipeSlug: null,
  name: "x",
  kcal: 100,
  quantity: 1,
  ...p,
})

describe("dateInTimeZone", () => {
  // 2026-11-04 06:30 UTC is still Nov 3 in Los Angeles (UTC-8) but Nov 4 in London
  const now = new Date("2026-11-04T06:30:00Z")
  it("uses the given time zone's calendar date", () => {
    expect(dateInTimeZone(now, "America/Los_Angeles")).toBe("2026-11-03")
    expect(dateInTimeZone(now, "Europe/London")).toBe("2026-11-04")
  })
  it("rolls over exactly at local midnight", () => {
    expect(
      dateInTimeZone(new Date("2026-11-04T07:59:59Z"), "America/Los_Angeles")
    ).toBe("2026-11-03")
    expect(
      dateInTimeZone(new Date("2026-11-04T08:00:00Z"), "America/Los_Angeles")
    ).toBe("2026-11-04")
  })
})

describe("isValidTimeZone", () => {
  it("accepts IANA zones and rejects junk", () => {
    expect(isValidTimeZone("Europe/London")).toBe(true)
    expect(isValidTimeZone("Not/AZone")).toBe(false)
    expect(isValidTimeZone(undefined)).toBe(false)
  })
})

describe("totals", () => {
  it("multiplies kcal by quantity", () => {
    expect(dayTotal([e({ kcal: 40, quantity: 6 }), e({ kcal: 800 })])).toBe(
      1040
    )
    expect(dayTotal([])).toBe(0)
  })
})

describe("summariseDays", () => {
  it("groups by date, newest first, with totals", () => {
    const days = summariseDays([
      e({ id: 1, date: "2026-11-02", kcal: 500 }),
      e({ id: 2, date: "2026-11-03", kcal: 40, quantity: 2 }),
      e({ id: 3, date: "2026-11-02", kcal: 300 }),
    ])
    expect(
      days.map((d) => [d.date, d.total, d.entries.map((x) => x.id)])
    ).toEqual([
      ["2026-11-03", 80, [2]],
      ["2026-11-02", 800, [1, 3]],
    ])
  })
})

describe("recipeCounts", () => {
  it("maps recipe slugs to quantities and ignores custom items", () => {
    expect(
      recipeCounts([
        e({ recipeSlug: "gyozas", quantity: 3 }),
        e({ name: "custom" }),
      ])
    ).toEqual({ gyozas: 3 })
  })
})
