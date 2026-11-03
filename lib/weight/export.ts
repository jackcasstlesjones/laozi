import type { Entry } from "./chart"

export type ExportGoal = { goalKg: number | null; rateKgPerWeek: number }

/** Markdown for pasting into an LLM chat. Uses stored values (1 dp), newest first. */
export function buildExportMarkdown(
  entries: Entry[],
  goal: ExportGoal
): string {
  const sorted = [...entries].sort((a, b) => b.date.localeCompare(a.date))
  const kg = (n: number) => n.toFixed(1)
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
