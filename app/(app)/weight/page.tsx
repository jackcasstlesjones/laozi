import type { Metadata } from "next"

import { requireSession } from "@/lib/session"
import { getGoal, listWeighIns } from "@/lib/weight/queries"
import { WeightView } from "./weight-view"

export const metadata: Metadata = { title: "Weight · Laozi" }

export default async function WeightPage() {
  await requireSession()
  const [entries, goal] = await Promise.all([listWeighIns(), getGoal()])
  return <WeightView entries={entries} goal={goal} />
}
