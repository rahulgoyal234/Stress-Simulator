import React, { useRef, useState, useEffect } from 'react';
import { RoleAnalysis, ROLE_CONFIG } from '../types/stress';
import { Scale, ShieldAlert, TrendingDown, Megaphone, Siren, AlertCircle } from 'lucide-react';

interface RoleCardProps {
  data: RoleAnalysis;
}

export const RoleCard: React.FC<RoleCardProps> = ({ data }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState<string>('perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)');
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const config = ROLE_CONFIG[data.role];

  const getRoleIcon = () => {
    switch (data.role) {
      case 'Judge':
        return <Scale className="w-5 h-5 text-[#e8b84a]" />;
      case 'Advocate':
        return <ShieldAlert className="w-5 h-5 text-[#4aa3ff]" />;
      case 'Businessperson':
        return <TrendingDown className="w-5 h-5 text-[#4ade80]" />;
      case 'Journalist':
        return <Megaphone className="w-5 h-5 text-[#ff5fa2]" />;
      case 'Police':
        return <Siren className="w-5 h-5 text-[#ff7a3d]" />;
      default:
        return null;
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reducedMotion || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    // rotateX/Y up to 14 degrees, translateZ 10px
    const rotateY = (x * 28).toFixed(2);
    const rotateX = (-y * 28).toFixed(2);
    setTransform(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`);
  };

  const handlePointerLeave = () => {
    setTransform('perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)');
  };

  const holdsColor =
    data.holds >= 70
      ? 'bg-emerald-500'
      : data.holds >= 45
      ? 'bg-amber-500'
      : 'bg-red-500';

  return (
    <div
      ref={cardRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      style={{
        transform,
        transition: 'transform 0.15s ease-out, border-color 0.2s ease, box-shadow 0.2s ease',
        boxShadow: `0 10px 30px -10px ${config.color}25`
      }}
      className="relative rounded-2xl bg-slate-900/80 border border-white/10 p-5 sm:p-6 backdrop-blur-xl flex flex-col justify-between overflow-hidden group"
    >
      {/* Coloured top border & glow */}
      <div
        className="absolute top-0 left-0 right-0 h-1.5"
        style={{
          backgroundColor: config.color,
          boxShadow: `0 0 16px ${config.color}`
        }}
      />

      <div>
        {/* Header: Role Icon, Name, and Holds score bar */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center border"
              style={{
                backgroundColor: config.accentBg,
                borderColor: config.accentBorder
              }}
            >
              {getRoleIcon()}
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-white tracking-tight">
                {data.role}
              </h3>
              <p className="text-[11px] text-slate-400 leading-none">
                {config.description.split(',')[0]}
              </p>
            </div>
          </div>

          {/* Holds score badge */}
          <div className="text-right">
            <div className="text-xs font-mono font-bold text-white flex items-center justify-end gap-1">
              <span>{data.holds}</span>
              <span className="text-[10px] text-slate-400">/ 100</span>
            </div>
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">
              Holds
            </span>
          </div>
        </div>

        {/* Holds score progress bar */}
        <div className="w-full bg-slate-800 rounded-full h-1.5 mb-5 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out ${holdsColor}`}
            style={{ width: `${Math.max(5, Math.min(data.holds, 100))}%` }}
          />
        </div>

        {/* Body items: Sees and Would */}
        <div className="space-y-4 text-xs sm:text-sm">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold mb-1">
              Sees
            </div>
            <p className="text-slate-200 leading-relaxed bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/80">
              {data.sees}
            </p>
          </div>

          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold mb-1">
              Would
            </div>
            <p className="text-slate-200 leading-relaxed bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/80">
              {data.would_do}
            </p>
          </div>
        </div>
      </div>

      {/* Footer: Turns against you when (red text) */}
      <div className="mt-5 pt-3.5 border-t border-red-900/30">
        <div className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-red-400 font-bold mb-1">
          <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
          <span>Turns against you when</span>
        </div>
        <p className="text-xs text-red-300/90 leading-relaxed font-medium bg-red-950/25 p-2 rounded-lg border border-red-900/40">
          {data.turns_when}
        </p>
      </div>
    </div>
  );
};
