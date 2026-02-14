import CheckerboardSidebar from "@/components/CheckerboardSidebar";
import GlassCard from "@/components/GlassCard";
import SignupForm from "@/components/SignupForm";

export default function SignupPage() {
  return (
    <div className="h-screen w-full flex font-sans overflow-hidden bg-neutral-900">

      <CheckerboardSidebar />

      <div className="flex-1 relative flex items-center justify-center">

        <div
          className="absolute inset-0 z-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=2070')`,
            filter: 'grayscale(100%) contrast(1.2) brightness(0.7)'
          }}
        ></div>

        {/* Aesthetic Overlays */}
        <div className="absolute inset-0 z-10 bg-gradient-to-br from-black/40 via-transparent to-black/60"></div>

        <div className="absolute inset-0 z-10 pointer-events-none opacity-20"
          style={{ backgroundImage: `url('https://www.transparenttextures.com/patterns/stardust.png')` }}>
        </div>

        <GlassCard>
          <div className="p-10 md:w-[38%] flex flex-col justify-between border-b md:border-b-0 md:border-r border-black/5 bg-gray-50/50">
            <div>
              <span className="material-symbols-outlined text-4xl text-black mb-6 block">skillet</span>
              <h1 className="text-5xl md:text-6xl font-extralight tracking-tighter uppercase text-black leading-[0.85] mb-2">
                Chef&apos;s<br /><span className="font-serif font-bold italic tracking-tight">Kiss</span>
              </h1>
              <div className="h-[2px] w-12 bg-black my-8"></div>

              <p className="text-[10px] tracking-[0.15em] text-black font-black uppercase leading-relaxed opacity-80">
                Generative Personal <br /> Meal Prep AI
              </p>
            </div>

            {/* Subtext */}
            <div className="mt-12 md:mt-0">
              <p className="text-[13px] leading-relaxed text-black/60 italic font-serif">
                &quot;Your palate is unique. <br /> Your menu should be too.&quot;
              </p>
            </div>
          </div>

          <div className="p-8 md:p-12 md:w-[62%] bg-white">
            <SignupForm />
          </div>
        </GlassCard>
      </div>
    </div>
  );
}