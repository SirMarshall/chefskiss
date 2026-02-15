import React, { useState } from 'react';
import { Blurhash } from 'react-blurhash';

interface RecipeDetailProps {
    recipe: any;
    onClose: () => void;
}

export default function RecipeDetail({ recipe, onClose }: RecipeDetailProps) {
    const [imageLoaded, setImageLoaded] = useState(false);

    if (!recipe) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-8 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-[1600px] h-full md:max-h-[900px] bg-white dark:bg-zinc-900 rounded-none md:rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row relative animate-in zoom-in-95 duration-200">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-50 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors backdrop-blur-md"
                >
                    <span className="material-symbols-outlined text-2xl">close</span>
                </button>

                {/* Left Side - Image & Header */}
                <main className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-zinc-900 relative">
                    <div className="h-[35%] min-h-[250px] relative w-full flex-shrink-0 group">

                        {/* BlurHash Placeholder */}
                        {recipe.imageBlurHash && (
                            <div className={`absolute inset-0 transition-opacity duration-700 ${imageLoaded ? 'opacity-0' : 'opacity-100'}`}>
                                <Blurhash
                                    hash={recipe.imageBlurHash}
                                    width="100%"
                                    height="100%"
                                    resolutionX={32}
                                    resolutionY={32}
                                    punch={1}
                                />
                            </div>
                        )}

                        {/* Full Image */}
                        {recipe.imageUrl ? (
                            <div
                                className={`absolute inset-0 bg-cover bg-center transition-opacity duration-700 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                                style={{ backgroundImage: `url('${recipe.imageUrl}')` }}
                            >
                                <img
                                    src={recipe.imageUrl}
                                    alt={recipe.name}
                                    className="hidden"
                                    onLoad={() => setImageLoaded(true)}
                                />
                            </div>
                        ) : (
                            // Fallback if no image URL
                            <div
                                className="absolute inset-0 bg-cover bg-center"
                                style={{ backgroundColor: recipe.imageColor || '#ddd' }}
                            ></div>
                        )}


                        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/40 to-transparent dark:from-zinc-900 dark:via-zinc-900/40"></div>

                        {/* Attribution */}
                        {recipe.imageUserName && (
                            <div className="absolute top-4 left-4 text-[10px] text-white/70 bg-black/30 px-2 py-1 rounded backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
                                Photo by <a href={`${recipe.imageUserLink}?utm_source=chefskiss&utm_medium=referral`} target="_blank" rel="noopener noreferrer" className="hover:text-white underline">{recipe.imageUserName}</a> on <a href="https://unsplash.com/?utm_source=chefskiss&utm_medium=referral" target="_blank" rel="noopener noreferrer" className="hover:text-white underline">Unsplash</a>
                            </div>
                        )}

                        <div className="absolute bottom-0 left-0 right-0 p-8 pb-4">
                            <div className="flex items-center space-x-3 mb-3">
                                {recipe.tags && recipe.tags.map((tag: string, i: number) => (
                                    <span key={i} className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm shadow-sm text-primary text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">{tag}</span>
                                ))}
                            </div>
                            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                                <div>
                                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-2 serif-italic tracking-tight">{recipe.name}</h1>
                                    <div className="flex items-center space-x-6 text-sm text-gray-700 dark:text-gray-300 font-medium">
                                        <div className="flex items-center space-x-2">
                                            <span className="material-symbols-outlined text-[20px] text-primary">schedule</span>
                                            <span>{recipe.totalTimeMinutes || (recipe.prepTimeMinutes + recipe.cookTimeMinutes)} min</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <span className="material-symbols-outlined text-[20px] text-primary">restaurant_menu</span>
                                            <span>{recipe.servings} servings</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <span className="material-symbols-outlined text-[20px] text-primary">local_fire_department</span>
                                            <span>{recipe.nutrition?.calories} kcal</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto px-8 pb-8">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                            {/* Ingredients */}
                            <div className="lg:col-span-4 space-y-6">
                                <div className="sticky top-0 bg-white dark:bg-zinc-900 z-10 pt-6 pb-2 border-b border-gray-100 dark:border-gray-800 mb-4">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white uppercase tracking-widest flex items-center">
                                        Ingredients
                                    </h3>
                                </div>
                                <div className="space-y-4">
                                    {recipe.ingredients && recipe.ingredients.map((ingredient: any, i: number) => (
                                        <label key={i} className="flex items-start space-x-3 group cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-800/50 p-2 rounded transition-colors">
                                            <input className="form-checkbox h-5 w-5 text-primary rounded border-gray-300 dark:border-gray-600 focus:ring-primary mt-0.5 custom-checkbox transition duration-150 ease-in-out bg-transparent" type="checkbox" />
                                            <div className="flex-1 border-b border-gray-100 dark:border-gray-800 pb-2 group-hover:border-gray-200 dark:group-hover:border-gray-700 transition-colors">
                                                <span className="font-bold text-gray-900 dark:text-white">{ingredient.quantity} {ingredient.unit}</span>
                                                <span className="text-gray-600 dark:text-gray-400 ml-2">{ingredient.name}</span>
                                                {ingredient.notes && <span className="block text-xs text-gray-400 dark:text-gray-500 italic">{ingredient.notes}</span>}
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Instructions */}
                            <div className="lg:col-span-8">
                                <div className="sticky top-0 bg-white dark:bg-zinc-900 z-10 pt-6 pb-2 border-b border-gray-100 dark:border-gray-800 mb-4">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white uppercase tracking-widest">
                                        Instructions
                                    </h3>
                                </div>
                                <div className="space-y-8 mt-6">
                                    {recipe.instructions && recipe.instructions.map((step: any, i: number) => (
                                        <div key={i} className="flex gap-6 group">
                                            <div className="flex-shrink-0">
                                                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-zinc-800 text-primary font-bold text-sm border border-gray-200 dark:border-gray-700 group-hover:bg-primary group-hover:text-white transition-colors">
                                                    {step.stepNumber}
                                                </span>
                                            </div>
                                            <div className="flex-1 pb-6 border-b border-dashed border-gray-200 dark:border-gray-800">
                                                <h4 className="text-base font-bold text-gray-900 dark:text-white mb-2">Step {step.stepNumber}</h4>
                                                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                                    {step.instruction}
                                                </p>
                                                {step.timerSeconds && (
                                                    <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-900/30 flex items-center gap-3">
                                                        <span className="material-symbols-outlined text-amber-600 dark:text-amber-500 text-sm">timer</span>
                                                        <p className="text-xs text-amber-800 dark:text-amber-200 font-medium">Timer: {Math.floor(step.timerSeconds / 60)} min</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
