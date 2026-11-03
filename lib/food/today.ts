import "server-only"
import { cookies } from "next/headers"

import { dateInTimeZone, DEFAULT_TIME_ZONE, isValidTimeZone } from "./log"

export const TZ_COOKIE = "tz"

/** Today's date in the browser's time zone (from the tz cookie). */
export async function getToday(): Promise<string> {
  const tz = (await cookies()).get(TZ_COOKIE)?.value
  return dateInTimeZone(
    new Date(),
    isValidTimeZone(tz) ? tz : DEFAULT_TIME_ZONE
  )
}
