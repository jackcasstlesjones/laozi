import { describe, expect, it } from "vitest"

import { parseLoseItCsv, planImport } from "./loseit-csv"

const HEADER = "Date,Weight,Last Updated,Deleted"

describe("parseLoseItCsv", () => {
  it("reads MM/DD/YYYY dates and rounds kg to one decimal", () => {
    const r = parseLoseItCsv(
      [
        HEADER,
        "11/03/2026,85.60013769692,2026-11-03T05:15:14-0700,false",
        "10/10/2023,86.39982104523001,x,false",
      ].join("\n")
    )
    expect(r.entries).toEqual([
      { date: "2026-11-03", weightKg: 85.6 },
      { date: "2023-10-10", weightKg: 86.4 },
    ])
    expect(r.unreadableRows).toEqual([])
  })

  it("ignores rows deleted in Lose It and reports their row numbers", () => {
    const r = parseLoseItCsv(
      [HEADER, "01/06/2025,93.0,x,false", "01/07/2025,94.75,x,true"].join("\n")
    )
    expect(r.entries).toEqual([{ date: "2025-01-06", weightKg: 93 }])
    expect(r.deletedRows).toEqual([3])
  })

  it("lets the last row win when several share a date", () => {
    const r = parseLoseItCsv(
      [HEADER, "05/01/2026,92.2,x,false", "05/01/2026,91.9,x,false"].join("\n")
    )
    expect(r.entries).toEqual([{ date: "2026-05-01", weightKg: 91.9 }])
    expect(r.supersededRows).toEqual([2])
  })

  it("converts lb to kg when a units column says so", () => {
    const r = parseLoseItCsv(
      ["Date,Weight,Units", "06/01/2026,200,lbs", "06/02/2026,90.0,kg"].join(
        "\n"
      )
    )
    // 200 lb × 0.45359237 = 90.718474 → 90.7
    expect(r.entries).toEqual([
      { date: "2026-06-01", weightKg: 90.7 },
      { date: "2026-06-02", weightKg: 90 },
    ])
  })

  it("reports unreadable rows by file row number (header is row 1)", () => {
    const r = parseLoseItCsv(
      [
        HEADER,
        "13/45/2026,85,x,false",
        "11/01/2026,abc,x,false",
        "11/02/2026,25,x,false",
        "",
        "11/04/2026,85,x,false",
      ].join("\n")
    )
    expect(r.unreadableRows).toEqual([2, 3, 4])
    expect(r.entries).toEqual([{ date: "2026-11-04", weightKg: 85 }])
  })

  it("handles CRLF line endings and quoted fields", () => {
    const r = parseLoseItCsv(`${HEADER}\r\n"11/03/2026","85.6","x","false"\r\n`)
    expect(r.entries).toEqual([{ date: "2026-11-03", weightKg: 85.6 }])
  })

  it("throws when the Date or Weight column is missing", () => {
    expect(() => parseLoseItCsv("Day,Kg\n1,2")).toThrow(/Date/)
  })
})

describe("planImport", () => {
  it("skips dates that already have an entry", () => {
    const plan = planImport(
      [
        { date: "2026-11-03", weightKg: 85.6 },
        { date: "2026-11-02", weightKg: 85.9 },
      ],
      new Set(["2026-11-03"])
    )
    expect(plan.toInsert).toEqual([{ date: "2026-11-02", weightKg: 85.9 }])
    expect(plan.skippedExisting).toBe(1)
  })
})
