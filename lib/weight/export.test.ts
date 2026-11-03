import { describe, expect, it } from "vitest"

import { buildExportMarkdown } from "./export"

describe("buildExportMarkdown", () => {
  it("matches the spec format, newest first", () => {
    const md = buildExportMarkdown(
      [
        { date: "2026-11-02", weightKg: 86 },
        { date: "2026-11-03", weightKg: 85.6 },
      ],
      { goalKg: 80, rateKgPerWeek: 0.5 }
    )
    expect(md).toBe(
      [
        "# Weight log (kg)",
        "Goal: 80.0 (0.5 kg/week)",
        "Latest: 2026-11-03 85.6",
        "| Date | kg |",
        "|---|---|",
        "| 2026-11-03 | 85.6 |",
        "| 2026-11-02 | 86.0 |",
        "",
      ].join("\n")
    )
  })
  it("says when no goal is set and handles no entries", () => {
    const md = buildExportMarkdown([], { goalKg: null, rateKgPerWeek: 0.5 })
    expect(md).toContain("Goal: not set")
    expect(md).not.toContain("Latest:")
  })
})
