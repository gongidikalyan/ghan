import React, { useEffect, useState } from 'react';
import { RotateCcw, Home, Trophy, Share2, Flame, Check, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';
import { ColorMode } from '../types/game';
import { soundManager } from '../utils/audio';
import { hapticManager } from '../utils/haptics';
import { getDifficultyInfo } from '../utils/difficulty';

interface GameOverScreenProps {
  score: number;
  bestScore: number;
  isNewBest: boolean;
  maxCombo: number;
  reason: string;
  colorMode: ColorMode;
  onRetry: () => void;
  onHome: () => void;
}

export const GameOverScreen: React.FC<GameOverScreenProps> = ({
  score,
  bestScore,
  isNewBest,
  maxCombo,
  reason,
  colorMode,
  onRetry,
  onHome,
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const isLight = colorMode === 'light';

  useEffect(() => {
    if (isNewBest && score > 0) {
      soundManager.playNewBest();
      hapticManager.newBestPattern();

      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#ec4899'],
        });
      } catch {
        // Fallback gracefully
      }
    }
  }, [isNewBest, score]);

  const handleShare = async () => {
    const shareText = `I survived ${score} challenges in Speed n Tension! Can you beat my score? ⚡🔥`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Speed n Tension Game Score',
          text: shareText,
          url: window.location.href,
        });
        return;
      } catch {
        // Fallback
      }
    }

    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Ignored
    }
  };

  return (
    <div className="flex-1 w-full flex flex-col justify-between items-center py-6 px-4 z-10 max-w-sm mx-auto">
      {/* Top Title & Reason */}
      <div className="w-full text-center mt-2">
        <span className="text-4xl sm:text-5xl block mb-2 select-none">❌</span>
        <h2 className={`text-3xl sm:text-4xl font-black font-display tracking-tight uppercase mb-2 ${
          isLight ? 'text-slate-900' : 'text-white'
        }`}>
          GAME OVER
        </h2>
        <p className={`text-xs font-semibold px-4 tracking-wide ${
          isLight ? 'text-rose-600' : 'text-rose-400'
        }`}>
          {reason || 'One mistake ended your run.'}
        </p>
      </div>

      {/* Score Box */}
      <div className="w-full my-auto flex flex-col items-center">
        {isNewBest && score > 0 && (
          <div className="flex items-center gap-1.5 text-amber-500 font-display font-black text-sm uppercase tracking-wider mb-3 animate-bounce">
            <Trophy className="w-4 h-4 fill-amber-500" />
            NEW PERSONAL BEST!
          </div>
        )}

        {/* Big Score Numbers */}
        <div className={`w-full rounded-3xl p-6 flex flex-col items-center border ${
          isLight
            ? 'bg-white border-slate-200/90 shadow-xl shadow-slate-200/60'
            : 'bg-slate-900/90 border-slate-800 shadow-xl'
        }`}>
          <span className={`text-xs font-bold tracking-widest uppercase mb-1 ${
            isLight ? 'text-slate-500' : 'text-slate-400'
          }`}>
            FINAL SCORE
          </span>
          <span className={`text-6xl sm:text-7xl font-black font-display tracking-tight font-mono-numbers mb-4 ${
            isLight ? 'text-slate-900' : 'text-white'
          }`}>
            {score}
          </span>

          <div className={`w-full pt-4 border-t grid grid-cols-3 text-center text-xs ${
            isLight ? 'border-slate-100' : 'border-slate-800'
          }`}>
            <div className="flex flex-col items-center">
              <span className={`font-semibold uppercase ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
                BEST
              </span>
              <span className={`text-base font-bold font-mono-numbers ${
                isLight ? 'text-amber-600' : 'text-amber-400'
              }`}>
                {bestScore}
              </span>
            </div>

            <div className="flex flex-col items-center border-x border-slate-200/50 dark:border-slate-800/80">
              <span className={`font-semibold uppercase flex items-center gap-1 ${
                isLight ? 'text-slate-400' : 'text-slate-500'
              }`}>
                <Flame className="w-3 h-3 text-orange-500" /> COMBO
              </span>
              <span className={`text-base font-bold font-mono-numbers ${
                isLight ? 'text-orange-600' : 'text-orange-400'
              }`}>
                {maxCombo > 1 ? `${maxCombo}x` : '—'}
              </span>
            </div>

            <div className="flex flex-col items-center">
              <span className={`font-semibold uppercase flex items-center gap-1 ${
                isLight ? 'text-slate-400' : 'text-slate-500'
              }`}>
                <Zap className="w-3 h-3 text-rose-500" /> SPEED
              </span>
              <span className={`text-base font-bold font-mono-numbers ${
                isLight ? 'text-rose-600' : 'text-rose-400'
              }`}>
                {getDifficultyInfo(score).speedLabel}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="w-full flex flex-col gap-3">
        {/* Instant Retry CTA */}
        <button
          type="button"
          onClick={onRetry}
          className="w-full h-16 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-black font-display text-xl tracking-wider uppercase shadow-xl shadow-rose-600/30 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer border border-rose-400/40"
        >
          <RotateCcw className="w-5 h-5 stroke-[2.5]" />
          TRY AGAIN
        </button>

        {/* Secondary Row: Share & Home */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={handleShare}
            className={`h-12 rounded-xl font-bold text-xs tracking-wider uppercase flex items-center justify-center gap-2 border active:scale-95 transition-all ${
              isLight
                ? 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200/90 shadow-sm'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
            }`}
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
            {copied ? 'COPIED!' : 'SHARE'}
          </button>

          <button
            type="button"
            onClick={onHome}
            className={`h-12 rounded-xl font-bold text-xs tracking-wider uppercase flex items-center justify-center gap-2 border active:scale-95 transition-all ${
              isLight
                ? 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200/90 shadow-sm'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
            }`}
          >
            <Home className="w-4 h-4" />
            HOME
          </button>
        </div>
      </div>
    </div>
  );
};
