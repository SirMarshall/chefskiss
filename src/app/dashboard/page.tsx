
"use client";

import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { checkMealPlanStatus, getActiveMealPlan, generateInitialMealPlan } from "@/app/actions/mealPlan";
import DashboardOverview from "./DashboardOverview";
import MealPlanView from "./MealPlanView";

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

    // Middleware handles redirection now
    useEffect(() => {
        if (!isPending && !session) {
            router.push("/");
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
        }
    }, [session, isPending]);

    const handleGeneratePlan = async () => {
        if (hasPlan) return; // Prevent generation if plan exists
        setIsGenerating(true);
        try {
            const newPlan = await generateInitialMealPlan(numDays);
            setMealPlan(newPlan);
            setHasPlan(true);
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
            <div className="flex items-center justify-center min-h-screen bg-[#1a1a1a]">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="h-4 w-4 bg-[#d64d08] rounded-full mb-2 animate-bounce"></div>
                    <span className="text-[#d64d08] font-mono text-xs tracking-widest uppercase">Loading Chef's Kitchen...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen w-full overflow-hidden bg-white">
            <div className="w-full h-full bg-white flex flex-col md:flex-row relative">
                {/* Sidebar */}
                <aside className="w-full md:w-80 flex-shrink-0 flex flex-col justify-between p-8 md:p-12 border-r border-gray-200/50" style={{
                    backgroundColor: '#e5e5e5',
                    backgroundImage: 'linear-gradient(to bottom right, #f0f0f0, #e0e0e0)'
                }}>
                    <div>
                        <div className="mb-12">
                            <h1 className="text-5xl tracking-widest font-light text-gray-900 uppercase leading-none mb-1 font-sans">CHEF'S</h1>
                            <h1 className="text-6xl font-serif italic font-bold text-gray-900 leading-none">KISS</h1>
                            <div className="w-12 h-0.5 bg-gray-800 mt-6 mb-4"></div>
                            <p className="text-xs font-bold tracking-[0.2em] text-gray-800 uppercase font-mono">
                                Generative Personal<br />Meal Prep AI
                            </p>
                        </div>
                        <nav className="space-y-6 hidden md:block">
                            {[
                                { id: 'dashboard', label: 'DASHBOARD', icon: 'dashboard' },
                                { id: 'meal-plan', label: 'MEAL PLAN', icon: 'calendar_month' },
                                { id: 'pantry', label: 'PANTRY', icon: 'kitchen' },
                                { id: 'family', label: 'FAMILY', icon: 'groups' },
                                { id: 'settings', label: 'SETTINGS', icon: 'settings' }
                            ].map((item) => (
                                <a
                                    key={item.id}
                                    href="#"
                                    onClick={(e) => { e.preventDefault(); setActiveTab(item.id); }}
                                    className={`flex items-center space-x-3 text-sm font-medium tracking-wide transition-colors py-1 ${activeTab === item.id ? 'text-[#d64d08] border-r-2 border-[#d64d08]' : 'text-gray-500 hover:text-gray-900'}`}
                                >
                                    <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                                    <span>{item.label}</span>
                                </a>
                            ))}
                        </nav>
                    </div>
                    <div className="mt-auto hidden md:block">
                        <blockquote className="text-gray-800 font-serif italic text-lg leading-relaxed">
                            "Your palate is unique.<br />Your menu should be too."
                        </blockquote>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 flex overflow-hidden">
                    <div className={`w-full ${activeTab === 'dashboard' ? 'lg:w-3/5' : ''} p-6 md:p-12 overflow-y-auto border-r border-gray-100 flex flex-col`}>
                        <div className="flex justify-between items-end mb-10 flex-shrink-0">
                            <div>
                                <h2 className="text-xs font-bold text-gray-400 tracking-widest uppercase mb-1 font-mono">
                                    {activeTab === 'dashboard' ? 'Weekly Calendar' : 'Weekly Forecast'}
                                </h2>
                                <h3 className="text-3xl font-light text-gray-900 font-sans">Your Menu</h3>
                            </div>
                            {/* Action Buttons */}
                            <div className="flex items-center space-x-6">
                                {activeTab === 'meal-plan' && (
                                    <div className="hidden xl:flex items-center space-x-2">
                                        <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-lg transition-colors flex items-center space-x-2">
                                            <span className="material-symbols-outlined text-sm">print</span>
                                            <span>Print List</span>
                                        </button>
                                        <button
                                            onClick={handleGeneratePlan}
                                            disabled={isGenerating || hasPlan}
                                            className="bg-[#d64d08] hover:bg-[#b54006] text-white text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-lg transition-colors shadow-lg hover:shadow-orange-500/30 flex items-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                        >
                                            {isGenerating ? (
                                                <div className="animate-spin h-3 w-3 border-2 border-white rounded-full border-t-transparent"></div>
                                            ) : (
                                                <span className="material-symbols-outlined text-sm">auto_awesome</span>
                                            )}
                                            <span>{isGenerating ? "Generating..." : (hasPlan ? "Plan Active" : "Generate New")}</span>
                                        </button>
                                    </div>
                                )}

                                <div className="flex space-x-4">
                                    <button className="flex items-center space-x-2 text-xs font-bold tracking-widest uppercase text-gray-400 hover:text-gray-900 transition-colors font-mono">
                                        <span className="material-symbols-outlined text-lg">chevron_left</span>
                                        <span>Previous</span>
                                    </button>
                                    <button className="flex items-center space-x-2 text-xs font-bold tracking-widest uppercase text-gray-900 font-mono">
                                        <span>Next</span>
                                        <span className="material-symbols-outlined text-lg">chevron_right</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Content Area */}
                        {!hasPlan ? (
                            // EMPTY STATE
                            <div className="flex-1 flex flex-col items-center justify-center p-12 border-2 border-dashed border-gray-200 rounded-3xl bg-gray-50/50 text-center">
                                <div className="w-20 h-20 bg-[#d64d08]/10 rounded-full flex items-center justify-center mb-6 text-[#d64d08]">
                                    <span className="material-symbols-outlined text-4xl">restaurant_menu</span>
                                </div>
                                <h4 className="text-2xl font-bold text-gray-900 mb-2 font-serif italic">Your Kitchen is Empty</h4>
                                <p className="text-gray-500 mb-8 max-w-md">
                                    You haven't generated a meal plan for this week yet.
                                    Configure your preferences on the right and start cooking!
                                </p>
                                <button
                                    onClick={handleGeneratePlan}
                                    disabled={isGenerating || hasPlan}
                                    className="bg-[#d64d08] hover:bg-[#b54006] text-white px-8 py-4 rounded-sm shadow-lg font-bold tracking-widest text-xs uppercase flex items-center gap-2 transition-all hover:scale-105 disabled:opacity-70 disabled:hover:scale-100 disabled:cursor-not-allowed"
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
                            activeTab === 'dashboard' ? (
                                <DashboardOverview mealPlan={mealPlan} />
                            ) : (
                                <MealPlanView mealPlan={mealPlan} />
                            )
                        )}
                    </div>

                    {/* Right Panel - Configuration */}
                    {activeTab === 'dashboard' && (
                        <div className="hidden lg:flex w-2/5 flex-col bg-gray-50 overflow-y-auto">
                            <div className="p-8 md:p-12 space-y-10">
                                <div>
                                    <h2 className="text-xs font-bold text-gray-400 tracking-[0.3em] uppercase mb-1 font-mono">Configuration Panel</h2>
                                    <h3 className="text-3xl font-light text-gray-900 font-sans">Preferences & Crew</h3>
                                </div>

                                {/* Family Profiles */}
                                <section>
                                    <div className="flex justify-between items-center mb-6">
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest font-mono">Family Profiles</label>
                                        <button className="flex items-center space-x-1 text-[#d64d08] hover:text-[#b54006] transition-colors text-xs font-bold uppercase font-mono">
                                            <span className="material-symbols-outlined text-sm">add</span>
                                            <span>New Profile</span>
                                        </button>
                                    </div>
                                    <div className="flex items-center space-x-6 overflow-x-auto pb-4 hide-scrollbar">
                                        <button className="flex flex-col items-center space-y-2 flex-shrink-0 group">
                                            <div className="w-14 h-14 rounded-full bg-white border-2 border-[#d64d08] flex items-center justify-center text-[#d64d08] font-serif italic text-xl shadow-md transition-transform group-hover:scale-105 overflow-hidden">
                                                {session?.user?.image ? (
                                                    <img src={session.user.image} alt={session.user.name || 'User'} className="w-full h-full object-cover" />
                                                ) : (
                                                    session?.user?.name ? session.user.name.charAt(0).toUpperCase() : 'G'
                                                )}
                                            </div>
                                            <span className="text-xs font-bold text-gray-900 uppercase tracking-wider font-mono">{session?.user?.name?.split(' ')[0] || 'Chef'}</span>
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
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 group-focus-within:text-[#d64d08] transition-colors font-mono">Dietary Needs (Global)</label>
                                        <input className="w-full bg-white border border-gray-200 rounded-sm text-sm px-4 py-3 focus:outline-none focus:border-[#d64d08] focus:ring-0 transition-colors placeholder-gray-300 font-sans" placeholder="e.g. Keto, Vegan" type="text" />
                                    </div>
                                    <div className="group">
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 group-focus-within:text-[#d64d08] transition-colors font-mono">Allergens</label>
                                        <input className="w-full bg-white border border-gray-200 rounded-sm text-sm px-4 py-3 focus:outline-none focus:border-[#d64d08] focus:ring-0 transition-colors placeholder-gray-300 font-sans" placeholder="e.g. Peanuts, Shellfish" type="text" />
                                    </div>
                                    <div className="group">
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 group-focus-within:text-[#d64d08] transition-colors font-mono">Favorite Ingredients</label>
                                        <input className="w-full bg-white border border-gray-200 rounded-sm text-sm px-4 py-3 focus:outline-none focus:border-[#d64d08] focus:ring-0 transition-colors placeholder-gray-300 font-sans" placeholder="Truffle oil, Wagyu beef..." type="text" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 font-mono">Spice Level</label>
                                        <div className="flex rounded-sm overflow-hidden bg-gray-100 p-1 gap-1">
                                            <button className="flex-1 py-3 text-xs font-bold tracking-wider uppercase bg-black text-white rounded-sm shadow-sm font-mono transition-all">None</button>
                                            <button className="flex-1 py-3 text-xs font-bold tracking-wider uppercase text-gray-400 hover:text-gray-900 hover:bg-white transition-all rounded-sm font-mono">Mild</button>
                                            <button className="flex-1 py-3 text-xs font-bold tracking-wider uppercase text-gray-400 hover:text-gray-900 hover:bg-white transition-all rounded-sm font-mono">Med</button>
                                            <button className="flex-1 py-3 text-xs font-bold tracking-wider uppercase text-gray-400 hover:text-gray-900 hover:bg-white transition-all rounded-sm font-mono">Hot</button>
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
                                                    className={`py-2 text-xs font-bold tracking-wider uppercase rounded-sm border transition-all font-mono ${numDays === days
                                                            ? (hasPlan ? 'bg-gray-400 text-white border-transparent' : 'bg-[#d64d08] text-white border-[#d64d08]')
                                                            : 'bg-white text-gray-500 border-gray-200 hover:border-[#d64d08] hover:text-[#d64d08]'
                                                        } ${hasPlan ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                >
                                                    {days} {days === 1 ? 'Day' : 'Days'}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </section>

                                <div className="pt-8 border-t border-gray-200">
                                    <button
                                        onClick={handleGeneratePlan}
                                        disabled={isGenerating || hasPlan}
                                        className={`w-full font-bold tracking-[0.2em] uppercase text-xs py-5 rounded-sm shadow-xl transition-all duration-300 transform flex items-center justify-center space-x-2 font-mono ${isGenerating || hasPlan
                                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none'
                                                : 'bg-[#d64d08] hover:bg-[#b54006] text-white hover:shadow-orange-500/30 active:scale-[0.97]'
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
                                                <span>{hasPlan ? "Plan Active" : "Generate Meal Plan"}</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>
            {/* Styles for Material Symbols */}
            <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
        </div>
    );

}
