"use client"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LogOut, Settings, User } from "lucide-react"
import { logout } from "@/actions/auth"
import { useOrganization } from "@/contexts/organization-context"

interface UserNavProps {
    user: {
        name: string
        email: string
        image?: string | null
        role?: string
    } | null
}

export function UserNav({ user }: UserNavProps) {
    const { clearOrganization } = useOrganization()

    const handleLogout = async () => {
        clearOrganization()
        await logout()
        window.location.href = "/"
    }

    if (!user) return null

    const initials = user.name
        ? user.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .substring(0, 2)
            .toUpperCase()
        : "U"

    return (
        <DropdownMenu dir="rtl">
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-11 w-11 rounded-full ring-2 ring-background shadow-sm hover:ring-muted">
                    <Avatar className="h-11 w-11">
                        <AvatarImage src={user.image!} alt={user.name} className="object-cover" />
                        <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80 p-0" align="end" forceMount>
                <div className="flex flex-col items-center justify-center p-6 pb-2 gap-3">
                    <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
                        <AvatarImage src={user.image!} alt={user.name} className="object-cover" />
                        <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
                    </Avatar>

                    <div className="flex flex-col items-center gap-1 text-center">
                        <div className="flex items-center gap-2">
                            <h3 className="text-xl font-bold text-gray-900">{user.name}</h3>
                        </div>
                        <p className="text-sm font-medium text-gray-500">
                            {user.role === 'ADMIN' ? 'مدير النظام' : (user.role === 'MANAGER' ? 'مدير برنامج' : 'موظف')}
                        </p>
                        <p className="text-xs text-muted-foreground/80 font-mono">
                            {user.email}
                        </p>
                    </div>
                </div>
                <DropdownMenuSeparator className="my-2" />
                <DropdownMenuGroup>
                    <DropdownMenuItem>
                        <User className="mr-2 h-4 w-4 ml-2" />
                        <span>الملف الشخصي</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        <Settings className="mr-2 h-4 w-4 ml-2" />
                        <span>الإعدادات</span>
                    </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600 focus:bg-red-50">
                    <LogOut className="mr-2 h-4 w-4 ml-2" />
                    <span>تسجيل خروج</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
