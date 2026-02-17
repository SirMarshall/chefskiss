"use client";

import React, { useState } from 'react';
import AuthLayout from '@/components/AuthLayout';
import AuthCard from '@/components/AuthCard';
import { useRouter } from 'next/navigation';
import { useSession, updateUser } from '@/lib/auth-client';
import { useToast } from '@/context/ToastContext';

export default function TermsPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    const { data: session } = useSession();

    const handleAccept = async () => {
        setLoading(true);
        try {
            // Update user using auth client which also updates the session immediately
            const { data, error } = await updateUser({
                termsAccepted: true
            } as any);

            if (!error) {
                toast("Terms accepted. Welcome aboard!", "success");

                // Smart Redirect: If already onboarded, go to dashboard. Else onboarding.
                if ((session?.user as any)?.onboardingComplete) {
                    window.location.href = '/dashboard';
                } else {
                    window.location.href = '/onboarding';
                }
            } else {
                console.error("Error accepting terms:", error);
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
                <h1 className="font-sans text-3xl md:text-5xl font-light tracking-wider text-black dark:text-white mb-0 leading-[0.8]">
                    CHEF'S
                </h1>
                <h1 className="font-serif italic text-4xl md:text-6xl font-bold text-black dark:text-white mt-2">
                    KISS
                </h1>
                <div className="w-12 h-0.5 bg-black dark:bg-white mt-4 mb-4 md:mt-8 md:mb-6"></div>
                <p className="font-mono text-[10px] font-bold tracking-[0.2em] uppercase text-black dark:text-white leading-relaxed max-w-[180px]">
                    Generative Personal Meal Prep AI
                </p>
            </div>
            <div className="mt-6 md:mt-12">
                <p className="font-serif italic text-base md:text-xl text-black dark:text-white leading-snug">
                    "Crafting your perfect plate, one byte at a time."
                </p>
            </div>
        </>
    );

    const RightPanel = (
        <div className="flex flex-col h-full -m-6 md:-m-10">
            <div className="px-6 md:px-16 pt-6 md:pt-12 pb-6 border-b border-gray-100 dark:border-gray-800">
                <h2 className="font-serif italic text-3xl md:text-4xl text-black dark:text-white mb-2">
                    Terms and Conditions
                </h2>
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
                    Last Updated: February 15, 2026
                </p>
            </div>
            <div className="flex-1 overflow-auto px-6 md:px-16 py-6 md:py-8 custom-scrollbar">
                <div className="prose prose-sm max-w-none dark:prose-invert max-h-[60vh] md:max-h-none overflow-y-auto md:overflow-visible pr-2">
                    <section className="mb-10">
                        <h3 className="flex items-baseline gap-3 text-black dark:text-white">
                            <span className="font-serif italic font-bold text-primary text-2xl">1.</span>
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
                    <section className="mb-10">
                        <h3 className="flex items-baseline gap-3 text-black dark:text-white">
                            <span className="font-serif italic font-bold text-[#D65A0C] text-2xl">6.</span>
                            <span className="font-sans font-semibold text-lg uppercase tracking-wide">Important Health & Medical Disclaimer</span>
                        </h3>
                        <div className="font-sans text-gray-500 dark:text-gray-400 leading-relaxed mt-4 space-y-4">
                            <p>
                                <strong>CHEF'S KISS DOES NOT PROVIDE MEDICAL ADVICE.</strong> The content generated by Chef's Kiss, including meal plans, nutritional information, and dietary suggestions ("the Content"), is for informational and educational purposes only. The Content is not intended to be a substitute for professional medical advice, diagnosis, or treatment.
                            </p>
                            <p>
                                Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition, dietary changes, or before starting any new diet or nutrition program. Never disregard professional medical advice or delay in seeking it because of something you have read on the Chef's Kiss platform.
                            </p>
                            <p>
                                Chef's Kiss does not endorse or guarantee the accuracy of any nutritional data or analysis provided by its AI systems. Individual dietary needs vary and the meal plans generated may not be suitable for everyone. You are solely responsible for ensuring that any food you consume is safe for you and does not contain ingredients to which you are allergic.
                            </p>
                        </div>
                    </section>
                </div>
            </div>
            <div className="px-6 md:px-16 py-6 md:py-8 border-t border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md flex flex-col sm:flex-row items-center gap-4 z-10 relative">
                <button
                    onClick={handleAccept}
                    disabled={loading}
                    className="w-full sm:w-auto px-10 py-4 bg-primary hover:bg-primary/90 text-white font-mono font-bold text-xs tracking-[0.2em] uppercase rounded-sm shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
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
            <AuthCard
                leftPanel={LeftPanel}
                rightPanel={RightPanel}
                className="max-h-[85vh] h-[85vh]"
                hideLeftPanelOnMobile={true}
            />
        </AuthLayout>
    );
}
