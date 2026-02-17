
import DashboardSkeleton from "@/components/DashboardSkeleton";

export default function DashboardLoading() {
    return (
        <div className="flex h-screen w-full bg-background-light dark:bg-background-dark overflow-hidden flex-col">
            {/* Header Skeleton */}
            <div className="md:hidden flex items-center justify-between p-4 border-b border-gray-200/50 dark:border-gray-800/50 bg-panel-left-light dark:bg-panel-left-dark z-50">
                <div className="h-6 w-24 bg-gray-200 dark:bg-zinc-800 rounded animate-pulse"></div>
            </div>

            <div className="flex-1 flex flex-col md:flex-row relative overflow-hidden">
                 {/* Sidebar Skeleton */}
                 <aside className="hidden md:flex w-80 bg-panel-left-light dark:bg-panel-left-dark border-r border-gray-200/50 dark:border-gray-800/50 p-12 flex-col justify-between">
                    <div className="space-y-8">
                        <div className="space-y-2">
                            <div className="h-12 w-48 bg-gray-200 dark:bg-zinc-800 rounded animate-pulse"></div>
                            <div className="h-4 w-32 bg-gray-200 dark:bg-zinc-800 rounded animate-pulse"></div>
                        </div>
                        <div className="space-y-4 pt-8">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="h-6 w-full bg-gray-200 dark:bg-zinc-800 rounded animate-pulse"></div>
                            ))}
                        </div>
                    </div>
                 </aside>

                 {/* Main Content Skeleton */}
                 <main className="flex-1 overflow-hidden bg-white dark:bg-zinc-900 p-6 md:p-12">
                    <div className="lg:w-3/5">
                        <div className="mb-10 space-y-2">
                            <div className="h-4 w-32 bg-gray-100 dark:bg-zinc-800 rounded animate-pulse"></div>
                            <div className="h-10 w-64 bg-gray-100 dark:bg-zinc-800 rounded animate-pulse"></div>
                        </div>
                        <DashboardSkeleton />
                    </div>
                 </main>
            </div>
        </div>
    );
}
