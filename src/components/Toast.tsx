import React, { useEffect, useState } from 'react';

interface ToastProps {
    message: string;
    type: 'success' | 'error';
    onClose: () => void;
}

export default function Toast({ message, type, onClose }: ToastProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Trigger enter animation
        const timer = setTimeout(() => setIsVisible(true), 10);
        return () => clearTimeout(timer);
    }, []);

    const handleClose = () => {
        setIsVisible(false);
        // Wait for exit animation
        setTimeout(onClose, 300);
    };

    const isSuccess = type === 'success';

    return (
        <div
            className={`
                pointer-events-auto
                transform transition-all duration-300 ease-out
                ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
                flex items-center gap-3
                px-6 py-4
                min-w-[300px] max-w-md
                rounded-xl
                border border-white/20
                shadow-[0_8px_32px_0_rgba(0,0,0,0.36)]
                backdrop-blur-md
                ${isSuccess ? 'bg-emerald-900/80 text-white' : 'bg-red-900/80 text-white'}
            `}
            role="alert"
        >
            <span className="material-symbols-outlined text-xl">
                {isSuccess ? 'check_circle' : 'error'}
            </span>
            <p className="text-sm font-medium tracking-wide">{message}</p>
            <button
                onClick={handleClose}
                className="ml-auto text-white/60 hover:text-white transition-colors"
            >
                <span className="material-symbols-outlined text-lg">close</span>
            </button>
        </div>
    );
}
