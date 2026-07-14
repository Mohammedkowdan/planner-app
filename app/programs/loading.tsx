import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function ProgramsLoading() {
    return (
        <div className="space-y-6">
            {/* Header Skeleton */}
            <div className="rounded-2xl bg-gradient-to-l from-primary to-primary/80 p-8 flex items-center justify-between">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-36 bg-white/20" />
                    <Skeleton className="h-4 w-64 bg-white/20" />
                </div>
                <Skeleton className="h-10 w-32 bg-white/20 rounded-md" />
            </div>

            {/* Filter Bar Skeleton */}
            <div className="flex flex-col sm:flex-row gap-4">
                <Skeleton className="h-10 flex-1 rounded-md" />
                <div className="flex gap-2">
                    {[1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} className="h-8 w-20 rounded-md" />
                    ))}
                </div>
            </div>

            {/* Program Cards Grid */}
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                    <Card key={i} className="overflow-hidden">
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div className="space-y-1 flex-1">
                                    <Skeleton className="h-5 w-40" />
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-2/3" />
                                </div>
                                <Skeleton className="h-7 w-20 rounded-full ml-2" />
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <div className="flex justify-between mb-1">
                                    <Skeleton className="h-3 w-16" />
                                    <Skeleton className="h-3 w-8" />
                                </div>
                                <Skeleton className="h-2 w-full rounded-full" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <Skeleton className="h-3 w-16" />
                                    <Skeleton className="h-5 w-24" />
                                </div>
                                <div className="space-y-1">
                                    <Skeleton className="h-3 w-16" />
                                    <Skeleton className="h-5 w-24" />
                                </div>
                            </div>
                            <div className="flex gap-2 pt-2 border-t">
                                <Skeleton className="h-8 flex-1 rounded-md" />
                                <Skeleton className="h-8 w-8 rounded-md" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
