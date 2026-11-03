import type { Recipe } from "@/lib/recipes/schema"

export function Macros({
  macros,
  className,
}: {
  macros: Recipe["macros"]
  className?: string
}) {
  return (
    <span className={className}>
      P {macros.protein_g}g · C {macros.carbs_g}g · F {macros.fat_g}g
    </span>
  )
}
