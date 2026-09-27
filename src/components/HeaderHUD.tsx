import React from 'react';
import { Heart, Flame } from 'lucide-react';
import { ColorMode } from '../types/game';

interface HeaderHUDProps {
  score: number;
  combo: number;
  timeRemainingPercent: number; // 0 to 100
  isInterim: boolean;
  totalTimeMs: number;
  colorMode: ColorMode;
}

export const HeaderHUD: React.FC<HeaderHUDProps> = ({
  score,
  combo,
  timeRemainingPercent,
  isInterim,
  colorMode,
}) => {
  const isUrgent = timeRemainingPercent <= 25 && !isInterim;
  const isLight = colorMode === 'light';

  return (
    <div className="w-full shrink-0 px-4 pt-3 pb-2 z-20 flex flex-col gap-2">
      {/* Top row: Life status & Score ticker */}
      <div className="flex items-center justify-between">
        {/* Life Counter */}
        <div className="flex items-center gap-1.5 font-bold tracking-tight text-sm">
          <Heart className="w-5 h-5 fill-rose-500 text-rose-500 animate-pulse" />
          <span className={`font-display uppercase tracking-wider text-xs ${
            isLight ? 'text-rose-600' : 'text-rose-400'
          }`}>
            1 Life
          </span>
        </div>

        {/* Combo Multiplier (if > 1) */}
        {combo > 1 && (
          <div className={`flex items-center gap-1 text-xs font-bold tracking-wide animate-bounce ${
            isLight ? 'text-amber-600' : 'text-amber-400'
          }`}>
            <Flame className="w-3.5 h-3.5 fill-current" />
            <span className="font-mono-numbers">{combo}x COMBO</span>
          </div>
        )}

        {/* Current Score */}
        <div className="flex items-baseline gap-1.5">
          <span className={`text-xs font-semibold tracking-wider uppercase ${
            isLight ? 'text-slate-500' : 'text-slate-400'
          }`}>
            Score
          </span>
          <span className={`text-2xl font-black font-display tracking-tight font-mono-numbers ${
            isLight ? 'text-slate-900' : 'text-white'
          }`}>
            {score}
          </span>
        </div>
      </div>

      {/* Challenge countdown timer bar */}
      <div className={`w-full h-2 rounded-full overflow-hidden ${
        isLight ? 'bg-slate-200' : 'bg-slate-800/80'
      }`}>
        <div
          className={`h-full transition-all duration-75 ease-linear rounded-full ${
            isUrgent 
              ? 'bg-rose-500 shadow-sm shadow-rose-500/50' 
              : isLight 
              ? 'bg-emerald-500' 
              : 'bg-emerald-400'
          }`}
          style={{ width: `${Math.max(0, Math.min(100, timeRemainingPercent))}%` }}
        />
      </div>
    </div>
  );
};
