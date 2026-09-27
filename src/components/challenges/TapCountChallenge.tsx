import React, { useState } from 'react';
import { MousePointerClick } from 'lucide-react';
import { ColorMode, TapCountPayload } from '../../types/game';
import { soundManager } from '../../utils/audio';
import { hapticManager } from '../../utils/haptics';

interface TapCountChallengeProps {
  payload: TapCountPayload;
  instruction: string;
  colorMode: ColorMode;
  onCorrect: () => void;
  onWrong: (reason: string) => void;
}

export const TapCountChallenge: React.FC<TapCountChallengeProps> = ({
  payload,
  instruction,
  colorMode,
  onCorrect,
  onWrong,
}) => {
  const { targetCount } = payload;
  const isLight = colorMode === 'light';
  const [currentTaps, setCurrentTaps] = useState<number>(0);

  const handleTap = () => {
    const next = currentTaps + 1;
    setCurrentTaps(next);

    soundManager.playTap();
    hapticManager.lightTap();

    if (next === targetCount) {
      onCorrect();
    } else if (next > targetCount) {
      onWrong(`Over-tapped! You tapped ${next} times instead of ${targetCount}.`);
    }
  };

  return (
    <div className="flex-1 w-full flex flex-col justify-between py-4 select-none">
      {/* Challenge Instruction */}
      <div className="text-center px-4 mb-2">
        <h2 className={`text-2xl sm:text-3xl font-black font-display tracking-tight mb-1 uppercase ${
          isLight ? 'text-slate-900' : 'text-white'
        }`}>
          {instruction}
        </h2>
        <p className={`text-xs font-semibold tracking-wide ${
          isLight ? 'text-rose-600' : 'text-rose-400'
        }`}>
          Don't over-tap! Exactly {targetCount} taps needed.
        </p>
      </div>

      {/* Big Tactile Tap Trigger Button */}
      <div className="w-full flex flex-col items-center justify-center my-auto px-4">
        <button
          type="button"
          onClick={handleTap}
          className="w-48 h-48 rounded-full bg-gradient-to-tr from-rose-600 to-rose-500 text-white flex flex-col items-center justify-center shadow-xl shadow-rose-600/30 active:scale-90 transition-transform cursor-pointer border-4 border-white/20"
          aria-label="Tap target"
        >
          <MousePointerClick className="w-10 h-10 mb-1 animate-pulse" />
          <span className="text-4xl font-black font-display font-mono-numbers">
            {currentTaps} / {targetCount}
          </span>
          <span className="text-[11px] font-bold tracking-widest uppercase mt-1 opacity-80">
            TAP HERE
          </span>
        </button>
      </div>

      <div className="text-center text-xs text-slate-500 font-medium">
        Count your taps precisely
      </div>
    </div>
  );
};
