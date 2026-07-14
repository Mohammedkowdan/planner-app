import type React from "react"
import { Cairo } from 'next/font/google'
import { Analytics } from "@vercel/analytics/next"
import { Providers } from "./providers"
import "./globals.css"

const cairo = Cairo({ subsets: ["arabic", "latin"] })

export const metadata = {
  title: "نظام إدارة الخطط - مؤسسة صله للتنمية",
  description: "نظام التخطيط الاستراتيجي وإدارة الأداء - مؤسسة صله للتنمية",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className={`${cairo.className} antialiased`}>
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  )
}


