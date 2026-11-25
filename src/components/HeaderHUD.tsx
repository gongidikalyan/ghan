import React from 'react';
import { Heart, Flame, Zap } from 'lucide-react';
import { ColorMode } from '../types/game';
import { getDifficultyInfo } from '../utils/difficulty';

interface HeaderHUDProps {
  score: number;
  combo: number;
  lives: number;
  maxLives?: number;
  timeRemainingPercent: number; // 0 to 100
  isInterim: boolean;
  totalTimeMs: number;
  colorMode: ColorMode;
}

export const HeaderHUD: React.FC<HeaderHUDProps> = ({
  score,
  combo,
  lives,
  maxLives = 3,
  timeRemainingPercent,
  isInterim,
  totalTimeMs,
  colorMode,
}) => {
  const isUrgent = timeRemainingPercent <= 25 && !isInterim;
  const isLight = colorMode === 'light';
  const difficulty = getDifficultyInfo(score);

  return (
    <div className="w-full shrink-0 px-4 pt-3 pb-2 z-20 flex flex-col gap-2">
      {/* Top row: Life status, Dynamic Difficulty Badge & Score ticker */}
      <div className="flex items-center justify-between">
        {/* Left: Lives Counter (3 Hearts) */}
        <div
          className="flex items-center gap-1"
          aria-label={`${lives} of ${maxLives} lives remaining`}
          title={`${lives} of ${maxLives} lives remaining`}
        >
          {Array.from({ length: maxLives }).map((_, idx) => {
            const isAlive = idx < lives;
            const isLastLife = lives === 1 && isAlive;
            return (
              <Heart
                key={idx}
                className={`w-5 h-5 transition-all duration-200 ${
                  isAlive
                    ? `fill-rose-500 text-rose-500 ${isLastLife ? 'animate-pulse scale-110' : ''}`
                    : isLight
                    ? 'text-slate-300 scale-90 opacity-60'
                    : 'text-slate-700 scale-90 opacity-60'
                }`}
              />
            );
          })}
        </div>

        {/* Center: Dynamic Difficulty & Speed Badge */}
        <div className="flex items-center gap-2">
          <div
            className={`px-2 py-0.5 rounded-full border text-[10px] font-black font-display tracking-wider uppercase flex items-center gap-1 transition-all ${
              difficulty.badgeColor
            } ${difficulty.isHighTension ? 'animate-pulse' : ''}`}
            title={`Dynamic Speed: ${difficulty.speedLabel} (${(totalTimeMs / 1000).toFixed(1)}s limit)`}
          >
            <Zap className="w-3 h-3 fill-current" />
            <span>{difficulty.tierName} {difficulty.speedLabel}</span>
          </div>

          {/* Combo Multiplier (if > 1) */}
          {combo > 1 && (
            <div className={`hidden sm:flex items-center gap-1 text-xs font-bold tracking-wide animate-bounce ${
              isLight ? 'text-amber-600' : 'text-amber-400'
            }`}>
              <Flame className="w-3.5 h-3.5 fill-current" />
              <span className="font-mono-numbers">{combo}x</span>
            </div>
          )}
        </div>

        {/* Right: Current Score */}
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

      {/* Challenge countdown timer bar + live seconds readout */}
      <div className="w-full flex items-center gap-2">
        <div className={`flex-1 h-2 rounded-full overflow-hidden ${
          isLight ? 'bg-slate-200' : 'bg-slate-800/80'
        }`}>
          <div
            className={`h-full rounded-full ${
              isUrgent 
                ? 'bg-rose-500 shadow-sm shadow-rose-500/50' 
                : isLight 
                ? 'bg-emerald-500' 
                : 'bg-emerald-400'
            }`}
            style={{ width: `${Math.max(0, Math.min(100, timeRemainingPercent))}%` }}
          />
        </div>
        <span
          className={`text-[11px] font-bold font-mono-numbers tabular-nums w-9 text-right shrink-0 ${
            isUrgent
              ? 'text-rose-500'
              : isLight
              ? 'text-slate-600'
              : 'text-slate-300'
          }`}
          aria-label={`${Math.max(0, (timeRemainingPercent / 100) * (totalTimeMs / 1000)).toFixed(1)} seconds remaining`}
        >
          {Math.max(0, (timeRemainingPercent / 100) * (totalTimeMs / 1000)).toFixed(1)}s
        </span>
      </div>
    </div>
  );
};
