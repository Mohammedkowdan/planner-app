"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { ChevronLeft, ChevronRight, Calendar, Search, Plus, Menu, Settings, HelpCircle } from "lucide-react"
import { CreateActivityDialog } from "@/components/create-activity-dialog"

interface DBActivity {
    id: string
    name: string
    project: string | null
    startDate: string | Date
    endDate: string | Date
    duration: number
    color: string | null
    status: string
}

interface Activity extends DBActivity {
    visible: boolean
}

const arabicMonths = [
    "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
    "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر",
]

const arabicDays = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"]

export function TimelineClient({ initialActivities }: { initialActivities: DBActivity[] }) {
    const [currentDate, setCurrentDate] = useState(new Date())
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")

    const [activities, setActivities] = useState<Activity[]>(
        initialActivities.map(a => ({ ...a, visible: true }))
    )

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
            const startStr = new Date(activity.startDate).toISOString().split('T')[0]
            const endStr = new Date(activity.endDate).toISOString().split('T')[0]
            return activity.visible && (startStr === dateStr || endStr === dateStr)
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

    const handleCreateActivity = (activity: any) => {
        // Logic for creating via server action should be handled in dialog
        // For now, let's refresh or optimistically update
        console.log("Activity created:", activity)
        setIsCreateDialogOpen(false)
        window.location.reload() // Simple refresh to get new data
    }

    const today = new Date()
    const isToday = (day: number) => {
        return day === today.getDate() && month === today.getMonth() && year === today.getFullYear()
    }

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
                                <div className="grid grid-cols-7 border-b sticky top-0 bg-background z-10">
                                    {arabicDays.map((day, index) => (
                                        <div key={index} className="p-3 text-center text-sm font-medium text-muted-foreground border-l">
                                            {day}
                                        </div>
                                    ))}
                                </div>

                                <div className="grid grid-cols-7" style={{ gridAutoRows: "120px" }}>
                                    {calendarDays.map((day, index) => {
                                        const dayActivities = day ? getActivitiesForDate(day) : []

                                        return (
                                            <div
                                                key={index}
                                                className={`border-b border-l p-2 ${!day ? "bg-muted/30" : ""
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
                                                                    className={`${activity.color || 'bg-primary'} text-white text-[10px] px-1 py-0.5 rounded truncate cursor-pointer hover:opacity-90`}
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
                                <div className="grid grid-cols-7 gap-1 mb-2">
                                    {["ح", "ن", "ث", "ر", "خ", "ج", "س"].map((day, i) => (
                                        <div key={i} className="text-center text-[10px] font-medium text-muted-foreground">
                                            {day}
                                        </div>
                                    ))}
                                </div>
                                <div className="grid grid-cols-7 gap-1">
                                    {getMiniCalendarDays().map((day, index) => (
                                        <div
                                            key={index}
                                            className={`aspect-square flex items-center justify-center text-[10px] rounded-full ${!day
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

                        <Button className="w-full bg-primary hover:bg-primary/90" onClick={() => setIsCreateDialogOpen(true)}>
                            <Plus className="w-4 h-4 ml-2" />
                            إضافة نشاط
                        </Button>

                        <Card className="flex-1">
                            <CardHeader className="pb-3 px-4">
                                <div className="flex items-center gap-2">
                                    <Search className="w-4 h-4 text-muted-foreground" />
                                    <CardTitle className="text-sm font-semibold">تصفية الأنشطة</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4 px-4 overflow-y-auto max-h-[300px]">
                                <div className="space-y-2">
                                    {activities.map((activity) => (
                                        <div key={activity.id} className="flex items-center gap-3 py-1.5 hover:bg-muted/50 rounded-lg px-2 transition-colors">
                                            <Checkbox
                                                id={`visibility-${activity.id}`}
                                                checked={activity.visible}
                                                onCheckedChange={() => toggleActivityVisibility(activity.id)}
                                            />
                                            <label
                                                htmlFor={`visibility-${activity.id}`}
                                                className="text-xs font-medium truncate flex-1 cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                title={activity.name}
                                            >
                                                {activity.name}
                                            </label>
                                            <div className={`w-2 h-2 rounded-full ${activity.color || 'bg-primary'}`} />
                                        </div>
                                    ))}
                                </div>

                                {activities.length === 0 && (
                                    <p className="text-sm text-muted-foreground text-center py-8 bg-gray-50 rounded-lg border border-dashed">
                                        لا توجد أنشطة لهذا القسم
                                    </p>
                                )}
                            </CardContent>
                        </Card>
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
