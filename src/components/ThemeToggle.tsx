"use client";

import React from "react";
import { useTheme } from "@/context/ThemeContext";

export default function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="fixed bottom-8 right-8 z-50 p-4 rounded-full bg-white dark:bg-zinc-800 shadow-2xl border border-black/10 dark:border-white/10 hover:scale-110 active:scale-95 transition-all group overflow-hidden"
            aria-label="Toggle Theme"
        >
            <div className="relative w-6 h-6">
                <span className={`material-symbols-outlined absolute inset-0 transition-transform duration-500 ${theme === 'dark' ? 'rotate-0 opacity-100' : 'rotate-90 opacity-0'}`}>
                    light_mode
                </span>
                <span className={`material-symbols-outlined absolute inset-0 transition-transform duration-500 ${theme === 'light' ? 'rotate-0 opacity-100' : '-rotate-90 opacity-0'}`}>
                    dark_mode
                </span>
            </div>

            {/* Subtle hover effect */}
            <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
    );
}
