import React, { useState, useRef } from 'react';
import { Check } from 'lucide-react';
import { ColorMode, PatternGridPayload } from '../../types/game';
import { soundManager } from '../../utils/audio';
import { hapticManager } from '../../utils/haptics';

interface PatternGridChallengeProps {
  payload: PatternGridPayload;
  instruction: string;
  colorMode: ColorMode;
  onCorrect: () => void;
  onWrong: (reason: string) => void;
}

export const PatternGridChallenge: React.FC<PatternGridChallengeProps> = ({
  payload,
  instruction,
  colorMode,
  onCorrect,
  onWrong,
}) => {
  const { cells, previewIndices, hint } = payload;
  const isLight = colorMode === 'light';

  const targetCount = cells.filter((c) => c.isTarget).length;
  const [clearedSet, setClearedSet] = useState<Set<number>>(() => new Set());
  const resolvedRef = useRef<boolean>(false);

  const handleCellTap = (index: number) => {
    if (resolvedRef.current) return;
    if (clearedSet.has(index)) return;

    const cell = cells[index];
    if (!cell.isTarget) {
      resolvedRef.current = true;
      onWrong('Tapped the wrong grid tile!');
      return;
    }

    soundManager.playTap();
    hapticManager.lightTap();

    const next = new Set(clearedSet);
    next.add(index);
    setClearedSet(next);

    if (next.size >= targetCount) {
      resolvedRef.current = true;
      onCorrect();
    }
  };

  return (
    <div className="flex-1 w-full flex flex-col justify-between py-2 select-none">
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
          {hint} ({clearedSet.size}/{targetCount})
        </p>
      </div>

      {/* Optional Mini Reference Pattern (for Symmetry / Copy Pattern) */}
      {previewIndices && previewIndices.length > 0 && (
        <div className="flex flex-col items-center mt-1">
          <span className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${
            isLight ? 'text-slate-500' : 'text-slate-400'
          }`}>
            COPY THIS PATTERN
          </span>
          <div className={`grid grid-cols-3 gap-1 p-1.5 rounded-xl border ${
            isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-900 border-slate-800'
          }`}>
            {Array.from({ length: 9 }).map((_, idx) => (
              <div
                key={idx}
                className={`w-4 h-4 rounded-sm ${
                  previewIndices.includes(idx)
                    ? 'bg-indigo-500'
                    : isLight
                    ? 'bg-slate-300/70'
                    : 'bg-slate-800'
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* 3x3 Interactive Board */}
      <div className="w-full max-w-[276px] mx-auto my-auto grid grid-cols-3 gap-2.5 px-2">
        {cells.map((cell) => {
          const isCleared = clearedSet.has(cell.index);
          return (
            <button
              key={cell.index}
              type="button"
              onClick={() => handleCellTap(cell.index)}
              className={`aspect-square rounded-2xl border-2 flex items-center justify-center text-3xl font-black transition-all active:scale-90 cursor-pointer shadow-sm ${
                isCleared
                  ? 'bg-emerald-500 border-emerald-300 text-white scale-95'
                  : cell.isLit
                  ? isLight
                    ? 'bg-rose-50 border-rose-400 text-rose-600 shadow-rose-200/70'
                    : 'bg-rose-950/60 border-rose-500 text-rose-300'
                  : isLight
                  ? 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                  : 'bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-200'
              }`}
            >
              {isCleared ? <Check className="w-8 h-8 stroke-[3]" /> : cell.icon}
            </button>
          );
        })}
      </div>

      <div className="text-center text-xs text-slate-500 font-medium">
        Tap all matching tiles — avoid wrong squares
      </div>
    </div>
  );
};
