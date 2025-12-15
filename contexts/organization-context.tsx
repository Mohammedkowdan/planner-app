"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface Organization {
  id: string
  name: string
  description: string
}

interface OrganizationContextType {
  currentOrganization: Organization | null
  setOrganization: (org: Organization) => void
  clearOrganization: () => void
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined)

const organizations = [
  { id: "org-1", name: "المكتب الرئيسي", description: "المقر الرئيسي للمؤسسة" },
  { id: "org-2", name: "فرع دوعن", description: "فرع دوعن الإقليمي" },
  { id: "org-3", name: "فرع عدن", description: "فرع عدن الإقليمي" },
]

export function OrganizationProvider({ children }: { children: ReactNode }) {
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null)

  useEffect(() => {
    // Load organization from localStorage
    const storedOrgId = localStorage.getItem("selectedOrganization")
    if (storedOrgId) {
      const org = organizations.find((o) => o.id === storedOrgId)
      if (org) {
        setCurrentOrganization(org)
      }
    }
  }, [])

  const setOrganization = (org: Organization) => {
    setCurrentOrganization(org)
    localStorage.setItem("selectedOrganization", org.id)
  }

  const clearOrganization = () => {
    setCurrentOrganization(null)
    localStorage.removeItem("selectedOrganization")
  }

  return (
    <OrganizationContext.Provider value={{ currentOrganization, setOrganization, clearOrganization }}>
      {children}
    </OrganizationContext.Provider>
  )
}

export function useOrganization() {
  const context = useContext(OrganizationContext)
  if (context === undefined) {
    throw new Error("useOrganization must be used within an OrganizationProvider")
  }
  return context
}
