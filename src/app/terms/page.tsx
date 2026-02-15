"use client";

import React, { useState } from 'react';
import AuthLayout from '@/components/AuthLayout';
import AuthCard from '@/components/AuthCard';
import { useRouter } from 'next/navigation';
import { useToast } from '@/context/ToastContext';

export default function TermsPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    const handleAccept = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/user/update', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    termsAccepted: true,
                }),
            });

            if (response.ok) {
                toast("Terms accepted. Welcome aboard!", "success");
                // Force a hard reload to ensure session is updated
                window.location.href = '/onboarding';
            } else {
                toast("Failed to accept terms. Please try again.", "error");
            }
        } catch (error) {
            console.error("Error accepting terms:", error);
            toast("Something went wrong. Please try again.", "error");
        } finally {
            setLoading(false);
        }
    };

    const LeftPanel = (
        <>
            <div>
                <h1 className="font-sans text-4xl md:text-5xl font-light tracking-wider text-black dark:text-white mb-0 leading-[0.8]">
                    CHEF'S
                </h1>
                <h1 className="font-serif italic text-5xl md:text-6xl font-bold text-black dark:text-white mt-2">
                    KISS
                </h1>
                <div className="w-12 h-0.5 bg-black dark:bg-white mt-8 mb-6"></div>
                <p className="font-mono text-[10px] font-bold tracking-[0.2em] uppercase text-black dark:text-white leading-relaxed max-w-[180px]">
                    Generative Personal Meal Prep AI
                </p>
            </div>
            <div className="mt-12">
                <p className="font-serif italic text-lg md:text-xl text-black dark:text-white leading-snug">
                    "Crafting your perfect plate, one byte at a time."
                </p>
            </div>
        </>
    );

    const RightPanel = (
        <div className="flex flex-col h-full -m-8 md:-m-10">
            <div className="px-8 md:px-16 pt-12 pb-6 border-b border-gray-100 dark:border-gray-800">
                <h2 className="font-serif italic text-3xl md:text-4xl text-black dark:text-white mb-2">
                    Terms and Conditions
                </h2>
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
                    Last Updated: October 2023
                </p>
            </div>
            <div className="flex-1 overflow-y-auto px-8 md:px-16 py-8 custom-scrollbar">
                <div className="prose prose-sm max-w-none dark:prose-invert">
                    <section className="mb-10">
                        <h3 className="flex items-baseline gap-3 text-black dark:text-white">
                            <span className="font-serif italic font-bold text-[#D65A0C] text-2xl">1.</span>
                            <span className="font-sans font-semibold text-lg uppercase tracking-wide">Acceptance of Terms</span>
                        </h3>
                        <p className="font-sans text-gray-500 dark:text-gray-400 leading-relaxed mt-4">
                            By accessing and using Chef's Kiss, you agree to be bound by these Terms and Conditions and our Privacy Policy. If you do not agree to all of these terms, do not use the service. Our platform utilizes advanced generative artificial intelligence to provide personalized meal plans and nutritional advice.
                        </p>
                    </section>
                    <section className="mb-10">
                        <h3 className="flex items-baseline gap-3 text-black dark:text-white">
                            <span className="font-serif italic font-bold text-[#D65A0C] text-2xl">2.</span>
                            <span className="font-sans font-semibold text-lg uppercase tracking-wide">Privacy Policy</span>
                        </h3>
                        <p className="font-sans text-gray-500 dark:text-gray-400 leading-relaxed mt-4">
                            Your privacy is paramount. We collect personal data including dietary preferences, health goals, and family information to tailor your experience. Please review our full Privacy Policy to understand how we encrypt, store, and process your culinary profile data.
                        </p>
                    </section>
                    <section className="mb-10">
                        <h3 className="flex items-baseline gap-3 text-black dark:text-white">
                            <span className="font-serif italic font-bold text-[#D65A0C] text-2xl">3.</span>
                            <span className="font-sans font-semibold text-lg uppercase tracking-wide">User Accounts</span>
                        </h3>
                        <p className="font-sans text-gray-500 dark:text-gray-400 leading-relaxed mt-4">
                            Users are responsible for maintaining the confidentiality of their account credentials. You agree to provide accurate information and update it regularly. Chef's Kiss reserves the right to suspend accounts that provide false information or violate our community guidelines.
                        </p>
                    </section>
                    <section className="mb-10">
                        <h3 className="flex items-baseline gap-3 text-black dark:text-white">
                            <span className="font-serif italic font-bold text-[#D65A0C] text-2xl">4.</span>
                            <span className="font-sans font-semibold text-lg uppercase tracking-wide">Content &amp; AI Generation</span>
                        </h3>
                        <p className="font-sans text-gray-500 dark:text-gray-400 leading-relaxed mt-4">
                            All recipes and meal plans generated by Chef's Kiss are for informational purposes. While our AI strives for accuracy, users must verify ingredients against personal allergies or medical restrictions. Chef's Kiss is not liable for adverse reactions or nutritional discrepancies resulting from AI-generated content.
                        </p>
                    </section>
                    <section className="mb-10">
                        <h3 className="flex items-baseline gap-3 text-black dark:text-white">
                            <span className="font-serif italic font-bold text-[#D65A0C] text-2xl">5.</span>
                            <span className="font-sans font-semibold text-lg uppercase tracking-wide">Subscription &amp; Payments</span>
                        </h3>
                        <p className="font-sans text-gray-500 dark:text-gray-400 leading-relaxed mt-4">
                            Premium features are available through monthly or annual subscriptions. Fees are non-refundable except as required by law. You may cancel your subscription at any time through your account settings.
                        </p>
                    </section>
                </div>
            </div>
            <div className="px-8 md:px-16 py-8 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-zinc-900 flex flex-col sm:flex-row items-center gap-4">
                <button
                    onClick={handleAccept}
                    disabled={loading}
                    className="w-full sm:w-auto px-10 py-4 bg-[#D65A0C] hover:bg-[#B5490A] text-white font-mono font-bold text-xs tracking-[0.2em] uppercase rounded-sm shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? "PROCESSING..." : "I AGREE"}
                </button>
                <button className="w-full sm:w-auto px-10 py-4 border border-gray-200 dark:border-gray-700 text-black dark:text-white font-mono font-bold text-xs tracking-[0.2em] uppercase rounded-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    PRINT
                </button>
            </div>
        </div>
    );

    return (
        <AuthLayout>
            <AuthCard leftPanel={LeftPanel} rightPanel={RightPanel} />
        </AuthLayout>
    );
}
