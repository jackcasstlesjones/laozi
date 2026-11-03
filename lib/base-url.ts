type UrlEnv = {
  VERCEL_ENV?: string
  VERCEL_URL?: string
  VERCEL_BRANCH_URL?: string
  BETTER_AUTH_URL?: string
}

/** The origin the server should build auth URLs from. Never read BETTER_AUTH_URL directly. */
export function resolveBaseUrl(e: UrlEnv): string {
  if (e.VERCEL_ENV === "preview" && e.VERCEL_URL)
    return `https://${e.VERCEL_URL}`
  if (e.BETTER_AUTH_URL) return e.BETTER_AUTH_URL
  if (e.VERCEL_URL) return `https://${e.VERCEL_URL}`
  return "http://localhost:3000"
}

export function resolveTrustedOrigins(e: UrlEnv): string[] {
  const origins = new Set([resolveBaseUrl(e)])
  if (e.VERCEL_URL) origins.add(`https://${e.VERCEL_URL}`)
  if (e.VERCEL_BRANCH_URL) origins.add(`https://${e.VERCEL_BRANCH_URL}`)
  return [...origins]
}
