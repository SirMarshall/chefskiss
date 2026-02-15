"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import { useToast } from '@/context/ToastContext';

export default function OnboardingPage() {
    const router = useRouter();
    const { data: session } = useSession();
    const { toast } = useToast();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

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
        <div className="flex items-center justify-center h-screen p-4 md:p-8 overflow-hidden bg-[#1a1a1a]" style={{
            backgroundImage: `linear-gradient(45deg, #111 25%, transparent 25%, transparent 75%, #111 75%, #111), linear-gradient(45deg, #111 25%, transparent 25%, transparent 75%, #111 75%, #111)`,
            backgroundSize: '60px 60px',
            backgroundPosition: '0 0, 30px 30px'
        }}>
            <div className="w-full max-w-[1600px] h-full max-h-[900px] bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row relative">

                {/* Sidebar */}
                <aside className="w-full md:w-[320px] lg:w-[400px] flex-shrink-0 flex flex-col p-8 md:p-10 border-r border-gray-200/50 overflow-hidden" style={{
                    backgroundColor: '#e5e5e5',
                    backgroundImage: 'linear-gradient(to bottom right, #f0f0f0, #e0e0e0)'
                }}>
                    <div className="mb-8">
                        <h1 className="text-3xl tracking-widest font-light text-gray-900 uppercase leading-none mb-1 font-sans">CHEF'S</h1>
                        <h1 className="text-4xl font-serif italic font-bold text-gray-900 leading-none">KISS</h1>
                        <div className="w-10 h-0.5 bg-gray-800 mt-4 mb-3"></div>
                        <p className="text-[9px] font-bold tracking-[0.2em] text-gray-800 uppercase font-mono">
                            Generative Personal<br />Meal Prep AI
                        </p>
                    </div>
                    <div className="mb-10 italic text-gray-500 text-sm leading-relaxed border-l-2 border-gray-300 pl-4 py-1 font-serif">
                        "The secret of success is to eat what you like and let the food fight it out inside."
                    </div>

                    {/* Sample Menu Preview (Visual only) */}
                    <div className="flex-1 flex flex-col min-h-0">
                        <h2 className="text-[10px] font-bold text-gray-400 tracking-[0.3em] uppercase mb-4 font-mono">Sample Weekly Menu</h2>
                        <div className="flex-1 overflow-y-auto space-y-4 pr-2 hide-scrollbar pb-8">
                            <div className="bg-white rounded-2xl p-4 border-2 border-[#d64d08] shadow-lg">
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-[9px] font-bold text-[#d64d08] uppercase tracking-widest font-mono">Tuesday (Focus)</span>
                                </div>
                                <div className="flex gap-2 items-center">
                                    <div className="w-12 h-12 bg-gray-100 rounded-lg"></div>
                                    <div>
                                        <div className="text-[10px] font-bold text-gray-900 font-sans">Miso Glazed Salmon</div>
                                        <div className="text-[8px] text-gray-400 uppercase tracking-widest font-mono">24g Protein • 420 Cal</div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm opacity-80 scale-95 origin-left">
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest font-mono">Wednesday</span>
                                </div>
                                <div className="flex gap-2">
                                    <div className="w-10 h-10 bg-gray-100 rounded-lg"></div>
                                    <div className="w-10 h-10 bg-gray-100 rounded-lg"></div>
                                    <div className="w-10 h-10 bg-gray-100 rounded-lg"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 bg-[#F9FAFB] relative overflow-hidden flex flex-col">
                    <div className="flex-1 overflow-y-auto hide-scrollbar">
                        <div className="p-6 md:p-10 lg:p-12 max-w-[1200px] mx-auto w-full">

                            {/* Step 1: Family */}
                            <section className="mb-10">
                                <div className="flex justify-between items-end mb-6">
                                    <div>
                                        <span className="text-[10px] font-bold text-[#d64d08] tracking-[0.3em] uppercase mb-2 block font-mono">Step 01</span>
                                        <h2 className="text-2xl font-light text-gray-900 font-sans">Build Your Family</h2>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-6 items-start">
                                    {familyMembers.map((member, idx) => (
                                        <div key={idx} className="flex flex-col items-center space-y-2">
                                            <div className="relative group">
                                                <div className="w-16 h-16 rounded-full border-4 border-[#d64d08] p-0.5 ring-2 ring-transparent group-hover:ring-[#d64d08]/20 transition-all cursor-pointer">
                                                    <div className="w-full h-full rounded-full bg-gray-100 flex items-center justify-center text-gray-900 font-serif italic text-2xl">
                                                        {member.name.charAt(0)}
                                                    </div>
                                                </div>
                                                <div className="absolute -top-1 -right-1 bg-[#d64d08] text-white p-0.5 rounded-full shadow-md">
                                                    <span className="material-symbols-outlined text-[10px] block">check</span>
                                                </div>
                                            </div>
                                            <span className="text-[10px] font-bold text-gray-900 uppercase tracking-widest font-mono">{member.name}</span>
                                        </div>
                                    ))}
                                    <div className="flex flex-col items-center space-y-2">
                                        <button className="w-16 h-16 rounded-full border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-300 hover:border-[#d64d08] hover:text-[#d64d08] transition-all group">
                                            <span className="material-symbols-outlined text-2xl">add</span>
                                        </button>
                                    </div>
                                </div>
                            </section>

                            <hr className="border-gray-200/60 mb-10" />

                            {/* Step 2: Preferences */}
                            <section className="mb-12">
                                <div className="mb-8">
                                    <span className="text-[10px] font-bold text-[#d64d08] tracking-[0.3em] uppercase mb-2 block font-mono">Step 02</span>
                                    <h2 className="text-3xl font-light text-gray-900 uppercase tracking-tight font-sans">{familyMembers[0].name}'s Preferences</h2>
                                </div>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    <div className="flex flex-col gap-4">
                                        {/* Dietary */}
                                        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 font-mono">Dietary Preferences</label>
                                            <div className="flex flex-wrap gap-1.5">
                                                {['Keto', 'Vegan', 'Paleo', 'Vegetarian', 'Pescatarian', 'Low Carb', 'Gluten-Free'].map(diet => (
                                                    <div
                                                        key={diet}
                                                        onClick={() => togglePreference('dietary', diet)}
                                                        className={`px-3 py-1.5 rounded-full border text-[9px] font-bold uppercase tracking-widest transition-all cursor-pointer font-mono ${preferences.dietary.includes(diet) ? 'bg-[#d64d08] border-[#d64d08] text-white shadow-md' : 'border-gray-200 hover:border-[#d64d08] hover:text-[#d64d08]'}`}
                                                    >
                                                        {diet}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Spice Level */}
                                        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 font-mono">Spice Level</label>
                                            <div className="flex items-center justify-between bg-gray-50 p-1 rounded-full border border-gray-100">
                                                {['None', 'Mild', 'Medium', 'Hot'].map(level => (
                                                    <button
                                                        key={level}
                                                        onClick={() => handleSpiceLevel(level)}
                                                        className={`flex-1 py-2 text-[9px] font-bold uppercase tracking-widest rounded-full transition-all font-mono ${preferences.spiceLevel === level ? 'bg-white shadow-sm text-[#d64d08]' : 'text-gray-400 hover:text-gray-600'}`}
                                                    >
                                                        {level}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Favorites */}
                                        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 font-mono">Favorite Ingredients</label>
                                            <div className="relative group">
                                                <input
                                                    className="w-full bg-white border border-gray-200 rounded-xl text-xs px-3 py-3 focus:outline-none focus:border-[#d64d08] focus:ring-0 transition-colors placeholder-gray-300 font-sans"
                                                    placeholder="e.g. Avocado, Salmon, Basil"
                                                    type="text"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-4">
                                        {/* Common Allergens */}
                                        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 font-mono">Common Allergens</label>
                                            <div className="flex flex-wrap gap-1.5">
                                                {['Peanuts', 'Shellfish', 'Dairy', 'Soy', 'Tree Nuts', 'Wheat'].map(allergen => (
                                                    <div
                                                        key={allergen}
                                                        onClick={() => togglePreference('allergens', allergen)}
                                                        className={`px-3 py-1.5 rounded-full border text-[9px] font-bold uppercase tracking-widest transition-all cursor-pointer font-mono ${preferences.allergens.includes(allergen) ? 'bg-[#d64d08] border-[#d64d08] text-white shadow-md' : 'border-gray-200 hover:border-[#d64d08] hover:text-[#d64d08]'}`}
                                                    >
                                                        {allergen}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Custom Allergens */}
                                        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 font-mono">Custom Allergens</label>
                                            <div className="relative group">
                                                <input
                                                    className="w-full bg-white border border-gray-200 rounded-xl text-xs px-3 py-3 focus:outline-none focus:border-[#d64d08] focus:ring-0 transition-colors placeholder-gray-300 font-sans"
                                                    placeholder="Type and press enter to add..."
                                                    type="text"
                                                />
                                                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                                    <span className="material-symbols-outlined text-gray-300 text-sm">keyboard_return</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Disliked Ingredients */}
                                        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 font-mono">Disliked Ingredients</label>
                                            <div className="relative group">
                                                <input
                                                    className="w-full bg-white border border-gray-200 rounded-xl text-xs px-3 py-3 focus:outline-none focus:border-[#d64d08] focus:ring-0 transition-colors placeholder-gray-300 font-sans"
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
                    <div className="p-6 border-t border-gray-100 bg-white/90 backdrop-blur-md flex justify-end items-center">
                        <button
                            onClick={handleComplete}
                            disabled={loading}
                            className="bg-[#d64d08] hover:bg-[#b54006] text-white font-bold tracking-[0.3em] uppercase text-[10px] px-12 py-5 rounded-full shadow-xl hover:shadow-orange-500/30 transition-all duration-300 transform active:scale-95 flex items-center space-x-3 font-mono disabled:opacity-50 disabled:cursor-not-allowed"
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
