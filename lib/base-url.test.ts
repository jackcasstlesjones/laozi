import { describe, expect, it } from "vitest"

import { resolveBaseUrl, resolveTrustedOrigins } from "./base-url"

describe("resolveBaseUrl", () => {
  it("uses BETTER_AUTH_URL in production", () => {
    expect(
      resolveBaseUrl({
        VERCEL_ENV: "production",
        VERCEL_URL: "x.vercel.app",
        BETTER_AUTH_URL: "https://laozi.app",
      })
    ).toBe("https://laozi.app")
  })
  it("uses the deployment URL on previews", () => {
    expect(
      resolveBaseUrl({
        VERCEL_ENV: "preview",
        VERCEL_URL: "p.vercel.app",
        BETTER_AUTH_URL: "https://laozi.app",
      })
    ).toBe("https://p.vercel.app")
  })
  it("falls back to localhost", () => {
    expect(resolveBaseUrl({})).toBe("http://localhost:3000")
  })
  it("trusts the deployment and branch URLs", () => {
    expect(
      resolveTrustedOrigins({
        VERCEL_ENV: "preview",
        VERCEL_URL: "p.vercel.app",
        VERCEL_BRANCH_URL: "b.vercel.app",
      })
    ).toEqual(["https://p.vercel.app", "https://b.vercel.app"])
  })
})
