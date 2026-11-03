import type { Metadata } from "next"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { getSettings } from "@/lib/settings/queries"
import { requireSession } from "@/lib/session"
import { ChangePasswordForm, SignOutButton } from "./account-forms"
import { CalorieLimitForm, GoalForm } from "./settings-forms"

export const metadata: Metadata = { title: "Settings · Laozi" }

const SECTIONS = [
  {
    title: "Goal",
    description: "Drives the goal and projection lines on the weight chart.",
    form: GoalForm,
  },
  {
    title: "Daily calorie limit",
    description: "Today's total on the Food tab is shown against it.",
    form: CalorieLimitForm,
  },
] as const

export default async function AccountPage() {
  const [session, settings] = await Promise.all([
    requireSession(),
    getSettings(),
  ])
  return (
    <div className="mx-auto flex max-w-md flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="font-heading text-xl font-semibold tracking-tight">
            Settings
          </h1>
          <p className="truncate text-sm text-muted-foreground">
            {session.user.email}
          </p>
        </div>
        <SignOutButton />
      </div>
      {SECTIONS.map(({ title, description, form: Form }) => (
        <Card key={title}>
          <CardHeader>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          <CardContent>
            <Form settings={settings} />
          </CardContent>
        </Card>
      ))}
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
