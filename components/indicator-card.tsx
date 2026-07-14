"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Pencil, Trash2, TrendingUp, TrendingDown, Minus } from "lucide-react"
import type { Indicator } from "@/components/indicators/indicators-client-page"

interface IndicatorCardProps {
  indicator: Indicator
  onEdit: (indicator: Indicator) => void
  onDelete: (id: string) => void
}

export function IndicatorCard({ indicator, onEdit, onDelete }: IndicatorCardProps) {
  const currentProgress = (indicator.q1 + indicator.q2 + indicator.q3 + indicator.q4) / 4 || 0
  const progressPercentage = (currentProgress / indicator.target) * 100

  const getStatusColor = (status: string) => {
    switch (status) {
      case "on-track":
        return "bg-success/10 text-success"
      case "at-risk":
        return "bg-warning/10 text-warning"
      case "off-track":
        return "bg-destructive/10 text-destructive"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getTrendIcon = () => {
    const trend = currentProgress - indicator.baseline
    if (trend > 0) return <TrendingUp className="w-4 h-4 text-success" />
    if (trend < 0) return <TrendingDown className="w-4 h-4 text-destructive" />
    return <Minus className="w-4 h-4 text-muted-foreground" />
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2">
              <CardTitle>{indicator.name}</CardTitle>
              <Badge variant="outline" className="text-xs">
                {indicator.category}
              </Badge>
            </div>
            <CardDescription>{indicator.description}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={getStatusColor(indicator.status)}>{indicator.status}</Badge>
            <Button variant="ghost" size="icon" onClick={() => onEdit(indicator)}>
              <Pencil className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onDelete(indicator.id)}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Baseline</p>
            <p className="text-lg font-semibold">
              {indicator.baseline} {indicator.unit}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Q1</p>
            <p className="text-lg font-semibold">
              {indicator.q1 || "-"} {indicator.q1 ? indicator.unit : ""}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Q2</p>
            <p className="text-lg font-semibold">
              {indicator.q2 || "-"} {indicator.q2 ? indicator.unit : ""}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Q3</p>
            <p className="text-lg font-semibold">
              {indicator.q3 || "-"} {indicator.q3 ? indicator.unit : ""}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Q4</p>
            <p className="text-lg font-semibold">
              {indicator.q4 || "-"} {indicator.q4 ? indicator.unit : ""}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Progress to Target</span>
              {getTrendIcon()}
            </div>
            <span className="font-semibold">
              {currentProgress.toFixed(1)} / {indicator.target} {indicator.unit}
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all"
              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
