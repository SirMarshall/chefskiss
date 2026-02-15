"use client";

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import { useToast } from '@/context/ToastContext';

// Define Sample Meals Structure
type MealType = 'breakfast' | 'lunch' | 'dinner';
type DietType = 'standard' | 'keto' | 'vegan' | 'paleo' | 'vegetarian' | 'pescatarian' | 'low carb' | 'gluten-free';

interface Meal {
    name: string;
    stats: string;
    imageColor: string;
}

const SAMPLE_MEALS: Record<string, Record<MealType, Meal>> = {
    standard: {
        breakfast: { name: "Avocado Toast & Poached Egg", stats: "18g Protein • 350 Cal", imageColor: "bg-green-100" },
        lunch: { name: "Grilled Chicken Caesar Salad", stats: "35g Protein • 450 Cal", imageColor: "bg-yellow-100" },
        dinner: { name: "Miso Glazed Salmon", stats: "42g Protein • 520 Cal", imageColor: "bg-orange-100" }
    },
    vegan: {
        breakfast: { name: "Tofu Scramble Burrito", stats: "22g Protein • 380 Cal", imageColor: "bg-green-100" },
        lunch: { name: "Quinoa & Roasted Veggie Bowl", stats: "18g Protein • 420 Cal", imageColor: "bg-red-100" },
        dinner: { name: "Lentil Shepherd's Pie", stats: "24g Protein • 480 Cal", imageColor: "bg-orange-100" }
    },
    keto: {
        breakfast: { name: "Bacon & Spinach Frittata", stats: "28g Protein • 6g Carbs", imageColor: "bg-yellow-100" },
        lunch: { name: "Cobb Salad with Ranch", stats: "32g Protein • 8g Carbs", imageColor: "bg-green-100" },
        dinner: { name: "Steak with Asparagus", stats: "45g Protein • 5g Carbs", imageColor: "bg-red-100" }
    }
};

export default function OnboardingPage() {
    const router = useRouter();
    const { data: session } = useSession();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    // UI State
    const [activeMeal, setActiveMeal] = useState<MealType>('dinner');

    // Form State
    const [familyMembers, setFamilyMembers] = useState([
        { name: session?.user?.name?.split(' ')[0] || 'Chef', role: 'Head Chef', isSelf: true }
    ]);

    const [preferences, setPreferences] = useState<{
        dietary: string[];
        allergens: string[];
        dislikes: string[];
        favorites: string[];
        spiceLevel: string;
    }>({
        dietary: [],
        allergens: [],
        dislikes: [],
        favorites: [],
        spiceLevel: 'Medium'
    });

    const [inputValue, setInputValue] = useState("");
    const [activeInput, setActiveInput] = useState<keyof typeof preferences | null>(null);

    // Derived State for Sample Menu
    const currentSampleMeals = useMemo(() => {
        // Simple logic to pick a diet type for the sample based on selection
        let selectedDiet = 'standard';
        if (preferences.dietary.includes('Vegan')) selectedDiet = 'vegan';
        else if (preferences.dietary.includes('Keto') || preferences.dietary.includes('Low Carb')) selectedDiet = 'keto';
        else if (preferences.dietary.includes('Vegetarian')) selectedDiet = 'vegan'; // Fallback to vegan for vegetarian sample

        return SAMPLE_MEALS[selectedDiet] || SAMPLE_MEALS['standard'];
    }, [preferences.dietary]);

    const togglePreference = (category: 'dietary' | 'allergens', item: string) => {
        setPreferences(prev => {
            const list = prev[category];
            if (list.includes(item)) {
                return { ...prev, [category]: list.filter(i => i !== item) };
            } else {
                return { ...prev, [category]: [...list, item] };
            }
        });
    };

    const handleSpiceLevel = (level: string) => {
        setPreferences(prev => ({ ...prev, spiceLevel: level }));
    };

    const handleAddMember = () => {
        toast("Multi-profile support is coming soon!");
    };

    const handleComplete = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/user/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    onboardingComplete: true,
                    preferences: {
                        dietaryRestrictions: preferences.dietary,
                        allergens: preferences.allergens,
                        favorites: preferences.favorites,
                        spiceLevel: preferences.spiceLevel.toLowerCase()
                    }
                })
            });

            if (response.ok) {
                toast("Profile setup complete! Preparing your kitchen...", "success");
                window.location.href = '/dashboard';
            } else {
                toast("Failed to save profile. Please try again.", "error");
            }
        } catch (error) {
            console.error("Onboarding error:", error);
            toast("Something went wrong. Please try again.", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center h-screen p-2 md:p-4 overflow-hidden bg-[#1a1a1a]" style={{
            backgroundImage: `linear-gradient(45deg, #111 25%, transparent 25%, transparent 75%, #111 75%, #111), linear-gradient(45deg, #111 25%, transparent 25%, transparent 75%, #111 75%, #111)`,
            backgroundSize: '60px 60px',
            backgroundPosition: '0 0, 30px 30px'
        }}>
            <div className="w-full max-w-[1400px] h-full max-h-[850px] bg-white rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row relative">

                {/* Sidebar */}
                <aside className="w-full md:w-[300px] lg:w-[350px] flex-shrink-0 flex flex-col p-6 border-r border-gray-200/50 overflow-hidden relative" style={{
                    backgroundColor: '#e5e5e5',
                    backgroundImage: 'linear-gradient(to bottom right, #f0f0f0, #e0e0e0)'
                }}>
                    <div className="mb-6">
                        <h1 className="text-2xl tracking-widest font-light text-gray-900 uppercase leading-none mb-1 font-sans">CHEF'S</h1>
                        <h1 className="text-3xl font-serif italic font-bold text-gray-900 leading-none">KISS</h1>
                        <div className="w-8 h-0.5 bg-gray-800 mt-3 mb-2"></div>
                        <p className="text-[8px] font-bold tracking-[0.2em] text-gray-800 uppercase font-mono">
                            Generative Personal<br />Meal Prep AI
                        </p>
                    </div>

                    {/* Sample Menu Preview (Visual only) */}
                    <div className="flex-1 flex flex-col min-h-0 mb-auto">
                        <h2 className="text-[9px] font-bold text-gray-400 tracking-[0.3em] uppercase mb-3 font-mono">Sample Weekly Menu</h2>

                        {/* Meal Switcher */}
                        <div className="flex space-x-1 mb-4 bg-gray-200/50 p-1 rounded-lg">
                            {(['breakfast', 'lunch', 'dinner'] as MealType[]).map((meal) => (
                                <button
                                    key={meal}
                                    onClick={() => setActiveMeal(meal)}
                                    className={`flex-1 py-1.5 text-[8px] font-bold uppercase tracking-wider rounded-md transition-all font-mono ${activeMeal === meal
                                            ? 'bg-white shadow-sm text-[#d64d08]'
                                            : 'text-gray-400 hover:text-gray-600'
                                        }`}
                                >
                                    {meal.charAt(0)}
                                </button>
                            ))}
                        </div>

                        <div className="relative">
                            <div className="bg-white rounded-xl p-3 border-2 border-[#d64d08] shadow-lg transition-all duration-300">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-[8px] font-bold text-[#d64d08] uppercase tracking-widest font-mono">
                                        {activeMeal} (Focus)
                                    </span>
                                </div>
                                <div className="flex gap-3 items-center">
                                    <div className={`w-10 h-10 ${currentSampleMeals[activeMeal].imageColor} rounded-lg`}></div>
                                    <div>
                                        <div className="text-[10px] font-bold text-gray-900 font-sans leading-tight mb-0.5">
                                            {currentSampleMeals[activeMeal].name}
                                        </div>
                                        <div className="text-[7px] text-gray-400 uppercase tracking-widest font-mono">
                                            {currentSampleMeals[activeMeal].stats}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-auto pt-6 border-t border-gray-300/50 italic text-gray-500 text-xs leading-relaxed font-serif">
                        "The secret of success is to eat what you like and let the food fight it out inside."
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 bg-[#F9FAFB] relative overflow-hidden flex flex-col">
                    <div className="flex-1 overflow-y-auto hide-scrollbar">
                        <div className="p-6 md:p-8 max-w-[1000px] mx-auto w-full h-full flex flex-col justify-center">

                            {/* Step 1: Family */}
                            <section className="mb-6">
                                <div className="flex justify-between items-end mb-4">
                                    <div>
                                        <span className="text-[8px] font-bold text-[#d64d08] tracking-[0.3em] uppercase mb-1 block font-mono">Step 01</span>
                                        <h2 className="text-xl font-light text-gray-900 font-sans">Build Your Family</h2>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-4 items-start">
                                    {familyMembers.map((member, idx) => (
                                        <div key={idx} className="flex flex-col items-center space-y-1.5">
                                            <div className="relative group">
                                                <div className="w-12 h-12 rounded-full border-2 border-[#d64d08] p-0.5 ring-2 ring-transparent group-hover:ring-[#d64d08]/20 transition-all cursor-pointer">
                                                    <div className="w-full h-full rounded-full bg-gray-100 flex items-center justify-center text-gray-900 font-serif italic text-lg">
                                                        {member.name.charAt(0)}
                                                    </div>
                                                </div>
                                                <div className="absolute -top-1 -right-1 bg-[#d64d08] text-white p-0.5 rounded-full shadow-md">
                                                    <span className="material-symbols-outlined text-[8px] block">check</span>
                                                </div>
                                            </div>
                                            <span className="text-[8px] font-bold text-gray-900 uppercase tracking-widest font-mono">{member.name}</span>
                                        </div>
                                    ))}
                                    <div className="flex flex-col items-center space-y-1.5">
                                        <button
                                            onClick={handleAddMember}
                                            className="w-12 h-12 rounded-full border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-300 hover:border-[#d64d08] hover:text-[#d64d08] transition-all group"
                                        >
                                            <span className="material-symbols-outlined text-xl">add</span>
                                        </button>
                                    </div>
                                </div>
                            </section>

                            <hr className="border-gray-200/60 mb-6" />

                            {/* Step 2: Preferences */}
                            <section className="mb-4">
                                <div className="mb-4">
                                    <span className="text-[8px] font-bold text-[#d64d08] tracking-[0.3em] uppercase mb-1 block font-mono">Step 02</span>
                                    <h2 className="text-2xl font-light text-gray-900 uppercase tracking-tight font-sans">{familyMembers[0].name}'s Preferences</h2>
                                </div>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                                    <div className="flex flex-col gap-3">
                                        {/* Dietary */}
                                        <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                            <label className="block text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-2 font-mono">Dietary Preferences</label>
                                            <div className="flex flex-wrap gap-1">
                                                {['Keto', 'Vegan', 'Paleo', 'Vegetarian', 'Pescatarian', 'Low Carb', 'Gluten-Free'].map(diet => (
                                                    <div
                                                        key={diet}
                                                        onClick={() => togglePreference('dietary', diet)}
                                                        className={`px-2 py-1 rounded-full border text-[8px] font-bold uppercase tracking-widest transition-all cursor-pointer font-mono ${preferences.dietary.includes(diet) ? 'bg-[#d64d08] border-[#d64d08] text-white shadow-md' : 'border-gray-200 hover:border-[#d64d08] hover:text-[#d64d08]'}`}
                                                    >
                                                        {diet}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Spice Level */}
                                        <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                            <label className="block text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-2 font-mono">Spice Level</label>
                                            <div className="flex items-center justify-between bg-gray-50 p-0.5 rounded-full border border-gray-100">
                                                {['None', 'Mild', 'Medium', 'Hot'].map(level => (
                                                    <button
                                                        key={level}
                                                        onClick={() => handleSpiceLevel(level)}
                                                        className={`flex-1 py-1.5 text-[8px] font-bold uppercase tracking-widest rounded-full transition-all font-mono ${preferences.spiceLevel === level ? 'bg-white shadow-sm text-[#d64d08]' : 'text-gray-400 hover:text-gray-600'}`}
                                                    >
                                                        {level}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Favorites */}
                                        <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                            <label className="block text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-2 font-mono">Favorite Ingredients</label>
                                            <div className="relative group">
                                                <input
                                                    className="w-full bg-white border border-gray-200 rounded-lg text-xs px-2 py-2 focus:outline-none focus:border-[#d64d08] focus:ring-0 transition-colors placeholder-gray-300 font-sans"
                                                    placeholder="e.g. Avocado, Salmon, Basil"
                                                    type="text"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-3">
                                        {/* Common Allergens */}
                                        <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                            <label className="block text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-2 font-mono">Common Allergens</label>
                                            <div className="flex flex-wrap gap-1">
                                                {['Peanuts', 'Shellfish', 'Dairy', 'Soy', 'Tree Nuts', 'Wheat'].map(allergen => (
                                                    <div
                                                        key={allergen}
                                                        onClick={() => togglePreference('allergens', allergen)}
                                                        className={`px-2 py-1 rounded-full border text-[8px] font-bold uppercase tracking-widest transition-all cursor-pointer font-mono ${preferences.allergens.includes(allergen) ? 'bg-[#d64d08] border-[#d64d08] text-white shadow-md' : 'border-gray-200 hover:border-[#d64d08] hover:text-[#d64d08]'}`}
                                                    >
                                                        {allergen}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Custom Allergens */}
                                        <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                            <label className="block text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-2 font-mono">Custom Allergens</label>
                                            <div className="relative group">
                                                <input
                                                    className="w-full bg-white border border-gray-200 rounded-lg text-xs px-2 py-2 focus:outline-none focus:border-[#d64d08] focus:ring-0 transition-colors placeholder-gray-300 font-sans"
                                                    placeholder="Type and press enter to add..."
                                                    type="text"
                                                />
                                                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                                    <span className="material-symbols-outlined text-gray-300 text-sm">keyboard_return</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Disliked Ingredients */}
                                        <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                            <label className="block text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-2 font-mono">Disliked Ingredients</label>
                                            <div className="relative group">
                                                <input
                                                    className="w-full bg-white border border-gray-200 rounded-lg text-xs px-2 py-2 focus:outline-none focus:border-[#d64d08] focus:ring-0 transition-colors placeholder-gray-300 font-sans"
                                                    placeholder="e.g. Cilantro, Olives"
                                                    type="text"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>

                    {/* Footer / Continue */}
                    <div className="p-4 border-t border-gray-100 bg-white/90 backdrop-blur-md flex justify-end items-center mt-auto">
                        <button
                            onClick={handleComplete}
                            disabled={loading}
                            className="bg-[#d64d08] hover:bg-[#b54006] text-white font-bold tracking-[0.3em] uppercase text-[9px] px-8 py-3 rounded-full shadow-lg hover:shadow-orange-500/30 transition-all duration-300 transform active:scale-95 flex items-center space-x-2 font-mono disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <span>{loading ? "SAVING..." : "CONTINUE"}</span>
                            <span className="material-symbols-outlined text-sm">arrow_forward</span>
                        </button>
                    </div>
                </main>
            </div>

            {/* Styles for Material Symbols */}
            <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
        </div>
    );
}
