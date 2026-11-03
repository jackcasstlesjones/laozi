import Link from "next/link"

import { buttonVariants } from "@/components/ui/button"

export default function NotFound() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-4 p-6 text-center">
      <p className="text-muted-foreground">That page doesn&apos;t exist.</p>
      <Link href="/food" className={buttonVariants({ variant: "outline" })}>
        Back to Laozi
      </Link>
    </main>
  )
}
