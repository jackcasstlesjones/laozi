"use client"

import { ThemeProvider as NextThemesProvider } from "next-themes"
import type * as React from "react"

/**
 * Light/dark always follows the system (prefers-color-scheme). There is no
 * toggle; a fresh storage key ignores any theme an earlier build saved.
 */
function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      storageKey="laozi-theme"
      {...props}
    >
      {children}
    </NextThemesProvider>
  )
}

export { ThemeProvider }
