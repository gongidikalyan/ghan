import React, { useState, useEffect } from 'react';
import { Eye, HelpCircle } from 'lucide-react';
import { ColorMode, MemoryPositionPayload } from '../../types/game';

interface MemoryPositionChallengeProps {
  payload: MemoryPositionPayload;
  instruction: string;
  colorMode: ColorMode;
  onCorrect: () => void;
  onWrong: (reason: string) => void;
}

export const MemoryPositionChallenge: React.FC<MemoryPositionChallengeProps> = ({
  payload,
  instruction,
  colorMode,
  onCorrect,
  onWrong,
}) => {
  const { gridSize, targetIndices, targetIcon, flashDurationMs } = payload;
  const isLight = colorMode === 'light';
  const [isMemorizing, setIsMemorizing] = useState<boolean>(true);
  const [tappedIndices, setTappedIndices] = useState<number[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMemorizing(false);
    }, flashDurationMs);

    return () => clearTimeout(timer);
  }, [flashDurationMs]);

  const totalTiles = gridSize * gridSize;

  const handleTileClick = (index: number) => {
    if (isMemorizing) return;

    if (tappedIndices.includes(index)) return;

    if (targetIndices.includes(index)) {
      const nextTapped = [...tappedIndices, index];
      setTappedIndices(nextTapped);

      if (nextTapped.length === targetIndices.length) {
        onCorrect();
      }
    } else {
      onWrong(`Wrong tile tapped! It wasn't there.`);
    }
  };

  const getGridColsClass = () => {
    return gridSize === 3 ? 'grid-cols-3 max-w-[280px]' : 'grid-cols-4 max-w-[320px]';
  };

  return (
    <div className="flex-1 w-full flex flex-col justify-between py-4">
      {/* Challenge Instruction */}
      <div className="text-center px-4 mb-2">
        <h2 className={`text-2xl sm:text-3xl font-black font-display tracking-tight mb-1 uppercase ${
          isLight ? 'text-slate-900' : 'text-white'
        }`}>
          {isMemorizing ? 'MEMORIZE POSITION!' : instruction}
        </h2>
        <div className="flex items-center justify-center gap-1.5 text-xs">
          {isMemorizing ? (
            <span className={`flex items-center gap-1 font-semibold tracking-wide ${
              isLight ? 'text-amber-600' : 'text-amber-400'
            }`}>
              <Eye className="w-3.5 h-3.5" /> Memorizing...
            </span>
          ) : (
            <span className={`font-semibold tracking-wide ${
              isLight ? 'text-emerald-600' : 'text-emerald-400'
            }`}>
              Tap the correct tile{targetIndices.length > 1 ? ` (${tappedIndices.length}/${targetIndices.length})` : ''}
            </span>
          )}
        </div>
      </div>

      {/* Grid */}
      <div className={`w-full mx-auto grid gap-2.5 px-4 ${getGridColsClass()}`}>
        {Array.from({ length: totalTiles }).map((_, idx) => {
          const isTarget = targetIndices.includes(idx);
          const isRevealedTarget = isMemorizing && isTarget;
          const isSuccessfullyTapped = tappedIndices.includes(idx);

          const getTileStyle = () => {
            if (isRevealedTarget) {
              return isLight
                ? 'bg-rose-100 border-rose-500 scale-105 shadow-md shadow-rose-200'
                : 'bg-rose-500/20 border-rose-500 scale-105 shadow-lg shadow-rose-500/30';
            }
            if (isSuccessfullyTapped) {
              return isLight
                ? 'bg-emerald-100 border-emerald-500 scale-95 shadow-sm'
                : 'bg-emerald-500/30 border-emerald-400 scale-95 shadow-md';
            }
            return isLight
              ? 'bg-white border-slate-200/90 hover:border-slate-300 shadow-sm active:scale-95'
              : 'bg-slate-900 border-slate-800 hover:border-slate-700 active:scale-95';
          };

          return (
            <button
              key={idx}
              type="button"
              disabled={isMemorizing}
              onClick={() => handleTileClick(idx)}
              className={`aspect-square rounded-2xl flex items-center justify-center border transition-all duration-150 ${getTileStyle()} ${
                isMemorizing ? 'cursor-default' : 'cursor-pointer'
              }`}
              aria-label={`Tile ${idx + 1}`}
            >
              {isRevealedTarget && (
                <span className="text-3xl sm:text-4xl animate-bounce filter drop-shadow select-none">
                  {targetIcon}
                </span>
              )}
              {isSuccessfullyTapped && (
                <span className="text-2xl sm:text-3xl filter drop-shadow select-none">
                  ✅
                </span>
              )}
              {!isRevealedTarget && !isSuccessfullyTapped && (
                <HelpCircle className={`w-5 h-5 ${isLight ? 'text-slate-300' : 'text-slate-700 opacity-40'}`} />
              )}
            </button>
          );
        })}
      </div>

      <div className="text-center text-xs text-slate-500 font-medium">
        {isMemorizing ? 'Watch carefully...' : 'Recall the location'}
      </div>
    </div>
  );
};
