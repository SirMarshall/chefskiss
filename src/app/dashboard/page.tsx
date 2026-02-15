
"use client";

import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { checkMealPlanStatus, getActiveMealPlan, generateInitialMealPlan, getUserProfile } from "@/app/actions/mealPlan";
import DashboardOverview from "./DashboardOverview";
import SettingsView from "./SettingsView";

export default function DashboardPage() {
    const { data: session, isPending } = useSession();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("dashboard");

    // Meal Plan State
    const [isLoadingPlan, setIsLoadingPlan] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    const [hasPlan, setHasPlan] = useState(false);
    const [mealPlan, setMealPlan] = useState<any>(null);
    const [numDays, setNumDays] = useState(7); // Default to 7 days

    // Profile State
    const [dietaryRestrictions, setDietaryRestrictions] = useState("");
    const [allergens, setAllergens] = useState("");
    const [favorites, setFavorites] = useState("");
    const [dislikes, setDislikes] = useState("");
    const [spiceLevel, setSpiceLevel] = useState("Medium");
    const [householdSize, setHouseholdSize] = useState(1);

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isConfigOpen, setIsConfigOpen] = useState(false);

    // Redirect logic
    useEffect(() => {
        if (!isPending) {
            if (!session) {
                router.push("/");
            } else if (session.user) {
                const user = session.user as any;
                if (!user.termsAccepted) {
                    router.push("/terms");
                } else if (!user.onboardingComplete) {
                    router.push("/onboarding");
                }
            }
        }
    }, [session, isPending, router]);

    // Check for meal plan on load
    useEffect(() => {
        async function loadPlan() {
            if (session?.user) {
                try {
                    // 1. Check status
                    const status = await checkMealPlanStatus();
                    setHasPlan(status.hasPlan);

                    if (status.hasPlan) {
                        // 2. Fetch plan data
                        const plan = await getActiveMealPlan();
                        setMealPlan(plan);
                    }
                } catch (error) {
                    console.error("Failed to load meal plan:", error);
                } finally {
                    setIsLoadingPlan(false);
                }
            }
        }

        if (session && !isPending) {
            loadPlan();

            // Load profile
            getUserProfile().then(profile => {
                if (profile) {
                    setDietaryRestrictions(profile.dietaryRestrictions?.join(", ") || "");
                    setAllergens(profile.allergens?.join(", ") || "");
                    setFavorites(profile.favorites?.join(", ") || "");
                    setDislikes(profile.dislikes?.join(", ") || "");
                    if (profile.spiceLevel) setSpiceLevel(profile.spiceLevel.charAt(0).toUpperCase() + profile.spiceLevel.slice(1).toLowerCase());
                    if (profile.householdSize) setHouseholdSize(profile.householdSize);
                    if (profile.planDuration) setNumDays(profile.planDuration);
                }
            });
        }
    }, [session, isPending]);

    const handleGeneratePlan = async () => {
        if (hasPlan) return; // Prevent generation if plan exists
        setIsGenerating(true);
        try {
            const newPlan = await generateInitialMealPlan(numDays, {
                dietaryRestrictions: dietaryRestrictions.split(',').map(s => s.trim()).filter(Boolean),
                allergens: allergens.split(',').map(s => s.trim()).filter(Boolean),
                favorites: favorites.split(',').map(s => s.trim()).filter(Boolean),
                dislikes: dislikes.split(',').map(s => s.trim()).filter(Boolean),
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

    if (isPending || !session || !session.user ||
        !(session.user as any).termsAccepted ||
        !(session.user as any).onboardingComplete ||
        isLoadingPlan // Wait for plan check too
    ) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background-dark">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="h-4 w-4 bg-primary rounded-full mb-2 animate-bounce"></div>
                    <span className="text-primary font-mono text-xs tracking-widest uppercase">Loading Chef's Kitchen...</span>
                </div>
            </div>
        );
    }

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
                <main className="flex-1 flex overflow-hidden bg-white dark:bg-zinc-900 transition-colors duration-500">
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
                        {!hasPlan && activeTab !== 'settings' ? (
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
                                    {isGenerating ? "Generating..." : "Generate First Plan"}
                                </button>
                            </div>
                        ) : (
                            activeTab === 'settings' ? (
                                <SettingsView />
                            ) : (
                                <DashboardOverview mealPlan={mealPlan} />
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
                                bg-gray-50/95 dark:bg-zinc-900/90 backdrop-blur-xl border-l border-gray-200/50 dark:border-gray-800/50 lg:border-l-0 overflow-y-auto lg:flex flex-col transition-colors duration-500
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
                                    <section className="opacity-40 pointer-events-none grayscale-[0.5]">
                                        <div className="flex justify-between items-center mb-6">
                                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest font-mono">Family Profiles</label>
                                            <button
                                                onClick={() => alert("Multi-profile support coming soon!")}
                                                className="flex items-center space-x-1 text-primary hover:text-primary-dark transition-colors text-xs font-bold uppercase font-mono"
                                            >
                                                <span className="material-symbols-outlined text-sm">add</span>
                                                <span>New Profile</span>
                                            </button>
                                        </div>
                                        <div className="flex items-center space-x-6 overflow-x-auto pb-4 hide-scrollbar">
                                            <button className="flex flex-col items-center space-y-2 flex-shrink-0 group">
                                                <div className="w-14 h-14 rounded-full bg-white dark:bg-zinc-800 border-2 border-primary flex items-center justify-center text-primary font-serif italic text-xl shadow-md transition-transform group-hover:scale-105 overflow-hidden">
                                                    {session?.user?.image ? (
                                                        <img src={session.user.image} alt={session.user.name || 'User'} className="w-full h-full object-cover" />
                                                    ) : (
                                                        session?.user?.name ? session.user.name.charAt(0).toUpperCase() : 'G'
                                                    )}
                                                </div>
                                                <span className="text-xs font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider font-mono">{session?.user?.name?.split(' ')[0] || 'Chef'}</span>
                                            </button>
                                            {/* Placeholders */}
                                            <button className="flex flex-col items-center space-y-2 flex-shrink-0 group opacity-40 hover:opacity-100 transition-opacity">
                                                <div className="w-14 h-14 rounded-full bg-gray-200 border-2 border-transparent flex items-center justify-center text-gray-500 font-serif italic text-xl transition-transform group-hover:scale-105">
                                                    <span className="material-symbols-outlined">add</span>
                                                </div>
                                                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider font-mono">Add</span>
                                            </button>
                                        </div>
                                    </section>

                                    {/* Form Fields */}
                                    <section className="space-y-6">
                                        <div className="group">
                                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 group-focus-within:text-primary transition-colors font-mono">Dietary Needs (Global)</label>
                                            <input
                                                value={dietaryRestrictions}
                                                onChange={(e) => setDietaryRestrictions(e.target.value)}
                                                className="w-full bg-white dark:bg-zinc-800/80 border border-gray-200 dark:border-gray-700 rounded-sm text-sm px-4 py-3 focus:outline-none focus:border-primary focus:ring-0 transition-colors placeholder-gray-300 dark:placeholder-gray-600 font-sans text-gray-900 dark:text-white"
                                                placeholder="e.g. Keto, Vegan"
                                                type="text"
                                            />
                                        </div>
                                        <div className="group">
                                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 group-focus-within:text-primary transition-colors font-mono">Allergens</label>
                                            <input
                                                value={allergens}
                                                onChange={(e) => setAllergens(e.target.value)}
                                                className="w-full bg-white dark:bg-zinc-800/80 border border-gray-200 dark:border-gray-700 rounded-sm text-sm px-4 py-3 focus:outline-none focus:border-primary focus:ring-0 transition-colors placeholder-gray-300 dark:placeholder-gray-600 font-sans text-gray-900 dark:text-white"
                                                placeholder="e.g. Peanuts, Shellfish"
                                                type="text"
                                            />
                                        </div>
                                        <div className="group">
                                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 group-focus-within:text-primary transition-colors font-mono">Favorite Cuisines</label>
                                            <input
                                                value={favorites}
                                                onChange={(e) => setFavorites(e.target.value)}
                                                className="w-full bg-white dark:bg-zinc-800/80 border border-gray-200 dark:border-gray-700 rounded-sm text-sm px-4 py-3 focus:outline-none focus:border-primary focus:ring-0 transition-colors placeholder-gray-300 dark:placeholder-gray-600 font-sans text-gray-900 dark:text-white"
                                                placeholder="Japanese, Mexican, Soul Food..."
                                                type="text"
                                            />
                                        </div>
                                        <div className="group">
                                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 group-focus-within:text-primary transition-colors font-mono">Dislikes</label>
                                            <input
                                                value={dislikes}
                                                onChange={(e) => setDislikes(e.target.value)}
                                                className="w-full bg-white dark:bg-zinc-800/80 border border-gray-200 dark:border-gray-700 rounded-sm text-sm px-4 py-3 focus:outline-none focus:border-primary focus:ring-0 transition-colors placeholder-gray-300 dark:placeholder-gray-600 font-sans text-gray-900 dark:text-white"
                                                placeholder="Mushrooms, Cilantro..."
                                                type="text"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 font-mono">Spice Level</label>
                                            <div className="flex rounded-sm overflow-hidden bg-gray-100 dark:bg-zinc-800 p-1 gap-1">
                                                {["None", "Mild", "Medium", "Hot"].map((level) => (
                                                    <button
                                                        key={level}
                                                        onClick={() => setSpiceLevel(level)}
                                                        className={`flex-1 py-3 text-xs font-bold tracking-wider uppercase rounded-sm font-mono transition-all ${spiceLevel === level
                                                            ? "bg-black dark:bg-white dark:text-black text-white shadow-sm"
                                                            : "text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white dark:hover:bg-zinc-700"
                                                            }`}
                                                    >
                                                        {level}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
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
