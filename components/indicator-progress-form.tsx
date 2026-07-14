"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { X, Save, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface Goal {
  id: string;
  name: string;
  indicators?: any[];
}

export function IndicatorProgressForm({ goals = [] }: { goals?: Goal[] }) {
  const [loading, setLoading] = useState(false)
  const [selectedMainGoalId, setSelectedMainGoalId] = useState("")
  const [selectedIndicatorId, setSelectedIndicatorId] = useState("")
  
  const [formData, setFormData] = useState({
    q1: "0",
    q2: "0",
    q3: "0",
    q4: "0"
  })

  const selectedMainGoal = goals.find(g => g.id === selectedMainGoalId)
  const availableIndicators = selectedMainGoal?.indicators || []
  
  const selectedIndicator = availableIndicators.find((ind: any) => ind.id === selectedIndicatorId)

  useEffect(() => {
    setFormData({ q1: "0", q2: "0", q3: "0", q4: "0" })
  }, [selectedIndicator])

  const handleMainGoalChange = (val: string) => {
    setSelectedMainGoalId(val)
    setSelectedIndicatorId("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedIndicatorId) {
      toast.error("الرجاء اختيار المؤشر أولاً")
      return;
    }
    
    setLoading(true)
    
    // Simulate API call
    setTimeout(() => {
      toast.success("تم تحديث المؤشر بنجاح")
      setLoading(false)
    }, 800)
  }

  return (
    <Card className="shadow-lg border-t-4 border-t-primary rounded-2xl overflow-hidden bg-white/50 backdrop-blur-sm relative">
      <button className="absolute top-4 left-4 text-muted-foreground hover:text-foreground">
        <X className="w-5 h-5" />
      </button>

      <CardHeader className="bg-muted/10 border-b pb-4">
        <CardTitle className="text-xl font-bold">تعديل المؤشر</CardTitle>
        <CardDescription>تحديث تفاصيل المؤشر والأهداف</CardDescription>
      </CardHeader>
      
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>الهدف العام</Label>
              <Select value={selectedMainGoalId} onValueChange={handleMainGoalChange}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر الهدف العام" />
                </SelectTrigger>
                <SelectContent>
                  {goals.map(g => (
                    <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                  ))}
                  {goals.length === 0 && <SelectItem value="none" disabled>لا توجد أهداف رئيسية مضافة</SelectItem>}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>المؤشر</Label>
              <Select disabled={!selectedMainGoalId} value={selectedIndicatorId} onValueChange={setSelectedIndicatorId}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر المؤشر" />
                </SelectTrigger>
                <SelectContent>
                  {availableIndicators.map((ind: any) => (
                    <SelectItem key={ind.id} value={ind.id}>{ind.name}</SelectItem>
                  ))}
                  {availableIndicators.length === 0 && selectedMainGoalId && (
                    <SelectItem value="none" disabled>لا توجد مؤشرات لهذا الهدف</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>الوصف</Label>
            <Textarea 
              disabled
              value={selectedIndicator?.description || ""}
              placeholder="وصف المؤشر..."
              className="resize-none h-24 bg-muted/50 cursor-not-allowed"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label>وحدة القياس</Label>
              <Input 
                disabled
                value={selectedIndicator?.unit || ""}
                placeholder="%"
                className="bg-muted/50 cursor-not-allowed"
              />
            </div>
            <div className="space-y-2">
              <Label>قيمة الأساس</Label>
              <Input 
                disabled
                type="number"
                value={selectedIndicator?.baselineValue || ""}
                placeholder="0"
                className="bg-muted/50 cursor-not-allowed"
              />
            </div>
            <div className="space-y-2">
              <Label>القيمة المستهدفة</Label>
              <Input 
                disabled
                type="number"
                value={selectedIndicator?.targetValue || ""}
                placeholder="0"
                className="bg-muted/50 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="pt-4 border-t">
            <h3 className="font-semibold text-lg mb-4 text-primary">القيم الفعلية الفصلية</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>الربع الأول</Label>
                <Input 
                  type="number"
                  value={formData.q1}
                  onChange={(e) => setFormData({...formData, q1: e.target.value})}
                  disabled={!selectedIndicatorId}
                />
              </div>
              <div className="space-y-2">
                <Label>الربع الثاني</Label>
                <Input 
                  type="number"
                  value={formData.q2}
                  onChange={(e) => setFormData({...formData, q2: e.target.value})}
                  disabled={!selectedIndicatorId}
                />
              </div>
              <div className="space-y-2">
                <Label>الربع الثالث</Label>
                <Input 
                  type="number"
                  value={formData.q3}
                  onChange={(e) => setFormData({...formData, q3: e.target.value})}
                  disabled={!selectedIndicatorId}
                />
              </div>
              <div className="space-y-2">
                <Label>الربع الرابع</Label>
                <Input 
                  type="number"
                  value={formData.q4}
                  onChange={(e) => setFormData({...formData, q4: e.target.value})}
                  disabled={!selectedIndicatorId}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-6">
            <Button type="submit" disabled={loading || !selectedIndicatorId} className="bg-primary hover:bg-primary/90 px-8">
              {loading ? <Loader2 className="w-4 h-4 ml-2 animate-spin" /> : <Save className="w-4 h-4 ml-2" />}
              حفظ التعديلات
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
