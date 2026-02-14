"use client";

import { useState } from "react";
import { useToast } from "@/context/ToastContext";

export default function SignupForm() {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        username: "",
        email: "",
        password: "",
    });

    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Force delay for user gratification
        const minLoadingPromise = new Promise(resolve => setTimeout(resolve, 800));

        try {
            const responsePromise = fetch("/api/users", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            const [response] = await Promise.all([responsePromise, minLoadingPromise]);
            const data = await response.json();

            if (data.success) {
                toast("Welcome to the Kitchen! You've successfully signed up.", "success");
                setFormData({
                    name: "",
                    username: "",
                    email: "",
                    password: "",
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
        <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
                <label className="block font-mono text-[10px] uppercase tracking-[0.15em] font-bold text-gray-500 dark:text-gray-400" htmlFor="first-name">First Name</label>
                <input
                    className="w-full bg-white dark:bg-zinc-800 border border-[var(--input-border)] focus:ring-1 focus:ring-gray-300 dark:focus:ring-gray-500 rounded-sm py-4 px-5 text-black dark:text-white placeholder-gray-300 dark:placeholder-gray-500 font-sans font-light"
                    id="first-name"
                    placeholder="Gordon"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
            </div>
            <div className="space-y-2">
                <label className="block font-mono text-[10px] uppercase tracking-[0.15em] font-bold text-gray-500 dark:text-gray-400" htmlFor="user-name">User Name</label>
                <input
                    className="w-full bg-white dark:bg-zinc-800 border border-[var(--input-border)] focus:ring-1 focus:ring-gray-300 dark:focus:ring-gray-500 rounded-sm py-4 px-5 text-black dark:text-white placeholder-gray-300 dark:placeholder-gray-500 font-sans font-light"
                    id="user-name"
                    placeholder="chef_ramsay"
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                />
            </div>
            <div className="space-y-2">
                <label className="block font-mono text-[10px] uppercase tracking-[0.15em] font-bold text-gray-500 dark:text-gray-400" htmlFor="signup-email">Email Address</label>
                <input
                    className="w-full bg-white dark:bg-zinc-800 border border-[var(--input-border)] focus:ring-1 focus:ring-gray-300 dark:focus:ring-gray-500 rounded-sm py-4 px-5 text-black dark:text-white placeholder-gray-300 dark:placeholder-gray-500 font-sans font-light"
                    id="signup-email"
                    placeholder="chef@kitchen.com"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
            </div>
            <div className="space-y-2">
                <label className="block font-mono text-[10px] uppercase tracking-[0.15em] font-bold text-gray-500 dark:text-gray-400" htmlFor="password">Password</label>
                <input
                    className="w-full bg-white dark:bg-zinc-800 border border-[var(--input-border)] focus:ring-1 focus:ring-gray-300 dark:focus:ring-gray-500 rounded-sm py-4 px-5 text-black dark:text-white placeholder-gray-300 dark:placeholder-gray-500 font-sans font-light"
                    id="password"
                    placeholder="••••••••"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
            </div>
            <div className="pt-6">
                <button
                    className="w-full bg-[#D65A0C] hover:bg-[#B5490A] text-white font-mono font-bold text-xs tracking-[0.2em] uppercase py-5 px-6 rounded-sm shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50"
                    type="submit"
                    disabled={loading}
                >
                    {loading ? "PREPARING..." : "CREATE ACCOUNT"}
                </button>
            </div>
        </form>
    );
}
