"use client"

import { useState } from "react"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday } from "date-fns"
import { arSA } from "date-fns/locale"
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Clock, Video } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createEvent, deleteEvent } from "@/actions/calendar"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface Event {
    id: string
    title: string
    description?: string
    date: Date
    type: string
}

export function FullCalendar({ initialEvents = [] }: { initialEvents?: any[] }) {
    const [currentMonth, setCurrentMonth] = useState(new Date())
    const [events, setEvents] = useState<Event[]>(initialEvents.map((e: any) => ({
        ...e,
        date: new Date(e.date)
    })))

    // Dialog States
    const [showAddDialog, setShowAddDialog] = useState(false)
    const [selectedDate, setSelectedDate] = useState<Date | null>(null)
    const [newEventTitle, setNewEventTitle] = useState("")
    const [newEventDesc, setNewEventDesc] = useState("")
    const [newEventType, setNewEventType] = useState("EVENT")
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Event Viewer
    const [showEventDialog, setShowEventDialog] = useState(false)
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)

    const days = eachDayOfInterval({
        start: startOfMonth(currentMonth),
        end: endOfMonth(currentMonth)
    })

    // Padding days for grid alignment (starts on Saturday for Arabic usually, but let's stick to standard grid then adjust if needed, mostly Sunday start matches standard calendars)
    // Changing start day to Saturday would require more logic changes. Keeping Sunday start for now but with Arabic labels.
    const startDay = startOfMonth(currentMonth).getDay()
    const paddingDays = Array(startDay).fill(null)

    const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1))
    const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1))
    const handleToday = () => setCurrentMonth(new Date())

    const handleDateClick = (date: Date) => {
        setSelectedDate(date)
        setShowAddDialog(true)
    }

    const handleCreateEvent = async () => {
        if (!selectedDate || !newEventTitle) return

        setIsSubmitting(true)
        try {
            const formData = {
                title: newEventTitle,
                description: newEventDesc,
                date: selectedDate,
                type: newEventType
            }

            const result = await createEvent(formData)
            if (result.success && result.data) {
                setEvents([...events, { ...result.data, date: new Date(result.data.date) } as Event])
                setShowAddDialog(false)
                setNewEventTitle("")
                setNewEventDesc("")
                toast.success("تم إنشاء الحدث بنجاح")
            } else {
                toast.error("فشل إنشاء الحدث")
            }
        } catch (error) {
            console.error(error)
            toast.error("حدث خطأ ما")
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDeleteEvent = async () => {
        if (!selectedEvent) return
        try {
            const result = await deleteEvent(selectedEvent.id)
            if (result.success) {
                setEvents(events.filter(e => e.id !== selectedEvent.id))
                setShowEventDialog(false)
                toast.success("تم حذف الحدث")
            } else {
                toast.error(result.error || "فشل الحذف")
            }
        } catch (error) {
            toast.error("حدث خطأ أثناء الحذف")
        }
    }

    const getEventsForDay = (date: Date) => {
        return events.filter(e => isSameDay(e.date, date))
    }

    return (
        <div dir="rtl" className="flex flex-col h-full bg-white rounded-xl shadow-sm border overflow-hidden">
            {/* Calendar Header */}
            <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-4">
                    <h2 className="text-2xl font-bold text-gray-800">
                        {format(currentMonth, "MMMM yyyy", { locale: arSA })}
                    </h2>
                    <div className="flex items-center border rounded-md bg-white shadow-sm">
                        <Button variant="ghost" size="icon" onClick={handleNextMonth} className="h-9 w-9 rounded-none border-l"> {/* Swapped for RTL */}
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" onClick={handleToday} className="h-9 px-4 rounded-none font-medium text-sm">
                            اليوم
                        </Button>
                        <Button variant="ghost" size="icon" onClick={handlePrevMonth} className="h-9 w-9 rounded-none border-r"> {/* Swapped for RTL */}
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Select defaultValue="month">
                        <SelectTrigger className="w-[120px] h-9">
                            <SelectValue placeholder="عرض" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="month">شهر</SelectItem>
                            <SelectItem value="week" disabled>أسبوع (قريباً)</SelectItem>
                            <SelectItem value="day" disabled>يوم (قريباً)</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button onClick={() => { setSelectedDate(new Date()); setShowAddDialog(true); }} className="h-9 bg-indigo-600 hover:bg-indigo-700 text-white gap-2">
                        <Plus className="h-4 w-4" />
                        إضافة حدث
                    </Button>
                </div>
            </div>

            {/* Calendar Grid Header */}
            <div className="grid grid-cols-7 border-b bg-gray-50">
                {['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'].map(day => (
                    <div key={day} className="py-2 text-center text-sm font-semibold text-gray-500">
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar Grid Body */}
            <div className="flex-1 grid grid-cols-7 grid-rows-5 auto-rows-fr bg-gray-200 gap-px border-b">
                {paddingDays.map((_, i) => (
                    <div key={`padding-${i}`} className="bg-gray-50/30"></div>
                ))}

                {days.map((day, i) => {
                    const dayEvents = getEventsForDay(day)
                    const isTodayDate = isToday(day)
                    const isSelected = selectedDate && isSameDay(day, selectedDate)

                    return (
                        <div
                            key={day.toString()}
                            className={cn(
                                "bg-white p-2 min-h-[120px] relative group transition-colors hover:bg-gray-50/50 cursor-pointer flex flex-col gap-1",
                                isSelected && "bg-blue-50/30"
                            )}
                            onClick={() => handleDateClick(day)}
                        >
                            <div className="flex justify-between items-start">
                                <span className={cn(
                                    "text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full",
                                    isTodayDate ? "bg-blue-600 text-white" : "text-gray-700",
                                )}>
                                    {format(day, "d", { locale: arSA })}
                                </span>
                            </div>

                            {/* Events List for the Day */}
                            <div className="flex-1 flex flex-col gap-1 overflow-y-auto mt-1 custom-scrollbar">
                                {dayEvents.map(event => (
                                    <div
                                        key={event.id}
                                        onClick={(e) => { e.stopPropagation(); setSelectedEvent(event); setShowEventDialog(true); }}
                                        className={cn(
                                            "text-[10px] px-2 py-1 rounded-md truncate font-medium border shadow-sm transition-all hover:scale-[1.02] cursor-pointer flex items-center gap-1",
                                            event.type === 'REMINDER'
                                                ? "bg-amber-50 text-amber-700 border-amber-100/50"
                                                : "bg-indigo-50 text-indigo-700 border-indigo-100/50"
                                        )}
                                    >
                                        <div className={cn("w-1.5 h-1.5 rounded-full shrink-0", event.type === 'REMINDER' ? 'bg-amber-500' : 'bg-indigo-500')}></div>
                                        {event.title}
                                    </div>
                                ))}
                            </div>

                            {/* Add button on hover */}
                            <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 text-gray-500">
                                    <Plus className="w-3 h-3" />
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Add Event Dialog */}
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogContent className="sm:max-w-[425px]" dir="rtl">
                    <DialogHeader>
                        <DialogTitle className="text-right">إضافة حدث جديد</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label className="text-right block">العنوان</Label>
                            <Input
                                placeholder="عنوان الحدث"
                                value={newEventTitle}
                                onChange={(e) => setNewEventTitle(e.target.value)}
                                className="text-right"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-right block">التاريخ</Label>
                            <div className="p-2 border rounded-md bg-muted/50 text-sm text-right">
                                {selectedDate ? format(selectedDate, "PPP", { locale: arSA }) : "لم يتم تحديد تاريخ"}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-right block">النوع</Label>
                            <Select value={newEventType} onValueChange={setNewEventType}>
                                <SelectTrigger className="text-right" dir="rtl">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent dir="rtl">
                                    <SelectItem value="EVENT">حدث</SelectItem>
                                    <SelectItem value="REMINDER">تذكير</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-right block">الوصف</Label>
                            <Textarea
                                placeholder="إضافة تفاصيل..."
                                value={newEventDesc}
                                onChange={(e) => setNewEventDesc(e.target.value)}
                                className="text-right"
                            />
                        </div>
                    </div>
                    <DialogFooter className="sm:justify-start gap-2">
                        <Button onClick={handleCreateEvent} disabled={!newEventTitle || isSubmitting}>
                            {isSubmitting ? "جاري الحفظ..." : "حفظ الحدث"}
                        </Button>
                        <Button variant="outline" onClick={() => setShowAddDialog(false)}>إلغاء</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* View Event Dialog */}
            <Dialog open={showEventDialog} onOpenChange={setShowEventDialog}>
                <DialogContent className="sm:max-w-[425px]" dir="rtl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-right">
                            {selectedEvent?.type === 'REMINDER' ? <Clock className="w-5 h-5 text-amber-500" /> : <Video className="w-5 h-5 text-indigo-500" />}
                            {selectedEvent?.title}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="text-muted-foreground text-right">التاريخ</div>
                            <div className="font-medium text-left">
                                {selectedEvent && format(selectedEvent.date, "PPP", { locale: arSA })}
                            </div>
                            <div className="text-muted-foreground text-right">النوع</div>
                            <div className="font-medium text-left">
                                {selectedEvent?.type === 'REMINDER' ? 'تذكير' : 'حدث'}
                            </div>
                        </div>
                        {selectedEvent?.description && (
                            <div className="bg-muted/50 p-4 rounded-lg text-sm text-right">
                                {selectedEvent.description}
                            </div>
                        )}
                    </div>
                    <DialogFooter className="gap-2 sm:justify-between">
                        <div className="flex gap-2 w-full">
                            <Button variant="destructive" size="sm" onClick={handleDeleteEvent}>
                                حذف
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => setShowEventDialog(false)}>
                                إغلاق
                            </Button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
