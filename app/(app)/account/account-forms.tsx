"use client"

import { LogOut } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { changePasswordInput, MIN_PASSWORD } from "@/lib/account"
import { authClient } from "@/lib/auth-client"

export function SignOutButton() {
  const router = useRouter()
  return (
    <Button
      variant="outline"
      onClick={async () => {
        await authClient.signOut()
        router.replace("/login")
        router.refresh()
      }}
    >
      <LogOut data-icon="inline-start" />
      Log out
    </Button>
  )
}

export function ChangePasswordForm() {
  const [status, setStatus] = useState<{
    kind: "error" | "success"
    message: string
  } | null>(null)
  const [pending, setPending] = useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formEl = e.currentTarget
    const parsed = changePasswordInput.safeParse(
      Object.fromEntries(new FormData(formEl))
    )
    if (!parsed.success) {
      setStatus({ kind: "error", message: parsed.error.issues[0].message })
      return
    }
    setPending(true)
    setStatus(null)
    const { error } = await authClient.changePassword({
      currentPassword: parsed.data.currentPassword,
      newPassword: parsed.data.newPassword,
      revokeOtherSessions: true,
    })
    setPending(false)
    if (error) {
      setStatus({
        kind: "error",
        message:
          error.status === 429
            ? "Too many attempts. Try again in a minute."
            : error.code === "INVALID_PASSWORD"
              ? "Current password is incorrect"
              : (error.message ?? "Couldn't change the password"),
      })
      return
    }
    formEl.reset()
    setStatus({
      kind: "success",
      message: "Password changed. Other sessions have been logged out.",
    })
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="currentPassword">Current password</Label>
        <Input
          id="currentPassword"
          name="currentPassword"
          type="password"
          autoComplete="current-password"
          required
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="newPassword">New password</Label>
        <Input
          id="newPassword"
          name="newPassword"
          type="password"
          autoComplete="new-password"
          minLength={MIN_PASSWORD}
          required
        />
        <p className="text-xs text-muted-foreground">
          At least {MIN_PASSWORD} characters.
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="confirmPassword">Confirm new password</Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
        />
      </div>
      {status && (
        <p
          role="status"
          className={
            status.kind === "error"
              ? "text-sm text-destructive"
              : "text-sm text-foreground"
          }
        >
          {status.message}
        </p>
      )}
      <Button type="submit" disabled={pending} className="self-start">
        {pending ? "Saving…" : "Change password"}
      </Button>
    </form>
  )
}
