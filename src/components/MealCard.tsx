"use client";

import { useState } from 'react';

interface MealCardProps {
    meal: any;
    type: string;
    onClick: () => void;
}

export default function MealCard({ meal, type, onClick }: MealCardProps) {
    const [imageError, setImageError] = useState(false);

    return (
        <div
            onClick={onClick}
            className="flex flex-col space-y-3 cursor-pointer group animate-in fade-in zoom-in-95 duration-500"
        >
            <div
                className="aspect-[4/3] bg-gray-100 dark:bg-zinc-700 rounded-2xl relative overflow-hidden group-hover:brightness-95 transition-all bg-cover bg-center"
                style={{
                    backgroundImage: meal.imageUrl && !imageError ? `url('${meal.imageUrl}')` : 'none',
                    backgroundColor: meal.imageColor || ''
                }}
            >
                <span className="absolute top-3 right-3 bg-white/90 dark:bg-zinc-800/90 backdrop-blur px-2 py-1 rounded text-[9px] font-bold uppercase tracking-wider text-gray-800 dark:text-gray-200 font-mono transition-colors">
                    {type}
                </span>

                {meal.imageUserName && (
                    <div className="absolute bottom-2 left-2 text-[8px] text-white/50 font-mono tracking-tighter mix-blend-difference">
                        {meal.imageUserName} / Unsplash
                    </div>
                )}
            </div>
            <h5 className="text-xs font-bold text-gray-900 dark:text-white line-clamp-2 font-sans group-hover:text-primary transition-colors">
                {meal.name}
            </h5>
        </div>
    );
}
