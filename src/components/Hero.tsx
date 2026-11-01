import React from 'react';
import { ArrowDown, ShieldAlert, Scale, TrendingDown, Megaphone, Siren } from 'lucide-react';

interface HeroProps {
  onScrollClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onScrollClick }) => {
  return (
    <section className="relative min-h-[92vh] flex flex-col justify-between pt-12 pb-8 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto z-10">
      {/* Top Bar with brand and context indicator */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-amber-500 flex items-center justify-center shadow-lg shadow-violet-500/20 border border-white/20">
            <span className="font-bold text-white text-xs tracking-wider">5L</span>
          </div>
          <span className="text-xs uppercase tracking-[0.25em] text-slate-400 font-semibold">
            Stress Simulator · Indian Jurisprudence & Commerce
          </span>
        </div>

        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/60 border border-slate-800 text-xs text-slate-300 backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>Live Stress Engine</span>
        </div>
      </div>

      {/* Main Hero Content - Left aligned on desktop to leave right side open for the 3D scene */}
      <div className="my-auto py-12 max-w-2xl lg:max-w-3xl">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-950/40 border border-violet-500/30 text-violet-300 text-xs sm:text-sm font-semibold tracking-[0.18em] uppercase mb-6 backdrop-blur-md shadow-sm">
          <span>FIVE LENSES · ONE SITUATION</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-[#d8b4fe] to-[#fb7185] leading-[1.08] mb-6 drop-shadow-sm">
          Break it before reality does.
        </h1>

        <p className="text-base sm:text-lg lg:text-xl text-slate-300 leading-relaxed font-normal mb-8 max-w-2xl">
          Subject any deal, crisis, or conflict to the simultaneous scrutiny of an Indian Judge, Advocate, Businessperson, Journalist, and Police officer before the fault lines rupture.
        </p>

        {/* Five role preview tags */}
        <div className="flex flex-wrap gap-2 sm:gap-3 mb-8">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-[#e8b84a]/10 text-[#e8b84a] border border-[#e8b84a]/30">
            <Scale className="w-3.5 h-3.5" /> Judge
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-[#4aa3ff]/10 text-[#4aa3ff] border border-[#4aa3ff]/30">
            <ShieldAlert className="w-3.5 h-3.5" /> Advocate
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-[#4ade80]/10 text-[#4ade80] border border-[#4ade80]/30">
            <TrendingDown className="w-3.5 h-3.5" /> Businessperson
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-[#ff5fa2]/10 text-[#ff5fa2] border border-[#ff5fa2]/30">
            <Megaphone className="w-3.5 h-3.5" /> Journalist
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-[#ff7a3d]/10 text-[#ff7a3d] border border-[#ff7a3d]/30">
            <Siren className="w-3.5 h-3.5" /> Police
          </span>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={onScrollClick}
            className="px-6 py-3.5 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-violet-600 via-purple-600 to-orange-500 hover:from-violet-500 hover:to-orange-400 shadow-lg shadow-purple-900/30 transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
          >
            Run Stress Simulator
          </button>
          <span className="text-xs text-slate-400 tracking-wide">
            Cascades · Clashes · Breaking Points
          </span>
        </div>
      </div>

      {/* Bottom Scroll Cue */}
      <div className="flex justify-start sm:justify-center pt-4">
        <button
          onClick={onScrollClick}
          aria-label="Scroll to input form"
          className="group flex flex-col items-center gap-1.5 text-xs font-mono uppercase tracking-[0.2em] text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <span>SCROLL ↓</span>
          <div className="w-5 h-5 rounded-full border border-slate-700 flex items-center justify-center group-hover:border-violet-400 transition-colors">
            <ArrowDown className="w-3 h-3 group-hover:translate-y-0.5 transition-transform" />
          </div>
        </button>
      </div>
    </section>
  );
};
