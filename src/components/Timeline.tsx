import React from 'react';
import { CascadeShock, ROLE_CONFIG, RoleName } from '../types/stress';
import { Zap, AlertOctagon } from 'lucide-react';

interface TimelineProps {
  cascade: CascadeShock[];
}

export const Timeline: React.FC<TimelineProps> = ({ cascade }) => {
  const getSeverityBadge = (severity: number) => {
    if (severity >= 4) {
      return {
        borderClass: 'border-red-500/80',
        bgClass: 'bg-red-950/40',
        textClass: 'text-red-400',
        label: `Severity ${severity}/5 · Critical Failure`
      };
    }
    if (severity === 3) {
      return {
        borderClass: 'border-orange-500/80',
        bgClass: 'bg-orange-950/40',
        textClass: 'text-orange-400',
        label: `Severity ${severity}/5 · Acute Strain`
      };
    }
    return {
      borderClass: 'border-amber-500/80',
      bgClass: 'bg-amber-950/40',
      textClass: 'text-amber-400',
      label: `Severity ${severity}/5 · Initial Tremor`
    };
  };

  return (
    <div className="relative pl-6 sm:pl-10 space-y-8 before:absolute before:left-3 sm:before:left-5 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-amber-500/50 via-orange-500/50 to-red-600/70">
      {cascade.map((item, index) => {
        const sev = getSeverityBadge(item.severity);

        return (
          <div key={index} className="relative group">
            {/* Timeline node marker */}
            <div
              className={`absolute -left-6 sm:-left-10 top-3 w-6 h-6 rounded-full bg-slate-950 border-2 ${sev.borderClass} flex items-center justify-center -translate-x-1/2 shadow-lg transition-transform duration-200 group-hover:scale-110`}
            >
              {item.severity >= 4 ? (
                <AlertOctagon className="w-3 h-3 text-red-400" />
              ) : (
                <Zap className="w-3 h-3 text-amber-400" />
              )}
            </div>

            {/* Shock Card */}
            <div
              className={`rounded-xl bg-slate-900/80 border ${sev.borderClass} p-5 backdrop-blur-md shadow-xl transition-all duration-200 hover:bg-slate-900/95`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs px-2.5 py-1 rounded-md bg-slate-800 text-slate-200 font-bold border border-slate-700">
                    {item.when}
                  </span>
                  <span className={`text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full ${sev.bgClass} ${sev.textClass} border ${sev.borderClass}`}>
                    {sev.label}
                  </span>
                </div>

                {/* Role Hit Pills */}
                {item.hits && item.hits.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 mr-1">
                      Hits:
                    </span>
                    {item.hits.map((hitRole) => {
                      const matchedKey = Object.keys(ROLE_CONFIG).find(
                        (k) => k.toLowerCase() === hitRole.trim().toLowerCase()
                      ) as RoleName | undefined;
                      const cfg = matchedKey ? ROLE_CONFIG[matchedKey] : null;

                      return (
                        <span
                          key={hitRole}
                          className="text-[10px] font-semibold px-2 py-0.5 rounded-full border flex items-center gap-1"
                          style={{
                            color: cfg ? cfg.color : '#e2e8f0',
                            borderColor: cfg ? `${cfg.color}55` : '#475569',
                            backgroundColor: cfg ? `${cfg.color}15` : '#1e293b'
                          }}
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: cfg ? cfg.color : '#cbd5e1' }}
                          />
                          {hitRole}
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Shock title */}
              <h4 className="text-base sm:text-lg font-bold text-white tracking-tight mb-2">
                {item.shock}
              </h4>

              {/* Direct Impact */}
              <div className="bg-slate-950/60 rounded-lg p-3 border border-slate-800/80">
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold block mb-1">
                  Cascading Impact:
                </span>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {item.impact}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
