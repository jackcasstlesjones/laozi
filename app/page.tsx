import { redirect } from "next/navigation"

import { getSettings } from "@/lib/settings/queries"
import { requireSession } from "@/lib/session"
import { tabHref } from "@/lib/tabs"

/** The landing page is whichever tab comes first. */
export default async function Home() {
  await requireSession()
  const { tabOrder } = await getSettings()
  redirect(tabHref(tabOrder[0]))
}
