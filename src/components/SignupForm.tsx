"use client";

import { useState } from "react";
import { useToast } from "@/context/ToastContext";

export default function SignupForm() {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        dietaryRestrictions: "",
        allergens: "",
        favorites: "",
        spiceLevel: "none",
    });

    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch("/api/users", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (data.success) {
                toast("Welcome to the Kitchen! You've successfully signed up.", "success");
                // Clear form
                setFormData({
                    name: "",
                    email: "",
                    dietaryRestrictions: "",
                    allergens: "",
                    favorites: "",
                    spiceLevel: "none",
                });
            } else {
                toast(`Error: ${data.error}`, "error");
            }
        } catch (error) {
            console.error("Signup error:", error);
            toast("Something went wrong. Please try again later.", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label htmlFor="name" className="text-[10px] uppercase tracking-widest font-black text-black/40">Full Name</label>
                    <input
                        id="name"
                        required
                        placeholder="Gordon Ramsay"
                        className="w-full bg-gray-50 border border-black/10 rounded-none px-4 py-3 text-sm text-black placeholder:text-black/20 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        value={formData.name}
                    />
                </div>
                <div className="space-y-2">
                    <label htmlFor="email" className="text-[10px] uppercase tracking-widest font-black text-black/40">Email Address</label>
                    <input
                        id="email"
                        required
                        type="email"
                        placeholder="chef@kitchen.com"
                        className="w-full bg-gray-50 border border-black/10 rounded-none px-4 py-3 text-sm text-black placeholder:text-black/20 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        value={formData.email}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label htmlFor="dietaryRestrictions" className="text-[10px] uppercase tracking-widest font-black text-black/40">Dietary Needs</label>
                    <input
                        id="dietaryRestrictions"
                        placeholder="e.g. Keto, Vegan"
                        className="w-full bg-gray-50 border border-black/10 rounded-none px-4 py-3 text-sm text-black placeholder:text-black/20 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                        onChange={(e) => setFormData({ ...formData, dietaryRestrictions: e.target.value })}
                        value={formData.dietaryRestrictions}
                    />
                </div>
                <div className="space-y-2">
                    <label htmlFor="allergens" className="text-[10px] uppercase tracking-widest font-black text-black/40">Allergens</label>
                    <input
                        id="allergens"
                        placeholder="e.g. Peanuts"
                        className="w-full bg-gray-50 border border-black/10 rounded-none px-4 py-3 text-sm text-black placeholder:text-black/20 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                        onChange={(e) => setFormData({ ...formData, allergens: e.target.value })}
                        value={formData.allergens}
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label htmlFor="favorites" className="text-[10px] uppercase tracking-widest font-black text-black/40">Favorite Ingredients</label>
                <input
                    id="favorites"
                    placeholder="Truffle oil, Wagyu beef, Saffron..."
                    className="w-full bg-gray-50 border border-black/10 rounded-none px-4 py-3 text-sm text-black placeholder:text-black/20 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                    onChange={(e) => setFormData({ ...formData, favorites: e.target.value })}
                    value={formData.favorites}
                />
            </div>

            <div className="pt-8 flex flex-col md:flex-row items-center md:items-end justify-between gap-8 border-t border-black/5">
                {/* Spice Level Section */}
                <fieldset className="space-y-3 w-full md:w-auto">
                    <legend className="text-[10px] uppercase tracking-widest font-black text-black/40 block text-center md:text-left mb-2">Spice Level</legend>
                    <div className="flex bg-black/5 p-1 rounded-sm justify-center md:justify-start">
                        {['none', 'mild', 'medium', 'hot'].map((lvl) => (
                            <label key={lvl} className="cursor-pointer">
                                <input
                                    type="radio"
                                    name="spice"
                                    value={lvl}
                                    checked={formData.spiceLevel === lvl}
                                    onChange={(e) => setFormData({ ...formData, spiceLevel: e.target.value })}
                                    className="hidden"
                                />
                                <span className={`
                  block px-5 py-2 text-[10px] uppercase tracking-widest transition-all duration-300
                  ${formData.spiceLevel === lvl
                                        ? 'bg-black text-white shadow-lg'
                                        : 'bg-transparent text-black/60 hover:text-black hover:bg-black/5'} 
                `}>
                                    {lvl}
                                </span>
                            </label>
                        ))}
                    </div>
                </fieldset>

                <button
                    type="submit"
                    disabled={loading}
                    className="
            w-full md:w-auto
            bg-[#D94F04] text-white 
            px-14 py-4 
            text-[11px] uppercase tracking-[0.3em] font-black 
            shadow-[0_15px_35px_-5px_rgba(217,79,4,0.4)]
            hover:shadow-[0_20px_45px_-5px_rgba(217,79,4,0.6)]
            hover:-translate-y-1 transition-all active:scale-95 active:translate-y-0
            disabled:opacity-50
          "
                >
                    {loading ? "Preparing..." : "Join"}
                </button>
            </div>
        </form>
    );
}
