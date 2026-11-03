import type { Metadata } from "next"

import { listDay } from "@/lib/food/queries"
import { getToday } from "@/lib/food/today"
import { requireSession } from "@/lib/session"
import { TodayView } from "./today-view"

export const metadata: Metadata = { title: "Today · Laozi" }

export default async function TodayPage() {
  await requireSession()
  const entries = await getToday().then(listDay)
  return <TodayView today={entries} />
}
