"use client";

import { useState } from "react";
import { useToast } from "@/context/ToastContext";

export default function SigninForm() {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Simulation for now
        await new Promise(resolve => setTimeout(resolve, 800));

        // TODO: Implement actual signin logic
        console.log("Signing in with:", formData);
        toast("Welcome back! You've successfully signed in.", "success");
        setLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
                <label className="block font-mono text-[10px] uppercase tracking-[0.15em] font-bold text-gray-500 dark:text-gray-400" htmlFor="signin-email">Email Address</label>
                <input
                    className="w-full bg-white dark:bg-zinc-800 border border-[var(--input-border)] focus:ring-1 focus:ring-gray-300 dark:focus:ring-gray-500 rounded-sm py-4 px-5 text-black dark:text-white placeholder-gray-300 dark:placeholder-gray-500 font-sans font-light"
                    id="signin-email"
                    placeholder="chef@kitchen.com"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
            </div>
            <div className="space-y-2">
                <label className="block font-mono text-[10px] uppercase tracking-[0.15em] font-bold text-gray-500 dark:text-gray-400" htmlFor="signin-password">Password</label>
                <input
                    className="w-full bg-white dark:bg-zinc-800 border border-[var(--input-border)] focus:ring-1 focus:ring-gray-300 dark:focus:ring-gray-500 rounded-sm py-4 px-5 text-black dark:text-white placeholder-gray-300 dark:placeholder-gray-500 font-sans font-light"
                    id="signin-password"
                    placeholder="••••••••"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
            </div>

            <div className="pt-6">
                <button
                    className="w-full bg-[#D65A0C] hover:bg-[#B5490A] text-white font-mono font-bold text-xs tracking-[0.2em] uppercase py-5 px-6 rounded-sm shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                    type="submit"
                    disabled={loading}
                >
                    {loading ? "OFF THE PASS..." : "SIGN IN"}
                </button>
            </div>
        </form>
    );
}
