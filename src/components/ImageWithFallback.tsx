"use client";

import Image, { ImageProps } from "next/image";
import { useState, useEffect } from "react";

interface ImageWithFallbackProps extends ImageProps {
    fallbackSrc?: string;
    isRateLimited?: boolean; // prop to manually trigger rate limit view if needed
}

export default function ImageWithFallback({
    src,
    alt,
    fallbackSrc = "https://images.unsplash.com/photo-1495195134817-aeb325a55b65?q=80&w=1000&auto=format&fit=crop", // Default pleasant food fallback
    isRateLimited,
    ...props
}: ImageWithFallbackProps) {
    const [imgSrc, setImgSrc] = useState(src);
    const [hasError, setHasError] = useState(isRateLimited || false);

    useEffect(() => {
        setImgSrc(src);
        setHasError(isRateLimited || false);
    }, [src, isRateLimited]);

    if (hasError) {
        // Render a nice fallback container instead of just a broken image
        return (
            <div className={`relative overflow-hidden bg-gray-100 dark:bg-zinc-800 flex items-center justify-center ${props.className}`}>
                <div className="absolute inset-0 opacity-50 filter blur-sm">
                   {/* Attempt to show fallback, or just a color */}
                   <img 
                      src={fallbackSrc} 
                      alt="Fallback" 
                      className="w-full h-full object-cover"
                   />
                </div>
                <div className="relative z-10 p-4 text-center">
                    <span className="material-symbols-outlined text-gray-400 text-3xl mb-1">restaurant</span>
                    <p className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">
                        Image Unavailable
                    </p>
                </div>
            </div>
        );
    }

    return (
        <Image
            {...props}
            src={imgSrc}
            alt={alt}
            onError={() => {
                setHasError(true);
            }}
        />
    );
}
