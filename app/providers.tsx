"use client"

import type React from "react"
import { OrganizationProvider } from "@/contexts/organization-context"
import { Toaster } from "sonner"
import { ThemeProvider } from "next-themes"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <OrganizationProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        {children}
        <Toaster position="top-center" richColors />
      </ThemeProvider>
    </OrganizationProvider>
  )
}
