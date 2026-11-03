import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { getSession } from "@/lib/session"
import { LoginForm } from "./login-form"

export const metadata: Metadata = { title: "Log in · Laozi" }

export default async function LoginPage() {
  if (await getSession()) redirect("/food")
  return (
    <main className="flex min-h-svh items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <h1 className="mb-6 text-center font-heading text-2xl font-semibold tracking-tight">
          Laozi
        </h1>
        <LoginForm />
      </div>
    </main>
  )
}
