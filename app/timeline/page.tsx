"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { ChevronLeft, ChevronRight, Calendar, Search, Plus, Menu, Settings, HelpCircle } from "lucide-react"
import { CreateActivityDialog } from "@/components/create-activity-dialog"

interface Activity {
  id: string
  name: string
  project: string
  department: string
  startDate: string
  endDate: string
  duration: number
  color: string
  visible: boolean
  status: "planned" | "in-progress" | "completed"
}

const arabicMonths = [
  "يناير",
  "فبراير",
  "مارس",
  "أبريل",
  "مايو",
  "يونيو",
  "يوليو",
  "أغسطس",
  "سبتمبر",
  "أكتوبر",
  "نوفمبر",
  "ديسمبر",
]

const arabicDays = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"]

export default function TimelinePage() {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 10, 1)) // November 2025
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const [activities, setActivities] = useState<Activity[]>([
    {
      id: "1",
      name: "Mohammed Kowdan",
      project: "التعليم",
      department: "التعليم",
      startDate: "2025-11-11",
      endDate: "2025-11-11",
      duration: 1,
      color: "bg-blue-500",
      visible: true,
      status: "completed",
    },
    {
      id: "2",
      name: "Advanced mobile application",
      project: "التطوير",
      department: "التقنية",
      startDate: "2025-11-27",
      endDate: "2025-11-27",
      duration: 1,
      color: "bg-blue-600",
      visible: true,
      status: "in-progress",
    },
    {
      id: "3",
      name: "Advanced mobile Application 2",
      project: "التطوير",
      department: "التقنية",
      startDate: "2025-11-15",
      endDate: "2025-11-15",
      duration: 1,
      color: "bg-purple-500",
      visible: true,
      status: "planned",
    },
    {
      id: "4",
      name: "Advanced Mobile Application 3",
      project: "التطوير",
      department: "التقنية",
      startDate: "2025-11-20",
      endDate: "2025-11-20",
      duration: 1,
      color: "bg-pink-500",
      visible: true,
      status: "in-progress",
    },
    {
      id: "5",
      name: "Database Administration I...",
      project: "قواعد البيانات",
      department: "التقنية",
      startDate: "2025-11-25",
      endDate: "2025-11-25",
      duration: 1,
      color: "bg-lime-500",
      visible: true,
      status: "planned",
    },
    {
      id: "6",
      name: "Mobile App. Dev (2nd peri...",
      project: "التطوير",
      department: "التقنية",
      startDate: "2025-11-28",
      endDate: "2025-11-28",
      duration: 1,
      color: "bg-pink-600",
      visible: true,
      status: "completed",
    },
  ])

  // Get days in month
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    return { daysInMonth, startingDayOfWeek, year, month }
  }

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentDate)

  // Create calendar grid
  const calendarDays = []
  const totalSlots = Math.ceil((daysInMonth + startingDayOfWeek) / 7) * 7

  for (let i = 0; i < totalSlots; i++) {
    if (i < startingDayOfWeek || i >= daysInMonth + startingDayOfWeek) {
      calendarDays.push(null)
    } else {
      calendarDays.push(i - startingDayOfWeek + 1)
    }
  }

  // Get activities for a specific date
  const getActivitiesForDate = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    return activities.filter((activity) => {
      return activity.visible && (activity.startDate === dateStr || activity.endDate === dateStr)
    })
  }

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const toggleActivityVisibility = (id: string) => {
    setActivities(activities.map((act) => (act.id === id ? { ...act, visible: !act.visible } : act)))
  }

  const handleCreateActivity = (activity: Omit<Activity, "id" | "visible">) => {
    const newActivity = {
      ...activity,
      id: String(activities.length + 1),
      visible: true,
    }
    setActivities([...activities, newActivity])
    setIsCreateDialogOpen(false)
  }

  const today = new Date()
  const isToday = (day: number) => {
    return day === today.getDate() && month === today.getMonth() && year === today.getFullYear()
  }

  // Mini calendar for sidebar
  const getMiniCalendarDays = () => {
    const days = []
    const totalSlots = Math.ceil((daysInMonth + startingDayOfWeek) / 7) * 7

    for (let i = 0; i < totalSlots; i++) {
      if (i < startingDayOfWeek || i >= daysInMonth + startingDayOfWeek) {
        days.push(null)
      } else {
        days.push(i - startingDayOfWeek + 1)
      }
    }
    return days
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col h-[calc(100vh-120px)]">
        <div className="flex items-center justify-between mb-4 pb-4 border-b">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-6 h-6 text-primary" />
              <h1 className="text-2xl font-semibold">التزمين</h1>
            </div>

            <Button variant="outline" size="sm" onClick={goToToday}>
              اليوم
            </Button>

            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" onClick={goToPreviousMonth}>
                <ChevronRight className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={goToNextMonth}>
                <ChevronLeft className="w-5 h-5" />
              </Button>
            </div>

            <h2 className="text-xl font-medium">
              {arabicMonths[month]} {year}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="بحث"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10 w-64"
              />
            </div>
            <Button variant="ghost" size="icon">
              <HelpCircle className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Settings className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="flex gap-6 flex-1 overflow-hidden">
          <div className="flex-1 overflow-auto">
            <Card className="h-full">
              <CardContent className="p-0">
                {/* Days of week header */}
                <div className="grid grid-cols-7 border-b sticky top-0 bg-background z-10">
                  {arabicDays.map((day, index) => (
                    <div key={index} className="p-3 text-center text-sm font-medium text-muted-foreground border-l">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar grid */}
                <div className="grid grid-cols-7" style={{ gridAutoRows: "120px" }}>
                  {calendarDays.map((day, index) => {
                    const dayActivities = day ? getActivitiesForDate(day) : []

                    return (
                      <div
                        key={index}
                        className={`border-b border-l p-2 ${
                          !day ? "bg-muted/30" : ""
                        } ${isToday(day || 0) ? "bg-blue-50" : ""}`}
                      >
                        {day && (
                          <>
                            <div
                              className={`text-sm mb-1 ${isToday(day) ? "w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold" : "font-medium"}`}
                            >
                              {day}
                            </div>
                            <div className="space-y-1">
                              {dayActivities.map((activity) => (
                                <div
                                  key={activity.id}
                                  className={`${activity.color} text-white text-xs px-2 py-1 rounded truncate cursor-pointer hover:opacity-90`}
                                  title={activity.name}
                                >
                                  {activity.name}
                                </div>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="w-80 space-y-4 overflow-auto">
            {/* Mini Calendar */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={goToPreviousMonth}>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                  <CardTitle className="text-sm">
                    {arabicMonths[month]} {year}
                  </CardTitle>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={goToNextMonth}>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pb-3">
                {/* Mini calendar days header */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {["ح", "ن", "ث", "ر", "خ", "ج", "س"].map((day, i) => (
                    <div key={i} className="text-center text-xs font-medium text-muted-foreground">
                      {day}
                    </div>
                  ))}
                </div>
                {/* Mini calendar days grid */}
                <div className="grid grid-cols-7 gap-1">
                  {getMiniCalendarDays().map((day, index) => (
                    <div
                      key={index}
                      className={`aspect-square flex items-center justify-center text-xs rounded-full ${
                        !day
                          ? ""
                          : isToday(day)
                            ? "bg-primary text-primary-foreground font-semibold"
                            : "hover:bg-muted cursor-pointer"
                      }`}
                    >
                      {day}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Add button */}
            <Button className="w-full bg-primary hover:bg-primary/90" onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 ml-2" />
              إضافة
            </Button>

            {/* Activities/Tasks List */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-muted-foreground" />
                  <CardTitle className="text-sm">البحث عن جهات الاتصال</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-1">
                <div className="space-y-2">
                  {activities.map((activity) => (
                    <div key={activity.id} className="flex items-center gap-2 py-1 hover:bg-muted/50 rounded px-1">
                      <Checkbox
                        checked={activity.visible}
                        onCheckedChange={() => toggleActivityVisibility(activity.id)}
                        className={`border-2 data-[state=checked]:${activity.color.replace("bg-", "border-")}`}
                        style={{
                          backgroundColor: activity.visible ? activity.color.replace("bg-", "") : "transparent",
                        }}
                      />
                      <span className="text-sm truncate flex-1" title={activity.name}>
                        {activity.name}
                      </span>
                    </div>
                  ))}
                </div>

                {activities.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">لا توجد أنشطة</p>
                )}
              </CardContent>
            </Card>

            {/* Keyboard shortcuts hint */}
            <div className="text-xs text-muted-foreground text-center">keyboard_arrow_up تقويم</div>
          </div>
        </div>
      </div>

      <CreateActivityDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={handleCreateActivity}
      />
    </DashboardLayout>
  )
}
