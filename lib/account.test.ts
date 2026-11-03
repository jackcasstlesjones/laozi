import { describe, expect, it } from "vitest"

import { changePasswordInput } from "./account"

const ok = {
  currentPassword: "old",
  newPassword: "abcdefghijkl",
  confirmPassword: "abcdefghijkl",
}

describe("changePasswordInput", () => {
  it("accepts a 12-character password that matches its confirmation", () => {
    expect(changePasswordInput.safeParse(ok).success).toBe(true)
  })
  it("rejects short passwords", () => {
    const r = changePasswordInput.safeParse({
      ...ok,
      newPassword: "short",
      confirmPassword: "short",
    })
    expect(r.error?.issues[0].message).toBe(
      "New password must be at least 12 characters"
    )
  })
  it("rejects a mismatched confirmation", () => {
    const r = changePasswordInput.safeParse({
      ...ok,
      confirmPassword: "abcdefghijkx",
    })
    expect(r.error?.issues[0].message).toBe("New passwords don't match")
  })
})
