import React, { ReactNode } from 'react';
import ThemeToggle from './ThemeToggle';

interface AuthLayoutProps {
    children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
    return (
        <div className="relative min-h-screen w-full overflow-hidden flex items-center justify-center font-sans selection:bg-primary selection:text-white bg-background-light dark:bg-black transition-colors duration-500">
            {/* Vibrant Checkerboard Background */}
            <div
                className="absolute inset-0 z-0"
                style={{
                    backgroundImage: `conic-gradient(var(--checker-color-1) 90deg, var(--checker-color-2) 90deg 180deg, var(--checker-color-1) 180deg 270deg, var(--checker-color-2) 270deg)`,
                    backgroundSize: '200px 200px',
                    backgroundPosition: 'center',
                }}
            />

            {/* Radial Overlay for depth */}
            <div
                className="absolute inset-0 z-0 pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(0,0,0,0) 0%, var(--radial-overlay) 100%)' }}
            />

            {/* Content Container */}
            <div className="relative z-10 w-full flex justify-center p-4">
                {children}
            </div>

            {/* Theme Toggle */}
            <ThemeToggle />
        </div>
    );
}

