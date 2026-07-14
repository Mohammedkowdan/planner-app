export default function AdminOverviewLoading() {
    return (
        <div className="space-y-6 animate-pulse">
            {/* Header skeleton */}
            <div className="rounded-2xl bg-gradient-to-l from-slate-900/20 via-indigo-900/20 to-violet-900/20 p-6 h-36" />
            {/* Stats skeleton */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-20 rounded-xl bg-muted" />
                ))}
            </div>
            {/* Goal cards skeleton */}
            {[...Array(3)].map((_, i) => (
                <div key={i} className="h-24 rounded-xl bg-muted" />
            ))}
        </div>
    )
}
