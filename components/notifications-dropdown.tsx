"use client"

import { useState, useRef, useEffect } from "react"
import { Bell, Check, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { markAsRead, markAllAsRead } from "@/actions/notifications"
import { useRouter } from "next/navigation"

type Notification = {
    id: string
    title: string
    message: string
    type: string
    link: string | null
    isRead: boolean
    createdAt: Date
}

export function NotificationsDropdown({
    initialNotifications = [],
    unreadCount = 0
}: {
    initialNotifications: Notification[],
    unreadCount: number
}) {
    const router = useRouter()
    const [notifications, setNotifications] = useState<Notification[]>(initialNotifications)
    const [count, setCount] = useState(unreadCount)
    const [loading, setLoading] = useState(false)
    const [open, setOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    const handleMarkAsRead = async (id: string, link: string | null) => {
        // Optimistic update
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
        setCount(prev => Math.max(0, prev - 1))

        // Navigate first if link exists
        if (link) {
            router.push(link)
            setOpen(false)
        }

        await markAsRead(id)
        router.refresh()
    }

    const handleMarkAllRead = async () => {
        setLoading(true)
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
        setCount(0)

        await markAllAsRead()
        setLoading(false)
        router.refresh()
    }

    return (
        <div className="relative" ref={dropdownRef}>
            <Button
                size="icon"
                className="relative"
                onClick={() => setOpen(!open)}
            >
                <Bell className="h-5 w-5" />
                {count > 0 && (
                    <span className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-primary animate-in zoom-in" />
                )}
            </Button>

            {open && (
                <div className="absolute left-0 mt-2 w-80 rounded-md border bg-white shadow-lg text-popover-foreground animate-in fade-in zoom-in-95 z-50">
                    <div className="flex items-center justify-between p-4 border-b">
                        <span className="font-semibold text-sm">الإشعارات</span>
                        {count > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-xs h-6 px-2 text-muted-foreground hover:text-primary"
                                onClick={handleMarkAllRead}
                                disabled={loading}
                            >
                                {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : "تحديد الكل كمقروء"}
                            </Button>
                        )}
                    </div>

                    <div className="max-h-[300px] overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-sm text-muted-foreground">
                                لا توجد إشعارات جديدة
                            </div>
                        ) : (
                            <div>
                                {notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        className={`p-4 border-b last:border-0 hover:bg-muted/50 cursor-pointer transition-colors ${!notification.isRead ? 'bg-blue-50/50' : ''}`}
                                        onClick={() => handleMarkAsRead(notification.id, notification.link)}
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="space-y-1">
                                                <p className={`text-sm ${!notification.isRead ? 'font-semibold text-primary' : 'font-medium'}`}>
                                                    {notification.title}
                                                </p>
                                                <p className="text-xs text-muted-foreground line-clamp-2">
                                                    {notification.message}
                                                </p>
                                                <p className="text-[10px] text-muted-foreground pt-1">
                                                    {new Date(notification.createdAt).toLocaleDateString('ar-SA')}
                                                </p>
                                            </div>
                                            {!notification.isRead && (
                                                <span className="h-2 w-2 rounded-full bg-blue-500 shrink-0 mt-1.5 shadow-sm" />
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
