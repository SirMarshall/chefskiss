"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, updateUser } from '@/lib/auth-client';
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
        {
            name: 'Chef',
            role: 'Head Chef',
            isSelf: true,
            image: undefined as string | undefined
        }
    ]);

    // Sync session data when it loads
    useEffect(() => {
        if (session?.user) {
            setFamilyMembers(prev => {
                // Check if we already have the user's data to avoid infinite loops or unnecessary updates
                const currentSelf = prev.find(m => m.isSelf);
                const newName = session.user.name?.split(' ')[0] || 'Chef';

                if (currentSelf && currentSelf.name === newName && currentSelf.image === session.user.image) {
                    return prev;
                }

                return prev.map(member =>
                    member.isSelf ? {
                        ...member,
                        name: newName,
                        image: session.user.image || undefined
                    } : member
                );
            });
        }
    }, [session]);

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
            // First save the complex preferences to our DB via custom API
            // (These fields are not in the default auth user schema managed by better-auth client directly in this setup)
            const response = await fetch('/api/user/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    onboardingComplete: true, // We send this here too for DB consistency
                    preferences: {
                        dietaryRestrictions: preferences.dietary,
                        allergens: preferences.allergens,
                        favorites: preferences.favorites,
                        spiceLevel: preferences.spiceLevel.toLowerCase()
                    }
                })
            });

            if (!response.ok) {
                throw new Error("Failed to save profile preferences");
            }

            // CRITICAL: Update the session state immediately using better-auth client
            // This prevents the redirect loop where the dashboard sees stale session data
            const { error } = await updateUser({
                onboardingComplete: true
            } as any);

            if (error) {
                console.error("Session update error:", error);
                // Continue anyway since DB is updated, but might need refresh
            }

            toast("Profile setup complete! Preparing your kitchen...", "success");
            // Use router.push for smoother transition, session should be updated now
            router.push('/dashboard');

        } catch (error) {
            console.error("Onboarding error:", error);
            toast("Something went wrong. Please try again.", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-screen w-full bg-white overflow-hidden">
            {/* Full Screen Container */}
            <div className="w-full h-full bg-white flex flex-col md:flex-row relative">

                {/* Sidebar */}
                <aside className="w-full md:w-[320px] lg:w-[400px] flex-shrink-0 flex flex-col p-8 border-r border-gray-200/50 overflow-hidden relative" style={{
                    backgroundColor: '#e5e5e5',
                    backgroundImage: 'linear-gradient(to bottom right, #f0f0f0, #e0e0e0)'
                }}>
                    <div className="mb-8">
                        <h1 className="text-4xl tracking-widest font-light text-gray-900 uppercase leading-none mb-1 font-sans">CHEF'S</h1>
                        <h1 className="text-5xl font-serif italic font-bold text-gray-900 leading-none">KISS</h1>
                        <div className="w-12 h-0.5 bg-gray-800 mt-6 mb-4"></div>
                        <p className="text-xs font-bold tracking-[0.2em] text-gray-800 uppercase font-mono">
                            Generative Personal<br />Meal Prep AI
                        </p>
                    </div>

                    {/* Sample Menu Preview (Visual only) */}
                    <div className="flex-1 flex flex-col min-h-0 mb-auto">
                        <h2 className="text-xs font-bold text-gray-400 tracking-[0.3em] uppercase mb-6 font-mono">Sample Weekly Menu</h2>

                        {/* Meal Switcher */}
                        <div className="flex space-x-1 mb-6 bg-gray-200/50 p-1.5 rounded-xl">
                            {(['breakfast', 'lunch', 'dinner'] as MealType[]).map((meal) => (
                                <button
                                    key={meal}
                                    onClick={() => setActiveMeal(meal)}
                                    className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all font-mono ${activeMeal === meal
                                        ? 'bg-white shadow-sm text-[#d64d08]'
                                        : 'text-gray-400 hover:text-gray-600'
                                        }`}
                                >
                                    {meal.charAt(0)}
                                </button>
                            ))}
                        </div>

                        <div className="relative">
                            <div className="bg-white rounded-2xl p-5 border-2 border-[#d64d08] shadow-lg transition-all duration-300 mb-4">
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-[10px] font-bold text-[#d64d08] uppercase tracking-widest font-mono">
                                        {activeMeal} (Focus)
                                    </span>
                                </div>
                                <div className="flex gap-4 items-center">
                                    <div className={`w-16 h-16 flex-shrink-0 ${currentSampleMeals[activeMeal].imageColor} rounded-xl shadow-inner`}></div>
                                    <div>
                                        <div className="text-base font-bold text-gray-900 font-sans leading-tight mb-2">
                                            {currentSampleMeals[activeMeal].name}
                                        </div>
                                        <div className="text-[10px] text-gray-400 uppercase tracking-widest font-mono">
                                            {currentSampleMeals[activeMeal].stats}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-auto pt-8 border-t border-gray-300/50 italic text-gray-500 text-lg leading-relaxed font-serif">
                        "The secret of success is to eat what you like and let the food fight it out inside."
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 bg-[#F9FAFB] relative overflow-hidden flex flex-col">
                    <div className="flex-1 overflow-y-auto hide-scrollbar p-6 md:p-12 lg:p-16">
                        <div className="max-w-[1200px] mx-auto w-full h-full flex flex-col justify-center">

                            {/* Step 1: Family */}
                            <section className="mb-10">
                                <div className="flex justify-between items-end mb-6">
                                    <div>
                                        <span className="text-xs font-bold text-[#d64d08] tracking-[0.3em] uppercase mb-3 block font-mono">Step 01</span>
                                        <h2 className="text-4xl font-light text-gray-900 font-sans">Build Your Family</h2>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-6 items-start">
                                    {familyMembers.map((member: any, idx) => (
                                        <div key={idx} className="flex flex-col items-center space-y-2">
                                            <div className="relative group">
                                                <div className="w-20 h-20 rounded-full border-2 border-[#d64d08] p-0.5 ring-4 ring-transparent group-hover:ring-[#d64d08]/10 transition-all cursor-pointer shadow-sm">
                                                    <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-gray-900 font-serif italic text-3xl overflow-hidden">
                                                        {member.image ? (
                                                            <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            member.name.charAt(0)
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="absolute -top-1 -right-1 bg-[#d64d08] text-white p-1 rounded-full shadow-md border-2 border-white">
                                                    <span className="material-symbols-outlined text-[10px] block font-bold">check</span>
                                                </div>
                                            </div>
                                            <span className="text-xs font-bold text-gray-900 uppercase tracking-widest font-mono">{member.name}</span>
                                        </div>
                                    ))}
                                    <div className="flex flex-col items-center space-y-2">
                                        <button
                                            onClick={handleAddMember}
                                            className="w-20 h-20 rounded-full border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-300 hover:border-[#d64d08] hover:text-[#d64d08] hover:bg-orange-50 transition-all group"
                                        >
                                            <span className="material-symbols-outlined text-2xl">add</span>
                                        </button>
                                        <span className="text-xs font-bold text-gray-300 uppercase tracking-widest font-mono group-hover:text-[#d64d08]">Add</span>
                                    </div>
                                </div>
                            </section>

                            <hr className="border-gray-200 mb-10" />

                            {/* Step 2: Preferences */}
                            <section className="mb-8">
                                <div className="mb-8">
                                    <span className="text-xs font-bold text-[#d64d08] tracking-[0.3em] uppercase mb-3 block font-mono">Step 02</span>
                                    <h2 className="text-4xl font-light text-gray-900 uppercase tracking-tight font-sans">{familyMembers[0].name}'s Preferences</h2>
                                </div>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <div className="flex flex-col gap-6">
                                        {/* Dietary */}
                                        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 font-mono">Dietary Preferences</label>
                                            <div className="flex flex-wrap gap-2">
                                                {['Keto', 'Vegan', 'Paleo', 'Vegetarian', 'Pescatarian', 'Low Carb', 'Gluten-Free'].map(diet => (
                                                    <div
                                                        key={diet}
                                                        onClick={() => togglePreference('dietary', diet)}
                                                        className={`px-5 py-3 rounded-full border text-[10px] font-bold uppercase tracking-widest transition-all cursor-pointer font-mono ${preferences.dietary.includes(diet) ? 'bg-[#d64d08] border-[#d64d08] text-white shadow-md' : 'border-gray-200 hover:border-[#d64d08] hover:text-[#d64d08] hover:bg-orange-50'}`}
                                                    >
                                                        {diet}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Spice Level */}
                                        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 font-mono">Spice Level</label>
                                            <div className="flex items-center justify-between bg-gray-50 p-1 rounded-full border border-gray-100">
                                                {['None', 'Mild', 'Medium', 'Hot'].map(level => (
                                                    <button
                                                        key={level}
                                                        onClick={() => handleSpiceLevel(level)}
                                                        className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-widest rounded-full transition-all font-mono ${preferences.spiceLevel === level ? 'bg-white shadow-sm text-[#d64d08] ring-1 ring-gray-100' : 'text-gray-400 hover:text-gray-600'}`}
                                                    >
                                                        {level}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Favorites */}
                                        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 font-mono">Favorite Ingredients</label>
                                            <div className="relative group">
                                                <input
                                                    className="w-full bg-white border border-gray-200 rounded-xl text-sm px-4 py-3 focus:outline-none focus:border-[#d64d08] focus:ring-1 focus:ring-[#d64d08]/20 transition-all placeholder-gray-300 font-sans"
                                                    placeholder="e.g. Avocado, Salmon, Basil"
                                                    type="text"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-6">
                                        {/* Common Allergens */}
                                        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 font-mono">Common Allergens</label>
                                            <div className="flex flex-wrap gap-2">
                                                {['Peanuts', 'Shellfish', 'Dairy', 'Soy', 'Tree Nuts', 'Wheat'].map(allergen => (
                                                    <div
                                                        key={allergen}
                                                        onClick={() => togglePreference('allergens', allergen)}
                                                        className={`px-5 py-3 rounded-full border text-[10px] font-bold uppercase tracking-widest transition-all cursor-pointer font-mono ${preferences.allergens.includes(allergen) ? 'bg-[#d64d08] border-[#d64d08] text-white shadow-md' : 'border-gray-200 hover:border-[#d64d08] hover:text-[#d64d08] hover:bg-orange-50'}`}
                                                    >
                                                        {allergen}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Custom Allergens */}
                                        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 font-mono">Custom Allergens</label>
                                            <div className="relative group">
                                                <input
                                                    className="w-full bg-white border border-gray-200 rounded-xl text-sm px-4 py-3 focus:outline-none focus:border-[#d64d08] focus:ring-1 focus:ring-[#d64d08]/20 transition-all placeholder-gray-300 font-sans"
                                                    placeholder="Type and press enter to add..."
                                                    type="text"
                                                />
                                                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                                    <span className="material-symbols-outlined text-gray-300 text-lg">keyboard_return</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Disliked Ingredients */}
                                        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 font-mono">Disliked Ingredients</label>
                                            <div className="relative group">
                                                <input
                                                    className="w-full bg-white border border-gray-200 rounded-xl text-sm px-4 py-3 focus:outline-none focus:border-[#d64d08] focus:ring-1 focus:ring-[#d64d08]/20 transition-all placeholder-gray-300 font-sans"
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
                    <div className="p-6 border-t border-gray-100 bg-white/90 backdrop-blur-md flex justify-end items-center mt-auto z-10 sticky bottom-0">
                        <button
                            onClick={handleComplete}
                            disabled={loading}
                            className="bg-[#d64d08] hover:bg-[#b54006] text-white font-bold tracking-[0.3em] uppercase text-xs px-12 py-5 rounded-full shadow-lg hover:shadow-orange-500/30 transition-all duration-300 transform active:scale-95 flex items-center space-x-3 font-mono disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <span>{loading ? "SAVING..." : "CONTINUE"}</span>
                            <span className="material-symbols-outlined text-base">arrow_forward</span>
                        </button>
                    </div>
                </main>
            </div>

            {/* Styles for Material Symbols */}
            <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
        </div>
    );
}
