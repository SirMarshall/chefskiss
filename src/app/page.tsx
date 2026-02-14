"use client";

import React, { useState, useEffect } from 'react';
import SignupForm from '@/components/SignupForm';

export default function App() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);


  return (
    <div className="relative min-h-screen w-full overflow-hidden flex items-center justify-center font-sans selection:bg-orange-200 selection:text-orange-900 bg-black">

      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `
            conic-gradient(
              #000000 90deg, 
              #ffffff 90deg 180deg, 
              #000000 180deg 270deg, 
              #ffffff 270deg
            )
          `,
          backgroundSize: '200px 200px',
          backgroundPosition: 'center',
        }}
      />

      <div className="absolute inset-0 z-0 bg-radial-gradient from-transparent via-transparent to-black/80 pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(0,0,0,0) 0%, rgba(0,0,0,0.8) 100%)' }}></div>

      <div
        className={`
          relative z-10 w-full max-w-5xl overflow-hidden flex flex-col md:flex-row rounded-3xl shadow-[0_35px_60px_-15px_rgba(0,0,0,0.6)]
          transition-all duration-1000 ease-out transform
          border border-white/20
          ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}
        `}
        style={{ minHeight: '600px' }}
      >

        <div className="w-full md:w-5/12 bg-gray-100/90 backdrop-blur-3xl p-12 flex flex-col justify-between relative border-r border-black/5">
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-multiply" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>

          <div>

            <div className="mb-12">
              <h1 className="text-6xl tracking-tight leading-none text-black">
                <span className="block font-light font-sans tracking-wide">CHEF'S</span>
                <span className="block font-serif font-black italic ml-1">KISS</span>
              </h1>
            </div>

            <div className="w-12 h-0.5 bg-black mb-6"></div>

            <p className="font-mono text-xs tracking-[0.2em] font-bold text-gray-800 uppercase leading-relaxed">
              Generative Personal <br />
              Meal Prep AI
            </p>
          </div>

          <div className="mt-12 md:mt-0">
            <p className="font-serif italic text-gray-900 text-lg leading-relaxed">
              "Your palate is unique.<br />
              Your menu should be too."
            </p>
          </div>
        </div>
        <div className="w-full md:w-7/12 bg-white/90 backdrop-blur-3xl p-12 flex flex-col justify-center">
          <SignupForm />
        </div>
      </div>
    </div>
  );
}