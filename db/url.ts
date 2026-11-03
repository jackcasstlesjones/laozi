/** Neon hands out `sslmode=require`; pg wants the explicit, verifying mode. */
export function normaliseDatabaseUrl(url: string): string {
  return url.replace(/sslmode=require\b/, "sslmode=verify-full")
}
