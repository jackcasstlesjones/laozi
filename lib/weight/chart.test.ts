import { describe, expect, it } from "vitest"

import {
  buildChart,
  goalDay,
  nearestPoint,
  projectionLine,
  windowFor,
  xTicks,
  yScale,
} from "./chart"
import { fromDay, toDay } from "./dates"

const today = toDay("2026-11-03")
const entries = [
  { date: "2026-01-05", weightKg: 92.2 },
  { date: "2026-10-27", weightKg: 86.4 },
  { date: "2026-11-03", weightKg: 85.6 },
]
const goal = { goalKg: 80, rateKgPerWeek: 0.5 }

describe("goalDay", () => {
  it("is (distance / rate) weeks after the latest entry", () => {
    // 5.6 kg at 0.5 kg/week = 11.2 weeks = 78.4 days
    expect(goalDay({ day: today, kg: 85.6 }, goal)).toBeCloseTo(today + 78.4)
  })
  it("is null without a goal or when already at goal", () => {
    expect(goalDay({ day: today, kg: 85.6 }, null)).toBeNull()
    expect(goalDay({ day: today, kg: 80 }, goal)).toBeNull()
  })
  it("works for a goal above the latest weight", () => {
    expect(
      goalDay({ day: 0, kg: 70 }, { goalKg: 71, rateKgPerWeek: 0.5 })
    ).toBeCloseTo(14)
  })
})

describe("windowFor", () => {
  const points = entries.map((e) => ({ day: toDay(e.date), kg: e.weightKg }))
  it("6M ends today plus a quarter of the window for the projection", () => {
    const w = windowFor("6M", points, today, goal)
    expect(fromDay(w.start)).toBe("2026-05-03")
    // 184 days back → 46 days of future
    expect(w.end - today).toBe(46)
  })
  it("has no future margin without a goal", () => {
    const w = windowFor("1W", points, today, null)
    expect([w.start, w.end]).toEqual([today - 7, today])
  })
  it("All runs from the first entry to the day the projection reaches the goal", () => {
    const w = windowFor("All", points, today, goal)
    expect(fromDay(w.start)).toBe("2026-01-05")
    expect(w.end).toBe(today + 79) // ceil(78.4)
  })
  it("All ends today without a goal", () => {
    expect(windowFor("All", points, today, null).end).toBe(today)
  })
})

describe("projectionLine", () => {
  const latest = { day: today, kg: 85.6 }
  it("is cut off at the window edge, interpolating the weight there", () => {
    const p = projectionLine(latest, goal, today + 39.2)!
    expect(p.to.day).toBe(today + 39.2)
    expect(p.to.kg).toBeCloseTo(82.8) // halfway: 85.6 - 2.8
  })
  it("stops at the goal when it is reached inside the window", () => {
    const p = projectionLine(latest, goal, today + 100)!
    expect(p.to).toEqual({ day: today + 78.4, kg: 80 })
  })
  it("is null when the window ends at the latest entry", () => {
    expect(projectionLine(latest, goal, today)).toBeNull()
  })
})

describe("yScale", () => {
  it("covers entries and goal with 10% padding and nice ticks", () => {
    // min 80, max 86.4, span 6.4, pad 0.64 → [79.36, 87.04]; step 2
    const y = yScale([85.6, 86.4, 80])
    expect(y.domain[0]).toBeCloseTo(79.36)
    expect(y.domain[1]).toBeCloseTo(87.04)
    expect(y.ticks).toEqual([80, 82, 84, 86])
  })
  it("pads a single value by 0.5 kg", () => {
    const y = yScale([85.6])
    expect(y.domain[0]).toBeCloseTo(85.1)
    expect(y.domain[1]).toBeCloseTo(86.1)
    expect(y.ticks).toEqual([85.25, 85.5, 85.75, 86])
  })
})

describe("xTicks", () => {
  it("uses Mondays for a month", () => {
    const t = xTicks(toDay("2026-10-03"), toDay("2026-11-03"))
    expect(t.map((x) => x.label)).toEqual([
      "Oct 5",
      "Oct 12",
      "Oct 19",
      "Oct 26",
      "Nov 2",
    ])
  })
  it("uses month starts, with years when the span is over a year", () => {
    const t = xTicks(toDay("2025-01-05"), toDay("2026-11-03"))
    expect(t[0].label).toBe("Feb '25")
    expect(t.length).toBeLessThanOrEqual(6)
  })
})

describe("buildChart", () => {
  it("draws the line through the previous entry so it enters from the edge", () => {
    const c = buildChart(entries, goal, "1M", today)
    expect(c.visible.map((p) => p.kg)).toEqual([86.4, 85.6])
    expect(c.line.map((p) => p.kg)).toEqual([92.2, 86.4, 85.6])
    expect(c.latest?.kg).toBe(85.6)
    expect(c.goalKg).toBe(80)
  })
  it("has a single point and no projection without a goal", () => {
    const c = buildChart(
      [{ date: "2026-11-03", weightKg: 85.6 }],
      null,
      "6M",
      today
    )
    expect(c.visible).toHaveLength(1)
    expect(c.projection).toBeNull()
    expect(c.goalKg).toBeNull()
  })
  it("handles no entries", () => {
    const c = buildChart([], null, "6M", today)
    expect(c.visible).toEqual([])
    expect(c.latest).toBeNull()
  })
})

describe("nearestPoint", () => {
  const pts = [
    { day: 0, kg: 1 },
    { day: 10, kg: 2 },
  ]
  it("finds the closest entry, ties to the later one", () => {
    expect(nearestPoint(pts, 3)?.kg).toBe(1)
    expect(nearestPoint(pts, 5)?.kg).toBe(2)
    expect(nearestPoint([], 5)).toBeNull()
  })
})
