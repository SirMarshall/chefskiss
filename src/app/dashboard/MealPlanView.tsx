
import React from 'react';

interface MealPlanViewProps {
    mealPlan: any;
}

import RecipeDetail from '@/components/RecipeDetail';
import { useState } from 'react';
import ImageWithFallback from '@/components/ImageWithFallback';

interface MealPlanViewProps {
    mealPlan: any;
}

export default function MealPlanView({ mealPlan }: MealPlanViewProps) {
    const [selectedRecipe, setSelectedRecipe] = useState<any>(null);

    if (!mealPlan || !mealPlan.days) return null;

    return (
        <div className="w-full h-full overflow-x-auto overflow-y-auto pb-12">
            <div className="meal-matrix-grid min-w-[1800px] p-1">
                {mealPlan.days.map((day: any, idx: number) => (
                    <div key={idx} className="space-y-6 pr-8 border-r border-gray-100 dark:border-gray-800 last:border-0 relative">
                        <div className="pb-2 border-b-2 border-primary/20">
                            <span className="text-[9px] font-black text-primary uppercase tracking-tighter block">Day 0{idx + 1}</span>
                            <h4 className="text-lg font-bold text-gray-900 dark:text-white">{day.day}</h4>
                        </div>

                        {/* Meals */}
                        {[
                            { type: 'Breakfast', data: day.meals.breakfast },
                            { type: 'Lunch', data: day.meals.lunch },
                            { type: 'Dinner', data: day.meals.dinner }
                        ].map((meal, mIdx) => (
                            <div
                                key={mIdx}
                                onClick={() => setSelectedRecipe(meal.data)}
                                className="bg-white dark:bg-zinc-800 p-3 rounded-2xl shadow-[0_4px_12px_-2px_rgba(0,0,0,0.05)] border border-gray-100 dark:border-gray-700 flex items-center gap-4 hover:shadow-md transition-all group cursor-pointer hover:border-primary/30"
                            >
                                <div className="w-[40%] flex-shrink-0">
                                    <div
                                        className="aspect-square rounded-lg bg-cover bg-center transition-colors relative overflow-hidden"
                                        style={{
                                            backgroundColor: meal.data.imageColor || '',
                                        }}
                                    >
                                        <div className="absolute inset-0">
                                            {meal.data.imageUrl && (
                                                <ImageWithFallback 
                                                    src={meal.data.imageUrl} 
                                                    alt={meal.data.name} 
                                                    fill
                                                    className="object-cover transition-opacity duration-300 hover:opacity-90"
                                                    sizes="(max-width: 768px) 33vw, 15vw"
                                                />
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col flex-1 min-w-0">
                                    <span className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">{meal.type}</span>
                                    <h5 className="text-sm font-bold text-gray-900 dark:text-white leading-tight mb-2 line-clamp-2">{meal.data.name}</h5>
                                    <div className="flex items-center gap-2 mt-auto">
                                        <div className="text-[9px] font-bold text-primary uppercase tracking-widest group-hover:underline">View</div>
                                        <div className="text-[9px] font-bold text-gray-300 dark:text-gray-600 uppercase tracking-widest">
                                            {meal.data.calories} cal
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ))}
            </div>

            {selectedRecipe && (
                <RecipeDetail
                    recipe={selectedRecipe}
                    onClose={() => setSelectedRecipe(null)}
                />
            )}
        </div>
    );
}
