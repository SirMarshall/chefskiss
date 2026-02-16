"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { generateInitialMealPlan, archiveCurrentMealPlan } from "@/app/actions/mealPlan";
import { SuggestionTagInput, PillSelector } from "@/components/preferences/PreferencesUI";
import DashboardOverview from "./DashboardOverview";
import SettingsView from "./SettingsView";
import DashboardSkeleton from "@/components/DashboardSkeleton";
import ImageWithFallback from "@/components/ImageWithFallback";

const CUISINE_SUGGESTIONS = ['Japanese', 'Mexican', 'Italian', 'French', 'Indian', 'Thai', 'Mediterranean', 'American'];

interface DashboardClientProps {
    initialMealPlan: any;
    initialStatus: { hasPlan: boolean; planId: string | null };
    initialProfile: any;
    user: any;
}

export default function DashboardClient({ 
    initialMealPlan, 
    initialStatus, 
    initialProfile, 
    user 
}: DashboardClientProps) {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("dashboard");

    // Meal Plan State
    const [isGenerating, setIsGenerating] = useState(false);
    const [hasPlan, setHasPlan] = useState(initialStatus.hasPlan);
    const [mealPlan, setMealPlan] = useState<any>(initialMealPlan);
    const [numDays, setNumDays] = useState(initialProfile?.planDuration || 7);

    // Profile State
    const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>(initialProfile?.dietaryRestrictions || []);
    const [allergens, setAllergens] = useState<string[]>(initialProfile?.allergens || []);
    const [favorites, setFavorites] = useState<string[]>(initialProfile?.favorites || []);
    const [dislikes, setDislikes] = useState<string[]>(initialProfile?.dislikes || []);
    
    // Capitalize spice level from DB if present
    const defaultSpice = initialProfile?.spiceLevel 
        ? initialProfile.spiceLevel.charAt(0).toUpperCase() + initialProfile.spiceLevel.slice(1).toLowerCase() 
        : "Medium";
    const [spiceLevel, setSpiceLevel] = useState(defaultSpice);
    const [householdSize, setHouseholdSize] = useState(initialProfile?.householdSize || 1);

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isConfigOpen, setIsConfigOpen] = useState(false);

    // Redirect logic - keep this as a safeguard, though server checks should handle most of it
    useEffect(() => {
        if (user) {
            if (!user.termsAccepted) {
                router.push("/terms");
            } else if (!user.onboardingComplete) {
                router.push("/onboarding");
            }
        }
    }, [user, router]);

    const handleGeneratePlan = async () => {
        if (hasPlan) return; // Prevent generation if plan exists
        setIsGenerating(true);
        try {
            const newPlan = await generateInitialMealPlan(numDays, {
                dietaryRestrictions,
                allergens,
                favorites,
                dislikes,
                spiceLevel,
                householdSize
            });
            setMealPlan(newPlan);
            setHasPlan(true);
            setIsConfigOpen(false); // Close drawer after generation
        } catch (error) {
            console.error("Failed to generate plan:", error);
            alert("Failed to generate plan. Please try again.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handlePlanComplete = async () => {
        try {
            await archiveCurrentMealPlan();
            setMealPlan(null);
            setHasPlan(false);
        } catch (error) {
            console.error("Failed to archive plan:", error);
            alert("Failed to clear current plan. Please try again.");
        }
    };

    return (
        <div className="h-screen w-full overflow-hidden bg-background-light dark:bg-background-dark flex flex-col">
            {/* Mobile Header */}
            <header className="md:hidden flex items-center justify-between p-4 border-b border-gray-200/50 dark:border-gray-800/50 bg-panel-left-light dark:bg-panel-left-dark z-50">
                <div className="flex items-center space-x-3">
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-1 text-gray-900 dark:text-white"
                    >
                        <span className="material-symbols-outlined text-2xl">
                            {isSidebarOpen ? 'close' : 'menu'}
                        </span>
                    </button>
                    <div className="flex flex-col">
                        <h1 className="text-lg tracking-widest font-light text-gray-900 dark:text-white uppercase leading-none font-sans">CHEF'S</h1>
                        <h1 className="text-xl font-serif italic font-bold text-gray-900 dark:text-white leading-none">KISS</h1>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    {activeTab === 'dashboard' && (
                        <button
                            onClick={() => setIsConfigOpen(!isConfigOpen)}
                            className={`p-2 rounded-full transition-colors ${isConfigOpen ? 'bg-primary text-white shadow-lg shadow-orange-500/20' : 'text-gray-900 dark:text-white bg-white/10'}`}
                        >
                            <span className="material-symbols-outlined text-2xl">tune</span>
                        </button>
                    )}
                </div>
            </header>

            <div className="flex-1 flex flex-col md:flex-row relative overflow-hidden">
                {/* Sidebar */}
                <aside className={`
                    fixed inset-y-0 left-0 z-40 w-80 transform transition-transform duration-300 ease-in-out bg-panel-left-light dark:bg-panel-left-dark border-r border-gray-200/50 dark:border-gray-800/50 p-8 md:p-12 flex flex-col justify-between
                    md:relative md:translate-x-0
                    ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                `}>
                    <div className="pt-16 md:pt-0">
                        <div className="mb-12 hidden md:block">
                            <h1 className="text-5xl tracking-widest font-light text-gray-900 dark:text-white uppercase leading-none mb-1 font-sans">CHEF'S</h1>
                            <h1 className="text-6xl font-serif italic font-bold text-gray-900 dark:text-white leading-none">KISS</h1>
                            <div className="w-12 h-0.5 bg-gray-800 dark:bg-gray-200 mt-6 mb-4"></div>
                            <p className="text-xs font-bold tracking-[0.2em] text-gray-800 dark:text-gray-300 uppercase font-mono">
                                Generative Personal<br />Meal Prep AI
                            </p>
                        </div>
                        <nav className="space-y-6">
                            {[
                                { id: 'dashboard', label: 'PLAN', icon: 'dashboard' },
                                { id: 'pantry', label: 'PANTRY', icon: 'kitchen', disabled: true },
                                { id: 'family', label: 'FAMILY', icon: 'groups', disabled: true },
                                { id: 'settings', label: 'SETTINGS', icon: 'settings' }
                            ].map((item) => (
                                <a
                                    key={item.id}
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        if (item.disabled) return;
                                        setActiveTab(item.id);
                                        setIsSidebarOpen(false);
                                    }}
                                    className={`flex items-center space-x-3 text-sm font-medium tracking-wide transition-colors py-1 ${item.disabled
                                        ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                                        : activeTab === item.id
                                            ? 'text-primary border-r-2 border-primary'
                                            : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                                        }`}
                                >
                                    <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                                    <span>{item.label}</span>
                                    {item.disabled && (
                                        <span className="bg-gray-100 dark:bg-zinc-800 text-gray-400 dark:text-gray-500 text-[9px] font-bold px-1.5 py-0.5 rounded ml-2 whitespace-nowrap">SOON</span>
                                    )}
                                </a>
                            ))}
                        </nav>
                    </div>
                    <div className="mt-auto hidden md:block">
                        <blockquote className="text-gray-800 dark:text-gray-300 font-serif italic text-lg leading-relaxed">
                            {activeTab === 'settings' ? (
                                <>
                                    "I'm going through changes."
                                    <span className="block text-[10px] mt-2 not-italic font-bold font-mono tracking-widest text-gray-400 uppercase">- Black Sabbath</span>
                                </>
                            ) : (
                                // Default Quote
                                <>
                                    "Your palate is unique.<br />Your menu should be too."
                                </>
                            )}
                        </blockquote>
                    </div>
                </aside>

                {/* Mobile Sidebar Overlay */}
                {isSidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm transition-opacity"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                )}


                {/* Main Content */}
                <main className="flex-1 flex overflow-hidden bg-white dark:bg-zinc-900">
                    <div className={`w-full ${activeTab === 'dashboard' ? 'lg:w-3/5' : ''} p-6 md:p-12 overflow-y-auto border-r border-gray-100 dark:border-gray-800 flex flex-col`}>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 mb-10 flex-shrink-0">
                            <div>
                                <h2 className="text-xs font-bold text-gray-400 dark:text-gray-500 tracking-widest uppercase mb-1 font-mono">
                                    {activeTab === 'settings' ? 'Preferences' : 'Weekly Calendar'}
                                </h2>
                                <h3 className="text-3xl font-light text-gray-900 dark:text-white font-sans">
                                    {activeTab === 'settings' ? 'Settings' : 'Your Menu'}
                                </h3>
                            </div>
                            {/* Action Buttons */}

                        </div>

                        {/* Content Area */}
                        {isGenerating ? (
                            <div className="flex-1 flex flex-col">
                                <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                                    <div className="flex items-center space-x-3 mb-2">
                                        <div className="flex space-x-1">
                                            <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                            <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                            <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"></div>
                                        </div>
                                        <span className="text-[10px] font-bold tracking-[0.2em] text-primary uppercase font-mono">We're Cooking...</span>
                                    </div>
                                    <h4 className="text-2xl font-serif italic text-gray-900 dark:text-white">Curating your personalized weekly palette...</h4>
                                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 font-mono">Fetching seasonal inspiration & balancing nutrition</p>
                                </div>
                                <DashboardSkeleton />
                            </div>
                        ) : !hasPlan && activeTab !== 'settings' ? (
                            // EMPTY STATE
                            <div className="flex-1 flex flex-col items-center justify-center p-12 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-3xl bg-gray-50/50 dark:bg-zinc-800/30 text-center">
                                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6 text-primary">
                                    <span className="material-symbols-outlined text-4xl">restaurant_menu</span>
                                </div>
                                <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 font-serif italic">Your Kitchen is Empty</h4>
                                <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md">
                                    You haven't generated a meal plan for this week yet.
                                    Configure your preferences on the right and start cooking!
                                </p>
                                <button
                                    onClick={handleGeneratePlan}
                                    disabled={isGenerating || hasPlan}
                                    className="bg-primary hover:bg-primary-dark text-white px-8 py-4 rounded-sm shadow-lg font-bold tracking-widest text-xs uppercase flex items-center gap-2 transition-all hover:scale-105 disabled:opacity-70 disabled:hover:scale-100 disabled:cursor-not-allowed"
                                >
                                    {isGenerating ? (
                                        <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent"></div>
                                    ) : (
                                        <span className="material-symbols-outlined">auto_awesome</span>
                                    )}
                                    {isGenerating ? "Generating..." : "Generate Plan"}
                                </button>
                            </div>
                        ) : (
                            activeTab === 'settings' ? (
                                <SettingsView />
                            ) : (
                                <DashboardOverview mealPlan={mealPlan} onPlanComplete={handlePlanComplete} />
                            )
                        )}

                    </div>

                    {/* Right Panel - Configuration */}
                    {activeTab === 'dashboard' && (
                        <>
                            {/* Mobile Config Drawer Overlay */}
                            {isConfigOpen && (
                                <div
                                    className="fixed inset-0 bg-black/60 z-[55] lg:hidden backdrop-blur-sm transition-opacity"
                                    onClick={() => setIsConfigOpen(false)}
                                />
                            )}

                            <div className={`
                                fixed inset-y-0 right-0 z-[60] w-full sm:w-80 lg:relative lg:inset-auto lg:z-0 lg:w-2/5 transform transition-transform duration-300 ease-in-out
                                bg-gray-50/95 dark:bg-zinc-900/90 backdrop-blur-xl border-l border-gray-200/50 dark:border-gray-800/50 lg:border-l-0 overflow-y-auto lg:flex flex-col
                                ${isConfigOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
                            `}>
                                <div className="p-8 md:p-12 space-y-10">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h2 className="text-xs font-bold text-gray-400 dark:text-gray-500 tracking-[0.3em] uppercase mb-1 font-mono">Configuration Panel</h2>
                                            <h3 className="text-3xl font-light text-gray-900 dark:text-white font-sans">Preferences & Crew</h3>
                                        </div>
                                        <button
                                            onClick={() => setIsConfigOpen(false)}
                                            className="lg:hidden p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                                        >
                                            <span className="material-symbols-outlined">close</span>
                                        </button>
                                    </div>

                                    {/* Family Profiles */}
                                    <section className="relative">
                                        <div className="absolute inset-0 z-10 flex items-center justify-center">
                                            <div className="bg-white/90 dark:bg-zinc-800/90 backdrop-blur px-4 py-2 rounded-full shadow-sm border border-gray-200 dark:border-gray-700 flex items-center space-x-2">
                                                <span className="material-symbols-outlined text-primary text-sm">construction</span>
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-900 dark:text-gray-100 font-mono">Family Profiles Coming Soon</span>
                                            </div>
                                        </div>
                                        <div className="opacity-25 pointer-events-none grayscale blur-[2px] select-none">
                                            <div className="flex justify-between items-center mb-6">
                                                <label className="block text-xs font-bold text-gray-400 result-gray-600 uppercase tracking-widest font-mono">Family Profiles</label>
                                                <button
                                                    className="flex items-center space-x-1 text-primary transition-colors text-xs font-bold uppercase font-mono"
                                                >
                                                    <span className="material-symbols-outlined text-sm">add</span>
                                                    <span>New Profile</span>
                                                </button>
                                            </div>
                                            <div className="flex items-center space-x-6 overflow-x-auto pb-4 hide-scrollbar">
                                                <button className="flex flex-col items-center space-y-2 flex-shrink-0 group">
                                                    <div className="w-14 h-14 rounded-full bg-white dark:bg-zinc-800 border-2 border-primary flex items-center justify-center text-primary font-serif italic text-xl shadow-md overflow-hidden relative">
                                                        {user?.image ? (
                                                            <ImageWithFallback 
                                                                src={user.image} 
                                                                alt={user.name || 'User'} 
                                                                fill
                                                                className="object-cover" 
                                                                sizes="56px"
                                                            />
                                                        ) : (
                                                            user?.name ? user.name.charAt(0).toUpperCase() : 'G'
                                                        )}
                                                    </div>
                                                    <span className="text-xs font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider font-mono">{user?.name?.split(' ')[0] || 'Chef'}</span>
                                                </button>
                                                {/* Placeholders */}
                                                <button className="flex flex-col items-center space-y-2 flex-shrink-0 group">
                                                    <div className="w-14 h-14 rounded-full bg-gray-200 border-2 border-transparent flex items-center justify-center text-gray-500 font-serif italic text-xl">
                                                        <span className="material-symbols-outlined">add</span>
                                                    </div>
                                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider font-mono">Add</span>
                                                </button>
                                            </div>
                                        </div>
                                    </section>

                                    {/* Form Fields */}
                                    <section className="space-y-8">
                                        <PillSelector
                                            label="Dietary Needs"
                                            options={['Keto', 'Vegan', 'Paleo', 'Vegetarian', 'Pescatarian', 'Low Carb', 'Gluten-Free']}
                                            value={dietaryRestrictions}
                                            onChange={(val) => setDietaryRestrictions(val as string[])}
                                            multiSelect={true}
                                        />

                                        <SuggestionTagInput
                                            label="Allergens"
                                            placeholder="e.g. Peanuts, Shellfish"
                                            value={allergens}
                                            onChange={setAllergens}
                                            suggestions={['Peanuts', 'Shellfish', 'Dairy', 'Soy', 'Tree Nuts', 'Wheat']}
                                            color="red"
                                        />

                                        <SuggestionTagInput
                                            label="Favorite Cuisines"
                                            placeholder="Japanese, Mexican..."
                                            value={favorites}
                                            onChange={setFavorites}
                                            suggestions={CUISINE_SUGGESTIONS}
                                        />

                                        <SuggestionTagInput
                                            label="Dislikes"
                                            placeholder="Mushrooms, Cilantro..."
                                            value={dislikes}
                                            onChange={setDislikes}
                                            color="gray"
                                        />

                                        <PillSelector
                                            label="Spice Level"
                                            options={["None", "Mild", "Medium", "Hot"]}
                                            value={spiceLevel}
                                            onChange={(val) => setSpiceLevel(val as string)}
                                        />

                                        <div className="space-y-6">
                                        <div>
                                            <div className="flex justify-between items-center mb-3">
                                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest font-mono">Household Size</label>
                                                <span className="text-primary font-bold font-mono text-sm">{householdSize} {householdSize === 1 ? 'PERSON' : 'PEOPLE'}</span>
                                            </div>
                                            <div className="relative pt-2">
                                                <input
                                                    value={householdSize}
                                                    onChange={(e) => setHouseholdSize(Math.max(1, parseInt(e.target.value) || 1))}
                                                    type="range"
                                                    min="1"
                                                    max="10"
                                                    step="1"
                                                    className="w-full accent-primary"
                                                />
                                                <div className="flex justify-between mt-2 px-1">
                                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                                                        <span key={n} className={`text-xs font-bold font-mono ${householdSize === n ? 'text-primary' : 'text-gray-400 dark:text-gray-600'}`}>
                                                            {n}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 font-mono">Plan Duration</label>
                                            <div className="grid grid-cols-4 gap-2">
                                                {[1, 3, 5, 7].map((days) => (
                                                    <button
                                                        key={days}
                                                        onClick={() => !hasPlan && setNumDays(days)}
                                                        disabled={hasPlan}
                                                        className={`py-2 text-[10px] font-bold tracking-wider uppercase rounded-sm border transition-all font-mono ${numDays === days
                                                            ? (hasPlan ? 'bg-gray-400 dark:bg-zinc-700 text-white border-transparent' : 'bg-primary text-white border-primary')
                                                            : 'bg-white dark:bg-zinc-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-primary hover:text-primary'
                                                            } ${hasPlan ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                    >
                                                        {days} Days
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    </section>

                                    <div className="pt-8 border-t border-gray-200 dark:border-gray-700">
                                        <button
                                            onClick={handleGeneratePlan}
                                            disabled={isGenerating || hasPlan}
                                            className={`w-full font-bold tracking-[0.2em] uppercase text-xs py-5 rounded-sm shadow-xl transition-all duration-300 transform flex items-center justify-center space-x-2 font-mono ${isGenerating || hasPlan
                                                ? 'bg-gray-300 dark:bg-zinc-800 text-gray-500 dark:text-gray-500 cursor-not-allowed shadow-none'
                                                : 'bg-primary hover:bg-primary-dark text-white hover:shadow-orange-500/30 active:scale-[0.97]'
                                                }`}
                                        >
                                            {isGenerating ? (
                                                <div className="flex items-center space-x-2">
                                                    <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent"></div>
                                                    <span>Processing...</span>
                                                </div>
                                            ) : (
                                                <>
                                                    <span className="material-symbols-outlined">auto_awesome</span>
                                                    <span>{hasPlan ? "Plan Active" : "Generate Plan"}</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </main>
            </div>
            {/* Styles for Material Symbols */}
            <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
        </div>
    );
}

