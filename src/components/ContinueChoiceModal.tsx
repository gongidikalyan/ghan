import React from 'react';
import { Heart, PlayCircle, RotateCcw, ShieldCheck, Loader2, Flag } from 'lucide-react';
import { ColorMode } from '../types/game';

interface ContinueChoiceModalProps {
  isOpen: boolean;
  reason: string;
  lives: number;
  maxLives: number;
  remainingRewardedAds: number;
  maxRewardedAds: number;
  score: number;
  colorMode: ColorMode;
  isAdLoading: boolean;
  adError: string | null;
  onWatchAdProtectLife: () => void;
  onUseLifeContinue: () => void;
  onTryAgain: () => void;
  onEndRun: () => void;
}

export const ContinueChoiceModal: React.FC<ContinueChoiceModalProps> = ({
  isOpen,
  reason,
  lives,
  maxLives,
  remainingRewardedAds,
  maxRewardedAds,
  score,
  colorMode,
  isAdLoading,
  adError,
  onWatchAdProtectLife,
  onUseLifeContinue,
  onTryAgain,
  onEndRun,
}) => {
  if (!isOpen) return null;

  const isLight = colorMode === 'light';
  const hasSpareLife = lives > 1;
  const canWatchAd = remainingRewardedAds > 0;
  const remainingAfterUse = Math.max(0, lives - 1);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-5 bg-slate-950/80 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="continue-choice-title"
    >
      <div
        className={`w-full max-w-sm rounded-3xl p-6 border shadow-2xl flex flex-col gap-5 ${
          isLight
            ? 'bg-white border-slate-200 text-slate-900 shadow-slate-900/15'
            : 'bg-slate-900 border-slate-800 text-white shadow-black/60'
        }`}
      >
        {/* Header & Mistake Reason */}
        <div className="text-center flex flex-col items-center gap-1.5">
          <h3
            id="continue-choice-title"
            className="text-2xl font-black font-display tracking-tight"
          >
            {canWatchAd
              ? hasSpareLife
                ? 'Protect Your Lives?'
                : 'Save Your Last Life?'
              : hasSpareLife
              ? 'Continue With a Life?'
              : 'Out of Lives'}
          </h3>
          <p
            className={`text-sm font-medium ${
              isLight ? 'text-rose-600' : 'text-rose-400'
            }`}
          >
            {reason || 'Mistake detected'}
          </p>
        </div>

        {/* Unboxed Status Row: Hearts + Numeric Counts (Non-Hue-Only) */}
        <div
          className={`flex flex-col items-center gap-2 py-3 border-y ${
            isLight ? 'border-slate-100' : 'border-slate-800'
          }`}
        >
          <div
            className="flex items-center gap-2"
            aria-label={`${lives} of ${maxLives} lives remaining`}
          >
            {Array.from({ length: maxLives }).map((_, idx) => {
              const isAlive = idx < lives;
              return (
                <Heart
                  key={idx}
                  className={`w-6 h-6 transition-transform duration-150 ${
                    isAlive
                      ? 'fill-rose-500 text-rose-500'
                      : isLight
                      ? 'text-slate-300 opacity-60'
                      : 'text-slate-700 opacity-60'
                  }`}
                />
              );
            })}
          </div>
          <div
            className={`flex items-center gap-2 text-xs font-semibold tabular-nums font-mono-numbers ${
              isLight ? 'text-slate-500' : 'text-slate-400'
            }`}
          >
            <span>
              {lives} of {maxLives} {lives === 1 ? 'life' : 'lives'} intact
            </span>
            <span aria-hidden="true">·</span>
            <span>Score {score}</span>
          </div>
        </div>

        {/* Inline Ad Status Notice (if ad failed or was dismissed early) */}
        {adError && (
          <p
            role="alert"
            className={`text-xs font-medium text-center leading-relaxed px-2 ${
              isLight ? 'text-amber-700' : 'text-amber-300'
            }`}
          >
            {adError}
          </p>
        )}

        {/* Action Choices */}
        <div className="flex flex-col gap-3">
          {/* Primary Optional Rewarded Ad Action (available while rewarded saves remain this run) */}
          {canWatchAd && (
            <button
              type="button"
              disabled={isAdLoading}
              onClick={onWatchAdProtectLife}
              className="w-full min-h-14 py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white shadow-lg shadow-emerald-600/25 active:scale-[0.98] transition-all flex flex-col items-center justify-center cursor-pointer"
            >
              <span className="flex items-center gap-2 font-black font-display text-base tracking-wide whitespace-nowrap">
                {isAdLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin shrink-0" />
                    <span>Loading Ad...</span>
                  </>
                ) : (
                  <>
                    <PlayCircle className="w-5 h-5 shrink-0" />
                    <span>
                      {hasSpareLife
                        ? `Watch Ad · Keep All ${lives} Lives`
                        : 'Watch Ad · Save Last Life'}
                    </span>
                  </>
                )}
              </span>
              <span className="text-[11px] font-medium text-emerald-100 mt-0.5 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                <span>
                  Optional · {remainingRewardedAds} of {maxRewardedAds} ad{' '}
                  {maxRewardedAds === 1 ? 'save' : 'saves'} this run
                </span>
              </span>
            </button>
          )}

          {/* Non-Ad Path: Use 1 Life (when > 1 left) OR End Run (when on final life) */}
          {hasSpareLife ? (
            <button
              type="button"
              disabled={isAdLoading}
              onClick={onUseLifeContinue}
              className={`w-full min-h-13 py-3 px-4 rounded-2xl font-bold text-sm active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 ${
                canWatchAd
                  ? isLight
                    ? 'border bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-900'
                    : 'border bg-slate-800/80 hover:bg-slate-800 border-slate-700 text-white'
                  : 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/25'
              }`}
            >
              <Heart
                className={`w-4 h-4 shrink-0 ${
                  canWatchAd ? 'fill-rose-500 text-rose-500' : 'fill-white text-white'
                }`}
              />
              <span className="whitespace-nowrap">
                Use 1 Life &amp; Continue ({remainingAfterUse} left)
              </span>
            </button>
          ) : (
            <button
              type="button"
              disabled={isAdLoading}
              onClick={onEndRun}
              className={`w-full min-h-13 py-3 px-4 rounded-2xl font-bold text-sm active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 ${
                canWatchAd
                  ? isLight
                    ? 'border bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-900'
                    : 'border bg-slate-800/80 hover:bg-slate-800 border-slate-700 text-white'
                  : 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/25'
              }`}
            >
              <Flag
                className={`w-4 h-4 shrink-0 ${
                  canWatchAd ? 'text-rose-500' : 'text-white'
                }`}
              />
              <span className="whitespace-nowrap">End Run &amp; View Score</span>
            </button>
          )}
        </div>

        {/* Quiet Bottom Row: Try Again Newly / End Run */}
        <div
          className={`flex items-center justify-center gap-6 pt-1 text-xs font-semibold ${
            isLight ? 'text-slate-500' : 'text-slate-400'
          }`}
        >
          <button
            type="button"
            disabled={isAdLoading}
            onClick={onTryAgain}
            className={`inline-flex items-center gap-1.5 py-1.5 transition-colors cursor-pointer disabled:opacity-50 ${
              isLight ? 'hover:text-slate-900' : 'hover:text-white'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>

          {hasSpareLife && (
            <button
              type="button"
              disabled={isAdLoading}
              onClick={onEndRun}
              className={`inline-flex items-center gap-1.5 py-1.5 transition-colors cursor-pointer disabled:opacity-50 ${
                isLight ? 'hover:text-rose-600' : 'hover:text-rose-400'
              }`}
            >
              <Flag className="w-3.5 h-3.5" />
              <span>End Run</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
