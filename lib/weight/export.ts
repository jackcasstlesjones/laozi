import type { Entry } from "./chart"
import { formatKg } from "./kg"

export type ExportGoal = { goalKg: number | null; rateKgPerWeek: number }

/** Markdown for pasting into an LLM chat. Newest first. */
export function buildExportMarkdown(
  entries: Entry[],
  goal: ExportGoal
): string {
  const sorted = [...entries].sort((a, b) => b.date.localeCompare(a.date))
  const kg = formatKg
  const lines = [
    "# Weight log (kg)",
    goal.goalKg === null
      ? "Goal: not set"
      : `Goal: ${kg(goal.goalKg)} (${goal.rateKgPerWeek} kg/week)`,
  ]
  if (sorted[0])
    lines.push(`Latest: ${sorted[0].date} ${kg(sorted[0].weightKg)}`)
  lines.push("| Date | kg |", "|---|---|")
  for (const e of sorted) lines.push(`| ${e.date} | ${kg(e.weightKg)} |`)
  return lines.join("\n") + "\n"
}
