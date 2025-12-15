"use client"

import { type ReactNode, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Building2, Calendar, Target, Briefcase, FileText, Settings, LogOut, Menu, X } from "lucide-react"
import { useOrganization } from "@/contexts/organization-context"
import Image from "next/image"

interface DashboardLayoutProps {
  children: ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { currentOrganization, clearOrganization } = useOrganization()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    clearOrganization()
    router.push("/organizations")
  }

  const navigation = [
    { name: "لوحة التحكم", href: "/dashboard", icon: Calendar },
    { name: "المؤشرات", href: "/indicators", icon: Target },
    { name: "البرامج", href: "/programs", icon: Briefcase },
    { name: "التقارير", href: "/reports", icon: FileText },
    { name: "الإعدادات", href: "/settings", icon: Settings },
  ]

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === href
    }
    return pathname?.startsWith(href)
  }

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-white shadow-md">
        <div className="container flex h-20 items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <button className="lg:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <div className="flex items-center gap-4">
              <Image
                src="/selah-logo.jpg"
                alt="شعار مؤسسة صله للتنمية"
                width={140}
                height={56}
                className="object-contain"
                priority
              />
              <div className="hidden sm:block w-px h-12 bg-gray-300" />
              <Image
                src="/planflow-logo.png"
                alt="PlanFlow Logo"
                width={140}
                height={42}
                className="object-contain hidden sm:block"
                priority
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted border">
              <Building2 className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">{currentOrganization?.name || "لا توجد منظمة"}</span>
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        <aside className="hidden lg:flex w-64 flex-col border-l bg-card shadow-sm">
          <nav className="flex-1 space-y-1 p-4">
            {navigation.map((item) => (
              <button
                key={item.name}
                onClick={() => router.push(item.href)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive(item.href)
                    ? "bg-gradient-to-l from-secondary to-secondary/90 text-white shadow-md"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </button>
            ))}
          </nav>
        </aside>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-40 bg-background/80 backdrop-blur-sm">
            <aside className="fixed left-0 top-16 bottom-0 w-64 bg-card border-r">
              <nav className="space-y-1 p-4">
                {navigation.map((item) => (
                  <button
                    key={item.name}
                    onClick={() => {
                      router.push(item.href)
                      setMobileMenuOpen(false)
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive(item.href)
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.name}
                  </button>
                ))}
              </nav>
            </aside>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>

      <footer className="bg-card border-t py-4 mt-auto">
        <div className="container mx-auto px-4">
          <p className="text-center text-sm text-muted-foreground">
            © 2025 مؤسسة صله للتنمية - Selah Foundation for Development
          </p>
        </div>
      </footer>
    </div>
  )
}
