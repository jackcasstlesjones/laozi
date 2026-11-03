"use client"

import { useState, useTransition } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Settings } from "@/lib/settings/queries"
import { saveCalorieLimit, saveGoal, type SettingsResult } from "./actions"

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
        step="0.1"
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
