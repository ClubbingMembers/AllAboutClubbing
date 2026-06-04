import React from 'react';
import { Sparkles, Users } from 'lucide-react';

interface IntroductionSlideProps {
  title: string;
  subtitle: string;
  eventCount: number;
  registrationsCount: number;
  theme?: string;
}

export const IntroductionSlide: React.FC<IntroductionSlideProps> = ({
  title,
  subtitle,
  theme,
  registrationsCount,
}) => {
  const isLight = theme === 'light';

  return (
    <div id="slide-intro" className={`relative h-full w-full flex flex-col justify-between p-8 md:p-14 font-sans overflow-hidden ${
      isLight ? 'text-slate-900' : 'text-white'
    }`}>
      {/* Design accents / Guide rules for the presentation feel */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        {/* Subtle grid lines */}
        <div className={`absolute top-8 bottom-8 left-8 right-8 border ${isLight ? 'border-black/5' : 'border-white/5'}`} />
        <div className={`absolute left-8 right-8 top-1/2 -translate-y-1/2 border-t ${isLight ? 'border-black/5' : 'border-white/5'}`} />
        <div className={`absolute top-8 bottom-8 left-1/3 border-l ${isLight ? 'border-black/5' : 'border-white/5'}`} />
        <div className={`absolute top-8 bottom-8 left-2/3 border-l ${isLight ? 'border-black/5' : 'border-white/5'}`} />
        
        {/* PowerPoint Page Indicators */}
        <div className="absolute top-12 left-12 font-mono text-xs tracking-widest text-[#f43f5e] opacity-90 uppercase flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#f43f5e] animate-ping-slow" />
          <span>01 // HOME</span>
        </div>
      </div>

      {/* Main hero title section: ONLY the title, centered, colossal and dramatic */}
      <div className="my-auto mx-auto text-center max-w-4xl space-y-5 z-10">
        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${
          isLight ? 'bg-black/5 border-black/10' : 'bg-white/5 border-white/10'
        }`}>
          <Sparkles className="w-3.5 h-3.5 text-[#f43f5e] animate-pulse" />
          <span className={`font-mono text-[9px] tracking-widest uppercase ${isLight ? 'text-black/60' : 'text-white/50'}`}>SUMMER SELECTION</span>
        </div>
        <h1 className={`font-syne font-black text-2xl sm:text-4xl md:text-7xl lg:text-8xl tracking-tighter uppercase text-glow leading-[1] select-none whitespace-pre-line ${
          isLight ? 'text-[#0f172a]' : 'text-white'
        }`}>
           {title}
        </h1>

        {/* Dynamic Registered Users Count Badge */}
        <div className="flex items-center justify-center gap-2 mt-4 select-none">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border bg-emerald-500/10 border-emerald-500/20 text-emerald-400">
            <Users className="w-3.5 h-3.5 shrink-0 animate-pulse text-emerald-400" />
            <span className="font-mono text-[9px] font-bold uppercase tracking-widest leading-none">
              {registrationsCount} Membr{registrationsCount !== 1 ? 'i' : 'o'} Registrat{registrationsCount !== 1 ? 'i' : 'o'}
            </span>
          </div>
        </div>

      </div>

      {/* Slide footer info */}
      <div className={`font-mono text-xs tracking-wider flex justify-center items-center gap-4 z-10 border-t pt-4 ${
        isLight ? 'text-black/50 border-black/10' : 'text-white/40 border-white/5'
      }`}>
        <div className="text-center font-bold">PREMIUM SOUND & STAGE GRAPHICS</div>
      </div>
    </div>
  );
};
