import React, { useState, useEffect, useRef } from 'react';
import { StressTestResult, PriorityType } from '../types/stress';
import { RoleCard } from './RoleCard';
import { Timeline } from './Timeline';
import {
  Flame,
  Swords,
  CheckCircle2,
  Clock,
  EyeOff,
  PlusCircle,
  Loader2,
  ChevronRight,
  ShieldCheck,
  ShieldAlert,
  ShieldX
} from 'lucide-react';

interface ResultViewProps {
  result: StressTestResult;
  onAddShock: (newShock: string) => void;
  reRunning: boolean;
}

const AnimatedBlock: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = ''
}) => {
  const domRef = useRef<HTMLDivElement>(null);
  const [isVisible, setVisible] = useState(false);

  useEffect(() => {
    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isReduced) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            if (domRef.current) observer.unobserve(domRef.current);
          }
        });
      },
      { threshold: 0.1 }
    );

    const { current } = domRef;
    if (current) {
      observer.observe(current);
    }

    return () => {
      if (current) observer.unobserve(current);
    };
  }, []);

  return (
    <div
      ref={domRef}
      className={`transition-all duration-700 ease-out transform ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      } ${className}`}
    >
      {children}
    </div>
  );
};

export const ResultView: React.FC<ResultViewProps> = ({ result, onAddShock, reRunning }) => {
  const [newShockInput, setNewShockInput] = useState('');

  const sampleSecondaryShocks = [
    'A whistleblower leaks internal email threads to Twitter/X',
    'The Income Tax department issues an urgent Section 131 summons',
    'The anchor lender freezes the company’s ₹25 Cr credit facility'
  ];

  const handleShockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newShockInput.trim() || reRunning) return;
    onAddShock(newShockInput.trim());
    setNewShockInput('');
  };

  const score = Math.max(0, Math.min(result.score, 100));
  const scoreColor =
    score >= 70
      ? 'text-emerald-400 border-emerald-500/50 bg-emerald-950/20 shadow-emerald-500/20'
      : score >= 45
      ? 'text-amber-400 border-amber-500/50 bg-amber-950/20 shadow-amber-500/20'
      : 'text-red-400 border-red-500/50 bg-red-950/20 shadow-red-500/20';

  const getVerdictIcon = () => {
    if (result.verdict === 'Resilient') {
      return <ShieldCheck className="w-5 h-5 text-emerald-400" />;
    }
    if (result.verdict === 'Strained') {
      return <ShieldAlert className="w-5 h-5 text-amber-400" />;
    }
    return <ShieldX className="w-5 h-5 text-red-500" />;
  };

  const getPriorityBadge = (priority: PriorityType) => {
    switch (priority) {
      case 'Now':
        return (
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-red-950/60 text-red-300 border border-red-700/60">
            Immediate · Now
          </span>
        );
      case 'Soon':
        return (
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-700/60">
            Next 7 Days · Soon
          </span>
        );
      case 'Later':
        return (
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-950/60 text-blue-300 border border-blue-700/60">
            Structural · Later
          </span>
        );
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-16 space-y-16">
      {/* 1. Score and Executive Summary Card */}
      <AnimatedBlock>
        <div className="relative rounded-3xl bg-slate-900/80 border border-white/10 p-6 sm:p-10 backdrop-blur-2xl shadow-2xl overflow-hidden">
          {/* Subtle colored glow based on score */}
          <div
            className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl pointer-events-none opacity-20 -mr-20 -mt-20"
            style={{
              backgroundColor: score >= 70 ? '#10b981' : score >= 45 ? '#f59e0b' : '#ef4444'
            }}
          />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative z-10">
            <div className="space-y-3 flex-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-xs font-mono text-slate-300">
                <span>STRESS-TEST VERDICT</span>
                <span className="text-slate-500">·</span>
                <span className="flex items-center gap-1 font-bold">
                  {getVerdictIcon()} {result.verdict}
                </span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                {result.title}
              </h2>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-3xl pt-1">
                {result.summary}
              </p>
            </div>

            {/* Huge Resilience Score */}
            <div className="flex flex-col items-center justify-center sm:self-start lg:self-auto shrink-0">
              <div
                className={`w-36 h-36 sm:w-44 sm:h-44 rounded-3xl border-2 flex flex-col items-center justify-center p-4 backdrop-blur-xl shadow-2xl transition-all ${scoreColor}`}
              >
                <span className="text-[11px] font-mono uppercase tracking-[0.2em] opacity-80 font-bold mb-1">
                  Resilience
                </span>
                <span className="text-5xl sm:text-6xl font-black tracking-tighter leading-none">
                  {score}
                </span>
                <span className="text-xs font-mono opacity-60 mt-1">/ 100</span>
              </div>
            </div>
          </div>
        </div>
      </AnimatedBlock>

      {/* 2. Five Lenses Section */}
      <AnimatedBlock>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
                <span>The Five Lenses</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Hover over each practitioner lens to inspect their posture and breaking trigger.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-5">
            {result.roles.map((roleData) => (
              <RoleCard key={roleData.role} data={roleData} />
            ))}
          </div>
        </div>
      </AnimatedBlock>

      {/* 3. Where They Clash */}
      {result.clashes && result.clashes.length > 0 && (
        <AnimatedBlock>
          <div className="rounded-2xl bg-slate-900/70 border border-white/10 p-6 sm:p-8 backdrop-blur-xl">
            <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2.5 mb-4">
              <Swords className="w-5 h-5 text-violet-400" />
              <span>Where They Clash</span>
              <span className="text-xs font-mono font-normal text-slate-400 px-2 py-0.5 rounded bg-slate-800">
                Institutional Friction
              </span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {result.clashes.map((clash, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-start gap-3"
                >
                  <span className="w-6 h-6 rounded-lg bg-violet-950/60 border border-violet-800/60 text-violet-300 font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
                    {clash}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </AnimatedBlock>
      )}

      {/* 4. How It Unravels (Vertical Timeline) */}
      <AnimatedBlock>
        <div className="space-y-6">
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
              <Clock className="w-5 h-5 text-orange-400" />
              <span>How It Unravels</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Five escalating chronological shocks showing how fault lines cascade under pressure.
            </p>
          </div>

          <Timeline cascade={result.cascade} />
        </div>
      </AnimatedBlock>

      {/* 5. Breaking Point Card */}
      <AnimatedBlock>
        <div className="relative rounded-2xl bg-gradient-to-r from-red-950/80 via-slate-900/90 to-red-950/80 border-2 border-red-500/60 p-6 sm:p-8 backdrop-blur-2xl shadow-2xl shadow-red-950/80 overflow-hidden">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-600/20 border border-red-500/40 flex items-center justify-center shrink-0 shadow-lg shadow-red-900/50">
              <Flame className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <div className="text-xs font-mono uppercase tracking-[0.2em] text-red-400 font-bold mb-1">
                Systemic Breaking Point
              </div>
              <h4 className="text-lg sm:text-xl font-bold text-white mb-2">
                Where the structure catastrophically fails
              </h4>
              <p className="text-sm sm:text-base text-red-100/95 leading-relaxed font-sans">
                {result.breaking_point}
              </p>
            </div>
          </div>
        </div>
      </AnimatedBlock>

      {/* 6. What To Do (Fixes) & Blind Spots Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Fixes - 2 cols on lg */}
        <AnimatedBlock className="lg:col-span-2">
          <div className="h-full rounded-2xl bg-slate-900/70 border border-white/10 p-6 sm:p-8 backdrop-blur-xl flex flex-col justify-between">
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2.5 mb-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>What To Do</span>
              </h3>
              <p className="text-xs text-slate-400 mb-6">
                Prioritized interventions to plug legal exposures, protect balance sheet, and retain narrative leverage.
              </p>

              <div className="space-y-4">
                {result.fixes.map((fix, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-sm text-white flex items-center gap-2">
                        <span className="text-xs text-slate-500 font-mono">#{idx + 1}</span>
                        {fix.action}
                      </span>
                      {getPriorityBadge(fix.priority)}
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed pl-5">
                      <strong className="text-slate-400 font-medium">Why: </strong>
                      {fix.why}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </AnimatedBlock>

        {/* Blind Spots - 1 col on lg */}
        <AnimatedBlock className="lg:col-span-1">
          <div className="h-full rounded-2xl bg-slate-900/70 border border-white/10 p-6 sm:p-8 backdrop-blur-xl flex flex-col justify-between">
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2.5 mb-2">
                <EyeOff className="w-5 h-5 text-amber-400" />
                <span>Blind Spots</span>
              </h3>
              <p className="text-xs text-slate-400 mb-6">
                Critical vulnerabilities typically missed until court summons or police notice arrives.
              </p>

              <div className="space-y-3">
                {result.blind_spots.map((spot, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-slate-950/60 border border-amber-900/30 text-xs sm:text-sm text-slate-200 leading-relaxed flex items-start gap-2.5"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 mt-2" />
                    <span>{spot}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </AnimatedBlock>
      </div>

      {/* 7. Add Another Shock (Iterative Re-run) */}
      <AnimatedBlock>
        <div className="rounded-2xl bg-gradient-to-br from-violet-950/40 via-slate-900/90 to-purple-950/40 border border-violet-500/30 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
          <div className="max-w-3xl space-y-4">
            <div className="flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-violet-400" />
              <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                Add Another Shock
              </h3>
              <span className="text-xs font-mono text-violet-300 px-2 py-0.5 rounded bg-violet-900/40 border border-violet-700/50">
                Iterative Stress Escalation
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Inject a new secondary disruption on top of this existing situation. The five lenses will reassess cascading failure using the previous summary and breaking point as baseline context.
            </p>

            {/* Quick chips for secondary shock */}
            <div className="flex flex-wrap gap-2 pt-1">
              {sampleSecondaryShocks.map((shock) => (
                <button
                  key={shock}
                  type="button"
                  onClick={() => setNewShockInput(shock)}
                  disabled={reRunning}
                  className="text-xs px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800/60 text-slate-300 hover:text-white hover:border-violet-400 transition-colors cursor-pointer text-left"
                >
                  + &ldquo;{shock}&rdquo;
                </button>
              ))}
            </div>

            {/* Form */}
            <form onSubmit={handleShockSubmit} className="pt-2 flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={newShockInput}
                onChange={(e) => setNewShockInput(e.target.value)}
                placeholder="E.g., A competitor launches a public smear campaign on LinkedIn..."
                disabled={reRunning}
                className="flex-1 rounded-xl bg-slate-950/80 border border-slate-700 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 font-sans"
              />
              <button
                type="submit"
                disabled={reRunning || !newShockInput.trim()}
                className={`px-6 py-3 rounded-xl font-bold text-sm tracking-wide text-white transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  reRunning || !newShockInput.trim()
                    ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                    : 'bg-gradient-to-r from-violet-600 via-purple-600 to-orange-500 hover:from-violet-500 hover:to-orange-400 shadow-lg shadow-purple-900/40'
                }`}
              >
                {reRunning ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Re-stressing…</span>
                  </>
                ) : (
                  <>
                    <span>Inject & Re-run</span>
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </AnimatedBlock>
    </div>
  );
};
