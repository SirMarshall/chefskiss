import React, { ReactNode } from 'react';

interface AuthCardProps {
    children?: ReactNode; // Make children optional if using slots
    leftPanel: ReactNode;
    rightPanel: ReactNode;
    className?: string; // Allow custom classes
    hideLeftPanelOnMobile?: boolean;
}

export default function AuthCard({ leftPanel, rightPanel, className = "", hideLeftPanelOnMobile = false }: AuthCardProps) {
    return (
        <div className={`relative z-10 w-full md:w-[940px] max-w-[95vw] overflow-hidden flex flex-col md:flex-row rounded-3xl shadow-[0_35px_60px_-15px_rgba(0,0,0,0.6)] bg-white/90 backdrop-blur-3xl border border-[var(--card-border)] h-auto min-h-[500px] md:min-h-[700px] transition-none ${className}`}>
            {/* Left Panel */}
            <div className={`w-full md:w-5/12 bg-gray-100/90 dark:bg-zinc-900/90 backdrop-blur-3xl p-6 md:p-10 flex flex-col justify-between relative border-b md:border-b-0 md:border-r border-black/5 dark:border-white/5 ${hideLeftPanelOnMobile ? 'hidden md:flex' : 'flex'}`}>
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-multiply"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}>
                </div>

                {leftPanel}
            </div>

            {/* Right Panel */}
            <div className="w-full md:w-7/12 bg-white/90 dark:bg-black/80 backdrop-blur-3xl p-6 md:p-10 flex flex-col justify-center flex-1">
                {rightPanel}
            </div>
        </div>
    );
}
