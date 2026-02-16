"use client";

import { useSession, signOut } from "@/lib/auth-client";
import { useState, useEffect } from "react";
import { updateUserName, deleteUserAccount } from "@/app/actions/user";
import { useRouter } from "next/navigation";

import { useTheme } from "@/context/ThemeContext";

export default function SettingsView({ onProfileUpdate }: { onProfileUpdate?: () => void }) {
    const { data: session } = useSession();
    const router = useRouter();
    const { theme, setTheme } = useTheme();
    const [name, setName] = useState(session?.user?.name || "");
    const [isUpdating, setIsUpdating] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const handleSignOut = async () => {
        setIsLoggingOut(true);
        try {
            await signOut({
                fetchOptions: {
                    onSuccess: () => {
                        router.push("/");
                    },
                },
            });
        } catch (error) {
            console.error("Logout failed:", error);
            alert("Failed to log out. Please try again.");
            setIsLoggingOut(false);
        }
    };

    const handleUpdateName = async () => {
        if (!name.trim()) return;
        setIsUpdating(true);
        try {
            await updateUserName(name);
            alert("Name updated successfully!");
        } catch (error) {
            console.error(error);
            alert("Failed to update name.");
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (!confirm("Are you sure you want to delete your account? This action cannot be undone.")) return;

        setIsDeleting(true);
        try {
            await deleteUserAccount();
            router.push("/"); // Redirect to home/login
        } catch (error) {
            console.error(error);
            alert("Failed to delete account.");
            setIsDeleting(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-12 py-8">
            <header>
                <h2 className="text-3xl font-light text-gray-900 dark:text-white font-sans mb-2">Account Settings</h2>
                <p className="text-gray-500 dark:text-gray-400">Manage your profile and account preferences.</p>
            </header>

            <section className="space-y-6">
                <div className="border-b border-gray-200 dark:border-gray-800 pb-2">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white font-serif italic">Profile Information</h3>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 font-mono">Display Name</label>
                        <div className="flex gap-4">
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="flex-1 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-gray-700 rounded-sm px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors font-sans text-gray-900 dark:text-white"
                                placeholder="Your Name"
                            />
                            <button
                                onClick={handleUpdateName}
                                disabled={isUpdating || name === session?.user?.name}
                                className="bg-gray-900 dark:bg-white text-white dark:text-zinc-900 px-6 py-2 rounded-sm text-xs font-bold uppercase tracking-wider hover:bg-gray-800 dark:hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-mono"
                            >
                                {isUpdating ? "Saving..." : "Save"}
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            <section className="space-y-6">
                <div className="border-b border-gray-200 dark:border-gray-800 pb-2">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white font-serif italic">Account Security</h3>
                </div>

                <div className="bg-white dark:bg-zinc-800/50 border border-gray-200 dark:border-gray-800/50 rounded-lg p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-1">Session Management</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Securely sign out of your current session.
                        </p>
                    </div>
                    <button
                        onClick={handleSignOut}
                        disabled={isLoggingOut}
                        className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 px-6 py-2.5 rounded-sm text-xs font-bold uppercase tracking-[0.1em] hover:bg-gray-50 dark:hover:bg-zinc-700 transition-all font-mono shadow-sm flex items-center gap-2"
                    >
                        {isLoggingOut ? (
                            <span className="animate-spin h-3.5 w-3.5 border-2 border-gray-400 border-t-transparent rounded-full"></span>
                        ) : (
                            <span className="material-symbols-outlined text-sm">logout</span>
                        )}
                        {isLoggingOut ? "SIGNING OUT..." : "SIGN OUT"}
                    </button>
                </div>
            </section>

            <section className="space-y-6">
                <div className="border-b border-gray-200 dark:border-gray-800 pb-2">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white font-serif italic">Appearance</h3>
                </div>

                <div className="bg-white dark:bg-zinc-800/50 border border-gray-200 dark:border-gray-800/50 rounded-lg p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-1">Theme Mode</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Choose between light and dark interface.
                        </p>
                    </div>
                    <div className="flex bg-gray-100 dark:bg-zinc-900 p-1 rounded-lg border border-gray-200 dark:border-gray-700">
                        <button
                            onClick={() => setTheme('light')}
                            className={`px-4 py-2 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${theme === 'light' ? 'bg-white shadow-sm text-primary' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <span className="material-symbols-outlined text-sm">light_mode</span>
                            Light
                        </button>
                        <button
                            onClick={() => setTheme('dark')}
                            className={`px-4 py-2 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${theme === 'dark' ? 'bg-zinc-800 shadow-sm text-primary' : 'text-gray-500 dark:text-gray-400 hover:text-gray-300'}`}
                        >
                            <span className="material-symbols-outlined text-sm">dark_mode</span>
                            Dark
                        </button>
                    </div>
                </div>
            </section>

            <section className="space-y-6 pt-8">
                <div className="border-b border-red-200 dark:border-red-900/30 pb-2">
                    <h3 className="text-lg font-medium text-red-600 dark:text-red-400 font-serif italic">Danger Zone</h3>
                </div>

                <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-lg p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h4 className="text-sm font-bold text-red-700 dark:text-red-400 mb-1">Delete Account</h4>
                        <p className="text-xs text-red-600/70 dark:text-red-400/70">
                            Permanently remove your account and all associated data.
                        </p>
                    </div>
                    <button
                        onClick={handleDeleteAccount}
                        disabled={isDeleting}
                        className="bg-white dark:bg-zinc-900 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 px-4 py-2 rounded-sm text-xs font-bold uppercase tracking-wider hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50 transition-colors font-mono whitespace-nowrap"
                    >
                        {isDeleting ? "Deleting..." : "Delete Account"}
                    </button>
                </div>
            </section>

             <section className="space-y-6">
                <div className="border-b border-gray-200 dark:border-gray-800 pb-2">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white font-serif italic">Promotions</h3>
                </div>

                <div className="bg-white dark:bg-zinc-800/50 border border-gray-200 dark:border-gray-800/50 rounded-lg p-6">
                     <ReferralCodeInput onProfileUpdate={onProfileUpdate} />
                </div>
            </section>
        </div>
    );
}

function ReferralCodeInput({ onProfileUpdate }: { onProfileUpdate?: () => void }) {
    const [code, setCode] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const { data: session } = useSession(); // Access session to check if already redeemed
    // However, session might not be updated immediately. Ideally we use the profile.
    // For now, let's just allow input. If they are already unlimited, the backend action will just set it to true again, which is fine.

    // Better: Check if they ALREADY have it.
    // We need to fetch the profile to know if they have it, or trust the session if we update session.
    // The session object from `useSession` might not have the custom field unless we added it to the session callback.
    // Let's rely on the action's response or a profile fetch.
    // Actually, let's just fetch the profile to check status on load?
    // Or just let them enter it.

    const [hasUnlimited, setHasUnlimited] = useState(false);

    useEffect(() => {
       // Check status on mount
       import("@/app/actions/mealPlan").then(({getUserProfile}) => {
           getUserProfile().then(profile => {
               if (profile?.hasUnlimitedRegens) {
                   setHasUnlimited(true);
               }
           })
       })
    }, []);

    const handleRedeem = async () => {
        if (!code.trim()) return;
        setIsLoading(true);
        setMessage(null);

        try {
            const { redeemReferralCode } = await import("@/app/actions/user");
            const result = await redeemReferralCode(code);
            if (result.success) {
                setMessage({ type: 'success', text: "Code redeemed! You now have unlimited meal plan generations." });
                setHasUnlimited(true);
                setCode("");
                if (onProfileUpdate) onProfileUpdate(); // Notify parent
            }
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || "Invalid code." });
        } finally {
            setIsLoading(false);
        }
    };

    if (hasUnlimited) {
         return (
             <div className="flex items-center gap-3 text-green-600 dark:text-green-400">
                 <span className="material-symbols-outlined">check_circle</span>
                 <div>
                     <p className="font-bold text-sm uppercase tracking-wide">Premium Active</p>
                     <p className="text-xs opacity-80">Unlimited meal plan generations enabled.</p>
                 </div>
             </div>
         )
    }

    return (
        <div className="flex flex-col gap-4">
             <div>
                <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-1">Referral Code</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                    Enter a code to unlock detailed features.
                </p>
            </div>
            <div className="flex gap-4">
                <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Enter code"
                    className="flex-1 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-gray-700 rounded-sm px-4 py-2 text-sm focus:outline-none focus:border-primary transition-colors font-mono uppercase"
                />
                <button
                    onClick={handleRedeem}
                    disabled={isLoading || !code.trim()}
                    className="bg-gray-900 dark:bg-white text-white dark:text-zinc-900 px-6 py-2 rounded-sm text-xs font-bold uppercase tracking-wider hover:bg-gray-800 dark:hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-mono"
                >
                    {isLoading ? "Checking..." : "Redeem"}
                </button>
            </div>
            {message && (
                <p className={`text-xs font-bold ${message.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>
                    {message.text}
                </p>
            )}
        </div>
    );
}
