import type { Metadata } from "next"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { requireSession } from "@/lib/session"
import { ChangePasswordForm, SignOutButton } from "./account-forms"

export const metadata: Metadata = { title: "Account · Laozi" }

export default async function AccountPage() {
  const session = await requireSession()
  return (
    <div className="mx-auto flex max-w-md flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="font-heading text-xl font-semibold tracking-tight">
            Account
          </h1>
          <p className="truncate text-sm text-muted-foreground">
            {session.user.email}
          </p>
        </div>
        <SignOutButton />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Change password</CardTitle>
          <CardDescription>This logs you out everywhere else.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChangePasswordForm />
        </CardContent>
      </Card>
    </div>
  )
}
