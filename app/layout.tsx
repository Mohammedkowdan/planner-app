"use client"

import type React from "react"
import { useEffect } from "react"
import { Cairo } from 'next/font/google'
import { Analytics } from "@vercel/analytics/next"
import { OrganizationProvider } from "@/contexts/organization-context"
import { initializeDefaultData, removeYears2026And2027 } from "@/lib/storage"
import "./globals.css"

const cairo = Cairo({ subsets: ["arabic", "latin"] })

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  useEffect(() => {
    initializeDefaultData()
    removeYears2026And2027()
  }, [])

  return (
    <html lang="ar" dir="rtl">
      <head>
        <title>نظام إدارة الخطط - مؤسسة صله للتنمية</title>
        <meta name="description" content="نظام التخطيط الاستراتيجي وإدارة الأداء - مؤسسة صله للتنمية" />
        <meta name="generator" content="v0.app" />
      </head>
      <body className={`${cairo.className} antialiased`}>
        <OrganizationProvider>{children}</OrganizationProvider>
        <Analytics />
      </body>
    </html>
  )
}

export const metadata = {
      generator: 'v0.app'
    };
