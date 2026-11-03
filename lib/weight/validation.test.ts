import { describe, expect, it } from "vitest"

import { weighInInput, WEIGHT_RANGE_MESSAGE } from "./validation"

const base = { date: "2026-11-03", today: "2026-11-03" }

describe("weighInInput", () => {
  it("accepts and rounds to one decimal", () => {
    const r = weighInInput.parse({ ...base, weightKg: "85.64" })
    expect(r.weightKg).toBe(85.6)
    expect(r.replace).toBe(false)
  })
  it.each(["29.9", "300.1", "abc", ""])(
    "rejects %j with the range message",
    (w) => {
      const r = weighInInput.safeParse({ ...base, weightKg: w })
      expect(r.success).toBe(false)
      expect(r.error?.issues[0].message).toBe(WEIGHT_RANGE_MESSAGE)
    }
  )
  it("rejects future dates", () => {
    const r = weighInInput.safeParse({
      date: "2026-11-04",
      today: "2026-11-03",
      weightKg: 85,
    })
    expect(r.error?.issues[0].message).toBe("Future dates aren't allowed")
  })
})
