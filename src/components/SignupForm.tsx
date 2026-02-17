"use client";

import { useState } from "react";
import { useToast } from "@/context/ToastContext";
import { signIn, signUp } from "@/lib/auth-client";

export default function SignupForm() {
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordFocus, setPasswordFocus] = useState(false);
    const [confirmPasswordFocus, setConfirmPasswordFocus] = useState(false);
    const { toast } = useToast();

    const handleGoogleSignIn = async () => {
        setGoogleLoading(true);
        try {
            await signIn.social({
                provider: "google",
                callbackURL: "/terms",
            });
        } catch (error) {
            console.error("Google sign-in error:", error);
            toast("Failed to sign in with Google. Please try again.", "error");
        } finally {
            setGoogleLoading(false);
        }
    };

    const handleInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
        if (e.target.id === 'password') {
            setPasswordFocus(true);
        } else if (e.target.id === 'confirm-password') {
            setConfirmPasswordFocus(true);
        }

        // Small delay to account for keyboard opening on mobile
        setTimeout(() => {
            e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 300);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const password = formData.password;
        if (password.length < 8) {
            toast("Password must be at least 8 characters long", "error");
            return;
        }
        if (!/[A-Z]/.test(password)) {
            toast("Password must contain at least one uppercase letter", "error");
            return;
        }
        if (!/[0-9]/.test(password)) {
            toast("Password must contain at least one number", "error");
            return;
        }
        if (!/[^A-Za-z0-9]/.test(password)) {
            toast("Password must contain at least one symbol", "error");
            return;
        }

        if (password !== formData.confirmPassword) {
            toast("Passwords do not match", "error");
            return;
        }

        setLoading(true);

        try {
            const { error } = await signUp.email({
                email: formData.email,
                password: formData.password,
                name: formData.name,
                username: formData.username,
                callbackURL: "/terms",
            } as any);

            if (error) {
                toast(error.message || "Failed to create account", "error");
            } else {
                toast("Account created! Signing you in...", "success");

                // Auto-login
                const { error: signInError } = await signIn.email({
                    email: formData.email,
                    password: formData.password,
                    callbackURL: "/terms",
                });

                if (signInError) {
                    toast("Account created, but failed to auto-sign in. Please sign in manually.", "error");
                }
                // Redirect is handled by callbackURL
            }
        } catch (error) {
            console.error("Signup error:", error);
            toast("Something went wrong. Please try again later.", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-5">
            <form onSubmit={handleSubmit} className="space-y-3.5">
                <div className="space-y-1.5">
                    <label className="block font-mono text-[10px] uppercase tracking-[0.15em] font-bold text-gray-500 dark:text-gray-400" htmlFor="first-name">First Name</label>
                    <input
                        className="w-full bg-white dark:bg-zinc-800 border border-[var(--input-border)] focus:ring-1 focus:ring-gray-300 dark:focus:ring-gray-500 rounded-sm py-3.5 px-5 text-black dark:text-white placeholder-gray-300 dark:placeholder-gray-500 font-sans font-light"
                        id="first-name"
                        placeholder="Gordon"
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        onFocus={handleInputFocus}
                        disabled={loading || googleLoading}
                        required
                    />
                </div>
                <div className="space-y-1.5">
                    <label className="block font-mono text-[10px] uppercase tracking-[0.15em] font-bold text-gray-500 dark:text-gray-400" htmlFor="user-name">User Name</label>
                    <input
                        className="w-full bg-white dark:bg-zinc-800 border border-[var(--input-border)] focus:ring-1 focus:ring-gray-300 dark:focus:ring-gray-500 rounded-sm py-3.5 px-5 text-black dark:text-white placeholder-gray-300 dark:placeholder-gray-500 font-sans font-light"
                        id="user-name"
                        placeholder="chef_ramsay"
                        type="text"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        onFocus={handleInputFocus}
                        disabled={loading || googleLoading}
                        required
                    />
                </div>
                <div className="space-y-1.5">
                    <label className="block font-mono text-[10px] uppercase tracking-[0.15em] font-bold text-gray-500 dark:text-gray-400" htmlFor="signup-email">Email Address</label>
                    <input
                        className="w-full bg-white dark:bg-zinc-800 border border-[var(--input-border)] focus:ring-1 focus:ring-gray-300 dark:focus:ring-gray-500 rounded-sm py-3.5 px-5 text-black dark:text-white placeholder-gray-300 dark:placeholder-gray-500 font-sans font-light"
                        id="signup-email"
                        placeholder="chef@kitchen.com"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        onFocus={handleInputFocus}
                        disabled={loading || googleLoading}
                        required
                    />
                </div>
                <div className="space-y-1.5">
                    <label className="block font-mono text-[10px] uppercase tracking-[0.15em] font-bold text-gray-500 dark:text-gray-400" htmlFor="password">Password</label>
                    <div className="relative">
                        <input
                            className={`w-full bg-white dark:bg-zinc-800 border ${formData.password && (!/[A-Z]/.test(formData.password) || !/[0-9]/.test(formData.password) || !/[^A-Za-z0-9]/.test(formData.password) || formData.password.length < 8)
                                ? 'border-red-500 focus:ring-red-500'
                                : 'border-[var(--input-border)] focus:ring-gray-300 dark:focus:ring-gray-500'
                                } focus:ring-1 rounded-sm py-3.5 px-5 pr-12 text-black dark:text-white placeholder-gray-300 dark:placeholder-gray-500 font-sans font-light transition-colors`}
                            id="password"
                            placeholder="••••••••"
                            type={showPassword ? "text" : "password"}
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            onFocus={handleInputFocus}
                            onBlur={() => setPasswordFocus(false)}
                            disabled={loading || googleLoading}
                            required
                            minLength={8}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        >
                            <span className="material-symbols-outlined text-lg">
                                {showPassword ? 'visibility' : 'visibility_off'}
                            </span>
                        </button>

                        {/* Password Requirements Popover */}
                        <div className={`absolute left-0 bottom-full mb-3 w-full bg-white dark:bg-zinc-800 border-2 border-primary dark:border-primary/80 rounded-lg shadow-2xl p-4 z-20 transition-all duration-200 transform origin-bottom ring-4 ring-primary/10 dark:ring-primary/20 ${passwordFocus ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-2 pointer-events-none'}`}>
                            <div className="flex flex-wrap gap-x-3 gap-y-1.5">
                                <p className={`text-[10px] uppercase tracking-wider font-mono transition-colors font-bold ${!formData.password ? 'text-gray-400' : (formData.password.length >= 8 ? 'text-green-600 dark:text-green-400' : 'text-gray-400')}`}>
                                    {formData.password && formData.password.length >= 8 ? '✓' : '○'} 8+ Chars
                                </p>
                                <p className={`text-[10px] uppercase tracking-wider font-mono transition-colors font-bold ${!formData.password ? 'text-gray-400' : (/[A-Z]/.test(formData.password) ? 'text-green-600 dark:text-green-400' : 'text-gray-400')}`}>
                                    {formData.password && /[A-Z]/.test(formData.password) ? '✓' : '○'} Uppercase
                                </p>
                                <p className={`text-[10px] uppercase tracking-wider font-mono transition-colors font-bold ${!formData.password ? 'text-gray-400' : (/[0-9]/.test(formData.password) ? 'text-green-600 dark:text-green-400' : 'text-gray-400')}`}>
                                    {formData.password && /[0-9]/.test(formData.password) ? '✓' : '○'} Number
                                </p>
                                <p className={`text-[10px] uppercase tracking-wider font-mono transition-colors font-bold ${!formData.password ? 'text-gray-400' : (/[^A-Za-z0-9]/.test(formData.password) ? 'text-green-600 dark:text-green-400' : 'text-gray-400')}`}>
                                    {formData.password && /[^A-Za-z0-9]/.test(formData.password) ? '✓' : '○'} Symbol
                                </p>
                            </div>
                            <div className="absolute left-6 bottom-[-6px] w-3 h-3 bg-white dark:bg-zinc-800 border-b-2 border-r-2 border-primary dark:border-primary/80 transform rotate-45"></div>
                        </div>
                    </div>
                </div>
                <div className="space-y-1.5">
                    <label className="block font-mono text-[10px] uppercase tracking-[0.15em] font-bold text-gray-500 dark:text-gray-400" htmlFor="confirm-password">Confirm Password</label>
                    <div className="relative">
                        <input
                            className={`w-full bg-white dark:bg-zinc-800 border ${formData.confirmPassword && formData.password !== formData.confirmPassword
                                ? 'border-red-500 focus:ring-red-500'
                                : 'border-[var(--input-border)] focus:ring-gray-300 dark:focus:ring-gray-500'
                                } focus:ring-1 rounded-sm py-3.5 px-5 pr-12 text-black dark:text-white placeholder-gray-300 dark:placeholder-gray-500 font-sans font-light transition-colors`}
                            id="confirm-password"
                            placeholder="••••••••"
                            type={showConfirmPassword ? "text" : "password"}
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                            onFocus={handleInputFocus}
                            onBlur={() => setConfirmPasswordFocus(false)}
                            disabled={loading || googleLoading}
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        >
                            <span className="material-symbols-outlined text-lg">
                                {showConfirmPassword ? 'visibility' : 'visibility_off'}
                            </span>
                        </button>

                        {/* Confirm Password Requirements Popover */}
                        <div className={`absolute left-0 bottom-full mb-3 w-full bg-white dark:bg-zinc-800 border-2 border-primary dark:border-primary/80 rounded-lg shadow-2xl p-4 z-20 transition-all duration-200 transform origin-bottom ring-4 ring-primary/10 dark:ring-primary/20 ${confirmPasswordFocus ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-2 pointer-events-none'}`}>
                            <div className="flex flex-wrap gap-x-3 gap-y-1.5">
                                <p className={`text-[10px] uppercase tracking-wider font-mono transition-colors font-bold ${!formData.confirmPassword ? 'text-gray-400' : (formData.password === formData.confirmPassword ? 'text-green-600 dark:text-green-400' : 'text-red-500')}`}>
                                    {formData.confirmPassword && formData.password === formData.confirmPassword ? '✓' : (formData.confirmPassword ? '✕' : '○')} Passwords Match
                                </p>
                            </div>
                            <div className="absolute left-6 bottom-[-6px] w-3 h-3 bg-white dark:bg-zinc-800 border-b-2 border-r-2 border-primary dark:border-primary/80 transform rotate-45"></div>
                        </div>
                    </div>
                </div>
                <div className="pt-2">
                    <button
                        className="w-full bg-primary hover:bg-primary/90 text-white font-mono font-bold text-xs tracking-[0.2em] uppercase py-4.5 px-6 rounded-sm shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50"
                        type="submit"
                        disabled={loading || googleLoading}
                    >
                        {loading ? "PREPARING..." : "CREATE ACCOUNT"}
                    </button>
                </div>
            </form>

            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200 dark:border-zinc-700"></div>
                </div>
                <div className="relative flex justify-center text-[10px] uppercase tracking-[0.2em] font-mono">
                    <span className="bg-white dark:bg-zinc-900 px-4 text-gray-500">or</span>
                </div>
            </div>

            <button
                onClick={handleGoogleSignIn}
                disabled={loading || googleLoading}
                className="w-full flex items-center justify-center gap-3 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-700/50 text-gray-700 dark:text-gray-200 font-sans font-medium text-sm py-4 px-6 rounded-sm transition-all duration-300 disabled:opacity-50"
            >
                {googleLoading ? (
                    <span className="font-mono text-xs tracking-widest uppercase">Connecting...</span>
                ) : (
                    <>
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        <span>Continue with Google</span>
                    </>
                )}
            </button>
        </div>
    );
}
