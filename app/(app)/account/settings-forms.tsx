"use client"

import { ArrowDown, ArrowUp } from "lucide-react"
import { useState, useTransition } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Settings } from "@/lib/settings/queries"
import { moveTab, TAB_LABELS, type TabId } from "@/lib/tabs"
import {
  saveCalorieLimit,
  saveGoal,
  saveTabOrder,
  type SettingsResult,
} from "./actions"

/** Empty input → null (setting cleared). */
const orNull = (v: FormDataEntryValue | null) =>
  v === null || String(v).trim() === "" ? null : String(v)

function useSave() {
  const [status, setStatus] = useState<{ ok: boolean; message: string } | null>(
    null
  )
  const [pending, startTransition] = useTransition()
  const save = (action: () => Promise<SettingsResult>) =>
    startTransition(async () => {
      const res = await action()
      setStatus(
        res.ok
          ? { ok: true, message: "Saved" }
          : { ok: false, message: res.error }
      )
    })
  return { status, pending, save }
}

function Status({
  status,
}: {
  status: { ok: boolean; message: string } | null
}) {
  if (!status) return null
  return (
    <p
      role="status"
      className={
        status.ok ? "text-sm text-muted-foreground" : "text-sm text-destructive"
      }
    >
      {status.message}
    </p>
  )
}

function Field({
  id,
  label,
  hint,
  ...input
}: React.ComponentProps<typeof Input> & { label: string; hint?: string }) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} name={id} inputMode="decimal" type="number" {...input} />
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}

export function GoalForm({ settings }: { settings: Settings }) {
  const { status, pending, save } = useSave()
  return (
    <form
      className="flex flex-col gap-4"
      action={(form) =>
        save(() =>
          saveGoal({
            goalKg: orNull(form.get("goalKg")),
            rateKgPerWeek: form.get("rateKgPerWeek"),
          })
        )
      }
    >
      <Field
        id="goalKg"
        label="Goal weight (kg)"
        step="0.05"
        defaultValue={settings.goalKg ?? ""}
        hint="Leave empty to hide the goal and projection lines."
      />
      <Field
        id="rateKgPerWeek"
        label="Target rate (kg per week)"
        step="0.05"
        required
        defaultValue={settings.rateKgPerWeek}
      />
      <Status status={status} />
      <Button type="submit" disabled={pending} className="self-start">
        Save goal
      </Button>
    </form>
  )
}

export function CalorieLimitForm({ settings }: { settings: Settings }) {
  const { status, pending, save } = useSave()
  return (
    <form
      className="flex flex-col gap-4"
      action={(form) =>
        save(() =>
          saveCalorieLimit({
            dailyKcalLimit: orNull(form.get("dailyKcalLimit")),
          })
        )
      }
    >
      <Field
        id="dailyKcalLimit"
        label="Daily limit (kcal)"
        step="1"
        inputMode="numeric"
        defaultValue={settings.dailyKcalLimit ?? ""}
        hint="Shown against today's total on the Food tab. Leave empty for no limit."
      />
      <Status status={status} />
      <Button type="submit" disabled={pending} className="self-start">
        Save limit
      </Button>
    </form>
  )
}

export function TabOrderForm({ settings }: { settings: Settings }) {
  const { status, pending, save } = useSave()
  const [order, setOrder] = useState<TabId[]>(settings.tabOrder)
  const move = (index: number, direction: -1 | 1) => {
    const next = moveTab(order, index, direction)
    setOrder(next)
    save(() => saveTabOrder({ tabOrder: next }))
  }
  return (
    <div className="flex flex-col gap-4">
      <ol className="flex flex-col divide-y rounded-lg border">
        {order.map((id, i) => (
          <li key={id} className="flex items-center gap-2 py-1 pr-1 pl-3">
            <span className="w-4 text-sm text-muted-foreground tabular-nums">
              {i + 1}
            </span>
            <span className="flex-1 text-sm font-medium">{TAB_LABELS[id]}</span>
            <Button
              variant="ghost"
              size="icon"
              aria-label={`Move ${TAB_LABELS[id]} up`}
              disabled={pending || i === 0}
              onClick={() => move(i, -1)}
            >
              <ArrowUp />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label={`Move ${TAB_LABELS[id]} down`}
              disabled={pending || i === order.length - 1}
              onClick={() => move(i, 1)}
            >
              <ArrowDown />
            </Button>
          </li>
        ))}
      </ol>
      <Status status={status} />
    </div>
  )
}
