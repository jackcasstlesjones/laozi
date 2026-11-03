/**
 * Pure chart engine for the weight chart (docs/SPEC.md → Chart).
 * Works in whole days since the epoch on the x-axis and kg on the y-axis.
 */
import { addMonths, formatMonth, formatShortDate, toDay } from "./dates"

export const RANGES = ["1W", "1M", "3M", "6M", "1Y", "All"] as const
/** Not offered in the selector: the compact chart on the Food tab always shows this. */
export const TREND_RANGE = "2W"
export type Range = (typeof RANGES)[number] | typeof TREND_RANGE
export const DEFAULT_RANGE: Range = "6M"

export type Entry = { date: string; weightKg: number }
export type Goal = { goalKg: number; rateKgPerWeek: number }
export type Point = { day: number; kg: number }
export type Tick = { value: number; label: string }
/** The part of the chart's scales that animates between ranges. */
export type View = { start: number; end: number; yMin: number; yMax: number }

export type ChartModel = {
  start: number
  end: number
  /** Every entry, oldest first. The line runs through all of them, clipped to the window. */
  points: Point[]
  /** Entries inside the window: hover targets and y-domain inputs. */
  visible: Point[]
  latest: Point | null
  goalKg: number | null
  yDomain: [number, number]
  yTicks: number[]
  xTicks: Tick[]
}

/** Share of the window added after today for the projection on fixed ranges. */
const FUTURE_SHARE = 0.25
/** Upper bound on how far the All range extends for a projection. */
const MAX_PROJECTION_DAYS = 3 * 365
const Y_STEPS = [0.25, 0.5, 1, 2, 2.5, 5, 10, 20, 25, 50, 100]
export const MAX_Y_TICKS = 5
export const MAX_X_TICKS = 6

export function toPoints(entries: Entry[]): Point[] {
  return entries
    .map((e) => ({ day: toDay(e.date), kg: e.weightKg }))
    .sort((a, b) => a.day - b.day)
}

/** Day the projection from `latest` reaches the goal, or null when there is nothing to project. */
export function goalDay(latest: Point, goal: Goal | null): number | null {
  if (!goal || goal.rateKgPerWeek <= 0 || goal.goalKg === latest.kg) return null
  return (
    latest.day + (Math.abs(goal.goalKg - latest.kg) / goal.rateKgPerWeek) * 7
  )
}

export function windowFor(
  range: Range,
  points: Point[],
  today: number,
  goal: Goal | null
): { start: number; end: number } {
  const latest = points.at(-1)
  const reach = latest ? goalDay(latest, goal) : null

  if (range === "All") {
    if (!latest) return { start: today - 180, end: today }
    let start = points[0].day
    let end = Math.max(today, latest.day)
    if (reach !== null)
      end = Math.max(
        end,
        Math.ceil(Math.min(reach, latest.day + MAX_PROJECTION_DAYS))
      )
    if (end - start < 7) start = end - 7
    return { start, end }
  }

  const start =
    range === "1W"
      ? today - 7
      : range === TREND_RANGE
        ? today - 14
        : addMonths(today, -{ "1M": 1, "3M": 3, "6M": 6, "1Y": 12 }[range])
  const future = reach !== null ? Math.round((today - start) * FUTURE_SHARE) : 0
  return { start, end: today + future }
}

/** Projection from the latest entry toward the goal, cut off at the window's right edge. */
export function projectionLine(
  latest: Point,
  goal: Goal | null,
  end: number
): { from: Point; to: Point } | null {
  const reach = goalDay(latest, goal)
  if (reach === null || !goal || end <= latest.day) return null
  if (reach <= end) return { from: latest, to: { day: reach, kg: goal.goalKg } }
  const t = (end - latest.day) / (reach - latest.day)
  return {
    from: latest,
    to: { day: end, kg: latest.kg + (goal.goalKg - latest.kg) * t },
  }
}

export function yScale(
  values: number[],
  maxTicks = MAX_Y_TICKS,
  /** End the domain on ticks around the values, with no padding beyond them. */
  snap = false
): {
  domain: [number, number]
  ticks: number[]
} {
  let min = Math.min(...values)
  let max = Math.max(...values)
  const pad = Math.max((max - min) * 0.1, 0.5)
  min -= pad
  max += pad
  const step =
    Y_STEPS.find((s) => (max - min) / s <= maxTicks) ?? Y_STEPS.at(-1)!
  if (snap) {
    const low = Math.floor(Math.min(...values) / step) * step
    const high = Math.ceil(Math.max(...values) / step) * step
    min = low
    max = high > low ? high : low + step
  }
  const ticks: number[] = []
  for (let v = Math.ceil(min / step) * step; v <= max + 1e-9; v += step) {
    ticks.push(Math.round(v * 100) / 100)
  }
  return { domain: [min, max], ticks }
}

export function xTicks(
  start: number,
  end: number,
  maxTicks = MAX_X_TICKS
): Tick[] {
  const span = end - start
  const ticks: Tick[] = []

  if (span <= 14) {
    const step = Math.max(1, Math.ceil(span / maxTicks))
    for (let d = Math.ceil(start); d <= end; d += step)
      ticks.push({ value: d, label: formatShortDate(d) })
    return ticks
  }

  if (span <= 120) {
    const step = 7 * Math.max(1, Math.ceil(span / 7 / MAX_X_TICKS))
    // First Monday on or after start (epoch day 4 was a Monday).
    let d = Math.ceil(start)
    d += (((4 - d) % 7) + 7) % 7
    for (; d <= end; d += step)
      ticks.push({ value: d, label: formatShortDate(d) })
    return ticks
  }

  const months = Math.ceil(span / 30.44)
  const step = Math.max(1, Math.ceil(months / MAX_X_TICKS))
  const withYear = span > 366
  const first = new Date(start * 86_400_000)
  // First of the month on or after start.
  let m = first.getUTCDate() === 1 ? 0 : 1
  for (;;) {
    const d =
      Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + m, 1) / 86_400_000
    if (d > end) break
    ticks.push({ value: d, label: formatMonth(d, withYear) })
    m += step
  }
  return ticks
}

export function buildChart(
  entries: Entry[],
  goal: Goal | null,
  range: Range,
  today: number,
  { maxYTicks = MAX_Y_TICKS, maxXTicks = MAX_X_TICKS, snapY = false } = {}
): ChartModel {
  const points = toPoints(entries)
  const { start, end } = windowFor(range, points, today, goal)
  const visible = points.filter((p) => p.day >= start && p.day <= end)
  const latest = points.at(-1) ?? null

  const yValues = visible.map((p) => p.kg)
  if (goal) yValues.push(goal.goalKg)
  if (yValues.length === 0 && latest) yValues.push(latest.kg)
  if (yValues.length === 0) yValues.push(80)
  const y = yScale(yValues, maxYTicks, snapY)

  return {
    start,
    end,
    points,
    visible,
    latest,
    goalKg: goal?.goalKg ?? null,
    yDomain: y.domain,
    yTicks: y.ticks,
    xTicks: xTicks(start, end, maxXTicks),
  }
}

/** The visible entry closest to `day` (ties go to the later entry). */
export function nearestPoint(points: Point[], day: number): Point | null {
  let best: Point | null = null
  for (const p of points) {
    if (!best || Math.abs(p.day - day) <= Math.abs(best.day - day)) best = p
  }
  return best
}

export function viewOf(model: ChartModel): View {
  const [yMin, yMax] = model.yDomain
  return { start: model.start, end: model.end, yMin, yMax }
}

export function lerp(from: number, to: number, t: number): number {
  return from + (to - from) * t
}

export function lerpView(from: View, to: View, t: number): View {
  return {
    start: lerp(from.start, to.start, t),
    end: lerp(from.end, to.end, t),
    yMin: lerp(from.yMin, to.yMin, t),
    yMax: lerp(from.yMax, to.yMax, t),
  }
}

export function sameView(a: View, b: View): boolean {
  return (
    a.start === b.start &&
    a.end === b.end &&
    a.yMin === b.yMin &&
    a.yMax === b.yMax
  )
}

/** Cubic ease-in-out for t between 0 and 1. */
export function ease(t: number): number {
  return t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2
}

/**
 * Ticks to draw part-way (t) through a change of range: ticks in both sets stay
 * solid, the outgoing ones fade out and the incoming ones fade in.
 */
export function crossfadeTicks(
  from: Tick[],
  to: Tick[],
  t: number
): (Tick & { opacity: number })[] {
  const toValues = new Set(to.map((tick) => tick.value))
  const fromValues = new Set(from.map((tick) => tick.value))
  return [
    ...from
      .filter((tick) => !toValues.has(tick.value))
      .map((tick) => ({ ...tick, opacity: 1 - t })),
    ...to.map((tick) => ({
      ...tick,
      opacity: fromValues.has(tick.value) ? 1 : t,
    })),
  ]
}
