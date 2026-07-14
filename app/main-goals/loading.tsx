import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function MainGoalsLoading() {
    return (
        <div className="space-y-6">
            {/* Header Skeleton */}
            <div className="rounded-2xl bg-gradient-to-l from-primary to-primary/80 p-8 flex items-center justify-between">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-48 bg-white/20" />
                    <Skeleton className="h-4 w-72 bg-white/20" />
                </div>
                <Skeleton className="h-10 w-32 bg-white/20 rounded-md" />
            </div>

            {/* Goals Grid Skeleton */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                    <Card key={i} className="border-t-4 border-t-primary/30">
                        <CardHeader className="space-y-2">
                            <Skeleton className="h-6 w-48" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-5 w-24 rounded" />
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between mt-4">
                                <Skeleton className="h-7 w-32 rounded-full" />
                                <div className="flex gap-1">
                                    <Skeleton className="h-8 w-8 rounded" />
                                    <Skeleton className="h-8 w-8 rounded" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
