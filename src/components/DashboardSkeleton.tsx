
"use client";

import React from 'react';

export default function DashboardSkeleton() {
    return (
        <div className="space-y-8 pb-12 animate-in fade-in duration-700">
            {/* Today - Featured Skeleton */}
            <div className="bg-white dark:bg-zinc-800 rounded-3xl p-8 border-2 border-gray-100 dark:border-zinc-700 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 bg-gray-200 dark:bg-zinc-700 w-24 h-6 px-4 py-1"></div>

                <div className="mb-6 space-y-2">
                    <div className="h-3 w-12 bg-gray-200 dark:bg-zinc-700 rounded-full animate-pulse"></div>
                    <div className="h-8 w-48 bg-gray-200 dark:bg-zinc-700 rounded-lg animate-pulse"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map((_, idx) => (
                        <div key={idx} className="flex flex-col space-y-3">
                            <div className="aspect-[4/3] bg-gray-100 dark:bg-zinc-700/50 rounded-2xl relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
                                <div className="absolute top-3 right-3 w-16 h-4 bg-gray-200 dark:bg-zinc-700 rounded-full"></div>
                            </div>
                            <div className="h-4 w-3/4 bg-gray-200 dark:bg-zinc-700 rounded-md animate-pulse"></div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Other Days Skeletons */}
            {[1, 2].map((_, dIdx) => (
                <div key={dIdx} className="bg-white dark:bg-zinc-800/50 rounded-3xl p-8 border border-gray-100 dark:border-gray-800 shadow-sm">
                    <div className="mb-6 space-y-2">
                        <div className="h-3 w-12 bg-gray-100 dark:bg-zinc-800 rounded-full animate-pulse"></div>
                        <div className="h-8 w-36 bg-gray-100 dark:bg-zinc-800 rounded-lg animate-pulse"></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[1, 2, 3].map((_, idx) => (
                            <div key={idx} className="flex flex-col space-y-3">
                                <div className="aspect-[4/3] bg-gray-50 dark:bg-zinc-800/30 rounded-2xl relative overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
                                    <div className="absolute top-3 right-3 w-14 h-3 bg-gray-100 dark:bg-zinc-800 rounded-full"></div>
                                </div>
                                <div className="h-3 w-2/3 bg-gray-50 dark:bg-zinc-800/30 rounded-md animate-pulse"></div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}

            <style jsx>{`
                @keyframes shimmer {
                    100% {
                        transform: translateX(100%);
                    }
                }
            `}</style>
        </div>
    );
}
