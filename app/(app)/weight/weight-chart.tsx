"use client"

import { useEffect, useId, useMemo, useRef, useState } from "react"

import {
  buildChart,
  nearestPoint,
  type Entry,
  type Goal,
  type Point,
  type Range,
} from "@/lib/weight/chart"
import { formatEntryDate, fromDay, toDay } from "@/lib/weight/dates"
import { formatKg } from "@/lib/weight/kg"

const HEIGHT = 280
const M = { top: 12, right: 52, bottom: 28, left: 8 }

function useWidth() {
  const ref = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(([e]) =>
      setWidth(Math.floor(e.contentRect.width))
    )
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  return [ref, width] as const
}

export function WeightChart({
  entries,
  goal,
  range,
  today,
}: {
  entries: Entry[]
  goal: Goal | null
  range: Range
  today: string
}) {
  const [ref, width] = useWidth()
  const clipId = useId()
  const [active, setActive] = useState<Point | null>(null)
  const model = useMemo(
    () => buildChart(entries, goal, range, toDay(today)),
    [entries, goal, range, today]
  )

  const innerW = Math.max(0, width - M.left - M.right)
  const innerH = HEIGHT - M.top - M.bottom
  const [yMin, yMax] = model.yDomain
  const sx = (day: number) =>
    M.left + ((day - model.start) / (model.end - model.start)) * innerW
  const sy = (kg: number) => M.top + ((yMax - kg) / (yMax - yMin)) * innerH

  const yStep = model.yTicks.length > 1 ? model.yTicks[1] - model.yTicks[0] : 1
  const yLabel = (v: number) =>
    yStep >= 1 ? String(Math.round(v)) : formatKg(v)
  const goalY = model.goalKg !== null ? sy(model.goalKg) : null
  const yTicks = model.yTicks.filter(
    (v) => goalY === null || Math.abs(sy(v) - goalY) > 14
  )

  const path = model.line
    .map((p, i) => `${i ? "L" : "M"}${sx(p.day)},${sy(p.kg)}`)
    .join("")
  const showDots = model.visible.length <= 45

  function pick(clientX: number, target: SVGRectElement) {
    const rect = target.getBoundingClientRect()
    const day =
      model.start +
      ((clientX - rect.left) / rect.width) * (model.end - model.start)
    setActive(nearestPoint(model.visible, day))
  }

  return (
    <div
      ref={ref}
      className="relative w-full select-none"
      style={{ height: HEIGHT }}
    >
      {width > 0 && (
        <svg
          width={width}
          height={HEIGHT}
          className="overflow-visible text-xs"
          role="img"
          aria-label="Weight chart"
        >
          <defs>
            <clipPath id={clipId}>
              <rect
                x={M.left}
                y={0}
                width={innerW}
                height={HEIGHT - M.bottom}
              />
            </clipPath>
          </defs>

          {/* y grid + labels (right) */}
          {yTicks.map((v) => (
            <g key={v}>
              <line
                x1={M.left}
                x2={M.left + innerW}
                y1={sy(v)}
                y2={sy(v)}
                className="stroke-border"
              />
              <text
                x={M.left + innerW + 8}
                y={sy(v)}
                dy="0.32em"
                className="fill-muted-foreground tabular-nums"
              >
                {yLabel(v)}
              </text>
            </g>
          ))}

          {/* x labels */}
          {model.xTicks.map((t) => {
            const x = sx(t.value)
            const anchor =
              x < M.left + 20
                ? "start"
                : x > M.left + innerW - 20
                  ? "end"
                  : "middle"
            return (
              <text
                key={t.value}
                x={x}
                y={HEIGHT - 8}
                textAnchor={anchor}
                className="fill-muted-foreground"
              >
                {t.label}
              </text>
            )
          })}

          {/* goal line + bold label */}
          {goalY !== null && model.goalKg !== null && (
            <g>
              <line
                x1={M.left}
                x2={M.left + innerW}
                y1={goalY}
                y2={goalY}
                strokeDasharray="6 4"
                className="stroke-muted-foreground"
              />
              <text
                x={M.left + innerW + 8}
                y={goalY}
                dy="0.32em"
                className="fill-foreground font-bold tabular-nums"
              >
                {formatKg(model.goalKg)}
              </text>
            </g>
          )}

          <g clipPath={`url(#${clipId})`}>
            {model.projection && (
              <line
                x1={sx(model.projection.from.day)}
                y1={sy(model.projection.from.kg)}
                x2={sx(model.projection.to.day)}
                y2={sy(model.projection.to.kg)}
                strokeDasharray="4 4"
                strokeWidth={2}
                className="stroke-primary opacity-60"
              />
            )}
            {model.line.length > 1 && (
              <path
                d={path}
                fill="none"
                strokeWidth={2}
                strokeLinejoin="round"
                className="stroke-primary"
              />
            )}
            {(showDots || model.visible.length === 1) &&
              model.visible.map((p) =>
                p === model.latest ? null : (
                  <circle
                    key={p.day}
                    cx={sx(p.day)}
                    cy={sy(p.kg)}
                    r={2.5}
                    className="fill-primary"
                  />
                )
              )}
            {model.latest && (
              <circle
                cx={sx(model.latest.day)}
                cy={sy(model.latest.kg)}
                r={5}
                strokeWidth={2}
                className="fill-background stroke-primary"
              />
            )}
          </g>

          {active && (
            <g pointerEvents="none">
              <line
                x1={sx(active.day)}
                x2={sx(active.day)}
                y1={M.top}
                y2={M.top + innerH}
                className="stroke-muted-foreground/50"
              />
              <circle
                cx={sx(active.day)}
                cy={sy(active.kg)}
                r={5}
                className="fill-primary"
              />
            </g>
          )}

          <rect
            x={M.left}
            y={0}
            width={innerW}
            height={HEIGHT - M.bottom}
            fill="transparent"
            className="touch-pan-y"
            onPointerMove={(e) =>
              e.pointerType === "mouse" && pick(e.clientX, e.currentTarget)
            }
            onPointerDown={(e) => pick(e.clientX, e.currentTarget)}
            onPointerLeave={(e) => e.pointerType === "mouse" && setActive(null)}
          />
        </svg>
      )}

      {active && width > 0 && (
        <div
          className="pointer-events-none absolute top-0 rounded-md border bg-popover px-2 py-1 text-xs whitespace-nowrap text-popover-foreground shadow-sm"
          style={{
            left: Math.min(Math.max(sx(active.day), 70), width - 70),
            transform: "translateX(-50%)",
          }}
        >
          <div className="text-muted-foreground">
            {formatEntryDate(fromDay(active.day))}
          </div>
          <div className="font-semibold tabular-nums">
            {formatKg(active.kg)} kg
          </div>
        </div>
      )}

      {model.visible.length === 0 && entries.length > 0 && (
        <p className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
          No weigh-ins in this range
        </p>
      )}
    </div>
  )
}
