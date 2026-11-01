import React from 'react';
import { Scale } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-12 border-t border-slate-800/80 text-center relative z-10">
      <div className="flex items-center justify-center gap-2 mb-3 text-slate-500">
        <Scale className="w-4 h-4 text-slate-400" />
        <span className="text-xs uppercase tracking-widest font-mono font-semibold">
          Legal & Strategic Prudence
        </span>
      </div>
      <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto leading-relaxed">
        AI-generated analysis for thinking and planning, not legal advice. Assumes Indian context unless you say otherwise. Verify any cited law before relying on it.
      </p>
      <div className="mt-4 text-[11px] font-mono text-slate-500">
        Stress Simulator: Five Lenses · Judge · Advocate · Businessperson · Journalist · Police
      </div>
    </footer>
  );
};
