"use client"

import { useEffect, useId, useMemo, useRef, useState } from "react"

import {
  buildChart,
  crossfadeTicks,
  ease,
  lerp,
  lerpView,
  nearestPoint,
  projectionLine,
  sameView,
  viewOf,
  type ChartModel,
  type Entry,
  type Goal,
  type Point,
  type Range,
  type Tick,
  type View,
} from "@/lib/weight/chart"
import { formatEntryDate, fromDay, toDay } from "@/lib/weight/dates"
import { formatKg } from "@/lib/weight/kg"

const SIZES = {
  default: {
    height: 280,
    ticks: {},
    margin: { top: 12, right: 52, bottom: 28, left: 8 },
    xLabelInset: 8,
  },
  compact: {
    height: 72,
    ticks: { maxYTicks: 3, maxXTicks: 3, snapY: true },
    margin: { top: 6, right: 36, bottom: 20, left: 0 },
    xLabelInset: 2,
  },
}
const ANIMATION_MS = 500
/** Past the plot's right and bottom edges, so a marker on the edge isn't cut in half. */
const MARKER_ROOM = 7
/** Dots are too dense to read above this many visible entries. */
const MAX_DOTS = 45

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

function yTicksOf(model: ChartModel): Tick[] {
  const step = model.yTicks.length > 1 ? model.yTicks[1] - model.yTicks[0] : 1
  return model.yTicks.map((value) => ({
    value,
    label: step >= 1 ? String(Math.round(value)) : formatKg(value),
  }))
}

const showsDots = (model: ChartModel) => model.visible.length <= MAX_DOTS

export function WeightChart({
  entries,
  goal,
  range,
  today,
  size = "default",
}: {
  entries: Entry[]
  goal: Goal | null
  range: Range
  today: string
  size?: keyof typeof SIZES
}) {
  const { height: HEIGHT, ticks, margin: M, xLabelInset } = SIZES[size]
  const [ref, width] = useWidth()
  const clipId = useId()
  const [active, setActive] = useState<Point | null>(null)
  const model = useMemo(
    () => buildChart(entries, goal, range, toDay(today), ticks),
    [entries, goal, range, today, ticks]
  )

  // Changing range moves the scales from the view on screen to the new one, so
  // the same line slides and stretches rather than being redrawn.
  const [tween, setTween] = useState<{
    fromView: View
    from: ChartModel
    to: ChartModel
    t: number
  }>({ fromView: viewOf(model), from: model, to: model, t: 1 })
  const view = lerpView(tween.fromView, viewOf(tween.to), ease(tween.t))
  if (tween.to !== model) {
    setActive(null)
    setTween({
      fromView: view,
      from: tween.to,
      to: model,
      t: sameView(view, viewOf(model)) ? 1 : 0,
    })
  }
  const animating = tween.t < 1
  useEffect(() => {
    if (!animating) return
    const started = performance.now()
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches
    let frame = requestAnimationFrame(function step(now) {
      const t = reduced ? 1 : Math.min((now - started) / ANIMATION_MS, 1)
      setTween((current) => ({ ...current, t }))
      if (t < 1) frame = requestAnimationFrame(step)
    })
    return () => cancelAnimationFrame(frame)
  }, [animating, tween.to])
  const fade = ease(tween.t)

  const innerW = Math.max(0, width - M.left - M.right)
  const innerH = HEIGHT - M.top - M.bottom
  const sx = (day: number) =>
    M.left + ((day - view.start) / (view.end - view.start)) * innerW
  const sy = (kg: number) =>
    M.top + ((view.yMax - kg) / (view.yMax - view.yMin)) * innerH

  const goalY = model.goalKg !== null ? sy(model.goalKg) : null
  const yTicks = crossfadeTicks(
    yTicksOf(tween.from),
    yTicksOf(tween.to),
    fade
  ).filter(
    (t) =>
      sy(t.value) >= M.top &&
      sy(t.value) <= M.top + innerH &&
      (goalY === null || Math.abs(sy(t.value) - goalY) > 14)
  )
  const xTicks = crossfadeTicks(
    tween.from.xTicks,
    tween.to.xTicks,
    fade
  ).filter((t) => sx(t.value) >= M.left && sx(t.value) <= M.left + innerW)

  const path = model.points
    .map((p, i) => `${i ? "L" : "M"}${sx(p.day)},${sy(p.kg)}`)
    .join("")
  const dotOpacity = lerp(
    showsDots(tween.from) ? 1 : 0,
    showsDots(tween.to) ? 1 : 0,
    fade
  )
  const projection =
    model.latest && projectionLine(model.latest, goal, view.end)

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
                width={innerW + MARKER_ROOM}
                height={HEIGHT - M.bottom + MARKER_ROOM}
              />
            </clipPath>
          </defs>

          {/* y grid + labels (right) */}
          {yTicks.map((t) => (
            <g key={t.value} opacity={t.opacity}>
              <line
                x1={M.left}
                x2={M.left + innerW}
                y1={sy(t.value)}
                y2={sy(t.value)}
                className="stroke-border"
              />
              <text
                x={M.left + innerW + 8}
                y={sy(t.value)}
                dy="0.32em"
                className="fill-muted-foreground tabular-nums"
              >
                {t.label}
              </text>
            </g>
          ))}

          {/* x labels */}
          {xTicks.map((t) => {
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
                y={HEIGHT - xLabelInset}
                textAnchor={anchor}
                opacity={t.opacity}
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
            {projection && (
              <line
                x1={sx(projection.from.day)}
                y1={sy(projection.from.kg)}
                x2={sx(projection.to.day)}
                y2={sy(projection.to.kg)}
                strokeDasharray="4 4"
                strokeWidth={2}
                className="stroke-primary opacity-60"
              />
            )}
            {model.points.length > 1 && (
              <path
                d={path}
                fill="none"
                strokeWidth={2}
                strokeLinejoin="round"
                className="stroke-primary"
              />
            )}
            {dotOpacity > 0 &&
              model.points.map((p) =>
                p === model.latest ||
                p.day < view.start ||
                p.day > view.end ? null : (
                  <circle
                    key={p.day}
                    cx={sx(p.day)}
                    cy={sy(p.kg)}
                    r={2.5}
                    opacity={dotOpacity}
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
