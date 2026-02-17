import React, { useState, useEffect, useRef } from 'react';
import RecipeDetail from '@/components/RecipeDetail';
import MealCard from '@/components/MealCard';
import MealCardSkeleton from '@/components/MealCardSkeleton';
import { fetchMealImage } from '@/app/actions/mealPlan';

interface DashboardOverviewProps {
    mealPlan: any;
    onPlanComplete: () => void | Promise<void>;
}

export default function DashboardOverview({ mealPlan, onPlanComplete }: DashboardOverviewProps) {
    const [selectedRecipe, setSelectedRecipe] = useState<any>(null);
    const [now, setNow] = useState(new Date());
    const [activePlan, setActivePlan] = useState<any>(mealPlan);
    const isFetchingRef = useRef(false);

    // Sync activePlan with props when prop changes (e.g. regeneration)
    useEffect(() => {
        setActivePlan(mealPlan);
        // Reset fetching lock when plan changes
        isFetchingRef.current = false;
    }, [mealPlan]);

    // Update 'now' every minute to catch day changes in real-time
    useEffect(() => {
        const timer = setInterval(() => {
            setNow(new Date());
        }, 60000);
        return () => clearInterval(timer);
    }, []);

    // Sequential Image Fetching Effect
    useEffect(() => {
        if (!activePlan || !activePlan.days || isFetchingRef.current) return;

        const fetchNextImage = async () => {
            // Find the first meal that needs an image and hasn't been attempted/fetched
            let target = null;
            const days = activePlan.days;
            const mealTypes = ['breakfast', 'lunch', 'dinner'];

            for (let d = 0; d < days.length; d++) {
                const meals = days[d].meals;
                for (const type of mealTypes) {
                    const meal = meals[type];
                    // Check if meal exists, has a name, NO image URL, and hasn't failed/been skipped
                    if (meal && meal.name && !meal.imageUrl && !meal.__fetchAttempted) {
                        target = { dayIndex: d, type, mealName: meal.name };
                        break;
                    }
                }
                if (target) break;
            }

            if (target) {
                isFetchingRef.current = true;
                try {
                    // Optimized: Fetch image
                    const result = await fetchMealImage(activePlan._id, target.dayIndex, target.type, target.mealName);

                    // Update state
                    setActivePlan((prev: any) => {
                        // Deep clone to avoid mutation issues
                        const next = JSON.parse(JSON.stringify(prev));
                        const targetMeal = next.days[target.dayIndex].meals[target.type];

                        targetMeal.__fetchAttempted = true; // Mark as processed regardless of success

                        if (result) {
                            targetMeal.imageUrl = result.imageUrl;
                            targetMeal.imageBlurHash = result.imageBlurHash;
                            targetMeal.imageUserName = result.imageUserName;
                            targetMeal.imageUserLink = result.imageUserLink;
                        } else {
                            // Fallback or just leave empty but marked attempted so we don't retry
                            // We might want a placeholder logic here if we want to show it eventually
                        }
                        return next;
                    });
                } catch (err) {
                    console.error("Error in sequential fetch:", err);
                    // Mark attempted to prevent infinite loop on error
                    setActivePlan((prev: any) => {
                        const next = JSON.parse(JSON.stringify(prev));
                        if (next.days?.[target.dayIndex]?.meals?.[target.type]) {
                            next.days[target.dayIndex].meals[target.type].__fetchAttempted = true;
                        }
                        return next;
                    });
                } finally {
                    isFetchingRef.current = false;
                }
            }
        };

        fetchNextImage();
    }, [activePlan]); // Runs whenever activePlan updates (e.g. after a fetch completes)


    if (!activePlan || !activePlan.days) return null;

    // Calculate current status relative to weekStartDate
    const getPlanStatus = () => {
        const today = new Date(now);
        today.setHours(0, 0, 0, 0);

        const start = new Date(activePlan.weekStartDate);
        // Ensure start is treated as local date if it's YYYY-MM-DD
        const startLocal = new Date(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate());

        const diffTime = today.getTime() - startLocal.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        return {
            currentIndex: Math.max(0, diffDays),
            isExpired: diffDays >= activePlan.days.length,
            isFuture: diffDays < 0
        };
    };

    const status = getPlanStatus();

    // If expired, show completion view
    if (status.isExpired) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-8 md:p-12 text-center animate-in fade-in duration-700">
                {/* ... (Same completion UI) ... */}
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

    const todayIdx = Math.min(status.currentIndex, activePlan.days.length - 1);
    const todayData = activePlan.days[todayIdx];

    const otherDays = [
        ...activePlan.days.slice(todayIdx + 1),
        ...activePlan.days.slice(0, todayIdx)
    ];

    // Helper to check if a meal should be displayed
    // It should define "valid" as having an image OR if it is today (for immediate feedback)
    const shouldShowMeal = (meal: any, isToday: boolean = false) => {
        if (isToday) return true;
        return meal && meal.imageUrl;
    };

    return (
        <div className="space-y-8 pb-12">
            {/* Today - Featured */}
            <div className="bg-white dark:bg-zinc-800 rounded-3xl p-8 border-2 border-primary shadow-xl relative overflow-hidden transition-all duration-500">
                <div className="absolute top-0 right-0 bg-primary text-white text-[10px] font-bold px-4 py-1 uppercase tracking-widest font-mono">Today</div>
                <div className="mb-6">
                    <span className="text-[11px] font-black text-primary uppercase tracking-tighter font-mono">Day {String(todayIdx + 1).padStart(2, '0')}</span>
                    <h4 className="text-2xl font-bold text-gray-900 dark:text-white font-sans">{todayData.day}</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 min-h-[100px]">
                    {[
                        { type: 'Breakfast', data: todayData.meals.breakfast },
                        { type: 'Lunch', data: todayData.meals.lunch },
                        { type: 'Dinner', data: todayData.meals.dinner }
                    ].map((meal, idx) => (
                        shouldShowMeal(meal.data, true) ? (
                            <MealCard
                                key={idx}
                                meal={meal.data}
                                type={meal.type}
                                onClick={() => setSelectedRecipe(meal.data)}
                            />
                        ) : (
                            <MealCardSkeleton key={idx} />
                        )
                    ))}
                    {/* Show a "Loading more..." indicator if today's meals aren't all here yet? 
                         If we hide them, the user just sees partial list. That's fine. */}
                </div>
            </div>

            {/* Other Days */}
            {otherDays.map((day: any, idx: number) => {
                // Find original index for "Day XX" label
                const originalIdx = activePlan.days.indexOf(day);
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
                                shouldShowMeal(meal.data) ? (
                                    <MealCard
                                        key={mIdx}
                                        meal={meal.data}
                                        type={meal.type}
                                        onClick={() => setSelectedRecipe(meal.data)}
                                    />
                                ) : (
                                    <MealCardSkeleton key={mIdx} />
                                )
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

