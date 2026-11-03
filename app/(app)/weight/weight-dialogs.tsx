"use client"

import { Check, Copy, Download } from "lucide-react"
import { useState, useTransition } from "react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { formatEntryDate } from "@/lib/weight/dates"
import { buildExportMarkdown } from "@/lib/weight/export"
import { formatKg } from "@/lib/weight/kg"
import type { Settings } from "@/lib/settings/queries"
import type { WeighInRow } from "@/lib/weight/queries"
import { deleteWeighIn, saveWeighIn } from "./actions"

function FormError({ message }: { message: string | null }) {
  if (!message) return null
  return (
    <p role="alert" className="text-sm text-destructive">
      {message}
    </p>
  )
}

export function WeighInDialog({
  open,
  entry,
  today,
  onClose,
}: {
  open: boolean
  entry: WeighInRow | null
  today: string
  onClose: () => void
}) {
  const [date, setDate] = useState(entry?.date ?? today)
  const [weight, setWeight] = useState(entry ? String(entry.weightKg) : "")
  const [error, setError] = useState<string | null>(null)
  const [conflict, setConflict] = useState<{
    date: string
    weightKg: number
  } | null>(null)
  const [pending, startTransition] = useTransition()

  function submit(replace: boolean) {
    setError(null)
    startTransition(async () => {
      const res = await saveWeighIn({
        id: entry?.id,
        date,
        weightKg: weight,
        replace,
        today,
      })
      if (res.ok) {
        setConflict(null)
        onClose()
      } else if ("conflict" in res) setConflict(res.conflict)
      else {
        setConflict(null)
        setError(res.error)
      }
    })
  }

  return (
    <>
      <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
        <DialogContent>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              submit(false)
            }}
            className="flex flex-col gap-4"
          >
            <DialogHeader>
              <DialogTitle>
                {entry ? "Edit weigh-in" : "Record weight"}
              </DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-2">
              <Label htmlFor="weigh-in-date">Date</Label>
              <Input
                id="weigh-in-date"
                type="date"
                value={date}
                max={today}
                required
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="weigh-in-kg">Weight (kg)</Label>
              <Input
                id="weigh-in-kg"
                type="number"
                inputMode="decimal"
                step="0.1"
                placeholder="85.6"
                value={weight}
                autoFocus
                onChange={(e) => setWeight(e.target.value)}
              />
            </div>
            <FormError message={error} />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={pending}>
                Save
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={conflict !== null}
        onOpenChange={(o) => !o && setConflict(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Replace weigh-in?</AlertDialogTitle>
            <AlertDialogDescription>
              {conflict &&
                `${formatEntryDate(conflict.date)} already has ${formatKg(conflict.weightKg)} kg. Replace it with ${formatKg(Number(weight))} kg?`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction disabled={pending} onClick={() => submit(true)}>
              Replace
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export function DeleteDialog({
  entry,
  onClose,
}: {
  entry: WeighInRow | null
  onClose: () => void
}) {
  const [pending, startTransition] = useTransition()
  return (
    <AlertDialog open={entry !== null} onOpenChange={(o) => !o && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete weigh-in?</AlertDialogTitle>
          <AlertDialogDescription>
            {entry &&
              `${formatEntryDate(entry.date)}, ${formatKg(entry.weightKg)} kg. This can't be undone.`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={pending}
            onClick={() =>
              entry &&
              startTransition(async () => {
                await deleteWeighIn(entry.id)
                onClose()
              })
            }
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export function ExportDialog({
  entries,
  goal,
}: {
  entries: WeighInRow[]
  goal: Settings
}) {
  const [copied, setCopied] = useState(false)
  const markdown = buildExportMarkdown(entries, goal)

  async function copy() {
    await navigator.clipboard.writeText(markdown)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Dialog>
      <DialogTrigger render={<Button variant="outline" />}>
        <Download data-icon="inline-start" />
        Export
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Export</DialogTitle>
          <DialogDescription>
            Markdown of your goal and every weigh-in, ready to paste into
            Claude.
          </DialogDescription>
        </DialogHeader>
        <Textarea
          readOnly
          value={markdown}
          className="h-64 font-mono text-xs"
        />
        <DialogFooter>
          <Button onClick={copy}>
            {copied ? (
              <Check data-icon="inline-start" />
            ) : (
              <Copy data-icon="inline-start" />
            )}
            {copied ? "Copied" : "Copy"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
