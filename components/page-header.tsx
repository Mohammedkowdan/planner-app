import { LucideIcon } from "lucide-react"

interface PageHeaderProps {
  title: React.ReactNode
  description?: React.ReactNode
  icon?: LucideIcon
  actions?: React.ReactNode
}

export function PageHeader({ title, description, icon: Icon, actions }: PageHeaderProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-blue-600 p-8 text-white shadow-lg mb-8">
      <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid-pattern.svg')] opacity-10"></div>
      <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">{title}</h1>
          {description && (
            <div className="text-blue-100 max-w-2xl text-lg font-light">
              {description}
            </div>
          )}
        </div>
        <div className="flex items-center gap-4">
          {actions}
          {Icon && (
            <div className="hidden md:block">
              <span className="text-6xl opacity-20"><Icon /></span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
