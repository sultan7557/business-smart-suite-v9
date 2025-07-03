// "use client"
// import { ThemeProvider as NextThemesProvider } from "next-themes"
// import type { ThemeProviderProps } from "next-themes"

// export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
//   return <NextThemesProvider {...props}>{children}</NextThemesProvider>
// }

"use client"

import { createContext, useEffect, useState, ReactNode } from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch by only rendering theme content after client-side mount
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <>{children}</>
  }

  return (
    <NextThemesProvider attribute="class" defaultTheme="light" enableSystem={false}>
      {children}
    </NextThemesProvider>
  )
}