"use client";

import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
// import Image from "next/image"; // Will use standard img tags for now as per mockup style or switch to Image if needed

export default function DashboardPage() {
    const { data: session, isPending } = useSession();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("dashboard");

    // Middleware handles redirection now
    useEffect(() => {
        if (!isPending && !session) {
            router.push("/");
        }
    }, [session, isPending, router]);

    if (isPending || !session || !session.user ||
        !(session.user as any).termsAccepted ||
        !(session.user as any).onboardingComplete) {
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
        <div className="p-4 md:p-8 h-screen overflow-hidden bg-[#1a1a1a]" style={{
            backgroundImage: `linear-gradient(45deg, #111 25%, transparent 25%, transparent 75%, #111 75%, #111), linear-gradient(45deg, #111 25%, transparent 25%, transparent 75%, #111 75%, #111)`,
            backgroundSize: '60px 60px',
            backgroundPosition: '0 0, 30px 30px'
        }}>
            <div className="w-full max-w-[1600px] h-full max-h-[900px] bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row relative mx-auto">
                {/* Sidebar */}
                <aside className="w-full md:w-80 flex-shrink-0 flex flex-col justify-between p-8 md:p-12 border-r border-gray-200/50" style={{
                    backgroundColor: '#e5e5e5',
                    backgroundImage: 'linear-gradient(to bottom right, #f0f0f0, #e0e0e0)'
                }}>
                    <div>
                        <div className="mb-12">
                            <h1 className="text-4xl tracking-widest font-light text-gray-900 uppercase leading-none mb-1 font-sans">CHEF'S</h1>
                            <h1 className="text-5xl font-serif italic font-bold text-gray-900 leading-none">KISS</h1>
                            <div className="w-12 h-0.5 bg-gray-800 mt-6 mb-4"></div>
                            <p className="text-[10px] font-bold tracking-[0.2em] text-gray-800 uppercase font-mono">
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
                    <div className="w-full lg:w-3/5 p-6 md:p-12 overflow-y-auto border-r border-gray-100 flex flex-col">
                        <div className="flex justify-between items-end mb-10 flex-shrink-0">
                            <div>
                                <h2 className="text-xs font-bold text-gray-400 tracking-widest uppercase mb-1 font-mono">Weekly Calendar</h2>
                                <h3 className="text-3xl font-light text-gray-900 font-sans">Your Menu</h3>
                            </div>
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

                        {/* Menu Cards */}
                        <div className="space-y-8 pb-12">
                            {/* Today - Featured */}
                            <div className="bg-white rounded-3xl p-8 border-2 border-[#d64d08] shadow-xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 bg-[#d64d08] text-white text-[10px] font-bold px-4 py-1 uppercase tracking-widest font-mono">Today</div>
                                <div className="mb-6">
                                    <span className="text-[11px] font-black text-[#d64d08] uppercase tracking-tighter font-mono">Day 01</span>
                                    <h4 className="text-2xl font-bold text-gray-900 font-sans">Monday</h4>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {[
                                        { type: 'Breakfast', title: 'Steel-Cut Oats with Berries & Walnuts' },
                                        { type: 'Lunch', title: 'Miso Glazed Salmon with Bok Choy' },
                                        { type: 'Dinner', title: 'Roasted Herb-Chicken with Asparagus' }
                                    ].map((meal, idx) => (
                                        <div key={idx} className="flex flex-col space-y-3">
                                            <div className="aspect-[4/3] bg-gray-100 rounded-2xl relative overflow-hidden group-hover:bg-gray-200 transition-colors">
                                                <div className="absolute inset-0 bg-gray-200"></div>
                                                <span className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2 py-1 rounded text-[9px] font-bold uppercase tracking-wider text-gray-800 font-mono">{meal.type}</span>
                                            </div>
                                            <h5 className="text-xs font-bold text-gray-900 line-clamp-2 font-sans">{meal.title}</h5>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Other Days */}
                            {[
                                { day: 'Tuesday', dayNum: '02', meals: ['Avocado Toast with Poached Egg', 'Roasted Vegetable Quinoa Bowl', 'Garlic Butter Shrimp with Zucchini'] },
                                { day: 'Wednesday', dayNum: '03', meals: ['Greek Yogurt with Chia & Mango', 'Spicy Thai Basil Chicken', 'Beef & Broccoli Stir-Fry'] }
                            ].map((day, idx) => (
                                <div key={idx} className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:border-gray-200 transition-all">
                                    <div className="mb-6">
                                        <span className="text-[11px] font-black text-gray-300 uppercase tracking-tighter font-mono">Day {day.dayNum}</span>
                                        <h4 className="text-2xl font-bold text-gray-900 font-sans">{day.day}</h4>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {day.meals.map((meal, mIdx) => (
                                            <div key={mIdx} className="flex flex-col space-y-3">
                                                <div className="aspect-[4/3] bg-gray-100 rounded-2xl relative overflow-hidden">
                                                    <div className="absolute inset-0 bg-gray-200"></div>
                                                    <span className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2 py-1 rounded text-[9px] font-bold uppercase tracking-wider text-gray-800 font-mono">
                                                        {['Breakfast', 'Lunch', 'Dinner'][mIdx]}
                                                    </span>
                                                </div>
                                                <h5 className="text-xs font-bold text-gray-900 line-clamp-2 font-sans">{meal}</h5>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Panel - Configuration */}
                    <div className="hidden lg:flex w-2/5 flex-col bg-gray-50 overflow-y-auto">
                        <div className="p-8 md:p-12 space-y-10">
                            <div>
                                <h2 className="text-xs font-bold text-gray-400 tracking-[0.3em] uppercase mb-1 font-mono">Configuration Panel</h2>
                                <h3 className="text-2xl font-light text-gray-900 font-sans">Preferences & Crew</h3>
                            </div>

                            {/* Family Profiles */}
                            <section>
                                <div className="flex justify-between items-center mb-6">
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest font-mono">Family Profiles</label>
                                    <button className="flex items-center space-x-1 text-[#d64d08] hover:text-[#b54006] transition-colors text-[10px] font-bold uppercase font-mono">
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
                                        <span className="text-[10px] font-bold text-gray-900 uppercase tracking-wider font-mono">{session?.user?.name?.split(' ')[0] || 'Chef'}</span>
                                    </button>
                                    {/* Placeholders */}
                                    <button className="flex flex-col items-center space-y-2 flex-shrink-0 group opacity-40 hover:opacity-100 transition-opacity">
                                        <div className="w-14 h-14 rounded-full bg-gray-200 border-2 border-transparent flex items-center justify-center text-gray-500 font-serif italic text-xl transition-transform group-hover:scale-105">
                                            <span className="material-symbols-outlined">add</span>
                                        </div>
                                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider font-mono">Add</span>
                                    </button>
                                </div>
                            </section>

                            {/* Form Fields */}
                            <section className="space-y-6">
                                <div className="group">
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 group-focus-within:text-[#d64d08] transition-colors font-mono">Dietary Needs (Global)</label>
                                    <input className="w-full bg-white border border-gray-200 rounded-sm text-sm px-4 py-3 focus:outline-none focus:border-[#d64d08] focus:ring-0 transition-colors placeholder-gray-300 font-sans" placeholder="e.g. Keto, Vegan" type="text" />
                                </div>
                                <div className="group">
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 group-focus-within:text-[#d64d08] transition-colors font-mono">Allergens</label>
                                    <input className="w-full bg-white border border-gray-200 rounded-sm text-sm px-4 py-3 focus:outline-none focus:border-[#d64d08] focus:ring-0 transition-colors placeholder-gray-300 font-sans" placeholder="e.g. Peanuts, Shellfish" type="text" />
                                </div>
                                <div className="group">
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 group-focus-within:text-[#d64d08] transition-colors font-mono">Favorite Ingredients</label>
                                    <input className="w-full bg-white border border-gray-200 rounded-sm text-sm px-4 py-3 focus:outline-none focus:border-[#d64d08] focus:ring-0 transition-colors placeholder-gray-300 font-sans" placeholder="Truffle oil, Wagyu beef..." type="text" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 font-mono">Spice Level</label>
                                    <div className="flex rounded-sm overflow-hidden bg-gray-100 p-1 gap-1">
                                        <button className="flex-1 py-3 text-[10px] font-bold tracking-wider uppercase bg-black text-white rounded-sm shadow-sm font-mono transition-all">None</button>
                                        <button className="flex-1 py-3 text-[10px] font-bold tracking-wider uppercase text-gray-400 hover:text-gray-900 hover:bg-white transition-all rounded-sm font-mono">Mild</button>
                                        <button className="flex-1 py-3 text-[10px] font-bold tracking-wider uppercase text-gray-400 hover:text-gray-900 hover:bg-white transition-all rounded-sm font-mono">Med</button>
                                        <button className="flex-1 py-3 text-[10px] font-bold tracking-wider uppercase text-gray-400 hover:text-gray-900 hover:bg-white transition-all rounded-sm font-mono">Hot</button>
                                    </div>
                                </div>
                            </section>

                            <div className="pt-8 border-t border-gray-200">
                                <button className="w-full bg-[#d64d08] hover:bg-[#b54006] text-white font-bold tracking-[0.2em] uppercase text-xs py-5 rounded-sm shadow-xl hover:shadow-orange-500/30 transition-all duration-300 transform active:scale-[0.97] flex items-center justify-center space-x-2 font-mono">
                                    <span className="material-symbols-outlined">auto_awesome</span>
                                    <span>Regenerate Weekly Plan</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            {/* Styles for Material Symbols */}
            <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
        </div>
    );
}
