"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { IndicatorCard } from "@/components/indicator-card"
import { CreateIndicatorDialog } from "@/components/create-indicator-dialog"
import { EditIndicatorDialog } from "@/components/edit-indicator-dialog"

export interface Indicator {
  id: string
  name: string
  description: string
  category: string
  unit: string
  target: number
  baseline: number
  q1: number
  q2: number
  q3: number
  q4: number
  status: "on-track" | "at-risk" | "off-track"
  year: string
}

export default function IndicatorsPage() {
  const [indicators, setIndicators] = useState<Indicator[]>([
    {
      id: "ind-1",
      name: "معدل رضا المرضى",
      description: "نسبة المرضى الذين يقيمون تجربتهم بأنها جيدة أو ممتازة",
      category: "الجودة",
      unit: "%",
      target: 90,
      baseline: 75,
      q1: 78,
      q2: 82,
      q3: 85,
      q4: 0,
      status: "on-track",
      year: "2025",
    },
    {
      id: "ind-2",
      name: "متوسط وقت الانتظار",
      description: "متوسط وقت انتظار المريض في قسم الطوارئ",
      category: "الكفاءة",
      unit: "دقيقة",
      target: 30,
      baseline: 45,
      q1: 42,
      q2: 38,
      q3: 35,
      q4: 0,
      status: "on-track",
      year: "2025",
    },
    {
      id: "ind-3",
      name: "ساعات تدريب الموظفين",
      description: "إجمالي ساعات التدريب لكل موظف سنوياً",
      category: "التطوير",
      unit: "ساعة",
      target: 40,
      baseline: 25,
      q1: 8,
      q2: 15,
      q3: 20,
      q4: 0,
      status: "at-risk",
      year: "2025",
    },
  ])

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [editingIndicator, setEditingIndicator] = useState<Indicator | null>(null)

  const categories = Array.from(new Set(indicators.map((ind) => ind.category)))

  const filteredIndicators = indicators.filter((indicator) => {
    const matchesSearch =
      indicator.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      indicator.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = !selectedCategory || indicator.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleCreateIndicator = (indicator: Omit<Indicator, "id">) => {
    const newIndicator: Indicator = {
      ...indicator,
      id: `ind-${Date.now()}`,
    }
    setIndicators([...indicators, newIndicator])
    setShowCreateDialog(false)
  }

  const handleUpdateIndicator = (updatedIndicator: Indicator) => {
    setIndicators(indicators.map((ind) => (ind.id === updatedIndicator.id ? updatedIndicator : ind)))
    setEditingIndicator(null)
  }

  const handleDeleteIndicator = (id: string) => {
    setIndicators(indicators.filter((ind) => ind.id !== id))
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-balance">خطة المؤشرات</h1>
            <p className="text-muted-foreground mt-1">تتبع وإدارة مؤشرات الأداء الاستراتيجية</p>
          </div>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            مؤشر جديد
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="البحث عن المؤشرات..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(null)}
            >
              الكل
            </Button>
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid gap-4">
          {filteredIndicators.map((indicator) => (
            <IndicatorCard
              key={indicator.id}
              indicator={indicator}
              onEdit={setEditingIndicator}
              onDelete={handleDeleteIndicator}
            />
          ))}
          {filteredIndicators.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">لم يتم العثور على مؤشرات</p>
            </div>
          )}
        </div>
      </div>

      <CreateIndicatorDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onCreateIndicator={handleCreateIndicator}
      />

      {editingIndicator && (
        <EditIndicatorDialog
          open={!!editingIndicator}
          onOpenChange={(open) => !open && setEditingIndicator(null)}
          indicator={editingIndicator}
          onUpdateIndicator={handleUpdateIndicator}
        />
      )}
    </DashboardLayout>
  )
}
