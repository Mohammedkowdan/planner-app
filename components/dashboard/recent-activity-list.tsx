"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "lucide-react"

export function RecentActivityList({ activities }: { activities: any[] }) {
    if (!activities || activities.length === 0) {
        return (
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">النشاطات الأخيرة</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground text-sm">لا توجد نشاطات حديثة</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="col-span-1 lg:col-span-2 hover:shadow-lg transition-all duration-300 border-0 shadow-md bg-white/80 backdrop-blur-md overflow-hidden">
            <div className="p-6 border-b bg-gray-50/50 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-indigo-600" />
                    النشاطات الأخيرة
                </h3>
                <span className="text-xs font-medium bg-indigo-50 text-indigo-600 px-2 py-1 rounded-full">{activities.length} updates</span>
            </div>
            <CardContent className="p-0">
                <div className="relative">
                    {/* Vertical Line */}
                    <div className="absolute left-8 top-6 bottom-6 w-px bg-gray-200 z-0"></div>

                    <div className="space-y-0 relative z-10">
                        {activities.map((activity, i) => (
                            <div key={activity.id} className="flex items-start gap-4 p-5 hover:bg-gray-50/50 transition-colors group">
                                <div className="relative z-10 w-8 h-8 rounded-full bg-white border-2 border-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600 shadow-sm shrink-0 group-hover:border-indigo-400 group-hover:scale-110 transition-all">
                                    {activity.user.name.charAt(0)}
                                </div>

                                <div className="flex-1 min-w-0 pt-0.5">
                                    <div className="flex items-center justify-between mb-1">
                                        <p className="text-sm font-medium text-gray-900">
                                            {activity.user.name} <span className="text-gray-400 font-normal mx-1">•</span> <span className="text-gray-600 font-normal">{activity.action}</span>
                                        </p>
                                        <span className="text-[10px] text-gray-400">
                                            {new Date(activity.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <div className="bg-gray-100/50 p-2.5 rounded-xl border border-gray-200/50 group-hover:border-indigo-100 group-hover:bg-indigo-50/20 transition-all">
                                        <p className="text-xs font-semibold text-gray-800">
                                            {activity.targetTitle}
                                        </p>
                                        <p className="text-[10px] text-gray-500 mt-0.5 flex items-center gap-1">
                                            <span className={`w-1.5 h-1.5 rounded-full ${activity.targetType === 'Program' ? 'bg-blue-400' : 'bg-green-400'}`}></span>
                                            {activity.targetType}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    )

}
