export default function DashboardLoading() {
    return (
        <div className="min-h-[calc(100vh-48px)]">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
                {/* Header skeleton */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <div className="h-8 w-32 skeleton mb-2"></div>
                        <div className="h-4 w-48 skeleton"></div>
                    </div>
                    <div className="h-10 w-32 skeleton rounded-md"></div>
                </div>

                {/* Stats skeleton */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="notion-card p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="h-3 w-12 skeleton mb-2"></div>
                                    <div className="h-8 w-16 skeleton"></div>
                                </div>
                                <div className="w-10 h-10 skeleton rounded-lg"></div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Cards skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="notion-card p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="h-5 w-16 skeleton rounded-full"></div>
                                <div className="h-4 w-20 skeleton"></div>
                            </div>
                            <div className="h-5 w-3/4 skeleton mb-2"></div>
                            <div className="h-4 w-full skeleton mb-1"></div>
                            <div className="h-4 w-2/3 skeleton mb-4"></div>
                            <div className="flex justify-between pt-3 border-t border-[var(--border-default)]">
                                <div className="h-6 w-20 skeleton rounded-md"></div>
                                <div className="flex gap-1">
                                    {[...Array(5)].map((_, j) => (
                                        <div key={j} className="w-1.5 h-4 skeleton rounded-sm"></div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
