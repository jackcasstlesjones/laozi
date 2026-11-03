import { describe, expect, it } from "vitest"

import {
  addMonths,
  formatEntryDate,
  formatMonth,
  fromDay,
  localToday,
  toDay,
} from "./dates"

describe("dates", () => {
  it("round-trips ISO dates through day numbers", () => {
    expect(toDay("1970-01-02")).toBe(1)
    expect(fromDay(toDay("2026-11-03"))).toBe("2026-11-03")
  })
  it("formats entry dates like Tue, Nov 3, 2026", () => {
    expect(formatEntryDate("2026-11-03")).toBe("Tue, Nov 3, 2026")
  })
  it("adds calendar months, clamping to the month end", () => {
    expect(fromDay(addMonths(toDay("2026-11-03"), -6))).toBe("2026-05-03")
    expect(fromDay(addMonths(toDay("2026-03-31"), -1))).toBe("2026-02-28")
    expect(fromDay(addMonths(toDay("2026-01-15"), -12))).toBe("2025-01-15")
  })
  it("uses the device's local calendar date", () => {
    expect(localToday(new Date(2026, 10, 3, 23, 59))).toBe("2026-11-03")
  })
  it("formats month labels", () => {
    expect(formatMonth(toDay("2026-06-01"), false)).toBe("Jun")
    expect(formatMonth(toDay("2025-06-01"), true)).toBe("Jun '25")
  })
})
