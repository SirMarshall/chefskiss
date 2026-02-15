
import React from 'react';

interface DashboardOverviewProps {
    mealPlan: any;
}

import RecipeDetail from '@/components/RecipeDetail';
import { useState } from 'react';

interface DashboardOverviewProps {
    mealPlan: any;
}

export default function DashboardOverview({ mealPlan }: DashboardOverviewProps) {
    const [selectedRecipe, setSelectedRecipe] = useState<any>(null);

    if (!mealPlan || !mealPlan.days) return null;

    // Calculate current day index relative to weekStartDate
    const getTodayIndex = () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const start = new Date(mealPlan.weekStartDate);
        // Ensure start is treated as local date if it's YYYY-MM-DD
        const startLocal = new Date(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate());

        const diffTime = today.getTime() - startLocal.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        // Return 0 if in the past or before start, otherwise the calculated index (capped at length-1)
        return Math.max(0, Math.min(diffDays, mealPlan.days.length - 1));
    };

    const todayIdx = getTodayIndex();
    const todayData = mealPlan.days[todayIdx];

    // Days to show: Today first, then future days, then past days (optional, but let's just show from today onwards?)
    // Actually, usually users want to see the whole plan but highlight today.
    // The previous UI showed all days in order. 
    // Let's re-order to show Today first, then the rest.

    const otherDays = [
        ...mealPlan.days.slice(todayIdx + 1),
        ...mealPlan.days.slice(0, todayIdx)
    ];

    return (
        <div className="space-y-8 pb-12 transition-all duration-500">
            {/* Today - Featured */}
            <div className="bg-white dark:bg-zinc-800 rounded-3xl p-8 border-2 border-primary shadow-xl relative overflow-hidden group transition-colors duration-500">
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
