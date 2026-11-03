"use client"

import { Minus, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"

export function Counter({
  count,
  name,
  onAdjust,
}: {
  count: number
  name: string
  onAdjust: (delta: 1 | -1) => void
}) {
  return (
    <div className="flex items-center gap-1">
      <Button
        variant="outline"
        size="icon-sm"
        aria-label={`Remove one ${name}`}
        disabled={count === 0}
        onClick={() => onAdjust(-1)}
      >
        <Minus />
      </Button>
      <span
        className="w-6 text-center text-sm font-medium tabular-nums"
        aria-live="polite"
      >
        {count}
      </span>
      <Button
        variant="outline"
        size="icon-sm"
        aria-label={`Add one ${name}`}
        onClick={() => onAdjust(1)}
      >
        <Plus />
      </Button>
    </div>
  )
}
