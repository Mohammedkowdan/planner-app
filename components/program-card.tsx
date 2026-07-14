"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Pencil, Trash2, Calendar, Target, DollarSign, Wallet, CheckCircle2, Circle, Clock } from "lucide-react"
import type { Program, Initiative } from "@/components/programs/programs-client-page"

interface ProgramCardProps {
  program: Program
  onEdit: (program: Program) => void
  onDelete: (id: string) => void
}

export function ProgramCard({ program, onEdit, onDelete }: ProgramCardProps) {
  const budgetPercentage = (program.spent / program.budget) * 100

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-success/10 text-success"
      case "planning":
        return "bg-chart-3/10 text-chart-3"
      case "completed":
        return "bg-primary/10 text-primary"
      case "on-hold":
        return "bg-warning/10 text-warning"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getInitiativeIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-4 h-4 text-success" />
      case "in-progress":
        return <Clock className="w-4 h-4 text-warning" />
      case "pending":
        return <Circle className="w-4 h-4 text-muted-foreground" />
      default:
        return <Circle className="w-4 h-4 text-muted-foreground" />
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2">
              <CardTitle>{program.name}</CardTitle>
              <Badge variant="outline" className="text-xs">
                {program.department}
              </Badge>
            </div>
            <CardDescription>{program.description}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={getStatusColor(program.status)}>{program.status}</Badge>
            <Button variant="ghost" size="icon" onClick={() => onEdit(program)}>
              <Pencil className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onDelete(program.id)}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <DollarSign className="w-4 h-4" />
              <span>Budget</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  ${program.spent.toLocaleString()} / ${program.budget.toLocaleString()}
                </span>
                <span className="font-semibold">{budgetPercentage.toFixed(0)}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${budgetPercentage > 90 ? "bg-destructive" : "bg-secondary"
                    }`}
                  style={{ width: `${Math.min(budgetPercentage, 100)}%` }}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>Timeline</span>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Start</span>
                <span className="font-medium">{new Date(program.startDate).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">End</span>
                <span className="font-medium">{new Date(program.endDate).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Overall Progress</span>
            <span className="font-semibold">{program.progress}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${program.progress}%` }} />
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-semibold">Key Initiatives</h4>
          <div className="space-y-2">
            {program.initiatives.map((initiative) => (
              <div key={initiative.id} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                <div className="flex items-center gap-2">
                  {getInitiativeIcon(initiative.status)}
                  <span className="text-sm">{initiative.name}</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(initiative.dueDate).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
