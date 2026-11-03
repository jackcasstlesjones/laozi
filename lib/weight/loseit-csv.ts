import { MAX_KG, MIN_KG, roundKg } from "./kg"

/**
 * Pure parser for Lose It's weight CSV export (one-off import, see docs/SPEC.md).
 * Row numbers are file rows with the header as row 1, as a spreadsheet shows them.
 */

export type ParsedWeighIn = { date: string; weightKg: number }

export type LoseItParseResult = {
  entries: ParsedWeighIn[]
  /** Rows that couldn't be read (bad date, bad or out-of-range weight). */
  unreadableRows: number[]
  /** Rows marked Deleted=true in Lose It; not imported. */
  deletedRows: number[]
  /** Rows replaced by a later row with the same date. */
  supersededRows: number[]
}

const LB_TO_KG = 0.45359237

function splitCsvLine(line: string): string[] {
  const out: string[] = []
  let cur = ""
  let quoted = false
  for (let i = 0; i < line.length; i++) {
    const c = line[i]
    if (quoted) {
      if (c === '"' && line[i + 1] === '"') {
        cur += '"'
        i++
      } else if (c === '"') quoted = false
      else cur += c
    } else if (c === '"') quoted = true
    else if (c === ",") {
      out.push(cur)
      cur = ""
    } else cur += c
  }
  out.push(cur)
  return out.map((s) => s.trim())
}

function parseDate(raw: string): string | null {
  let y: number, m: number, d: number
  const us = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(raw)
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(raw)
  if (us) [m, d, y] = [Number(us[1]), Number(us[2]), Number(us[3])]
  else if (iso) [y, m, d] = [Number(iso[1]), Number(iso[2]), Number(iso[3])]
  else return null
  const dt = new Date(Date.UTC(y, m - 1, d))
  if (
    dt.getUTCFullYear() !== y ||
    dt.getUTCMonth() !== m - 1 ||
    dt.getUTCDate() !== d
  )
    return null
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`
}

export function parseLoseItCsv(text: string): LoseItParseResult {
  const lines = text.split(/\r?\n/)
  const header = splitCsvLine(lines[0] ?? "").map((h) => h.toLowerCase())
  const col = (...names: string[]) => header.findIndex((h) => names.includes(h))
  const iDate = col("date")
  const iWeight = col("weight")
  const iUnits = col("units", "unit")
  const iDeleted = col("deleted")
  if (iDate < 0 || iWeight < 0)
    throw new Error("CSV must have Date and Weight columns")

  const byDate = new Map<string, { row: number; weightKg: number }>()
  const result: LoseItParseResult = {
    entries: [],
    unreadableRows: [],
    deletedRows: [],
    supersededRows: [],
  }

  lines.slice(1).forEach((line, idx) => {
    const row = idx + 2
    if (line.trim() === "") return
    const cells = splitCsvLine(line)
    if (iDeleted >= 0 && cells[iDeleted]?.toLowerCase() === "true") {
      result.deletedRows.push(row)
      return
    }
    const date = parseDate(cells[iDate] ?? "")
    const raw = Number(cells[iWeight])
    const isLb = iUnits >= 0 && /^lbs?$/i.test(cells[iUnits] ?? "")
    const weightKg = roundKg(isLb ? raw * LB_TO_KG : raw)
    if (
      !date ||
      !cells[iWeight] ||
      !Number.isFinite(raw) ||
      weightKg < MIN_KG ||
      weightKg > MAX_KG
    ) {
      result.unreadableRows.push(row)
      return
    }
    const prev = byDate.get(date)
    if (prev) result.supersededRows.push(prev.row)
    byDate.set(date, { row, weightKg })
  })

  result.entries = [...byDate].map(([date, { weightKg }]) => ({
    date,
    weightKg,
  }))
  return result
}

export function planImport(
  entries: ParsedWeighIn[],
  existingDates: Set<string>
) {
  const toInsert = entries.filter((e) => !existingDates.has(e.date))
  return { toInsert, skippedExisting: entries.length - toInsert.length }
}
