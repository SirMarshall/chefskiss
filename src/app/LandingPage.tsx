"use client";

import React, { useState, useEffect } from 'react';
import AuthLayout from '@/components/AuthLayout';
import AuthCard from '@/components/AuthCard';
import SignupForm from '@/components/SignupForm';
import SigninForm from '@/components/SigninForm';

export default function LandingPage() {
    const [mounted, setMounted] = useState(false);
    const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signup');

    useEffect(() => {
        setMounted(true);
    }, []);

    const LeftPanel = (
        <>
            <div>
                <div className="mb-0">
                    <h1 className="font-sans text-3xl md:text-5xl font-light tracking-wider text-black dark:text-white mb-0 leading-[0.8]">
                        CHEF'S
                    </h1>
                    <h1 className="font-serif italic text-4xl md:text-6xl font-bold text-black dark:text-white mt-2">
                        KISS
                    </h1>
                </div>

                <div className="w-16 h-0.5 bg-black dark:bg-white mt-4 mb-4 md:mt-10 md:mb-6"></div>

                <p className="font-mono text-xs font-bold tracking-[0.2em] uppercase text-black dark:text-white leading-relaxed max-w-[200px]">
                    Generative Personal Meal Prep AI
                </p>
            </div>

            <div className="mt-6 md:mt-0">
                <p className="font-serif italic text-lg md:text-2xl text-black dark:text-white leading-snug">
                    "Your palate is unique.<br />
                    Your menu should be too."
                </p>
            </div>
        </>
    );

    const RightPanel = (
        <div className="flex flex-col h-full">
            {/* Tabs */}
            <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6 -mx-6 md:-mx-10 -mt-6 md:-mt-8">
                <div
                    onClick={() => setAuthMode('signup')}
                    className={`flex-1 text-center py-6 cursor-pointer transition-all ${authMode === 'signup' ? 'border-b-2 border-primary' : 'opacity-40 hover:opacity-70'}`}
                >
                    <span className="font-mono text-[10px] md:text-xs font-bold tracking-[0.15em] uppercase text-black dark:text-white">
                        New to Chef's Kiss?
                    </span>
                </div>
                <div
                    onClick={() => setAuthMode('signin')}
                    className={`flex-1 text-center py-6 cursor-pointer transition-all ${authMode === 'signin' ? 'border-b-2 border-primary' : 'opacity-40 hover:opacity-70'}`}
                >
                    <span className="font-mono text-[10px] md:text-xs font-bold tracking-[0.15em] uppercase text-gray-500 dark:text-gray-400">
                        Already a Member?
                    </span>
                </div>
            </div>

            <div className="flex-1 flex flex-col max-w-lg mx-auto w-full">
                <div className="transition-all duration-500 ease-in-out">
                    <div className="mb-6">
                        <h2 className="font-serif italic text-3xl md:text-4xl text-black dark:text-white mb-2 transition-all duration-300 h-10 md:h-12 overflow-hidden">
                            {authMode === 'signup' ? 'Start Your Culinary Journey' : 'Welcome Back, Chef'}
                        </h2>
                        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
                            {authMode === 'signup' ? 'Create your personalized taste profile' : 'Sign in to access your menu'}
                        </p>
                    </div>

                    <div className="relative md:h-[620px]">
                        <div className={`transition-all duration-500 md:absolute md:inset-0 ${authMode === 'signup' ? 'relative opacity-100 translate-x-0' : 'absolute inset-0 opacity-0 -translate-x-8 pointer-events-none'}`}>
                            <SignupForm />
                        </div>
                        <div className={`transition-all duration-500 md:absolute md:inset-0 ${authMode === 'signin' ? 'relative opacity-100 translate-x-0' : 'absolute inset-0 opacity-0 translate-x-8 pointer-events-none'}`}>
                            <SigninForm />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <AuthLayout>
            <div className={`w-full flex justify-center transition-all duration-1000 ease-out transform ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
                <AuthCard leftPanel={LeftPanel} rightPanel={RightPanel} />
            </div>
        </AuthLayout>
    );
}
