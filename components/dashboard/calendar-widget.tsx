"use strict";
"use client"

import * as React from "react"
import { useState } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Calendar as CalendarIcon, Clock, Trash2, Video } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { createEvent, deleteEvent } from "@/actions/calendar"
import { cn } from "@/lib/utils"
// import { arSA } from "date-fns/locale"

interface Event {
    id: string
    title: string
    description: string | null
    date: Date
    type: string
}

export function CalendarWidget({ initialEvents = [] }: { initialEvents?: any[] }) {
    const [date, setDate] = useState<Date | undefined>(new Date())
    const [events, setEvents] = useState<Event[]>(initialEvents.map((e: any) => ({
        ...e,
        date: new Date(e.date)
    })))
    const [showAddDialog, setShowAddDialog] = useState(false)
    const [showEventDialog, setShowEventDialog] = useState(false)
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)

    // Form state
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [type, setType] = useState("EVENT")

    const handleDateSelect = (newDate: Date | undefined) => {
        setDate(newDate)
        if (newDate) {
            // Check if there are events on this date to show details, or open add dialog
            const eventsOnDate = events.filter(e =>
                e.date.toDateString() === newDate.toDateString()
            )

            // If user double clicks or explicitly wants to add, we can handle that.
            // For now, let's show the add dialog when a date is selected if it's a specific action or we can just have a button.
            // Let's stick to "Press any day -> See events or Add"
            // We will just update the selected date. The "Add Event" button will use this date.
        }
    }

    const openAddDialog = () => {
        if (!date) return
        setTitle("")
        setDescription("")
        setType("EVENT")
        setShowAddDialog(true)
    }

    const handleCreateEvent = async () => {
        if (!date || !title) return

        const result = await createEvent({
            title,
            description,
            date,
            type
        })

        if (result.success && result.data) {
            setEvents([...events, { ...result.data, date: new Date(result.data.date) } as Event])
            setShowAddDialog(false)
        }
    }

    const handleDeleteEvent = async (id: string) => {
        const result = await deleteEvent(id)
        if (result.success) {
            setEvents(events.filter(e => e.id !== id))
            setShowEventDialog(false)
        }
    }

    // Filter events for the selected date
    const selectedDateEvents = date
        ? events.filter(e => e.date.toDateString() === date.toDateString())
        : []

    return (
        <Card className="col-span-1 md:col-span-3 lg:col-span-3 h-full flex flex-col border-0 shadow-lg overflow-hidden bg-white/80 backdrop-blur-md">
            {/* Header Section mimicking the reference image */}
            <div className="bg-gray-50/80 p-6 border-b">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-medium text-gray-800">
                            {date ? date.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' }) : 'Select a date'}
                        </h2>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setShowAddDialog(true)} className="rounded-full h-8 w-8 hover:bg-gray-200">
                        <Plus className="w-5 h-5 text-gray-600" />
                    </Button>
                </div>
            </div>

            <CardContent className="flex-1 flex flex-col md:flex-row p-0">
                {/* Calendar Side */}
                <div className="p-6 flex-1 flex flex-col items-center">
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={handleDateSelect}
                        className="p-0 w-full max-w-[340px]"
                        classNames={{
                            month: "space-y-4 w-full",
                            caption: "flex justify-between pt-1 relative items-center mb-4 px-2",
                            caption_label: "text-base font-semibold text-gray-800",
                            nav: "space-x-1 flex items-center",
                            nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 transition-opacity",
                            head_row: "flex w-full justify-between mb-2",
                            head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem] text-center",
                            row: "flex w-full justify-between mt-2",
                            cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected])]:bg-transparent focus-within:relative focus-within:z-20",
                            day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-gray-100 rounded-full transition-colors data-[selected=true]:bg-primary data-[selected=true]:text-white",
                            day_selected: "bg-blue-600 text-white hover:bg-blue-600 hover:text-white rounded-full", // Force blue circle
                            day_today: "text-blue-600 font-semibold",
                            day_outside: "text-gray-300 opacity-50",
                        }}
                        modifiers={{
                            hasEvent: (d: Date) => events.some(e => e.date.toDateString() === d.toDateString())
                        }}
                        modifiersStyles={{
                            hasEvent: {
                                fontWeight: 'bold'
                            }
                        }}
                    />

                    {/* Dots indicator for events on the selected day or overall legend could go here */}
                    <div className="mt-4 flex gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
                            <span>Events</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
                            <span>Reminders</span>
                        </div>
                    </div>
                </div>

                {/* Events list Side - styled to look integrated */}
                <div className="flex-1 bg-gray-50/50 p-6 border-t md:border-t-0 md:border-l min-h-[300px]">
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        Schedule
                        <span className="text-xs font-normal text-muted-foreground ml-auto bg-white px-2 py-1 rounded-full border">
                            {selectedDateEvents.length} Items
                        </span>
                    </h3>

                    <div className="space-y-3 overflow-y-auto max-h-[360px] pr-2 custom-scrollbar">
                        {selectedDateEvents.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                                <CalendarIcon className="w-8 h-8 mb-2 opacity-20" />
                                <p className="text-sm">No events for this day</p>
                                <Button variant="link" size="sm" onClick={openAddDialog} className="text-blue-600 mt-2">
                                    + Add Event
                                </Button>
                            </div>
                        ) : (
                            selectedDateEvents.map(event => (
                                <div
                                    key={event.id}
                                    className="group flex flex-col gap-1 p-3 rounded-xl border bg-white hover:shadow-md transition-all cursor-pointer relative overflow-hidden"
                                    onClick={() => { setSelectedEvent(event); setShowEventDialog(true); }}
                                >
                                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${event.type === 'REMINDER' ? 'bg-orange-500' : 'bg-blue-500'}`}></div>
                                    <div className="flex items-center gap-2 pl-2">
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${event.type === 'REMINDER' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                                            {event.type === 'REMINDER' ? 'Reminder' : 'Event'}
                                        </span>
                                        <span className="text-xs text-gray-400 ml-auto flex items-center gap-1">
                                            {event.type === 'REMINDER' ? <Clock className="w-3 h-3" /> : <Video className="w-3 h-3" />}
                                        </span>
                                    </div>
                                    <h4 className="font-medium text-gray-900 leading-tight pl-2">{event.title}</h4>
                                    {event.description && (
                                        <p className="text-xs text-gray-500 line-clamp-2 pl-2 mt-0.5">{event.description}</p>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </CardContent>

            {/* Add Event Dialog */}
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>إضافة حدث جديد</DialogTitle>
                        <DialogDescription>
                            حدد تفاصيل الحدث أو التذكير ليوم {date?.toLocaleDateString('ar-SA')}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="title">العنوان</Label>
                            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="مثال: اجتماع فريق، موعد تسليم..." />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="type">النوع</Label>
                            <Select value={type} onValueChange={setType}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="EVENT">حدث / اجتماع</SelectItem>
                                    <SelectItem value="REMINDER">تذكير</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="description">ملاحظات إضافية</Label>
                            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="تفاصيل إضافية..." />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleCreateEvent}>حفظ</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* View/Delete Event Dialog */}
            <Dialog open={showEventDialog} onOpenChange={setShowEventDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            {selectedEvent?.title}
                            <span className={`text-[10px] px-2 py-0.5 rounded-full ${selectedEvent?.type === 'REMINDER' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                                {selectedEvent?.type === 'REMINDER' ? 'تذكير' : 'حدث'}
                            </span>
                        </DialogTitle>
                        <DialogDescription>
                            {selectedEvent?.date.toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <p className="text-sm text-foreground">{selectedEvent?.description || "لا توجد تفاصيل إضافية"}</p>
                    </div>
                    <DialogFooter>
                        <Button variant="destructive" onClick={() => selectedEvent && handleDeleteEvent(selectedEvent.id)}>
                            <Trash2 className="w-4 h-4 mr-2" />
                            حذف الحدث
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    )
}
