/**
 * Weights are stored to one decimal place; the UI displays them rounded to
 * the nearest 0.25 kg (see docs/SPEC.md).
 */
export const MIN_KG = 30
export const MAX_KG = 300
const DISPLAY_STEP = 0.25

/** Storage precision: one decimal place. */
export function roundKg(kg: number): number {
  return Math.round(kg * 10) / 10
}

/** Display value: nearest 0.25 kg. */
export function displayKg(kg: number): number {
  return Math.round(kg / DISPLAY_STEP) * DISPLAY_STEP
}

/** "86.0", "85.5", "85.75": at least one decimal, two only for quarters. */
export function formatKg(kg: number): string {
  const s = displayKg(kg).toFixed(2)
  return s.endsWith("0") ? s.slice(0, -1) : s
}
