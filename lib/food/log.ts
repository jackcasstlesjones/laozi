/** Pure helpers for the calorie log (docs/SPEC.md → Calorie counting). */

export type LogEntry = {
  id: number
  date: string
  recipeSlug: string | null
  name: string
  kcal: number
  quantity: number
}

export type DaySummary = { date: string; total: number; entries: LogEntry[] }

export const DEFAULT_TIME_ZONE = "Europe/London"

export function isValidTimeZone(tz: string | undefined): tz is string {
  if (!tz) return false
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: tz })
    return true
  } catch {
    return false
  }
}

/** Calendar date (YYYY-MM-DD) at `now` in `timeZone`. */
export function dateInTimeZone(now: Date, timeZone: string): string {
  // en-CA formats as YYYY-MM-DD
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now)
}

export function entryTotal(e: Pick<LogEntry, "kcal" | "quantity">): number {
  return e.kcal * e.quantity
}

export function dayTotal(
  entries: Pick<LogEntry, "kcal" | "quantity">[]
): number {
  return entries.reduce((sum, e) => sum + entryTotal(e), 0)
}

/** Group entries into days, newest day first; entries keep their order (oldest first). */
export function summariseDays(entries: LogEntry[]): DaySummary[] {
  const byDate = new Map<string, LogEntry[]>()
  for (const e of entries)
    byDate.set(e.date, [...(byDate.get(e.date) ?? []), e])
  return [...byDate]
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, list]) => ({ date, total: dayTotal(list), entries: list }))
}

/** Today's count per recipe slug. */
export function recipeCounts(entries: LogEntry[]): Record<string, number> {
  const counts: Record<string, number> = {}
  for (const e of entries) if (e.recipeSlug) counts[e.recipeSlug] = e.quantity
  return counts
}

/** Progress against the daily limit, or null when no limit is set. */
export function limitProgress(total: number, limit: number | null) {
  if (!limit) return null
  return {
    percent: Math.min(100, (total / limit) * 100),
    over: Math.max(0, total - limit),
  }
}
