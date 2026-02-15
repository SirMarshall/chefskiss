"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, updateUser } from '@/lib/auth-client';
import { useToast } from '@/context/ToastContext';
import { useTheme } from '@/context/ThemeContext';

const CUISINE_SUGGESTIONS = ['Japanese', 'Mexican', 'Italian', 'French', 'Indian', 'Thai', 'Mediterranean', 'American'];

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
    const { theme, toggleTheme } = useTheme();
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
        householdSize: number;
        numDays: number;
    }>({
        dietary: [],
        allergens: [],
        dislikes: [],
        favorites: [],
        spiceLevel: 'Medium',
        householdSize: 1,
        numDays: 7
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

    const handleAddItem = (category: 'favorites' | 'dislikes' | 'allergens') => {
        if (!inputValue.trim()) return;

        const newItems = inputValue.split(',').map(item => item.trim()).filter(item => item !== "" && !preferences[category].includes(item));

        setPreferences(prev => ({
            ...prev,
            [category]: [...prev[category], ...newItems]
        }));
        setInputValue("");
    };

    const handleRemoveItem = (category: 'favorites' | 'dislikes' | 'allergens', item: string) => {
        setPreferences(prev => ({
            ...prev,
            [category]: prev[category].filter(i => i !== item)
        }));
    };
    const handleComplete = async () => {
        setLoading(true);

        // Capture current input if any
        let finalPreferences = { ...preferences };
        if (inputValue.trim() && activeInput && ['favorites', 'dislikes', 'allergens'].includes(activeInput)) {
            const category = activeInput as 'favorites' | 'dislikes' | 'allergens';
            if (!finalPreferences[category].includes(inputValue.trim())) {
                finalPreferences[category] = [...finalPreferences[category], inputValue.trim()];
            }
        }

        try {
            // First save the complex preferences to our DB via custom API
            const response = await fetch('/api/user/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    onboardingComplete: true,
                    preferences: {
                        dietaryRestrictions: finalPreferences.dietary,
                        allergens: finalPreferences.allergens,
                        favorites: finalPreferences.favorites,
                        dislikes: finalPreferences.dislikes,
                        spiceLevel: finalPreferences.spiceLevel.toLowerCase(),
                        householdSize: finalPreferences.householdSize,
                        planDuration: finalPreferences.numDays
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

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen w-full bg-background-light dark:bg-background-dark overflow-hidden transition-colors duration-500 flex-col">
            {/* Mobile Header */}
            <header className="md:hidden flex items-center justify-between p-4 border-b border-gray-200/50 dark:border-gray-800/50 bg-panel-left-light dark:bg-panel-left-dark z-50">
                <div className="flex flex-col">
                    <h1 className="text-xl tracking-widest font-light text-gray-900 dark:text-white uppercase leading-none font-sans">CHEF'S</h1>
                    <h1 className="text-2xl font-serif italic font-bold text-gray-900 dark:text-white leading-none">KISS</h1>
                </div>
                <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="p-2 text-gray-900 dark:text-white"
                >
                    <span className="material-symbols-outlined text-3xl">
                        {isSidebarOpen ? 'close' : 'menu'}
                    </span>
                </button>
            </header>

            {/* Full Screen Container */}
            <div className="flex-1 w-full flex flex-col md:flex-row relative overflow-hidden">
                {/* Sidebar */}
                <aside className={`
                    fixed inset-y-0 left-0 z-40 w-[320px] transform transition-transform duration-300 ease-in-out bg-panel-left-light dark:bg-panel-left-dark border-r border-gray-200/50 dark:border-gray-800/50 p-8 flex flex-col
                    md:relative md:translate-x-0 md:w-[320px] lg:w-[400px]
                    ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                `}>
                    <div className="pt-16 md:pt-0">
                        <div className="mb-8 hidden md:block">
                            <h1 className="text-4xl tracking-widest font-light text-gray-900 dark:text-white uppercase leading-none mb-1 font-sans">CHEF'S</h1>
                            <h1 className="text-5xl font-serif italic font-bold text-gray-900 dark:text-white leading-none">KISS</h1>
                            <div className="w-12 h-0.5 bg-gray-800 dark:bg-gray-200 mt-6 mb-4"></div>
                            <p className="text-xs font-bold tracking-[0.2em] text-gray-800 dark:text-gray-300 uppercase font-mono">
                                Generative Personal<br />Meal Prep AI
                            </p>
                        </div>
                    </div>


                    {/* Sample Menu Preview (Visual only) */}
                    <div className="flex-1 flex flex-col min-h-0 mb-auto">
                        <h2 className="text-xs font-bold text-gray-400 tracking-[0.3em] uppercase mb-6 font-mono">Sample Weekly Menu</h2>

                        {/* Meal Switcher */}
                        <div className="flex space-x-1 mb-6 bg-gray-200/50 dark:bg-zinc-800/50 p-1.5 rounded-xl">
                            {(['breakfast', 'lunch', 'dinner'] as MealType[]).map((meal) => (
                                <button
                                    key={meal}
                                    onClick={() => setActiveMeal(meal)}
                                    className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all font-mono ${activeMeal === meal
                                        ? 'bg-white dark:bg-zinc-700 shadow-sm text-primary'
                                        : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                                        }`}
                                >
                                    {meal}
                                </button>
                            ))}
                        </div>

                        <div className="relative">
                            <div className="bg-white dark:bg-zinc-800 rounded-2xl p-5 border-2 border-primary shadow-lg transition-all duration-300 mb-4 font-sans">
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-[10px] font-bold text-primary uppercase tracking-widest font-mono">
                                        {activeMeal} (Focus)
                                    </span>
                                </div>
                                <div className="flex gap-4 items-center">
                                    <div className={`w-16 h-16 flex-shrink-0 ${currentSampleMeals[activeMeal].imageColor} rounded-xl shadow-inner`}></div>
                                    <div>
                                        <div className="text-base font-bold text-gray-900 dark:text-white font-sans leading-tight mb-2">
                                            {currentSampleMeals[activeMeal].name}
                                        </div>
                                        <div className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-widest font-mono">
                                            {currentSampleMeals[activeMeal].stats}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-auto pt-8 border-t border-gray-300/50 text-gray-500 dark:text-gray-400 leading-relaxed font-serif">
                        <div className="text-xl italic mb-2">"Anyone can cook"</div>
                        <div className="text-sm uppercase tracking-[0.2em] font-bold font-mono">— Chef Auguste Gusteau</div>
                    </div>

                    <button
                        onClick={toggleTheme}
                        className="mt-6 flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-primary transition-colors font-mono"
                    >
                        <span className="material-symbols-outlined text-xl">
                            {theme === 'dark' ? 'light_mode' : 'dark_mode'}
                        </span>
                        {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                    </button>
                </aside>

                {/* Mobile Sidebar Overlay */}
                {isSidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm transition-opacity"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                )}

                {/* Main Content */}
                <main className="flex-1 bg-[#F9FAFB] dark:bg-zinc-900 relative overflow-hidden flex flex-col transition-colors duration-500">
                    <div className="flex-1 overflow-y-auto hide-scrollbar p-6 md:p-12 lg:p-16">
                        <div className="max-w-[1200px] mx-auto w-full flex flex-col pt-10 pb-20">

                            {/* Step 1: Family */}
                            <section className="mb-10">
                                <div className="flex justify-between items-end mb-6">
                                    <div>
                                        <span className="text-xs font-bold text-primary tracking-[0.3em] uppercase mb-3 block font-mono">Step 01</span>
                                        <h2 className="text-3xl sm:text-4xl font-light text-gray-900 dark:text-white font-sans">Build Your Family</h2>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-4 sm:gap-6 items-start">
                                    {familyMembers.map((member: any, idx) => (
                                        <div key={idx} className="flex flex-col items-center space-y-2">
                                            <div className="relative group">
                                                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-primary p-0.5 ring-4 ring-transparent group-hover:ring-primary/10 transition-all cursor-pointer shadow-sm">
                                                    <div className="w-full h-full rounded-full bg-white dark:bg-zinc-800 flex items-center justify-center text-gray-900 dark:text-white font-serif italic text-2xl sm:text-3xl overflow-hidden">
                                                        {member.image ? (
                                                            <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            member.name.charAt(0)
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="absolute -top-1 -right-1 bg-primary text-white p-1 rounded-full shadow-md border-2 border-white dark:border-zinc-800">
                                                    <span className="material-symbols-outlined text-[10px] block font-bold">check</span>
                                                </div>
                                            </div>
                                            <span className="text-[10px] sm:text-xs font-bold text-gray-900 dark:text-gray-100 uppercase tracking-widest font-mono">{member.name}</span>
                                        </div>
                                    ))}
                                    <div className="flex flex-col items-center space-y-2">
                                        <button
                                            onClick={handleAddMember}
                                            className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-dashed border-gray-300 dark:border-gray-700 flex flex-col items-center justify-center text-gray-300 dark:text-gray-600 hover:border-primary hover:text-primary hover:bg-orange-50 dark:hover:bg-primary/10 transition-all group"
                                        >
                                            <span className="material-symbols-outlined text-2xl">add</span>
                                        </button>
                                        <span className="text-[10px] sm:text-xs font-bold text-gray-300 dark:text-gray-600 uppercase tracking-widest font-mono group-hover:text-primary transition-colors">Add Member</span>
                                    </div>
                                </div>

                                {/* Household Size Quick Selection */}
                                <div className="mt-8 bg-white dark:bg-zinc-800 p-8 sm:p-10 rounded-3xl border-2 border-gray-100 dark:border-gray-800 shadow-xl max-w-xl transition-all">
                                    <div className="flex justify-between items-center mb-8">
                                        <label className="block text-sm font-bold text-gray-900 dark:text-white uppercase tracking-[0.2em] font-mono">Household Size</label>
                                        <div className="flex items-center gap-3">
                                            <span className="text-3xl font-light text-primary font-sans">{preferences.householdSize}</span>
                                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest font-mono">{preferences.householdSize === 1 ? 'Chef' : 'People'}</span>
                                        </div>
                                    </div>
                                    <div className="relative pt-4 pb-8">
                                        <input
                                            value={preferences.householdSize}
                                            onChange={(e) => setPreferences(prev => ({ ...prev, householdSize: Math.max(1, parseInt(e.target.value) || 1) }))}
                                            type="range"
                                            min="1"
                                            max="10"
                                            step="1"
                                            className="w-full h-3 bg-gray-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-primary"
                                        />
                                        <div className="flex justify-between mt-6 px-1">
                                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                                                <div key={n} className="flex flex-col items-center gap-2">
                                                    <div className={`w-1 h-3 rounded-full transition-colors ${preferences.householdSize === n ? 'bg-primary' : 'bg-gray-300 dark:bg-zinc-600'}`}></div>
                                                    <span className={`text-xs font-bold font-mono transition-all ${preferences.householdSize === n ? 'text-primary scale-110' : 'text-gray-400 dark:text-gray-500'}`}>
                                                        {n}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <hr className="border-gray-200 dark:border-gray-800 mb-10" />

                            {/* Step 2: Preferences */}
                            <section className="mb-8">
                                <div className="mb-8">
                                    <span className="text-xs font-bold text-primary tracking-[0.3em] uppercase mb-3 block font-mono">Step 02</span>
                                    <h2 className="text-3xl sm:text-4xl font-light text-gray-900 dark:text-white uppercase tracking-tight font-sans">{familyMembers[0].name}'s Preferences</h2>
                                </div>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* ... rest of the content remains the same structure ... */}
                                    <div className="flex flex-col gap-6">
                                        {/* Dietary */}
                                        <div className="bg-white dark:bg-zinc-800 p-6 sm:p-8 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all">
                                            <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-6 font-mono">Dietary Preferences</label>
                                            <div className="flex flex-wrap gap-2">
                                                {['Keto', 'Vegan', 'Paleo', 'Vegetarian', 'Pescatarian', 'Low Carb', 'Gluten-Free'].map(diet => (
                                                    <div
                                                        key={diet}
                                                        onClick={() => togglePreference('dietary', diet)}
                                                        className={`px-4 py-2 sm:px-5 sm:py-3 rounded-full border text-[9px] sm:text-[10px] font-bold uppercase tracking-widest transition-all cursor-pointer font-mono ${preferences.dietary.includes(diet) ? 'bg-primary border-primary text-white shadow-md' : 'border-gray-200 dark:border-gray-700 dark:text-gray-400 hover:border-primary hover:text-primary hover:bg-orange-50 dark:hover:bg-primary/10'}`}
                                                    >
                                                        {diet}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Spice Level */}
                                        <div className="bg-white dark:bg-zinc-800 p-6 sm:p-8 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all">
                                            <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-6 font-mono">Spice Level</label>
                                            <div className="flex items-center justify-between bg-gray-50 dark:bg-zinc-900/50 p-1 rounded-full border border-gray-100 dark:border-gray-800">
                                                {['None', 'Mild', 'Medium', 'Hot'].map(level => (
                                                    <button
                                                        key={level}
                                                        onClick={() => handleSpiceLevel(level)}
                                                        className={`flex-1 py-2 sm:py-3 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest rounded-full transition-all font-mono ${preferences.spiceLevel === level ? 'bg-white dark:bg-zinc-700 shadow-sm text-primary ring-1 ring-gray-100 dark:ring-gray-800' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
                                                    >
                                                        {level}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Favorites as Cuisines */}
                                        <div className="bg-white dark:bg-zinc-800 p-6 sm:p-8 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all">
                                            <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-6 font-mono">Favorite Cuisines</label>

                                            {/* Suggestions */}
                                            <div className="mb-6">
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 block font-mono">Suggestions</span>
                                                <div className="flex flex-wrap gap-2">
                                                    {CUISINE_SUGGESTIONS.filter(s => !preferences.favorites.includes(s)).map(suggestion => (
                                                        <button
                                                            key={suggestion}
                                                            onClick={() => {
                                                                setPreferences(prev => ({ ...prev, favorites: [...prev.favorites, suggestion] }));
                                                            }}
                                                            className="px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 hover:border-primary hover:text-primary transition-all font-mono"
                                                        >
                                                            + {suggestion}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap gap-2 mb-4">
                                                {preferences.favorites.map(cuisine => (
                                                    <div key={cuisine} className="bg-primary dark:bg-primary text-white px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-orange-500/20 flex items-center gap-2 border border-primary animate-in fade-in zoom-in duration-300">
                                                        {cuisine}
                                                        <button onClick={() => handleRemoveItem('favorites', cuisine)} className="hover:text-white/70 transition-colors">
                                                            <span className="material-symbols-outlined text-sm">close</span>
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="relative group">
                                                <input
                                                    className="w-full bg-white dark:bg-zinc-700 border border-gray-200 dark:border-gray-700 rounded-xl text-sm px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all placeholder-gray-300 dark:placeholder-gray-600 font-sans text-gray-900 dark:text-white"
                                                    placeholder="e.g. Japanese, Mexican"
                                                    type="text"
                                                    value={activeInput === 'favorites' ? inputValue : ""}
                                                    onFocus={() => { setActiveInput('favorites'); setInputValue(""); }}
                                                    onChange={(e) => setInputValue(e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            handleAddItem('favorites');
                                                        }
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-6">
                                        {/* Common Allergens */}
                                        <div className="bg-white dark:bg-zinc-800 p-6 sm:p-8 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all">
                                            <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-6 font-mono">Common Allergens</label>
                                            <div className="flex flex-wrap gap-2">
                                                {['Peanuts', 'Shellfish', 'Dairy', 'Soy', 'Tree Nuts', 'Wheat'].map(allergen => (
                                                    <div
                                                        key={allergen}
                                                        onClick={() => togglePreference('allergens', allergen)}
                                                        className={`px-4 py-2 sm:px-5 sm:py-3 rounded-full border text-[9px] sm:text-[10px] font-bold uppercase tracking-widest transition-all cursor-pointer font-mono ${preferences.allergens.includes(allergen) ? 'bg-primary border-primary text-white shadow-md' : 'border-gray-200 dark:border-gray-700 dark:text-gray-400 hover:border-primary hover:text-primary hover:bg-orange-50 dark:hover:bg-primary/10'}`}
                                                    >
                                                        {allergen}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Custom Allergens */}
                                        <div className="bg-white dark:bg-zinc-800 p-6 sm:p-8 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all">
                                            <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-6 font-mono">Custom Allergens</label>
                                            <div className="flex flex-wrap gap-2 mb-4">
                                                {preferences.allergens.filter(a => !['Peanuts', 'Shellfish', 'Dairy', 'Soy', 'Tree Nuts', 'Wheat'].includes(a)).map(allergen => (
                                                    <div key={allergen} className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 border border-red-100 dark:border-red-900/40 transition-colors">
                                                        {allergen}
                                                        <button onClick={() => handleRemoveItem('allergens', allergen)} className="hover:text-red-500 transition-colors">
                                                            <span className="material-symbols-outlined text-xs">close</span>
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="relative group">
                                                <input
                                                    className="w-full bg-white dark:bg-zinc-700 border border-gray-200 dark:border-gray-700 rounded-xl text-sm px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all placeholder-gray-300 dark:placeholder-gray-600 font-sans text-gray-900 dark:text-white"
                                                    placeholder="Type to add..."
                                                    type="text"
                                                    value={activeInput === 'allergens' ? inputValue : ""}
                                                    onFocus={() => { setActiveInput('allergens'); setInputValue(""); }}
                                                    onChange={(e) => setInputValue(e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            handleAddItem('allergens');
                                                        }
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        {/* Disliked Ingredients */}
                                        <div className="bg-white dark:bg-zinc-800 p-6 sm:p-8 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all">
                                            <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-6 font-mono">Disliked Ingredients</label>
                                            <div className="flex flex-wrap gap-2 mb-4">
                                                {preferences.dislikes.map(dislike => (
                                                    <div key={dislike} className="bg-gray-100 dark:bg-zinc-900 text-gray-600 dark:text-gray-400 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 border border-gray-200 dark:border-gray-700 transition-colors">
                                                        {dislike}
                                                        <button onClick={() => handleRemoveItem('dislikes', dislike)} className="hover:text-red-500 transition-colors">
                                                            <span className="material-symbols-outlined text-xs">close</span>
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="relative group">
                                                <input
                                                    className="w-full bg-white dark:bg-zinc-700 border border-gray-200 dark:border-gray-700 rounded-xl text-sm px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all placeholder-gray-300 dark:placeholder-gray-600 font-sans text-gray-900 dark:text-white"
                                                    placeholder="e.g. Cilantro, Olives"
                                                    type="text"
                                                    value={activeInput === 'dislikes' ? inputValue : ""}
                                                    onFocus={() => { setActiveInput('dislikes'); setInputValue(""); }}
                                                    onChange={(e) => setInputValue(e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            handleAddItem('dislikes');
                                                        }
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <hr className="border-gray-200 dark:border-gray-800 mb-10" />

                            {/* Step 3: Plan Config */}
                            <section className="mb-20">
                                <div className="mb-8">
                                    <span className="text-xs font-bold text-primary tracking-[0.3em] uppercase mb-3 block font-mono">Step 03</span>
                                    <h2 className="text-3xl sm:text-4xl font-light text-gray-900 dark:text-white uppercase tracking-tight font-sans">Kitchen Setup</h2>
                                </div>
                                <div className="max-w-xl">
                                    <div className="bg-white dark:bg-zinc-800 p-6 sm:p-8 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all">
                                        <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-6 font-mono">Plan Duration</label>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 font-sans">How many days should your first custom meal plan cover?</p>
                                        <div className="grid grid-cols-4 gap-3">
                                            {[1, 3, 5, 7].map((days) => (
                                                <button
                                                    key={days}
                                                    onClick={() => setPreferences(prev => ({ ...prev, numDays: days }))}
                                                    className={`py-4 text-xs font-bold tracking-[0.2em] uppercase rounded-xl border-2 transition-all font-mono ${preferences.numDays === days
                                                        ? 'bg-primary border-primary text-white shadow-lg shadow-orange-500/20 scale-105'
                                                        : 'bg-white dark:bg-zinc-700 text-gray-500 dark:text-gray-400 border-gray-100 dark:border-gray-700 hover:border-primary/50 hover:text-primary'
                                                        }`}
                                                >
                                                    {days} Days
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>

                    {/* Footer / Continue */}
                    <div className="p-4 sm:p-8 border-t border-gray-100 dark:border-gray-800 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl flex justify-end items-center mt-auto z-10 sticky bottom-0 transition-colors shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
                        <div className="max-w-[1200px] mx-auto w-full flex justify-end">
                            <button
                                onClick={handleComplete}
                                disabled={loading}
                                className="bg-primary hover:bg-primary-dark text-white font-bold tracking-[0.3em] uppercase text-xs sm:text-sm px-10 py-5 sm:px-16 sm:py-6 rounded-full shadow-2xl hover:shadow-orange-500/40 transition-all duration-300 transform active:scale-95 flex items-center space-x-4 font-mono disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto justify-center"
                            >
                                <span className="drop-shadow-sm">{loading ? "MASTERING YOUR KITCHEN..." : "COMPLETE SETUP"}</span>
                                {!loading && <span className="material-symbols-outlined text-xl">chef_hat</span>}
                            </button>
                        </div>
                    </div>
                </main>
            </div>

            {/* Styles for Material Symbols */}
            <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
        </div>
    );
}
