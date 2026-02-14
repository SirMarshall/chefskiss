import { ReactNode } from 'react';

interface GlassCardProps {
    children: ReactNode;
}

export default function GlassCard({ children }: GlassCardProps) {
    return (
        <div className="relative z-20 w-full max-w-4xl px-4 md:px-0">
            <div className="bg-white/90 backdrop-blur-2xl border border-white/40 rounded-3xl shadow-[0_32px_80px_-16px_rgba(0,0,0,0.6)] flex flex-col md:flex-row min-h-[580px]">
                {children}
            </div>
        </div>
    );
}
