import type { Metadata } from "next"

import { requireSession } from "@/lib/session"
import { getSettings } from "@/lib/settings/queries"
import { listWeighIns } from "@/lib/weight/queries"
import { WeightView } from "./weight-view"

export const metadata: Metadata = { title: "Weight · Laozi" }

export default async function WeightPage() {
  await requireSession()
  const [entries, goal] = await Promise.all([listWeighIns(), getSettings()])
  return <WeightView entries={entries} goal={goal} />
}
