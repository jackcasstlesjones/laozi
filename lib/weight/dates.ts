/** Dates are ISO calendar strings ("2026-11-03"); "days" are whole days since the Unix epoch. */
const MS_PER_DAY = 86_400_000

export function toDay(iso: string): number {
  const [y, m, d] = iso.split("-").map(Number)
  return Date.UTC(y, m - 1, d) / MS_PER_DAY
}

export function fromDay(day: number): string {
  return new Date(Math.round(day) * MS_PER_DAY).toISOString().slice(0, 10)
}

/** Calendar date on the user's device (call in the browser). */
export function localToday(now = new Date()): string {
  const p = (n: number) => String(n).padStart(2, "0")
  return `${now.getFullYear()}-${p(now.getMonth() + 1)}-${p(now.getDate())}`
}

export function addMonths(day: number, months: number): number {
  const d = new Date(day * MS_PER_DAY)
  const y = d.getUTCFullYear()
  const m = d.getUTCMonth() + months
  const lastDay = new Date(Date.UTC(y, m + 1, 0)).getUTCDate()
  return Date.UTC(y, m, Math.min(d.getUTCDate(), lastDay)) / MS_PER_DAY
}

const fmt = (opts: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat("en-US", { ...opts, timeZone: "UTC" })
const entryFmt = fmt({
  weekday: "short",
  month: "short",
  day: "numeric",
  year: "numeric",
})
const shortFmt = fmt({ month: "short", day: "numeric" })
const monthFmt = fmt({ month: "short" })
const longFmt = fmt({ month: "short", day: "numeric", year: "numeric" })

/** "Tue, Nov 3, 2026" */
export function formatEntryDate(iso: string): string {
  return entryFmt.format(new Date(toDay(iso) * MS_PER_DAY))
}

/** "Nov 3" */
export function formatShortDate(day: number): string {
  return shortFmt.format(new Date(day * MS_PER_DAY))
}

/** "Nov" or "Nov '26" */
export function formatMonth(day: number, withYear: boolean): string {
  const d = new Date(day * MS_PER_DAY)
  const m = monthFmt.format(d)
  return withYear ? `${m} '${String(d.getUTCFullYear()).slice(2)}` : m
}

/** "Oct 1 – Nov 20, 2026", or "Dec 1, 2025 – Jan 5, 2026" across years. */
export function formatDateRange(start: number, end: number): string {
  const a = new Date(start * MS_PER_DAY)
  const b = new Date(end * MS_PER_DAY)
  const first =
    a.getUTCFullYear() === b.getUTCFullYear()
      ? shortFmt.format(a)
      : longFmt.format(a)
  return `${first} – ${longFmt.format(b)}`
}
