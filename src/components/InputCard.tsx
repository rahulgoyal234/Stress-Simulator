import React from 'react';
import { IntensityLevel } from '../types/stress';
import { Sparkles, AlertTriangle, ArrowRight, Loader2, RotateCcw } from 'lucide-react';

interface InputCardProps {
  situation: string;
  setSituation: (val: string) => void;
  intensity: IntensityLevel;
  setIntensity: (val: IntensityLevel) => void;
  loading: boolean;
  error: string | null;
  onSubmit: () => void;
  onClear: () => void;
}

const EXAMPLES = [
  'A data breach before a fundraise',
  'A partner stops performing in a joint venture',
  'A cheque bounces on a ₹50 lakh deal'
];

export const InputCard: React.FC<InputCardProps> = ({
  situation,
  setSituation,
  intensity,
  setIntensity,
  loading,
  error,
  onSubmit,
  onClear
}) => {
  const intensityLevels: { level: IntensityLevel; desc: string; color: string }[] = [
    { level: 'Mild', desc: 'Routine regulatory or legal frictions', color: 'hover:border-blue-400' },
    { level: 'Severe', desc: 'Existential commercial or statutory shock', color: 'hover:border-amber-400' },
    { level: 'Extreme', desc: 'Simultaneous coercive, criminal & media collapse', color: 'hover:border-red-400' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!situation.trim() || loading) return;
    onSubmit();
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6">
      <div className="relative rounded-2xl bg-slate-900/70 border border-white/10 backdrop-blur-xl p-6 sm:p-8 shadow-2xl shadow-black/60 transition-all duration-300 hover:border-white/15">
        {/* Subtle accent top line */}
        <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent"></div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                <span>The Crucible</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30 font-mono">
                  Input Scenario
                </span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Describe your commercial transaction, corporate dispute, investigation, or crisis.
              </p>
            </div>

            {situation.length > 0 && (
              <button
                type="button"
                onClick={onClear}
                disabled={loading}
                className="self-start sm:self-auto text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors cursor-pointer py-1"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Clear input
              </button>
            )}
          </div>

          {/* Example prompt chips */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-400 tracking-wider uppercase font-mono">
              Quick test scenarios:
            </span>
            <div className="flex flex-wrap gap-2">
              {EXAMPLES.map((example) => (
                <button
                  key={example}
                  type="button"
                  onClick={() => setSituation(example)}
                  disabled={loading}
                  className={`text-xs px-3.5 py-1.5 rounded-lg border transition-all cursor-pointer text-left ${
                    situation === example
                      ? 'bg-violet-600/30 border-violet-400/60 text-violet-200'
                      : 'bg-slate-800/60 border-slate-700/70 text-slate-300 hover:bg-slate-700/60 hover:border-slate-500'
                  }`}
                >
                  &ldquo;{example}&rdquo;
                </button>
              ))}
            </div>
          </div>

          {/* Situation Textarea */}
          <div className="relative">
            <textarea
              value={situation}
              onChange={(e) => setSituation(e.target.value)}
              placeholder="E.g., Our founding CTO resigned abruptly taking our core IP, and an angel investor is threatening Section 420 IPC and sending legal notices to our prospective Series A leads..."
              rows={4}
              disabled={loading}
              className="w-full rounded-xl bg-slate-950/80 border border-slate-700/80 p-4 text-slate-100 placeholder:text-slate-500 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all resize-y leading-relaxed font-sans"
            />
            <div className="flex justify-between items-center mt-1 text-xs text-slate-500 px-1">
              <span>Assumes Indian legal and commercial framework</span>
              <span>{situation.length} characters</span>
            </div>
          </div>

          {/* Intensity Selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 tracking-wider uppercase font-mono flex items-center gap-1.5">
              <span>Stress Intensity:</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {intensityLevels.map(({ level, desc, color }) => {
                const isSelected = intensity === level;
                return (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setIntensity(level)}
                    disabled={loading}
                    className={`relative p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? level === 'Extreme'
                          ? 'bg-red-950/40 border-red-500 text-red-200 shadow-lg shadow-red-950/50'
                          : level === 'Severe'
                          ? 'bg-amber-950/40 border-amber-500 text-amber-200 shadow-lg shadow-amber-950/50'
                          : 'bg-blue-950/40 border-blue-500 text-blue-200 shadow-lg shadow-blue-950/50'
                        : `bg-slate-950/40 border-slate-800 text-slate-400 ${color} hover:text-slate-200`
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold text-sm">
                      <span>{level}</span>
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full bg-current"></span>
                      )}
                    </div>
                    <p className="text-xs opacity-75 mt-0.5 leading-snug">{desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 rounded-xl bg-red-950/60 border border-red-800 text-red-200 text-sm flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-xs tracking-wider uppercase text-red-300">
                  Simulation Error
                </p>
                <p className="mt-0.5">{error}</p>
                <p className="text-xs text-red-300/80 mt-1">
                  Check your situation description and retry.
                </p>
              </div>
            </div>
          )}

          {/* Submit Action */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Sparkles className="w-4 h-4 text-violet-400" />
              <span>Multi-agent cascade testing across 5 practitioner archetypes</span>
            </div>

            <button
              type="submit"
              disabled={loading || !situation.trim()}
              className={`w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm tracking-wide transition-all duration-200 flex items-center justify-center gap-2 text-white shadow-xl cursor-pointer ${
                loading || !situation.trim()
                  ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed shadow-none'
                  : 'bg-gradient-to-r from-violet-600 via-purple-600 to-orange-500 hover:from-violet-500 hover:to-orange-400 shadow-violet-900/40 hover:shadow-orange-900/40 transform hover:-translate-y-0.5 active:translate-y-0'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Applying pressure…</span>
                </>
              ) : (
                <>
                  <span>Run stress test</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
