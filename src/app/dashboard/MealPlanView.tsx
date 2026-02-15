
import React from 'react';

interface MealPlanViewProps {
    mealPlan: any;
}

export default function MealPlanView({ mealPlan }: MealPlanViewProps) {
    if (!mealPlan || !mealPlan.days) return null;

    return (
        <div className="w-full h-full overflow-x-auto overflow-y-auto pb-12">
            <div className="meal-matrix-grid min-w-[1800px] p-1">
                {mealPlan.days.map((day: any, idx: number) => (
                    <div key={idx} className="space-y-6 pr-8 border-r border-gray-100 last:border-0 relative">
                        <div className="pb-2 border-b-2 border-[#d64d08]/20">
                            <span className="text-[9px] font-black text-[#d64d08] uppercase tracking-tighter block">Day 0{idx + 1}</span>
                            <h4 className="text-lg font-bold text-gray-900">{day.day}</h4>
                        </div>

                        {/* Meals */}
                        {[
                            { type: 'Breakfast', data: day.meals.breakfast },
                            { type: 'Lunch', data: day.meals.lunch },
                            { type: 'Dinner', data: day.meals.dinner }
                        ].map((meal, mIdx) => (
                            <div key={mIdx} className="bg-white p-3 rounded-2xl shadow-[0_4px_12px_-2px_rgba(0,0,0,0.05)] border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow group cursor-pointer hover:border-[#d64d08]/30">
                                <div className="w-[40%] flex-shrink-0">
                                    <div
                                        className="aspect-square rounded-lg bg-cover bg-center"
                                        style={{
                                            backgroundColor: meal.data.imageColor || '#eee',
                                        }}
                                    ></div>
                                </div>
                                <div className="flex flex-col flex-1 min-w-0">
                                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">{meal.type}</span>
                                    <h5 className="text-sm font-bold text-gray-900 leading-tight mb-2 line-clamp-2">{meal.data.name}</h5>
                                    <div className="flex items-center gap-2 mt-auto">
                                        <div className="text-[9px] font-bold text-[#d64d08] uppercase tracking-widest group-hover:underline">View</div>
                                        <div className="text-[9px] font-bold text-gray-300 uppercase tracking-widest">
                                            {meal.data.calories} cal
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}
