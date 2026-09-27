import React, { useRef } from 'react';
import { ArrowLeft, ArrowRight, ArrowUp, ArrowDown } from 'lucide-react';
import { ColorMode, Direction, SwipeDirectionPayload } from '../../types/game';

interface SwipeDirectionChallengeProps {
  payload: SwipeDirectionPayload;
  instruction: string;
  colorMode: ColorMode;
  onCorrect: () => void;
  onWrong: (reason: string) => void;
}

export const SwipeDirectionChallenge: React.FC<SwipeDirectionChallengeProps> = ({
  payload,
  instruction,
  colorMode,
  onCorrect,
  onWrong,
}) => {
  const { promptDirection, targetDirection, isOppositeRule } = payload;
  const isLight = colorMode === 'light';
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const handleDirectionSubmit = (dir: Direction) => {
    if (dir === targetDirection) {
      onCorrect();
    } else {
      onWrong(`Swiped ${dir} instead of ${targetDirection}!`);
    }
  };

  const onTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const touch = e.changedTouches[0];
    const diffX = touch.clientX - touchStartRef.current.x;
    const diffY = touch.clientY - touchStartRef.current.y;
    touchStartRef.current = null;

    const threshold = 30; // 30px swipe threshold
    if (Math.abs(diffX) < threshold && Math.abs(diffY) < threshold) {
      return; // Too short
    }

    if (Math.abs(diffX) > Math.abs(diffY)) {
      handleDirectionSubmit(diffX > 0 ? 'RIGHT' : 'LEFT');
    } else {
      handleDirectionSubmit(diffY > 0 ? 'DOWN' : 'UP');
    }
  };

  const getArrowIcon = (dir: Direction, className = 'w-10 h-10') => {
    switch (dir) {
      case 'UP': return <ArrowUp className={className} />;
      case 'DOWN': return <ArrowDown className={className} />;
      case 'LEFT': return <ArrowLeft className={className} />;
      case 'RIGHT': return <ArrowRight className={className} />;
    }
  };

  return (
    <div
      className="flex-1 w-full flex flex-col justify-between py-4 select-none"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Challenge Instruction */}
      <div className="text-center px-4 mb-2">
        <h2 className={`text-2xl sm:text-3xl font-black font-display tracking-tight mb-1 uppercase ${
          isLight ? 'text-slate-900' : 'text-white'
        }`}>
          {instruction}
        </h2>
        <p className={`text-xs font-semibold tracking-wide ${
          isOppositeRule 
            ? (isLight ? 'text-rose-600 font-bold' : 'text-rose-400 font-bold') 
            : (isLight ? 'text-sky-600' : 'text-sky-400')
        }`}>
          {isOppositeRule ? '⚠️ OPPOSITE RULE ACTIVE!' : 'Swipe gesture or tap button'}
        </p>
      </div>

      {/* Big Visual Arrow Indicator */}
      <div className="w-full flex flex-col items-center justify-center my-auto">
        <div className={`w-32 h-32 rounded-3xl flex items-center justify-center border shadow-xl transition-transform ${
          isOppositeRule
            ? isLight
              ? 'bg-rose-100/80 border-rose-300 text-rose-600 shadow-rose-200/50'
              : 'bg-rose-950/40 border-rose-600 text-rose-400 shadow-rose-900/40'
            : isLight
            ? 'bg-white border-slate-200 text-slate-800 shadow-slate-200/60'
            : 'bg-slate-900 border-slate-800 text-white shadow-slate-900'
        }`}>
          {getArrowIcon(promptDirection, 'w-16 h-16 stroke-[3]')}
        </div>
      </div>

      {/* Tactile D-Pad Touch Buttons for 100% Reliable Input */}
      <div 
        className="w-full max-w-[240px] mx-auto grid grid-cols-3 gap-2 px-2"
        onTouchStart={(e) => e.stopPropagation()}
        onTouchEnd={(e) => e.stopPropagation()}
      >
        <div />
        <button
          type="button"
          onClick={() => handleDirectionSubmit('UP')}
          className={`h-12 rounded-xl flex items-center justify-center border shadow-sm active:scale-90 transition-all cursor-pointer ${
            isLight ? 'bg-white border-slate-200 hover:bg-slate-50' : 'bg-slate-900 border-slate-800 hover:bg-slate-800'
          }`}
          aria-label="Swipe Up"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
        <div />

        <button
          type="button"
          onClick={() => handleDirectionSubmit('LEFT')}
          className={`h-12 rounded-xl flex items-center justify-center border shadow-sm active:scale-90 transition-all cursor-pointer ${
            isLight ? 'bg-white border-slate-200 hover:bg-slate-50' : 'bg-slate-900 border-slate-800 hover:bg-slate-800'
          }`}
          aria-label="Swipe Left"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center justify-center text-[10px] uppercase font-bold text-slate-400">
          TAP/SWIPE
        </div>
        <button
          type="button"
          onClick={() => handleDirectionSubmit('RIGHT')}
          className={`h-12 rounded-xl flex items-center justify-center border shadow-sm active:scale-90 transition-all cursor-pointer ${
            isLight ? 'bg-white border-slate-200 hover:bg-slate-50' : 'bg-slate-900 border-slate-800 hover:bg-slate-800'
          }`}
          aria-label="Swipe Right"
        >
          <ArrowRight className="w-5 h-5" />
        </button>

        <div />
        <button
          type="button"
          onClick={() => handleDirectionSubmit('DOWN')}
          className={`h-12 rounded-xl flex items-center justify-center border shadow-sm active:scale-90 transition-all cursor-pointer ${
            isLight ? 'bg-white border-slate-200 hover:bg-slate-50' : 'bg-slate-900 border-slate-800 hover:bg-slate-800'
          }`}
          aria-label="Swipe Down"
        >
          <ArrowDown className="w-5 h-5" />
        </button>
        <div />
      </div>
    </div>
  );
};
