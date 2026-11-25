import React, { useRef } from 'react';
import { ColorMode, DualReflexPayload } from '../../types/game';

interface DualReflexChallengeProps {
  payload: DualReflexPayload;
  instruction: string;
  colorMode: ColorMode;
  onCorrect: () => void;
  onWrong: (reason: string) => void;
}

export const DualReflexChallenge: React.FC<DualReflexChallengeProps> = ({
  payload,
  instruction,
  colorMode,
  onCorrect,
  onWrong,
}) => {
  const { mode, left, right, correctAnswer, explanation, hint } = payload;
  const isLight = colorMode === 'light';
  const answeredRef = useRef<boolean>(false);

  const handlePick = (choice: 'LEFT' | 'RIGHT' | 'SAME' | 'DIFFERENT') => {
    if (answeredRef.current) return;
    answeredRef.current = true;

    if (choice === correctAnswer) {
      onCorrect();
    } else {
      onWrong(explanation);
    }
  };

  const renderSideContent = (side: typeof left) => (
    <div className="flex flex-col items-center justify-center gap-2 text-center">
      {side.icon && <span className="text-5xl leading-none">{side.icon}</span>}
      {side.dots && (
        <div className="flex flex-wrap items-center justify-center gap-1.5 max-w-[110px]">
          {side.dots.map((d, i) => (
            <span key={i} className="text-xl leading-none">
              {d}
            </span>
          ))}
        </div>
      )}
      {side.label && (
        <span className={`text-xl sm:text-2xl font-black font-display tracking-wide uppercase font-mono-numbers ${
          isLight ? 'text-slate-900' : 'text-white'
        }`}>
          {side.label}
        </span>
      )}
      {side.subLabel && (
        <span className={`text-[11px] font-bold uppercase tracking-wider ${
          isLight ? 'text-slate-500' : 'text-slate-400'
        }`}>
          {side.subLabel}
        </span>
      )}
    </div>
  );

  return (
    <div className="flex-1 w-full flex flex-col justify-between py-3 select-none">
      {/* Instruction */}
      <div className="text-center px-4">
        <h2 className={`text-2xl sm:text-3xl font-black font-display tracking-tight mb-1 uppercase ${
          isLight ? 'text-slate-900' : 'text-white'
        }`}>
          {instruction}
        </h2>
        <p className={`text-xs font-semibold tracking-wide ${
          isLight ? 'text-rose-600' : 'text-rose-400'
        }`}>
          {hint}
        </p>
      </div>

      {/* Left vs Right Split Arena */}
      {mode === 'pick_side' ? (
        <div className="w-full max-w-sm mx-auto my-auto grid grid-cols-2 gap-3 px-4">
          <button
            type="button"
            onClick={() => handlePick('LEFT')}
            className={`min-h-48 rounded-3xl p-4 border-2 flex flex-col items-center justify-center shadow-lg active:scale-95 transition-all cursor-pointer ${
              isLight
                ? 'bg-white border-slate-200 hover:border-rose-400 shadow-slate-200/60'
                : 'bg-slate-900 border-slate-800 hover:border-rose-500'
            }`}
          >
            {renderSideContent(left)}
          </button>

          <button
            type="button"
            onClick={() => handlePick('RIGHT')}
            className={`min-h-48 rounded-3xl p-4 border-2 flex flex-col items-center justify-center shadow-lg active:scale-95 transition-all cursor-pointer ${
              isLight
                ? 'bg-white border-slate-200 hover:border-rose-400 shadow-slate-200/60'
                : 'bg-slate-900 border-slate-800 hover:border-rose-500'
            }`}
          >
            {renderSideContent(right)}
          </button>
        </div>
      ) : (
        <div className="w-full max-w-sm mx-auto my-auto flex flex-col gap-5 px-4">
          <div className="grid grid-cols-2 gap-3">
            <div className={`min-h-28 rounded-2xl p-4 border flex items-center justify-center shadow-sm ${
              isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
            }`}>
              {renderSideContent(left)}
            </div>
            <div className={`min-h-28 rounded-2xl p-4 border flex items-center justify-center shadow-sm ${
              isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
            }`}>
              {renderSideContent(right)}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handlePick('SAME')}
              className="h-16 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black font-display text-lg tracking-wider uppercase shadow-lg shadow-emerald-600/25 active:scale-95 transition-all cursor-pointer"
            >
              SAME
            </button>
            <button
              type="button"
              onClick={() => handlePick('DIFFERENT')}
              className="h-16 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-black font-display text-lg tracking-wider uppercase shadow-lg shadow-rose-600/25 active:scale-95 transition-all cursor-pointer"
            >
              DIFFERENT
            </button>
          </div>
        </div>
      )}

      <div className="text-center text-xs text-slate-500 font-medium">
        {mode === 'pick_side' ? 'Tap the winning side fast' : 'Compare both patterns carefully'}
      </div>
    </div>
  );
};
