import { UserRound } from "lucide-react"
import { cookies } from "next/headers"
import Link from "next/link"

import { TimeZoneCookie } from "@/components/time-zone-cookie"
import { buttonVariants } from "@/components/ui/button"
import { TZ_COOKIE } from "@/lib/food/today"
import { requireSession } from "@/lib/session"
import { NavTabs } from "./nav-tabs"

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireSession()
  const tz = (await cookies()).get(TZ_COOKIE)?.value
  return (
    <div className="min-h-svh">
      <TimeZoneCookie current={tz} />
      <header className="sticky top-0 z-10 border-b bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4">
          <Link
            href="/weight"
            className="font-heading text-lg font-semibold tracking-tight"
          >
            Laozi
          </Link>
          <NavTabs />
          <Link
            href="/account"
            aria-label="Account settings"
            className={buttonVariants({
              variant: "ghost",
              size: "icon",
              className: "ml-auto",
            })}
          >
            <UserRound />
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  )
}
