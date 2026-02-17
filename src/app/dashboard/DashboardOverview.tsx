
import React, { useState, useEffect } from 'react';
import RecipeDetail from '@/components/RecipeDetail';

interface DashboardOverviewProps {
    mealPlan: any;
    onPlanComplete: () => void | Promise<void>;
}

export default function DashboardOverview({ mealPlan, onPlanComplete }: DashboardOverviewProps) {
    const [selectedRecipe, setSelectedRecipe] = useState<any>(null);
    const [now, setNow] = useState(new Date());

    // Update 'now' every minute to catch day changes in real-time
    useEffect(() => {
        const timer = setInterval(() => {
            setNow(new Date());
        }, 60000);
        return () => clearInterval(timer);
    }, []);

    if (!mealPlan || !mealPlan.days) return null;

    // Calculate current status relative to weekStartDate
    const getPlanStatus = () => {
        const today = new Date(now);
        today.setHours(0, 0, 0, 0);

        const start = new Date(mealPlan.weekStartDate);
        // Ensure start is treated as local date if it's YYYY-MM-DD
        const startLocal = new Date(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate());

        const diffTime = today.getTime() - startLocal.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        return {
            currentIndex: Math.max(0, diffDays),
            isExpired: diffDays >= mealPlan.days.length,
            isFuture: diffDays < 0
        };
    };

    const status = getPlanStatus();

    // If expired, show completion view
    if (status.isExpired) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-8 md:p-12 text-center animate-in fade-in duration-700">
                <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-8 text-primary animate-bounce">
                    <span className="material-symbols-outlined text-5xl">celebration</span>
                </div>
                <h2 className="text-xs font-bold text-primary tracking-[0.3em] uppercase mb-4 font-mono">Mission Accomplished</h2>
                <h3 className="text-4xl font-serif italic text-gray-900 dark:text-white mb-6">You've finished your plan!</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-10 max-w-md leading-relaxed">
                    That's a wrap on this week's culinary journey. Your palate is refreshed and your kitchen is ready for a new chapter.
                </p>
                <button
                    onClick={onPlanComplete}
                    className="bg-primary hover:bg-primary-dark text-white px-10 py-5 rounded-sm shadow-2xl font-bold tracking-[0.2em] text-xs uppercase flex items-center gap-3 transition-all hover:scale-105 active:scale-95"
                >
                    <span className="material-symbols-outlined">refresh</span>
                    Start New Week
                </button>
            </div>
        );
    }

    const todayIdx = Math.min(status.currentIndex, mealPlan.days.length - 1);
    const todayData = mealPlan.days[todayIdx];

    const otherDays = [
        ...mealPlan.days.slice(todayIdx + 1),
        ...mealPlan.days.slice(0, todayIdx)
    ];

    return (
        <div className="space-y-8 pb-12">
            {/* Today - Featured */}
            <div className="bg-white dark:bg-zinc-800 rounded-3xl p-8 border-2 border-primary shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-primary text-white text-[10px] font-bold px-4 py-1 uppercase tracking-widest font-mono">Today</div>
                <div className="mb-6">
                    <span className="text-[11px] font-black text-primary uppercase tracking-tighter font-mono">Day {String(todayIdx + 1).padStart(2, '0')}</span>
                    <h4 className="text-2xl font-bold text-gray-900 dark:text-white font-sans">{todayData.day}</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { type: 'Breakfast', data: todayData.meals.breakfast },
                        { type: 'Lunch', data: todayData.meals.lunch },
                        { type: 'Dinner', data: todayData.meals.dinner }
                    ].map((meal, idx) => (
                        <div
                            key={idx}
                            onClick={() => setSelectedRecipe(meal.data)}
                            className="flex flex-col space-y-3 cursor-pointer group"
                        >
                            <div
                                className="aspect-[4/3] bg-gray-100 dark:bg-zinc-700 rounded-2xl relative overflow-hidden group-hover:brightness-95 transition-all bg-cover bg-center"
                                style={{ backgroundImage: meal.data.imageUrl ? `url('${meal.data.imageUrl}')` : 'none', backgroundColor: meal.data.imageColor || '' }}
                            >
                                <span className="absolute top-3 right-3 bg-white/90 dark:bg-zinc-800/90 backdrop-blur px-2 py-1 rounded text-[9px] font-bold uppercase tracking-wider text-gray-800 dark:text-gray-200 font-mono transition-colors">{meal.type}</span>
                                {meal.data.imageUserName && (
                                    <div className="absolute bottom-2 left-2 text-[8px] text-white/50 font-mono tracking-tighter">
                                        {meal.data.imageUserName} / Unsplash
                                    </div>
                                )}
                            </div>
                            <h5 className="text-xs font-bold text-gray-900 dark:text-white line-clamp-2 font-sans group-hover:text-primary transition-colors">{meal.data.name}</h5>
                        </div>
                    ))}
                </div>
            </div>

            {/* Other Days */}
            {otherDays.map((day: any, idx: number) => {
                // Find original index for "Day XX" label
                const originalIdx = mealPlan.days.indexOf(day);
                const isPast = originalIdx < todayIdx;

                return (
                    <div key={idx} className={`bg-white dark:bg-zinc-800/50 rounded-3xl p-8 border border-gray-100 dark:border-gray-800 shadow-sm hover:border-gray-200 dark:hover:border-gray-700 transition-all ${isPast ? 'opacity-60 grayscale-[0.3]' : ''}`}>
                        <div className="mb-6 flex justify-between items-start">
                            <div>
                                <span className="text-[11px] font-black text-gray-300 dark:text-gray-600 uppercase tracking-tighter font-mono">Day {String(originalIdx + 1).padStart(2, '0')}</span>
                                <h4 className="text-2xl font-bold text-gray-900 dark:text-white font-sans">{day.day}</h4>
                            </div>
                            {isPast && (
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-mono">Past</span>
                            )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                { type: 'Breakfast', data: day.meals.breakfast },
                                { type: 'Lunch', data: day.meals.lunch },
                                { type: 'Dinner', data: day.meals.dinner }
                            ].map((meal, mIdx) => (
                                <div
                                    key={mIdx}
                                    onClick={() => setSelectedRecipe(meal.data)}
                                    className="flex flex-col space-y-3 cursor-pointer group"
                                >
                                    <div
                                        className="aspect-[4/3] bg-gray-100 dark:bg-zinc-700 rounded-2xl relative overflow-hidden bg-cover bg-center transition-colors"
                                        style={{ backgroundImage: meal.data.imageUrl ? `url('${meal.data.imageUrl}')` : 'none', backgroundColor: meal.data.imageColor || '' }}
                                    >
                                        <span className="absolute top-3 right-3 bg-white/90 dark:bg-zinc-800/90 backdrop-blur px-2 py-1 rounded text-[9px] font-bold uppercase tracking-wider text-gray-800 dark:text-gray-200 font-mono transition-colors">
                                            {meal.type}
                                        </span>
                                        {meal.data.imageUserName && (
                                            <div className="absolute bottom-2 left-2 text-[8px] text-white/50 font-mono tracking-tighter">
                                                {meal.data.imageUserName} / Unsplash
                                            </div>
                                        )}
                                    </div>
                                    <h5 className="text-xs font-bold text-gray-900 dark:text-white line-clamp-2 font-sans group-hover:text-primary transition-colors">{meal.data.name}</h5>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}
            {selectedRecipe && (
                <RecipeDetail
                    recipe={selectedRecipe}
                    onClose={() => setSelectedRecipe(null)}
                />
            )}
        </div>
    );
}

