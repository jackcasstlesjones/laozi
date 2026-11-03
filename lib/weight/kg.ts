/** Weights are stored and shown to the nearest 0.05 kg (see docs/SPEC.md). */
export const MIN_KG = 30
export const MAX_KG = 300
const STEPS_PER_KG = 20

/** Nearest 0.05 kg. */
export function roundKg(kg: number): number {
  return Math.round(kg * STEPS_PER_KG) / STEPS_PER_KG
}

/** "86.0", "85.6", "85.65": at least one decimal, two only for odd 0.05s. */
export function formatKg(kg: number): string {
  const s = roundKg(kg).toFixed(2)
  return s.endsWith("0") ? s.slice(0, -1) : s
}
