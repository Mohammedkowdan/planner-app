"use client"

import { useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Trash2, Loader2, AlertTriangle } from "lucide-react"
import { deleteUser } from "@/actions/users"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export function DeleteUserButton({ userId, userName }: { userId: string, userName: string }) {
  const [isPending, startTransition] = useTransition()

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-100 hover:shadow-sm transition-all duration-300 rounded-full">
          <Trash2 className="w-4 h-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent dir="rtl" className="max-w-md border-red-100/50 shadow-2xl shadow-red-900/10 rounded-2xl overflow-hidden">
        {/* Soft decorative gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-50/50 to-background -z-10" />
        
        <AlertDialogHeader className="flex flex-col items-center text-center space-y-3 pb-2">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center relative mb-2">
            <div className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-20" />
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <AlertDialogTitle className="text-xl font-bold text-slate-800">حذف المستخدم</AlertDialogTitle>
          <AlertDialogDescription className="text-base text-slate-600">
            هل أنت متأكد من رغبتك في حذف حساب <span className="font-bold text-slate-800">{userName}</span>؟
            <br />
            <span className="text-sm text-red-500 mt-2 block">هذا الإجراء نهائي ولا يمكن التراجع عنه.</span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2 sm:justify-start">
          <AlertDialogCancel disabled={isPending}>
            إلغاء
          </AlertDialogCancel>
          <AlertDialogAction 
            disabled={isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 gap-2"
            onClick={(e) => {
              e.preventDefault()
              startTransition(async () => {
                await deleteUser(userId)
              })
            }}
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            تأكيد الحذف
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
