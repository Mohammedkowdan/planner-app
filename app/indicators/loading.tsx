import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function IndicatorsLoading() {
    return (
        <div className="space-y-6">
            {/* Header Skeleton */}
            <div className="rounded-2xl bg-gradient-to-l from-primary to-primary/80 p-8">
                <Skeleton className="h-8 w-48 bg-white/20 mb-2" />
                <Skeleton className="h-4 w-72 bg-white/20" />
            </div>

            {/* Filters Skeleton */}
            <div className="flex flex-col sm:flex-row gap-4">
                <Skeleton className="h-10 flex-1 rounded-md" />
                <div className="flex gap-2">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-8 w-20 rounded-md" />
                    ))}
                </div>
            </div>

            {/* Cards Skeleton */}
            <div className="grid gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <Card key={i}>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div className="space-y-2">
                                <Skeleton className="h-5 w-48" />
                                <Skeleton className="h-4 w-32" />
                            </div>
                            <Skeleton className="h-8 w-20 rounded-full" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-2 w-full rounded-full mb-4" />
                            <div className="grid grid-cols-4 gap-4">
                                {[1, 2, 3, 4].map((q) => (
                                    <div key={q} className="space-y-1">
                                        <Skeleton className="h-3 w-8" />
                                        <Skeleton className="h-5 w-12" />
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
