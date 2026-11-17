"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { TAB_LABELS, tabHref, type TabId } from "@/lib/tabs"
import { cn } from "@/lib/utils"

export function NavTabs({ order }: { order: TabId[] }) {
  const pathname = usePathname()
  return (
    <nav className="flex h-full items-stretch gap-1">
      {order.map((id) => {
        const href = tabHref(id)
        const active = pathname.startsWith(href)
        return (
          <Link
            key={id}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center border-b-2 px-3 text-sm font-medium transition-colors",
              active
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {TAB_LABELS[id]}
          </Link>
        )
      })}
    </nav>
  )
}
