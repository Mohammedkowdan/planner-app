"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar as CalendarIcon, Clock } from "lucide-react"

export function UpcomingActivities({ activities }: { activities: any[] }) {
    return (
        <Card className="col-span-1 hover:shadow-lg transition-all duration-300 border-0 shadow-md bg-white/80 backdrop-blur-md overflow-hidden">
            <div className="p-6 border-b bg-gray-50/50">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5 text-indigo-600" />
                    جدول أعمالي القادم
                </h3>
            </div>
            <CardContent className="p-0">
                {activities && activities.length > 0 ? (
                    <div className="divide-y divide-gray-100">
// ... inside map
                        {activities.map((activity) => {
                            const isCalendarEvent = activity.type === 'CALENDAR_EVENT'
                            const isReminder = activity.status === 'REMINDER'

                            return (
                                <div key={activity.id} className="flex gap-4 p-4 hover:bg-indigo-50/30 transition-colors group cursor-pointer items-center">
                                    <div className={`flex flex-col items-center justify-center rounded-2xl p-2 min-w-[3.5rem] h-[3.5rem] shadow-sm border transition-all ${isCalendarEvent
                                            ? (isReminder ? "bg-amber-50 border-amber-100" : "bg-blue-50 border-blue-100")
                                            : "bg-white border-indigo-100 group-hover:border-indigo-200"
                                        }`}>
                                        <span className={`text-sm font-bold ${isCalendarEvent ? (isReminder ? "text-amber-700" : "text-blue-700") : "text-indigo-700"}`}>
                                            {new Date(activity.startDate).toLocaleDateString('en-US', { day: 'numeric' })}
                                        </span>
                                        <span className={`text-[10px] font-medium uppercase tracking-wide ${isCalendarEvent ? (isReminder ? "text-amber-500" : "text-blue-500") : "text-indigo-400"}`}>
                                            {new Date(activity.startDate).toLocaleDateString('en-US', { month: 'short' })}
                                        </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-indigo-700 transition-colors">{activity.name}</p>
                                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                                            {!isCalendarEvent && activity.duration && (
                                                <span className="flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded-full">
                                                    <Clock className="w-3 h-3 text-gray-400" />
                                                    {activity.duration} days
                                                </span>
                                            )}
                                            {isCalendarEvent ? (
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${isReminder ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"}`}>
                                                    {isReminder ? "Reminder" : "Event"}
                                                </span>
                                            ) : (
                                                <span className={activity.status === 'PENDING' ? 'text-orange-500' : 'text-green-500'}>
                                                    {activity.status === 'PENDING' ? 'Pending' : 'Active'}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                            <CalendarIcon className="w-6 h-6 text-gray-300" />
                        </div>
                        <span className="text-sm text-gray-500 font-medium">No upcoming activities</span>
                    </div>
                )}
            </CardContent>
        </Card>
    )

}
