"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"

/** Keeps the tz cookie in step with the browser so the server knows the local date. */
export function TimeZoneCookie({ current }: { current: string | undefined }) {
  const router = useRouter()
  useEffect(() => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
    if (tz && tz !== current) {
      document.cookie = `tz=${encodeURIComponent(tz)}; path=/; max-age=31536000; samesite=lax`
      router.refresh()
    }
  }, [current, router])
  return null
}
