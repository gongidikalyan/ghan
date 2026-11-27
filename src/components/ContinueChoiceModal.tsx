import React from 'react';
import { PlayCircle, RotateCcw, Loader2, Flag } from 'lucide-react';
import { ColorMode } from '../types/game';

interface ContinueChoiceModalProps {
  isOpen: boolean;
  reason: string;
  lives: number;
  maxLives: number;
  score: number;
  colorMode: ColorMode;
  isAdLoading: boolean;
  adError: string | null;
  onWatchAdProtectLife: () => void;
  onUseLifeContinue: () => void;
  onTryAgain: () => void;
  onEndRun: () => void;
}

/**
 * Cute expressive Heart Buddy mascot that reacts to remaining lives and ad loading state.
 */
const CuteHeartMascot: React.FC<{ isLastLife: boolean; isLoading: boolean }> = ({
  isLastLife,
  isLoading,
}) => (
  <svg
    viewBox="0 0 96 88"
    className="w-20 h-18 drop-shadow-sm select-none"
    aria-hidden="true"
  >
    {/* Soft blush aura */}
    <ellipse cx="48" cy="79" rx="24" ry="5" fill="rgba(244, 63, 94, 0.16)" />

    {/* Plump heart body */}
    <path
      d="M48 74 C48 74 14 53 14 30 C14 17.5 23.5 9 34.5 9 C41.2 9 45.8 12.6 48 16.8 C50.2 12.6 54.8 9 61.5 9 C72.5 9 82 17.5 82 30 C82 53 48 74 48 74 Z"
      fill={isLastLife ? '#fb7185' : '#f43f5e'}
      stroke={isLastLife ? '#e11d48' : '#be123c'}
      strokeWidth="3"
      strokeLinejoin="round"
    />

    {/* Cute glossy top-left highlight */}
    <ellipse
      cx="27"
      cy="24"
      rx="6"
      ry="3.6"
      transform="rotate(-32 27 24)"
      fill="rgba(255, 255, 255, 0.45)"
    />
    <circle cx="35" cy="18" r="2" fill="rgba(255, 255, 255, 0.45)" />

    {/* Tiny cute bandage on last life */}
    {isLastLife && (
      <g transform="translate(55, 16) rotate(26)">
        <rect
          x="0"
          y="0"
          width="17"
          height="7.5"
          rx="3.75"
          fill="#fef3c7"
          stroke="#d97706"
          strokeWidth="1.2"
        />
        <rect x="6" y="1" width="5" height="5.5" rx="1" fill="#fde68a" />
      </g>
    )}

    {/* Rosy blush cheeks */}
    <ellipse cx="30" cy="44" rx="5.5" ry="3.2" fill="#fda4af" opacity="0.85" />
    <ellipse cx="66" cy="44" rx="5.5" ry="3.2" fill="#fda4af" opacity="0.85" />

    {/* Kawaii Eyes */}
    {isLoading ? (
      <>
        {/* Happy anticipating curved eyes */}
        <path
          d="M32 37 Q37 31 42 37"
          fill="none"
          stroke="#4c0519"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M54 37 Q59 31 64 37"
          fill="none"
          stroke="#4c0519"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </>
    ) : (
      <>
        <circle cx="37" cy="36" r="4.6" fill="#4c0519" />
        <circle cx="59" cy="36" r="4.6" fill="#4c0519" />
        {/* Big kawaii eye sparkles */}
        <circle cx="35.3" cy="34.2" r="1.8" fill="#ffffff" />
        <circle cx="57.3" cy="34.2" r="1.8" fill="#ffffff" />
        <circle cx="38.5" cy="37.6" r="0.9" fill="#ffffff" />
        <circle cx="60.5" cy="37.6" r="0.9" fill="#ffffff" />
      </>
    )}

    {/* Cute mouth expression */}
    {isLastLife && !isLoading ? (
      <path
        d="M44 47 Q48 43.5 52 47"
        fill="none"
        stroke="#4c0519"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
    ) : (
      <path
        d="M43 44 Q48 49.5 53 44"
        fill="none"
        stroke="#4c0519"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
    )}
  </svg>
);

/**
 * Plump cute individual heart indicator with glossy dot for the 3-life row.
 */
const PlumpHeartIcon: React.FC<{
  alive: boolean;
  isAtRisk: boolean;
  isLight: boolean;
  sizeClass?: string;
}> = ({ alive, isAtRisk, isLight, sizeClass = 'w-7 h-7' }) => (
  <svg
    viewBox="0 0 32 30"
    className={`${sizeClass} shrink-0 transition-transform duration-150 ${
      isAtRisk ? 'scale-110' : ''
    }`}
    aria-hidden="true"
  >
    <path
      d="M16 26.5 C16 26.5 3.5 18.5 3.5 10.2 C3.5 5.6 7 2.5 11.2 2.5 C13.7 2.5 15.2 3.9 16 5.4 C16.8 3.9 18.3 2.5 20.8 2.5 C25 2.5 28.5 5.6 28.5 10.2 C28.5 18.5 16 26.5 16 26.5 Z"
      fill={alive ? '#f43f5e' : 'none'}
      stroke={
        alive
          ? '#be123c'
          : isLight
          ? '#cbd5e1'
          : '#475569'
      }
      strokeWidth={alive ? '2' : '2'}
      strokeDasharray={alive ? undefined : '3 2.5'}
      strokeLinejoin="round"
    />
    {alive && (
      <ellipse
        cx="9.5"
        cy="8.5"
        rx="2.3"
        ry="1.3"
        transform="rotate(-30 9.5 8.5)"
        fill="rgba(255,255,255,0.55)"
      />
    )}
  </svg>
);

export const ContinueChoiceModal: React.FC<ContinueChoiceModalProps> = ({
  isOpen,
  reason,
  lives,
  maxLives,
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
  const remainingAfterUse = Math.max(0, lives - 1);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-5 bg-slate-950/75 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="continue-choice-title"
    >
      <div
        className={`w-full max-w-sm rounded-[2rem] p-6 border-2 shadow-2xl flex flex-col gap-5 ${
          isLight
            ? 'bg-white border-rose-100 text-slate-900 shadow-rose-950/15'
            : 'bg-slate-900 border-slate-800 text-white shadow-black/60'
        }`}
      >
        {/* Cute Mascot + Friendly Header */}
        <div className="text-center flex flex-col items-center gap-2">
          <CuteHeartMascot isLastLife={!hasSpareLife} isLoading={isAdLoading} />

          <h3
            id="continue-choice-title"
            className="text-2xl font-black font-display tracking-tight text-balance leading-tight"
          >
            {hasSpareLife ? 'Keep Your Hearts Safe?' : 'Save Your Last Heart?'}
          </h3>
          <p
            className={`text-sm font-semibold ${
              isLight ? 'text-rose-600' : 'text-rose-400'
            }`}
          >
            {reason || 'Oops! Quick slip'}
          </p>
        </div>

        {/* Clean Unboxed 3-Heart Row & Score Metadata */}
        <div
          className={`flex flex-col items-center gap-2 py-3 border-y ${
            isLight ? 'border-rose-100/90' : 'border-slate-800'
          }`}
        >
          <div
            className="flex items-center gap-2.5"
            aria-label={`${lives} of ${maxLives} lives remaining`}
          >
            {Array.from({ length: maxLives }).map((_, idx) => {
              const isAlive = idx < lives;
              const isAtRisk = idx === lives - 1;
              return (
                <PlumpHeartIcon
                  key={idx}
                  alive={isAlive}
                  isAtRisk={isAtRisk}
                  isLight={isLight}
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

        {/* Inline Ad Notice (if ad was unavailable or dismissed early) */}
        {adError && (
          <p
            role="alert"
            className={`text-xs font-semibold text-center leading-relaxed px-2 ${
              isLight ? 'text-amber-700' : 'text-amber-300'
            }`}
          >
            {adError}
          </p>
        )}

        {/* Cute Tactile Toy-Style Action Buttons */}
        <div className="flex flex-col gap-3">
          {/* Primary Optional Rewarded Ad Button — always available across all 3 lives */}
          <button
            type="button"
            disabled={isAdLoading}
            onClick={onWatchAdProtectLife}
            className="w-full min-h-14 py-3 px-5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 border-b-4 border-emerald-700 active:border-b-0 active:translate-y-1 disabled:opacity-60 text-white shadow-md shadow-emerald-600/20 transition-all flex flex-col items-center justify-center cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
          >
            <span className="flex items-center gap-2 font-black font-display text-base tracking-wide whitespace-nowrap">
              {isAdLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin shrink-0" />
                  <span>Opening Ad...</span>
                </>
              ) : (
                <>
                  <PlayCircle className="w-5 h-5 shrink-0" />
                  <span>
                    {lives === maxLives
                      ? `Watch Ad · Keep All ${lives} Lives`
                      : hasSpareLife
                      ? `Watch Ad · Keep ${lives} Lives`
                      : 'Watch Ad · Save Last Life'}
                  </span>
                </>
              )}
            </span>
            <span className="text-[11px] font-semibold text-emerald-50/95 mt-0.5 whitespace-nowrap">
              Optional · Continue without losing a heart
            </span>
          </button>

          {/* Secondary Non-Ad Button: Spend 1 Heart OR End Run */}
          {hasSpareLife ? (
            <button
              type="button"
              disabled={isAdLoading}
              onClick={onUseLifeContinue}
              className={`w-full min-h-13 py-3 px-5 rounded-2xl border-2 border-b-4 active:border-b-2 active:translate-y-0.5 font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500 ${
                isLight
                  ? 'bg-rose-50 hover:bg-rose-100/80 border-rose-200 border-b-rose-300 text-rose-700'
                  : 'bg-slate-800/90 hover:bg-slate-800 border-slate-700 border-b-slate-950 text-rose-300'
              }`}
            >
              <PlumpHeartIcon alive={true} isAtRisk={false} isLight={isLight} sizeClass="w-5 h-5" />
              <span className="whitespace-nowrap">
                Use 1 Life &amp; Continue ({remainingAfterUse} left)
              </span>
            </button>
          ) : (
            <button
              type="button"
              disabled={isAdLoading}
              onClick={onEndRun}
              className={`w-full min-h-13 py-3 px-5 rounded-2xl border-2 border-b-4 active:border-b-2 active:translate-y-0.5 font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500 ${
                isLight
                  ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 border-b-slate-300 text-slate-800'
                  : 'bg-slate-800/90 hover:bg-slate-800 border-slate-700 border-b-slate-950 text-white'
              }`}
            >
              <Flag className="w-4 h-4 text-rose-500 shrink-0" />
              <span className="whitespace-nowrap">End Run &amp; View Score</span>
            </button>
          )}
        </div>

        {/* Quiet Bottom Actions */}
        <div
          className={`flex items-center justify-center gap-6 text-xs font-bold ${
            isLight ? 'text-slate-500' : 'text-slate-400'
          }`}
        >
          <button
            type="button"
            disabled={isAdLoading}
            onClick={onTryAgain}
            className={`min-h-10 px-2 inline-flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 whitespace-nowrap ${
              isLight ? 'hover:text-slate-900' : 'hover:text-white'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5 shrink-0" />
            <span>Try Again</span>
          </button>

          {hasSpareLife && (
            <button
              type="button"
              disabled={isAdLoading}
              onClick={onEndRun}
              className={`min-h-10 px-2 inline-flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 whitespace-nowrap ${
                isLight ? 'hover:text-rose-600' : 'hover:text-rose-400'
              }`}
            >
              <Flag className="w-3.5 h-3.5 shrink-0" />
              <span>End Run</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
