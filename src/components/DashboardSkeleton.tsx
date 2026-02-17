
import React, { useMemo } from 'react';
import MealCardSkeleton from '@/components/MealCardSkeleton';

interface DashboardSkeletonProps {
    numDays?: number;
}

export default function DashboardSkeleton({ numDays = 7 }: DashboardSkeletonProps) {
    // Calculate dates starting from today
    const { days, todayIdx } = useMemo(() => {
        const d = [];
        const now = new Date();
        const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

        for (let i = 0; i < Math.max(1, numDays); i++) {
            const date = new Date(now);
            date.setDate(now.getDate() + i);
            d.push({
                dayName: daysOfWeek[date.getDay()],
                // simple index for "Day 0X"
                idx: i + 1
            });
        }
        return { days: d, todayIdx: 0 };
    }, [numDays]);

    return (
        <div className="space-y-8 pb-12">
            {/* Day 1 - Featured (Immediate) */}
            <div className="bg-white dark:bg-zinc-800 rounded-3xl p-8 border-2 border-primary shadow-xl relative overflow-hidden animate-in fade-in duration-700">
                <div className="absolute top-0 right-0 bg-primary text-white text-[10px] font-bold px-4 py-1 uppercase tracking-widest font-mono">Today</div>
                <div className="mb-6">
                    <span className="text-[11px] font-black text-primary uppercase tracking-tighter font-mono">Day {String(days[0].idx).padStart(2, '0')}</span>
                    <h4 className="text-2xl font-bold text-gray-900 dark:text-white font-sans">{days[0].dayName}</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map((_, idx) => (
                        <div key={idx}>
                            <MealCardSkeleton />
                        </div>
                    ))}
                </div>
            </div>

            {/* Other Days - Staggered Slide In */}
            {days.slice(1).map((day, i) => (
                <div
                    key={i}
                    className="bg-white dark:bg-zinc-800/50 rounded-3xl p-8 border border-gray-100 dark:border-gray-800 shadow-sm animate-in slide-in-from-bottom-8 fade-in duration-700 fill-mode-backwards"
                    style={{ animationDelay: `${(i + 1) * 150}ms` }}
                >
                    <div className="mb-6 flex justify-between items-start">
                        <div>
                            <span className="text-[11px] font-black text-gray-300 dark:text-gray-600 uppercase tracking-tighter font-mono">Day {String(day.idx).padStart(2, '0')}</span>
                            <h4 className="text-2xl font-bold text-gray-900 dark:text-white font-sans">{day.dayName}</h4>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[1, 2, 3].map((_, idx) => (
                            <div key={idx}>
                                <MealCardSkeleton />
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
